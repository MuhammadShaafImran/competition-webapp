import Papa from "papaparse"
import { createAdjudicator } from "./write" 
// Assuming you have this function
export const validateAdjudicatorInput = (data) => {
  const errors = {}

  if (!data.name) {
    errors.name = "Adjudicator name is required"
  }

  if (!data.role) {
    errors.role = "Role is required"
  }

  // Email is required and should be valid
  if (!data.email) {
    errors.email = "Email is required"
  } else if (!/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.email = "Valid email is required"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const suggestAdjudicators = (matches, adjudicators, previousAssignments = []) => {
  // Simple algorithm to suggest adjudicators for matches
  // In a real system, this would be more sophisticated

  const suggestions = {}

  // Sort adjudicators by role priority (example)
  const roleOrder = { chair: 3, panelist: 2, trainee: 1 }
  const sortedAdjudicators = [...adjudicators].sort((a, b) => {
    return (roleOrder[b.role] || 0) - (roleOrder[a.role] || 0)
  })

  // For each match, suggest adjudicators
  matches.forEach((match) => {
    // Start with all adjudicators
    let available = [...sortedAdjudicators]

    // Filter out those who have judged these teams before
    if (previousAssignments.length > 0) {
      const teamIds = match.match_teams.map((mt) => mt.team_id)
      available = available.filter((adj) => {
        const prevAssignmentsForAdj = previousAssignments.filter((pa) => pa.adjudicator_id === adj.id)

        // Check if this adjudicator has judged any of these teams before
        for (const assignment of prevAssignmentsForAdj) {
          const match = assignment.match
          const matchTeamIds = match.match_teams.map((mt) => mt.team_id)
          if (matchTeamIds.some((id) => teamIds.includes(id))) {
            return false
          }
        }

        return true
      })
    }

    // Take the top 3 available adjudicators (or fewer if not enough)
    const count = Math.min(3, available.length)
    suggestions[match.id] = available.slice(0, count)
  })

  return suggestions
}

export const importAdjudicatorsFromCSV = (csvFile, tournamentId) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const createdAdjudicators = []

          for (const row of results.data) {
            // Normalize and trim fields
            const adjudicatorData = {
              name: row.name?.trim(),
              email: row.email?.trim().toLowerCase(),
              role: row.role?.trim().toLowerCase(),
              tournament_id: tournamentId,
            }

            // Validate each row
            const { isValid, errors } = validateAdjudicatorInput(adjudicatorData)
            if (!isValid) {
              throw new Error(
                `Validation failed for adjudicator "${adjudicatorData.name || "Unknown"}": ${JSON.stringify(errors)}`
              )
            }

            // Insert adjudicator (using your existing createAdjudicator function)
            const created = await createAdjudicator(adjudicatorData)
            createdAdjudicators.push(created)
          }

          resolve(createdAdjudicators)
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
