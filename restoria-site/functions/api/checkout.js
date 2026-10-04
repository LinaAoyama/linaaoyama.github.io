import { json, stripeForm } from "../_lib/stripe.js";
import { GAME_PRICE_CENTS, MAX_SHIPPING_CENTS } from "../_lib/shipping.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: "Checkout is not connected yet." }, 503);
  }

  const origin = new URL(request.url).origin;
  const created = await stripeForm(env, "/checkout/sessions", {
    ui_mode: "form",
    mode: "payment",
    "billing_address_collection": "auto",
    "shipping_address_collection[allowed_countries][0]": "US",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(GAME_PRICE_CENTS),
    "line_items[0][price_data][product_data][name]": "Restoria",
    "line_items[0][price_data][product_data][description]":
      "Strategy card game of California grassland ecology. Shipped from Healdsburg, CA.",
    "shipping_options[0][shipping_rate_data][display_name]": "USPS Ground Advantage",
    "shipping_options[0][shipping_rate_data][type]": "fixed_amount",
    "shipping_options[0][shipping_rate_data][fixed_amount][amount]": String(MAX_SHIPPING_CENTS),
    "shipping_options[0][shipping_rate_data][fixed_amount][currency]": "usd",
    "metadata[product]": "restoria",
    return_url: origin + "/thanks.html?session_id={CHECKOUT_SESSION_ID}",
  });

  if (!created.ok) {
    const message = created.data.error?.message || "Could not start checkout.";
    return json({ error: message }, 502);
  }

  return json({ clientSecret: created.data.client_secret });
}
