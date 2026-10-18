import Link from "next/link";

export default function PackageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center glass rounded-3xl p-12">
        <h1 className="text-4xl font-bold text-white mb-4">Package Not Found</h1>
        <p className="text-slate-400 mb-8">The package you are looking for does not exist.</p>
        <Link href="/packages" className="btn-gradient text-white px-8 py-3 rounded-full font-semibold inline-block">
          Browse All Packages
        </Link>
      </div>
    </div>
  );
}
