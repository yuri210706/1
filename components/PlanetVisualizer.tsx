import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { Stars, OrbitControls, Sphere, MeshDistortMaterial, Line, Html, Sparkles, shaderMaterial, Outlines } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetData2035 } from '../types';
import { PLANETS } from '../constants';

// Add type definitions for React Three Fiber elements
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      meshBasicMaterial: any;
      group: any;
      mesh: any;
      torusGeometry: any;
      instancedMesh: any;
      dodecahedronGeometry: any;
      ambientLight: any;
      pointLight: any;
      color: any;
      meshStandardMaterial: any;
      lineDashedMaterial: any;
      nebulaMaterial: any;
      [elemName: string]: any;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshBasicMaterial: any;
      group: any;
      mesh: any;
      torusGeometry: any;
      instancedMesh: any;
      dodecahedronGeometry: any;
      ambientLight: any;
      pointLight: any;
      color: any;
      meshStandardMaterial: any;
      lineDashedMaterial: any;
      nebulaMaterial: any;
      [elemName: string]: any;
    }
  }
}

interface PlanetVisualizerProps {
  name: string;
  color: string;
  radiusScale: number;
  isScanning: boolean;
  data?: PlanetData2035 | null;
  onPlanetSelect: (index: number) => void;
  selectedIndex: number;
}

const SUN_RADIUS = 12;

// --- CUSTOM SHADER MATERIAL FOR NEBULA ---
const NebulaMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor1: new THREE.Color('#050b14'), // Deep Dark Blue/Black
    uColor2: new THREE.Color('#2a0a38'), // Deep Purple
    uColor3: new THREE.Color('#00f3ff'), // Cyan Accent
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    varying vec2 vUv;
    varying vec3 vPosition;

    // Simplex 3D Noise function (simplified)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

      // First corner
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;

      // Other corners
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );

      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
      vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

      // Permutations
      i = mod289(i);
      vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

      // Gradients: 7x7 points over a square, mapped onto an octahedron.
      // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
      float n_ = 0.142857142857; // 1.0/7.0
      vec3  ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );

      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);

      //Normalise gradients
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      // Mix final noise value
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                    dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      // Slow moving noise coordinates
      float noiseVal = snoise(vPosition * 0.002 + vec3(uTime * 0.05, uTime * 0.02, 0.0));
      
      // Secondary noise for detail
      float noiseVal2 = snoise(vPosition * 0.005 - vec3(0.0, uTime * 0.05, uTime * 0.01));

      // Combine noise
      float combined = (noiseVal + noiseVal2 * 0.5);

      // Mix colors
      vec3 color = mix(uColor1, uColor2, smoothstep(-0.5, 0.5, combined));
      
      // Add Cyan highlights in peak areas
      color = mix(color, uColor3 * 0.3, smoothstep(0.3, 0.8, combined) * 0.4);

      // Vignette / Depth fade (optional, but good for "infinite" feel)
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ NebulaMaterial });

const NebulaBackground = () => {
    const materialRef = useRef<any>(null);
    
    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.uTime += delta;
        }
    });

    return (
        <mesh>
            <sphereGeometry args={[450, 32, 32]} />
            <nebulaMaterial 
                ref={materialRef} 
                side={THREE.BackSide} 
                uColor1={new THREE.Color('#050b14')}
                uColor2={new THREE.Color('#2a0a38')}
                uColor3={new THREE.Color('#00f3ff')}
            />
        </mesh>
    );
};

// Solar Flares Particle System
const SolarFlares = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 30; // Max concurrent flares
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  
  // Simulation state for each particle
  const particles = useRef(new Array(count).fill(null).map(() => ({
    life: 0,
    position: new THREE.Vector3(),
    scale: 1,
    speed: 0,
  })));

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Randomly spawn new flares
    // Probability scaled by delta to be frame-rate independent
    // Approx 2-3 flares per second
    if (Math.random() < 3.0 * delta) {
        const deadIdx = particles.current.findIndex(p => p.life <= 0);
        if (deadIdx !== -1) {
            const p = particles.current[deadIdx];
            p.life = 1.0; // Start full life
            p.speed = 0.3 + Math.random() * 0.4; // Fade speed
            
            // Random position on sun surface
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            
            // Spawn slightly inside to emerge
            const r = SUN_RADIUS * 0.9; 
            p.position.set(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
            );
            
            // Random large scale
            p.scale = 3 + Math.random() * 4;
        }
    }

    particles.current.forEach((p, i) => {
        if (p.life > 0) {
            // Update life
            p.life -= p.speed * delta;
            
            // Animation math
            const age = 1 - p.life; // 0 (birth) -> 1 (death)
            
            // Growth and Shrink curve: sin wave
            const scaleCurrent = Math.sin(age * Math.PI) * p.scale;
            
            // Move outward from center
            const expansion = age * 6;
            const currentPos = p.position.clone().normalize().multiplyScalar(SUN_RADIUS + expansion);
            
            dummy.position.copy(currentPos);
            dummy.scale.setScalar(Math.max(0, scaleCurrent));
            dummy.lookAt(0,0,0); // Always face center or camera? Random rotation is fine for dodecahedrons
            dummy.rotation.set(age * 2, age * 2, 0); 
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);

            // Dynamic Color: White Hot -> Yellow -> Orange -> Deep Red -> Fade
            if (p.life > 0.7) {
                 tempColor.set('#FFFFFF');
            } else if (p.life > 0.3) {
                 // Lerp White/Yellow to Orange
                 // 0.7 -> 0.3 range
                 const t = (0.7 - p.life) / 0.4;
                 tempColor.set('#FDB813').lerp(new THREE.Color('#FF4500'), t);
            } else {
                 // Lerp Orange to Dark Red
                 const t = (0.3 - p.life) / 0.3;
                 tempColor.set('#FF4500').lerp(new THREE.Color('#550000'), t);
            }
            
            meshRef.current!.setColorAt(i, tempColor);

        } else {
            // Hide dead particles
            dummy.scale.setScalar(0);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        }
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
         <dodecahedronGeometry args={[1, 0]} />
         <meshBasicMaterial 
            toneMapped={false} 
            transparent
            opacity={0.8}
         />
      </instancedMesh>
  )
}

const Sun = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
      if (sunRef.current) {
          sunRef.current.rotation.y += delta * 0.02; // Slow rotation of the sun surface
      }
  });

  return (
    <group>
        <mesh ref={sunRef}>
        <sphereGeometry args={[SUN_RADIUS, 64, 64]} />
        <meshStandardMaterial
            emissive="#FDB813"
            emissiveIntensity={1.5}
            color="#FDB813"
            toneMapped={false}
        />
        </mesh>
        
        {/* Dynamic Solar Flares */}
        <SolarFlares />

        <pointLight intensity={3} distance={500} decay={1.5} color="#FFF" />
        <pointLight intensity={1} distance={100} decay={1} color="#FFD700" />
    </group>
  );
};

// Orbital Path Ring (White Dashed Line)
const OrbitPath = ({ radius }: { radius: number }) => {
    const points = useMemo(() => {
        const p = [];
        const segments = 128;
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            p.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
        }
        return p;
    }, [radius]);

    return (
        <Line
            points={points}
            color="white"
            opacity={0.15} 
            transparent
            dashed
            dashScale={1}
            dashSize={2} 
            gapSize={4} 
            lineWidth={1}
            rotation={[0, 0, 0]} 
        />
    );
};

interface IndividualPlanetProps {
    planetData: typeof PLANETS[0];
    index: number;
    isSelected: boolean;
    onSelect: (index: number) => void;
    data?: PlanetData2035 | null; // Detailed data for selected planet
    isScanning?: boolean;
    registerRef: (index: number, ref: THREE.Object3D) => void;
}

const PlanetMesh = ({ planetData, index, isSelected, onSelect, data, isScanning, registerRef }: IndividualPlanetProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const pivotRef = useRef<THREE.Group>(null);
    const [showPanel, setShowPanel] = useState(false);
    const [hovered, setHover] = useState(false);

    // Register position ref for camera tracking
    useEffect(() => {
        if (meshRef.current) {
            registerRef(index, meshRef.current);
        }
    }, [index, registerRef]);

    // Orbit Animation
    useFrame((state, delta) => {
        if (pivotRef.current) {
            pivotRef.current.rotation.y += planetData.speed * 0.5; // Rotate pivot to orbit sun
        }
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005; // Self rotation
            if (isScanning && isSelected) {
                meshRef.current.rotation.y += 0.02;
            }
            
            // Hover scale effect
            const targetScale = hovered ? 1.2 : 1.0;
            meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        }
    });

    // Reset panel when selection changes
    useEffect(() => {
        if (!isSelected) setShowPanel(false);
    }, [isSelected]);

    const args: [number, number, number] = useMemo(() => [2.5 * planetData.radiusScale, 64, 64], [planetData.radiusScale]);

    useEffect(() => {
      if (hovered) document.body.style.cursor = 'pointer';
      else document.body.style.cursor = 'auto';
    }, [hovered]);

    const handleClick = (e: any) => {
        e.stopPropagation();
        if (isSelected) {
            setShowPanel(!showPanel);
        } else {
            onSelect(index);
        }
    };

    return (
        <group>
            {/* Visual Orbit Path */}
            <OrbitPath radius={planetData.distance} />

            {/* Pivot Group (Rotates around Sun at 0,0,0) */}
            <group ref={pivotRef}>
                {/* Planet Group (Offset by distance) */}
                <group position={[planetData.distance, 0, 0]} ref={groupRef}>
                    
                    <Sphere 
                        args={args} 
                        ref={meshRef}
                        onClick={handleClick}
                        onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
                        onPointerOut={(e) => setHover(false)}
                    >
                        <MeshDistortMaterial
                            color={planetData.color}
                            attach="material"
                            distort={isSelected && isScanning ? 0.4 : 0} 
                            speed={5}
                            roughness={0.6}
                            metalness={0.4}
                            emissive={planetData.color}
                            emissiveIntensity={isSelected ? 0.5 : (hovered ? 0.5 : 0.05)}
                        />
                        {hovered && <Outlines thickness={2} color="#00f3ff" />}
                    </Sphere>

                    {/* Effects for Selected Planet */}
                    {isSelected && (
                        <>
                            <AtmosphereGlow color={planetData.color} radiusScale={planetData.radiusScale} />
                            {/* <AnimatedTrail color={planetData.color} /> Only show simpler trails if needed, disabled for cleanliness in full system view */}
                            <DebrisTrail color={planetData.color} radiusScale={planetData.radiusScale} />
                            
                            {/* Selection Reticle */}
                            <mesh>
                                <ringGeometry args={[2.5 * planetData.radiusScale + 1, 2.5 * planetData.radiusScale + 1.2, 32]} />
                                <meshBasicMaterial color="#00f3ff" transparent opacity={0.5} side={THREE.DoubleSide} />
                            </mesh>
                        </>
                    )}

                    {/* Detail Panel Popup */}
                    {(showPanel || (isSelected && hovered)) && data && isSelected && (
                        <Html
                            position={[2.5 * planetData.radiusScale * 1.5, 2, 0]}
                            center
                            distanceFactor={20}
                            zIndexRange={[100, 0]}
                            style={{ pointerEvents: 'none' }}
                        >
                             <div className="w-56 bg-sci-dark/90 border border-sci-cyan/40 p-3 rounded-md backdrop-blur-md shadow-[0_0_20px_rgba(0,243,255,0.2)] pointer-events-auto transform transition-all duration-300">
                                <div className="text-sci-cyan font-orbitron text-md font-bold uppercase mb-1">{planetData.name}</div>
                                <div className="text-xs text-gray-300 font-rajdhani">
                                    <div>质量: {data.mass}</div>
                                    <div>轨道: {data.orbitalPeriod}</div>
                                </div>
                             </div>
                        </Html>
                    )}
                </group>
            </group>
        </group>
    );
};

const AtmosphereGlow = ({ color, radiusScale }: { color: string, radiusScale: number }) => {
    return (
        <Sphere args={[2.5 * radiusScale * 1.25, 32, 32]}>
            <meshBasicMaterial
                color={color}
                transparent
                opacity={0.1}
                side={THREE.BackSide}
                blending={THREE.AdditiveBlending}
            />
        </Sphere>
    )
}

// Particle system representing exhaust/debris trail
const DebrisTrail = ({ color, radiusScale }: { color: string, radiusScale: number }) => {
    const count = 40; // Reduced count for full system performance
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    const particles = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            t: Math.random() * 1, 
            speed: Math.random() * 0.01 + 0.005,
            offset: new THREE.Vector3(
                (Math.random() - 0.5) * radiusScale,
                (Math.random() - 0.5) * radiusScale,
                (Math.random() - 0.5) * radiusScale
            ),
            scale: Math.random() * 0.4 + 0.1,
        }));
    }, [radiusScale]);

    useFrame(() => {
        if (!meshRef.current) return;
        particles.forEach((p, i) => {
            p.t += p.speed;
            if (p.t > 1) p.t = 0;
            
            // Simple trailing effect behind the sphere
            // In local space of the planet group, negative X or Z depending on rotation?
            // Actually, since the planet group orbits, "behind" is relative to the orbit tangent.
            // Simplified: Just swarm around for "Active" effect
            const spread = 2.5 * radiusScale * 1.5;
            
            dummy.position.set(
                p.offset.x + Math.sin(p.t * Math.PI * 2) * spread * 0.2,
                p.offset.y + Math.cos(p.t * Math.PI * 2) * spread * 0.2,
                p.offset.z - (p.t * spread) // Trail behind?
            );

            const s = p.scale * (1 - p.t);
            dummy.scale.set(s, s, s);
            
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]} position={[0,0,0]}>
            <dodecahedronGeometry args={[0.5, 0]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} blending={THREE.AdditiveBlending} />
        </instancedMesh>
    );
};

// Background Asteroid Belt - Expanded for Solar System Scale
const AsteroidBelt = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 2000;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!meshRef.current) return;
    // Between Mars (90) and Jupiter (130)
    const innerRadius = 100;
    const outerRadius = 120;

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
        const y = (Math.random() - 0.5) * 6; 
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        dummy.position.set(x, y, z);
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        const s = Math.random() * 0.3 + 0.05;
        dummy.scale.set(s, s, s);

        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, dummy]);

  useFrame((state, delta) => {
     if(meshRef.current) {
         meshRef.current.rotation.y += delta * 0.01;
     }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#555" roughness={0.8} metalness={0.1} />
    </instancedMesh>
  );
};

// Controls the camera to follow the selected planet
const CameraController = ({ selectedPlanetRef }: { selectedPlanetRef: THREE.Object3D | null }) => {
    const { controls } = useThree();
    const targetVec = useMemo(() => new THREE.Vector3(), []);

    useFrame((state, delta) => {
        if (selectedPlanetRef && controls) {
            // Get world position of the planet
            selectedPlanetRef.getWorldPosition(targetVec);

            // Smoothly move orbit controls target (the point it looks at) to the planet
            // This effectively "centers" the planet in the view over time
            // @ts-ignore
            controls.target.lerp(targetVec, 0.1);
        }
    });
    return null;
}

const PlanetVisualizer: React.FC<PlanetVisualizerProps> = (props) => {
  const planetRefs = useRef<(THREE.Object3D | null)[]>([]);

  // Function to register refs from children
  const registerRef = (index: number, ref: THREE.Object3D) => {
      planetRefs.current[index] = ref;
  };

  const selectedRef = planetRefs.current[props.selectedIndex] || null;

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 40, 100], fov: 45 }}>
        
        {/* Lights */}
        <ambientLight intensity={0.2} />
        {/* Sun handles its own light */}
        
        {/* Sci-Fi Environment */}
        <NebulaBackground />
        <Stars radius={400} depth={50} count={10000} factor={4} saturation={0} fade speed={1} />
        <Sparkles size={2} scale={[200, 200, 200]} count={500} speed={0.3} opacity={0.5} color="#00f3ff" />
        
        <Sun />
        <AsteroidBelt />
        
        {/* Planets */}
        <group>
            {PLANETS.map((planet, idx) => (
                <PlanetMesh 
                    key={planet.name}
                    planetData={planet}
                    index={idx}
                    isSelected={idx === props.selectedIndex}
                    onSelect={props.onPlanetSelect}
                    data={idx === props.selectedIndex ? props.data : null}
                    isScanning={props.isScanning}
                    registerRef={registerRef}
                />
            ))}
        </group>
        
        <CameraController selectedPlanetRef={selectedRef} />

        <OrbitControls 
            makeDefault
            enableZoom={true} 
            enablePan={true} 
            minDistance={10} 
            maxDistance={300} 
            maxPolarAngle={Math.PI * 0.85}
        />
      </Canvas>
      
      {/* HUD Overlays */}
      <div className="absolute inset-0 pointer-events-none border-[1px] border-sci-cyan/20 rounded-lg"></div>
      
      <div className="absolute top-4 left-4 text-xs font-orbitron text-sci-cyan/60 animate-pulse">
        实时信号 // 太阳系全景视图
      </div>
      <div className="absolute bottom-4 right-4 text-xs font-orbitron text-sci-cyan/60">
        系统.可视化引擎_V35 // 目标锁定: {props.name}
      </div>
    </div>
  );
};

export default PlanetVisualizer;