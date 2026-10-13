// USPS zone chart for origin ZIP 954, effective October 1, 2026.
// Commercial Ground Advantage, from Notice 123 effective October 4, 2026.
// The packed game is 4.01 × 5.98 × 2.72 in and weighs 1.04 lb.
// A full carton is 12 copies (about 12 inches on the longest side, billed as 13 lb).
// Generated from zones.txt. Do not edit the zone string by hand.

const ZONES = "0000088888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888880888888888888888888888888888888888888888888888888888888808888888888888888888888888888888888888888888888888888888888888888888888888080880888808888888888888888888888888888888888888888888888888888888888888888808888888800888888888888888888888888888888888888888888888888888888888888888888888877777777777777777000777777777088808707777888777777770777777777777777007776666600777666666055665555558888888888787877788870878877887707777887770077777777777777707770777776667766666677066766666666000000880888888077887077777778777777770776666677077777777777777777777777777770777777777777777777666666766666555566666555555000656555555555545544505555555400555505550550054500005505555655666666000444044303404444444440444444444444544444404444343333222222222232331222222322222889444443344444554440545554477876";

export const GAME_PRICE_CENTS = 2499;
export const MAX_COPIES = 36;
export const BOX_COPIES = 12;

// Covers the holiday bump and the card fee on postage for a single game.
// Kept off the USPS table so a yearly rate update does not bake it in twice.
const HANDLING_CENTS = 75;

// Midnight Central on October 4, 2026 through 2 a.m. Central on January 17, 2027.
const HOLIDAY_START = Date.parse("2026-10-04T05:00:00Z");
const HOLIDAY_END = Date.parse("2027-01-17T08:00:00Z");

// Index is the USPS zone. Amounts are cents, before the cushion.
// Pound 2 matches the previous single-copy table.
const RATE_BY_POUND = {
  2: [0, 839, 848, 866, 891, 1050, 1213, 1255, 1342, 1342],
  3: [0, 904, 906, 954, 1007, 1212, 1414, 1491, 1630, 1630],
  4: [0, 993, 999, 1035, 1130, 1389, 1621, 1724, 1906, 1906],
  5: [0, 1035, 1041, 1079, 1167, 1453, 1694, 1817, 2024, 2024],
  6: [0, 1052, 1059, 1101, 1220, 1533, 1794, 1936, 2173, 2173],
  7: [0, 1061, 1067, 1127, 1255, 1595, 1870, 2028, 2288, 2288],
  8: [0, 1075, 1092, 1214, 1308, 1654, 1939, 2113, 2395, 2395],
  9: [0, 1166, 1190, 1304, 1430, 1716, 2018, 2206, 2514, 2514],
  10: [0, 1256, 1291, 1383, 1509, 1781, 2099, 2302, 2639, 2639],
  11: [0, 1380, 1399, 1505, 1623, 1987, 2303, 2543, 2912, 2912],
  12: [0, 1454, 1490, 1568, 1694, 2061, 2395, 2653, 3048, 3048],
  13: [0, 1520, 1553, 1630, 1758, 2137, 2491, 2762, 3186, 3186],
};

// Shown until the buyer enters an address, for one copy. Highest zone plus
// handling, so a payment that races the address update cannot ship for less
// than we pay. Larger quantities use placeholderShipping.
export const MAX_SHIPPING_CENTS = RATE_BY_POUND[2][8] + HANDLING_CENTS;

function billedPounds(copies) {
  return Math.floor((copies * 104 + 99) / 100);
}

function holidayInEffect(now) {
  const time = now.getTime();
  return time >= HOLIDAY_START && time < HOLIDAY_END;
}

function holidayCents(pounds, zone) {
  const far = zone >= 5;
  if (pounds <= 3) return far ? 55 : 40;
  if (pounds <= 10) return far ? 105 : 65;
  return far ? 175 : 105;
}

function cushionCents(copies, postage, pounds, zone, now) {
  if (copies <= 1 || !holidayInEffect(now)) return HANDLING_CENTS;
  const card = Math.round((postage * 29) / 1000);
  return Math.max(HANDLING_CENTS, holidayCents(pounds, zone) + card);
}

function boxesFor(quantity) {
  const boxes = [];
  let left = quantity;
  while (left > 0) {
    const copies = Math.min(BOX_COPIES, left);
    boxes.push(copies);
    left -= copies;
  }
  return boxes;
}

export function boxCount(quantity) {
  return Math.ceil(quantity / BOX_COPIES);
}

function normalizeQuantity(quantity) {
  const copies = Number(quantity);
  if (!Number.isInteger(copies) || copies < 1 || copies > MAX_COPIES) {
    return { error: "Choose between 1 and 36 copies." };
  }
  return { copies };
}

function priceBoxes(zone, copies, now) {
  let amount = 0;
  for (const box of boxesFor(copies)) {
    const pounds = billedPounds(box);
    const postage = RATE_BY_POUND[pounds][zone];
    amount += postage + cushionCents(box, postage, pounds, zone, now);
  }
  return amount;
}

export function placeholderShipping(quantity, now = new Date()) {
  const normalized = normalizeQuantity(quantity);
  if (normalized.error) return normalized;
  return {
    zone: 8,
    quantity: normalized.copies,
    boxes: boxCount(normalized.copies),
    amount: priceBoxes(8, normalized.copies, now),
  };
}

function locateZone(postalCode) {
  const digits = String(postalCode || "").replace(/\D/g, "");
  if (digits.length < 5) {
    return { error: "Enter a 5-digit US ZIP code." };
  }

  const zip5 = digits.slice(0, 5);
  const zip3 = Number(zip5.slice(0, 3));

  // APO, FPO, and DPO. The published chart's zone for these prefixes does not
  // match a Ground Advantage parcel of this weight, so we do not quote them.
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

  if (!RATE_BY_POUND[2][zone]) {
    return { error: "We can't ship to that ZIP code." };
  }

  return { zip: zip5, zone };
}

export function quoteOrder(postalCode, quantity, now = new Date()) {
  const located = locateZone(postalCode);
  if (located.error) return located;
  const normalized = normalizeQuantity(quantity);
  if (normalized.error) return normalized;
  return {
    zip: located.zip,
    zone: located.zone,
    quantity: normalized.copies,
    boxes: boxCount(normalized.copies),
    amount: priceBoxes(located.zone, normalized.copies, now),
  };
}

export function quoteShipping(postalCode) {
  const quote = quoteOrder(postalCode, 1);
  if (quote.error) return quote;
  return { zip: quote.zip, zone: quote.zone, amount: quote.amount };
}

export function formatDollars(cents) {
  return "$" + (cents / 100).toFixed(2);
}

export function shippingLabel() {
  return "USPS Ground Advantage";
}
