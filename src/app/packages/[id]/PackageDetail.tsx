"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ApiPackage } from "../../../types";
import Icon from "../../../components/Icon";

const planStyles: Record<string, { badge: string; ring: string }> = {
  standard: {
    badge: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    ring: "border-slate-400/60",
  },
  premium: {
    badge: "bg-[#e3b341]/10 text-[#e3b341] border-[#e3b341]/30",
    ring: "border-[#e3b341]/70",
  },
  luxury: {
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    ring: "border-amber-400/70",
  },
};

export default function PackageDetail({ pkg }: { pkg: ApiPackage }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(
    () => (pkg.plans.find((p) => p.tier === "premium") ?? pkg.plans[0])?.id ?? null
  );

  const selectedPlan = pkg.plans.find((p) => p.id === selectedPlanId) ?? pkg.plans[0];

  return (
    <div className="min-h-screen">
      {/* Hero Image */}
      <div className="relative h-[450px]">
        <Image src={pkg.image} alt={pkg.title} fill preload sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-black/40 to-black/20" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <span className="glass-strong text-[#e3b341] text-xs font-semibold px-4 py-1.5 rounded-full mb-4 inline-block uppercase tracking-wider">
              {pkg.region} &bull; {pkg.category}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold font-display text-white mb-3">{pkg.title}</h1>
            <p className="text-xl text-slate-300 flex items-center gap-2"><Icon name="map-pin" size={19} className="text-[#e3b341]" /> {pkg.destination}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* ===== PLAN SELECTION ===== */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Choose Your <span className="gradient-text">Plan</span>
            </h2>
            <p className="text-slate-400">Select the experience level that fits you best</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pkg.plans.map((plan) => {
              const style = planStyles[plan.tier] ?? planStyles.standard;
              const isSelected = plan.id === selectedPlanId;
              return (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`relative text-left glass rounded-2xl p-6 transition-all duration-300 ${
                    isSelected
                      ? `border-2 ${style.ring} shadow-lg shadow-black/30 scale-[1.02]`
                      : "border border-white/8 hover:border-white/20"
                  }`}
                >
                  {plan.tier === "premium" && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e3b341] text-[#0a0f1c] text-xs font-bold px-4 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${style.badge}`}>
                      {plan.name}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? "border-[#e3b341] bg-[#e3b341]" : "border-slate-500"
                      }`}
                    >
                      {isSelected && <Icon name="check" size={12} className="text-[#0a0f1c]" />}
                    </div>
                  </div>
                  <div className="mb-5">
                    <span className="text-4xl font-bold text-white">
                      ${plan.price}
                    </span>
                    <span className="text-slate-400 text-sm"> /person</span>
                  </div>
                  <ul className="space-y-2.5">
                    {plan.perks.map((perk, i) => (
                      <li key={i} className="flex items-start text-sm">
                        <Icon name="check" size={15} className="text-[#e3b341] mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl overflow-hidden">
              <div className="flex border-b border-white/5">
                {["overview", "itinerary", "inclusions"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 text-center text-sm font-semibold uppercase tracking-wider transition-all duration-300 ${
                      activeTab === tab
                        ? "text-white bg-white/5 border-b-2 border-[#e3b341]"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-7">
                {activeTab === "overview" && (
                  <div className="animate-fade-in">
                    <h2 className="text-2xl font-bold text-white mb-4">About This Package</h2>
                    <p className="text-slate-300 leading-relaxed mb-8">{pkg.description}</p>
                    <h3 className="text-xl font-bold text-white mb-5">Highlights</h3>
                    <ul className="space-y-3.5">
                      {pkg.highlights.map((h, i) => (
                        <li key={i} className="flex items-start glass rounded-xl px-4 py-3">
                          <Icon name="check" size={16} className="text-[#e3b341] mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-300">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === "itinerary" && (
                  <div className="animate-fade-in">
                    <h2 className="text-2xl font-bold text-white mb-7">Day by Day Itinerary</h2>
                    <div className="space-y-5">
                      {pkg.itinerary.map((day) => (
                        <div key={day.day} className="glass rounded-xl p-5 border-l-4 border-l-[#e3b341]">
                          <div className="flex items-center mb-3">
                            <span className="bg-[#e3b341] text-[#0a0f1c] text-sm font-bold w-9 h-9 rounded-full flex items-center justify-center mr-3">
                              {day.day}
                            </span>
                            <h3 className="text-lg font-bold text-white">{day.title}</h3>
                          </div>
                          <p className="text-slate-300 text-sm mb-3 leading-relaxed">{day.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {day.meals.map((meal, i) => (
                              <span key={i} className="glass text-slate-300 text-xs px-2.5 py-1 rounded-full">
                                {meal}
                              </span>
                            ))}
                            {day.accommodation && (
                              <span className="glass text-[#e3b341] text-xs px-2.5 py-1 rounded-full">
                                {day.accommodation}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "inclusions" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <div>
                      <h3 className="text-xl font-bold text-green-400 mb-5">What is Included</h3>
                      <ul className="space-y-3">
                        {pkg.inclusions.map((item, i) => (
                          <li key={i} className="flex items-start">
                            <Icon name="check" size={15} className="text-[#e3b341] mr-3 mt-1 flex-shrink-0" />
                            <span className="text-slate-300 text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-400 mb-5">What is Not Included</h3>
                      <ul className="space-y-3">
                        {pkg.exclusions.map((item, i) => (
                          <li key={i} className="flex items-start">
                            <Icon name="x" size={15} className="text-red-400 mr-3 mt-1 flex-shrink-0" />
                            <span className="text-slate-300 text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-strong rounded-2xl p-7 sticky top-24 shadow-xl shadow-black/30">
              <div className="text-center mb-2">
                <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${(planStyles[selectedPlan.tier] ?? planStyles.standard).badge}`}>
                  {selectedPlan.name} Plan
                </span>
              </div>
              <div className="text-center mb-7">
                <span className="text-4xl font-bold gradient-text">${selectedPlan.price}</span>
                <span className="text-slate-400"> /person</span>
              </div>

              <div className="space-y-1 mb-7">
                {[
                  { label: "Duration", value: `${pkg.duration} Days` },
                  { label: "Rating", value: `${pkg.rating} (${pkg.reviews} reviews)` },
                  { label: "Max Group", value: `${pkg.max_group_size} people` },
                  { label: "Category", value: pkg.category },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-slate-400 text-sm">{row.label}</span>
                    <span className="font-medium text-white text-sm capitalize">{row.value}</span>
                  </div>
                ))}
              </div>

              <Link
                href={`/booking?package=${pkg.id}&plan=${selectedPlan.id}`}
                className="block w-full btn-gradient text-center py-4 rounded-xl font-bold text-lg mb-3"
              >
                Book {selectedPlan.name}
              </Link>

              <Link
                href="/contact"
                className="block w-full glass text-slate-300 text-center py-3 rounded-xl font-medium hover:text-white hover:bg-white/10 transition-all"
              >
                Ask a Question
              </Link>

              <div className="mt-7 text-center text-sm text-slate-400">
                <p className="flex items-center justify-center gap-1.5"><Icon name="phone" size={14} className="text-[#e3b341]" /> Need help? Call us at</p>
                <p className="font-bold text-white">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
