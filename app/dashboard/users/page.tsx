"use client"

import { useEffect, useState } from "react"
import styles from "./users.module.css"

interface User {
	id: string
	email: string
	name: string
	role: string
	createdAt: string
}

export default function UsersPage() {
	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(true)
	const [showForm, setShowForm] = useState(false)
	const [formData, setFormData] = useState({ email: "", name: "", role: "user" })
	const [error, setError] = useState("")
	const [success, setSuccess] = useState("")

	useEffect(() => {
		fetchUsers()
	}, [])

	const fetchUsers = async () => {
		try {
			const res = await fetch("/api/users")
			if (res.ok) {
				const data = await res.json()
				setUsers(data)
			}
		} catch (error) {
			console.error("Error fetching users:", error)
		} finally {
			setLoading(false)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError("")
		setSuccess("")

		try {
			const res = await fetch("/api/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			})

			const data = await res.json()

			if (res.ok) {
				setSuccess("Användare tillagd!")
				fetchUsers()
				setShowForm(false)
				setFormData({ email: "", name: "", role: "user" })
			} else {
				setError(data.error || "Failed to add user")
			}
		} catch (error) {
			setError("Error adding user")
		}
	}

	const handleCancel = () => {
		setShowForm(false)
		setFormData({ email: "", name: "", role: "user" })
		setError("")
	}

	if (loading) {
		return <div className={styles.loading}>Laddar användare…</div>
	}

	return (
		<div>
			<div className={styles.header}>
				<h1 className={styles.title}>Användare</h1>
				{!showForm && (
					<button onClick={() => setShowForm(true)} className="btn btn-primary">
						+ Lägg till bandmedlem
					</button>
				)}
			</div>

			{success && (
				<div className={styles.success}>{success}</div>
			)}

			{showForm && (
				<div className={styles.formCard}>
					<h2 className={styles.formTitle}>Lägg till bandmedlem</h2>
					<form onSubmit={handleSubmit}>
						<div className="form-group">
							<label htmlFor="name" className="form-label">
								Namn *
							</label>
							<input
								id="name"
								type="text"
								className="form-input"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								required
								placeholder="t.ex. Lennart"
							/>
						</div>
						<div className="form-group">
							<label htmlFor="email" className="form-label">
								Gmail-adress *
							</label>
							<input
								id="email"
								type="email"
								className="form-input"
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								required
								placeholder="t.ex. lennart@gmail.com"
							/>
						</div>
						<div className="form-group">
							<label htmlFor="role" className="form-label">
								Roll
							</label>
							<select
								id="role"
								className="form-select"
								value={formData.role}
								onChange={(e) =>
									setFormData({ ...formData, role: e.target.value })
								}
							>
								<option value="user">Vanlig användare</option>
								<option value="admin">Admin</option>
							</select>
							<small style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
								Admins kan hantera andra användare
							</small>
						</div>

						{error && <div className="error-message">{error}</div>}

						<div className={styles.formActions}>
							<button type="submit" className="btn btn-primary">
								Lägg till medlem
							</button>
							<button
								type="button"
								onClick={handleCancel}
								className="btn btn-secondary"
							>
								Avbryt
							</button>
						</div>
					</form>
				</div>
			)}

			<div className={styles.table}>
				<div className={styles.tableHeader}>
					<div className={styles.tableCell} style={{ flex: 2 }}>
						Namn
					</div>
					<div className={styles.tableCell} style={{ flex: 2 }}>
						Gmail-adress
					</div>
					<div className={styles.tableCell} style={{ flex: 1 }}>
						Roll
					</div>
					<div className={styles.tableCell} style={{ flex: 1 }}>
						Skapad
					</div>
				</div>
				{users.map((user) => (
					<div key={user.id} className={styles.tableRow}>
						<div className={styles.tableCell} style={{ flex: 2 }}>
							<strong>{user.name}</strong>
						</div>
						<div className={styles.tableCell} style={{ flex: 2 }}>
							{user.email}
						</div>
						<div className={styles.tableCell} style={{ flex: 1 }}>
							<span className={user.role === 'admin' ? styles.badgeAdmin : styles.badgeUser}>
								{user.role}
							</span>
						</div>
						<div className={styles.tableCell} style={{ flex: 1 }}>
							{new Date(user.createdAt).toLocaleDateString()}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
