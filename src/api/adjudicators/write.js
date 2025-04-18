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
