import { createTeam } from "./write"
import Papa from "papaparse"

// Validation for a single team input
export const validateTeamInput = (data) => {
  const errors = {}

  if (!data.name) errors.name = "Team name is required"
  if (!data.institute) errors.institute = "Institute is required"
  if (!data.tournament_id) errors.tournament_id = "Tournament ID is required"

  if (!data.member_1_name) errors.member_1_name = "First member name is required"
  if (!data.member_1_email || !/^\S+@\S+\.\S+$/.test(data.member_1_email)) {
    errors.member_1_email = "Valid email for member 1 is required"
  }

  if (!data.member_2_name) errors.member_2_name = "Second member name is required"
  if (!data.member_2_email || !/^\S+@\S+\.\S+$/.test(data.member_2_email)) {
    errors.member_2_email = "Valid email for member 2 is required"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Batch upload teams based on CSV format: team, institute, member1, member1-email, member2, member2-email
export const batchUploadTeams = async (csvFile, tournamentId) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const createdTeams = []

          for (const row of results.data) {
            console.log("Row data:", row)
            
            const teamData = {
              name: row.team?.trim(),
              institute: row.institute?.trim(),
              tournament_id: tournamentId,

              member_1_name: row.member1?.trim(),
              member_1_email: row["member1-email"]?.trim(),

              member_2_name: row.member2?.trim(),
              member_2_email: row["member2-email"]?.trim(),
            }

            const { isValid, errors } = validateTeamInput(teamData)

            if (!isValid) {
              throw new Error(
                `Validation failed for team "${teamData.name}": ${JSON.stringify(errors)}`
              )
            }

            const created = await createTeam(teamData)
            createdTeams.push(created)
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
