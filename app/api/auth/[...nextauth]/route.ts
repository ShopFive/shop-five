import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Whitelist of allowed emails
const ALLOWED_EMAILS = [
  'info@shop5.qa',        // ← غيّر هذا لإيميلك!
  'shop.qtr5@gmail.com',
  'remekas8@gmail.com',
];

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  
  callbacks: {
    async signIn({ user }) {
      const isAllowed = ALLOWED_EMAILS.includes(user.email || '');
      return isAllowed;
    },
    
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub || '';
      }
      return session;
    },
  },
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };