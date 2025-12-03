export interface PlanetBaseInfo {
  name: string;
  color: string;
  radiusScale: number; // Visual scale relative to others in the 3D view
  description?: string;
  distance: number; // Distance from sun in 3D units
  speed: number;    // Orbit rotation speed
}

export interface AtmosphereComponent {
  gas: string;
  percentage: number;
}

export interface ResourceData {
  name: string;
  density: number; // 0-100
  type: string;
}

export interface PlanetData2035 {
  mass: string; // e.g. "0.107 Earths"
  orbitalPeriod: string; // e.g. "687 Days"
  atmosphere: AtmosphereComponent[];
  geomagneticStrength: string; // e.g. "0.25 Gauss"
  
  // Resource Distribution
  rareMineralsDensity: number; // 0-100
  mainEnergyType: string; // e.g. "Solar", "Nuclear Fusion (He-3)", "Geothermal"
  waterCoverage: number; // 0-100%
  
  // Ecological/Habitability Index
  biodiversityIndex: number; // 0-100
  climateStability: number; // 0-100
  pollutionLevel: number; // 0-100
  
  // Narrative
  statusReport: string;
}

export interface PlanetFullState extends PlanetBaseInfo, PlanetData2035 {}