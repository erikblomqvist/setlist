"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import styles from "./dashboard.module.css"

interface Setlist {
  id: string
  name: string
  numberOfSets: number
  createdAt: string
  updatedAt: string
  user: {
    name: string
  }
  songs: any[]
}

export default function DashboardPage() {
  const [setlists, setSetlists] = useState<Setlist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSetlists()
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this setlist?")) return

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
    return <div className={styles.loading}>Loading setlists...</div>
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Setlists</h1>
        <Link href="/dashboard/setlists/new" className="btn btn-primary">
          + New Setlist
        </Link>
      </div>

      {setlists.length === 0 ? (
        <div className={styles.empty}>
          <p>No setlists yet. Create your first one!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {setlists.map((setlist) => (
            <div key={setlist.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{setlist.name}</h3>
                <span className={styles.badge}>{setlist.numberOfSets} {setlist.numberOfSets === 1 ? 'set' : 'sets'}</span>
              </div>
              <div className={styles.cardMeta}>
                <span>Created by {setlist.user.name}</span>
                <span>{setlist.songs.length} songs</span>
              </div>
              <div className={styles.cardActions}>
                <Link
                  href={`/dashboard/setlists/${setlist.id}`}
                  className="btn btn-small btn-primary"
                >
                  View
                </Link>
                <Link
                  href={`/dashboard/setlists/${setlist.id}/edit`}
                  className="btn btn-small btn-secondary"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(setlist.id)}
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
