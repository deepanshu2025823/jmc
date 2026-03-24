import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { otpCache } from "@/lib/otp-store"; 

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" } 
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const userEmail = credentials.email.toLowerCase();

        let user = await prisma.user.findUnique({
          where: { email: userEmail }
        });

        if (credentials.password) {
          if (!user && userEmail === "mr.deepanshujoshi@gmail.com") {
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            user = await prisma.user.create({
              data: {
                email: userEmail,
                name: "Deepanshu Joshi",
                password: hashedPassword,
                role: "ADMIN"
              }
            });
          }

          if (!user || !user.password) throw new Error("No password set for this account");
          
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) throw new Error("Invalid admin password");

          return { id: user.id, email: user.email, name: user.name, role: user.role };
        }

        if (credentials.otp) {
          const cachedData = otpCache.get(userEmail);

          if (!cachedData) throw new Error("OTP not requested or expired");
          if (Date.now() > cachedData.expires) {
            otpCache.delete(userEmail); 
            throw new Error("OTP has expired");
          }
          if (cachedData.code !== credentials.otp) {
            throw new Error("Invalid verification code");
          }

          otpCache.delete(userEmail);

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: userEmail,
                name: userEmail.split('@')[0], 
                password: "", 
                role: "USER"
              }
            });
          }
          return { id: user.id, email: user.email, name: user.name, role: user.role };
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login", 
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };