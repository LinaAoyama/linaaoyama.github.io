import { json } from "../_lib/stripe.js";

export function onRequestGet(context) {
  const key = context.env.STRIPE_PUBLISHABLE_KEY || "";
  return json({
    forSale: true,
    publishableKey: key,
    checkoutReady: Boolean(key && context.env.STRIPE_SECRET_KEY),
  });
}
