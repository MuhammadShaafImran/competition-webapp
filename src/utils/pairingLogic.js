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
      { ...teamsToUse[i], role: "og" },
      { ...teamsToUse[i + 1], role: "oo" },
      { ...teamsToUse[i + 2], role: "cg" },
      { ...teamsToUse[i + 3], role: "co" },
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
      { ...teamsToUse[i], role: "og" },
      { ...teamsToUse[i + 1], role: "oo" },
      { ...teamsToUse[i + 2], role: "cg" },
      { ...teamsToUse[i + 3], role: "co" },
    ]
    pairings.push(debate)
  }

  return pairings
}

const assignRolesFairly = (teams) => {
  // Assign roles based on prior assignments to ensure fair distribution
  // Each debate has 4 positions: og, oo, cg, co
  const rolePoints = {
    og: 3,
    oo: 2,
    cg: 1,
    co: 0
  }

  const rolePreferences = teams.map(team => {
    const priorRoles = team.match_roles || []
    const roleCounts = {
      og: priorRoles.filter(r => r.og === 1).length,
      oo: priorRoles.filter(r => r.oo === 1).length,
      cg: priorRoles.filter(r => r.cg === 1).length,
      co: priorRoles.filter(r => r.co === 1).length
    }

    // Calculate preference score for each role (lower is better)
    const preferences = Object.entries(rolePoints).map(([role, points]) => ({
      role,
      score: (roleCounts[role] * 2) - points // Balance frequency with position strength
    }))

    return {
      team,
      preferences: preferences.sort((a, b) => a.score - b.score)
    }
  })

  // Sort teams by their cumulative role scores (give priority to teams with worse positions)
  rolePreferences.sort((a, b) => {
    const aScore = Object.values(rolePoints).reduce((sum, points, i) => 
      sum + (a.team.match_roles?.filter(r => r[Object.keys(rolePoints)[i]] === 1).length || 0) * points, 0)
    const bScore = Object.values(rolePoints).reduce((sum, points, i) => 
      sum + (b.team.match_roles?.filter(r => r[Object.keys(rolePoints)[i]] === 1).length || 0) * points, 0)
    return aScore - bScore
  })

  // Assign roles
  const assignedRoles = new Set()
  const assignments = rolePreferences.map(rp => {
    // Find the best available role
    const role = rp.preferences.find(p => !assignedRoles.has(p.role))?.role || 'CO'
    assignedRoles.add(role)
    
    return {
      ...rp.team,
      og: role === 'og' ? 1 : 0,
      oo: role === 'oo' ? 1 : 0,
      cg: role === 'cg' ? 1 : 0,
      co: role === 'co' ? 1 : 0
    }
  })

  return assignments
}
