import { getTeamStandings } from "../api/standings/query"

export const generatePairings = async (teams, tournamentId, roundNumber, isBreak = false) => {
  // For the first round, do random pairings
  if (roundNumber === 1) {
    return randomPairings(teams)
  }

  // For break rounds, pair based on rankings
  if (isBreak) {
    const standings = await getTeamStandings(tournamentId)
    return breakRoundPairings(standings, teams)
  }

  // For regular rounds after the first, use power pairing
  const standings = await getTeamStandings(tournamentId)
  return powerPairings(standings, teams)
}

const randomPairings = (teams) => {
  // Shuffle teams
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5)

  // Ensure we have a multiple of 4 teams
  const teamsToUse = shuffledTeams.slice(0, Math.floor(shuffledTeams.length / 4) * 4)

  // Group into debates of 4 teams
  const pairings = []
  for (let i = 0; i < teamsToUse.length; i += 4) {
    const debate = [
      { ...teamsToUse[i], role: "OG" },
      { ...teamsToUse[i + 1], role: "OO" },
      { ...teamsToUse[i + 2], role: "CG" },
      { ...teamsToUse[i + 3], role: "CO" },
    ]
    pairings.push(debate)
  }

  return pairings
}

const powerPairings = (standings, teams) => {
  // Sort teams by their current standings
  const sortedTeams = [...teams].sort((a, b) => {
    const aStanding = standings.find((s) => s.id === a.id) || { totalTeamPoints: 0, totalSpeakerPoints: 0 }
    const bStanding = standings.find((s) => s.id === b.id) || { totalTeamPoints: 0, totalSpeakerPoints: 0 }

    // First by team points
    if (bStanding.totalTeamPoints !== aStanding.totalTeamPoints) {
      return bStanding.totalTeamPoints - aStanding.totalTeamPoints
    }

    // Then by speaker points
    return bStanding.totalSpeakerPoints - aStanding.totalSpeakerPoints
  })

  // Ensure we have a multiple of 4 teams
  const teamsToUse = sortedTeams.slice(0, Math.floor(sortedTeams.length / 4) * 4)

  // Group into debates of 4 teams, with similar ranked teams
  const pairings = []
  for (let i = 0; i < teamsToUse.length; i += 4) {
    // For each group of 4 teams, assign roles based on previous roles
    const debateTeams = teamsToUse.slice(i, i + 4)
    const debate = assignRolesFairly(debateTeams)
    pairings.push(debate)
  }

  return pairings
}

const breakRoundPairings = (standings, teams) => {
  // Sort by standings and take top teams
  const sortedTeams = [...teams].sort((a, b) => {
    const aStanding = standings.find((s) => s.id === a.id) || { totalTeamPoints: 0 }
    const bStanding = standings.find((s) => s.id === b.id) || { totalTeamPoints: 0 }
    return bStanding.totalTeamPoints - aStanding.totalTeamPoints
  })

  // Ensure we have a multiple of 4 teams
  const teamsToUse = sortedTeams.slice(0, Math.floor(sortedTeams.length / 4) * 4)

  // For break rounds, pair 1st with 2nd, 3rd with 4th, etc.
  const pairings = []
  for (let i = 0; i < teamsToUse.length; i += 4) {
    const debate = [
      { ...teamsToUse[i], role: "OG" },
      { ...teamsToUse[i + 1], role: "OO" },
      { ...teamsToUse[i + 2], role: "CG" },
      { ...teamsToUse[i + 3], role: "CO" },
    ]
    pairings.push(debate)
  }

  return pairings
}

const assignRolesFairly = (teams) => {
  // This would use the roles_tracker to ensure fair distribution
  // For simplicity, we'll just assign roles randomly here
  const roles = ["OG", "OO", "CG", "CO"]
  const shuffledRoles = [...roles].sort(() => Math.random() - 0.5)

  return teams.map((team, index) => ({
    ...team,
    role: shuffledRoles[index],
  }))
}
