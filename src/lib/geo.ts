// Haversine formula to calculate distance between two points
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Radius of the Earth in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Convert state + city to approximate coordinates
export const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  // Major cities for fallback
  'NEW YORK,NY': { lat: 40.7128, lng: -74.0060 },
  'LOS ANGELES,CA': { lat: 34.0522, lng: -118.2437 },
  'CHICAGO,IL': { lat: 41.8781, lng: -87.6298 },
  'HOUSTON,TX': { lat: 29.7604, lng: -95.3698 },
  'PHOENIX,AZ': { lat: 33.4484, lng: -112.0740 },
  'PHILADELPHIA,PA': { lat: 39.9526, lng: -75.1652 },
  'SAN ANTONIO,TX': { lat: 29.4241, lng: -98.4936 },
  'SAN DIEGO,CA': { lat: 32.7157, lng: -117.1611 },
  'DALLAS,TX': { lat: 32.7767, lng: -96.7970 },
  'SAN JOSE,CA': { lat: 37.3382, lng: -121.8863 },
  'WASHINGTON,DC': { lat: 38.9072, lng: -77.0369 },
  'BOSTON,MA': { lat: 42.3601, lng: -71.0589 },
  'SEATTLE,WA': { lat: 47.6062, lng: -122.3321 },
  'DENVER,CO': { lat: 39.7392, lng: -104.9903 },
  'MIAMI,FL': { lat: 25.7617, lng: -80.1918 },
  'ATLANTA,GA': { lat: 33.7490, lng: -84.3880 },
  'AUSTIN,TX': { lat: 30.2672, lng: -97.7431 },
  'DETROIT,MI': { lat: 42.3314, lng: -83.0458 },
  'MINNEAPOLIS,MN': { lat: 44.9778, lng: -93.2650 },
  'PORTLAND,OR': { lat: 45.5152, lng: -122.6784 },
};

// State center coordinates for fallback
export const stateCoordinates: Record<string, { lat: number; lng: number }> = {
  'AL': { lat: 32.3182, lng: -86.9023 },
  'AK': { lat: 64.0685, lng: -152.2782 },
  'AZ': { lat: 34.0489, lng: -111.0937 },
  'AR': { lat: 34.7465, lng: -92.2896 },
  'CA': { lat: 36.7783, lng: -119.4179 },
  'CO': { lat: 39.5501, lng: -105.7821 },
  'CT': { lat: 41.6032, lng: -73.0877 },
  'DE': { lat: 38.9108, lng: -75.5277 },
  'DC': { lat: 38.9072, lng: -77.0369 },
  'FL': { lat: 27.6648, lng: -81.5158 },
  'GA': { lat: 32.1656, lng: -82.9001 },
  'HI': { lat: 19.8968, lng: -155.5828 },
  'ID': { lat: 44.0682, lng: -114.7420 },
  'IL': { lat: 40.6331, lng: -89.3985 },
  'IN': { lat: 40.2672, lng: -86.1349 },
  'IA': { lat: 41.8780, lng: -93.0977 },
  'KS': { lat: 39.0119, lng: -98.4842 },
  'KY': { lat: 37.8393, lng: -84.2700 },
  'LA': { lat: 30.9843, lng: -91.9623 },
  'ME': { lat: 45.2538, lng: -69.4455 },
  'MD': { lat: 39.0458, lng: -76.6413 },
  'MA': { lat: 42.4072, lng: -71.3824 },
  'MI': { lat: 44.3148, lng: -85.6024 },
  'MN': { lat: 46.7296, lng: -94.6859 },
  'MS': { lat: 32.3547, lng: -89.3985 },
  'MO': { lat: 37.9643, lng: -91.8318 },
  'MT': { lat: 46.8797, lng: -110.3626 },
  'NE': { lat: 41.4925, lng: -99.9018 },
  'NV': { lat: 38.8026, lng: -116.4194 },
  'NH': { lat: 43.1939, lng: -71.5724 },
  'NJ': { lat: 40.0583, lng: -74.4057 },
  'NM': { lat: 34.5199, lng: -105.8701 },
  'NY': { lat: 40.7128, lng: -74.0060 },
  'NC': { lat: 35.7596, lng: -79.0193 },
  'ND': { lat: 47.5515, lng: -101.0020 },
  'OH': { lat: 40.4173, lng: -82.9071 },
  'OK': { lat: 35.0078, lng: -97.0929 },
  'OR': { lat: 43.8041, lng: -120.5542 },
  'PA': { lat: 41.2033, lng: -77.1945 },
  'PR': { lat: 18.2208, lng: -66.5901 },
  'RI': { lat: 41.5801, lng: -71.4774 },
  'SC': { lat: 33.8361, lng: -81.1637 },
  'SD': { lat: 43.9695, lng: -99.9018 },
  'TN': { lat: 35.5175, lng: -86.5804 },
  'TX': { lat: 31.9686, lng: -99.9018 },
  'UT': { lat: 39.3210, lng: -111.0937 },
  'VT': { lat: 44.5588, lng: -72.5778 },
  'VA': { lat: 37.4316, lng: -78.6569 },
  'WA': { lat: 47.7511, lng: -120.7401 },
  'WV': { lat: 38.5976, lng: -80.4549 },
  'WI': { lat: 43.7844, lng: -88.7879 },
  'WY': { lat: 43.0760, lng: -107.2903 }
};

// Get coordinates for a contract location
export function getContractCoordinates(city: string | null, state: string | null): { lat: number; lng: number } | null {
  if (!state) return null;
  
  // Try city,state first
  if (city) {
    const cityKey = `${city.toUpperCase()},${state.toUpperCase()}`;
    if (cityCoordinates[cityKey]) {
      return cityCoordinates[cityKey];
    }
  }
  
  // Fallback to state center
  return stateCoordinates[state.toUpperCase()] || null;
}