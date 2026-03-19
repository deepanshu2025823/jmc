import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const userEmail = credentials.email.toLowerCase();

        let user = await prisma.user.findUnique({
          where: { email: userEmail }
        });

        if (!user && userEmail === "mr.deepanshujoshi@gmail.com") {
          const hashedPassword = await bcrypt.hash("1234567890", 10);
          user = await prisma.user.create({
            data: {
              email: userEmail,
              name: "Deepanshu Joshi",
              password: hashedPassword,
              role: "ADMIN"
            }
          });
        }

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) return null;

        return { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role: user.role 
        };
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
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login", 
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };