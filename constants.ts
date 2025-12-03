import { PlanetBaseInfo } from './types';

export const PLANETS: PlanetBaseInfo[] = [
  { name: '水星', color: '#A5A5A5', radiusScale: 0.8, distance: 35, speed: 0.015 },
  { name: '金星', color: '#E3BB76', radiusScale: 1.1, distance: 50, speed: 0.012 },
  { name: '地球', color: '#2E86C1', radiusScale: 1.2, distance: 70, speed: 0.01 },
  { name: '火星', color: '#C0392B', radiusScale: 0.9, distance: 90, speed: 0.008 },
  { name: '木星', color: '#D4AC6E', radiusScale: 2.5, distance: 130, speed: 0.005 },
  { name: '土星', color: '#F4D03F', radiusScale: 2.2, distance: 170, speed: 0.004 },
  { name: '天王星', color: '#73C6B6', radiusScale: 1.8, distance: 210, speed: 0.003 },
  { name: '海王星', color: '#5DADE2', radiusScale: 1.8, distance: 250, speed: 0.002 },
];

export const MOCK_DATA_EARTH: any = {
  mass: "1 地球质量",
  orbitalPeriod: "365.25 天",
  atmosphere: [
    { gas: "氮气", percentage: 78 },
    { gas: "氧气", percentage: 21 },
    { gas: "氩气", percentage: 0.9 }
  ],
  geomagneticStrength: "0.50 高斯",
  rareMineralsDensity: 45,
  mainEnergyType: "核聚变/可再生能源",
  waterCoverage: 71,
  biodiversityIndex: 65,
  climateStability: 78,
  pollutionLevel: 30,
  statusReport: "2035年：大修复计划正在进行中。大气碳捕获网络已稳定全球气温。生物多样性丧失已停止，前工业区正在扩展野化项目。"
};