 /**
 * 版权所有 © 2025 何健 保留所有权利
 * 
 * 功能：太阳系3D可视化组件
 * 使用准确的天文数据渲染太阳系，支持实时轨道运动
 */

'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import {
  SOLAR_SYSTEM_DATA,
  SOLAR_SYSTEM_CONSTANTS,
  calculateOrbitalPosition,
  type CelestialBody,
} from '@/data/solar-system-data';
import { 
  getLocalPlanetTextures, 
  clearLocalTextureCache,
  handleTextureContextLost 
} from '@/lib/local-texture-loader';

interface SolarSystemVisualization3DProps {
  showOrbits?: boolean;
  showLabels?: boolean;
  showAsteroidBelt?: boolean; // 显示小行星带
  showSatellites?: boolean;   // 显示卫星（默认隐藏）
  timeSpeed?: number;          // 时间流速倍率
  className?: string;
}

// 全局纹理缓存
const globalProceduralTextureCache = new Map<string, THREE.CanvasTexture>();

// 生成或获取程序化纹理
function getProceduralTexture(body: CelestialBody): THREE.CanvasTexture {
  if (globalProceduralTextureCache.has(body.id)) {
    return globalProceduralTextureCache.get(body.id)!;
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = 512; // 保持低分辨率以节省显存
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  // 基础颜色填充
  ctx.fillStyle = body.color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 根据不同类型的天体创建不同的纹理效果
  if (body.type === 'star') {
    // 太阳：添加太阳黑子和光斑
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.height * 0.6);
    gradient.addColorStop(0, '#FFEB3B');
    gradient.addColorStop(0.5, '#FFC107');
    gradient.addColorStop(1, '#FF9800');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 添加太阳黑子
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = 5 + Math.random() * 15;
      ctx.fillStyle = 'rgba(50, 30, 10, 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (['jupiter', 'saturn'].includes(body.id)) {
    // 气态巨行星：条带状云层
    for (let y = 0; y < canvas.height; y += 2) {
      const lightness = 0.7 + Math.sin(y * 0.05) * 0.3;
      const r = parseInt(body.color.slice(1, 3), 16);
      const g = parseInt(body.color.slice(3, 5), 16);
      const b = parseInt(body.color.slice(5, 7), 16);
      ctx.fillStyle = `rgb(${r * lightness}, ${g * lightness}, ${b * lightness})`;
      ctx.fillRect(0, y, canvas.width, 2);
      
      // 添加大红斑类特征
      if (Math.random() > 0.98) {
        const spotX = Math.random() * canvas.width;
        const spotRadius = 10 + Math.random() * 20;
        const spotGradient = ctx.createRadialGradient(spotX, y, 0, spotX, y, spotRadius);
        spotGradient.addColorStop(0, `rgba(${r * 1.2}, ${g * 0.8}, ${b * 0.8}, 0.5)`);
        spotGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = spotGradient;
        ctx.fillRect(spotX - spotRadius, y - spotRadius, spotRadius * 2, spotRadius * 2);
      }
    }
  } else if (body.id === 'earth') {
    // 地球：简单的蓝绿色图案
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#1565C0');
    gradient.addColorStop(0.3, '#2E7D32');
    gradient.addColorStop(0.5, '#1565C0');
    gradient.addColorStop(0.7, '#2E7D32');
    gradient.addColorStop(1, '#1565C0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 添加云层效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const w = 20 + Math.random() * 40;
      const h = 10 + Math.random() * 20;
      ctx.fillRect(x, y, w, h);
    }
  } else if (body.id === 'mars') {
    // 火星：红色沙漠纹理
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.height * 0.8);
    gradient.addColorStop(0, '#D84315');
    gradient.addColorStop(0.5, '#BF360C');
    gradient.addColorStop(1, '#8D6E63');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 添加火星特征
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.fillStyle = `rgba(139, 69, 19, ${Math.random() * 0.3})`;
      ctx.fillRect(x, y, 5 + Math.random() * 10, 5 + Math.random() * 10);
    }
  } else if (body.type === 'moon') {
    // 卫星：坑洼表面
    ctx.fillStyle = '#9E9E9E';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 添加陨石坑
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = 5 + Math.random() * 20;
      const craterGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      craterGradient.addColorStop(0, 'rgba(60, 60, 60, 0.5)');
      craterGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = craterGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // 其他行星：基础纹理变化
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = 10 + Math.random() * 30;
      const lightness = 0.7 + Math.random() * 0.3;
      const r = parseInt(body.color.slice(1, 3), 16);
      const g = parseInt(body.color.slice(3, 5), 16);
      const b = parseInt(body.color.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r * lightness}, ${g * lightness}, ${b * lightness}, 0.5)`;
      ctx.fillRect(x, y, size, size);
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  globalProceduralTextureCache.set(body.id, texture);
  return texture;
}

// 小行星带组件
function AsteroidBelt() {
  const asteroidCount = 200; // 减少数量，避免视觉混乱
  const positions = useMemo(() => {
    const pos = new Float32Array(asteroidCount * 3);
    for (let i = 0; i < asteroidCount; i++) {
      // 小行星带位于火星和木星之间（2.2 - 3.2 AU）
      const distance = 2.2 + Math.random() * 1.0;
      const angle = Math.random() * Math.PI * 2;
      const verticalOffset = (Math.random() - 0.5) * 0.2;
      
      pos[i * 3] = distance * Math.cos(angle) * 10; // 应用缩放
      pos[i * 3 + 1] = verticalOffset * 10;
      pos[i * 3 + 2] = distance * Math.sin(angle) * 10;
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={asteroidCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#8B7355"
        opacity={0.3}
        transparent
      />
    </points>
  );
}

// 单个天体组件
function CelestialBodyMesh({
  body,
  time,
  showOrbit,
  parentPosition,
  onBodyClick,
  enableRotation = true,
  rotationSpeed = 1,
}: {
  body: CelestialBody;
  time: number;
  showOrbit: boolean;
  parentPosition?: [number, number, number];
  onBodyClick?: (body: CelestialBody) => void;
  enableRotation?: boolean;
  rotationSpeed?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { SCALE } = SOLAR_SYSTEM_CONSTANTS;


  // 计算当前位置
  const position = useMemo(() => {
    const pos = calculateOrbitalPosition(body, time);
    
    // 默认缩放
    let currentScale = SCALE.distance;
    
    // 卫星特殊处理：根据母行星的最小卫星轨道计算统一缩放倍数
    // 确保最内层卫星轨道紧贴母行星，同时保留卫星间的相对轨道差异
    if (body.type === 'moon' && body.parent) {
      const parentData = SOLAR_SYSTEM_DATA.find(b => b.id === body.parent);
      if (parentData && parentData.satellites) {
        const parentDisplayRadius = parentData.radius * SCALE.planetRadius * 0.01;
        // 找到母行星所有卫星中最小的轨道
        const minSatelliteOrbit = Math.min(...parentData.satellites.map(s => s.semiMajorAxis));
        // 计算统一的缩放倍数，使最小轨道卫星距离 = 母行星半径 * 1.2（更紧凑）
        const neededScale = (parentDisplayRadius * 1.2) / (minSatelliteOrbit * SCALE.distance);
        currentScale = SCALE.distance * neededScale;
      } else {
        currentScale = SCALE.distance * 50;
      }
    }

    // 计算基础位置（不要每帧强制调整，让轨道自然运行）
    const x = pos.x * currentScale;
    const y = pos.y * currentScale;
    const z = pos.z * currentScale;

    const basePos = [x, z, y] as [number, number, number];
    
    // 如果有父天体（卫星），相对于父天体位置
    if (parentPosition) {
      return [
        parentPosition[0] + basePos[0],
        parentPosition[1] + basePos[1],
        parentPosition[2] + basePos[2],
      ] as [number, number, number];
    }
    
    return basePos;
  }, [body, time, SCALE.distance, SCALE.planetRadius, parentPosition]);

  // 计算显示半径
  const displayRadius = useMemo(() => {
    if (body.type === 'star') {
      return body.radius * SCALE.sunRadius * 0.01;
    }
    // 卫星使用真实比例，但设置最小值确保可见
    if (body.type === 'moon') {
      // 卫星使用与行星相同的缩放比例，最小 0.12 确保小卫星可见
      return Math.max(body.radius * SCALE.planetRadius * 0.01, 0.12);
    }
    return body.radius * SCALE.planetRadius * 0.01;
  }, [body, SCALE]);

  // 使用程序化纹理作为默认/回退
  const proceduralTexture = useMemo(() => getProceduralTexture(body), [body]);
  
  // 真实纹理状态
  const [realTexture, setRealTexture] = useState<THREE.Texture | null>(null);

  // 异步加载真实纹理
  useEffect(() => {
    let isMounted = true;
    
    const loadRealTexture = async () => {
      try {
        // 异步加载真实纹理
        const textures = await getLocalPlanetTextures(body.id);
        if (isMounted && textures.map) {
          // 如果加载的是程序化纹理（fallback），则保持 null 以继续使用优化过的 proceduralTexture
          // 只有当加载的是 ImageTexture 时才替换
          if (textures.map instanceof THREE.Texture && !(textures.map.source?.data instanceof HTMLCanvasElement)) {
             setRealTexture(textures.map);
          }
        }
      } catch (e) {
        // 失败则保持沉默，继续使用程序化纹理
        console.warn(`Failed to load texture for ${body.id}`);
      }
    };
    
    // 延迟一点加载，避免阻塞首屏渲染
    const timer = setTimeout(loadRealTexture, Math.random() * 1000);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [body.id]);

  // 最终使用的纹理：优先使用真实图片，否则使用程序化纹理
  const finalTexture = realTexture || proceduralTexture;

  // 轨道路径
  const orbitPoints = useMemo(() => {
    if (!showOrbit || body.type === 'star') return null;

    const points: THREE.Vector3[] = [];
    const segments = 128;
    
    // 卫星轨道使用与位置相同的统一缩放
    let orbitScale = SCALE.distance;
    if (body.type === 'moon' && body.parent) {
      const parentData = SOLAR_SYSTEM_DATA.find(b => b.id === body.parent);
      if (parentData && parentData.satellites) {
        const parentDisplayRadius = parentData.radius * SCALE.planetRadius * 0.01;
        const minSatelliteOrbit = Math.min(...parentData.satellites.map(s => s.semiMajorAxis));
        const neededScale = (parentDisplayRadius * 1.2) / (minSatelliteOrbit * SCALE.distance);
        orbitScale = SCALE.distance * neededScale;
      } else {
        orbitScale = SCALE.distance * 50;
      }
    }
    
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * body.orbitalPeriod;
      const pos = calculateOrbitalPosition(body, t);
      points.push(
        new THREE.Vector3(
          pos.x * orbitScale,
          pos.z * orbitScale,
          pos.y * orbitScale
        )
      );
    }
    
    return points;
  }, [body, showOrbit, SCALE.distance, SCALE.planetRadius]);

  // 自转动画
  useFrame((state, delta) => {
    if (meshRef.current && body.rotationPeriod !== 0 && enableRotation) {
      // 自转速度计算：让每个行星在合理时间内完成一圈
      // 基准：地球（1天）每秒转约30度（0.5弧度），即6秒转一圈
      const baseSpeed = 0.5; // 地球基准速度（弧度/秒）
      const relativeSpeed = 1 / body.rotationPeriod; // 相对于地球的速度
      meshRef.current.rotation.y += baseSpeed * relativeSpeed * delta * rotationSpeed;
    }
  });

  // 优化：Memoize 轨道线对象，防止每帧重建导致的内存泄漏
  const orbitLine = useMemo(() => {
    if (!orbitPoints || orbitPoints.length === 0) return null;
    
    // 如果是卫星，轨道点需要加上父天体位置偏移
    const finalPoints = parentPosition 
      ? orbitPoints.map(p => new THREE.Vector3(
          p.x + parentPosition[0],
          p.y + parentPosition[1],
          p.z + parentPosition[2]
        ))
      : orbitPoints;
    
    const geometry = new THREE.BufferGeometry().setFromPoints(finalPoints);
    const material = new THREE.LineBasicMaterial({ 
      color: body.color, 
      opacity: body.type === 'moon' ? 0.4 : 0.2, // 卫星轨道更明显
      transparent: true 
    });
    return new THREE.Line(geometry, material);
  }, [orbitPoints, body.color, body.type, parentPosition]);

  // 清理轨道线资源
  useEffect(() => {
    return () => {
      if (orbitLine) {
        orbitLine.geometry.dispose();
        (orbitLine.material as THREE.Material).dispose();
      }
    };
  }, [orbitLine]);

  // 特殊处理：土星和天王星的光环
  const hasRings = body.rings;

  return (
    <group>
      {/* 轨道线 */}
      {orbitLine && (
        <primitive object={orbitLine} />
      )}

      {/* 不可见的点击区域（比视觉球体大，解决遮挡问题） */}
      <mesh 
        position={position}
        onClick={(e) => {
          e.stopPropagation();
          onBodyClick?.(body);
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        {/* 行星的点击区域是视觉大小的5倍，太阳保持1倍 */}
        <sphereGeometry args={[displayRadius * (body.type === 'star' ? 1 : 5), 16, 16]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* 天体球体（视觉展示） */}
      <mesh 
        ref={meshRef} 
        position={position}
      >
        <sphereGeometry args={[displayRadius, 32, 32]} />
        <meshStandardMaterial
          map={finalTexture}
          emissive={body.type === 'star' ? body.color : body.color}
          emissiveIntensity={body.type === 'star' ? 1.0 : 0.1}
          roughness={body.type === 'star' ? 0.2 : 0.6}
          metalness={body.type === 'star' ? 0.0 : 0.1}
        />
      </mesh>

      {/* 太阳发光效果 */}
      {body.type === 'star' && (
        <pointLight
          position={position}
          color={body.color}
          intensity={2}
          distance={100}
          decay={1}
        />
      )}

      {/* 光环（土星、天王星） */}
      {hasRings && (
        <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[displayRadius * 1.5, displayRadius * 2.5, 64]} />
          <meshStandardMaterial
            color={body.color}
            opacity={0.6}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* 渲染卫星（仅当showSatellites为true时） */}
    </group>
  );
}

// 主场景组件
function SolarSystemScene({
  showOrbits,
  showAsteroidBelt,
  timeSpeed,
  onBodyClick,
  focusedBody,
  enableRotation,
  rotationSpeed,
}: {
  showOrbits: boolean;
  showAsteroidBelt: boolean;
  timeSpeed: number;
  onBodyClick?: (body: CelestialBody) => void;
  focusedBody: CelestialBody | null;
  enableRotation: boolean;
  rotationSpeed: number;
}) {
  const [time, setTime] = useState(0);
  const { SCALE } = SOLAR_SYSTEM_CONSTANTS;
  const [isFlying, setIsFlying] = useState(false);
  const [flyTarget, setFlyTarget] = useState<THREE.Vector3 | null>(null);
  const [flyStartPos, setFlyStartPos] = useState<THREE.Vector3 | null>(null);
  const [flyProgress, setFlyProgress] = useState(0);

  // 当focusedBody变化时，启动飞行动画
  useEffect(() => {
    if (focusedBody) {
      let targetPos: THREE.Vector3;
      
      // 卫星需要计算相对于母行星的位置
      if (focusedBody.type === 'moon' && focusedBody.parent) {
        // 先找到母行星
        const parentBody = SOLAR_SYSTEM_DATA.find(b => b.id === focusedBody.parent);
        if (parentBody) {
          // 计算母行星位置
          const parentPos = calculateOrbitalPosition(parentBody, time);
          const parentWorldPos = new THREE.Vector3(
            parentPos.x * SCALE.distance,
            parentPos.z * SCALE.distance,
            parentPos.y * SCALE.distance
          );
          
          // 计算卫星相对于母行星的位置（统一缩放）
          const parentDisplayRadius = parentBody.radius * SCALE.planetRadius * 0.01;
          const minSatelliteOrbit = parentBody.satellites 
            ? Math.min(...parentBody.satellites.map(s => s.semiMajorAxis))
            : focusedBody.semiMajorAxis;
          const neededScale = (parentDisplayRadius * 1.2) / (minSatelliteOrbit * SCALE.distance);
          const moonScale = SCALE.distance * neededScale;
          
          const moonPos = calculateOrbitalPosition(focusedBody, time);
          const moonOffset = new THREE.Vector3(
            moonPos.x * moonScale,
            moonPos.z * moonScale,
            moonPos.y * moonScale
          );
          
          targetPos = parentWorldPos.add(moonOffset);
        } else {
          // 找不到母行星，使用原始计算
          const pos = calculateOrbitalPosition(focusedBody, time);
          targetPos = new THREE.Vector3(
            pos.x * SCALE.distance,
            pos.z * SCALE.distance,
            pos.y * SCALE.distance
          );
        }
      } else {
        // 行星或恒星直接计算
        const pos = calculateOrbitalPosition(focusedBody, time);
        targetPos = new THREE.Vector3(
          pos.x * SCALE.distance,
          pos.z * SCALE.distance,
          pos.y * SCALE.distance
        );
      }
      
      // 计算显示半径
      let radius: number;
      if (focusedBody.type === 'star') {
        radius = focusedBody.radius * SCALE.sunRadius * 0.01;
      } else if (focusedBody.type === 'moon') {
        radius = Math.max(focusedBody.radius * SCALE.planetRadius * 0.01, 0.12);
      } else {
        radius = focusedBody.radius * SCALE.planetRadius * 0.01;
      }
      
      // 卫星使用更近的相机距离
      let cameraDistance = focusedBody.type === 'moon' 
        ? Math.max(radius * 8, 2) 
        : Math.max(radius * 5, 3);
      
      if (focusedBody.type === 'planet') {
        // 计算星球到太阳的距离
        const pos = calculateOrbitalPosition(focusedBody, time);
        const distanceFromSun = Math.sqrt(
          pos.x * pos.x + pos.y * pos.y + pos.z * pos.z
        );
        // 根据距离太阳的远近调整相机距离
        if (distanceFromSun > 25) {
          cameraDistance = Math.max(cameraDistance, 15);
        } else if (distanceFromSun > 15) {
          cameraDistance = Math.max(cameraDistance, 12);
        } else if (distanceFromSun > 8) {
          cameraDistance = Math.max(cameraDistance, 10);
        }
      }
      
      let cameraTarget: THREE.Vector3;
      
      if (focusedBody.type === 'star') {
        // 如果是太阳，从侧面上方观察
        cameraTarget = targetPos.clone().add(
          new THREE.Vector3(cameraDistance, cameraDistance * 0.8, cameraDistance)
        );
      } else {
        // 从目标位置向外偏移
        const sunPos = new THREE.Vector3(0, 0, 0);
        const direction = targetPos.clone().sub(sunPos).normalize();
        const offset = direction.clone().multiplyScalar(cameraDistance);
        offset.y += cameraDistance * 0.3;
        cameraTarget = targetPos.clone().add(offset);
      }
      
      setFlyTarget(cameraTarget);
      setIsFlying(true);
      setFlyProgress(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedBody]);

  // 时间流逝和相机飞行
  useFrame((state, delta) => {
    setTime((t) => t + delta * timeSpeed * 0.01);
    
    // 相机飞行动画（仅在点击时执行一次）
    if (isFlying && flyTarget) {
      if (!flyStartPos) {
        setFlyStartPos(state.camera.position.clone());
      }
      
      if (flyProgress < 1) {
        setFlyProgress(p => Math.min(p + delta * 1.5, 1)); // 1.5秒飞行时间
        
        if (flyStartPos) {
          // 使用easeInOutCubic缓动函数
          const t = flyProgress < 0.5 
            ? 4 * flyProgress * flyProgress * flyProgress
            : 1 - Math.pow(-2 * flyProgress + 2, 3) / 2;
          
          const newPos = flyStartPos.clone().lerp(flyTarget, t);
          state.camera.position.copy(newPos);
          
          // 看向目标
          if (focusedBody) {
            const pos = calculateOrbitalPosition(focusedBody, time);
            const lookTarget = new THREE.Vector3(
              pos.x * SCALE.distance,
              pos.z * SCALE.distance,
              pos.y * SCALE.distance
            );
            state.camera.lookAt(lookTarget);
          }
        }
      } else {
        // 飞行结束，重置状态
        setIsFlying(false);
        setFlyStartPos(null);
        setFlyProgress(0);
      }
    }
  });

  return (
    <>
      {/* 环境光 - 增强以提高整体亮度 */}
      <ambientLight intensity={0.5} />
      
      {/* 添加半球光，模拟宇宙环境光 */}
      <hemisphereLight 
        color="#ffffff" 
        groundColor="#666666" 
        intensity={0.6} 
      />
      
      {/* 添加方向光，模拟太阳光照 */}
      <directionalLight 
        position={[50, 50, 50]} 
        intensity={0.5} 
        color="#ffffff" 
      />

      {/* 小行星带 */}
      {showAsteroidBelt && <AsteroidBelt />}

      {/* 渲染所有天体 */}
      {SOLAR_SYSTEM_DATA.map((body) => (
        <CelestialBodyMesh
          key={body.id}
          body={body}
          time={time}
          showOrbit={showOrbits}
          onBodyClick={onBodyClick}
          enableRotation={enableRotation}
          rotationSpeed={rotationSpeed}
        />
      ))}

      {/* 轨道控制器 */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={500}
        autoRotate={false}
      />
    </>
  );
}

// 主组件
export function SolarSystemVisualization3D({
  showOrbits = true,
  showLabels = true,
  showAsteroidBelt = true,
  showSatellites: initialShowSatellites = false, // 默认隐藏卫星
  timeSpeed = 1,
  className = '',
}: SolarSystemVisualization3DProps) {
  const [currentTimeSpeed, setCurrentTimeSpeed] = useState(timeSpeed);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(null);
  const [focusedBody, setFocusedBody] = useState<CelestialBody | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  const [enableRotation, setEnableRotation] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showPlanetList, setShowPlanetList] = useState(true);
  const [showSatellites, setShowSatellites] = useState(initialShowSatellites);

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // 移动端默认收起控制面板和行星列表
      if (mobile) {
        setShowControls(false);
        setShowPlanetList(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 处理星球点击
  const handleBodyClick = (body: CelestialBody) => {
    if (focusedBody?.id === body.id) {
      // 第二次点击同一星球：显示信息面板
      setShowInfo(true);
    } else {
      // 第一次点击：聚焦到星球
      setFocusedBody(body);
      setShowInfo(false);
    }
    setSelectedBody(body);
  };

  // 关闭信息面板
  const handleCloseInfo = () => {
    setShowInfo(false);
  };

  // 重置视角
  const handleResetView = () => {
    setFocusedBody(null);
    setShowInfo(false);
    setSelectedBody(null);
  };

  // 使用程序化纹理，无需预加载
  useEffect(() => {
    setTexturesLoaded(true);
  }, []);

  // 清理纹理缓存
  useEffect(() => {
    return () => {
      clearLocalTextureCache();
    };
  }, []);

  // 按键监听：R键切换自转
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        setEnableRotation(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className={`relative ${className}`} style={{ width: '100%', height: isMobile ? '350px' : '500px' }}>
      <Canvas
        camera={{ position: [0, 50, 100], fov: 60 }}
        className="rounded-lg border border-white/10"
        style={{ background: '#000000' }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ gl, scene, camera }) => {
          gl.setClearColor('#000000', 1);
          
          // WebGL上下文恢复处理
          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (e) => {
            console.warn('WebGL上下文丢失，尝试恢复...');
            e.preventDefault();
            // 上下文丢失时清空缓存
            globalProceduralTextureCache.clear();
            handleTextureContextLost(); // 清空真实纹理缓存
          });
          
          canvas.addEventListener('webglcontextrestored', () => {
            // WebGL上下文已恢复，强制重绘
            gl.render(scene, camera);
          });
        }}
      >
        <SolarSystemScene
          showOrbits={showOrbits}
          showAsteroidBelt={showAsteroidBelt}
          timeSpeed={isPaused ? 0 : currentTimeSpeed}
          onBodyClick={handleBodyClick}
          focusedBody={focusedBody}
          enableRotation={enableRotation}
          rotationSpeed={rotationSpeed}
        />
      </Canvas>

      {/* HTML 叠加层 - 行星标签 */}
      {showLabels && (
        isMobile ? (
          // 移动端：可收起的简洁列表
          <>
            <button
              onClick={() => setShowPlanetList(!showPlanetList)}
              className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/20 text-[10px] text-white/90 z-10"
            >
              {showPlanetList ? '✕ 关闭' : '☰ 行星'}
            </button>
            {showPlanetList && (
              <div className="absolute top-10 right-2 space-y-1 max-h-[200px] overflow-y-auto z-10">
                {SOLAR_SYSTEM_DATA.filter(b => b.type !== 'moon').map((body) => (
                  <div
                    key={body.id}
                    onClick={() => handleBodyClick(body)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/90 backdrop-blur-sm border border-white/20 text-[10px] cursor-pointer"
                    style={{
                      borderColor: focusedBody?.id === body.id ? body.color : undefined,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: body.color }}
                    />
                    <span className="text-white/90">{body.nameChinese}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // 桌面端：紧凑列表
          <div className="absolute top-4 right-4 space-y-0.5 max-h-[calc(100%-2rem)] overflow-y-auto w-[140px]">
            {SOLAR_SYSTEM_DATA.map((body) => (
              <div key={body.id}>
                {/* 主天体 */}
                <div
                  onClick={() => handleBodyClick(body)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/80 backdrop-blur-sm border border-white/20 text-[11px] cursor-pointer hover:bg-black/90 hover:border-blue-400/40 transition-all"
                  style={{
                    borderColor: focusedBody?.id === body.id ? body.color : undefined,
                    boxShadow: focusedBody?.id === body.id ? `0 0 8px ${body.color}40` : undefined,
                  }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: body.color,
                      boxShadow: `0 0 6px ${body.color}`,
                    }}
                  />
                  <span className="text-white/90 truncate">{body.nameChinese}</span>
                  {body.semiMajorAxis > 0 && (
                    <span className="text-gray-500 text-[9px] ml-auto flex-shrink-0">
                      {body.semiMajorAxis.toFixed(2)} AU
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* 控制面板 - 移动端可收起 */}
      {isMobile ? (
        // 移动端：简化的可收起控制面板
        <>
          <button
            onClick={() => setShowControls(!showControls)}
            className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/20 text-[10px] text-white/90 z-10"
          >
            {showControls ? '✕ 关闭' : '⚙️ 控制'}
          </button>
          {showControls && (
            <div className="absolute bottom-10 left-2 bg-black/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20 space-y-2 z-10 max-w-[180px]">
              <div className="text-white text-[10px] font-bold">🌍 太阳系控制</div>
              
              {/* 播放/暂停 */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="w-full px-2 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-400/30 text-[10px]"
              >
                {isPaused ? '▶️ 继续' : '⏸️ 暂停'}
              </button>

              {/* 时间速度 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-300">
                  <span>时间流速</span>
                  <span className="text-blue-300">{currentTimeSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={currentTimeSpeed}
                  onChange={(e) => setCurrentTimeSpeed(parseFloat(e.target.value))}
                  className="w-full h-1"
                />
                <div className="flex gap-0.5">
                  {[0.5, 1, 2, 5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setCurrentTimeSpeed(speed)}
                      className="flex-1 px-1 py-0.5 bg-white/5 text-gray-300 text-[8px] rounded border border-white/10"
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* 自转控制 */}
              <button
                onClick={() => setEnableRotation(!enableRotation)}
                className="w-full px-2 py-1 bg-purple-500/20 text-purple-300 rounded border border-purple-400/30 text-[10px]"
              >
                🌐 自转: {enableRotation ? 'ON' : 'OFF'}
              </button>
              
              {enableRotation && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-gray-300">
                    <span>自转速度</span>
                    <span className="text-purple-300">{rotationSpeed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={rotationSpeed}
                    onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                    className="w-full h-1"
                  />
                </div>
              )}

              {/* 操作提示 */}
              <div className="text-[8px] text-gray-400 pt-1 border-t border-white/10">
                👆 拖动旋转 | 双指缩放
              </div>
            </div>
          )}
        </>
      ) : (
        // 桌面端：完整控制面板
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/20 space-y-2">
          <div className="text-white text-sm font-bold mb-2">🌍 太阳系控制</div>
          
          {/* 播放/暂停 */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded border border-blue-400/30 transition-all text-sm"
          >
            {isPaused ? '▶️ 继续' : '⏸️ 暂停'}
          </button>

          {/* 时间速度控制 */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-300">
              <span>时间流速</span>
              <span className="text-blue-300">{currentTimeSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={currentTimeSpeed}
              onChange={(e) => setCurrentTimeSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex gap-1">
              {[0.5, 1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setCurrentTimeSpeed(speed)}
                  className="flex-1 px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] rounded border border-white/10"
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* 自转控制 */}
          <div className="space-y-1 pt-2 border-t border-white/10">
            <button
              onClick={() => setEnableRotation(!enableRotation)}
              className="w-full px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded border border-purple-400/30 transition-all text-sm"
            >
              🌐 自转: {enableRotation ? 'ON' : 'OFF'}
            </button>
            
            {enableRotation && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-300">
                  <span>自转速度</span>
                  <span className="text-purple-300">{rotationSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={rotationSpeed}
                  onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex gap-1">
                  {[0.5, 1, 2, 3].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setRotationSpeed(speed)}
                      className="flex-1 px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] rounded border border-white/10"
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 操作提示 */}
          <div className="text-[10px] text-gray-400 space-y-0.5 pt-2 border-t border-white/10">
            <div>🖱️ 拖动：旋转视角</div>
            <div>🎯 滚轮：缩放距离</div>
            <div>↔️ 右键：平移位置</div>
            <div>⌨️ 按 R：切换自转</div>
          </div>
        </div>
      )}

      {/* 标题标签 */}
      <div className={`absolute ${isMobile ? 'top-2 left-2' : 'top-4 left-4'} bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 rounded-lg border border-blue-400/40`}>
        <span className="text-blue-300 font-bold text-[10px] sm:text-sm">🌌 太阳系 3D 实时模拟</span>
        {!isMobile && (
          <div className="text-gray-400 text-[10px] mt-0.5">
            基于 NASA 标准天文数据
          </div>
        )}
        {!texturesLoaded && (
          <div className="text-yellow-400 text-[10px] mt-1">
            📥 正在加载真实纹理...
          </div>
        )}
      </div>

      {/* 信息面板 - 移动端隐藏 */}
      {!isMobile && (
        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20 text-[10px] text-gray-400 space-y-1 max-w-[200px]">
          <div className="font-medium text-white/80">📐 比例说明</div>
          <div>• 天体大小：真实比例</div>
          <div>• 轨道距离：非真实比例</div>
          <div>• 卫星轨道：动态放大便于观察</div>
          <div className="pt-1 border-t border-white/10">1 AU = 1.496 亿 km</div>
          <div>数据来源：NASA JPL</div>
          <div className="text-yellow-400 pt-1 border-t border-white/10">💡 点击一次：聚焦 | 点击二次：详情</div>
        </div>
      )}

      {/* 聚焦提示 - 右下角（比例说明上方） */}
      {focusedBody && !showInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`absolute ${isMobile ? 'bottom-14 right-2' : 'bottom-[140px] right-4'} bg-blue-500/20 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-2 rounded-lg border border-blue-400/40 text-[10px] sm:text-xs z-10`}
        >
          <div className="text-blue-300 font-medium">
            正在观察: {focusedBody.nameChinese}
          </div>
          {!isMobile && (
            <div className="text-gray-400 text-[10px] mt-0.5">
              再次点击查看详情
            </div>
          )}
        </motion.div>
      )}

      {/* 重置视角按钮 */}
      {focusedBody && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          onClick={handleResetView}
          className={`absolute ${isMobile ? 'top-2 left-1/2' : 'top-4 left-1/2'} transform -translate-x-1/2 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 rounded-lg border border-red-400/40 text-red-300 text-[10px] sm:text-sm font-medium transition-all z-20`}
        >
          🔄 重置视角
        </motion.button>
      )}

      {/* 天体详细信息弹窗 */}
      <AnimatePresence>
        {showInfo && selectedBody && (
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={handleCloseInfo}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-br from-gray-900 to-black border-2 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
              style={{
                borderColor: selectedBody.color,
                boxShadow: `0 0 30px ${selectedBody.color}50`,
              }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* 标题 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{
                    backgroundColor: selectedBody.color,
                    boxShadow: `0 0 20px ${selectedBody.color}`,
                  }}
                >
                  {selectedBody.type === 'star' ? '☀️' : 
                   selectedBody.type === 'moon' ? '🌙' : '🪐'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedBody.nameChinese}</h3>
                  <p className="text-sm text-gray-400">{selectedBody.name}</p>
                </div>
              </div>
              <button
                onClick={handleCloseInfo}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* 简介 */}
            {selectedBody.description && (
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                {selectedBody.description}
              </p>
            )}

            {/* 详细参数 */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {selectedBody.semiMajorAxis > 0 && (
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-gray-400 text-xs mb-1">距离太阳</div>
                  <div className="text-white font-bold">{selectedBody.semiMajorAxis.toFixed(2)} 天文单位</div>
                  <div className="text-gray-500 text-[10px] mt-0.5">
                    {(selectedBody.semiMajorAxis * 1.496).toFixed(1)} 亿公里
                  </div>
                </div>
              )}
              
              {selectedBody.orbitalPeriod > 0 && (
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-gray-400 text-xs mb-1">公转周期</div>
                  <div className="text-white font-bold">
                    {selectedBody.orbitalPeriod < 1 
                      ? `${(selectedBody.orbitalPeriod * 365).toFixed(1)} 天`
                      : `${selectedBody.orbitalPeriod.toFixed(2)} 地球年`}
                  </div>
                </div>
              )}

              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-gray-400 text-xs mb-1">直径大小</div>
                <div className="text-white font-bold">{selectedBody.radius.toFixed(2)} 倍地球</div>
                <div className="text-gray-500 text-[10px] mt-0.5">
                  {(selectedBody.radius * 6371 * 2).toFixed(0)} 公里
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-gray-400 text-xs mb-1">质量大小</div>
                <div className="text-white font-bold">{selectedBody.mass.toFixed(2)} 倍地球</div>
                {selectedBody.mass > 100 && (
                  <div className="text-gray-500 text-[10px] mt-0.5">
                    约 {(selectedBody.mass * 5.972).toFixed(0)} × 10²⁴ 千克
                  </div>
                )}
              </div>

              {selectedBody.gravity && (
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-gray-400 text-xs mb-1">表面重力</div>
                  <div className="text-white font-bold">{selectedBody.gravity.toFixed(2)} 倍地球</div>
                  <div className="text-gray-500 text-[10px] mt-0.5">
                    {selectedBody.gravity > 1 ? '更重' : '更轻'}，{selectedBody.gravity > 1 ? '难跳跃' : '可跳得更高'}
                  </div>
                </div>
              )}

              {selectedBody.temperature && (
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-gray-400 text-xs mb-1">温度</div>
                  <div className="text-white font-bold text-xs">{selectedBody.temperature}</div>
                </div>
              )}

              {selectedBody.atmosphere && (
                <div className="bg-white/5 rounded-lg p-3 border border-white/10 col-span-2">
                  <div className="text-gray-400 text-xs mb-1">大气成分</div>
                  <div className="text-white font-bold text-xs">{selectedBody.atmosphere}</div>
                </div>
              )}

              {selectedBody.discovered && (
                <div className="bg-white/5 rounded-lg p-3 border border-white/10 col-span-2">
                  <div className="text-gray-400 text-xs mb-1">发现时间</div>
                  <div className="text-white font-bold">{selectedBody.discovered}</div>
                </div>
              )}
            </div>

          </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
