import { getPackage } from "@/lib/packages";

export async function GET(_req: Request, ctx: RouteContext<"/api/packages/[id]">) {
  try {
    const { id } = await ctx.params;
    const pkg = await getPackage(id);
    if (!pkg) {
      return Response.json({ error: "Package not found" }, { status: 404 });
    }
    return Response.json({ package: pkg });
  } catch (err) {
    console.error("Package detail error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
