import Link from "next/link";
import Image from "next/image";
import { ApiPackage } from "../types";
import Icon from "./Icon";

interface PackageCardProps {
  pkg: ApiPackage;
}

export default function PackageCard({ pkg }: PackageCardProps) {
  const minPrice = pkg.plans.length > 0 ? Math.min(...pkg.plans.map((p) => p.price)) : pkg.base_price;

  return (
    <Link href={`/packages/${pkg.id}`} className="block group">
      <div className="glass rounded-2xl overflow-hidden card-hover h-full">
        <div className="relative h-56 overflow-hidden">
          <Image
            src={pkg.image}
            alt={pkg.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {pkg.featured && (
            <span className="absolute top-3 left-3 bg-[#e3b341] text-[#0a0f1c] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Icon name="star" size={12} filled /> Featured
            </span>
          )}
          <span className="absolute top-3 right-3 glass-strong text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            {pkg.duration} Days
          </span>
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-white/80 text-xs flex items-center gap-1">
              <Icon name="map-pin" size={12} /> {pkg.destination}
            </p>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#e3b341] font-medium glass px-2.5 py-1 rounded-full">{pkg.region}</span>
            <div className="flex items-center space-x-1">
              <Icon name="star" size={14} filled className="text-[#e3b341]" />
              <span className="text-sm font-medium text-white">{pkg.rating}</span>
              <span className="text-xs text-slate-500">({pkg.reviews})</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#e3b341] transition-colors">{pkg.title}</h3>
          <p className="text-xs text-slate-500 mb-3">{pkg.plans.length} plans available</p>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">from</span>
              <span className="text-2xl font-bold gradient-text">${minPrice}</span>
              <span className="text-slate-500 text-sm"> /person</span>
            </div>
            <span className="btn-gradient text-sm font-semibold px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1.5">
              View <Icon name="arrow-right" size={14} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
