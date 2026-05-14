import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const encoder = new TextEncoder();

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function hex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

async function verifyStripeSignature(payload: string, signatureHeader: string, secret: string) {
  const parts = signatureHeader.split(",").reduce<Record<string, string[]>>((accumulator, part) => {
    const [key, value] = part.split("=");
    if (!key || !value) return accumulator;
    accumulator[key] = [...(accumulator[key] || []), value];
    return accumulator;
  }, {});
  const timestamp = parts.t?.[0];
  const signatures = parts.v1 || [];
  if (!timestamp || !signatures.length) return false;

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) return false;
  if (Math.abs(Date.now() / 1000 - timestampSeconds) > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`));
  const expected = hex(digest);
  return signatures.some((signature) => timingSafeEqual(signature, expected));
}

function unixToIso(value: unknown) {
  if (typeof value !== "number") return null;
  return new Date(value * 1000).toISOString();
}

function activePlanForStatus(status: string) {
  return ["active", "trialing"].includes(status) ? "paid" : "free";
}

serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!webhookSecret || !supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Webhook is not configured." }, 500);
  }

  const payload = await req.text();
  const signature = req.headers.get("Stripe-Signature") || "";
  const isVerified = await verifyStripeSignature(payload, signature, webhookSecret);
  if (!isVerified) {
    return jsonResponse({ error: "Invalid Stripe signature." }, 400);
  }

  const event = JSON.parse(payload);
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.user_id || session.client_reference_id;

    if (userId) {
      const { error } = await supabase.from("account_entitlements").upsert(
        {
          user_id: userId,
          plan: "paid",
          status: "active",
          stripe_customer_id:
            typeof session.customer === "string" ? session.customer : session.customer?.id,
          stripe_subscription_id:
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id ?? null,
        },
        { onConflict: "user_id" },
      );

      if (error) return jsonResponse({ error: error.message }, 500);
    }
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object;
    const userId = subscription.metadata?.user_id;
    const status = subscription.status || "inactive";
    const entitlement = {
      plan: activePlanForStatus(status),
      status,
      stripe_customer_id:
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id ?? null,
      stripe_subscription_id: subscription.id,
      current_period_end: unixToIso(subscription.current_period_end),
    };

    const { error } = userId
      ? await supabase
          .from("account_entitlements")
          .upsert({ user_id: userId, ...entitlement }, { onConflict: "user_id" })
      : await supabase
          .from("account_entitlements")
          .update(entitlement)
          .eq("stripe_subscription_id", subscription.id);

    if (error) return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({ received: true });
});
