import supabase from "../supabaseClient"

export const updateStandings = async (matchId, results) => {
  // This is handled by the match results submission
  // This function could be used for manual overrides

  const updates = results.map((result) => ({
    id: result.match_team_id,
    team_points: result.team_points,
    scaled_points: result.scaled_points,
    raw_points: result.raw_points,
    rank: result.rank,
  }))

  const { error } = await supabase.from("match_teams").upsert(updates)

  if (error) throw error

  return { success: true }
}
