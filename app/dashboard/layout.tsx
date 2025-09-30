"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { Toaster } from "sonner"

interface User {
	id: string
	email: string
	name: string
	role: string
}

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const router = useRouter()
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		checkAuth()
	}, [])

	const checkAuth = async () => {
		try {
			const res = await fetch("/api/auth/check")
			const data = await res.json()

			if (data.authorized) {
				setUser(data.user)
			} else {
				// User is signed in with Google but not authorized in our database
				router.push("/login?error=unauthorized")
			}
		} catch (error) {
			router.push("/login")
		} finally {
			setLoading(false)
		}
	}

	if (loading) {
		return (
			<div style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh",
				fontSize: "18px"
			}}>
				Loading...
			</div>
		)
	}

	if (!user) {
		return null
	}

	return (
		<>
			<Toaster position="bottom-right" richColors />
			<Navbar
				userName={user.name || user.email || "User"}
				userRole={user.role}
			/>
			<main style={{ padding: "32px 20px", maxWidth: "1400px", margin: "0 auto" }}>
				{children}
			</main>
		</>
	)
}
