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

const SPEED_PRESETS: { label: string; value: number; mobile: boolean }[] = [
  { label: '0.1x', value: 0.1, mobile: false },
  { label: '0.5x', value: 0.5, mobile: true },
  { label: '1x', value: 1, mobile: true },
  { label: '2x', value: 2, mobile: false },
  { label: '5x', value: 5, mobile: false },
  { label: '10x', value: 10, mobile: true },
  { label: '50x', value: 50, mobile: false },
  { label: '100x', value: 100, mobile: true },
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
      className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 max-w-[calc(100vw-1.5rem)] bg-black/80 backdrop-blur-sm rounded-xl border border-gray-700 px-2.5 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-4"
    >
      {/* 暂停/播放按钮 */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onPauseToggle}
        aria-label={isPaused ? '继续' : '暂停'}
        className={`w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-colors ${
          isPaused
            ? 'bg-green-600 hover:bg-green-500'
            : 'bg-yellow-600 hover:bg-yellow-500'
        }`}
      >
        {isPaused ? (
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        )}
      </motion.button>

      {/* 速度预设（移动端仅显示 4 个常用预设） */}
      <div className="flex items-center gap-1 min-w-0">
        {SPEED_PRESETS.map(preset => (
          <motion.button
            key={preset.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTimeSpeedChange(preset.value)}
            className={`px-1.5 sm:px-2 py-1 rounded text-[11px] sm:text-xs transition-colors ${
              preset.mobile ? 'inline-block' : 'hidden sm:inline-block'
            } ${
              Math.abs(timeSpeed - preset.value) < 0.01
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {preset.label}
          </motion.button>
        ))}
      </div>

      {/* 当前速度显示（移动端紧凑） */}
      <div className="text-center min-w-[44px] sm:min-w-[80px] flex-shrink-0">
        <div className="text-gray-400 text-[10px] sm:text-xs hidden sm:block">时间流速</div>
        <div className="text-white font-mono text-xs sm:text-base">{timeSpeed}x</div>
      </div>

      {/* 状态指示（移动端只保留圆点） */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          className={`w-2 h-2 rounded-full ${
            isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'
          }`}
        />
        <span className="text-gray-400 text-sm hidden sm:inline">
          {isPaused ? '已暂停' : '运行中'}
        </span>
      </div>
    </motion.div>
  );
}
