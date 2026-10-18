"use client";

import { useState, useMemo } from "react";
import { regions, categories } from "../../data/packages";
import PackageCard from "../../components/PackageCard";
import Icon from "../../components/Icon";
import { ApiPackage } from "../../types";

export default function PackagesBrowser({ allPackages }: { allPackages: ApiPackage[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  const filteredPackages = useMemo(() => {
    let result = [...allPackages];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (pkg) =>
          pkg.title.toLowerCase().includes(query) ||
          pkg.destination.toLowerCase().includes(query) ||
          pkg.region.toLowerCase().includes(query)
      );
    }

    if (selectedRegion !== "All") {
      result = result.filter((pkg) => pkg.region === selectedRegion);
    }

    if (selectedCategory !== "All") {
      result = result.filter(
        (pkg) => pkg.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (priceRange === "under1500") result = result.filter((pkg) => pkg.base_price < 1500);
    if (priceRange === "1500-2500") result = result.filter((pkg) => pkg.base_price >= 1500 && pkg.base_price <= 2500);
    if (priceRange === "over2500") result = result.filter((pkg) => pkg.base_price > 2500);

    if (sortBy === "price-low") result.sort((a, b) => a.base_price - b.base_price);
    if (sortBy === "price-high") result.sort((a, b) => b.base_price - a.base_price);
    if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    if (sortBy === "duration") result.sort((a, b) => a.duration - b.duration);

    return result;
  }, [allPackages, searchQuery, selectedRegion, selectedCategory, priceRange, sortBy]);

  return (
    <div className="min-h-screen">
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2337]/60 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <span className="inline-block glass px-4 py-1.5 rounded-full text-xs font-medium text-[#e3b341] uppercase tracking-widest mb-4">
            Destinations
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-white mb-4">
            Travel <span className="gradient-text">Packages</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Discover {allPackages.length} amazing destinations around the world
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="glass rounded-2xl p-6 mb-10">
          <div className="mb-6">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Icon name="search" size={17} />
              </span>
              <input
                type="text"
                placeholder="Search destinations, packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-dark w-full pl-12 pr-4 py-3.5 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Region</label>
              <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className="input-dark w-full px-3 py-2.5 rounded-xl">
                {regions.map((r) => (<option key={r} value={r}>{r}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input-dark w-full px-3 py-2.5 rounded-xl">
                {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Price Range</label>
              <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="input-dark w-full px-3 py-2.5 rounded-xl">
                <option value="all">All Prices</option>
                <option value="under1500">Under $1,500</option>
                <option value="1500-2500">$1,500 - $2,500</option>
                <option value="over2500">Over $2,500</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-dark w-full px-3 py-2.5 rounded-xl">
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="duration">Shortest Duration</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setSearchQuery(""); setSelectedRegion("All"); setSelectedCategory("All"); setPriceRange("all"); setSortBy("popular"); }}
                className="w-full px-4 py-2.5 glass-strong text-slate-300 rounded-xl hover:text-white hover:border-[#e3b341]/40 transition-all font-medium"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-slate-400">
            Showing <span className="font-semibold text-white">{filteredPackages.length}</span>{" "}
            {filteredPackages.length === 1 ? "package" : "packages"}
          </p>
        </div>

        {filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPackages.map((pkg) => (<PackageCard key={pkg.id} pkg={pkg} />))}
          </div>
        ) : (
          <div className="text-center py-20 glass rounded-2xl">
            <div className="text-slate-500 flex justify-center mb-4"><Icon name="search" size={52} /></div>
            <h3 className="text-2xl font-bold text-white mb-2">No packages found</h3>
            <p className="text-slate-400">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
