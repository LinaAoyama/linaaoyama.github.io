import { json } from "../_lib/stripe.js";
import { formatDollars, quoteShipping } from "../_lib/shipping.js";

export function onRequestGet(context) {
  const zip = new URL(context.request.url).searchParams.get("zip");
  const quote = quoteShipping(zip);
  if (quote.error) {
    return json({ error: quote.error }, 400);
  }
  return json({
    zip: quote.zip,
    zone: quote.zone,
    amount: quote.amount,
    display: formatDollars(quote.amount),
    service: "USPS Ground Advantage",
  });
}
