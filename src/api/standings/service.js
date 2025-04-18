export const calculateBreakingTeams = (standings, breakCount) => {
  // Sort teams by performance
  const sortedTeams = [...standings].sort((a, b) => {
    // First by team points
    if (b.totalTeamPoints !== a.totalTeamPoints) {
      return b.totalTeamPoints - a.totalTeamPoints
    }

    // Then by speaker points
    if (b.totalSpeakerPoints !== a.totalSpeakerPoints) {
      return b.totalSpeakerPoints - a.totalSpeakerPoints
    }

    // Then by first places
    if (b.firstPlaces !== a.firstPlaces) {
      return b.firstPlaces - a.firstPlaces
    }

    // Then by second places
    return b.secondPlaces - a.secondPlaces
  })

  // Take the top teams
  return sortedTeams.slice(0, breakCount)
}

export const scaleSpeakerPoints = (rawPoints, matchResults) => {
  // Find the highest and lowest raw points in this match
  const allPoints = matchResults.map((r) => r.raw_points).filter((p) => p !== null)
  const maxPoints = Math.max(...allPoints)
  const minPoints = Math.min(...allPoints)

  // Scale to 0-100
  const range = maxPoints - minPoints
  if (range === 0) return 50 // If all scores are the same

  return ((rawPoints - minPoints) / range) * 100
}
