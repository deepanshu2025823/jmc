"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, Clock, Send, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { submitContactForm } from "@/actions/contact"; // Import the server action

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const res = await submitContactForm(data);
    
    setLoading(false);

    if (res.success) {
      toast.success("Message sent successfully! Check your email for confirmation.");
      (e.target as HTMLFormElement).reset(); // Clear form
    } else {
      toast.error(res.error || "Failed to send message. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] pb-32">
      <Header />

      <div className="max-w-7xl mx-auto px-6 pt-32 md:pt-48 pb-12">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-zinc-100 mb-6 shadow-sm">
            <Sparkles className="h-3 w-3 text-[#B59461]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B59461]">We are here for you</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-zinc-900 mb-6">
            Get in <span className="italic font-light">Touch</span>
          </h1>
          <p className="text-zinc-500 text-sm md:text-base leading-relaxed">
            Have a question about our secret rituals, your recent order, or need personalized skincare advice? Our luxury concierge team is ready to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          <div className="lg:col-span-5 space-y-8">
            <h2 className="text-2xl font-serif font-bold text-zinc-900 mb-8 border-b border-zinc-200 pb-4">Contact Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-[#F9F6F0] flex items-center justify-center shrink-0 border border-[#B59461]/20">
                  <MapPin className="h-5 w-5 text-[#B59461]" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Our Boutique</p>
                  <p className="text-sm font-bold text-zinc-900 leading-relaxed">
                    JMC Luxury Skincare<br />
                    Phase 1, DLF Cyber City,<br />
                    New Delhi, 110001, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-[#F9F6F0] flex items-center justify-center shrink-0 border border-[#B59461]/20">
                  <Mail className="h-5 w-5 text-[#B59461]" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Email Us</p>
                  <p className="text-sm font-bold text-zinc-900">support@jmcluxury.com</p>
                  <p className="text-xs text-zinc-500 mt-0.5">We reply within 24 hours.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-[#F9F6F0] flex items-center justify-center shrink-0 border border-[#B59461]/20">
                  <Phone className="h-5 w-5 text-[#B59461]" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Call Us</p>
                  <p className="text-sm font-bold text-zinc-900">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-[#F9F6F0] flex items-center justify-center shrink-0 border border-[#B59461]/20">
                  <Clock className="h-5 w-5 text-[#B59461]" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Operating Hours</p>
                  <p className="text-sm font-bold text-zinc-900">Monday - Friday</p>
                  <p className="text-xs text-zinc-500 mt-0.5">10:00 AM - 7:00 PM (IST)</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-3xl p-8 text-white mt-12 shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 opacity-10">
                <Sparkles className="h-40 w-40" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-4 relative z-10">Need Quick Answers?</h3>
              <p className="text-sm text-zinc-400 mb-6 relative z-10 leading-relaxed">
                Before reaching out, you might find what you're looking for in our frequently asked questions.
              </p>
              <Link href="/faq" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-[#B59461] transition-colors relative z-10">
                Visit FAQ <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-zinc-100">
              <h2 className="text-2xl font-serif font-bold text-zinc-900 mb-2">Send a Message</h2>
              <p className="text-sm text-zinc-500 mb-10">Fill out the form below and we'll get back to you securely.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">First Name</label>
                    <Input name="firstName" required placeholder="Jane" className="rounded-2xl h-14 border-zinc-200 bg-zinc-50/50 focus:border-[#B59461] focus:ring-[#B59461]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Last Name</label>
                    <Input name="lastName" required placeholder="Doe" className="rounded-2xl h-14 border-zinc-200 bg-zinc-50/50 focus:border-[#B59461] focus:ring-[#B59461]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Email Address</label>
                  <Input type="email" name="email" required placeholder="jane@example.com" className="rounded-2xl h-14 border-zinc-200 bg-zinc-50/50 focus:border-[#B59461] focus:ring-[#B59461]" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Subject</label>
                  <select 
                    name="subject" 
                    required 
                    defaultValue=""
                    className="w-full rounded-2xl h-14 border-zinc-200 bg-zinc-50/50 px-4 text-sm outline-none focus:border-[#B59461] focus:ring-1 focus:ring-[#B59461] transition-all text-zinc-900"
                  >
                    <option value="" disabled>Select an inquiry type</option>
                    <option value="order">Order Tracking & Issues</option>
                    <option value="product">Product Advice & Consultations</option>
                    <option value="returns">Returns & Refunds</option>
                    <option value="partnership">Business & Partnerships</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Your Message</label>
                  <textarea 
                    name="message" 
                    required 
                    placeholder="How can we help you today?" 
                    rows={5}
                    className="w-full rounded-3xl border-zinc-200 bg-zinc-50/50 p-5 text-sm outline-none focus:border-[#B59461] focus:ring-1 focus:ring-[#B59461] transition-all resize-none text-zinc-900"
                  />
                </div>

                <Button 
                  disabled={loading}
                  type="submit" 
                  className="w-full h-16 bg-zinc-900 hover:bg-[#B59461] text-white rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-2xl mt-4 transition-all duration-500"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">Processing <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div></span>
                  ) : (
                    <span className="flex items-center gap-2">Send Message <Send className="h-4 w-4" /></span>
                  )}
                </Button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}