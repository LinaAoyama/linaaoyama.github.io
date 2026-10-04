// USPS zone chart for origin ZIP 954, effective October 1, 2026.
// Commercial Ground Advantage, 2 lb, from Notice 123 effective October 4, 2026.
// The packed game weighs 1.04 lb. USPS rounds any fraction of a pound up to 2 lb.
// Generated from zones.txt. Do not edit the zone string by hand.

const ZONES = "0000088888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888880888888888888888888888888888888888888888888888888888888808888888888888888888888888888888888888888888888888888888888888888888888888080880888808888888888888888888888888888888888888888888888888888888888888888808888888800888888888888888888888888888888888888888888888888888888888888888888888877777777777777777000777777777088808707777888777777770777777777777777007776666600777666666055665555558888888888787877788870878877887707777887770077777777777777707770777776667766666677066766666666000000880888888077887077777778777777770776666677077777777777777777777777777770777777777777777777666666766666555566666555555000656555555555545544505555555400555505550550054500005505555655666666000444044303404444444440444444444444544444404444343333222222222232331222222322222889444443344444554440545554477876";

export const GAME_PRICE_CENTS = 2499;
// Covers the holiday bump and the card fee on postage. Kept off the USPS
// table so a yearly rate update does not bake it in twice.
const HANDLING_CENTS = 75;

// Index is the USPS zone. Amounts are cents, before handling.
const RATE_CENTS = [0, 839, 848, 866, 891, 1050, 1213, 1255, 1342, 1342];

// Shown until the buyer enters an address. Highest zone plus handling,
// so a payment that races the address update cannot ship for less than we pay.
export const MAX_SHIPPING_CENTS = RATE_CENTS[8] + HANDLING_CENTS;

export function quoteShipping(postalCode) {
  const digits = String(postalCode || "").replace(/\D/g, "");
  if (digits.length < 5) {
    return { error: "Enter a 5-digit US ZIP code." };
  }

  const zip5 = digits.slice(0, 5);
  const zip3 = Number(zip5.slice(0, 3));

  // APO, FPO, and DPO. The published chart's zone for these prefixes does not
  // match a 2 lb Ground Advantage parcel, so we do not quote them.
  if ((zip3 >= 90 && zip3 <= 99) || (zip3 >= 962 && zip3 <= 966)) {
    return {
      error: "We ship to US street addresses. Email us if you need an APO, FPO, or DPO delivery.",
    };
  }

  let zone = Number(ZONES[zip3] || 0);
  if (zip3 === 969) {
    const n = Number(zip5);
    const localOverride =
      (n >= 96900 && n <= 96938) ||
      (n >= 96945 && n <= 96959) ||
      (n >= 96961 && n <= 96969) ||
      (n >= 96971 && n <= 96999);
    zone = localOverride ? 8 : 9;
  }

  const postage = RATE_CENTS[zone];
  if (!postage) {
    return { error: "We can't ship to that ZIP code." };
  }

  return { zip: zip5, zone, amount: postage + HANDLING_CENTS };
}

export function formatDollars(cents) {
  return "$" + (cents / 100).toFixed(2);
}
