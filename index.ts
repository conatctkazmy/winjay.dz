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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const publishableKeysJson = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "";
  const secretKeysJson = Deno.env.get("SUPABASE_SECRET_KEYS") ?? "";

  const anonKey =
    (Deno.env.get("SUPABASE_ANON_KEY") ?? "") || pickKeyFromJson(publishableKeysJson);
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

  const lessonId = String(body?.lessonId || "").trim();
  const expiresIn = Math.max(
    60,
    Math.min(60 * 60 * 6, Number(body?.expiresIn) || 60 * 60),
  );

  if (!lessonId) return json(400, { error: "Missing lessonId" });

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

  const { data: lessonRow } = await adminClient
    .from("course_lessons")
    .select("id, course_id, is_preview, courses!inner(id, owner_id, is_published)")
    .eq("id", lessonId)
    .maybeSingle();

  if (!lessonRow?.id) return json(404, { error: "Lesson not found" });

  const courseOwnerId = (lessonRow as any)?.courses?.owner_id || "";
  const isPublished = !!(lessonRow as any)?.courses?.is_published;
  const isOwner = String(courseOwnerId || "") === String(userId);

  const { data: enrollmentRow } = await adminClient
    .from("course_enrollments")
    .select("course_id, user_id")
    .eq("course_id", lessonRow.course_id)
    .eq("user_id", userId)
    .maybeSingle();

  const isEnrolled = !!enrollmentRow?.course_id;

  if (!isOwner && !isEnrolled) {
    if (!(isPublished && (lessonRow as any).is_preview)) {
      return json(403, { error: "No access" });
    }
  }

  const { data: mediaRow } = await adminClient
    .from("course_lesson_media")
    .select("video_bucket, video_object_path")
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (!mediaRow?.video_object_path) {
    return json(404, { error: "Lesson has no video yet" });
  }

  const bucket = String(mediaRow.video_bucket || "course-videos");
  const path = String(mediaRow.video_object_path || "");

  const { data, error } = await adminClient.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    return json(500, { error: "Failed to create signed url" });
  }

  return json(200, {
    bucket,
    path,
    expiresIn,
    signedUrl: data.signedUrl,
  });
});
