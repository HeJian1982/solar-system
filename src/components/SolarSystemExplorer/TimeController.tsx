/**
 * 版权所有 © 2025 何健 保留所有权利
 * 
 * 功能：时间控制器组件
 */

'use client';

import { motion } from 'framer-motion';
import { formatSimulationTime } from '@/lib/solar-system-explorer';

interface TimeControllerProps {
  timeSpeed: number;
  isPaused: boolean;
  onTimeSpeedChange: (speed: number) => void;
  onPauseToggle: () => void;
}

const SPEED_PRESETS = [
  { label: '0.1x', value: 0.1 },
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
  { label: '5x', value: 5 },
  { label: '10x', value: 10 },
  { label: '50x', value: 50 },
  { label: '100x', value: 100 },
];

export function TimeController({
  timeSpeed,
  isPaused,
  onTimeSpeedChange,
  onPauseToggle,
}: TimeControllerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-xl border border-gray-700 px-4 py-3 flex items-center gap-4"
    >
      {/* 暂停/播放按钮 */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onPauseToggle}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          isPaused
            ? 'bg-green-600 hover:bg-green-500'
            : 'bg-yellow-600 hover:bg-yellow-500'
        }`}
      >
        {isPaused ? (
          <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        )}
      </motion.button>

      {/* 速度预设 */}
      <div className="flex items-center gap-1">
        {SPEED_PRESETS.map(preset => (
          <motion.button
            key={preset.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTimeSpeedChange(preset.value)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              Math.abs(timeSpeed - preset.value) < 0.01
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {preset.label}
          </motion.button>
        ))}
      </div>

      {/* 当前速度显示 */}
      <div className="text-center min-w-[80px]">
        <div className="text-gray-400 text-xs">时间流速</div>
        <div className="text-white font-mono">{timeSpeed}x</div>
      </div>

      {/* 状态指示 */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'
          }`}
        />
        <span className="text-gray-400 text-sm">
          {isPaused ? '已暂停' : '运行中'}
        </span>
      </div>
    </motion.div>
  );
}
