"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/packages", label: "Packages" },
  { href: "/bookings", label: "My Bookings" },
  { href: "/contact", label: "Contact" },
];

function NavbarContent() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    router.push("/");
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-nav shadow-lg shadow-black/30" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <span className="w-9 h-9 rounded-full bg-[#e3b341] text-[#0a0f1c] flex items-center justify-center transition-transform duration-300 group-hover:rotate-12">
              <Icon name="compass" size={19} />
            </span>
            <span className="text-xl font-bold font-display text-white tracking-wide">Wanderlust</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  pathname === link.href
                    ? "glass-strong text-[#e3b341]"
                    : "text-slate-300 hover:text-white hover:glass"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-3 ml-3">
                    <div className="flex items-center space-x-2 glass px-3 py-1.5 rounded-full">
                      <div className="w-7 h-7 bg-[#e3b341] text-[#0a0f1c] rounded-full flex items-center justify-center text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-white font-medium max-w-[100px] truncate">{user.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-slate-400 hover:text-white font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="ml-3 btn-gradient text-sm font-semibold px-5 py-2 rounded-full"
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white glass"
            aria-label="Toggle menu"
          >
            <Icon name={isOpen ? "x" : "menu"} size={22} />
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-1 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block py-2.5 px-4 font-medium rounded-lg transition-all ${
                  pathname === link.href
                    ? "glass-strong text-[#e3b341]"
                    : "text-slate-300 hover:text-white hover:glass"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!loading && (
              <>
                {user ? (
                  <div className="pt-2 border-t border-white/5 mt-2">
                    <div className="flex items-center space-x-2 px-4 py-2">
                      <div className="w-7 h-7 bg-[#e3b341] text-[#0a0f1c] rounded-full flex items-center justify-center text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-white font-medium">{user.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left py-2.5 px-4 text-slate-300 hover:text-white font-medium rounded-lg hover:glass"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block py-2.5 px-4 btn-gradient text-center font-semibold rounded-lg mt-2"
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<nav className="sticky top-0 z-50 h-16 glass-nav" />}>
      <NavbarContent />
    </Suspense>
  );
}
