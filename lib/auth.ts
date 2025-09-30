import { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

export const authConfig: NextAuthConfig = {
	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		})
	],
	callbacks: {
		async jwt({ token, user, account }) {
			// Only set user info on initial sign in
			if (user && account?.provider === "google") {
				token.email = user.email
				token.name = user.name
			}
			return token
		},
		async session({ session, token }) {
			if (session?.user && token?.email) {
				session.user.email = token.email as string
				session.user.name = token.name as string
			}
			return session
		},
		authorized: async ({ auth, request }) => {
			const isLoggedIn = !!auth?.user
			const isOnDashboard = request.nextUrl.pathname.startsWith('/dashboard')
			const isOnLogin = request.nextUrl.pathname.startsWith('/login')

			if (isOnDashboard) {
				if (isLoggedIn) return true
				return false // Redirect unauthenticated users to login page
			} else if (isLoggedIn && isOnLogin) {
				return Response.redirect(new URL('/dashboard', request.nextUrl))
			}

			return true
		},
	},
	pages: {
		signIn: '/login',
	},
	session: {
		strategy: "jwt"
	}
}
