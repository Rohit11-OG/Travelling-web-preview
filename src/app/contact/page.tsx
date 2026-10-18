"use client";

import { useState } from "react";
import Icon from "../../components/Icon";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send message");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2337]/60 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <span className="inline-block glass px-4 py-1.5 rounded-full text-xs font-medium text-[#e3b341] uppercase tracking-widest mb-4">
            Get In Touch
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-white mb-4">
            Contact <span className="gradient-text">Us</span>
          </h1>
          <p className="text-slate-400 text-lg">We would love to hear from you</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            {[
              { icon: <Icon name="map-pin" size={24} />, title: "Our Office", lines: ["123 Travel Street", "New York, NY 10001", "United States"] },
              { icon: <Icon name="phone" size={24} />, title: "Phone", lines: ["+1 (555) 123-4567", "Mon-Fri 9am-6pm EST"] },
              { icon: <Icon name="mail" size={24} />, title: "Email", lines: ["hello@wanderlust.com", "support@wanderlust.com"] },
            ].map((card) => (
              <div key={card.title} className="glass rounded-2xl p-6 card-hover">
                <div className="text-[#e3b341] mb-3">{card.icon}</div>
                <h3 className="font-bold text-white mb-2">{card.title}</h3>
                {card.lines.map((line, i) => (
                  <p key={i} className="text-slate-400 text-sm">{line}</p>
                ))}
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-8">
              {submitted ? (
                <div className="text-center py-12 animate-fade-in">
                  <div className="w-20 h-20 mx-auto mb-6 bg-[#e3b341] text-[#0a0f1c] rounded-full flex items-center justify-center">
                    <Icon name="check" size={38} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Message Sent!</h2>
                  <p className="text-slate-400 mb-8">Thank you for reaching out. We will get back to you within 24 hours.</p>
                  <button onClick={() => { setSubmitted(false); setSubmitting(false); setFormData({ name: "", email: "", subject: "", message: "" }); }} className="btn-gradient text-white px-6 py-3 rounded-full font-semibold">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
                  {error && (
                    <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 animate-fade-in">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-dark w-full px-4 py-3 rounded-xl" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Email *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-dark w-full px-4 py-3 rounded-xl" placeholder="john@example.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject *</label>
                      <select name="subject" value={formData.subject} onChange={handleChange} required className="input-dark w-full px-4 py-3 rounded-xl">
                        <option value="">Select a subject</option>
                        <option value="booking">Booking Inquiry</option>
                        <option value="package">Package Information</option>
                        <option value="custom">Custom Trip Request</option>
                        <option value="support">Customer Support</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Message *</label>
                      <textarea name="message" value={formData.message} onChange={handleChange} required rows={6} className="input-dark w-full px-4 py-3 rounded-xl resize-none" placeholder="Tell us about your dream trip or ask us anything..." />
                    </div>
                    <button type="submit" disabled={submitting} className="w-full btn-gradient py-4 rounded-xl font-bold text-lg disabled:opacity-60 disabled:cursor-not-allowed">
                      {submitting ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
