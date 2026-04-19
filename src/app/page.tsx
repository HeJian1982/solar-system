/**
 * 版权所有 © 2025 何健 保留所有权利
 *
 * 首页：直接渲染太阳系探索器 + 品牌角标
 */

'use client';

import dynamic from 'next/dynamic';
import { BrandLogo } from '@/components/BrandLogo';

// 客户端动态加载（Three.js 需要浏览器环境）
const SolarSystemExplorer = dynamic(
  () => import('@/components/SolarSystemExplorer').then((mod) => mod.SolarSystemExplorer),
  {
    ssr: false,
    loading: () => <LoadingScreen />,
  }
);

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">🌌</div>
        <div className="text-white text-lg">正在加载太阳系...</div>
        <div className="text-gray-500 text-sm mt-2">准备 3D 渲染引擎</div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      <SolarSystemExplorer />
      <BrandLogo />
    </main>
  );
}
