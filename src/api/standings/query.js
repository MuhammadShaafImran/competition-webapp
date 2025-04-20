import supabase from "../supabaseClient"

export const getTeamStandings = async (tournamentId) => {
  const { data, error } = await supabase
    .from("teams")
    .select(`
      id,
      name,
      status,
      match_roles(
        og,
        oo,
        cg,
        co,
        matches(
          round_number,
          is_break,
          status
        )
      ),
      speaker_points(
        member_1_points,
        member_2_points
      )
    `)
    .eq("tournament_id", tournamentId)

  if (error) throw error

  // Calculate standings
  const standings = data.map((team) => {
    const completedMatches = team.match_roles.filter(mr => mr.matches?.status === 'completed')
    
    return {
      id: team.id,
      name: team.name,
      totalTeamPoints: completedMatches.reduce((sum, mr) => {
        // Calculate points based on which role was 1
        if (mr.og) return sum + 3
        if (mr.oo) return sum + 2
        if (mr.cg) return sum + 1
        return sum // CO gets 0 points
      }, 0),
      totalSpeakerPoints: team.speaker_points.reduce((sum, sp) => 
        sum + (sp.member_1_points || 0) + (sp.member_2_points || 0), 0),
      firstPlaces: completedMatches.filter(mr => mr.og === 1).length,
      secondPlaces: completedMatches.filter(mr => mr.oo === 1).length,
      thirdPlaces: completedMatches.filter(mr => mr.cg === 1).length,
      fourthPlaces: completedMatches.filter(mr => mr.co === 1).length,
      averageRank: completedMatches.length > 0 
        ? completedMatches.reduce((sum, mr) => {
            if (mr.og) return sum + 1
            if (mr.oo) return sum + 2
            if (mr.cg) return sum + 3
            return sum + 4 // CO
          }, 0) / completedMatches.length
        : null
    }
  })

  return standings.sort((a, b) => {
    if (a.totalTeamPoints !== b.totalTeamPoints) {
      return b.totalTeamPoints - a.totalTeamPoints
    }
    if (a.totalSpeakerPoints !== b.totalSpeakerPoints) {
      return b.totalSpeakerPoints - a.totalSpeakerPoints
    }
    return a.averageRank - b.averageRank
  })
}

export const getSpeakerStandings = async (tournamentId) => {
  // This would require a more complex query with speaker-level data
  // For now, we'll return a placeholder
  return []
}
