import { json, stripeForm, stripeGet } from "../_lib/stripe.js";
import { quoteShipping } from "../_lib/shipping.js";

const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]+$/;

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.STRIPE_SECRET_KEY) {
    return json({ type: "error", message: "Checkout is not connected yet." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ type: "error", message: "Enter a US shipping address." }, 400);
  }

  const sessionId = body.checkout_session_id;
  const details = body.shipping_details;
  if (!SESSION_ID.test(sessionId || "") || !details?.address) {
    return json({ type: "error", message: "Enter a US shipping address." }, 400);
  }

  const existing = await stripeGet(env, "/checkout/sessions/" + sessionId);
  if (!existing.ok || existing.data.metadata?.product !== "restoria" || existing.data.status !== "open") {
    return json({ type: "error", message: "This checkout is no longer available." });
  }

  const stored =
    existing.data.collected_information?.shipping_details ||
    existing.data.shipping_details ||
    null;
  // The form already saved the address. Price that ZIP when Stripe has it.
  const address = stored?.address?.postal_code ? stored.address : details.address;
  if (address.country && address.country !== "US") {
    return json({ type: "error", message: "We only ship within the United States." });
  }

  const quote = quoteShipping(address.postal_code);
  if (quote.error) {
    return json({ type: "error", message: quote.error });
  }
  // Form checkout owns the address. Writing it back is rejected, which left
  // the placeholder rate in place.
  const updated = await stripeForm(env, "/checkout/sessions/" + sessionId, {
    "shipping_options[0][shipping_rate_data][display_name]": "USPS Ground Advantage",
    "shipping_options[0][shipping_rate_data][type]": "fixed_amount",
    "shipping_options[0][shipping_rate_data][fixed_amount][amount]": String(quote.amount),
    "shipping_options[0][shipping_rate_data][fixed_amount][currency]": "usd",
    "shipping_options[0][shipping_rate_data][delivery_estimate][minimum][unit]": "business_day",
    "shipping_options[0][shipping_rate_data][delivery_estimate][minimum][value]": "2",
    "shipping_options[0][shipping_rate_data][delivery_estimate][maximum][unit]": "business_day",
    "shipping_options[0][shipping_rate_data][delivery_estimate][maximum][value]": "5",
  });

  if (!updated.ok) {
    const message = updated.data.error?.message || "Could not add shipping for that address.";
    return json({ type: "error", message });
  }

  return json({ type: "object", value: { succeeded: true } });
}
