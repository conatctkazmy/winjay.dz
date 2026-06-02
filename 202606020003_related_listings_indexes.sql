create index if not exists listings_status_subcategory_wilaya_created_id_idx
on public.listings (status, subcategory, wilaya, created_at desc, id desc);

create index if not exists listings_status_category_wilaya_created_id_idx
on public.listings (status, category, wilaya, created_at desc, id desc);
