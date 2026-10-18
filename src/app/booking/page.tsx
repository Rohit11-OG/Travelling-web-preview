"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";
import { ApiPackage } from "../../types";

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const packageId = searchParams.get("package");
  const planId = searchParams.get("plan");

  const [pkg, setPkg] = useState<ApiPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    travelDate: "",
    travelers: 1,
    specialRequests: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!packageId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    fetch(`/api/packages/${packageId}`)
      .then(async (res) => {
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        const fetched: ApiPackage = data.package;
        setPkg(fetched);
        const plan = fetched.plans.find((p: { id: number }) => String(p.id) === planId);
        setSelectedPlanId(plan ? plan.id : fetched.plans[0]?.id ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [packageId, planId]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name,
        email: prev.email || user.email,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(`/booking?${searchParams}`)}`);
    }
  }, [authLoading, user, router, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "travelers" ? parseInt(value) || 1 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkg || !selectedPlanId) return;
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          planId: selectedPlanId,
          travelDate: formData.travelDate,
          travelers: formData.travelers,
          customerName: formData.customerName,
          email: formData.email,
          phone: formData.phone,
          specialRequests: formData.specialRequests,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Booking failed");
        setSubmitting(false);
        return;
      }
      setConfirmed(true);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass rounded-3xl p-12">
          <h1 className="text-4xl font-bold font-display text-white mb-4">No Package Selected</h1>
          <p className="text-slate-400 mb-8">Please select a package to book.</p>
          <Link href="/packages" className="btn-gradient px-8 py-3 rounded-full font-semibold inline-block">
            Browse Packages
          </Link>
        </div>
      </div>
    );
  }

  const selectedPlan = pkg.plans.find((p) => p.id === selectedPlanId) ?? pkg.plans[0];

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="glass-strong rounded-3xl p-12 text-center max-w-lg mx-4 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#e3b341] text-[#0a0f1c] rounded-full flex items-center justify-center">
            <Icon name="check" size={38} />
          </div>
          <h1 className="text-3xl font-bold font-display text-white mb-4">Booking Confirmed!</h1>
          <p className="text-slate-300 mb-2">Thank you for booking with Wanderlust!</p>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
            Your <strong className="text-white">{selectedPlan.name}</strong> trip to{" "}
            <strong className="text-white">{pkg.destination}</strong> is confirmed. A confirmation email has been sent to{" "}
            <strong className="text-white">{formData.email}</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/bookings" className="btn-gradient px-6 py-3 rounded-full font-semibold">
              View My Bookings
            </Link>
            <Link href="/packages" className="glass text-slate-300 px-6 py-3 rounded-full font-medium hover:text-white transition-all">
              Browse More Packages
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <Link href={`/packages/${pkg.id}`} className="text-[#e3b341] hover:text-[#f0c75e] font-medium transition-colors">
            &larr; Back to Package
          </Link>
        </div>

        {/* Plan Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Selected Plan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {pkg.plans.map((plan) => {
              const isSelected = plan.id === selectedPlanId;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`text-left glass rounded-2xl p-5 transition-all duration-300 ${
                    isSelected ? "border-2 border-[#e3b341]/70 shadow-lg shadow-black/30" : "border border-white/8 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white uppercase tracking-wider">{plan.name}</span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-[#e3b341] bg-[#e3b341]" : "border-slate-500"}`}>
                      {isSelected && <Icon name="check" size={10} className="text-[#0a0f1c]" />}
                    </div>
                  </div>
                  <span className="text-2xl font-bold gradient-text">${plan.price}</span>
                  <span className="text-slate-400 text-xs"> /person</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div className="glass rounded-2xl p-8">
            <h1 className="text-2xl font-bold text-white mb-6">Your Details</h1>
            {error && (
              <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 animate-fade-in">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name *</label>
                <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required className="input-dark w-full px-4 py-3 rounded-xl" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-dark w-full px-4 py-3 rounded-xl" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="input-dark w-full px-4 py-3 rounded-xl" placeholder="+1 555 123 4567" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Travel Date *</label>
                <input type="date" name="travelDate" value={formData.travelDate} onChange={handleChange} required min={new Date().toLocaleDateString("en-CA")} className="input-dark w-full px-4 py-3 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Number of Travelers * <span className="normal-case font-normal">(max {pkg.max_group_size})</span>
                </label>
                <select name="travelers" value={formData.travelers} onChange={handleChange} className="input-dark w-full px-4 py-3 rounded-xl">
                  {Array.from({ length: pkg.max_group_size }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "Traveler" : "Travelers"}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Special Requests</label>
                <textarea name="specialRequests" value={formData.specialRequests} onChange={handleChange} rows={3} className="input-dark w-full px-4 py-3 rounded-xl resize-none" placeholder="Any dietary requirements, accessibility needs, etc." />
              </div>
              <button type="submit" disabled={submitting} className="w-full btn-gradient py-4 rounded-xl font-bold text-lg disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? "Processing..." : `Confirm Booking \u2022 $${selectedPlan.price * formData.travelers}`}
              </button>
            </form>
          </div>

          {/* Package Summary */}
          <div>
            <div className="glass rounded-2xl overflow-hidden mb-6">
              <div className="relative h-48">
                <Image src={pkg.image} alt={pkg.title} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white">{pkg.title}</h3>
                  <p className="text-slate-300 text-sm flex items-center gap-1.5"><Icon name="map-pin" size={13} /> {pkg.destination}</p>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-1">
                  <div className="flex justify-between py-2.5 border-b border-white/5">
                    <span className="text-slate-400 text-sm">Plan</span>
                    <span className="font-medium text-white text-sm">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-white/5">
                    <span className="text-slate-400 text-sm">Duration</span>
                    <span className="font-medium text-white text-sm">{pkg.duration} Days</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-white/5">
                    <span className="text-slate-400 text-sm">Price per person</span>
                    <span className="font-medium text-white text-sm">${selectedPlan.price}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-white/5">
                    <span className="text-slate-400 text-sm">Travelers</span>
                    <span className="font-medium text-white text-sm">{formData.travelers}</span>
                  </div>
                  <div className="flex justify-between py-3 text-lg font-bold">
                    <span className="text-white">Total</span>
                    <span className="gradient-text">${selectedPlan.price * formData.travelers}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Icon name="shield" size={18} className="text-[#e3b341]" /> Booking Protection</h4>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li className="flex items-center"><Icon name="check" size={14} className="text-[#e3b341] mr-2 flex-shrink-0" /> Free cancellation up to 30 days</li>
                <li className="flex items-center"><Icon name="check" size={14} className="text-[#e3b341] mr-2 flex-shrink-0" /> Full refund if we cancel</li>
                <li className="flex items-center"><Icon name="check" size={14} className="text-[#e3b341] mr-2 flex-shrink-0" /> 24/7 customer support</li>
                <li className="flex items-center"><Icon name="check" size={14} className="text-[#e3b341] mr-2 flex-shrink-0" /> Best price guarantee</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-xl text-slate-400">Loading...</div></div>}>
      <BookingForm />
    </Suspense>
  );
}
