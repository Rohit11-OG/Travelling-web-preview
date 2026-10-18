import { Testimonial } from "../types";
import Icon from "./Icon";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="glass rounded-2xl p-6 card-hover h-full">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-[#e3b341] text-[#0a0f1c] rounded-full flex items-center justify-center font-bold text-sm mr-4">
          {testimonial.avatar}
        </div>
        <div>
          <h4 className="font-semibold text-white">{testimonial.name}</h4>
          <p className="text-xs text-slate-400">{testimonial.location}</p>
        </div>
      </div>
      <div className="flex mb-3">
        {[...Array(5)].map((_, i) => (
          <Icon
            key={i}
            name="star"
            size={15}
            filled
            className={i < testimonial.rating ? "text-[#e3b341]" : "text-slate-700"}
          />
        ))}
      </div>
      <p className="text-slate-300 text-sm leading-relaxed mb-3">&ldquo;{testimonial.comment}&rdquo;</p>
      <p className="text-xs text-[#e3b341] font-medium flex items-center gap-1.5">
        <Icon name="luggage" size={13} /> {testimonial.packageTitle}
      </p>
    </div>
  );
}
