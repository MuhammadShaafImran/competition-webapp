export const validateTournamentInput = (data) => {
  const errors = {}

  if (!data.name) {
    errors.name = "Tournament name is required"
  }

  if (!data.rounds || data.rounds < 1) {
    errors.rounds = "Number of rounds must be at least 1"
  }

  if (data.break_stages && !Array.isArray(data.break_stages)) {
    errors.break_stages = "Break stages must be an array"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const calculateBreakTeams = (totalTeams, breakPercentage = 0.25) => {
  // Calculate how many teams should break based on percentage
  const breakCount = Math.floor(totalTeams * breakPercentage)

  // Ensure it's a multiple of 4 for BP debate
  return Math.floor(breakCount / 4) * 4
}
