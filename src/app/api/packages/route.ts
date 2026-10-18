import { NextRequest } from "next/server";
import { getPackages } from "@/lib/packages";

// This route reads request.nextUrl.searchParams, which intentionally bails it
// out of build-time prerendering — it always executes at request time (ƒ dynamic).
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const region = searchParams.get("region");
    const category = searchParams.get("category")?.toLowerCase();
    const search = searchParams.get("search")?.toLowerCase();

    const packages = (await getPackages()).filter(
      (p) =>
        (!region || region === "All" || p.region === region) &&
        (!category || category === "all" || p.category === category) &&
        (!search || p.title.toLowerCase().includes(search) || p.destination.toLowerCase().includes(search))
    );

    return Response.json({ packages });
  } catch (err) {
    // Expected during build-time prerendering: reading searchParams bails the
    // route out of prerendering, so it always runs per-request (ƒ dynamic).
    if ((err as { digest?: string })?.digest !== "NEXT_PRERENDER_INTERRUPTED") {
      console.error("Packages list error:", err);
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
