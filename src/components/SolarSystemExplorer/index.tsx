/**
 * 版权所有 © 2025 何健 保留所有权利
 * 
 * 功能：太阳系探索器主组件
 * 增强功能：任务系统、自定义小行星、教育内容
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SolarSystemVisualization3D } from '../SolarSystemVisualization3D';
import { MissionPanel } from './MissionPanel';
import { AsteroidCreator } from './AsteroidCreator';
import { PlanetInfoCard } from './PlanetInfoCard';
import { TimeController } from './TimeController';
import { 
  EXPLORATION_MISSIONS, 
  type ExplorationMission,
  type CustomAsteroid,
  generateRandomAsteroid,
  getRandomFunFact,
} from '@/lib/solar-system-explorer';
import { SOLAR_SYSTEM_DATA, type CelestialBody } from '@/data/solar-system-data';

export function SolarSystemExplorer() {
  // 状态管理
  const [missions, setMissions] = useState<ExplorationMission[]>(EXPLORATION_MISSIONS);
  const [activeMission, setActiveMission] = useState<ExplorationMission | null>(null);
  const [customAsteroids, setCustomAsteroids] = useState<CustomAsteroid[]>([]);
  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(null);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [showAsteroidCreator, setShowAsteroidCreator] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [funFact, setFunFact] = useState<string>('');
  const [visitedBodies, setVisitedBodies] = useState<Set<string>>(new Set());

  // 处理天体点击
  const handleBodyClick = useCallback((body: CelestialBody) => {
    setSelectedBody(body);
    
    // 记录访问
    setVisitedBodies(prev => new Set([...prev, body.id]));
    
    // 显示趣味知识
    const fact = getRandomFunFact(body.id);
    if (fact) setFunFact(fact);
    
    // 检查任务进度
    if (activeMission) {
      const updatedMissions = missions.map(mission => {
        if (mission.id !== activeMission.id) return mission;
        
        const updatedObjectives = mission.objectives.map(obj => {
          if (obj.target === body.id && !obj.completed) {
            return { ...obj, completed: true };
          }
          return obj;
        });
        
        const allCompleted = updatedObjectives.every(obj => obj.completed);
        
        if (allCompleted && !mission.completed) {
          setTotalScore(prev => prev + mission.reward);
        }
        
        return {
          ...mission,
          objectives: updatedObjectives,
          completed: allCompleted,
        };
      });
      
      setMissions(updatedMissions);
      setActiveMission(updatedMissions.find(m => m.id === activeMission.id) || null);
    }
  }, [activeMission, missions]);

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

  // 删除小行星
  const handleRemoveAsteroid = useCallback((id: string) => {
    setCustomAsteroids(prev => prev.filter(a => a.id !== id));
  }, []);

  // 选择任务
  const handleSelectMission = useCallback((mission: ExplorationMission) => {
    setActiveMission(mission);
    setShowMissions(false);
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
        case 'm':
        case 'M':
          setShowMissions(prev => !prev);
          break;
        case 'a':
        case 'A':
          setShowAsteroidCreator(prev => !prev);
          break;
        case 'Escape':
          setSelectedBody(null);
          setShowMissions(false);
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
          timeSpeed={isPaused ? 0 : timeSpeed}
          className="w-full h-full"
        />
      </div>

      {/* 顶部工具栏 */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        {/* 左侧：分数和任务 */}
        <div className="flex flex-col gap-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-yellow-500/30"
          >
            <div className="text-yellow-400 text-sm">探索积分</div>
            <div className="text-2xl font-bold text-white">{totalScore}</div>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setShowMissions(true)}
            className="bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-blue-500/30 hover:border-blue-500/60 transition-colors text-left"
          >
            <div className="text-blue-400 text-sm">当前任务</div>
            <div className="text-white text-sm truncate max-w-[200px]">
              {activeMission ? activeMission.name : '点击选择任务'}
            </div>
          </motion.button>
        </div>

        {/* 右侧：控制按钮 */}
        <div className="flex gap-2">
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleAddRandomAsteroid}
            className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-orange-500/30 hover:border-orange-500/60 transition-colors text-orange-400 text-sm"
          >
            🌑 添加小行星
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setShowAsteroidCreator(true)}
            className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-purple-500/30 hover:border-purple-500/60 transition-colors text-purple-400 text-sm"
          >
            ✨ 自定义轨道
          </motion.button>
        </div>
      </div>

      {/* 底部时间控制器 */}
      <TimeController
        timeSpeed={timeSpeed}
        isPaused={isPaused}
        onTimeSpeedChange={setTimeSpeed}
        onPauseToggle={() => setIsPaused(prev => !prev)}
      />

      {/* 趣味知识提示 */}
      <AnimatePresence>
        {funFact && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 max-w-md bg-black/90 backdrop-blur-sm rounded-lg px-4 py-3 border border-cyan-500/30"
          >
            <div className="text-cyan-400 text-xs mb-1">💡 你知道吗？</div>
            <div className="text-white text-sm">{funFact}</div>
            <button
              onClick={() => setFunFact('')}
              className="absolute top-2 right-2 text-gray-500 hover:text-white"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 自定义小行星列表 */}
      {customAsteroids.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-gray-700 max-h-[300px] overflow-y-auto"
        >
          <div className="text-gray-400 text-xs mb-2">自定义小行星 ({customAsteroids.length})</div>
          {customAsteroids.map(asteroid => (
            <div
              key={asteroid.id}
              className="flex items-center justify-between gap-2 py-1 text-sm"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: asteroid.color }}
              />
              <span className="text-white flex-1 truncate">{asteroid.name}</span>
              <button
                onClick={() => handleRemoveAsteroid(asteroid.id)}
                className="text-red-400 hover:text-red-300 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {/* 任务面板 */}
      <AnimatePresence>
        {showMissions && (
          <MissionPanel
            missions={missions}
            activeMission={activeMission}
            onSelectMission={handleSelectMission}
            onClose={() => setShowMissions(false)}
          />
        )}
      </AnimatePresence>

      {/* 小行星创建器 */}
      <AnimatePresence>
        {showAsteroidCreator && (
          <AsteroidCreator
            onAdd={handleAddAsteroid}
            onClose={() => setShowAsteroidCreator(false)}
          />
        )}
      </AnimatePresence>

      {/* 快捷键提示 */}
      <div className="absolute bottom-4 left-4 text-gray-500 text-xs space-y-1">
        <div>空格: 暂停/继续</div>
        <div>↑↓: 调整时间速度</div>
        <div>M: 任务面板</div>
        <div>A: 小行星创建器</div>
      </div>
    </div>
  );
}

export default SolarSystemExplorer;
