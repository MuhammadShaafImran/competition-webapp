import { createTeam } from "./write"
import Papa from "papaparse"

// Validation for a single team input
export const validateTeamInput = (data, isCSVImport = false) => {
  const errors = {}

  if (!data.name) errors.name = "Team name is required"
  
  // Make institute optional
  if (!isCSVImport && !data.institute) errors.institute = "Institute is required"
  
  if (!data.tournament_id) errors.tournament_id = "Tournament ID is required"

  // For CSV imports, only require team name and tournament_id
  if (!isCSVImport) {
    // Validate member 1
    if (!data.member_1_name) errors.member_1_name = "First member name is required"
    if (data.member_1_email && !/^\S+@\S+\.\S+$/.test(data.member_1_email)) {
      errors.member_1_email = "Valid email for member 1 is required"
    }

    // Validate member 2
    if (!data.member_2_name) errors.member_2_name = "Second member name is required"
    if (data.member_2_email && !/^\S+@\S+\.\S+$/.test(data.member_2_email)) {
      errors.member_2_email = "Valid email for member 2 is required"
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Batch upload teams based on CSV format: team, institute, member1, member1-email, member2, member2-email
export const batchUploadTeams = async (csvFile, tournamentId) => {
  return new Promise((resolve, reject) => {
    if (!csvFile) {
      reject(new Error("No CSV file provided"));
      return;
    }

    if (!tournamentId) {
      reject(new Error("Tournament ID is required"));
      return;
    }

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const createdTeams = [];
          const errors = [];

          if (!results.data || results.data.length === 0) {
            reject(new Error("CSV file contains no valid data"));
            return;
          }

          // Expected columns and possible aliases
          const columnMappings = {
            'team': ['team', 'team name', 'teamname', 'team_name'],
            'institute': ['institute', 'institution', 'school', 'organization', 'org'],
            'member1': ['member1', 'member 1', 'member-1', 'member_1', 'first member', 'first_member'],
            'member1-email': ['member1-email', 'member1 email', 'member1email', 'member_1_email', 'member1_email', 'email1'],
            'member2': ['member2', 'member 2', 'member-2', 'member_2', 'second member', 'second_member'], 
            'member2-email': ['member2-email', 'member2 email', 'member2email', 'member_2_email', 'member2_email', 'email2']
          };
          
          // Detect which columns exist in the CSV
          const headers = Object.keys(results.data[0]).map(h => h.toLowerCase().trim());
          const mappedColumns = {};
          
          // Map CSV headers to our expected column names
          Object.keys(columnMappings).forEach(columnKey => {
            const possibleMatches = columnMappings[columnKey];
            const match = headers.find(header => possibleMatches.includes(header.toLowerCase()));
            if (match) {
              mappedColumns[columnKey] = match;
            }
          });
          
          // Check if at least the team column exists
          if (!mappedColumns['team']) {
            reject(new Error(`CSV must have a column for team name (like "team", "team name", etc.)`));
            return;
          }

          for (let i = 0; i < results.data.length; i++) {
            const row = results.data[i];
            if (!row || Object.keys(row).length === 0) continue;
            
            try {
              // Extract data using our mapped column names
              const teamData = {
                name: mappedColumns['team'] ? row[mappedColumns['team']]?.trim() : '',
                institute: mappedColumns['institute'] ? row[mappedColumns['institute']]?.trim() : '',
                tournament_id: tournamentId,
                member_1_name: mappedColumns['member1'] ? row[mappedColumns['member1']]?.trim() : '',
                member_1_email: mappedColumns['member1-email'] ? row[mappedColumns['member1-email']]?.trim() : '',
                member_2_name: mappedColumns['member2'] ? row[mappedColumns['member2']]?.trim() : '',
                member_2_email: mappedColumns['member2-email'] ? row[mappedColumns['member2-email']]?.trim() : '',
              };

              const { isValid, errors: validationErrors } = validateTeamInput(teamData, true);

              if (!isValid) {
                throw new Error(
                  `Validation failed for team "${teamData.name || `at row ${i+1}`}": ${JSON.stringify(validationErrors)}`
                );
              }

              const created = await createTeam(teamData);
              createdTeams.push(created);
            } catch (error) {
              // Collect errors but continue processing
              errors.push({
                row: i + 1,
                teamName: mappedColumns['team'] ? row[mappedColumns['team']]?.trim() || `Row ${i+1}` : `Row ${i+1}`,
                error: error.message
              });
            }
          }

          resolve({
            createdTeams,
            totalCreated: createdTeams.length,
            totalErrors: errors.length,
            errors: errors.length > 0 ? errors : null
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
}
