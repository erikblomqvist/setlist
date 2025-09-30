"use client"

import { useEffect, useState, useRef } from "react"
import { toast } from "sonner"
import styles from "./songs.module.css"

interface Song {
  id: string
  title: string
  key: string | null
  tempo: string | null
  user: {
    name: string
  }
}

type SortField = 'title' | 'key' | 'tempo' | 'user'
type SortDirection = 'asc' | 'desc'

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [formData, setFormData] = useState({ title: "", key: "", tempo: "" })
  const [sortField, setSortField] = useState<SortField>('title')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchSongs()
  }, [])

  // Focus on title input when form is shown
  useEffect(() => {
    if (showForm && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [showForm])

  const fetchSongs = async () => {
    try {
      const res = await fetch("/api/songs")
      if (res.ok) {
        const data = await res.json()
        setSongs(data)
      }
    } catch (error) {
      console.error("Error fetching songs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingSong ? `/api/songs/${editingSong.id}` : "/api/songs"
      const method = editingSong ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        fetchSongs()
        
        if (editingSong) {
          // If editing, close the form and show success message
          toast.success(`"${formData.title}" updated successfully!`)
          setShowForm(false)
          setEditingSong(null)
        } else {
          // If adding, show success message and keep form open
          toast.success(`"${formData.title}" added successfully!`)
        }
        
        // Always reset form data (for both add and edit)
        setFormData({ title: "", key: "", tempo: "" })
        
        // Focus back on title field for adding more songs
        if (!editingSong && titleInputRef.current) {
          titleInputRef.current.focus()
        }
      } else {
        toast.error("Failed to save song. Please try again.")
      }
    } catch (error) {
      console.error("Error saving song:", error)
      toast.error("An error occurred. Please try again.")
    }
  }

  const handleEdit = (song: Song) => {
    setEditingSong(song)
    setFormData({
      title: song.title,
      key: song.key || "",
      tempo: song.tempo || "",
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    const songToDelete = songs.find((s) => s.id === id)
    if (!confirm("Are you sure you want to delete this song?")) return

    try {
      const res = await fetch(`/api/songs/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setSongs(songs.filter((s) => s.id !== id))
        toast.success(`"${songToDelete?.title}" deleted successfully!`)
      } else {
        toast.error("Failed to delete song. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting song:", error)
      toast.error("An error occurred. Please try again.")
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingSong(null)
    setFormData({ title: "", key: "", tempo: "" })
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedSongs = [...songs].sort((a, b) => {
    switch (sortField) {
      case 'title': {
        const aValue = a.title.toLowerCase()
        const bValue = b.title.toLowerCase()
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      }
      case 'key': {
        const aValue = (a.key || '').toLowerCase()
        const bValue = (b.key || '').toLowerCase()
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      }
      case 'tempo': {
        // Extract numbers from tempo strings (e.g., "120 BPM" -> 120)
        const extractNumber = (tempo: string | null): number => {
          if (!tempo) return 0
          const match = tempo.match(/\d+/)
          return match ? parseInt(match[0], 10) : 0
        }
        const aValue = extractNumber(a.tempo)
        const bValue = extractNumber(b.tempo)
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      }
      case 'user': {
        const aValue = a.user.name.toLowerCase()
        const bValue = b.user.name.toLowerCase()
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      }
      default:
        return 0
    }
  })

  if (loading) {
    return <div className={styles.loading}>Loading songs...</div>
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Songs</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            + Add Song
          </button>
        )}
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>
            {editingSong ? "Edit Song" : "Add New Song"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className="form-group" style={{ flex: 2 }}>
                <label htmlFor="title" className="form-label">
                  Title *
                </label>
                <input
                  ref={titleInputRef}
                  id="title"
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="key" className="form-label">
                  Key
                </label>
                <input
                  id="key"
                  type="text"
                  className="form-input"
                  value={formData.key}
                  onChange={(e) =>
                    setFormData({ ...formData, key: e.target.value })
                  }
                  placeholder="e.g., C, Am, G"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="tempo" className="form-label">
                  Tempo
                </label>
                <input
                  id="tempo"
                  type="text"
                  className="form-input"
                  value={formData.tempo}
                  onChange={(e) =>
                    setFormData({ ...formData, tempo: e.target.value })
                  }
                  placeholder="e.g., 120 BPM"
                />
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="submit" className="btn btn-primary">
                {editingSong ? "Update Song" : "Add Song"}
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

      {songs.length === 0 ? (
        <div className={styles.empty}>
          <p>No songs yet. Add your first one!</p>
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div 
              className={`${styles.tableCell} ${styles.sortable}`} 
              style={{ flex: 2 }}
              onClick={() => handleSort('title')}
            >
              Title {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
            </div>
            <div 
              className={`${styles.tableCell} ${styles.sortable}`} 
              style={{ flex: 1 }}
              onClick={() => handleSort('key')}
            >
              Key {sortField === 'key' && (sortDirection === 'asc' ? '↑' : '↓')}
            </div>
            <div 
              className={`${styles.tableCell} ${styles.sortable}`} 
              style={{ flex: 1 }}
              onClick={() => handleSort('tempo')}
            >
              Tempo {sortField === 'tempo' && (sortDirection === 'asc' ? '↑' : '↓')}
            </div>
            <div 
              className={`${styles.tableCell} ${styles.sortable}`} 
              style={{ flex: 1 }}
              onClick={() => handleSort('user')}
            >
              Created By {sortField === 'user' && (sortDirection === 'asc' ? '↑' : '↓')}
            </div>
            <div className={styles.tableCell} style={{ flex: 1 }}>
              Actions
            </div>
          </div>
          {sortedSongs.map((song) => (
            <div key={song.id} className={styles.tableRow}>
              <div className={styles.tableCell} style={{ flex: 2 }}>
                <strong>{song.title}</strong>
              </div>
              <div className={styles.tableCell} style={{ flex: 1 }}>
                {song.key || "-"}
              </div>
              <div className={styles.tableCell} style={{ flex: 1 }}>
                {song.tempo || "-"}
              </div>
              <div className={styles.tableCell} style={{ flex: 1 }}>
                {song.user.name}
              </div>
              <div className={styles.tableCell} style={{ flex: 1 }}>
                <div className={styles.actions}>
                  <button
                    onClick={() => handleEdit(song)}
                    className="btn btn-small btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(song.id)}
                    className="btn btn-small btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
