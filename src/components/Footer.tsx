"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Icon from "./Icon";

// Current year is time-dependent; read it only on the client so prerendered
// HTML stays stable (empty subscribe = server snapshot is never re-read there).
function useCurrentYear(): number | null {
  return useSyncExternalStore(
    () => () => {},
    () => new Date().getFullYear(),
    () => null
  );
}

export default function Footer() {
  const year = useCurrentYear();

  return (
    <footer className="glass-nav mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2.5 mb-4">
              <span className="w-9 h-9 rounded-full bg-[#e3b341] text-[#0a0f1c] flex items-center justify-center">
                <Icon name="compass" size={19} />
              </span>
              <span className="text-xl font-bold font-display text-white">Wanderlust</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your trusted travel partner for unforgettable adventures around the globe. Dream. Explore. Discover.
            </p>
            <div className="flex space-x-3 mt-4">
              {["M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z", "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z", "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"].map((d, i) => (
                <a key={i} href="#" className="w-9 h-9 glass rounded-full flex items-center justify-center text-slate-400 hover:text-[#e3b341] transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={d} /></svg>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-slate-400 text-sm">
              <li><Link href="/" className="hover:text-[#e3b341] transition-colors">Home</Link></li>
              <li><Link href="/packages" className="hover:text-[#e3b341] transition-colors">Packages</Link></li>
              <li><Link href="/bookings" className="hover:text-[#e3b341] transition-colors">My Bookings</Link></li>
              <li><Link href="/contact" className="hover:text-[#e3b341] transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Top Destinations</h3>
            <ul className="space-y-2.5 text-slate-400 text-sm">
              <li className="hover:text-[#e3b341] transition-colors cursor-pointer">Bali, Indonesia</li>
              <li className="hover:text-[#e3b341] transition-colors cursor-pointer">Swiss Alps</li>
              <li className="hover:text-[#e3b341] transition-colors cursor-pointer">Tokyo, Japan</li>
              <li className="hover:text-[#e3b341] transition-colors cursor-pointer">Santorini, Greece</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact Info</h3>
            <ul className="space-y-2.5 text-slate-400 text-sm">
              <li className="flex items-center gap-2"><Icon name="mail" size={14} className="text-[#e3b341]" /> hello@wanderlust.com</li>
              <li className="flex items-center gap-2"><Icon name="phone" size={14} className="text-[#e3b341]" /> +1 (555) 123-4567</li>
              <li className="flex items-center gap-2"><Icon name="map-pin" size={14} className="text-[#e3b341]" /> 123 Travel Street, NY 10001</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-10 pt-8 text-center text-slate-500 text-sm">
          <p>&copy; {year ?? ""} Wanderlust Travel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
