"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import styles from "./Navbar.module.css"

interface NavbarProps {
	userName: string
	userRole: string
}

export default function Navbar({ userName, userRole }: NavbarProps) {
	const pathname = usePathname()

	const handleSignOut = async () => {
		await signOut({ callbackUrl: "/login" })
	}

	return (
		<nav className={styles.navbar}>
			<div className={styles.container}>
				<div className={styles.left}>
					<Link href="/dashboard" className={styles.logo}>
						🎵 Nyléns Setlists
					</Link>
					<div className={styles.links}>
						<Link
							href="/dashboard"
							className={pathname === "/dashboard" ? styles.linkActive : styles.link}
						>
							Setlists
						</Link>
						<Link
							href="/dashboard/songs"
							className={pathname === "/dashboard/songs" ? styles.linkActive : styles.link}
						>
							Låtar
						</Link>
						<Link
							href="/dashboard/categories"
							className={pathname === "/dashboard/categories" ? styles.linkActive : styles.link}
						>
							Kategorier
						</Link>
						{userRole === "admin" && (
							<Link
								href="/dashboard/users"
								className={pathname === "/dashboard/users" ? styles.linkActive : styles.link}
							>
								Användare
							</Link>
						)}
					</div>
				</div>
				<div className={styles.right}>
					<span className={styles.userName}>{userName}</span>
					<button onClick={handleSignOut} className="btn btn-small btn-secondary">
						Logga ut
					</button>
				</div>
			</div>
		</nav>
	)
}
