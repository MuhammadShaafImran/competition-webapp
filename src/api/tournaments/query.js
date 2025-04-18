import supabase from "../supabaseClient"

export const getTournamentsByAdmin = async (userId) => {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export const getTournamentById = async (id) => {
  const { data, error } = await supabase
    .from("tournaments")
    .select(`
      *,
      teams:teams(
        id,
        name,
        team_members:team_members(*)
      )
    `)
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export const getTournamentStats = async (tournamentId) => {
  const { data, error } = await supabase
    .from("tournaments")
    .select(`
      *,
      teams:teams(
        id,
        name,
        match_teams:match_teams(
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
      )
    `)
    .eq("id", tournamentId)
    .single()

  if (error) throw error
  return data
}
