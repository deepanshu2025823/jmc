import Link from "next/link";
import { Star, ShieldCheck, MessageSquare } from "lucide-react";
import {
  getProductReviews,
  getReviewStats,
  getReviewEligibility,
} from "@/actions/review";
import { ReviewForm } from "@/components/review-form";
import { cn } from "@/lib/utils";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function StarRow({
  rating,
  size = 4,
}: {
  rating: number;
  size?: 3 | 4 | 5;
}) {
  const sizeMap = { 3: "h-3 w-3", 4: "h-4 w-4", 5: "h-5 w-5" };
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            sizeMap[size],
            n <= Math.round(rating)
              ? "fill-[#B59461] text-[#B59461]"
              : "text-zinc-200"
          )}
        />
      ))}
    </div>
  );
}

function initialOf(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export async function ProductReviews({ productId }: { productId: string }) {
  const [stats, reviews, eligibility] = await Promise.all([
    getReviewStats(productId),
    getProductReviews(productId),
    getReviewEligibility(productId),
  ]);

  return (
    <section className="mt-16 lg:mt-24 border-t border-zinc-100 pt-12 lg:pt-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Summary panel */}
        <aside className="lg:col-span-4 space-y-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B59461]">
              Reviews
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-zinc-900 mt-2">
              What clients are saying
            </h2>
          </div>

          <div className="rounded-2xl bg-[#F9F6F0] border border-[#B59461]/15 p-6 space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-serif font-black text-zinc-900">
                {stats.average.toFixed(1)}
              </span>
              <span className="text-sm text-zinc-500 font-medium">/ 5</span>
            </div>
            <StarRow rating={stats.average} size={5} />
            <p className="text-xs text-zinc-600 font-medium">
              Based on{" "}
              <span className="font-bold text-zinc-900">{stats.count}</span>{" "}
              {stats.count === 1 ? "review" : "reviews"}
            </p>

            <div className="space-y-2 pt-2">
              {stats.distribution.map((d) => (
                <div key={d.stars} className="flex items-center gap-2 text-xs">
                  <span className="w-6 font-bold text-zinc-700">{d.stars}★</span>
                  <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#B59461] rounded-full transition-all"
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-zinc-500 font-medium">
                    {d.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {eligibility.canReview && (
            <ReviewForm
              productId={productId}
              hasPurchased={eligibility.hasPurchased}
            />
          )}

          {eligibility.reason === "not_logged_in" && (
            <div className="rounded-xl border border-zinc-200 bg-white p-5 text-center space-y-3">
              <p className="text-sm font-medium text-zinc-700">
                Log in to share your review
              </p>
              <Link
                href={`/login?callbackUrl=/product/${productId}`}
                className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-6 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black"
              >
                Log in to review
              </Link>
            </div>
          )}

          {eligibility.reason === "already_reviewed" && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
              <p className="text-sm font-bold text-emerald-900">
                You&apos;ve already reviewed this product
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                Thanks for sharing your experience!
              </p>
            </div>
          )}
        </aside>

        {/* Reviews list */}
        <div className="lg:col-span-8 space-y-5">
          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
              <MessageSquare className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
              <p className="font-serif text-lg text-zinc-700">
                Be the first to review
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                Your insight helps other clients pick the right ritual.
              </p>
            </div>
          ) : (
            reviews.map((r) => (
              <article
                key={r.id}
                className="rounded-2xl border border-zinc-100 bg-white p-5 sm:p-6 shadow-sm"
              >
                <header className="flex items-start gap-4">
                  <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-[#B59461] to-[#50540b] flex items-center justify-center text-white font-bold text-sm">
                    {initialOf(r.userName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-zinc-900 text-sm">
                        {r.userName}
                      </p>
                      {r.isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-inset ring-emerald-200">
                          <ShieldCheck className="h-3 w-3" />
                          Verified buyer
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRow rating={r.rating} size={3} />
                      <span className="text-[11px] text-zinc-400">
                        {fmtDate(r.createdAt)}
                      </span>
                    </div>
                  </div>
                </header>

                {r.title && (
                  <h3 className="mt-4 font-serif text-lg text-zinc-900">
                    {r.title}
                  </h3>
                )}
                <p className="mt-2 text-sm leading-relaxed text-zinc-700 whitespace-pre-line">
                  {r.body}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
