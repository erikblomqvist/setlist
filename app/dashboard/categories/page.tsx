"use client"

import { useEffect, useState, useRef } from "react"
import { toast } from "sonner"
import styles from "./categories.module.css"

interface Category {
	id: string
	name: string
	color: string
	_count: {
		setlists: number
	}
}

const CATEGORY_COLORS = [
	{ name: 'red', value: '#fee2e2', label: 'Röd' },
	{ name: 'orange', value: '#ffedd5', label: 'Orange' },
	{ name: 'yellow', value: '#fef3c7', label: 'Gul' },
	{ name: 'green', value: '#d1fae5', label: 'Grön' },
	{ name: 'teal', value: '#ccfbf1', label: 'Teal' },
	{ name: 'blue', value: '#dbeafe', label: 'Blå' },
	{ name: 'indigo', value: '#e0e7ff', label: 'Indigo' },
	{ name: 'purple', value: '#f3e8ff', label: 'Lila' },
	{ name: 'pink', value: '#fce7f3', label: 'Rosa' },
	{ name: 'gray', value: '#f3f4f6', label: 'Grå' },
]

export default function CategoriesPage() {
	const [categories, setCategories] = useState<Category[]>([])
	const [loading, setLoading] = useState(true)
	const [showForm, setShowForm] = useState(false)
	const [editingCategory, setEditingCategory] = useState<Category | null>(null)
	const [formData, setFormData] = useState({ name: "", color: "red" })
	const nameInputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		fetchCategories()
	}, [])

	// Focus on name input when form is shown
	useEffect(() => {
		if (showForm && nameInputRef.current) {
			nameInputRef.current.focus()
		}
	}, [showForm])

	const fetchCategories = async () => {
		try {
			const res = await fetch("/api/categories")
			if (res.ok) {
				const data = await res.json()
				setCategories(data)
			}
		} catch (error) {
			console.error("Error fetching categories:", error)
		} finally {
			setLoading(false)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		try {
			const url = editingCategory ? `/api/categories/${editingCategory.id}` : "/api/categories"
			const method = editingCategory ? "PUT" : "POST"

			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			})

			if (res.ok) {
				fetchCategories()

				if (editingCategory) {
					toast.success(`"${formData.name}" updated successfully!`)
					setShowForm(false)
					setEditingCategory(null)
				} else {
					toast.success(`"${formData.name}" added successfully!`)
				}

				setFormData({ name: "", color: "red" })

				if (!editingCategory && nameInputRef.current) {
					nameInputRef.current.focus()
				}
			} else {
				toast.error("Gick inte att spara kategorin. Försök igen.")
			}
		} catch (error) {
			console.error("Error saving category:", error)
			toast.error("Ett fel uppstod. Försök igen.")
		}
	}

	const handleEdit = (category: Category) => {
		setEditingCategory(category)
		setFormData({
			name: category.name,
			color: category.color,
		})
		setShowForm(true)
	}

	const handleDelete = async (id: string) => {
		const categoryToDelete = categories.find((c) => c.id === id)
		if (!confirm(`Är du säker på att du vill ta bort "${categoryToDelete?.name}"? Denna kategori kommer att tas bort från alla setlistor.`)) return

		try {
			const res = await fetch(`/api/categories/${id}`, {
				method: "DELETE",
			})

			if (res.ok) {
				setCategories(categories.filter((c) => c.id !== id))
				toast.success(`"${categoryToDelete?.name}" togs bort`)
			} else {
				toast.error("Gick inte att ta bort kategorin. Försök igen.")
			}
		} catch (error) {
			console.error("Error deleting category:", error)
			toast.error("Ett fel uppstod. Försök igen.")
		}
	}

	const handleCancel = () => {
		setShowForm(false)
		setEditingCategory(null)
		setFormData({ name: "", color: "red" })
	}

	const getColorValue = (colorName: string) => {
		return CATEGORY_COLORS.find(c => c.name === colorName)?.value || '#f3f4f6'
	}

	if (loading) {
		return <div className={styles.loading}>Laddar kategorier…</div>
	}

	return (
		<div>
			<div className={styles.header}>
				<h1 className={styles.title}>Kategorier</h1>
				{!showForm && (
					<button onClick={() => setShowForm(true)} className="btn btn-primary">
						+ Lägg till kategori
					</button>
				)}
			</div>

			{showForm && (
				<div className={styles.formCard}>
					<h2 className={styles.formTitle}>
						{editingCategory ? "Redigera kategori" : "Lägg till ny kategori"}
					</h2>
					<form onSubmit={handleSubmit}>
						<div className={styles.formRow}>
							<div className="form-group" style={{ flex: 1 }}>
								<label htmlFor="name" className="form-label">
									Namn *
								</label>
								<input
									ref={nameInputRef}
									id="name"
									type="text"
									className="form-input"
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									required
									placeholder="t.ex. Hollvin, Franses, Företag"
								/>
							</div>
						</div>

						<div className="form-group">
							<label className="form-label">Färg *</label>
							<div className={styles.colorGrid}>
								{CATEGORY_COLORS.map((color) => (
									<div
										key={color.name}
										className={`${styles.colorOption} ${formData.color === color.name ? styles.colorOptionSelected : ''
											}`}
										onClick={() => setFormData({ ...formData, color: color.name })}
									>
										<div
											className={styles.colorSwatch}
											style={{ backgroundColor: color.value }}
										/>
										<span className={styles.colorLabel}>{color.label}</span>
									</div>
								))}
							</div>
						</div>

						<div className={styles.formActions}>
							<button type="submit" className="btn btn-primary">
								{editingCategory ? "Uppdatera kategori" : "Lägg till kategori"}
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

			{categories.length === 0 ? (
				<div className={styles.empty}>
					<p>Inga kategorier ännu. Lägg till din första!</p>
				</div>
			) : (
				<div className={styles.grid}>
					{categories.map((category) => (
						<div key={category.id} className={styles.categoryCard}>
							<div className={styles.categoryHeader}>
								<div
									className={styles.categoryColor}
									style={{ backgroundColor: getColorValue(category.color) }}
								/>
								<h3 className={styles.categoryName}>{category.name}</h3>
							</div>
							<p className={styles.categoryCount}>
								{category._count.setlists} {category._count.setlists === 1 ? 'setlist' : 'setlists'}
							</p>
							<div className={styles.categoryActions}>
								<button
									onClick={() => handleEdit(category)}
									className="btn btn-secondary"
								>
									Redigera
								</button>
								<button
									onClick={() => handleDelete(category.id)}
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
