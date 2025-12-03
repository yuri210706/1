import { GoogleGenAI, Type } from "@google/genai";
import { PlanetData2035 } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Pre-defined fallback data to use when API quota is exceeded
const FALLBACK_DB: Record<string, PlanetData2035> = {
  '水星': {
    mass: "0.055 地球质量",
    orbitalPeriod: "88 天",
    atmosphere: [{ gas: "氧气", percentage: 42 }, { gas: "钠", percentage: 29 }, { gas: "氢", percentage: 22 }],
    geomagneticStrength: "0.003 高斯",
    rareMineralsDensity: 85,
    mainEnergyType: "高能太阳能",
    waterCoverage: 0,
    biodiversityIndex: 0,
    climateStability: 10,
    pollutionLevel: 5,
    statusReport: "2035年：赫尔墨斯太阳能阵列已覆盖赤道区域。地下矿业基地运行效率达到 300%。表面温度极值利用实验正在进行。"
  },
  '金星': {
    mass: "0.815 地球质量",
    orbitalPeriod: "225 天",
    atmosphere: [{ gas: "二氧化碳", percentage: 96 }, { gas: "氮气", percentage: 3 }, { gas: "二氧化硫", percentage: 0.015 }],
    geomagneticStrength: "微弱",
    rareMineralsDensity: 60,
    mainEnergyType: "地热/大气热能",
    waterCoverage: 0,
    biodiversityIndex: 2,
    climateStability: 5,
    pollutionLevel: 90,
    statusReport: "2035年：'天堂之城'浮空殖民地已扩展至第三阶段。大气酸性中和剂投放显现初步成效。云层微生物研究取得突破。"
  },
  '地球': {
    mass: "1 地球质量",
    orbitalPeriod: "365.25 天",
    atmosphere: [{ gas: "氮气", percentage: 78 }, { gas: "氧气", percentage: 21 }, { gas: "氩气", percentage: 0.9 }],
    geomagneticStrength: "0.50 高斯",
    rareMineralsDensity: 45,
    mainEnergyType: "核聚变/可再生能源",
    waterCoverage: 71,
    biodiversityIndex: 65,
    climateStability: 78,
    pollutionLevel: 30,
    statusReport: "2035年：大修复计划正在进行中。大气碳捕获网络已稳定全球气温。生物多样性丧失已停止，前工业区正在扩展野化项目。"
  },
  '火星': {
    mass: "0.107 地球质量",
    orbitalPeriod: "687 天",
    atmosphere: [{ gas: "二氧化碳", percentage: 95 }, { gas: "氮气", percentage: 2.8 }, { gas: "氩气", percentage: 2 }],
    geomagneticStrength: "局部异常",
    rareMineralsDensity: 70,
    mainEnergyType: "核裂变/太阳能",
    waterCoverage: 15,
    biodiversityIndex: 12,
    climateStability: 40,
    pollutionLevel: 20,
    statusReport: "2035年：奥林匹斯山基地已实现氧气自给自足。极地冰盖融化工程启动，并在瓦利斯水手谷发现了地下液态水库。"
  },
  '木星': {
    mass: "317.8 地球质量",
    orbitalPeriod: "11.86 年",
    atmosphere: [{ gas: "氢气", percentage: 90 }, { gas: "氦气", percentage: 10 }, { gas: "甲烷", percentage: 0.3 }],
    geomagneticStrength: "4.17 高斯",
    rareMineralsDensity: 30,
    mainEnergyType: "He-3 聚变采集",
    waterCoverage: 0,
    biodiversityIndex: 0,
    climateStability: 20,
    pollutionLevel: 0,
    statusReport: "2035年：轨道收集站正在大规模开采氦-3。木卫二前哨站报告冰下海洋存在复杂有机分子。大红斑风暴监测站运行正常。"
  },
  '土星': {
    mass: "95.2 地球质量",
    orbitalPeriod: "29.46 年",
    atmosphere: [{ gas: "氢气", percentage: 96 }, { gas: "氦气", percentage: 3 }, { gas: "甲烷", percentage: 0.4 }],
    geomagneticStrength: "0.21 高斯",
    rareMineralsDensity: 25,
    mainEnergyType: "氢同位素提取",
    waterCoverage: 0,
    biodiversityIndex: 0,
    climateStability: 25,
    pollutionLevel: 0,
    statusReport: "2035年：土星环采矿权已分配给三大财团。泰坦卫星（土卫六）大气层内正在测试新型旋翼飞行器。卡西尼空隙中转站建设中。"
  },
  '天王星': {
    mass: "14.5 地球质量",
    orbitalPeriod: "84 年",
    atmosphere: [{ gas: "氢气", percentage: 83 }, { gas: "氦气", percentage: 15 }, { gas: "甲烷", percentage: 2 }],
    geomagneticStrength: "0.23 高斯",
    rareMineralsDensity: 40,
    mainEnergyType: "风能/化学能",
    waterCoverage: 0,
    biodiversityIndex: 0,
    climateStability: 15,
    pollutionLevel: 0,
    statusReport: "2035年：深空探测器'天王星开拓者'已入轨。正在研究其极端的磁场倾斜。钻石雨收集技术仍处于理论验证阶段。"
  },
  '海王星': {
    mass: "17.1 地球质量",
    orbitalPeriod: "164.8 年",
    atmosphere: [{ gas: "氢气", percentage: 80 }, { gas: "氦气", percentage: 19 }, { gas: "甲烷", percentage: 1.5 }],
    geomagneticStrength: "0.14 高斯",
    rareMineralsDensity: 45,
    mainEnergyType: "核能 (RTG)",
    waterCoverage: 0,
    biodiversityIndex: 0,
    climateStability: 10,
    pollutionLevel: 0,
    statusReport: "2035年：太阳系边缘的前哨站。海王星深潜器已下潜至超临界流体层。柯伊伯带天体监测网络以此为中心节点。"
  }
};

const DEFAULT_FALLBACK: PlanetData2035 = {
  mass: "未知",
  orbitalPeriod: "计算中...",
  atmosphere: [{ gas: "N/A", percentage: 0 }],
  geomagneticStrength: "未知",
  rareMineralsDensity: 50,
  mainEnergyType: "未知",
  waterCoverage: 0,
  biodiversityIndex: 0,
  climateStability: 0,
  pollutionLevel: 0,
  statusReport: "由于亚空间通信干扰（API 配额限制），无法连接到星际数据库。显示最后已知缓存。",
};

export const fetchPlanetData2035 = async (planetName: string): Promise<PlanetData2035> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    为行星 ${planetName} 生成一份 2035 年的推测性科幻风格“星际数据报告”。
    假设在太空探索、采矿或地球化改造（特别是针对火星、月球、地球）方面已取得技术进步。
    
    请返回符合架构的严格 JSON 数据。
    'atmosphere'（大气层）字段提供前三种气体。
    'statusReport'（状态报告）请写一段关于 2035 年该星球状态的酷炫军事/科学简报（最多 50 个汉字）。
    所有返回的文本内容必须是中文。
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mass: { type: Type.STRING, description: "相对质量 (例如 0.5 地球)" },
            orbitalPeriod: { type: Type.STRING },
            atmosphere: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  gas: { type: Type.STRING },
                  percentage: { type: Type.NUMBER }
                }
              }
            },
            geomagneticStrength: { type: Type.STRING },
            rareMineralsDensity: { type: Type.NUMBER, description: "0-100 scale" },
            mainEnergyType: { type: Type.STRING },
            waterCoverage: { type: Type.NUMBER, description: "0-100 percentage" },
            biodiversityIndex: { type: Type.NUMBER, description: "0-100 scale" },
            climateStability: { type: Type.NUMBER, description: "0-100 scale" },
            pollutionLevel: { type: Type.NUMBER, description: "0-100 scale" },
            statusReport: { type: Type.STRING }
          },
          required: [
            "mass", "orbitalPeriod", "atmosphere", "geomagneticStrength", 
            "rareMineralsDensity", "mainEnergyType", "waterCoverage", 
            "biodiversityIndex", "climateStability", "pollutionLevel", "statusReport"
          ]
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as PlanetData2035;
    }
    throw new Error("Empty response");

  } catch (error) {
    console.warn("Gemini API Error (likely quota exceeded), using fallback data:", error);
    
    // Check if we have pre-defined fallback data for this planet
    if (FALLBACK_DB[planetName]) {
        // Add a small indicator to the status report that this is cached data
        return {
            ...FALLBACK_DB[planetName],
            statusReport: FALLBACK_DB[planetName].statusReport + " [离线缓存模式]"
        };
    }

    return DEFAULT_FALLBACK;
  }
};
