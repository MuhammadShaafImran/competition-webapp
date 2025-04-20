import supabase from "../supabaseClient"

export const getRoleDistribution = async (teamId) => {
  const { data, error } = await supabase
    .from("match_roles")
    .select("og, oo, cg, co")
    .eq("team_id", teamId)
  
  if (error) throw error
  
  // Count occurrences of each role
  const roleCounts = {
    og: 0,
    oo: 0,
    cg: 0,
    co: 0
  }
  
  data.forEach(item => {
    if (item.og) roleCounts.og++
    if (item.oo) roleCounts.oo++
    if (item.cg) roleCounts.cg++
    if (item.co) roleCounts.co++
  })
  
  return roleCounts
}

export const calculateTeamPoints = (role, rank) => {
  // BP debate scoring based on role and rank
  // This is a simplified version - you might have a more complex logic
  if (rank === 1) return 3
  if (rank === 2) return 2
  if (rank === 3) return 1
  return 0
}

export const getTotalTeamPoints = async (teamId, tournamentId) => {
  // Get all match results for this team
  const { data, error } = await supabase.rpc('get_team_matches', { p_team_id: teamId })
  
  if (error) throw error
  
  // Sum up team points
  const totalPoints = data.reduce((sum, match) => sum + match.team_points, 0)
  const totalSpeakerPoints = data.reduce((sum, match) => 
    sum + match.member_1_points + match.member_2_points, 0)
  
  return {
    team_points: totalPoints,
    speaker_points: totalSpeakerPoints
  }
}

export const updateStandings = async (teamId, tournamentId) => {
  const points = await getTotalTeamPoints(teamId, tournamentId)
  
  // Upsert to standings table
  const { error } = await supabase
    .from("standings")
    .upsert({
      team_id: teamId,
      tournament_id: tournamentId,
      total_team_points: points.team_points,
      total_speaker_points: points.speaker_points
    })
  
  if (error) throw error
  
  return points
}
