import supabase from "../supabaseClient"

export const createMatch = async ({ 
  round_id, 
  tournament_id, 
  team_1_id, 
  team_2_id, 
  team_3_id, 
  team_4_id,
  is_break_round = false
}) => {
  // Create the match
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert([{
      round_id,
      tournament_id,
      team_1_id,
      team_2_id,
      team_3_id,
      team_4_id,
      is_completed: false,
      is_break_round,
    }])
    .select()
    .single()

  
  if (matchError) throw matchError
  console.log("Match created:", match)

  return match
}

export const submitMatchResults = async (matchId, results) => {
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("tournament_id")
    .eq("id", matchId)
    .single()
    
  if (matchError) throw matchError

  // First, clear any existing results
  await supabase.from("match_roles").delete().eq("match_id", matchId)
  await supabase.from("speaker_points").delete().eq("match_id", matchId)

  // Convert roles to new format
  const rolePromises = results.map(result => {
    const roleData = {
      match_id: matchId,
      team_id: result.team_id,
      og: result.role === 'og' ? 1 : 0,
      oo: result.role === 'oo' ? 1 : 0,
      cg: result.role === 'cg' ? 1 : 0,
      co: result.role === 'co' ? 1 : 0
    }
    return supabase.from("match_roles").insert(roleData)
  })
  
  // Insert speaker points
  const pointsPromises = results.map(result => 
    supabase.from("speaker_points").insert({
      match_id: matchId,
      tournament_id: match.tournament_id,
      team_id: result.team_id,
      member_1_points: result.member_1_points,
      member_2_points: result.member_2_points
    })
  )
  
  // Wait for all inserts to complete
  await Promise.all([...rolePromises, ...pointsPromises])
  
  // Mark match as completed
  const { error: updateError } = await supabase
    .from("matches")
    .update({ is_completed: true })
    .eq("id", matchId)

  if (updateError) throw updateError
  
  // Update standings for each team
  for (const result of results) {
    await supabase.rpc('submit_match_results', {
      p_match_id: matchId,
      p_team_roles: results.map(r => ({ 
        team_id: r.team_id, 
        og: r.role === 'og' ? 1 : 0,
        oo: r.role === 'oo' ? 1 : 0,
        cg: r.role === 'cg' ? 1 : 0,
        co: r.role === 'co' ? 1 : 0
      })),
      p_speaker_points: results.map(r => ({ 
        team_id: r.team_id, 
        member_1_points: r.member_1_points, 
        member_2_points: r.member_2_points 
      })),
      p_rank_order: results.map(r => r.team_id)
    })
  }

  return { success: true }
}

export const assignAdjudicators = async (matchId, adjudicatorIds) => {
  // First remove any existing adjudicators
  const { error: deleteError } = await supabase
    .from("match_adjudicators")
    .delete()
    .eq("match_id", matchId)

  if (deleteError) throw deleteError

  // Then add the new adjudicators
  const adjudicators = adjudicatorIds.map((id) => ({
    match_id: matchId,
    adjudicator_id: id,
  }))

  const { error } = await supabase
    .from("match_adjudicators")
    .insert(adjudicators)

  if (error) throw error

  return { success: true }
}
