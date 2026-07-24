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

function formatDzd(value: unknown) {
  return `${new Intl.NumberFormat("fr-DZ").format(Number(value) || 0)} DZD`;
}

function escapeHtml(value: unknown) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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

  const orderId = String(body?.orderId || "").trim();
  if (!orderId) return json(400, { error: "Missing orderId" });

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader, apikey: anonKey } },
    auth: { persistSession: false },
  });

  const { data: requesterData, error: requesterErr } = await userClient.auth
    .getUser();
  if (requesterErr || !requesterData?.user?.id) {
    return json(401, { error: "Invalid auth" });
  }
  const requesterId = requesterData.user.id;

  let isAdmin = false;
  try {
    const { data } = await userClient.rpc("is_admin");
    isAdmin = data === true;
  } catch {
    isAdmin = false;
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: orderRow, error: orderError } = await adminClient
    .from("wholesale_orders")
    .select("id, customer_user_id, email, full_name, company_name, total_amount, created_at, receipt_email_status")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !orderRow?.id) {
    return json(404, { error: "Order not found" });
  }

  if (!isAdmin && String(orderRow.customer_user_id || "") !== requesterId) {
    return json(403, { error: "Not authorized" });
  }

  const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";
  const fromEmail =
    Deno.env.get("WHOLESALE_RECEIPT_FROM_EMAIL") ??
    Deno.env.get("RECEIPT_FROM_EMAIL") ??
    "";
  const replyTo = Deno.env.get("WHOLESALE_RECEIPT_REPLY_TO") ?? "";

  if (!resendKey || !fromEmail) {
    await adminClient
      .from("wholesale_orders")
      .update({ receipt_email_status: "failed" })
      .eq("id", orderId);
    return json(500, {
      error: "Missing receipt email configuration",
    });
  }

  const storeName = String(body?.storeName || "Wholesale store").trim();
  const customerName = String(orderRow.full_name || body?.fullName || "Customer");
  const companyName = String(orderRow.company_name || body?.companyName || "").trim();
  const email = String(orderRow.email || body?.email || "").trim();
  const totalAmount = Number(orderRow.total_amount ?? body?.totalAmount) || 0;
  const items = Array.isArray(body?.items) ? body.items : [];
  const rowsHtml = items
    .map((item: any) => {
      const title = escapeHtml(item?.title || "Product");
      const variant = escapeHtml(item?.variantLabel || "");
      const quantity = Number(item?.quantity) || 0;
      const lineTotal = formatDzd(item?.lineTotal);
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f0ebe7;">${title}${variant ? `<div style="color:#7b7b7b;font-size:12px;margin-top:4px;">${variant}</div>` : ""}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0ebe7;text-align:center;">${quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0ebe7;text-align:right;">${lineTotal}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;background:#f8f8f8;padding:24px;color:#141414;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #f0ebe7;border-radius:24px;overflow:hidden;">
        <div style="padding:28px;background:linear-gradient(135deg,#ff6a00,#ff9a3d);color:#fff;">
          <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.9;">Wholesale receipt</div>
          <h1 style="margin:10px 0 6px;font-size:28px;line-height:1.15;">Your order request was received</h1>
          <p style="margin:0;opacity:0.92;">${escapeHtml(storeName)} • ${escapeHtml(customerName)}</p>
        </div>
        <div style="padding:28px;">
          <p style="margin:0 0 14px;line-height:1.6;">Thank you for your wholesale order request${companyName ? ` from <strong>${escapeHtml(companyName)}</strong>` : ""}. We saved your order and forwarded it to the seller.</p>
          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:0 0 18px;">
            <div style="padding:14px;border-radius:16px;background:#faf7f4;">
              <div style="font-size:12px;color:#7b7b7b;text-transform:uppercase;letter-spacing:0.08em;">Order</div>
              <strong style="display:block;margin-top:6px;">${escapeHtml(orderId)}</strong>
            </div>
            <div style="padding:14px;border-radius:16px;background:#faf7f4;">
              <div style="font-size:12px;color:#7b7b7b;text-transform:uppercase;letter-spacing:0.08em;">Total</div>
              <strong style="display:block;margin-top:6px;">${formatDzd(totalAmount)}</strong>
            </div>
          </div>
          <table style="width:100%;border-collapse:collapse;border:1px solid #f0ebe7;border-radius:18px;overflow:hidden;">
            <thead>
              <tr style="background:#fff7f1;">
                <th style="padding:12px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#7b7b7b;">Item</th>
                <th style="padding:12px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#7b7b7b;">Qty</th>
                <th style="padding:12px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#7b7b7b;">Line total</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const resendPayload: Record<string, unknown> = {
    from: fromEmail,
    to: [email],
    subject: `Wholesale order receipt • ${storeName}`,
    html,
  };
  if (replyTo) resendPayload["reply_to"] = replyTo;

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(resendPayload),
  });

  const resendText = await resendRes.text();
  let resendJson: any = null;
  try {
    resendJson = resendText ? JSON.parse(resendText) : null;
  } catch {
    resendJson = null;
  }

  if (!resendRes.ok) {
    await adminClient
      .from("wholesale_orders")
      .update({ receipt_email_status: "failed" })
      .eq("id", orderId);
    return json(500, {
      error: resendJson?.message || resendText || "Failed to send receipt email",
    });
  }

  await adminClient
    .from("wholesale_orders")
    .update({
      receipt_email_status: "sent",
      receipt_sent_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  return json(200, {
    ok: true,
    emailId: resendJson?.id || "",
  });
});
