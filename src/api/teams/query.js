import supabase from "../supabaseClient"

export const getTeamsByTournament = async (tournamentId) => {
  const { data, error } = await supabase
    .from("teams")
    .select(`
      *,
      team_members(*)
    `)
    .eq("tournament_id", tournamentId)
    .order("name")

  if (error) throw error
  return data
}

export const getTeamById = async (teamId) => {
  const { data, error } = await supabase
    .from("teams")
    .select(`
      *,
      team_members(*),
      roles_tracker(*)
    `)
    .eq("id", teamId)
    .single()

  if (error) throw error
  return data
}

export const getTeamByToken = async (token) => {
  // First get the team link
  const { data: linkData, error: linkError } = await supabase
    .from("team_links")
    .select("team_id, tournament_id")
    .eq("uuid", token)
    .gt("expires_at", new Date().toISOString())
    .single()

  if (linkError) throw linkError

  // Then get the team with its tournament data
  const { data: teamData, error: teamError } = await supabase
    .from("teams")
    .select(`
      *,
      team_members(*),
      tournament:tournaments(
        name,
        status,
        current_round
      ),
      match_teams(
        team_points,
        scaled_points,
        raw_points,
        rank,
        role,
        match:matches(
          round_number,
          is_break
        )
      )
    `)
    .eq("id", linkData.team_id)
    .single()

  if (teamError) throw teamError
  return teamData
}
