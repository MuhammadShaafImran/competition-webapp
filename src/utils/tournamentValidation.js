/**
 * Validation utility for tournament data
 */

/**
 * Validates tournament creation/update data
 * @param {Object} data - Tournament data to validate
 * @returns {Object} Result with isValid flag and any errors
 */
export const validateTournamentData = (data) => {
  const errors = {};

  // Name validation
  if (!data.name) {
    errors.name = "Tournament name is required";
  } else if (data.name.length < 3) {
    errors.name = "Tournament name must be at least 3 characters";
  } else if (data.name.length > 100) {
    errors.name = "Tournament name must be less than 100 characters";
  }

  // Date validation
  if (!data.start_date) {
    errors.start_date = "Start date is required";
  }

  if (!data.end_date) {
    errors.end_date = "End date is required";
  }

  if (data.start_date && data.end_date) {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    
    if (isNaN(start.getTime())) {
      errors.start_date = "Invalid start date format";
    }
    
    if (isNaN(end.getTime())) {
      errors.end_date = "Invalid end date format";
    }
    
    if (!errors.start_date && !errors.end_date && start > end) {
      errors.end_date = "End date must be after start date";
    }
  }

  // Number of rounds validation
  if (data.num_rounds === undefined || data.num_rounds === null) {
    errors.num_rounds = "Number of preliminary rounds is required";
  } else if (isNaN(Number(data.num_rounds))) {
    errors.num_rounds = "Number of preliminary rounds must be a number";
  } else if (Number(data.num_rounds) < 1) {
    errors.num_rounds = "At least 1 preliminary round is required";
  } else if (Number(data.num_rounds) > 20) {
    errors.num_rounds = "Maximum of 20 preliminary rounds allowed";
  }

  // Break rounds validation
  if (data.break_rounds === undefined || data.break_rounds === null) {
    errors.break_rounds = "Number of break rounds is required";
  } else if (isNaN(Number(data.break_rounds))) {
    errors.break_rounds = "Number of break rounds must be a number";
  } else if (Number(data.break_rounds) < 0) {
    errors.break_rounds = "Number of break rounds cannot be negative";
  } else if (Number(data.break_rounds) > 5) {
    errors.break_rounds = "Maximum of 5 break rounds allowed";
  }

  // Location validation (optional)
  if (data.location && data.location.length > 200) {
    errors.location = "Location must be less than 200 characters";
  }

  // Description validation (optional)
  if (data.description && data.description.length > 1000) {
    errors.description = "Description must be less than 1000 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates team count for tournament
 * @param {number} teamCount - Number of teams
 * @param {number} breakRounds - Number of break rounds
 * @returns {Object} Result with isValid flag and any errors
 */
export const validateTeamCount = (teamCount, breakRounds) => {
  const errors = {};
  
  if (teamCount < 4) {
    errors.teamCount = "Tournament must have at least 4 teams";
  }
  
  if (breakRounds > 0) {
    // Calculate minimum teams needed for the specified break rounds
    const minTeamsForBreak = Math.pow(2, breakRounds);
    
    if (teamCount < minTeamsForBreak) {
      errors.teamCount = `At least ${minTeamsForBreak} teams are required for ${breakRounds} break round${breakRounds > 1 ? 's' : ''}`;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates if a tournament can be finalized
 * @param {Object} tournament - Tournament data
 * @param {Array} completedRounds - Completed rounds data
 * @returns {Object} Result with isValid flag and any errors
 */
export const validateTournamentFinalization = (tournament, completedRounds) => {
  const errors = {};
  
  if (!tournament) {
    errors.tournament = "Tournament data is missing";
    return { isValid: false, errors };
  }
  
  // Check if all preliminary rounds are completed
  const completedPrelimRounds = completedRounds.filter(r => !r.is_break_round).length;
  
  if (completedPrelimRounds < tournament.num_rounds) {
    errors.rounds = `Only ${completedPrelimRounds} of ${tournament.num_rounds} preliminary rounds are completed`;
  }
  
  // Check if all break rounds are completed (if any)
  if (tournament.break_rounds > 0) {
    const completedBreakRounds = completedRounds.filter(r => r.is_break_round).length;
    
    if (completedBreakRounds < tournament.break_rounds) {
      errors.breakRounds = `Only ${completedBreakRounds} of ${tournament.break_rounds} break rounds are completed`;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};