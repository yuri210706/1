import React, { useState, useEffect } from 'react';
import PlanetVisualizer from './components/PlanetVisualizer';
import DataDisplay from './components/DataDisplay';
import { PLANETS, MOCK_DATA_EARTH } from './constants';
import { fetchPlanetData2035 } from './services/geminiService';
import { PlanetFullState } from './types';

const App = () => {
  const [selectedPlanetIndex, setSelectedPlanetIndex] = useState(2); // Start with Earth
  const [planetData, setPlanetData] = useState<PlanetFullState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const currentPlanetBase = PLANETS[selectedPlanetIndex];

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getFormattedTime = () => {
      const year = 2035;
      const month = String(currentTime.getMonth() + 1).padStart(2, '0');
      const day = String(currentTime.getDate()).padStart(2, '0');
      const hours = String(currentTime.getHours()).padStart(2, '0');
      const minutes = String(currentTime.getMinutes()).padStart(2, '0');
      const seconds = String(currentTime.getSeconds()).padStart(2, '0');
      return `${year}.${month}.${day} :: ${hours}:${minutes}:${seconds}`;
  };

  // Load data when planet changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Use mock data for initial Earth load to avoid immediate API hit, or for quick demo
      if (currentPlanetBase.name === '地球' && !planetData) {
         setPlanetData({
             ...currentPlanetBase,
             ...MOCK_DATA_EARTH
         });
         setIsLoading(false);
         return;
      }

      try {
        const data2035 = await fetchPlanetData2035(currentPlanetBase.name);
        setPlanetData({
            ...currentPlanetBase,
            ...data2035
        });
      } catch (e) {
        console.error("Failed to fetch data", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlanetIndex]);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-rajdhani grid-bg">
      
      {/* Header / Top Bar */}
      <header className="absolute top-0 left-0 right-0 h-16 bg-sci-dark/80 backdrop-blur-md border-b border-sci-cyan/30 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-sci-cyan flex items-center justify-center animate-spin-slow">
                <div className="w-4 h-4 bg-sci-cyan rounded-full"></div>
            </div>
            <h1 className="text-2xl font-orbitron font-bold text-white tracking-wider">
                星际<span className="text-sci-cyan">数据</span>.35
            </h1>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sci-cyan/70 font-orbitron text-xs tracking-widest">
            <span>系统状态: <span className="text-green-400">在线</span></span>
            <span className="tabular-nums">T-SYNC: {getFormattedTime()}</span>
            <span>连接: 安全</span>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="absolute inset-0 pt-16 flex flex-col md:flex-row">
        
        {/* Left: 3D Visualization Area */}
        <section className="relative w-full md:w-2/3 h-1/2 md:h-full border-r border-sci-cyan/20">
            <PlanetVisualizer 
                name={currentPlanetBase.name}
                color={currentPlanetBase.color} 
                radiusScale={currentPlanetBase.radiusScale} 
                isScanning={isLoading}
                data={planetData}
                onPlanetSelect={setSelectedPlanetIndex}
                selectedIndex={selectedPlanetIndex}
            />
            
            {/* Planet Selector (Bottom overlaid) */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 z-10">
                 <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade">
                    {PLANETS.map((planet, idx) => (
                        <button
                            key={planet.name}
                            onClick={() => setSelectedPlanetIndex(idx)}
                            className={`
                                flex-shrink-0 px-4 py-2 border font-orbitron text-sm transition-all duration-300 transform skew-x-[-10deg]
                                ${selectedPlanetIndex === idx 
                                    ? 'bg-sci-cyan text-black border-sci-cyan scale-110 shadow-[0_0_15px_#00f3ff]' 
                                    : 'bg-transparent text-sci-cyan border-sci-cyan/30 hover:bg-sci-cyan/10 hover:border-sci-cyan'
                                }
                            `}
                        >
                            <span className="skew-x-[10deg] inline-block">{planet.name}</span>
                        </button>
                    ))}
                 </div>
            </div>
            
            {/* Large Planet Title Overlay */}
            <div className="absolute top-8 left-8 pointer-events-none">
                 <h2 className="text-6xl md:text-8xl font-orbitron font-black text-white/10 select-none">
                    {currentPlanetBase.name}
                 </h2>
                 <div className="h-1 w-32 bg-sci-cyan mt-2"></div>
            </div>
        </section>

        {/* Right: Data Panel */}
        <section className="w-full md:w-1/3 h-1/2 md:h-full bg-sci-dark/90 p-6 flex flex-col border-l border-white/5 relative z-10">
            {/* Decor lines */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-sci-cyan"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-sci-cyan"></div>
            
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-orbitron text-white">数据流</h3>
                <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-ping' : 'bg-green-400'}`}></div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                {planetData ? (
                    <DataDisplay data={planetData} loading={isLoading} />
                ) : (
                    <div className="text-center text-gray-500 mt-20">正在初始化...</div>
                )}
            </div>
        </section>
      </main>
      
      {/* Background Decor Elements */}
      <div className="absolute bottom-4 left-4 w-64 h-24 bg-gradient-to-t from-sci-cyan/5 to-transparent pointer-events-none md:block hidden"></div>
    </div>
  );
};

export default App;