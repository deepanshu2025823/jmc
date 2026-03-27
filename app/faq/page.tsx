"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Sparkles, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// --- FAQ DATA ---
const faqData = [
  {
    category: "Orders & Shipping",
    items: [
      {
        q: "How long does delivery take?",
        a: "Standard delivery typically takes 2-4 business days for metropolitan areas and 4-7 business days for the rest of India. All our packages are dispatched using premium courier partners to ensure safe transit."
      },
      {
        q: "How can I track my order?",
        a: "Once your order is dispatched, you will receive an SMS and Email with your tracking link. You can also log into your JMC account, navigate to 'Order History', and view real-time tracking updates."
      },
      {
        q: "Do you ship internationally?",
        a: "Currently, our luxury skincare rituals are only available for delivery within India. We are working diligently to bring JMC Secret Rituals to our global audience soon."
      }
    ]
  },
  {
    category: "Products & Ingredients",
    items: [
      {
        q: "Are your products cruelty-free and vegan?",
        a: "Yes, absolutely. JMC Luxury Skincare is proudly 100% cruelty-free and strictly uses vegan ingredients. We believe in ethical beauty without compromising on premium quality."
      },
      {
        q: "Are the formulations safe for sensitive skin?",
        a: "Our products are dermatologically tested and formulated without harsh parabens or sulfates. However, since we use potent active ingredients like 24K Gold and pure botanicals, we always recommend doing a patch test before full application."
      },
      {
        q: "How long do the products last?",
        a: "Unopened products have a shelf life of 24 months. Once opened, we recommend using the rituals within 6 to 12 months for maximum efficacy. Please store them in a cool, dry place away from direct sunlight."
      }
    ]
  },
  {
    category: "Returns & Refunds",
    items: [
      {
        q: "What is your return policy?",
        a: "Due to the intimate nature of skincare, we only accept returns for products that are completely unopened, unused, and with the original tamper-proof seal intact within 7 days of delivery."
      },
      {
        q: "What if I receive a damaged product?",
        a: "In the rare event that your luxury package arrives damaged, please contact our concierge team at support@jmcluxury.com within 48 hours with unboxing photos, and we will arrange an immediate replacement."
      }
    ]
  },
  {
    category: "Payments",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We offer completely secure online payments via Razorpay (supporting all major Credit/Debit Cards, UPI, and NetBanking). We also offer a Cash on Delivery (COD) option for your convenience, subject to serviceability in your pin code."
      },
      {
        q: "Are my payment details secure?",
        a: "Yes. All online transactions are processed through bank-grade encryption via our payment partners. JMC does not store any of your credit card details directly on our servers."
      }
    ]
  }
];

export default function FAQPage() {
  // State to track which FAQ is open (storing the unique question string as ID)
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const toggleFaq = (question: string) => {
    setOpenFaq(openFaq === question ? null : question);
  };

  return (
    <main className="min-h-screen bg-[#fafafa] pb-32">
      <Header />

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 pt-32 md:pt-48 pb-12">
        <div className="text-center mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-zinc-100 mb-6 shadow-sm">
            <Sparkles className="h-3 w-3 text-[#B59461]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B59461]">Knowledge Base</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-zinc-900 mb-6">
            Frequently Asked <span className="italic font-light">Questions</span>
          </h1>
          <p className="text-zinc-500 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Everything you need to know about our luxury skincare rituals, shipping, and returns. Can't find the answer you're looking for? Reach out to our concierge team.
          </p>
        </div>

        {/* FAQ Accordion Layout */}
        <div className="space-y-16">
          {faqData.map((categoryGroup, index) => (
            <div key={index} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 150}ms` }}>
              {/* Category Header */}
              <h2 className="text-2xl font-serif font-bold text-zinc-900 mb-6 flex items-center gap-3">
                <span className="h-1 w-8 bg-[#B59461] rounded-full inline-block"></span>
                {categoryGroup.category}
              </h2>

              {/* Questions List */}
              <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                {categoryGroup.items.map((item, itemIndex) => {
                  const isOpen = openFaq === item.q;

                  return (
                    <div 
                      key={itemIndex} 
                      className={cn(
                        "border-b border-zinc-100 last:border-0 transition-colors",
                        isOpen ? "bg-[#F9F6F0]/30" : "hover:bg-zinc-50"
                      )}
                    >
                      <button
                        onClick={() => toggleFaq(item.q)}
                        className="w-full px-6 py-6 md:px-8 text-left flex items-start justify-between gap-4 outline-none"
                      >
                        <h3 className={cn(
                          "text-sm md:text-base font-bold pr-8 transition-colors",
                          isOpen ? "text-[#B59461]" : "text-zinc-900"
                        )}>
                          {item.q}
                        </h3>
                        <div className={cn(
                          "h-6 w-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
                          isOpen ? "bg-[#B59461] text-white rotate-180" : "bg-zinc-100 text-zinc-400"
                        )}>
                          {isOpen ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        </div>
                      </button>
                      
                      {/* Answer Content with Smooth Slide Down Transition trick via Max Height */}
                      <div 
                        className={cn(
                          "overflow-hidden transition-all duration-300 ease-in-out",
                          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        )}
                      >
                        <div className="px-6 md:px-8 pb-6 text-sm text-zinc-500 leading-relaxed max-w-3xl">
                          {item.a}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions CTA */}
        <div className="mt-24 bg-zinc-900 rounded-[2.5rem] p-10 md:p-16 text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[#B59461]/5"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
              <MessageCircleQuestion className="h-6 w-6 text-[#B59461]" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-white mb-4">Still have questions?</h2>
            <p className="text-zinc-400 max-w-md mx-auto mb-8 text-sm leading-relaxed">
              Our skincare experts and concierge team are available Monday through Friday to assist you with any inquiries.
            </p>
            <Link href="/contact">
              <Button className="h-14 px-10 bg-[#B59461] hover:bg-[#967a4f] text-white rounded-full font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl transition-all duration-300">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}