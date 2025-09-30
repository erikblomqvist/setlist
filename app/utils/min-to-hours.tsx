export const minToHours = (minutes: number) => {
    if(minutes < 60) {
        return `~${Math.round(minutes)}m`
    }
    
    return `~${Math.round(minutes / 60)}h ${Math.round(minutes % 60)}m`
}