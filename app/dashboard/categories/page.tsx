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
	{ name: 'red', value: '#fee2e2', label: 'Red' },
	{ name: 'orange', value: '#ffedd5', label: 'Orange' },
	{ name: 'yellow', value: '#fef3c7', label: 'Yellow' },
	{ name: 'green', value: '#d1fae5', label: 'Green' },
	{ name: 'teal', value: '#ccfbf1', label: 'Teal' },
	{ name: 'blue', value: '#dbeafe', label: 'Blue' },
	{ name: 'indigo', value: '#e0e7ff', label: 'Indigo' },
	{ name: 'purple', value: '#f3e8ff', label: 'Purple' },
	{ name: 'pink', value: '#fce7f3', label: 'Pink' },
	{ name: 'gray', value: '#f3f4f6', label: 'Gray' },
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
				toast.error("Failed to save category. Please try again.")
			}
		} catch (error) {
			console.error("Error saving category:", error)
			toast.error("An error occurred. Please try again.")
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
		if (!confirm(`Are you sure you want to delete "${categoryToDelete?.name}"? This will remove it from all setlists.`)) return

		try {
			const res = await fetch(`/api/categories/${id}`, {
				method: "DELETE",
			})

			if (res.ok) {
				setCategories(categories.filter((c) => c.id !== id))
				toast.success(`"${categoryToDelete?.name}" deleted successfully!`)
			} else {
				toast.error("Failed to delete category. Please try again.")
			}
		} catch (error) {
			console.error("Error deleting category:", error)
			toast.error("An error occurred. Please try again.")
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
		return <div className={styles.loading}>Loading categories...</div>
	}

	return (
		<div>
			<div className={styles.header}>
				<h1 className={styles.title}>Categories</h1>
				{!showForm && (
					<button onClick={() => setShowForm(true)} className="btn btn-primary">
						+ Add Category
					</button>
				)}
			</div>

			{showForm && (
				<div className={styles.formCard}>
					<h2 className={styles.formTitle}>
						{editingCategory ? "Edit Category" : "Add New Category"}
					</h2>
					<form onSubmit={handleSubmit}>
						<div className={styles.formRow}>
							<div className="form-group" style={{ flex: 1 }}>
								<label htmlFor="name" className="form-label">
									Name *
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
									placeholder="e.g., Summer Tour, Wedding, Corporate"
								/>
							</div>
						</div>

						<div className="form-group">
							<label className="form-label">Color *</label>
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
								{editingCategory ? "Update Category" : "Add Category"}
							</button>
							<button
								type="button"
								onClick={handleCancel}
								className="btn btn-secondary"
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			)}

			{categories.length === 0 ? (
				<div className={styles.empty}>
					<p>No categories yet. Add your first one!</p>
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
									className="btn btn-small btn-secondary"
								>
									Edit
								</button>
								<button
									onClick={() => handleDelete(category.id)}
									className="btn btn-small btn-danger"
								>
									Delete
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
