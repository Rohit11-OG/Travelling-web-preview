"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";
import { Booking } from "../../types";

export default function BookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/bookings");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/bookings")
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to load bookings");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setBookings(data.bookings || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Network error. Please try again.");
        setLoading(false);
      });
  }, [user]);

  const cancelBooking = async (id: string) => {
    if (!confirm("Cancel this booking? This cannot be undone.")) return;
    setError("");
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (!res.ok) {
        setError((await res.json().catch(() => ({}))).error || "Failed to cancel booking");
        return;
      }
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b)));
    } catch {
      setError("Failed to cancel booking");
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Remove this booking from your list?")) return;
    setError("");
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError((await res.json().catch(() => ({}))).error || "Failed to remove booking");
        return;
      }
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch {
      setError("Failed to remove booking");
    }
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500/15 text-green-400 border border-green-500/30";
      case "pending": return "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30";
      case "cancelled": return "bg-red-500/15 text-red-400 border border-red-500/30";
      default: return "bg-slate-500/15 text-slate-400 border border-slate-500/30";
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2337]/60 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <span className="inline-block glass px-4 py-1.5 rounded-full text-xs font-medium text-[#e3b341] uppercase tracking-widest mb-4">
            Your Trips
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-white mb-4">
            My <span className="gradient-text">Bookings</span>
          </h1>
          <p className="text-slate-400 text-lg">Manage and view all your travel bookings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="glass rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl">
            <div className="text-slate-500 flex justify-center mb-4"><Icon name="plane" size={52} /></div>
            <h3 className="text-2xl font-bold text-white mb-2">No Bookings Yet</h3>
            <p className="text-slate-400 mb-8">You have not booked any trips yet. Start exploring!</p>
            <Link href="/packages" className="btn-gradient px-8 py-3 rounded-full font-semibold inline-block">
              Browse Packages
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="glass rounded-2xl overflow-hidden card-hover">
                <div className="grid grid-cols-1 md:grid-cols-4">
                  <div className="md:col-span-1 relative">
                    <Image src={booking.image} alt={booking.packageTitle} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                  </div>
                  <div className="md:col-span-3 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-bold text-white">{booking.packageTitle}</h3>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#e3b341]/10 text-[#e3b341] border border-[#e3b341]/30">
                            {booking.planName} Plan
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5">
                          <Icon name="map-pin" size={13} /> {booking.destination}
                        </p>
                      </div>
                      <span className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold mt-3 md:mt-0 uppercase tracking-wider ${statusStyle(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                      <div className="glass rounded-xl px-3 py-2.5">
                        <p className="text-xs text-slate-500">Booking ID</p>
                        <p className="font-medium text-slate-200 text-xs truncate">{booking.id}</p>
                      </div>
                      <div className="glass rounded-xl px-3 py-2.5">
                        <p className="text-xs text-slate-500">Travel Date</p>
                        <p className="font-medium text-slate-200 text-sm">{booking.travel_date}</p>
                      </div>
                      <div className="glass rounded-xl px-3 py-2.5">
                        <p className="text-xs text-slate-500">Travelers</p>
                        <p className="font-medium text-slate-200 text-sm">{booking.travelers}</p>
                      </div>
                      <div className="glass rounded-xl px-3 py-2.5">
                        <p className="text-xs text-slate-500">Total Price</p>
                        <p className="font-bold gradient-text text-sm">${booking.total_price}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => cancelBooking(booking.id)}
                          className="px-4 py-2 bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/25 transition-all text-sm font-medium"
                        >
                          Cancel Booking
                        </button>
                      )}
                      {booking.status === "cancelled" && (
                        <button
                          onClick={() => deleteBooking(booking.id)}
                          className="px-4 py-2 bg-red-500/15 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/25 transition-all text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                      <Link
                        href={`/packages/${booking.package_id}`}
                        className="px-4 py-2 glass text-slate-300 rounded-lg hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
                      >
                        View Package
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
