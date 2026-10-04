import { json, stripeGet } from "../_lib/stripe.js";

const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]+$/;

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: "Checkout is not connected yet." }, 503);
  }

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!SESSION_ID.test(sessionId || "")) {
    return json({ error: "Unknown order." }, 400);
  }

  const existing = await stripeGet(env, "/checkout/sessions/" + sessionId);
  if (!existing.ok || existing.data.metadata?.product !== "restoria") {
    return json({ error: "Unknown order." }, 404);
  }

  return json({
    status: existing.data.status,
    payment_status: existing.data.payment_status,
    amount_total: existing.data.amount_total,
    amount_shipping: existing.data.total_details?.amount_shipping ?? null,
  });
}
