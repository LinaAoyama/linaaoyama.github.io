import { json, stripeForm, stripeGet } from "../_lib/stripe.js";
import {
  MAX_COPIES,
  placeholderShipping,
  quoteOrder,
  shippingLabel,
} from "../_lib/shipping.js";

const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]+$/;

function orderQuantity(session, requested) {
  const fromSession = session.line_items?.data?.[0]?.quantity;
  const sessionQty = Number.isInteger(fromSession) ? fromSession : 0;
  const clientQty = Number.isInteger(requested) ? requested : 0;
  const quantity = Math.max(sessionQty, clientQty);
  if (quantity < 1 || quantity > MAX_COPIES) return null;
  return quantity;
}

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
  if (!SESSION_ID.test(sessionId || "")) {
    return json({ type: "error", message: "This checkout is no longer available." }, 400);
  }

  const existing = await stripeGet(
    env,
    "/checkout/sessions/" + sessionId + "?expand[]=line_items"
  );
  if (!existing.ok || existing.data.metadata?.product !== "restoria" || existing.data.status !== "open") {
    return json({ type: "error", message: "This checkout is no longer available." });
  }

  const requested = Number(body.quantity);
  const quantity = orderQuantity(existing.data, Number.isInteger(requested) ? requested : 0);
  if (!quantity) {
    return json({ type: "error", message: "Choose between 1 and 36 copies." });
  }

  const stored =
    existing.data.collected_information?.shipping_details ||
    existing.data.shipping_details ||
    null;
  const address = stored?.address?.postal_code ? stored.address : details?.address;
  let quote;
  if (address?.postal_code) {
    if (address.country && address.country !== "US") {
      return json({ type: "error", message: "We only ship within the United States." });
    }
    quote = quoteOrder(address.postal_code, quantity);
  } else {
    quote = placeholderShipping(quantity);
  }
  if (quote.error) {
    return json({ type: "error", message: quote.error });
  }

  // Form checkout owns the address. Writing it back is rejected, which left
  // the placeholder rate in place.
  const updated = await stripeForm(env, "/checkout/sessions/" + sessionId, {
    "shipping_options[0][shipping_rate_data][display_name]": shippingLabel(),
    "shipping_options[0][shipping_rate_data][type]": "fixed_amount",
    "shipping_options[0][shipping_rate_data][fixed_amount][amount]": String(quote.amount),
    "shipping_options[0][shipping_rate_data][fixed_amount][currency]": "usd",
    "shipping_options[0][shipping_rate_data][delivery_estimate][minimum][unit]": "business_day",
    "shipping_options[0][shipping_rate_data][delivery_estimate][minimum][value]": "2",
    "shipping_options[0][shipping_rate_data][delivery_estimate][maximum][unit]": "business_day",
    "shipping_options[0][shipping_rate_data][delivery_estimate][maximum][value]": "5",
    "metadata[copies]": String(quantity),
    "metadata[boxes]": String(quote.boxes),
  });

  if (!updated.ok) {
    const message = updated.data.error?.message || "Could not add shipping for that address.";
    return json({ type: "error", message });
  }

  return json({ type: "object", value: { succeeded: true } });
}
