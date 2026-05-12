"use client";

import { useState, useTransition } from "react";
import { Star, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createReview } from "@/actions/review";
import { cn } from "@/lib/utils";

interface Props {
  productId: string;
  hasPurchased: boolean;
}

export function ReviewForm({ productId, hasPurchased }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error("Please pick a star rating");
      return;
    }
    if (body.trim().length < 10) {
      toast.error("Review should be at least 10 characters");
      return;
    }

    startTransition(async () => {
      const res = await createReview(productId, { rating, title, body });
      if (!res.success) {
        toast.error(res.error || "Failed to submit review");
        return;
      }
      toast.success("Thanks for your review!");
      setSubmitted(true);
    });
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="h-9 w-9 shrink-0 rounded-full bg-emerald-600 flex items-center justify-center">
          <Check className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-900">Review submitted</p>
          <p className="text-xs text-emerald-700">
            It will appear shortly. Thanks for sharing your experience!
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"
    >
      <div>
        <h3 className="font-bold text-zinc-900 text-base">Write a review</h3>
        <p className="text-xs text-zinc-500 mt-1">
          Share how this product worked for you
          {hasPurchased && (
            <span className="ml-1 inline-flex items-center gap-1 text-emerald-700 font-semibold">
              · Verified buyer
            </span>
          )}
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-zinc-700">
          Your rating
        </Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = (hover || rating) >= n;
            return (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                className="p-1 transition-transform hover:scale-110"
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
              >
                <Star
                  className={cn(
                    "h-7 w-7 transition-colors",
                    filled
                      ? "fill-[#B59461] text-[#B59461]"
                      : "text-zinc-300"
                  )}
                />
              </button>
            );
          })}
          {rating > 0 && (
            <span className="ml-2 text-xs font-bold text-zinc-700">
              {rating}/5
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-zinc-700">
          Title (optional)
        </Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={120}
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-zinc-700">
          Review
        </Label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell others what you loved (or didn't)…"
          rows={5}
          maxLength={2000}
          className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 resize-y"
        />
        <p className="text-[10px] text-zinc-400 text-right">
          {body.length}/2000
        </p>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full h-11 bg-zinc-900 text-white font-bold uppercase text-xs tracking-widest hover:bg-black"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…
          </>
        ) : (
          "Submit review"
        )}
      </Button>
    </form>
  );
}
