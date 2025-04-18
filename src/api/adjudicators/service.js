export const validateAdjudicatorInput = (data) => {
  const errors = {}

  if (!data.name) {
    errors.name = "Adjudicator name is required"
  }

  if (!data.level) {
    errors.level = "Experience level is required"
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

export const suggestAdjudicators = (matches, adjudicators, previousAssignments = []) => {
  // Simple algorithm to suggest adjudicators for matches
  // In a real system, this would be more sophisticated

  const suggestions = {}

  // Sort adjudicators by experience level
  const sortedAdjudicators = [...adjudicators].sort((a, b) => {
    const levelOrder = { expert: 3, experienced: 2, novice: 1 }
    return levelOrder[b.level] - levelOrder[a.level]
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
