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
        if (!credentials?.email || !credentials?.password) return null;

        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user && credentials.email === "mr.deepanshujoshi@gmail.com") {
          const hashedPassword = await bcrypt.hash("1234567890", 10);
          user = await prisma.user.create({
            data: {
              email: "mr.deepanshujoshi@gmail.com",
              name: "Deepanshu Joshi",
              password: hashedPassword,
              role: "ADMIN"
            }
          });
        }

        if (!user) throw new Error("User not found");

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) throw new Error("Invalid password");

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      }
    })
  ],
  pages: {
    signIn: "/login", 
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };