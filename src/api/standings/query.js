import supabase from "../supabaseClient"

export const getTeamStandings = async (tournamentId) => {
  // Get all teams with their match results
  const { data, error } = await supabase
    .from("teams")
    .select(`
      id,
      name,
      match_teams(
        team_points,
        scaled_points,
        raw_points,
        rank,
        match:matches(
          round_number,
          is_break
        )
      )
    `)
    .eq("tournament_id", tournamentId)

  if (error) throw error

  // Calculate total points and stats for each team
  const standings = data.map((team) => {
    const matchResults = team.match_teams || []

    // Only count completed matches (where team_points is not null)
    const completedMatches = matchResults.filter((mr) => mr.team_points !== null)

    // Calculate totals
    const totalTeamPoints = completedMatches.reduce((sum, mr) => sum + (mr.team_points || 0), 0)

    const totalSpeakerPoints = completedMatches.reduce((sum, mr) => sum + (mr.scaled_points || 0), 0)

    // Count first places
    const firstPlaces = completedMatches.filter((mr) => mr.rank === 1).length

    // Count second places
    const secondPlaces = completedMatches.filter((mr) => mr.rank === 2).length

    return {
      id: team.id,
      name: team.name,
      totalTeamPoints,
      totalSpeakerPoints,
      matchesCompleted: completedMatches.length,
      firstPlaces,
      secondPlaces,
      averageRank:
        completedMatches.length > 0
          ? completedMatches.reduce((sum, mr) => sum + (mr.rank || 0), 0) / completedMatches.length
          : null,
    }
  })

  // Sort by team points (descending), then by speaker points
  return standings.sort((a, b) => {
    if (b.totalTeamPoints !== a.totalTeamPoints) {
      return b.totalTeamPoints - a.totalTeamPoints
    }
    return b.totalSpeakerPoints - a.totalSpeakerPoints
  })
}

export const getSpeakerStandings = async (tournamentId) => {
  // This would require a more complex query with speaker-level data
  // For now, we'll return a placeholder
  return []
}
