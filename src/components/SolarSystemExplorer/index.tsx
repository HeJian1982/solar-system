/**
 * 版权所有 © 2025 何健 保留所有权利
 * 
 * 功能：太阳系探索器主组件
 * 增强功能：自定义小行星、教育内容
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SolarSystemVisualization3D } from '../SolarSystemVisualization3D';
import { AsteroidCreator } from './AsteroidCreator';
import { 
  type CustomAsteroid,
  generateRandomAsteroid,
} from '@/lib/solar-system-explorer';

export function SolarSystemExplorer() {
  const [customAsteroids, setCustomAsteroids] = useState<CustomAsteroid[]>([]);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [showAsteroidCreator, setShowAsteroidCreator] = useState(false);

  // 添加自定义小行星
  const handleAddAsteroid = useCallback((asteroid: CustomAsteroid) => {
    setCustomAsteroids(prev => [...prev, asteroid]);
    setShowAsteroidCreator(false);
  }, []);

  // 添加随机小行星
  const handleAddRandomAsteroid = useCallback(() => {
    const asteroid = generateRandomAsteroid();
    setCustomAsteroids(prev => [...prev, asteroid]);
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsPaused(prev => !prev);
          break;
        case 'ArrowUp':
          setTimeSpeed(prev => Math.min(prev * 2, 100));
          break;
        case 'ArrowDown':
          setTimeSpeed(prev => Math.max(prev / 2, 0.1));
          break;
        case 'a':
        case 'A':
          setShowAsteroidCreator(prev => !prev);
          break;
        case 'Escape':
          setShowAsteroidCreator(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-black">
      {/* 3D 太阳系可视化 */}
      <div className="absolute inset-0">
        <SolarSystemVisualization3D
          showOrbits={true}
          showLabels={true}
          showAsteroidBelt={true}
          timeSpeed={timeSpeed}
          isPaused={isPaused}
          onTimeSpeedChange={setTimeSpeed}
          onPauseToggle={() => setIsPaused(prev => !prev)}
          customAsteroids={customAsteroids}
          className="w-full h-full"
        />
      </div>

      {/* 顶部右侧：小行星图标按钮（仅桌面） */}
      <div className="absolute top-3 md:top-4 left-3 md:left-4 right-3 md:right-4 flex justify-end items-start z-10 pointer-events-none">
        <div className="hidden md:flex gap-1.5 pointer-events-auto">
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleAddRandomAsteroid}
            className="w-9 h-9 rounded-lg bg-black/80 backdrop-blur-sm border border-orange-500/30 hover:border-orange-500/60 transition-colors text-orange-400 flex items-center justify-center text-base"
            title="随机添加小行星"
          >🌑</motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setShowAsteroidCreator(true)}
            className="w-9 h-9 rounded-lg bg-black/80 backdrop-blur-sm border border-purple-500/30 hover:border-purple-500/60 transition-colors text-purple-400 flex items-center justify-center text-base"
            title="自定义轨道"
          >🛸</motion.button>
        </div>
      </div>


      {/* 自定义小行星数量徽章（仅桌面，左下角紧凑显示） */}
      {customAsteroids.length > 0 && (
        <div className="hidden md:block absolute bottom-24 left-4 z-10">
          <div className="bg-black/80 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-2.5 py-1.5 text-gray-400 text-[10px] flex items-center gap-1.5">
              <span>🌑 ×{customAsteroids.length}</span>
              <button
                onClick={() => setCustomAsteroids([])}
                className="text-red-400/60 hover:text-red-300 text-[10px] ml-1"
                title="清除所有小行星"
              >✕</button>
            </div>
          </div>
        </div>
      )}

      {/* 小行星创建器 */}
      <AnimatePresence>
        {showAsteroidCreator && (
          <AsteroidCreator
            onAdd={handleAddAsteroid}
            onClose={() => setShowAsteroidCreator(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default SolarSystemExplorer;
