import supabase from "../supabaseClient"

export const createTournament = async (tournamentData) => {
  const { data, error } = await supabase.from("tournaments").insert([tournamentData]).select().single()

  if (error) throw error
  return data
}

export const updateTournament = async (id, updates) => {
  const { data, error } = await supabase.from("tournaments").update(updates).eq("id", id).select().single()

  if (error) throw error
  return data
}

export const advanceRound = async (tournamentId, newRound) => {
  const { data, error } = await supabase
    .from("tournaments")
    .update({ current_round: newRound })
    .eq("id", tournamentId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const finalizeTournament = async (tournamentId) => {
  const { data, error } = await supabase
    .from("tournaments")
    .update({ status: "completed" })
    .eq("id", tournamentId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteTournament = async (tournamentId) => {
  // Delete the tournament
  const { error } = await supabase
    .from("tournaments")
    .delete()
    .eq("id", tournamentId)

  if (error) throw error
  return { success: true }
}
