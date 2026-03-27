import { Sparkles, ShieldCheck, Truck, RotateCcw, Leaf } from "lucide-react";

const badges = [
  {
    icon: <Leaf className="h-5 w-5 md:h-6 md:w-6" />,
    title: "100% Organic",
    desc: "Nature powered formulas"
  },
  {
    icon: <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />,
    title: "Derm Tested",
    desc: "Certified for all skin types"
  },
  {
    icon: <Truck className="h-5 w-5 md:h-6 md:w-6" />,
    title: "Free Shipping",
    desc: "On all orders over ₹999"
  },
  {
    icon: <RotateCcw className="h-5 w-5 md:h-6 md:w-6" />,
    title: "Easy Returns",
    desc: "30-day hassle-free policy"
  }
];

export function TrustBadges() {
  return (
    <section className="bg-zinc-950 py-16 md:py-24 border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {badges.map((badge, index) => (
            <div 
              key={index} 
              className="group flex flex-col items-center text-center space-y-4 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="h-14 w-14 md:h-20 md:w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#50540b] transition-all duration-500 group-hover:bg-[#50540b] group-hover:text-white group-hover:shadow-[0_0_30px_rgba(181,148,97,0.3)]">
                {badge.icon}
              </div>

              <div className="space-y-1">
                <h3 className="text-white font-serif text-sm md:text-lg tracking-wide uppercase">
                  {badge.title}
                </h3>
                <p className="text-zinc-500 text-[9px] md:text-xs font-bold uppercase tracking-[0.2em]">
                  {badge.desc}
                </p>
              </div>

              <div className="hidden lg:block w-8 h-[1px] bg-white/10 group-hover:w-16 group-hover:bg-[#50540b] transition-all duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}