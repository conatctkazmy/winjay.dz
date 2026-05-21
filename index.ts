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
    const values = Object.values(anyObj).filter((v) =>
      typeof v === "string"
    ) as string[];
    return values[0] || "";
  } catch {
    return "";
  }
}

function safeName(name: string) {
  return String(name || "video.mp4").replace(/[^a-zA-Z0-9._-]/g, "_");
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

  const listingId = Number(body?.listingId) || 0;
  const filename = safeName(String(body?.filename || "video.mp4"));
  const contentType = String(body?.contentType || "video/mp4").toLowerCase();

  if (!listingId) return json(400, { error: "Missing listingId" });
  if (!contentType.startsWith("video/")) {
    return json(400, { error: "Invalid content type" });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader, apikey: anonKey } },
    auth: { persistSession: false },
  });

  const { data: requesterData, error: requesterErr } = await userClient.auth
    .getUser();
  if (requesterErr || !requesterData?.user?.id) {
    return json(401, { error: "Invalid auth" });
  }
  const userId = requesterData.user.id;

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: profileRow } = await adminClient
    .from("profiles")
    .select("id, is_vip")
    .eq("id", userId)
    .maybeSingle();

  if (!profileRow?.is_vip) return json(403, { error: "VIP required" });

  const { data: listingRow } = await adminClient
    .from("listings")
    .select("id, owner_id")
    .eq("id", listingId)
    .maybeSingle();

  if (!listingRow?.id) return json(404, { error: "Listing not found" });
  if (String(listingRow.owner_id || "") !== String(userId)) {
    return json(403, { error: "Not owner" });
  }

  const objectPath = `${userId}/${listingId}/${Date.now()}_${filename}`;
  const { data, error } = await adminClient.storage
    .from("listing-videos")
    .createSignedUploadUrl(objectPath);

  if (error || !data?.signedUrl) {
    return json(500, { error: "Failed to create signed upload url" });
  }

  const { data: publicData } = adminClient.storage
    .from("listing-videos")
    .getPublicUrl(objectPath);

  return json(200, {
    path: objectPath,
    signedUrl: data.signedUrl,
    token: data.token,
    publicUrl: publicData?.publicUrl || "",
  });
});

