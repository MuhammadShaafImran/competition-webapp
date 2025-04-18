import supabase from "../supabaseClient"
import { updateRoleTracker } from "./service"

export const createMatch = async ({ tournament_id, round_number, is_break, is_closing, status, teams }) => {
  // First create the match
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert([
      {
        tournament_id,
        round_number,
        is_break,
        is_closing,
        status,
        swing_team_used: false,
      },
    ])
    .select()
    .single()

  if (matchError) throw matchError

  // Then create the match_teams entries
  const matchTeams = teams.map((team) => ({
    match_id: match.id,
    team_id: team.id,
    role: team.role,
    team_points: null,
    scaled_points: null,
    raw_points: null,
    rank: null,
  }))

  const { error: teamsError } = await supabase.from("match_teams").insert(matchTeams)

  if (teamsError) throw teamsError

  // Update role tracker for each team
  for (const team of teams) {
    await updateRoleTracker(team.id, team.role)
  }

  return match
}

export const submitMatchResults = async (matchId, results) => {
  // Update each team's results in the match
  const updates = results.map((result) => ({
    id: result.match_team_id,
    team_points: result.team_points,
    scaled_points: result.scaled_points,
    raw_points: result.raw_points,
    rank: result.rank,
  }))

  const { error } = await supabase.from("match_teams").upsert(updates)

  if (error) throw error

  // Update match status
  const { error: matchError } = await supabase.from("matches").update({ status: "completed" }).eq("id", matchId)

  if (matchError) throw matchError

  return { success: true }
}

export const assignAdjudicators = async (matchId, adjudicatorIds) => {
  // First remove any existing adjudicators
  const { error: deleteError } = await supabase.from("match_adjudicators").delete().eq("match_id", matchId)

  if (deleteError) throw deleteError

  // Then add the new adjudicators
  const adjudicators = adjudicatorIds.map((id) => ({
    match_id: matchId,
    adjudicator_id: id,
  }))

  const { error } = await supabase.from("match_adjudicators").insert(adjudicators)

  if (error) throw error

  return { success: true }
}
