import type { Metadata } from "next";
import { Jost, Playfair_Display } from "next/font/google"; 
import "./globals.css";
import { Toaster } from 'sonner';
import AuthProvider from "@/components/providers/auth-provider"; 
import { Footer } from "@/components/footer"; 

const jost = Jost({ 
  subsets: ["latin"], 
  variable: "--font-sans", 
  weight: ["300", "400", "500", "600", "700"]
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif", 
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"]
});

export const metadata: Metadata = {
  title: "JMC | Luxury Skincare Rituals",
  description: "Experience the art of skincare with JMC Secret Rituals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jost.variable} ${playfair.variable} font-sans antialiased bg-zinc-50 text-zinc-900`}>
        <AuthProvider>
          <Toaster 
            position="top-right" 
            richColors 
            closeButton
            toastOptions={{
              style: { borderRadius: '1rem' }, 
            }} 
          />
          
          <div className="flex flex-col min-h-screen">
            <main className="flex-1">
              {children}
            </main>
            
            <Footer />
          </div>

        </AuthProvider>
      </body>
    </html>
  );
}