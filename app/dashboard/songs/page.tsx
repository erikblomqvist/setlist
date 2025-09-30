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
					toast.success(`"${formData.title}" uppdaterades!`)
					setShowForm(false)
					setEditingSong(null)
				} else {
					// If adding, show success message and keep form open
					toast.success(`"${formData.title}" tillagd!`)
				}

				// Always reset form data (for both add and edit)
				setFormData({ title: "", key: "", tempo: "" })

				// Focus back on title field for adding more songs
				if (!editingSong && titleInputRef.current) {
					titleInputRef.current.focus()
				}
			} else {
				toast.error("Gick inte att spara låten. Försök igen.")
			}
		} catch (error) {
			console.error("Error saving song:", error)
			toast.error("Ett fel uppstod. Försök igen.")
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
		if (!confirm("Är du säker på att du vill ta bort denna låt?")) return

		try {
			const res = await fetch(`/api/songs/${id}`, {
				method: "DELETE",
			})

			if (res.ok) {
				setSongs(songs.filter((s) => s.id !== id))
				toast.success(`"${songToDelete?.title}" togs bort!`)
			} else {
				toast.error("Gick inte att ta bort låten. Försök igen.")
			}
		} catch (error) {
			console.error("Error deleting song:", error)
			toast.error("Ett fel uppstod. Försök igen.")
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
		return <div className={styles.loading}>Laddar låtar…</div>
	}

	return (
		<div>
			<div className={styles.header}>
				<h1 className={styles.title}>Låtar</h1>
				{!showForm && (
					<button onClick={() => setShowForm(true)} className="btn btn-primary">
						+ Lägg till låt
					</button>
				)}
			</div>

			{showForm && (
				<div className={styles.formCard}>
					<h2 className={styles.formTitle}>
						{editingSong ? "Redigera låt" : "Lägg till ny låt"}
					</h2>
					<form onSubmit={handleSubmit}>
						<div className={styles.formRow}>
							<div className="form-group" style={{ flex: 2 }}>
								<label htmlFor="title" className="form-label">
									Titel *
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
									Tonart
								</label>
								<input
									id="key"
									type="text"
									className="form-input"
									value={formData.key}
									onChange={(e) =>
										setFormData({ ...formData, key: e.target.value })
									}
									placeholder="t.ex. C, Am, G"
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
									placeholder="t.ex. 120 (BPM)"
								/>
							</div>
						</div>
						<div className={styles.formActions}>
							<button type="submit" className="btn btn-primary">
								{editingSong ? "Uppdatera låt" : "Lägg till låt"}
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

			{songs.length === 0 ? (
				<div className={styles.empty}>
					<p>Inga låtar ännu. Lägg till din första!</p>
				</div>
			) : (
				<div className={styles.table}>
					<div className={styles.tableHeader}>
						<div
							className={`${styles.tableCell} ${styles.sortable}`}
							style={{ flex: 2 }}
							onClick={() => handleSort('title')}
						>
							Titel {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
						</div>
						<div
							className={`${styles.tableCell} ${styles.sortable}`}
							style={{ flex: 1 }}
							onClick={() => handleSort('key')}
						>
							Tonart {sortField === 'key' && (sortDirection === 'asc' ? '↑' : '↓')}
						</div>
						<div
							className={`${styles.tableCell} ${styles.sortable}`}
							style={{ flex: 1 }}
							onClick={() => handleSort('tempo')}
						>
							Tempo (BPM) {sortField === 'tempo' && (sortDirection === 'asc' ? '↑' : '↓')}
						</div>
						<div
							className={`${styles.tableCell} ${styles.sortable}`}
							style={{ flex: 1 }}
							onClick={() => handleSort('user')}
						>
							Skapad av {sortField === 'user' && (sortDirection === 'asc' ? '↑' : '↓')}
						</div>
						<div className={styles.tableCell} style={{ flex: 1 }}>
							Åtgärder
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
										Redigera
									</button>
									<button
										onClick={() => handleDelete(song.id)}
										className="btn btn-small btn-danger"
									>
										Ta bort
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
