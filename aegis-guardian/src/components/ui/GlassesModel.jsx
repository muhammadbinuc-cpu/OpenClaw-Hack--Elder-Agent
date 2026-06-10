import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function Glasses() {
  const meshRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
    }
  })

  return (
    <group ref={meshRef}>
      {/* Left lens frame */}
      <mesh position={[-0.6, 0, 0]}>
        <torusGeometry args={[0.35, 0.04, 16, 100, Math.PI * 2]} />
        <meshStandardMaterial color="#00c896" metalness={0.3} roughness={0.1} emissive="#00c896" emissiveIntensity={0.3} />
      </mesh>
      {/* Left lens glass */}
      <mesh position={[-0.6, 0, 0]}>
        <circleGeometry args={[0.31, 32]} />
        <meshStandardMaterial color="#00c896" transparent opacity={0.1} metalness={0.3} roughness={0.1} emissive="#00c896" emissiveIntensity={0.3} />
      </mesh>
      {/* Right lens frame */}
      <mesh position={[0.6, 0, 0]}>
        <torusGeometry args={[0.35, 0.04, 16, 100, Math.PI * 2]} />
        <meshStandardMaterial color="#00c896" metalness={0.3} roughness={0.1} emissive="#00c896" emissiveIntensity={0.3} />
      </mesh>
      {/* Right lens glass */}
      <mesh position={[0.6, 0, 0]}>
        <circleGeometry args={[0.31, 32]} />
        <meshStandardMaterial color="#00c896" transparent opacity={0.1} metalness={0.3} roughness={0.1} emissive="#00c896" emissiveIntensity={0.3} />
      </mesh>
      {/* Bridge */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 16]} />
        <meshStandardMaterial color="#00c896" metalness={0.3} roughness={0.1} emissive="#00c896" emissiveIntensity={0.3} />
      </mesh>
      {/* Left arm */}
      <mesh position={[-1.1, 0, -0.3]} rotation={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 16]} />
        <meshStandardMaterial color="#00c896" metalness={0.3} roughness={0.1} emissive="#00c896" emissiveIntensity={0.3} />
      </mesh>
      {/* Right arm */}
      <mesh position={[1.1, 0, -0.3]} rotation={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 16]} />
        <meshStandardMaterial color="#00c896" metalness={0.3} roughness={0.1} emissive="#00c896" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

export function GlassesModel() {
  return (
    <div style={{ width: '100%', height: '100%', cursor: 'grab' }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true }}
      >
        <ambientLight intensity={2} />
        <pointLight position={[10, 10, 10]} intensity={4} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#00c896" />
        <pointLight position={[0, 10, 5]} intensity={3} color="#ffffff" />
        <Glasses />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
        />
      </Canvas>
      <div style={{ textAlign: 'center', marginTop: '-30px', color: 'rgba(0,200,150,0.5)', fontSize: '0.65rem', letterSpacing: '0.2em', position: 'relative', zIndex: 1 }}>
        META × AEGIS · DRAG TO ROTATE
      </div>
    </div>
  )
}
