import supabase from "../supabaseClient"

/**
 * Get all teams for a specific tournament
 * @param {string} tournamentId - The tournament ID
 * @returns {Promise<Array>} - Array of team objects
 */
export const getTeamsByTournament = async (tournamentId) => {
  if (!tournamentId) {
    throw new Error("Tournament ID is required");
  }

  try {
    const { data, error } = await supabase
      .from("teams")
      .select(`
        id,
        name,
        member_1_name,
        member_1_email,
        member_2_name,
        member_2_email,
        institute,
        tournament_id
      `)
      .eq("tournament_id", tournamentId)
      .order("name")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error(`Error fetching teams for tournament ${tournamentId}:`, error.message);
    throw new Error(`Failed to fetch teams: ${error.message}`);
  }
}

/**
 * Get detailed information about a specific team by ID
 * @param {string} teamId - The team ID
 * @returns {Promise<Object>} - Team object with detailed information
 */
export const getTeamById = async (teamId) => {
  if (!teamId) {
    throw new Error("Team ID is required");
  }

  try {
    const { data, error } = await supabase
      .from("teams")
      .select(`
        id,
        name,
        member_1_name,
        member_1_email,
        member_2_name,
        member_2_email,
        institute,
        tournament_id,
        match_roles (
          role,
          match_id,
          match:matches (
            id,
            round_id,
            is_break_round,
            is_completed,
            created_at
          )
        ),
        speaker_points (
          match_id,
          member_1_points,
          member_2_points
        )
      `)
      .eq("id", teamId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(`Team with ID ${teamId} not found`);
      }
      throw error;
    }
    
    return data
  } catch (error) {
    console.error(`Error fetching team ${teamId}:`, error.message);
    throw new Error(`Failed to fetch team details: ${error.message}`);
  }
}

/**
 * Get team information using a private token
 * @param {string} token - The private token for the team
 * @returns {Promise<Object>} - Team object with related tournament information
 */
export const getTeamByToken = async (token) => {
  if (!token) {
    throw new Error("Team token is required");
  }

  try {
    const { data, error } = await supabase
      .from("teams")
      .select(`
        *,
        tournament:tournaments (
          id,
          name,
          num_rounds,
          break_rounds,
          is_final_result_uploaded
        ),
        match_roles (
          role,
          match_id,
          match:matches (
            round_id,
            is_break_round,
            is_completed,
            created_at
          )
        ),
        speaker_points (
          match_id,
          member_1_points,
          member_2_points
        )
      `)
      .eq("private_token", token)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(`No team found with the provided token`);
      }
      throw error;
    }
    
    return data
  } catch (error) {
    console.error(`Error fetching team by token:`, error.message);
    throw new Error(`Failed to fetch team: ${error.message}`);
  }
}
