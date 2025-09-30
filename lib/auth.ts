import { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import { prisma } from "./prisma"

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists in our database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          console.log('Sign in attempt for:', user.email)
          console.log('User found in database:', !!existingUser)
          
          if (!existingUser) {
            console.log('User not found in database, denying access')
            return false
          }

          console.log('User found, allowing access')
          return true
        } catch (error) {
          console.error('Database error during sign in:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user && account?.provider === "google") {
        // Get user from database to get their role
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })

        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).role = token.role
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt"
  }
}
