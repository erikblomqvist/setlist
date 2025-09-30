"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import styles from "./new.module.css"

interface Category {
  id: string
  name: string
  color: string
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

export default function NewSetlistPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ name: "", numberOfSets: 1 })
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCategories()
  }, [])

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

  const getColorValue = (colorName: string) => {
    return CATEGORY_COLORS[colorName] || '#f3f4f6'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/setlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          categoryIds: selectedCategoryIds
        }),
      })

      if (res.ok) {
        const setlist = await res.json()
        router.push(`/dashboard/setlists/${setlist.id}/edit`)
      } else {
        setError("Failed to create setlist")
      }
    } catch (error) {
      setError("Error creating setlist")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create New Setlist</h1>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Setlist Name *
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
              placeholder="e.g., Summer Tour 2024"
            />
          </div>

          <div className="form-group">
            <label htmlFor="numberOfSets" className="form-label">
              Number of Sets *
            </label>
            <input
              id="numberOfSets"
              type="number"
              className="form-input"
              value={formData.numberOfSets}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  numberOfSets: parseInt(e.target.value) || 1,
                })
              }
              required
              min="1"
              max="10"
            />
          </div>

          {categories.length > 0 && (
            <div className="form-group">
              <label className="form-label">Categories (optional)</label>
              <div className={styles.categoryGrid}>
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`${styles.categoryOption} ${
                      selectedCategoryIds.includes(category.id) ? styles.categoryOptionSelected : ''
                    }`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div
                      className={styles.categorySwatch}
                      style={{ backgroundColor: getColorValue(category.color) }}
                    />
                    <span className={styles.categoryLabel}>{category.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className={styles.actions}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Setlist"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
