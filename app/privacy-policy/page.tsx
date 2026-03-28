import { Header } from "@/components/header";
import Link from "next/link";
import { Shield, Lock, Eye, Mail } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | JMC Skin Secrets",
  description: "Learn how JMC Skin Secrets protects your personal information and privacy.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "March 2026";

  return (
    <main className="min-h-screen bg-white selection:bg-[#B59461]/20">
      <Header />
      
      <div className="bg-[#F9F6F0]/50 pt-32 pb-16 lg:pt-40 lg:pb-24 border-b border-[#B59461]/10">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-4">
          <div className="flex justify-center mb-4">
            <Shield className="h-8 w-8 text-[#B59461]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-zinc-900 leading-tight">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Your trust is our ultimate luxury. We are committed to protecting your personal information and your right to privacy.
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pt-4">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24 space-y-12">
        
        <div className="prose prose-zinc max-w-none text-sm leading-relaxed text-zinc-600 space-y-8">
          
          <section className="space-y-4">
            <h2 className="text-xl font-serif font-bold text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
              <Eye className="h-5 w-5 text-[#B59461]" /> 1. Information We Collect
            </h2>
            <p>
              When you visit JMC Skin Secrets, place an order, or subscribe to our newsletter, we collect certain information to provide you with a personalized luxury experience. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-zinc-800">Personal Data:</strong> Name, email address, shipping address, billing address, and phone number.</li>
              <li><strong className="text-zinc-800">Account Data:</strong> Encrypted passwords and purchase history.</li>
              <li><strong className="text-zinc-800">Device Data:</strong> IP address, browser type, and interactions with our website (collected automatically via cookies).</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif font-bold text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
              <Lock className="h-5 w-5 text-[#B59461]" /> 2. How We Use Your Data
            </h2>
            <p>We use your information exclusively to elevate your JMC experience:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To securely process and fulfill your skincare orders.</li>
              <li>To communicate with you regarding order updates, tracking, and concierge support.</li>
              <li>To send exclusive VIP offers and new ritual launches (only if you have opted in).</li>
              <li>To prevent fraudulent transactions and protect our community.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif font-bold text-zinc-900 border-b border-zinc-100 pb-2">3. Data Sharing & Security</h2>
            <p>
              We treat your data with the same care as our formulations. <strong className="text-zinc-800">We do not sell, rent, or trade your personal information.</strong> 
            </p>
            <p>
              We only share necessary information with trusted third-party partners (like payment gateways such as Razorpay and logistics partners) strictly to fulfill your orders. Our website utilizes advanced SSL encryption to ensure your payment details are never compromised.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif font-bold text-zinc-900 border-b border-zinc-100 pb-2">4. Your Rights</h2>
            <p>
              You have full control over your data. You may access, update, or request the deletion of your personal account information at any time. If you wish to unsubscribe from our marketing communications, you can do so by clicking the "Unsubscribe" link in any email we send.
            </p>
          </section>

        </div>

        <div className="bg-[#F9F6F0]/50 p-8 rounded-3xl border border-[#B59461]/20 mt-12 text-center space-y-4">
          <Mail className="h-6 w-6 text-[#B59461] mx-auto" />
          <h3 className="font-serif text-lg font-bold text-zinc-900">Privacy Inquiries</h3>
          <p className="text-sm text-zinc-600">If you have any questions about our privacy practices, please contact our concierge.</p>
          <a href="mailto:mr.deepanshujoshi@gmail.com" className="inline-block mt-2 text-xs font-bold uppercase tracking-widest text-[#B59461] hover:text-zinc-900 transition-colors">
            mr.deepanshujoshi@gmail.com
          </a>
        </div>

      </div>
    </main>
  );
}