/**
 * 版权所有 © 2025 何健 保留所有权利
 * 
 * 功能：自定义小行星创建器组件
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { createCustomAsteroid, type CustomAsteroid } from '@/lib/solar-system-explorer';

interface AsteroidCreatorProps {
  onAdd: (asteroid: CustomAsteroid) => void;
  onClose: () => void;
}

export function AsteroidCreator({ onAdd, onClose }: AsteroidCreatorProps) {
  const [name, setName] = useState('我的小行星');
  const [semiMajorAxis, setSemiMajorAxis] = useState(2.5);
  const [eccentricity, setEccentricity] = useState(0.1);
  const [inclination, setInclination] = useState(5);

  // 计算轨道周期（开普勒第三定律）
  const orbitalPeriod = Math.pow(semiMajorAxis, 1.5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const asteroid = createCustomAsteroid({
      name,
      semiMajorAxis,
      eccentricity,
      inclination,
    });
    onAdd(asteroid);
  };

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
        className="bg-gray-900 rounded-2xl border border-purple-500/30 max-w-md w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>✨</span>
            创建自定义小行星
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 名称 */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">小行星名称</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
              placeholder="输入名称"
            />
          </div>

          {/* 半长轴 */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">
              轨道半长轴: {semiMajorAxis.toFixed(2)} AU
            </label>
            <input
              type="range"
              min="0.5"
              max="40"
              step="0.1"
              value={semiMajorAxis}
              onChange={e => setSemiMajorAxis(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>水星轨道内</span>
              <span>小行星带</span>
              <span>海王星轨道外</span>
            </div>
          </div>

          {/* 离心率 */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">
              轨道离心率: {eccentricity.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="0.9"
              step="0.01"
              value={eccentricity}
              onChange={e => setEccentricity(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>圆形轨道</span>
              <span>椭圆轨道</span>
              <span>高度椭圆</span>
            </div>
          </div>

          {/* 倾角 */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">
              轨道倾角: {inclination.toFixed(1)}°
            </label>
            <input
              type="range"
              min="0"
              max="90"
              step="1"
              value={inclination}
              onChange={e => setInclination(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>黄道面</span>
              <span>倾斜</span>
              <span>极轨道</span>
            </div>
          </div>

          {/* 计算结果 */}
          <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
            <div className="text-gray-400 text-sm">轨道参数预览</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">公转周期:</span>
                <span className="text-white ml-2">{orbitalPeriod.toFixed(2)} 年</span>
              </div>
              <div>
                <span className="text-gray-500">近日点:</span>
                <span className="text-white ml-2">
                  {(semiMajorAxis * (1 - eccentricity)).toFixed(2)} AU
                </span>
              </div>
              <div>
                <span className="text-gray-500">远日点:</span>
                <span className="text-white ml-2">
                  {(semiMajorAxis * (1 + eccentricity)).toFixed(2)} AU
                </span>
              </div>
              <div>
                <span className="text-gray-500">轨道类型:</span>
                <span className="text-white ml-2">
                  {semiMajorAxis < 1.5 ? '近地' : semiMajorAxis < 5 ? '小行星带' : '外太阳系'}
                </span>
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
            >
              创建小行星
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
