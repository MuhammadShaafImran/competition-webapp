import supabase from "../supabaseClient"

export const getTeamStandings = async (tournamentId) => {
  const { data, error } = await supabase
    .from("teams")
    .select(`
      id,
      name,
      status,
      match_teams(
        team_points,
        raw_points,
        scaled_points,
        rank,
        role,
        matches(
          round_number,
          is_break,
          status
        )
      )
    `)
    .eq("tournament_id", tournamentId)

  if (error) throw error

  // Calculate standings
  const standings = data.map((team) => {
    const completedMatches = team.match_teams.filter(mt => mt.matches.status === 'completed')
    
    return {
      id: team.id,
      name: team.name,
      totalTeamPoints: completedMatches.reduce((sum, mt) => sum + (mt.team_points || 0), 0),
      totalSpeakerPoints: completedMatches.reduce((sum, mt) => sum + (mt.scaled_points || 0), 0),
      firstPlaces: completedMatches.filter(mt => mt.rank === 1).length,
      secondPlaces: completedMatches.filter(mt => mt.rank === 2).length,
      matchesCompleted: completedMatches.length
    }
  })

  // Sort by points
  return standings.sort((a, b) => b.totalTeamPoints - a.totalTeamPoints)
}

export const getSpeakerStandings = async (tournamentId) => {
  // This would require a more complex query with speaker-level data
  // For now, we'll return a placeholder
  return []
}
