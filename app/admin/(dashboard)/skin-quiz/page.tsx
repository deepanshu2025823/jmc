import prisma from "@/lib/prisma";
import { Sparkles, Mail, Calendar, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

const fmtRelative = (d: Date) => {
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
};

export default async function SkinQuizSubmissionsPage() {
  const submissions = await prisma.skinQuizSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const productIds = Array.from(
    new Set(
      submissions.flatMap((s) =>
        Array.isArray(s.recommendedProductIds)
          ? (s.recommendedProductIds as string[])
          : []
      )
    )
  );
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p.name]));

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
          AI Skin Quiz Leads
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Every submission stored with the AI&apos;s skin profile + product recommendations. Great for follow-up email campaigns.
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 p-12 text-center text-zinc-500">
          <Sparkles className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
          <p className="font-serif text-lg text-zinc-700">
            No quiz submissions yet
          </p>
          <p className="text-sm mt-1">
            Submissions will appear here as customers complete the AI Skin Quiz.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => {
            const recs = Array.isArray(s.recommendedProductIds)
              ? (s.recommendedProductIds as string[])
              : [];
            const routine = Array.isArray(s.routine)
              ? (s.routine as string[])
              : [];
            const answers =
              typeof s.answers === "object" && s.answers !== null
                ? (s.answers as Record<string, string>)
                : {};

            return (
              <article
                key={s.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-4"
              >
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-zinc-900">
                      {s.name || "Anonymous"}
                    </p>
                    <a
                      href={`mailto:${s.email}`}
                      className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 mt-1"
                    >
                      <Mail className="h-3 w-3" /> {s.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F9F6F0] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#B59461]">
                      <Sparkles className="h-3 w-3" />
                      {s.skinType}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400">
                      <Calendar className="h-3 w-3" />
                      {fmtRelative(s.createdAt)}
                    </span>
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">
                      Answers
                    </p>
                    <ul className="space-y-1 text-zinc-700">
                      {Object.entries(answers).map(([k, v]) => (
                        <li key={k}>
                          <span className="text-zinc-400 capitalize">{k}:</span>{" "}
                          {v}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">
                      Routine
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-zinc-700">
                      {routine.map((step, i) => (
                        <li key={i} className="line-clamp-2">{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">
                      Recommended
                    </p>
                    {recs.length === 0 ? (
                      <p className="text-zinc-400 italic">No recommendations</p>
                    ) : (
                      <ul className="space-y-1">
                        {recs.map((id) => (
                          <li key={id} className="flex items-center gap-1">
                            <ShoppingBag className="h-3 w-3 text-[#B59461]" />
                            <span className="text-zinc-700 truncate">
                              {productMap.get(id) ?? id}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {s.expertAdvice && (
                  <p className="text-xs italic text-zinc-500 pt-3 border-t border-zinc-100">
                    &ldquo;{s.expertAdvice}&rdquo;
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
