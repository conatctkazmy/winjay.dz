create extension if not exists pgcrypto;

create or replace function public.is_verified_business()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and coalesce(p.verified, false) = true
  );
$$;

grant execute on function public.is_verified_business() to anon, authenticated;

create table if not exists public.wholesale_stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  tagline text,
  description text,
  hero_image_url text,
  accent_color text not null default '#ff6a00',
  minimum_order_amount numeric(12, 2) not null default 0,
  shipping_note text,
  payment_note text,
  status text not null default 'active' check (status in ('active', 'archived')),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

create table if not exists public.wholesale_products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.wholesale_stores(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category text,
  material text,
  brand text,
  cover_image_url text,
  minimum_order_quantity integer not null default 1 check (minimum_order_quantity > 0),
  status text not null default 'active' check (status in ('active', 'archived')),
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wholesale_product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.wholesale_products(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  sku text,
  color text,
  size text,
  price numeric(12, 2) not null default 0,
  stock_qty integer not null default 0 check (stock_qty >= 0),
  minimum_qty integer not null default 1 check (minimum_qty > 0),
  image_url text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wholesale_orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.wholesale_stores(id) on delete restrict,
  seller_user_id uuid not null references public.profiles(id) on delete restrict,
  customer_user_id uuid not null references public.profiles(id) on delete restrict,
  company_name text,
  full_name text not null,
  email text not null,
  phone text not null,
  wilaya text,
  city text,
  address text,
  payment_method text,
  delivery_method text,
  notes text,
  subtotal numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null default 0,
  currency text not null default 'DZD',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'completed', 'cancelled')),
  receipt_email_status text not null default 'pending' check (receipt_email_status in ('pending', 'sent', 'failed')),
  receipt_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.wholesale_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.wholesale_orders(id) on delete cascade,
  product_id uuid not null references public.wholesale_products(id) on delete restrict,
  variant_id uuid not null references public.wholesale_product_variants(id) on delete restrict,
  title text not null,
  variant_label text,
  color text,
  size text,
  unit_price numeric(12, 2) not null default 0,
  quantity integer not null default 1 check (quantity > 0),
  line_total numeric(12, 2) not null default 0,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists wholesale_stores_status_idx on public.wholesale_stores (status, is_published, created_at desc);
create index if not exists wholesale_stores_slug_idx on public.wholesale_stores (slug);
create index if not exists wholesale_products_store_idx on public.wholesale_products (store_id, status, is_published, created_at desc);
create index if not exists wholesale_products_owner_idx on public.wholesale_products (owner_id, created_at desc);
create index if not exists wholesale_variants_product_idx on public.wholesale_product_variants (product_id, status);
create index if not exists wholesale_orders_store_idx on public.wholesale_orders (store_id, created_at desc);
create index if not exists wholesale_orders_customer_idx on public.wholesale_orders (customer_user_id, created_at desc);
create index if not exists wholesale_order_items_order_idx on public.wholesale_order_items (order_id);

alter table public.wholesale_stores enable row level security;
alter table public.wholesale_products enable row level security;
alter table public.wholesale_product_variants enable row level security;
alter table public.wholesale_orders enable row level security;
alter table public.wholesale_order_items enable row level security;

grant select on public.wholesale_stores to anon, authenticated;
grant select on public.wholesale_products to anon, authenticated;
grant select on public.wholesale_product_variants to anon, authenticated;
grant select, insert on public.wholesale_orders to authenticated;
grant select, insert on public.wholesale_order_items to authenticated;
grant insert, update, delete on public.wholesale_stores to authenticated;
grant insert, update, delete on public.wholesale_products to authenticated;
grant insert, update, delete on public.wholesale_product_variants to authenticated;
grant update on public.wholesale_orders to authenticated;

drop policy if exists wholesale_stores_public_select on public.wholesale_stores;
create policy wholesale_stores_public_select
on public.wholesale_stores
for select
to anon, authenticated
using (
  (is_published = true and status = 'active')
  or owner_id = auth.uid()
  or public.is_admin()
);

drop policy if exists wholesale_stores_owner_insert on public.wholesale_stores;
create policy wholesale_stores_owner_insert
on public.wholesale_stores
for insert
to authenticated
with check (
  (
    owner_id = auth.uid()
    and public.is_verified_business()
  )
  or public.is_admin()
);

drop policy if exists wholesale_stores_owner_update on public.wholesale_stores;
create policy wholesale_stores_owner_update
on public.wholesale_stores
for update
to authenticated
using (
  owner_id = auth.uid()
  or public.is_admin()
)
with check (
  owner_id = auth.uid()
  or public.is_admin()
);

drop policy if exists wholesale_stores_owner_delete on public.wholesale_stores;
create policy wholesale_stores_owner_delete
on public.wholesale_stores
for delete
to authenticated
using (
  owner_id = auth.uid()
  or public.is_admin()
);

drop policy if exists wholesale_products_public_select on public.wholesale_products;
create policy wholesale_products_public_select
on public.wholesale_products
for select
to anon, authenticated
using (
  (
    is_published = true
    and status = 'active'
    and exists (
      select 1
      from public.wholesale_stores s
      where s.id = store_id
        and s.status = 'active'
        and s.is_published = true
    )
  )
  or owner_id = auth.uid()
  or public.is_admin()
);

drop policy if exists wholesale_products_owner_insert on public.wholesale_products;
create policy wholesale_products_owner_insert
on public.wholesale_products
for insert
to authenticated
with check (
  (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.wholesale_stores s
      where s.id = store_id
        and s.owner_id = auth.uid()
    )
    and public.is_verified_business()
  )
  or public.is_admin()
);

drop policy if exists wholesale_products_owner_update on public.wholesale_products;
create policy wholesale_products_owner_update
on public.wholesale_products
for update
to authenticated
using (
  owner_id = auth.uid()
  or public.is_admin()
)
with check (
  owner_id = auth.uid()
  or public.is_admin()
);

drop policy if exists wholesale_products_owner_delete on public.wholesale_products;
create policy wholesale_products_owner_delete
on public.wholesale_products
for delete
to authenticated
using (
  owner_id = auth.uid()
  or public.is_admin()
);

drop policy if exists wholesale_variants_public_select on public.wholesale_product_variants;
create policy wholesale_variants_public_select
on public.wholesale_product_variants
for select
to anon, authenticated
using (
  (
    status = 'active'
    and exists (
      select 1
      from public.wholesale_products p
      join public.wholesale_stores s on s.id = p.store_id
      where p.id = product_id
        and p.status = 'active'
        and p.is_published = true
        and s.status = 'active'
        and s.is_published = true
    )
  )
  or owner_id = auth.uid()
  or public.is_admin()
);

drop policy if exists wholesale_variants_owner_insert on public.wholesale_product_variants;
create policy wholesale_variants_owner_insert
on public.wholesale_product_variants
for insert
to authenticated
with check (
  (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.wholesale_products p
      where p.id = product_id
        and p.owner_id = auth.uid()
    )
    and public.is_verified_business()
  )
  or public.is_admin()
);

drop policy if exists wholesale_variants_owner_update on public.wholesale_product_variants;
create policy wholesale_variants_owner_update
on public.wholesale_product_variants
for update
to authenticated
using (
  owner_id = auth.uid()
  or public.is_admin()
)
with check (
  owner_id = auth.uid()
  or public.is_admin()
);

drop policy if exists wholesale_variants_owner_delete on public.wholesale_product_variants;
create policy wholesale_variants_owner_delete
on public.wholesale_product_variants
for delete
to authenticated
using (
  owner_id = auth.uid()
  or public.is_admin()
);

drop policy if exists wholesale_orders_customer_insert on public.wholesale_orders;
create policy wholesale_orders_customer_insert
on public.wholesale_orders
for insert
to authenticated
with check (
  customer_user_id = auth.uid()
  or public.is_admin()
);

drop policy if exists wholesale_orders_party_select on public.wholesale_orders;
create policy wholesale_orders_party_select
on public.wholesale_orders
for select
to authenticated
using (
  customer_user_id = auth.uid()
  or seller_user_id = auth.uid()
  or public.is_admin()
);

drop policy if exists wholesale_orders_seller_update on public.wholesale_orders;
create policy wholesale_orders_seller_update
on public.wholesale_orders
for update
to authenticated
using (
  seller_user_id = auth.uid()
  or public.is_admin()
)
with check (
  seller_user_id = auth.uid()
  or public.is_admin()
);

drop policy if exists wholesale_order_items_party_insert on public.wholesale_order_items;
create policy wholesale_order_items_party_insert
on public.wholesale_order_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.wholesale_orders o
    where o.id = order_id
      and (
        o.customer_user_id = auth.uid()
        or o.seller_user_id = auth.uid()
        or public.is_admin()
      )
  )
);

drop policy if exists wholesale_order_items_party_select on public.wholesale_order_items;
create policy wholesale_order_items_party_select
on public.wholesale_order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.wholesale_orders o
    where o.id = order_id
      and (
        o.customer_user_id = auth.uid()
        or o.seller_user_id = auth.uid()
        or public.is_admin()
      )
  )
);

insert into public.feature_flags (key, enabled, updated_at)
values ('wholesale_enabled', false, now())
on conflict (key)
do update set updated_at = excluded.updated_at;
