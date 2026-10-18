import Link from "next/link";
import Image from "next/image";
import { testimonials } from "../data/packages";
import { getPackages } from "../lib/packages";
import PackageCard from "../components/PackageCard";
import TestimonialCard from "../components/TestimonialCard";
import Icon from "../components/Icon";

export default async function Home() {
  const featuredPackages = (await getPackages()).filter((p) => p.featured).slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center text-center">
        <Image
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&h=900&fit=crop"
          alt=""
          fill
          preload
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-24">
          <div className="inline-flex items-center glass px-5 py-2 rounded-full text-sm text-[#e3b341] mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
            Trusted by 10,000+ travelers worldwide
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-display text-white mb-6 leading-tight animate-fade-in">
            Explore the World
            <br />
            with <span className="gradient-text">Wanderlust</span>
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto animate-fade-in-delay">
            Discover breathtaking destinations, create unforgettable memories, and let us handle the details. Your dream vacation starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
            <Link
              href="/packages"
              className="btn-gradient px-10 py-4 rounded-full text-lg font-semibold flex items-center justify-center gap-2"
            >
              Browse Packages <Icon name="plane" size={19} />
            </Link>
            <Link
              href="/contact"
              className="glass-strong text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 animate-fade-in-delay-2">
            {[
              { value: "50+", label: "Destinations" },
              { value: "10K+", label: "Happy Travelers" },
              { value: "4.8", label: "Average Rating" },
              { value: "15+", label: "Years Experience" },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-5 card-hover">
                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block glass px-4 py-1.5 rounded-full text-xs font-medium text-[#e3b341] uppercase tracking-widest mb-4">
              Curated For You
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Featured <span className="gradient-text">Travel Packages</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Handpicked destinations with the best experiences, carefully crafted by our travel experts.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/packages"
              className="inline-block glass-strong text-white px-10 py-4 rounded-full font-semibold hover:border-[#e3b341]/40 transition-all duration-300"
            >
              View All Packages &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block glass px-4 py-1.5 rounded-full text-xs font-medium text-[#e3b341] uppercase tracking-widest mb-4">
              Why Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose <span className="gradient-text">Wanderlust?</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Icon name="globe" size={30} />, title: "Expert Guides", desc: "Our local experts know every hidden gem and will make your journey truly unforgettable." },
              { icon: <Icon name="wallet" size={30} />, title: "Best Prices", desc: "Competitive pricing with zero hidden fees. Get the most value for every dollar spent." },
              { icon: <Icon name="shield" size={30} />, title: "Safe & Secure", desc: "Travel with confidence knowing we prioritize your safety and comfort at every step." },
            ].map((item) => (
              <div key={item.title} className="glass rounded-2xl p-8 text-center card-hover">
                <div className="text-[#e3b341] flex justify-center mb-5">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block glass px-4 py-1.5 rounded-full text-xs font-medium text-[#e3b341] uppercase tracking-widest mb-4">
              Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What Our <span className="gradient-text">Travelers Say</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Real stories from real travelers who trusted us with their adventures.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.slice(0, 6).map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 relative">
        <Image
          src="https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=1600&h=400&fit=crop"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="glass-strong rounded-3xl p-12 shadow-2xl shadow-black/40">
            <h2 className="text-4xl md:text-5xl font-bold font-display text-white mb-6">
              Ready for Your Next <span className="gradient-text-gold">Adventure?</span>
            </h2>
            <p className="text-xl text-slate-300 mb-10">
              Start planning your dream vacation today. The world is waiting for you!
            </p>
            <Link
              href="/packages"
              className="btn-gold px-12 py-4 rounded-full text-lg font-bold inline-flex items-center gap-2"
            >
              Start Exploring <Icon name="compass" size={19} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
