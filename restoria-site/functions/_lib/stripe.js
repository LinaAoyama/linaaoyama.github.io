export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export async function stripeForm(env, path, params) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      body.set(key, String(value));
    }
  }

  const response = await fetch("https://api.stripe.com/v1" + path, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + env.STRIPE_SECRET_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function stripeGet(env, path) {
  const response = await fetch("https://api.stripe.com/v1" + path, {
    headers: {
      Authorization: "Bearer " + env.STRIPE_SECRET_KEY,
    },
  });
  const data = await response.json();
  return { ok: response.ok, data };
}
