import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPackage, getPackages } from "../../../lib/packages";
import PackageDetail from "./PackageDetail";

export async function generateStaticParams() {
  return (await getPackages()).map((p) => ({ id: p.id }));
}

async function PackageContent({ params }: Pick<PageProps<"/packages/[id]">, "params">) {
  const { id } = await params;
  const pkg = await getPackage(id);
  if (!pkg) notFound();
  return <PackageDetail pkg={pkg} />;
}

export default function PackageDetailPage(props: PageProps<"/packages/[id]">) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-xl text-slate-400 animate-pulse">Loading package...</div></div>}>
      <PackageContent params={props.params} />
    </Suspense>
  );
}
