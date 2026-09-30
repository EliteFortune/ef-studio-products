import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const encoder = new TextEncoder();

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json(405, { ok: false, code: "METHOD_NOT_ALLOWED" });

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > 16384) return json(413, { ok: false, code: "REQUEST_TOO_LARGE" });

  let payload: Record<string, unknown>;
  try { payload = await req.json(); }
  catch { return json(400, { ok: false, code: "INVALID_JSON" }); }

  const licenseKey = typeof payload.licenseKey === "string" ? payload.licenseKey.trim() : "";
  const product = typeof payload.product === "string" ? payload.product.trim() : "";
  const deviceId = typeof payload.deviceId === "string" ? payload.deviceId.trim() : "";

  if (!licenseKey || licenseKey.length > 256 || product !== "agent-reliability" || !deviceId || deviceId.length > 256) {
    return json(400, { ok: false, code: "INVALID_REQUEST" });
  }

  const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
  const legacyServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const adminKey = secretKeysRaw ? JSON.parse(secretKeysRaw)["default"] : legacyServiceRole;
  if (!adminKey) return json(500, { ok: false, code: "SERVICE_CONFIG_ERROR" });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, adminKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = await sha256Hex(forwarded);
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const { count: attempts, error: countError } = await supabase
    .from("ef_license_activation_attempts")
    .select("*", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("attempted_at", fifteenMinutesAgo);

  if (countError) return json(503, { ok: false, code: "SERVICE_UNAVAILABLE" });
  if ((attempts ?? 0) >= 30) return json(429, { ok: false, code: "RATE_LIMITED" });

  const keyHash = await sha256Hex(licenseKey);
  const deviceHash = await sha256Hex(deviceId);

  const { data, error } = await supabase.rpc("ef_activate_license", {
    p_product: product,
    p_license_key_hash: keyHash,
    p_device_id_hash: deviceHash,
    p_user_agent: req.headers.get("user-agent") ?? null,
  });

  const ok = !error && data?.ok === true;
  await supabase.from("ef_license_activation_attempts").insert({ ip_hash: ipHash, success: ok });

  if (error) return json(503, { ok: false, code: "SERVICE_UNAVAILABLE" });
  if (!ok) {
    const code = data?.code ?? "LICENSE_INVALID";
    const status = code === "ACTIVATION_LIMIT_REACHED" ? 409 : code === "LICENSE_REVOKED" ? 403 : 401;
    return json(status, { ok: false, code });
  }

  return json(200, { ok: true, entitlement: data.entitlement });
});
