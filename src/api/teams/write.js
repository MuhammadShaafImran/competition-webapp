import supabase from "../supabaseClient"
import { v4 as uuidv4 } from "uuid"

export const createTeam = async (teamData, members) => {
  // Start a transaction
  const { data: team, error: teamError } = await supabase.from("teams").insert([teamData]).select().single()

  if (teamError) throw teamError

  // Add team members
  if (members && members.length > 0) {
    const teamMembers = members.map((member) => ({
      ...member,
      team_id: team.id,
    }))

    const { error: membersError } = await supabase.from("team_members").insert(teamMembers)

    if (membersError) throw membersError
  }

  // Initialize role tracker
  const { error: trackerError } = await supabase.from("roles_tracker").insert([
    {
      team_id: team.id,
      og_count: 0,
      oo_count: 0,
      cg_count: 0,
      co_count: 0,
    },
  ])

  if (trackerError) throw trackerError

  return team
}

export const updateTeam = async (teamId, teamData) => {
  const { data, error } = await supabase.from("teams").update(teamData).eq("id", teamId).select().single()

  if (error) throw error
  return data
}

export const deleteTeam = async (teamId) => {
  // Delete team members first (cascade would handle this, but being explicit)
  const { error: membersError } = await supabase.from("team_members").delete().eq("team_id", teamId)

  if (membersError) throw membersError

  // Delete role tracker
  const { error: trackerError } = await supabase.from("roles_tracker").delete().eq("team_id", teamId)

  if (trackerError) throw trackerError

  // Delete team
  const { error: teamError } = await supabase.from("teams").delete().eq("id", teamId)

  if (teamError) throw teamError

  return { success: true }
}

export const createTeamLink = async (teamId, tournamentId, expiresInDays = 30) => {
  // Calculate expiration date
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  // Generate unique token
  const token = uuidv4()

  const { data, error } = await supabase
    .from("team_links")
    .insert([
      {
        team_id: teamId,
        tournament_id: tournamentId,
        uuid: token,
        expires_at: expiresAt.toISOString(),
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}
