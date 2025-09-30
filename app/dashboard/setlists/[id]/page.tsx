"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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

	if (loading) {
		return <div className={styles.loading}>Loading setlist...</div>
	}

	if (!setlist) {
		return null
	}

	const getSongsBySet = (setNumber: number) => {
		return setlist.songs
			.filter((s) => s.setNumber === setNumber)
			.sort((a, b) => a.position - b.position)
	}

	return (
		<div>
			<div className={styles.header}>
				<div>
					<h1 className={styles.title}>{setlist.name}</h1>
					<p className={styles.subtitle}>
						Created by {setlist.user.name} • {setlist.songs.length} songs
					</p>
				</div>
				<div className={styles.actions}>
					<Link
						href={`/dashboard/setlists/${setlistId}/edit`}
						className="btn btn-primary"
					>
						Edit
					</Link>
					<Link href="/dashboard" className="btn btn-secondary">
						Back
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
										{songs.length} {songs.length === 1 ? "song" : "songs"}
									</span>
								</h2>
								{songs.length === 0 ? (
									<div className={styles.emptySet}>No songs in this set</div>
								) : (
									<div className={styles.songList}>
										{songs.map((setlistSong, index) => (
											<div
												key={setlistSong.id}
												className={styles.songItem}
												style={{
													backgroundColor: setlistSong.backgroundColor
														? COLOR_MAP[setlistSong.backgroundColor]
														: "white",
												}}
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
																	Key: {setlistSong.song.key}
																</span>
															)}
															{setlistSong.song.tempo && (
																<span className={styles.metaItem}>
																	Tempo: {setlistSong.song.tempo}
																</span>
															)}
														</div>
													</div>
													{setlistSong.comments && (
														<div className={styles.comments}>
															💬 {setlistSong.comments}
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
