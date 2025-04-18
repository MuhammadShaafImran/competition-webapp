import { createTeam } from "./write"
import Papa from "papaparse"

export const validateTeamInput = (data) => {
  const errors = {}

  if (!data.name) {
    errors.name = "Team name is required"
  }

  if (!data.tournament_id) {
    errors.tournament_id = "Tournament ID is required"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateTeamMemberInput = (data) => {
  const errors = {}

  if (!data.name) {
    errors.name = "Member name is required"
  }

  // Email is optional but should be valid if provided
  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.email = "Valid email is required"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const batchUploadTeams = async (csvFile, tournamentId) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvFile, {
      header: true,
      complete: async (results) => {
        try {
          const teams = {}

          // Group members by team
          results.data.forEach((row) => {
            if (!row.team_name) return

            if (!teams[row.team_name]) {
              teams[row.team_name] = []
            }

            if (row.member_name) {
              teams[row.team_name].push({
                name: row.member_name,
                email: row.member_email || null,
              })
            }
          })

          // Create teams with members
          const createdTeams = []
          for (const [teamName, members] of Object.entries(teams)) {
            const team = await createTeam({ name: teamName, tournament_id: tournamentId }, members)
            createdTeams.push(team)
          }

          resolve(createdTeams)
        } catch (error) {
          reject(error)
        }
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}
