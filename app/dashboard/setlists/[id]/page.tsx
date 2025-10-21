"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { minToHours } from "@/app/utils/min-to-hours"
import styles from "./view.module.css"

interface Song {
	id: string
	title: string
	key: string | null
	tempo: string | null
}

interface SetlistSong {
	id: string
	songId: string
	setNumber: number
	position: number
	comments: string | null
	backgroundColor: string | null
	song: Song
}

interface Setlist {
	id: string
	name: string
	numberOfSets: number
	date: string | null
	user: {
		name: string
	}
	songs: SetlistSong[]
}

const COLOR_MAP: { [key: string]: string } = {
	red: "var(--color-red)",
	blue: "var(--color-blue)",
	green: "var(--color-green)",
	yellow: "var(--color-yellow)",
	purple: "var(--color-purple)",
}

export default function ViewSetlistPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const router = useRouter()
	const [setlist, setSetlist] = useState<Setlist | null>(null)
	const [loading, setLoading] = useState(true)
	const [setlistId, setSetlistId] = useState<string | null>(null)
	const [duplicating, setDuplicating] = useState(false)

	useEffect(() => {
		const getParams = async () => {
			const { id } = await params
			setSetlistId(id)
		}
		getParams()
	}, [params])

	useEffect(() => {
		if (setlistId) {
			fetchSetlist()
		}
	}, [setlistId])

	const fetchSetlist = async () => {
		if (!setlistId) return

		try {
			const res = await fetch(`/api/setlists/${setlistId}`)
			if (res.ok) {
				const data = await res.json()
				setSetlist(data)
			} else {
				router.push("/dashboard")
			}
		} catch (error) {
			console.error("Error fetching setlist:", error)
		} finally {
			setLoading(false)
		}
	}

	const handleDuplicate = async () => {
		if (!setlistId || duplicating) return

		setDuplicating(true)
		try {
			const res = await fetch(`/api/setlists/${setlistId}`, {
				method: 'POST'
			})
			
			if (res.ok) {
				const duplicatedSetlist = await res.json()
				// Redirect to the duplicated setlist
				router.push(`/dashboard/setlists/${duplicatedSetlist.id}`)
			} else {
				console.error("Error duplicating setlist")
			}
		} catch (error) {
			console.error("Error duplicating setlist:", error)
		} finally {
			setDuplicating(false)
		}
	}

	if (loading) {
		return <div className={styles.loading}>Laddar setlist…</div>
	}

	if (!setlist) {
		return null
	}

	const getSongsBySet = (setNumber: number) => {
		return setlist.songs
			.filter((s) => s.setNumber === setNumber)
			.sort((a, b) => a.position - b.position)
	}

	const formatDate = (dateString: string | null) => {
		if (!dateString) return null
		const date = new Date(dateString)
		return date.toLocaleDateString('sv-SE', { 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric' 
		})
	}

	return (
		<div>
			<div className={styles.header}>
				<div>
					<h1 className={styles.title}>{setlist.name}</h1>
					<p className={styles.subtitle}>
						{setlist.date && (
							<span className={styles.date}><span className="material-icons">calendar_month</span> {formatDate(setlist.date)}</span>
						)}
						<span>Skapad av {setlist.user.name} • {setlist.songs.length} låtar ({minToHours(setlist.songs.length * 3)})</span>
					</p>
				</div>
				<div className={styles.actions}>
					<button
						onClick={() => window.print()}
						className="btn btn-secondary"
					>
						<span className="material-icons">print</span>
						Skriv ut
					</button>
					<button
						onClick={handleDuplicate}
						disabled={duplicating}
						className="btn btn-secondary"
					>
						{duplicating ? "Duplicerar..." : "Duplicera"}
					</button>
					<Link
						href={`/dashboard/setlists/${setlistId}/edit`}
						className="btn btn-primary"
					>
						Redigera
					</Link>
					<Link href="/dashboard" className="btn btn-secondary">
						Tillbaka
					</Link>
				</div>
			</div>

			<div className={styles.sets}>
				{Array.from({ length: setlist.numberOfSets }, (_, i) => i + 1).map(
					(setNumber) => {
						const songs = getSongsBySet(setNumber)
						
						return (
							<div key={setNumber} className={styles.set}>
								<h2 className={styles.setTitle}>
									Set {setNumber}
									<span className={styles.songCount}>
										{songs.length} {songs.length === 1 ? "låt" : "låtar"} ({minToHours(songs.length * 3)})
									</span>
								</h2>
								{songs.length === 0 ? (
									<div className={styles.emptySet}>Inga låtar i denna setlist</div>
								) : (
									<div className={styles.songList}>
										{songs.map((setlistSong, index) => (
											<div
												key={setlistSong.id}
												className={styles.songItem}
												{...(setlistSong.backgroundColor ? { style: { backgroundColor: COLOR_MAP[setlistSong.backgroundColor] } } : {})}
											>
												<div className={styles.songNumber}>{index + 1}</div>
												<div className={styles.songContent}>
													<div className={styles.songHeader}>
														<div className={styles.songTitle}>
															{setlistSong.song.title}
														</div>
														<div className={styles.songMeta}>
															{setlistSong.song.key && (
																<span className={styles.metaItem}>
																	<em>Tonart:</em> <strong>{setlistSong.song.key}</strong>
																</span>
															)}
															{setlistSong.song.tempo && (
																<span className={styles.metaItem}>
																	<em>Tempo:</em> <strong>{setlistSong.song.tempo}</strong>
																</span>
															)}
														</div>
													</div>
													{setlistSong.comments && (
														<div className={styles.comments}>
															{setlistSong.comments}
														</div>
													)}
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						)
					}
				)}
			</div>
		</div>
	)
}
