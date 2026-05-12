import { NextResponse } from "next/server";

/**
 * Proxies the free India Post pincode API.
 *   Upstream: https://api.postalpincode.in/pincode/{code}
 *
 * Returns a normalized payload:
 *   { ok: true, city: string, state: string, area?: string, district?: string }
 *   { ok: false, error: string }
 *
 * Cached for 1 day via fetch revalidate — pincodes change rarely.
 */

export const dynamic = "force-dynamic";

interface PostOffice {
  Name?: string;
  Block?: string;
  District?: string;
  State?: string;
  Country?: string;
  Pincode?: string;
}

interface UpstreamResponse {
  Message?: string;
  Status?: string;
  PostOffice?: PostOffice[] | null;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params;
  const pincode = code.replace(/\D/g, "");

  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json(
      { ok: false, error: "Pincode must be 6 digits" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      // Cache for 24h — pincode data is essentially static.
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "Lookup service unavailable" },
        { status: 502 }
      );
    }

    const json = (await res.json()) as UpstreamResponse[];
    const first = Array.isArray(json) ? json[0] : null;

    if (!first || first.Status !== "Success" || !first.PostOffice?.length) {
      return NextResponse.json(
        { ok: false, error: "Pincode not found" },
        { status: 404 }
      );
    }

    // Prefer the post office matching the pincode exactly, else first entry.
    const po =
      first.PostOffice.find((p) => p.Pincode === pincode) ?? first.PostOffice[0];

    return NextResponse.json({
      ok: true,
      city: po?.District ?? po?.Block ?? "",
      state: po?.State ?? "",
      area: po?.Name ?? "",
      district: po?.District ?? "",
    });
  } catch (error) {
    console.error("Pincode lookup error:", error);
    return NextResponse.json(
      { ok: false, error: "Lookup failed" },
      { status: 500 }
    );
  }
}
