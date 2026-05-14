import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function siteFallbackUrl(path: string) {
  const siteUrl = Deno.env.get("SITE_URL")?.replace(/\/$/, "");
  return siteUrl ? `${siteUrl}/${path}` : path;
}

function isSafeRedirect(value: string) {
  const siteUrl = Deno.env.get("SITE_URL");
  if (!siteUrl) return true;

  try {
    const requested = new URL(value);
    const allowed = new URL(siteUrl);
    return requested.origin === allowed.origin && requested.pathname.startsWith(allowed.pathname);
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const stripePriceId = Deno.env.get("STRIPE_PRICE_ID");
  const checkoutMode = Deno.env.get("STRIPE_CHECKOUT_MODE") || "subscription";

  if (!supabaseUrl || !supabaseAnonKey || !stripeSecretKey || !stripePriceId) {
    return jsonResponse({ error: "Checkout is not configured." }, 500);
  }

  const authHeader = req.headers.get("Authorization") || "";
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ error: "Sign in before upgrading." }, 401);
  }

  let body: { successUrl?: string; cancelUrl?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const requestedSuccessUrl = body.successUrl || siteFallbackUrl("?checkout=success");
  const requestedCancelUrl = body.cancelUrl || siteFallbackUrl("?checkout=cancelled");
  const successUrl = isSafeRedirect(requestedSuccessUrl)
    ? requestedSuccessUrl
    : siteFallbackUrl("?checkout=success");
  const cancelUrl = isSafeRedirect(requestedCancelUrl)
    ? requestedCancelUrl
    : siteFallbackUrl("?checkout=cancelled");

  const params = new URLSearchParams({
    mode: checkoutMode,
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: user.id,
    "line_items[0][price]": stripePriceId,
    "line_items[0][quantity]": "1",
    "metadata[user_id]": user.id,
  });

  if (user.email) params.set("customer_email", user.email);
  if (checkoutMode === "subscription") {
    params.set("subscription_data[metadata][user_id]", user.id);
  }

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const checkoutSession = await stripeResponse.json();
  if (!stripeResponse.ok) {
    return jsonResponse(
      { error: checkoutSession?.error?.message || "Unable to create checkout session." },
      502,
    );
  }

  return jsonResponse({ url: checkoutSession.url });
});
