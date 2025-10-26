import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Whitelist of allowed emails
const ALLOWED_EMAILS = [
  'info@shop5.qa',        // ← غيّر هذا لإيميلك!
  'shop.qtr5@gmail.com',
  'Remekas8@gmail.com',
  // Add more emails here
];

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if email is in whitelist
      const isAllowed = ALLOWED_EMAILS.includes(user.email || '');
      
      if (!isAllowed) {
        // Reject sign in
        return false;
      }
      
      // Allow sign in
      return true;
    },
    
    async session({ session, token }) {
      // Add user info to session
      if (session.user) {
        session.user.id = token.sub || '';
      }
      return session;
    },
  },
  
  pages: {
    signIn: '/login',
    error: '/login', // Error page
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };