import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Verified Customer",
    product: "JMC Lemon Facewash",
    rating: 5,
    text: "I started using your facewash since last week the results are amazing. My face is literally glowing, it has already improved my skin tone. I am super happy with your products — from packaging to quality, everything is just fab.",
    tag: "Glowing Skin",
    initial: "V",
  },
  {
    name: "Mrs. Bhandari",
    product: "JMC Lemon Facewash",
    rating: 5,
    text: "It's wonderful. It deeply cleanses my skin, leaving it feeling incredibly refreshed. My skin feels so soft and smooth after each wash. I loved how it gently exfoliates and reveals a brighter complexion. It is a complete game-changer for my skin care routine.",
    tag: "Deep Cleansing",
    initial: "B",
  },
  {
    name: "Ana Sachdev",
    product: "Lemon Facewash + Day & Night Cream",
    rating: 5,
    text: "Love this company! Having been delighted with the lemon facewash, I am now also loving the day and night face cream. I love the ethics and the products. Perfect.",
    tag: "Repeat Customer",
    initial: "A",
  },
  {
    name: "Verified Customer",
    product: "JMC Lemon Facewash",
    rating: 5,
    text: "Wash your face twice daily with JMC Lemon Facewash and see the difference — it helped me avoid pimples and dullness. The lemon helps detox skin naturally. Highly recommend for anyone looking for a natural glow.",
    tag: "Before & After",
    initial: "V",
  },
];

export function Reviews() {
  return (
    <section className="relative bg-white py-20 md:py-28 lg:py-32 overflow-hidden">
      {/* Decorative background accents */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#B59461] blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#50540b] blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14 md:mb-20 space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F9F6F0] border border-[#B59461]/20">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B59461] animate-pulse" />
            <p className="text-[#B59461] text-[10px] sm:text-xs font-black uppercase tracking-[0.3em]">
              Real Results
            </p>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-zinc-900 leading-[1.1]">
            What Our <span className="italic font-light text-[#50540b]">Clients</span> Say
          </h2>

          <div className="flex items-center justify-center gap-2.5 pt-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-[#B59461] text-[#B59461]" />
              ))}
            </div>
            <span className="text-zinc-500 text-xs sm:text-sm font-medium">
              <span className="font-bold text-zinc-900">4.9/5</span> from 1,200+ verified reviews
            </span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {reviews.map((review, index) => (
            <article
              key={index}
              className="group relative flex flex-col bg-white rounded-3xl p-7 md:p-8 border border-zinc-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(181,148,97,0.15)] hover:border-[#B59461]/30 hover:-translate-y-2 transition-all duration-500 ease-out"
            >
              {/* Decorative gold accent bar */}
              <div className="absolute top-0 left-7 md:left-8 right-7 md:right-8 h-[2px] bg-gradient-to-r from-transparent via-[#B59461] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Quote icon */}
              <div className="mb-5 flex items-center justify-between">
                <div className="h-10 w-10 rounded-full bg-[#F9F6F0] flex items-center justify-center group-hover:bg-[#B59461] transition-colors duration-500">
                  <Quote className="h-4 w-4 text-[#B59461] group-hover:text-white transition-colors duration-500" />
                </div>
                <div className="flex gap-0.5">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-[#B59461] text-[#B59461]" />
                  ))}
                </div>
              </div>

              {/* Review text */}
              <p className="text-zinc-700 text-sm md:text-[15px] leading-relaxed flex-1 mb-6">
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Footer */}
              <div className="pt-5 border-t border-zinc-100 flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#B59461] to-[#50540b] flex items-center justify-center text-white font-serif font-bold text-base shadow-md shrink-0">
                  {review.initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-zinc-900 truncate">{review.name}</p>
                  <p className="text-zinc-400 text-[10px] uppercase tracking-widest font-medium truncate mt-0.5">
                    {review.product}
                  </p>
                </div>
              </div>

              {/* Tag */}
              <span className="absolute top-7 md:top-8 right-7 md:right-8 hidden">
                {review.tag}
              </span>
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F9F6F0] text-[#B59461] text-[9px] font-black uppercase tracking-[0.15em] border border-[#B59461]/20">
                  {review.tag}
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Trust strip */}
        <div className="mt-16 md:mt-20 pt-10 border-t border-zinc-100">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["B", "A", "V", "M"].map((c, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full bg-gradient-to-br from-[#B59461] to-[#50540b] flex items-center justify-center text-white font-bold text-xs border-2 border-white"
                  >
                    {c}
                  </div>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-zinc-600">
                <span className="font-bold text-zinc-900">1,200+</span> happy clients
              </p>
            </div>
            <div className="hidden sm:block h-6 w-px bg-zinc-200" />
            <p className="text-xs sm:text-sm text-zinc-600">
              <span className="font-bold text-zinc-900">100%</span> verified purchases
            </p>
            <div className="hidden sm:block h-6 w-px bg-zinc-200" />
            <p className="text-xs sm:text-sm text-zinc-600">
              <span className="font-bold text-zinc-900">Dermatologist</span> recommended
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
