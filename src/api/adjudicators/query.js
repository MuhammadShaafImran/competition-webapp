import supabase from "../supabaseClient"

export const getAdjudicatorsByTournament = async (tournamentId) => {
  const { data, error } = await supabase
    .from("adjudicators")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("name")

  if (error) throw error
  return data
}

export const getAvailableAdjudicators = async (tournamentId, matchId) => {
  // Get all adjudicators for this tournament
  const { data: allAdjudicators, error: adjError } = await supabase
    .from("adjudicators")
    .select("*")
    .eq("tournament_id", tournamentId)

  if (adjError) throw adjError

  // Get adjudicators already assigned to this match
  const { data: assignedAdjudicators, error: assignedError } = await supabase
    .from("match_adjudicators")
    .select("adjudicator_id")
    .eq("match_id", matchId)

  if (assignedError) throw assignedError

  // Filter out already assigned adjudicators
  const assignedIds = assignedAdjudicators.map((a) => a.adjudicator_id)
  const availableAdjudicators = allAdjudicators.filter((adj) => !assignedIds.includes(adj.id))

  return availableAdjudicators
}
