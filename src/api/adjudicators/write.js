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

export const importAdjudicatorsFromCSV = async (tournamentId, adjudicatorsData) => {
  // Filter out empty rows and validate data
  const validAdjudicators = adjudicatorsData
    .filter((row) => row.name && row.email && row.level)
    .map((row) => ({
      name: row.name.trim(),
      email: row.email.trim().toLowerCase(),
      level: row.level.trim().toLowerCase(),
      tournament_id: tournamentId,
    }))

  if (validAdjudicators.length === 0) {
    throw new Error("No valid adjudicators found in the CSV file")
  }

  // Insert all valid adjudicators
  const { data, error } = await supabase
    .from("adjudicators")
    .insert(validAdjudicators)
    .select()

  if (error) throw error
  return data
}
