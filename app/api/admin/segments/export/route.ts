import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSegmentReport, isSegmentKey, toCsv } from "@/lib/segments";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const segment = url.searchParams.get("segment") || "";
  if (!isSegmentKey(segment)) {
    return NextResponse.json({ error: "Invalid segment" }, { status: 400 });
  }

  try {
    const report = await getSegmentReport();
    const rows = report.byKey[segment];
    const csv = toCsv(rows);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="jmc-segment-${segment}-${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("Segment export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
