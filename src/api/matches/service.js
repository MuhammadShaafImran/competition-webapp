import supabase from "../supabaseClient"

export const updateRoleTracker = async (teamId, role) => {
  // Get current role counts
  const { data, error } = await supabase.from("roles_tracker").select("*").eq("team_id", teamId).single()

  if (error) {
    // If no tracker exists, create one
    if (error.code === "PGRST116") {
      const newTracker = {
        team_id: teamId,
        og_count: role === "OG" ? 1 : 0,
        oo_count: role === "OO" ? 1 : 0,
        cg_count: role === "CG" ? 1 : 0,
        co_count: role === "CO" ? 1 : 0,
      }

      const { error: insertError } = await supabase.from("roles_tracker").insert([newTracker])

      if (insertError) throw insertError
      return newTracker
    }
    throw error
  }

  // Update the appropriate counter
  const updates = { ...data }
  if (role === "OG") updates.og_count += 1
  if (role === "OO") updates.oo_count += 1
  if (role === "CG") updates.cg_count += 1
  if (role === "CO") updates.co_count += 1

  const { data: updated, error: updateError } = await supabase
    .from("roles_tracker")
    .update(updates)
    .eq("id", data.id)
    .select()
    .single()

  if (updateError) throw updateError
  return updated
}

export const calculateTeamPoints = (rank) => {
  // BP debate scoring: 1st = 3 points, 2nd = 2 points, 3rd = 1 point, 4th = 0 points
  const pointsMap = {
    1: 3,
    2: 2,
    3: 1,
    4: 0,
  }

  return pointsMap[rank] || 0
}

export const scaleRawPoints = (rawPoints, maxPoints = 100) => {
  // Scale raw speaker points to a percentage of max
  return (rawPoints / maxPoints) * 100
}
