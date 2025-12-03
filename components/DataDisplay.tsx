import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { PlanetData2035, AtmosphereComponent } from '../types';

interface DataDisplayProps {
  data: PlanetData2035;
  loading: boolean;
}

const DataDisplay: React.FC<DataDisplayProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-sci-cyan space-y-4">
        <div className="w-12 h-12 border-4 border-t-sci-cyan border-r-transparent border-b-sci-cyan border-l-transparent rounded-full animate-spin"></div>
        <p className="font-orbitron tracking-widest animate-pulse">正在解密星际数据...</p>
      </div>
    );
  }

  // Transform data for charts
  const ecoData = [
    { subject: '生物多样性', A: data.biodiversityIndex, fullMark: 100 },
    { subject: '气候稳定性', A: data.climateStability, fullMark: 100 },
    { subject: '污染等级', A: data.pollutionLevel, fullMark: 100 },
    { subject: '水资源覆盖', A: data.waterCoverage, fullMark: 100 },
    { subject: '稀有矿物', A: data.rareMineralsDensity, fullMark: 100 },
  ];

  const atmoData = data.atmosphere.map(gas => ({
    name: gas.gas,
    value: gas.percentage
  }));

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-4">
      
      {/* 2035 Status Report */}
      <div className="bg-sci-dark/50 border-l-4 border-sci-cyan p-4 relative overflow-hidden group">
        <div className="absolute inset-0 bg-sci-cyan/5 group-hover:bg-sci-cyan/10 transition-colors"></div>
        <h3 className="text-sci-cyan font-orbitron text-sm mb-2 tracking-widest">状态报告 // 2035</h3>
        <p className="font-rajdhani text-lg leading-tight text-gray-200">
          {data.statusReport}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Core Stats */}
        <div className="glass-panel p-4 rounded-lg">
           <h4 className="text-sci-cyan font-orbitron text-xs mb-4 border-b border-sci-cyan/30 pb-2">行星指标</h4>
           <div className="space-y-3 font-rajdhani">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">质量</span>
                <span className="text-white font-bold">{data.mass}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">轨道周期</span>
                <span className="text-white font-bold">{data.orbitalPeriod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">地磁强度</span>
                <span className="text-white font-bold">{data.geomagneticStrength}</span>
              </div>
               <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">主要能源</span>
                <span className="text-sci-purple font-bold text-right">{data.mainEnergyType}</span>
              </div>
           </div>
        </div>

        {/* Atmosphere Chart */}
        <div className="glass-panel p-4 rounded-lg flex flex-col">
            <h4 className="text-sci-cyan font-orbitron text-xs mb-2 border-b border-sci-cyan/30 pb-2">大气成分</h4>
            <div className="flex-1 min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={atmoData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} tick={{fill: '#9CA3AF', fontSize: 10}} interval={0} />
                    <Tooltip 
                        contentStyle={{backgroundColor: '#050b14', borderColor: '#00f3ff', color: '#fff'}}
                        cursor={{fill: 'rgba(0, 243, 255, 0.1)'}}
                    />
                    <Bar dataKey="value" fill="#00f3ff" barSize={10} radius={[0, 4, 4, 0]}>
                      {atmoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#00f3ff' : '#0077ff'} />
                      ))}
                    </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Ecological Radar Chart */}
      <div className="glass-panel p-4 rounded-lg flex-1 min-h-[300px] flex flex-col">
        <h4 className="text-sci-cyan font-orbitron text-xs mb-2 border-b border-sci-cyan/30 pb-2">生态工业指数</h4>
        <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={ecoData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 10, fontFamily: 'Orbitron' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                    name="指数"
                    dataKey="A"
                    stroke="#bc13fe"
                    strokeWidth={2}
                    fill="#bc13fe"
                    fillOpacity={0.3}
                />
                <Tooltip contentStyle={{backgroundColor: '#050b14', borderColor: '#bc13fe', color: '#fff'}} />
                </RadarChart>
            </ResponsiveContainer>
             {/* Decorative reticle */}
             <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
                <div className="w-[70%] h-[70%] border border-dashed border-white rounded-full"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DataDisplay;