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

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object;
    if (session.mode !== "payment" || session.payment_status !== "paid") {
      return jsonResponse({ received: true });
    }

    const userId = session.metadata?.user_id || session.client_reference_id;

    if (userId) {
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;
      const purchasedAt =
        typeof session.created === "number"
          ? new Date(session.created * 1000).toISOString()
          : new Date().toISOString();

      const { error } = await supabase.rpc("activate_paid_access", {
        p_user_id: userId,
        p_stripe_customer_id: customerId,
        p_stripe_checkout_session_id: session.id,
        p_stripe_payment_intent_id: paymentIntentId,
        p_purchased_at: purchasedAt,
      });

      if (error) {
        const { error: fallbackError } = await supabase.from("account_entitlements").upsert(
          {
            user_id: userId,
            plan: "paid",
            status: "active",
            stripe_customer_id: customerId,
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: paymentIntentId,
            purchased_at: purchasedAt,
            current_period_end: new Date(
              new Date(purchasedAt).getTime() + 180 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          },
          { onConflict: "user_id" },
        );

        if (fallbackError) return jsonResponse({ error: fallbackError.message }, 500);
      }
    }
  }

  return jsonResponse({ received: true });
});
