"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { minToHours } from "@/app/utils/min-to-hours"
import styles from "./dashboard.module.css"

interface Category {
	id: string
	name: string
	color: string
}

interface Setlist {
	id: string
	name: string
	numberOfSets: number
	date: string | null
	createdAt: string
	updatedAt: string
	user: {
		name: string
	}
	songs: any[]
	categories: Category[]
}

const CATEGORY_COLORS: { [key: string]: string } = {
	red: '#fee2e2',
	orange: '#ffedd5',
	yellow: '#fef3c7',
	green: '#d1fae5',
	teal: '#ccfbf1',
	blue: '#dbeafe',
	indigo: '#e0e7ff',
	purple: '#f3e8ff',
	pink: '#fce7f3',
	gray: '#f3f4f6',
}

type SortOption = 'date-desc' | 'date-asc' | 'name' | 'updated'

export default function DashboardPage() {
	const [setlists, setSetlists] = useState<Setlist[]>([])
	const [categories, setCategories] = useState<Category[]>([])
	const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
	const [sortBy, setSortBy] = useState<SortOption>('updated')
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchSetlists()
		fetchCategories()
	}, [])

	const fetchSetlists = async () => {
		try {
			const res = await fetch("/api/setlists")
			if (res.ok) {
				const data = await res.json()
				setSetlists(data)
			}
		} catch (error) {
			console.error("Error fetching setlists:", error)
		} finally {
			setLoading(false)
		}
	}

	const fetchCategories = async () => {
		try {
			const res = await fetch("/api/categories")
			if (res.ok) {
				const data = await res.json()
				setCategories(data)
			}
		} catch (error) {
			console.error("Error fetching categories:", error)
		}
	}

	const toggleCategory = (categoryId: string) => {
		setSelectedCategoryIds(prev =>
			prev.includes(categoryId)
				? prev.filter(id => id !== categoryId)
				: [...prev, categoryId]
		)
	}

	const filteredAndSortedSetlists = (() => {
		// First filter by categories
		const filtered = selectedCategoryIds.length === 0
			? setlists
			: setlists.filter(setlist =>
				setlist.categories.some(cat => selectedCategoryIds.includes(cat.id))
			)

		// Then sort
		const sorted = [...filtered].sort((a, b) => {
			switch (sortBy) {
				case 'date-desc':
					if (!a.date && !b.date) return 0
					if (!a.date) return 1
					if (!b.date) return -1
					return new Date(b.date).getTime() - new Date(a.date).getTime()
				case 'date-asc':
					if (!a.date && !b.date) return 0
					if (!a.date) return 1
					if (!b.date) return -1
					return new Date(a.date).getTime() - new Date(b.date).getTime()
				case 'name':
					return a.name.localeCompare(b.name)
				case 'updated':
				default:
					return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
			}
		})

		return sorted
	})()

	const getColorValue = (colorName: string) => {
		return CATEGORY_COLORS[colorName] || '#f3f4f6'
	}

	const formatDate = (dateString: string | null) => {
		if (!dateString) return null
		const date = new Date(dateString)
		return date.toLocaleDateString('sv-SE', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		})
	}

	const handleDelete = async (id: string) => {
		if (!confirm("Är du säker på att du vill ta bort denna setlist?")) return

		try {
			const res = await fetch(`/api/setlists/${id}`, {
				method: "DELETE",
			})

			if (res.ok) {
				setSetlists(setlists.filter((s) => s.id !== id))
			}
		} catch (error) {
			console.error("Error deleting setlist:", error)
		}
	}

	if (loading) {
		return <div className={styles.loading}>Laddar setlists…</div>
	}

	return (
		<div>
			<div className={styles.header}>
				<h1 className={styles.title}>Setlists</h1>
				<div className={styles.headerActions}>
					<select
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value as SortOption)}
						className="form-select"
						style={{ width: 'auto' }}
					>
						<option value="updated">Nyligen uppdaterade</option>
						<option value="date-desc">Datum (nyaste)</option>
						<option value="date-asc">Datum (äldsta)</option>
						<option value="name">Namn (A-Ö)</option>
					</select>
					<Link href="/dashboard/setlists/new" className="btn btn-primary">
						+ Ny setlist
					</Link>
				</div>
			</div>

			{categories.length > 0 && (
				<div className={styles.filterSection}>
					<h3 className={styles.filterTitle}>Filtrera efter kategori:</h3>
					<div className={styles.filterChips}>
						{categories.map((category) => (
							<button
								key={category.id}
								className={`${styles.filterChip} ${selectedCategoryIds.includes(category.id) ? styles.filterChipActive : ''
									}`}
								onClick={() => toggleCategory(category.id)}
							>
								<div
									className={styles.chipColor}
									style={{ backgroundColor: getColorValue(category.color) }}
								/>
								{category.name}
							</button>
						))}
						{selectedCategoryIds.length > 0 && (
							<button
								className={styles.filterClear}
								onClick={() => setSelectedCategoryIds([])}
							>
								Rensa filter
							</button>
						)}
					</div>
				</div>
			)}

			{filteredAndSortedSetlists.length === 0 ? (
				setlists.length === 0 ? (
					<div className={styles.empty}>
						<p>Inga setlists ännu. Skapa din första!</p>
					</div>
				) : (
					<div className={styles.empty}>
						<p>Inga setlists matchar de valda kategorierna.</p>
					</div>
				)
			) : (
				<div className={styles.grid}>
					{filteredAndSortedSetlists.map((setlist) => (
						<div key={setlist.id} className={styles.card}>
							<div className={styles.cardHeader}>
								<h3 className={styles.cardTitle}>
									<Link href={`/dashboard/setlists/${setlist.id}`}>{setlist.name}</Link>
								</h3>
								<span className={styles.badge}>{setlist.numberOfSets} set</span>
							</div>
							{setlist.categories.length > 0 && (
								<div className={styles.cardCategories}>
									{setlist.categories.map((category) => (
										<span
											key={category.id}
											className={styles.categoryBadge}
											style={{ backgroundColor: getColorValue(category.color) }}
										>
											{category.name}
										</span>
									))}
								</div>
							)}
							<div className={styles.cardMeta}>
								{setlist.date && (
									<span className={styles.date}><span className="material-icons">calendar_month</span> {formatDate(setlist.date)}</span>
								)}
								<span>Skapad av {setlist.user.name}</span>
								<span>{setlist.songs.length} låtar ({minToHours(setlist.songs.length * 3)})</span>
							</div>
							<div className={styles.cardActions}>
								<Link
									href={`/dashboard/setlists/${setlist.id}`}
									className="btn btn-primary"
								>
									Visa
								</Link>
								<Link
									href={`/dashboard/setlists/${setlist.id}/edit`}
									className="btn btn-secondary"
								>
									Redigera
								</Link>
								<button
									onClick={() => handleDelete(setlist.id)}
									className="btn btn-danger"
								>
									Ta bort
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
