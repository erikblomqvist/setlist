"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./edit.module.css"

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
  comments: string
  backgroundColor: string
  song: Song
}

interface Setlist {
  id: string
  name: string
  numberOfSets: number
  songs: SetlistSong[]
}

const COLORS = [
  { name: "red", label: "Red", value: "var(--color-red)" },
  { name: "blue", label: "Blue", value: "var(--color-blue)" },
  { name: "green", label: "Green", value: "var(--color-green)" },
  { name: "yellow", label: "Yellow", value: "var(--color-yellow)" },
  { name: "purple", label: "Purple", value: "var(--color-purple)" },
]

export default function EditSetlistPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [setlist, setSetlist] = useState<Setlist | null>(null)
  const [allSongs, setAllSongs] = useState<Song[]>([])
  const [setlistSongs, setSetlistSongs] = useState<SetlistSong[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [formData, setFormData] = useState({ name: "", numberOfSets: 1 })
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
      Promise.all([fetchSetlist(), fetchSongs()])
    }
  }, [setlistId])

  const fetchSetlist = async () => {
    if (!setlistId) return
    
    try {
      const res = await fetch(`/api/setlists/${setlistId}`)
      if (res.ok) {
        const data = await res.json()
        setSetlist(data)
        setSetlistSongs(data.songs || [])
        setFormData({ name: data.name, numberOfSets: data.numberOfSets })
      }
    } catch (error) {
      console.error("Error fetching setlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSongs = async () => {
    try {
      const res = await fetch("/api/songs")
      if (res.ok) {
        const data = await res.json()
        setAllSongs(data)
      }
    } catch (error) {
      console.error("Error fetching songs:", error)
    }
  }

  const filteredSongs = allSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !setlistSongs.some((ss) => ss.songId === song.id)
  )

  const addSongToSet = (song: Song, setNumber: number) => {
    const songsInSet = setlistSongs.filter((s) => s.setNumber === setNumber)
    const newPosition = songsInSet.length

    const newSetlistSong: SetlistSong = {
      id: `temp-${Date.now()}`,
      songId: song.id,
      setNumber,
      position: newPosition,
      comments: "",
      backgroundColor: "",
      song,
    }

    setSetlistSongs([...setlistSongs, newSetlistSong])
    setSearchTerm("")
    setShowAutocomplete(false)
  }

  const removeSong = (id: string) => {
    const song = setlistSongs.find((s) => s.id === id)
    if (!song) return

    // Remove the song
    const updated = setlistSongs.filter((s) => s.id !== id)

    // Reorder positions within the set
    const reordered = updated.map((s) => {
      if (s.setNumber === song.setNumber && s.position > song.position) {
        return { ...s, position: s.position - 1 }
      }
      return s
    })

    setSetlistSongs(reordered)
  }

  const updateSong = (
    id: string,
    updates: Partial<Pick<SetlistSong, "comments" | "backgroundColor">>
  ) => {
    setSetlistSongs(
      setlistSongs.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
  }

  const moveSong = (id: string, direction: "up" | "down") => {
    const song = setlistSongs.find((s) => s.id === id)
    if (!song) return

    const songsInSet = setlistSongs
      .filter((s) => s.setNumber === song.setNumber)
      .sort((a, b) => a.position - b.position)

    const currentIndex = songsInSet.findIndex((s) => s.id === id)

    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === songsInSet.length - 1)
    ) {
      return
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    const swapSong = songsInSet[newIndex]

    setSetlistSongs(
      setlistSongs.map((s) => {
        if (s.id === song.id) {
          return { ...s, position: swapSong.position }
        }
        if (s.id === swapSong.id) {
          return { ...s, position: song.position }
        }
        return s
      })
    )
  }

  const moveSongToSet = (id: string, newSetNumber: number) => {
    const song = setlistSongs.find((s) => s.id === id)
    if (!song || song.setNumber === newSetNumber) return

    const oldSetNumber = song.setNumber

    // Remove from old set and update positions
    const updated = setlistSongs.map((s) => {
      if (s.id === id) {
        // Move the song to new set at the end
        const songsInNewSet = setlistSongs.filter(
          (x) => x.setNumber === newSetNumber
        )
        return { ...s, setNumber: newSetNumber, position: songsInNewSet.length }
      }
      // Reorder remaining songs in old set
      if (s.setNumber === oldSetNumber && s.position > song.position) {
        return { ...s, position: s.position - 1 }
      }
      return s
    })

    setSetlistSongs(updated)
  }

  const handleSave = async () => {
    if (!setlistId) return
    
    setSaving(true)
    try {
      const songsData = setlistSongs.map((s, index) => ({
        songId: s.songId,
        setNumber: s.setNumber,
        position: s.position,
        comments: s.comments || null,
        backgroundColor: s.backgroundColor || null,
      }))

      const res = await fetch(`/api/setlists/${setlistId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          numberOfSets: formData.numberOfSets,
          songs: songsData,
        }),
      })

      if (res.ok) {
        router.push(`/dashboard/setlists/${setlistId}`)
      }
    } catch (error) {
      console.error("Error saving setlist:", error)
    } finally {
      setSaving(false)
    }
  }

  const getSongsBySet = (setNumber: number) => {
    return setlistSongs
      .filter((s) => s.setNumber === setNumber)
      .sort((a, b) => a.position - b.position)
  }

  if (loading) {
    return <div className={styles.loading}>Loading...</div>
  }

  if (!setlist) {
    return null
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Edit Setlist</h1>
        </div>
        <div className={styles.actions}>
          <button onClick={handleSave} className="btn btn-success" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={() => router.push(`/dashboard/setlists/${setlistId}`)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className={styles.basicInfo}>
        <div className="form-group" style={{ flex: 2 }}>
          <label htmlFor="name" className="form-label">
            Setlist Name
          </label>
          <input
            id="name"
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label htmlFor="numberOfSets" className="form-label">
            Number of Sets
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
            min="1"
            max="10"
          />
        </div>
      </div>

      <div className={styles.addSongSection}>
        <div className={styles.autocompleteWrapper}>
          <input
            type="text"
            className="form-input"
            placeholder="Search for a song to add..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setShowAutocomplete(true)
            }}
            onFocus={() => setShowAutocomplete(true)}
            onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
          />
          {showAutocomplete && searchTerm && filteredSongs.length > 0 && (
            <div className={styles.autocomplete}>
              {filteredSongs.slice(0, 5).map((song) => (
                <div key={song.id} className={styles.autocompleteItem}>
                  <div className={styles.songInfo}>
                    <strong>{song.title}</strong>
                    <span>
                      {song.key && `Key: ${song.key}`}
                      {song.key && song.tempo && " • "}
                      {song.tempo && `Tempo: ${song.tempo}`}
                    </span>
                  </div>
                  <div className={styles.setButtons}>
                    {Array.from(
                      { length: formData.numberOfSets },
                      (_, i) => i + 1
                    ).map((setNum) => (
                      <button
                        key={setNum}
                        onClick={() => addSongToSet(song, setNum)}
                        className="btn btn-small btn-primary"
                      >
                        Set {setNum}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.sets}>
        {Array.from({ length: formData.numberOfSets }, (_, i) => i + 1).map(
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
                  <div className={styles.emptySet}>
                    No songs in this set. Use the search above to add songs.
                  </div>
                ) : (
                  <div className={styles.songList}>
                    {songs.map((setlistSong, index) => (
                      <div
                        key={setlistSong.id}
                        className={styles.songItem}
                        style={{
                          backgroundColor: setlistSong.backgroundColor
                            ? COLORS.find((c) => c.name === setlistSong.backgroundColor)
                                ?.value
                            : "white",
                        }}
                      >
                        <div className={styles.songControls}>
                          <div className={styles.orderButtons}>
                            <button
                              onClick={() => moveSong(setlistSong.id, "up")}
                              disabled={index === 0}
                              className={styles.orderBtn}
                              title="Move up"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => moveSong(setlistSong.id, "down")}
                              disabled={index === songs.length - 1}
                              className={styles.orderBtn}
                              title="Move down"
                            >
                              ▼
                            </button>
                          </div>
                          <div className={styles.songNumber}>{index + 1}</div>
                        </div>

                        <div className={styles.songContent}>
                          <div className={styles.songHeader}>
                            <div className={styles.songTitle}>
                              {setlistSong.song.title}
                              {setlistSong.song.key && (
                                <span className={styles.metaBadge}>
                                  {setlistSong.song.key}
                                </span>
                              )}
                              {setlistSong.song.tempo && (
                                <span className={styles.metaBadge}>
                                  {setlistSong.song.tempo}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className={styles.songOptions}>
                            <input
                              type="text"
                              className={styles.commentInput}
                              placeholder="Add comments..."
                              value={setlistSong.comments}
                              onChange={(e) =>
                                updateSong(setlistSong.id, {
                                  comments: e.target.value,
                                })
                              }
                            />

                            <div className={styles.colorPicker}>
                              <button
                                className={
                                  !setlistSong.backgroundColor
                                    ? styles.colorBtnActive
                                    : styles.colorBtn
                                }
                                onClick={() =>
                                  updateSong(setlistSong.id, {
                                    backgroundColor: "",
                                  })
                                }
                                title="No color"
                              >
                                ✕
                              </button>
                              {COLORS.map((color) => (
                                <button
                                  key={color.name}
                                  className={
                                    setlistSong.backgroundColor === color.name
                                      ? styles.colorBtnActive
                                      : styles.colorBtn
                                  }
                                  style={{ backgroundColor: color.value }}
                                  onClick={() =>
                                    updateSong(setlistSong.id, {
                                      backgroundColor: color.name,
                                    })
                                  }
                                  title={color.label}
                                />
                              ))}
                            </div>

                            {formData.numberOfSets > 1 && (
                              <select
                                className={styles.setSelect}
                                value={setlistSong.setNumber}
                                onChange={(e) =>
                                  moveSongToSet(
                                    setlistSong.id,
                                    parseInt(e.target.value)
                                  )
                                }
                              >
                                {Array.from(
                                  { length: formData.numberOfSets },
                                  (_, i) => i + 1
                                ).map((num) => (
                                  <option key={num} value={num}>
                                    Set {num}
                                  </option>
                                ))}
                              </select>
                            )}

                            <button
                              onClick={() => removeSong(setlistSong.id)}
                              className="btn btn-small btn-danger"
                            >
                              Remove
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
        )}
      </div>
    </div>
  )
}
