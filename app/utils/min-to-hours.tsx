export const minToHours = (minutes: number) => {
    if (minutes < 60) {
        return `~${Math.round(minutes)}m`
    }

    const h = Math.floor(minutes / 60)
    const m = minutes % 60

    return m > 0 ? `~${h}h ${m}m` : `~${h}h`
}