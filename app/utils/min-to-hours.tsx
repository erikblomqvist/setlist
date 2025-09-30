export const minToHours = (minutes: number) => {
    return `~${Math.round(minutes / 60)}h ${Math.round(minutes % 60)}m`
}