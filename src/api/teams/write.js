import supabase from "../supabaseClient"
import { v4 as uuidv4 } from "uuid"

export const createTeam = async (teamData) => {
  // Step 1: Get the tournament's team limit and current team count
  const tournamentId = teamData.tournament_id

  // Fetch tournament info (num_teams)
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("num_teams")
    .eq("id", tournamentId)
    .single()

  if (tournamentError) throw tournamentError
  if (!tournament) throw new Error("Tournament not found")

  // Count current teams in this tournament
  const { count: currentTeamCount, error: countError } = await supabase
    .from("teams")
    .select("id", { count: "exact", head: true })
    .eq("tournament_id", tournamentId)

  if (countError) throw countError

  // Step 2: Check if team limit is reached
  if (currentTeamCount >= tournament.num_teams) {
    throw new Error("Team limit for this tournament has been reached")
  }

  // Step 3: Proceed to insert the new team
  const privateToken = uuidv4()
  const fullTeamData = {
    ...teamData,
    private_token: privateToken,
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert([fullTeamData])
    .select()
    .single()

  if (teamError) throw teamError

  return {
    ...team,
    private_token: privateToken,
  }
}


export const updateTeam = async (teamId, teamData) => {
  const { data, error } = await supabase
    .from("teams")
    .update(teamData)
    .eq("id", teamId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteTeam = async (teamId) => {
  // Delete team
  const { error: teamError } = await supabase
    .from("teams")
    .delete()
    .eq("id", teamId)

  if (teamError) throw teamError

  return { success: true }
}

