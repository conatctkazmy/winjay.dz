import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers":
    "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}

function pickKeyFromJson(raw: string) {
  try {
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object") return "";
    const anyObj = obj as Record<string, unknown>;
    const directDefault = anyObj["default"];
    if (typeof directDefault === "string" && directDefault) return directDefault;
    const values = Object.values(anyObj).filter((v) => typeof v === "string") as string[];
    return values[0] || "";
  } catch {
    return "";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const publishableKeysJson = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "";
  const secretKeysJson = Deno.env.get("SUPABASE_SECRET_KEYS") ?? "";

  const anonKey =
    (Deno.env.get("SUPABASE_ANON_KEY") ?? "") ||
    pickKeyFromJson(publishableKeysJson);

  const serviceRoleKey =
    (Deno.env.get("SERVICE_ROLE_KEY") ?? "") ||
    (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "") ||
    pickKeyFromJson(secretKeysJson);

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json(500, { error: "Missing Supabase env" });
  }

  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return json(401, { error: "Missing auth" });
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }
  const search = String(body?.search || "").trim().toLowerCase();

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader, apikey: anonKey } },
    auth: { persistSession: false },
  });

  const { data: requesterData, error: requesterErr } = await userClient.auth
    .getUser();
  if (requesterErr || !requesterData?.user?.id) {
    return json(401, { error: "Invalid auth" });
  }

  let isAdmin = false;
  try {
    const { data } = await userClient.rpc("is_admin");
    isAdmin = data === true;
  } catch {
    isAdmin = false;
  }
  if (!isAdmin) return json(403, { error: "Not authorized" });

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: profilesData } = await adminClient
    .from("profiles")
    .select("id, display_name, tag, phone, is_vip, verified, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const profiles = Array.isArray(profilesData) ? profilesData : [];
  const { data: usersData } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  const emailsById: Record<string, string> = {};
  const users = Array.isArray(usersData?.users) ? usersData.users : [];
  for (const u of users) {
    const id = String((u as any)?.id || "").trim();
    if (!id) continue;
    const email = String((u as any)?.email || "").trim();
    if (email) emailsById[id] = email;
  }

  const out = profiles
    .map((p: any) => ({
      id: p.id,
      display_name: p.display_name || "User",
      tag: p.tag || "",
      email: emailsById[String(p.id)] || "",
      phone: p.phone || "",
      is_vip: !!p.is_vip,
      verified: !!p.verified,
      created_at: p.created_at,
    }))
    .filter((p: any) => {
      if (!search) return true;
      const hay = [
        p.display_name,
        p.tag,
        p.email,
        p.phone,
      ].map((x: any) => String(x || "").toLowerCase());
      return hay.some((x: string) => x.includes(search));
    })
    .slice(0, 120);

  return json(200, { users: out });
});
