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

function isoDateUtc(d: Date) {
  return d.toISOString().slice(0, 10);
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
  const daysRaw = Number(body?.days);
  const days = Math.max(1, Math.min(180, Number.isFinite(daysRaw) ? daysRaw : 30));

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader, apikey: anonKey } },
    auth: { persistSession: false },
  });

  const { data: requesterData, error: requesterErr } = await userClient.auth.getUser();
  if (requesterErr || !requesterData?.user?.id) {
    return json(401, { error: "Invalid auth" });
  }

  const requesterEmail = String(requesterData.user.email || "").toLowerCase();
  let isAdmin = false;
  try {
    const { data } = await userClient.rpc("is_admin");
    isAdmin = data === true;
  } catch {
    isAdmin = false;
  }
  const emailOk = requesterEmail === "contactkazmy@gmail.com";
  if (!isAdmin && !emailOk) return json(403, { error: "Not authorized" });

  const authDb = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
    db: { schema: "auth" },
  });

  const totalRes = await authDb.from("users").select("id", { count: "exact", head: true });
  const total = Number(totalRes.count) || 0;

  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const baselineRes = await authDb
    .from("users")
    .select("id", { count: "exact", head: true })
    .lt("created_at", start.toISOString());
  const baseline = Number(baselineRes.count) || 0;

  const seriesMap: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    seriesMap[isoDateUtc(d)] = 0;
  }

  const { data: createdRows, error: createdErr } = await authDb
    .from("users")
    .select("created_at")
    .gte("created_at", start.toISOString())
    .limit(100000);

  if (createdErr) return json(500, { error: createdErr.message || "Query failed" });

  for (const row of Array.isArray(createdRows) ? createdRows : []) {
    const ts = String((row as any)?.created_at || "");
    if (!ts) continue;
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) continue;
    const key = isoDateUtc(d);
    if (key in seriesMap) seriesMap[key] = (seriesMap[key] || 0) + 1;
  }

  const series = Object.keys(seriesMap)
    .sort()
    .map((date) => ({ date, count: seriesMap[date] || 0 }));

  let running = baseline;
  const seriesWithTotals = series.map((p) => {
    running += Number(p.count) || 0;
    return { ...p, total: running };
  });

  return json(200, { total, days, baseline, series: seriesWithTotals });
});
