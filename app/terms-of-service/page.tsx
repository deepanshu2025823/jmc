import { Header } from "@/components/header";
import { Scale, FileText, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Terms of Service | JMC Skin Secrets",
  description: "Terms and conditions for using JMC Skin Secrets online store.",
};

export default function TermsOfServicePage() {
  const lastUpdated = "March 2026";

  return (
    <main className="min-h-screen bg-white selection:bg-[#B59461]/20">
      <Header />
      
      <div className="bg-zinc-50 pt-32 pb-16 lg:pt-40 lg:pb-24 border-b border-zinc-100">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-4">
          <div className="flex justify-center mb-4">
            <Scale className="h-8 w-8 text-[#B59461]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-zinc-900 leading-tight">Terms of Service</h1>
          <p className="text-zinc-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Please read these terms carefully before engaging with our luxury skincare boutique.
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
              <CheckCircle className="h-5 w-5 text-[#B59461]" /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using the JMC Skin Secrets website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif font-bold text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
              <FileText className="h-5 w-5 text-[#B59461]" /> 2. Products and Pricing
            </h2>
            <p>
              We strive to display our luxury skincare formulations as accurately as possible. However, we do not guarantee that the color, texture, or detail of the product will be entirely accurate on your specific device monitor.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>All prices are displayed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.</li>
              <li>We reserve the right to modify prices or discontinue products without prior notice.</li>
              <li>We hold the right to refuse or cancel any order suspected of fraud or unauthorized resale.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif font-bold text-zinc-900 border-b border-zinc-100 pb-2">3. Intellectual Property</h2>
            <p>
              All content included on this site, such as brand formulations, text, graphics, logos, images, and software, is the exclusive property of JMC Skin Secrets and protected by international copyright laws. Unauthorized reproduction, copying, or redistribution of any content is strictly prohibited.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif font-bold text-zinc-900 border-b border-zinc-100 pb-2">4. Medical Disclaimer</h2>
            <p>
              The products offered by JMC Skin Secrets are for cosmetic purposes only. The information provided on this site is not intended to substitute for professional medical advice, diagnosis, or treatment. Always test products on a small patch of skin before full use. We are not liable for any allergic reactions or skin issues that may arise.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif font-bold text-zinc-900 border-b border-zinc-100 pb-2">5. Limitation of Liability</h2>
            <p>
              In no event shall JMC Skin Secrets, its directors, employees, or affiliates be liable for any direct, indirect, incidental, or consequential damages arising out of your use of our website or products.
            </p>
          </section>

        </div>

      </div>
    </main>
  );
}