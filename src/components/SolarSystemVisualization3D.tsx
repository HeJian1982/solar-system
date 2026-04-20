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
} from '@/lib/local-texture-loader';
import {
  calculateAsteroidPosition,
  type CustomAsteroid,
} from '@/lib/solar-system-explorer';

interface SolarSystemVisualization3DProps {
  showOrbits?: boolean;
  showLabels?: boolean;
  showAsteroidBelt?: boolean; // 显示小行星带
  showSatellites?: boolean;   // 显示卫星（默认隐藏）
  timeSpeed?: number;          // 时间流速倍率（受控，默认 1）
  isPaused?: boolean;          // 是否暂停（受控，默认 false）
  onTimeSpeedChange?: (speed: number) => void;
  onPauseToggle?: () => void;
  onBodyClick?: (body: CelestialBody) => void; // 天体点击回调（任务 / 积分 / 趣味知识）
  customAsteroids?: CustomAsteroid[];          // 自定义小行星列表（渲染到 3D 场景）
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
  } else if (body.id === 'jupiter') {
    // 木星：鲜明条带 + 大红斑
    const bands = [
      { y: 0, h: 30, color: '#C4A882' },
      { y: 30, h: 25, color: '#B8976A' },
      { y: 55, h: 35, color: '#D4B896' },
      { y: 90, h: 20, color: '#A0845C' },
      { y: 110, h: 40, color: '#D9C4A0' },
      { y: 150, h: 25, color: '#C09060' },
      { y: 175, h: 30, color: '#E0CDB0' },
      { y: 205, h: 25, color: '#B08050' },
      { y: 230, h: 26, color: '#D4B896' },
    ];
    bands.forEach(({ y: by, h, color }) => {
      ctx.fillStyle = color;
      ctx.fillRect(0, by, canvas.width, h);
      for (let row = 0; row < h; row += 2) {
        ctx.fillStyle = `rgba(0,0,0,${0.03 + Math.sin((by + row) * 0.15) * 0.04})`;
        ctx.fillRect(0, by + row, canvas.width, 2);
      }
    });
    // 大红斑
    const grs = ctx.createRadialGradient(340, 130, 0, 340, 130, 28);
    grs.addColorStop(0, 'rgba(200, 80, 50, 0.7)');
    grs.addColorStop(0.6, 'rgba(180, 90, 60, 0.4)');
    grs.addColorStop(1, 'transparent');
    ctx.fillStyle = grs;
    ctx.beginPath();
    ctx.ellipse(340, 130, 30, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (body.id === 'saturn') {
    // 土星：柔和金色条带，对比度低于木星
    const bands = [
      { y: 0, h: 35, color: '#E8D5B0' },
      { y: 35, h: 30, color: '#D4C49A' },
      { y: 65, h: 40, color: '#F0E0C0' },
      { y: 105, h: 25, color: '#C8B888' },
      { y: 130, h: 35, color: '#E0D0A8' },
      { y: 165, h: 30, color: '#D0BF96' },
      { y: 195, h: 35, color: '#ECD8B4' },
      { y: 230, h: 26, color: '#D8C8A0' },
    ];
    bands.forEach(({ y: by, h, color }) => {
      ctx.fillStyle = color;
      ctx.fillRect(0, by, canvas.width, h);
      for (let row = 0; row < h; row += 2) {
        ctx.fillStyle = `rgba(0,0,0,${0.01 + Math.sin((by + row) * 0.1) * 0.02})`;
        ctx.fillRect(0, by + row, canvas.width, 2);
      }
    });
    // 北极六角风暴（顶部微弱暗斑）
    const hex = ctx.createRadialGradient(256, 10, 0, 256, 10, 25);
    hex.addColorStop(0, 'rgba(160, 140, 100, 0.3)');
    hex.addColorStop(1, 'transparent');
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.arc(256, 10, 25, 0, Math.PI * 2);
    ctx.fill();
  } else if (body.id === 'uranus') {
    // 天王星：均匀淡蓝绿色，几乎无特征
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#6FE8D0');
    gradient.addColorStop(0.3, '#5DD4C4');
    gradient.addColorStop(0.5, '#4DC8BC');
    gradient.addColorStop(0.7, '#5DD4C4');
    gradient.addColorStop(1, '#6FE8D0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 极其微弱的云带
    for (let y = 0; y < canvas.height; y += 8) {
      ctx.fillStyle = `rgba(255,255,255,${0.02 + Math.sin(y * 0.08) * 0.015})`;
      ctx.fillRect(0, y, canvas.width, 4);
    }
  } else if (body.id === 'neptune') {
    // 海王星：鲜艳深蓝色，有可见风暴
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#3070D0');
    gradient.addColorStop(0.3, '#2860C0');
    gradient.addColorStop(0.5, '#2050B0');
    gradient.addColorStop(0.7, '#2860C0');
    gradient.addColorStop(1, '#3070D0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 大暗斑
    const ds = ctx.createRadialGradient(300, 110, 0, 300, 110, 22);
    ds.addColorStop(0, 'rgba(10, 30, 80, 0.6)');
    ds.addColorStop(0.7, 'rgba(20, 40, 100, 0.3)');
    ds.addColorStop(1, 'transparent');
    ctx.fillStyle = ds;
    ctx.beginPath();
    ctx.ellipse(300, 110, 25, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    // 明亮的甲烷云
    ctx.fillStyle = 'rgba(180, 220, 255, 0.25)';
    for (let i = 0; i < 15; i++) {
      const cx = Math.random() * canvas.width;
      const cy = Math.random() * canvas.height;
      ctx.fillRect(cx, cy, 12 + Math.random() * 20, 3 + Math.random() * 5);
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
  } else if (body.id === 'moon') {
    // 月球：灰色 + 月海（暗色斑块）+ 陨石坑
    ctx.fillStyle = '#B0ADA8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 月海（大片暗区）
    const marias = [
      { x: 120, y: 80, rx: 60, ry: 40, color: 'rgba(80, 78, 74, 0.5)' },
      { x: 280, y: 100, rx: 80, ry: 50, color: 'rgba(75, 73, 70, 0.45)' },
      { x: 380, y: 150, rx: 50, ry: 35, color: 'rgba(85, 82, 78, 0.4)' },
      { x: 180, y: 180, rx: 70, ry: 45, color: 'rgba(70, 68, 65, 0.5)' },
    ];
    marias.forEach(m => {
      const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, Math.max(m.rx, m.ry));
      g.addColorStop(0, m.color);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    // 陨石坑
    for (let i = 0; i < 40; i++) {
      const cx = Math.random() * canvas.width;
      const cy = Math.random() * canvas.height;
      const r = 3 + Math.random() * 14;
      ctx.strokeStyle = `rgba(90, 88, 84, ${0.3 + Math.random() * 0.3})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      cg.addColorStop(0, `rgba(60, 58, 55, ${0.15 + Math.random() * 0.2})`);
      cg.addColorStop(1, 'transparent');
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }
  } else if (body.id === 'io') {
    // 木卫一：硫磺覆盖，黄橙色 + 火山斑点
    ctx.fillStyle = '#E8C840';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 不规则硫磺色块
    for (let i = 0; i < 60; i++) {
      const colors = ['#F0D848', '#D4A830', '#C89020', '#F8E060', '#E0B030'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.globalAlpha = 0.3 + Math.random() * 0.4;
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.ellipse(x, y, 8 + Math.random() * 25, 6 + Math.random() * 18, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // 火山口（暗红/黑色圆斑）
    for (let i = 0; i < 15; i++) {
      const vx = Math.random() * canvas.width;
      const vy = Math.random() * canvas.height;
      const vr = 3 + Math.random() * 8;
      const vg = ctx.createRadialGradient(vx, vy, 0, vx, vy, vr * 2);
      vg.addColorStop(0, 'rgba(80, 20, 10, 0.7)');
      vg.addColorStop(0.5, 'rgba(160, 60, 20, 0.3)');
      vg.addColorStop(1, 'transparent');
      ctx.fillStyle = vg;
      ctx.beginPath(); ctx.arc(vx, vy, vr * 2, 0, Math.PI * 2); ctx.fill();
    }
  } else if (body.id === 'europa') {
    // 木卫二：冰蓝白色表面 + 褐红色裂缝纹
    ctx.fillStyle = '#D8E4EC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 微妙亮暗变化
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(200, 215, 225, ${0.2 + Math.random() * 0.3})`;
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.ellipse(x, y, 15 + Math.random() * 40, 10 + Math.random() * 30, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // 冰裂纹
    ctx.strokeStyle = 'rgba(140, 80, 50, 0.35)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 25; i++) {
      ctx.beginPath();
      let lx = Math.random() * canvas.width;
      let ly = Math.random() * canvas.height;
      ctx.moveTo(lx, ly);
      for (let j = 0; j < 6; j++) {
        lx += (Math.random() - 0.5) * 60;
        ly += (Math.random() - 0.5) * 40;
        ctx.lineTo(lx, ly);
      }
      ctx.stroke();
    }
  } else if (body.id === 'ganymede') {
    // 木卫三：最大卫星，深浅交错沟槽地形
    ctx.fillStyle = '#9A917C';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 亮暗区域
    for (let i = 0; i < 20; i++) {
      const bright = Math.random() > 0.5;
      ctx.fillStyle = bright ? 'rgba(180, 175, 160, 0.4)' : 'rgba(70, 65, 55, 0.3)';
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.ellipse(x, y, 20 + Math.random() * 50, 15 + Math.random() * 35, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // 沟槽纹
    ctx.strokeStyle = 'rgba(120, 115, 100, 0.3)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      const sx = Math.random() * canvas.width;
      const sy = Math.random() * canvas.height;
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + (Math.random() - 0.5) * 100, sy + (Math.random() - 0.5) * 60);
      ctx.stroke();
    }
  } else if (body.id === 'callisto') {
    // 木卫四：密集陨石坑 + 亮斑
    ctx.fillStyle = '#5C5445';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 60; i++) {
      const cx = Math.random() * canvas.width;
      const cy = Math.random() * canvas.height;
      const r = 3 + Math.random() * 16;
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      cg.addColorStop(0, `rgba(40, 36, 30, ${0.3 + Math.random() * 0.3})`);
      cg.addColorStop(0.7, `rgba(100, 95, 85, 0.15)`);
      cg.addColorStop(1, 'transparent');
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }
    // 亮射线坑
    for (let i = 0; i < 5; i++) {
      const bx = Math.random() * canvas.width;
      const by = Math.random() * canvas.height;
      const bg = ctx.createRadialGradient(bx, by, 0, bx, by, 12 + Math.random() * 10);
      bg.addColorStop(0, 'rgba(200, 195, 180, 0.5)');
      bg.addColorStop(1, 'transparent');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.arc(bx, by, 20, 0, Math.PI * 2); ctx.fill();
    }
  } else if (body.id === 'titan') {
    // 土卫六：橙色迷雾大气，几乎看不到表面
    const tg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    tg.addColorStop(0, '#C89050');
    tg.addColorStop(0.3, '#D4A060');
    tg.addColorStop(0.7, '#C08848');
    tg.addColorStop(1, '#B07838');
    ctx.fillStyle = tg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 朦胧大气条纹
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = `rgba(220, 180, 120, ${0.08 + Math.random() * 0.12})`;
      const y = Math.random() * canvas.height;
      ctx.fillRect(0, y, canvas.width, 5 + Math.random() * 15);
    }
  } else if (body.id === 'enceladus') {
    // 土卫二：极亮冰白色，南极冰泉喷射
    ctx.fillStyle = '#F0EDE8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = `rgba(230, 240, 250, ${0.3 + Math.random() * 0.3})`;
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.ellipse(x, y, 10 + Math.random() * 30, 8 + Math.random() * 20, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // 南极裂缝（蓝色线）
    ctx.strokeStyle = 'rgba(100, 160, 200, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      const sx = 100 + Math.random() * 300;
      ctx.moveTo(sx, canvas.height - 20);
      ctx.lineTo(sx + (Math.random() - 0.5) * 40, canvas.height - 40 - Math.random() * 30);
      ctx.stroke();
    }
  } else if (body.id === 'iapetus') {
    // 土卫八：半黑半白双色
    ctx.fillStyle = '#E0DCD6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 左半暗（前导半球）
    const ig = ctx.createLinearGradient(0, 0, canvas.width, 0);
    ig.addColorStop(0, 'rgba(40, 30, 25, 0.85)');
    ig.addColorStop(0.45, 'rgba(40, 30, 25, 0.7)');
    ig.addColorStop(0.55, 'rgba(40, 30, 25, 0.1)');
    ig.addColorStop(1, 'transparent');
    ctx.fillStyle = ig;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (body.id === 'triton') {
    // 海卫一：粉蓝色氮冰 + 暗斑
    const trg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    trg.addColorStop(0, '#B8D8E8');
    trg.addColorStop(0.4, '#D0B8B0');
    trg.addColorStop(1, '#A0C8D8');
    ctx.fillStyle = trg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 氮间歇泉暗斑
    for (let i = 0; i < 10; i++) {
      const sx = Math.random() * canvas.width;
      const sy = canvas.height * 0.5 + Math.random() * canvas.height * 0.4;
      const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 8 + Math.random() * 12);
      sg.addColorStop(0, 'rgba(60, 50, 50, 0.4)');
      sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(sx, sy, 15, 0, Math.PI * 2); ctx.fill();
    }
  } else if (body.type === 'moon') {
    // 其他卫星：使用各自的 color 做基底 + 陨石坑
    ctx.fillStyle = body.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 亮暗变化
    for (let i = 0; i < 25; i++) {
      const dark = Math.random() > 0.5;
      ctx.fillStyle = dark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)';
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.ellipse(x, y, 10 + Math.random() * 25, 8 + Math.random() * 18, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // 陨石坑
    for (let i = 0; i < 20; i++) {
      const cx = Math.random() * canvas.width;
      const cy = Math.random() * canvas.height;
      const r = 3 + Math.random() * 12;
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      cg.addColorStop(0, 'rgba(0,0,0,0.2)');
      cg.addColorStop(0.7, 'rgba(0,0,0,0.05)');
      cg.addColorStop(1, 'transparent');
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
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

// 程序化光环纹理（横向渐变表示从内到外的环带结构）
const globalRingTextureCache = new Map<string, THREE.CanvasTexture>();
function getRingTexture(planetId: string): THREE.CanvasTexture {
  if (globalRingTextureCache.has(planetId)) return globalRingTextureCache.get(planetId)!;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  if (planetId === 'saturn') {
    // 土星环：D-C-B-Cassini缝-A-Encke缝-F 多环带
    const g = ctx.createLinearGradient(0, 0, canvas.width, 0);
    g.addColorStop(0.00, 'rgba(180,160,130,0.08)');
    g.addColorStop(0.08, 'rgba(190,170,140,0.25)');
    g.addColorStop(0.18, 'rgba(210,190,155,0.50)');
    g.addColorStop(0.28, 'rgba(235,215,175,0.85)');
    g.addColorStop(0.40, 'rgba(245,225,185,0.90)');
    g.addColorStop(0.42, 'rgba(0,0,0,0.03)');          // Cassini Division
    g.addColorStop(0.46, 'rgba(0,0,0,0.03)');
    g.addColorStop(0.49, 'rgba(215,195,160,0.60)');
    g.addColorStop(0.62, 'rgba(200,180,150,0.50)');
    g.addColorStop(0.66, 'rgba(0,0,0,0.02)');          // Encke Gap
    g.addColorStop(0.68, 'rgba(195,175,145,0.40)');
    g.addColorStop(0.82, 'rgba(175,155,125,0.18)');
    g.addColorStop(1.00, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (planetId === 'uranus') {
    // 天王星环：窄而暗的环，间隔大
    const g = ctx.createLinearGradient(0, 0, canvas.width, 0);
    g.addColorStop(0.00, 'rgba(0,0,0,0)');
    g.addColorStop(0.25, 'rgba(90,110,130,0.10)');
    g.addColorStop(0.40, 'rgba(80,100,120,0.18)');
    g.addColorStop(0.42, 'rgba(0,0,0,0)');
    g.addColorStop(0.55, 'rgba(0,0,0,0)');
    g.addColorStop(0.58, 'rgba(90,110,130,0.12)');
    g.addColorStop(0.62, 'rgba(0,0,0,0)');
    g.addColorStop(0.78, 'rgba(100,120,140,0.15)');
    g.addColorStop(0.82, 'rgba(0,0,0,0)');
    g.addColorStop(0.92, 'rgba(110,130,150,0.10)');
    g.addColorStop(1.00, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  globalRingTextureCache.set(planetId, texture);
  return texture;
}

// 小行星带组件
function AsteroidBelt({ isMobile = false }: { isMobile?: boolean }) {
  const asteroidCount = isMobile ? 100 : 200;
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
  isMobile = false,
  showSatellites = false,
}: {
  body: CelestialBody;
  time: number;
  showOrbit: boolean;
  parentPosition?: [number, number, number];
  onBodyClick?: (body: CelestialBody) => void;
  enableRotation?: boolean;
  rotationSpeed?: number;
  isMobile?: boolean;
  showSatellites?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { SCALE } = SOLAR_SYSTEM_CONSTANTS;


  // 计算当前位置
  const position = useMemo(() => {
    const pos = calculateOrbitalPosition(body, time);
    
    // 默认缩放
    let currentScale = SCALE.distance;
    
    // 卫星特殊处理：缩放轨道使之紧贴母行星，同时不侵入相邻行星轨道
    if (body.type === 'moon' && body.parent) {
      const parentData = SOLAR_SYSTEM_DATA.find(b => b.id === body.parent);
      if (parentData && parentData.satellites) {
        const parentDisplayRadius = parentData.radius * SCALE.planetRadius * 0.01;
        const minSatOrbit = Math.min(...parentData.satellites.map(s => s.semiMajorAxis));
        const maxSatOrbit = Math.max(...parentData.satellites.map(s => s.semiMajorAxis));
        // 基础缩放：使最内层卫星 = 母行星半径 * 3.5（保留足够视觉间距）
        const innerScale = (parentDisplayRadius * 3.5) / (minSatOrbit * SCALE.distance);
        // 上限：最外层卫星不超过到最近行星距离的30%
        const planets = SOLAR_SYSTEM_DATA.filter(b => b.type === 'planet');
        let minGap = Infinity;
        for (const p of planets) {
          if (p.id === parentData.id) continue;
          const gap = Math.abs(p.semiMajorAxis - parentData.semiMajorAxis) * SCALE.distance;
          if (gap < minGap) minGap = gap;
        }
        const maxAllowedRadius = minGap * 0.3;
        const outerScale = maxAllowedRadius / (maxSatOrbit * SCALE.distance);
        currentScale = SCALE.distance * Math.min(innerScale, outerScale);
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
    if (body.type === 'moon' && body.parent) {
      // 卫星：真实比例渲染，但设最小值防止完全看不见
      // 最小值 = 母行星显示半径的 5%（相对最小值，不会让 Phobos 变成火星一半大）
      const parentData = SOLAR_SYSTEM_DATA.find(b => b.id === body.parent);
      const parentDisplayR = parentData ? parentData.radius * SCALE.planetRadius * 0.01 : 1;
      const realR = body.radius * SCALE.planetRadius * 0.01;
      const minR = parentDisplayR * 0.05;
      return Math.max(realR, minR);
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
        const minSatOrbit = Math.min(...parentData.satellites.map(s => s.semiMajorAxis));
        const maxSatOrbit = Math.max(...parentData.satellites.map(s => s.semiMajorAxis));
        const innerScale = (parentDisplayRadius * 3.5) / (minSatOrbit * SCALE.distance);
        const planets = SOLAR_SYSTEM_DATA.filter(b => b.type === 'planet');
        let minGap = Infinity;
        for (const p of planets) {
          if (p.id === parentData.id) continue;
          const gap = Math.abs(p.semiMajorAxis - parentData.semiMajorAxis) * SCALE.distance;
          if (gap < minGap) minGap = gap;
        }
        const outerScale = (minGap * 0.3) / (maxSatOrbit * SCALE.distance);
        orbitScale = SCALE.distance * Math.min(innerScale, outerScale);
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
        <sphereGeometry args={[displayRadius, isMobile ? 16 : 32, isMobile ? 16 : 32]} />
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

      {/* 光环（土星、天王星）— 使用程序化纹理 + 真实轴倾角 */}
      {hasRings && (
        <mesh
          position={position}
          rotation={
            body.id === 'saturn'
              ? [Math.PI / 2, 0, 26.7 * Math.PI / 180]   // 土星轴倾 26.7°
              : [Math.PI / 2, 0, 97.8 * Math.PI / 180]    // 天王星轴倾 97.8°
          }
        >
          <ringGeometry args={[
            displayRadius * (body.id === 'saturn' ? 1.3 : 1.5),
            displayRadius * (body.id === 'saturn' ? 2.8 : 2.2),
            128,
          ]} />
          <meshStandardMaterial
            map={getRingTexture(body.id)}
            transparent
            opacity={body.id === 'saturn' ? 0.85 : 0.5}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
      
      {/* 渲染卫星 */}
      {showSatellites && body.satellites?.map(satellite => (
        <CelestialBodyMesh
          key={satellite.id}
          body={satellite}
          time={time}
          showOrbit={showOrbit}
          parentPosition={position}
          onBodyClick={onBodyClick}
          enableRotation={enableRotation}
          rotationSpeed={rotationSpeed}
          isMobile={isMobile}
          showSatellites={false}
        />
      ))}
    </group>
  );
}

// 自定义小行星网格（球体 + 轨道线）
function CustomAsteroidMesh({
  asteroid,
  time,
  showOrbit,
}: {
  asteroid: CustomAsteroid;
  time: number;
  showOrbit: boolean;
}) {
  const { SCALE } = SOLAR_SYSTEM_CONSTANTS;

  // 当前位置（Y-up 坐标系，与其他天体一致）
  const position = useMemo(() => {
    const pos = calculateAsteroidPosition(asteroid, time);
    return [
      pos.x * SCALE.distance,
      pos.z * SCALE.distance,
      pos.y * SCALE.distance,
    ] as [number, number, number];
  }, [asteroid, time, SCALE.distance]);

  // 显示半径（较小但有下限保证可见）
  const displayRadius = useMemo(() => {
    return Math.max(asteroid.radius * SCALE.planetRadius * 0.02, 0.08);
  }, [asteroid.radius, SCALE.planetRadius]);

  // 轨道点（一个完整周期）
  const orbitLine = useMemo(() => {
    if (!showOrbit) return null;
    const segments = 128;
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * asteroid.orbitalPeriod;
      const pos = calculateAsteroidPosition(asteroid, t);
      points.push(new THREE.Vector3(
        pos.x * SCALE.distance,
        pos.z * SCALE.distance,
        pos.y * SCALE.distance,
      ));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: asteroid.color,
      transparent: true,
      opacity: 0.35,
    });
    return new THREE.Line(geometry, material);
  }, [asteroid, showOrbit, SCALE.distance]);

  useEffect(() => {
    return () => {
      if (orbitLine) {
        orbitLine.geometry.dispose();
        (orbitLine.material as THREE.Material).dispose();
      }
    };
  }, [orbitLine]);

  return (
    <>
      {orbitLine && <primitive object={orbitLine} />}
      <mesh position={position}>
        <sphereGeometry args={[displayRadius, 16, 16]} />
        <meshStandardMaterial
          color={asteroid.color}
          emissive={asteroid.color}
          emissiveIntensity={0.25}
          roughness={0.7}
        />
      </mesh>
    </>
  );
}

// 主场景组件
function SolarSystemScene({
  showOrbits,
  showAsteroidBelt,
  showSatellites,
  timeSpeed,
  onBodyClick,
  focusedBody,
  enableRotation,
  rotationSpeed,
  customAsteroids,
  isMobile = false,
}: {
  showOrbits: boolean;
  showAsteroidBelt: boolean;
  showSatellites: boolean;
  timeSpeed: number;
  onBodyClick?: (body: CelestialBody) => void;
  focusedBody: CelestialBody | null;
  enableRotation: boolean;
  rotationSpeed: number;
  customAsteroids?: CustomAsteroid[];
  isMobile?: boolean;
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
          
          // 计算卫星相对于母行星的位置（统一缩放 + 轨道夹紧）
          const parentDisplayRadius = parentBody.radius * SCALE.planetRadius * 0.01;
          const sats = parentBody.satellites || [focusedBody];
          const minSatOrbit = Math.min(...sats.map(s => s.semiMajorAxis));
          const maxSatOrbit = Math.max(...sats.map(s => s.semiMajorAxis));
          const innerScale = (parentDisplayRadius * 3.5) / (minSatOrbit * SCALE.distance);
          const planets = SOLAR_SYSTEM_DATA.filter(b => b.type === 'planet');
          let minGap = Infinity;
          for (const p of planets) {
            if (p.id === parentBody.id) continue;
            const gap = Math.abs(p.semiMajorAxis - parentBody.semiMajorAxis) * SCALE.distance;
            if (gap < minGap) minGap = gap;
          }
          const outerScale = (minGap * 0.3) / (maxSatOrbit * SCALE.distance);
          const moonScale = SCALE.distance * Math.min(innerScale, outerScale);
          
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
      {showAsteroidBelt && <AsteroidBelt isMobile={isMobile} />}

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
          isMobile={isMobile}
          showSatellites={showSatellites}
        />
      ))}

      {/* 自定义小行星 */}
      {customAsteroids?.map((asteroid) => (
        <CustomAsteroidMesh
          key={asteroid.id}
          asteroid={asteroid}
          time={time}
          showOrbit={showOrbits}
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
  timeSpeed: externalTimeSpeed,
  isPaused: externalIsPaused,
  onTimeSpeedChange,
  onPauseToggle,
  onBodyClick,
  customAsteroids,
  className = '',
}: SolarSystemVisualization3DProps) {
  // 时间速度 / 暂停状态：完全受控于 Parent，此处不维护内部副本
  const currentTimeSpeed = externalTimeSpeed ?? 1;
  const isPaused = externalIsPaused ?? false;

  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(null);
  const [focusedBody, setFocusedBody] = useState<CelestialBody | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  const [enableRotation, setEnableRotation] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [isMobile, setIsMobile] = useState(false);  // UI 布局用（窄屏）
  const [isTouchDevice, setIsTouchDevice] = useState(false); // 真正移动设备（触屏+窄屏）— 用于性能降级
  const [showControls, setShowControls] = useState(false);
  const [showPlanetList, setShowPlanetList] = useState(false);
  const [showSatellites, setShowSatellites] = useState(initialShowSatellites);

  // 检测移动端：区分“窄屏布局”和“真正触屏设备”
  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const checkMobile = () => {
      const narrow = window.innerWidth < 768;
      setIsMobile(narrow);
      setIsTouchDevice(narrow && hasTouch); // 只有触屏+窄屏才算真正移动设备
      if (narrow) {
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
    // 通知外层（任务进度 / 积分 / 趣味知识）
    onBodyClick?.(body);
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
    <div className={`relative w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 50, 100], fov: 60 }}
        className="rounded-lg border border-white/10"
        style={{ background: '#000000' }}
        gl={{
          antialias: !isTouchDevice,
          alpha: false,
          powerPreference: isTouchDevice ? 'default' : 'high-performance',
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
            clearLocalTextureCache(); // 清空真实纹理缓存
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
          showSatellites={showSatellites}
          timeSpeed={isPaused ? 0 : currentTimeSpeed}
          onBodyClick={handleBodyClick}
          focusedBody={focusedBody}
          enableRotation={enableRotation}
          rotationSpeed={rotationSpeed}
          customAsteroids={customAsteroids}
          isMobile={isTouchDevice}
        />
      </Canvas>

      {/* 右上角图标工具栏 — 所有按钮默认收起，点击展开面板 */}
      <div className={`absolute ${isMobile ? 'top-2 right-2' : 'top-4 right-4'} z-20 flex gap-1.5`}>
        {/* ☰ 行星列表 */}
        {showLabels && (
          <button
            onClick={() => { setShowPlanetList(!showPlanetList); setShowControls(false); }}
            className={`${isMobile ? 'w-8 h-8 text-sm' : 'w-9 h-9 text-base'} rounded-lg bg-black/80 backdrop-blur-sm border text-white/90 flex items-center justify-center hover:bg-white/10 transition-all ${showPlanetList ? 'border-blue-400/50' : 'border-white/20'}`}
            title="行星列表"
          >☰</button>
        )}
        {/* ⚙️ 场景控制 */}
        <button
          onClick={() => { setShowControls(!showControls); setShowPlanetList(false); }}
          className={`${isMobile ? 'w-8 h-8 text-sm' : 'w-9 h-9 text-base'} rounded-lg bg-black/80 backdrop-blur-sm border text-white/90 flex items-center justify-center hover:bg-white/10 transition-all ${showControls ? 'border-blue-400/50' : 'border-white/20'}`}
          title="场景控制"
        >⚙️</button>
      </div>

      {/* 行星列表下拉面板 */}
      <AnimatePresence>
        {showPlanetList && showLabels && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.12 }}
            className={`absolute ${isMobile ? 'top-12 right-2 w-[130px]' : 'top-16 right-4 w-[150px]'} z-20 space-y-0.5 max-h-[320px] overflow-y-auto bg-black/90 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl p-1.5`}
          >
            {SOLAR_SYSTEM_DATA.filter(b => isMobile ? b.type !== 'moon' : true).map((body) => (
              <div
                key={body.id}
                onClick={() => handleBodyClick(body)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer hover:bg-white/10 transition-all ${isMobile ? 'text-[10px]' : 'text-[11px]'}`}
                style={{
                  borderColor: focusedBody?.id === body.id ? body.color : 'transparent',
                  border: `1px solid ${focusedBody?.id === body.id ? body.color : 'transparent'}`,
                  boxShadow: focusedBody?.id === body.id ? `0 0 6px ${body.color}40` : undefined,
                  paddingLeft: body.type === 'moon' ? '1rem' : undefined,
                }}
              >
                <div
                  className={`${body.type === 'moon' ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5'} rounded-full flex-shrink-0`}
                  style={{ backgroundColor: body.color, boxShadow: `0 0 4px ${body.color}` }}
                />
                <span className="text-white/90 truncate">{body.nameChinese}</span>
                {!isMobile && body.semiMajorAxis > 0 && body.type !== 'moon' && (
                  <span className="text-gray-500 text-[8px] ml-auto flex-shrink-0">{body.semiMajorAxis.toFixed(1)}</span>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 场景控制下拉面板 */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.12 }}
            className={`absolute ${isMobile ? 'top-12 right-2 w-[200px]' : 'top-16 right-4 w-[220px]'} z-20 bg-black/90 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl overflow-hidden`}
          >
            <div className={`${isMobile ? 'p-2 space-y-2' : 'p-3 space-y-2.5'}`}>
              {/* ── 时间控制 ── */}
              <div className="space-y-1.5">
                <div className={`text-gray-400 font-medium ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>⏱ 时间</div>
                <button
                  onClick={() => onPauseToggle?.()}
                  className={`w-full ${isMobile ? 'py-1 text-[10px]' : 'py-1.5 text-xs'} rounded-lg border transition-all ${isPaused ? 'bg-green-500/20 border-green-400/30 text-green-300 hover:bg-green-500/30' : 'bg-orange-500/20 border-orange-400/30 text-orange-300 hover:bg-orange-500/30'}`}
                >
                  {isPaused ? '▶ 继续' : '⏸ 暂停'}
                </button>
                <div className="space-y-0.5">
                  <div className={`flex justify-between ${isMobile ? 'text-[9px]' : 'text-[10px]'} text-gray-400`}>
                    <span>流速</span>
                    <span className="text-blue-300 font-mono">{currentTimeSpeed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range" min="0.1" max="10" step="0.1"
                    value={currentTimeSpeed}
                    onChange={(e) => onTimeSpeedChange?.(parseFloat(e.target.value))}
                    className="w-full h-1 accent-blue-400"
                  />
                  <div className="flex gap-1">
                    {[0.5, 1, 2, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => onTimeSpeedChange?.(s)}
                        className={`flex-1 py-0.5 rounded text-[8px] border transition-all ${Math.abs(currentTimeSpeed - s) < 0.05 ? 'bg-blue-500/30 border-blue-400/50 text-blue-200' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── 显示选项 ── */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className={`text-gray-400 font-medium ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>👁 显示</div>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setShowSatellites(!showSatellites)}
                    className={`${isMobile ? 'py-1 text-[10px]' : 'py-1.5 text-xs'} rounded-lg border transition-all ${showSatellites ? 'bg-cyan-500/20 border-cyan-400/30 text-cyan-300' : 'bg-white/5 border-white/10 text-gray-400'}`}
                  >
                    🌙 卫星
                  </button>
                  <button
                    onClick={() => setEnableRotation(!enableRotation)}
                    className={`${isMobile ? 'py-1 text-[10px]' : 'py-1.5 text-xs'} rounded-lg border transition-all ${enableRotation ? 'bg-purple-500/20 border-purple-400/30 text-purple-300' : 'bg-white/5 border-white/10 text-gray-400'}`}
                  >
                    🌐 自转
                  </button>
                </div>
                {enableRotation && (
                  <div className="flex items-center gap-2">
                    <span className={`text-purple-300 font-mono w-7 ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>{rotationSpeed.toFixed(1)}x</span>
                    <input
                      type="range" min="0.1" max="5" step="0.1"
                      value={rotationSpeed}
                      onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                      className="flex-1 h-1 accent-purple-400"
                    />
                  </div>
                )}
              </div>

              {/* ── 操作提示 ── */}
              <div className={`pt-1.5 border-t border-white/10 text-gray-500 ${isMobile ? 'text-[8px]' : 'text-[9px]'}`}>
                {isMobile ? '👆 拖动旋转 | 双指缩放' : '🖱 拖动 · 滚轮缩放 · 右键平移'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 纹理加载指示器（仅加载时显示，左下角小字） */}
      {!texturesLoaded && (
        <div className="absolute bottom-4 left-4 text-yellow-400/70 text-[10px]">
          📥 正在加载纹理...
        </div>
      )}

      {/* 比例说明 — 底部居中，紧凑单行 */}
      <div className={`absolute ${isMobile ? 'bottom-2' : 'bottom-3'} left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 text-[9px] text-gray-500 flex items-center gap-2 whitespace-nowrap`}>
        <span>📐 天体大小：真实比例</span>
        <span className="text-white/10">|</span>
        <span>轨道距离：非真实比例</span>
        <span className="text-white/10">|</span>
        <span>数据：NASA JPL</span>
        <span className="text-white/10">|</span>
        <span className="text-yellow-400/60">点击聚焦 · 再点详情</span>
      </div>

      {/* 聚焦提示 - 右下角（比例说明上方） */}
      {focusedBody && !showInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`absolute ${isMobile ? 'bottom-10 right-2' : 'bottom-12 right-4'} bg-blue-500/20 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-2 rounded-lg border border-blue-400/40 text-[10px] sm:text-xs z-10`}
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
