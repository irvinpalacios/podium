// Ergast API client
// Using Jolpica as the drop-in Ergast replacement (same endpoints, more reliable).
// To revert to Ergast: change BASE_URL to 'https://ergast.com/api/f1'
const BASE_URL = 'https://api.jolpi.ca/ergast/f1'

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Ergast fetch failed: ${res.status} ${url}`)
  return res.json()
}

/**
 * Fetch all available F1 seasons (2000–current).
 *
 * @returns {Promise<Season[]>} Array of { season, url } objects
 */
export async function getSeasons() {
  // Ergast caps responses at 30 items by default; request enough to cover all seasons
  const data = await fetchJson(`${BASE_URL}/seasons.json?limit=100&offset=0`)
  return data.MRData.SeasonTable.Seasons.filter(s => parseInt(s.season) >= 2000)
}

/**
 * Fetch the race schedule for a given season.
 *
 * @param {number|string} year
 * @param {string}        [series='f1']
 * @returns {Promise<Race[]>} Array of Ergast Race objects
 */
export async function getSeasonRaces(year, series = 'f1') {
  const data = await fetchJson(`${BASE_URL}/${year}/races.json?limit=30`)
  return data.MRData.RaceTable.Races
}

/**
 * Fetch the race results for a specific round.
 * Returns the top-3 (podium) plus full result list in the Ergast shape.
 *
 * @param {number|string} year
 * @param {number|string} round
 * @param {string}        [series='f1']
 * @returns {Promise<Race>} Ergast Race object with Results array
 */
export async function getRaceResults(year, round, series = 'f1') {
  const data = await fetchJson(`${BASE_URL}/${year}/${round}/results.json?limit=25`)
  return data.MRData.RaceTable.Races[0] ?? null
}

/**
 * Fetch the full driver list for a given season.
 *
 * @param {number|string} year
 * @param {string}        [series='f1']
 * @returns {Promise<Driver[]>} Array of Ergast Driver objects
 */
export async function getSeasonDrivers(year, series = 'f1') {
  const data = await fetchJson(`${BASE_URL}/${year}/drivers.json?limit=40`)
  return data.MRData.DriverTable.Drivers
}

/**
 * Fetch the full constructor list for a given season.
 *
 * @param {number|string} year
 * @param {string}        [series='f1']
 * @returns {Promise<Constructor[]>} Array of Ergast Constructor objects
 */
export async function getSeasonConstructors(year, series = 'f1') {
  const data = await fetchJson(`${BASE_URL}/${year}/constructors.json?limit=30`)
  return data.MRData.ConstructorTable.Constructors
}
