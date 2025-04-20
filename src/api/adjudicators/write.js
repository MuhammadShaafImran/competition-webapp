import supabase from "../supabaseClient"

export const createAdjudicator = async (adjudicatorData) => {
  const { data, error } = await supabase.from("adjudicators").insert([adjudicatorData]).select().single()

  if (error) throw error
  return data
}

export const updateAdjudicator = async (id, updates) => {
  const { data, error } = await supabase.from("adjudicators").update(updates).eq("id", id).select().single()

  if (error) throw error
  return data
}

export const deleteAdjudicator = async (id) => {
  const { error } = await supabase.from("adjudicators").delete().eq("id", id)

  if (error) throw error
  return { success: true }
}

export const assignAdjudicatorsToMatch = async (matchId, adjudicatorIds) => {
  // First, delete any existing assignments for this match
  const { error: deleteError } = await supabase
    .from("match_adjudicators")
    .delete()
    .eq("match_id", matchId)

  if (deleteError) throw deleteError

  // Then insert the new assignments
  const assignments = adjudicatorIds.map(adjudicatorId => ({
    match_id: matchId,
    adjudicator_id: adjudicatorId
  }))

  const { error: insertError } = await supabase
    .from("match_adjudicators")
    .insert(assignments)

  if (insertError) throw insertError
  return { success: true }
}

