export const calculateTotalPoints = (matchResults) => {
  return matchResults.reduce((total, match) => {
    return total + (match.team_points || 0)
  }, 0)
}

export const calculateAverageRank = (matchResults) => {
  if (matchResults.length === 0) return 0

  const totalRank = matchResults.reduce((total, match) => {
    return total + (match.rank || 0)
  }, 0)

  return totalRank / matchResults.length
}

export const calculateTotalSpeakerPoints = (matchResults) => {
  return matchResults.reduce((total, match) => {
    return total + (match.scaled_points || 0)
  }, 0)
}

export const sortTeamsByPerformance = (teams) => {
  return [...teams].sort((a, b) => {
    // First sort by total team points
    if (a.totalTeamPoints !== b.totalTeamPoints) {
      return b.totalTeamPoints - a.totalTeamPoints
    }

    // Then by total speaker points
    if (a.totalSpeakerPoints !== b.totalSpeakerPoints) {
      return b.totalSpeakerPoints - a.totalSpeakerPoints
    }

    // Then by average rank (lower is better)
    return a.averageRank - b.averageRank
  })
}
