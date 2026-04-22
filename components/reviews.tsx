import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Verified Customer",
    product: "JMC Lemon Facewash",
    rating: 5,
    text: "I started using your facewash since last week the results are amazing. My face is literally glowing, it has already improved my skin tone. I am super happy with your products — from packaging to quality, everything is just fab.",
    tag: "Glowing Skin"
  },
  {
    name: "Mrs. Bhandari",
    product: "JMC Lemon Facewash",
    rating: 5,
    text: "It's wonderful. It deeply cleanses my skin, leaving it feeling incredibly refreshed. My skin feels so soft and smooth after each wash. I loved how it gently exfoliates and reveals a brighter complexion. It is a complete game-changer for my skin care routine.",
    tag: "Deep Cleansing"
  },
  {
    name: "Ana Sachdev",
    product: "Lemon Facewash + Day & Night Cream",
    rating: 5,
    text: "Love this company! Having been delighted with the lemon facewash, I am now also loving the day and night face cream. I love the ethics and the products. Perfect.",
    tag: "Repeat Customer"
  },
  {
    name: "Verified Customer",
    product: "JMC Lemon Facewash",
    rating: 5,
    text: "Wash your face twice daily with JMC Lemon Facewash and see the difference — it helped me avoid pimples and dullness. The lemon helps detox skin naturally. Highly recommend for anyone looking for a natural glow.",
    tag: "Before & After"
  }
];

export function Reviews() {
  return (
    <section className="bg-zinc-950 py-16 md:py-24 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12 md:mb-16 space-y-3">
          <p className="text-[#b59461] text-xs font-bold uppercase tracking-[0.3em]">
            Real Results
          </p>
          <h2 className="text-white font-serif text-3xl md:text-4xl lg:text-5xl tracking-tight">
            What Our Clients Say
          </h2>
          <div className="flex items-center justify-center gap-1 pt-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-[#b59461] text-[#b59461]" />
            ))}
            <span className="text-zinc-400 text-sm ml-2">100% Verified Reviews</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="group relative bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 hover:border-[#b59461]/40 hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1"
            >
              {/* Quote icon */}
              <Quote className="h-6 w-6 text-[#b59461]/40 group-hover:text-[#b59461]/70 transition-colors duration-300" />

              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-[#b59461] text-[#b59461]" />
                ))}
              </div>

              {/* Review text */}
              <p className="text-zinc-300 text-sm leading-relaxed flex-1">
                "{review.text}"
              </p>

              {/* Footer */}
              <div className="pt-2 border-t border-white/10 space-y-1">
                <p className="text-white font-semibold text-sm">{review.name}</p>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest">{review.product}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#50540b]/30 text-[#b59461] text-[10px] font-bold uppercase tracking-wider border border-[#b59461]/20">
                  {review.tag}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
