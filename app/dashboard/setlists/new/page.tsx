"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./new.module.css"

export default function NewSetlistPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ name: "", numberOfSets: 1 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/setlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
