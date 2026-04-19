/**
 * 版权所有 © 2025 何健 保留所有权利
 * 
 * 功能：探索任务面板组件
 */

'use client';

import { motion } from 'framer-motion';
import type { ExplorationMission } from '@/lib/solar-system-explorer';

interface MissionPanelProps {
  missions: ExplorationMission[];
  activeMission: ExplorationMission | null;
  onSelectMission: (mission: ExplorationMission) => void;
  onClose: () => void;
}

export function MissionPanel({
  missions,
  activeMission,
  onSelectMission,
  onClose,
}: MissionPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🚀</span>
            探索任务
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 任务列表 */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {missions.map(mission => {
            const completedCount = mission.objectives.filter(o => o.completed).length;
            const totalCount = mission.objectives.length;
            const progress = (completedCount / totalCount) * 100;
            const isActive = activeMission?.id === mission.id;

            return (
              <motion.div
                key={mission.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl border transition-colors cursor-pointer ${
                  mission.completed
                    ? 'bg-green-900/20 border-green-500/30'
                    : isActive
                    ? 'bg-blue-900/20 border-blue-500/50'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => !mission.completed && onSelectMission(mission)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      {mission.completed && <span>✅</span>}
                      {mission.name}
                    </h3>
                    <p className="text-gray-400 text-sm">{mission.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold">+{mission.reward}</div>
                    <div className="text-gray-500 text-xs">积分</div>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>进度</span>
                    <span>{completedCount}/{totalCount}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`h-full rounded-full ${
                        mission.completed ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                    />
                  </div>
                </div>

                {/* 目标列表 */}
                <div className="space-y-1">
                  {mission.objectives.map(objective => (
                    <div
                      key={objective.id}
                      className={`flex items-center gap-2 text-sm ${
                        objective.completed ? 'text-green-400' : 'text-gray-400'
                      }`}
                    >
                      <span>{objective.completed ? '✓' : '○'}</span>
                      <span>{objective.description}</span>
                    </div>
                  ))}
                </div>

                {/* 状态标签 */}
                {isActive && !mission.completed && (
                  <div className="mt-3 text-xs text-blue-400 bg-blue-500/10 rounded px-2 py-1 inline-block">
                    当前任务
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
