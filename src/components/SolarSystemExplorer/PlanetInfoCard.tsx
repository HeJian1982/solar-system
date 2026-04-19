/**
 * 版权所有 © 2025 何健 保留所有权利
 * 
 * 功能：行星信息卡片组件
 */

'use client';

import { motion } from 'framer-motion';
import type { CelestialBody } from '@/data/solar-system-data';
import { formatDistance } from '@/lib/solar-system-explorer';

interface PlanetInfoCardProps {
  body: CelestialBody;
  onClose: () => void;
}

export function PlanetInfoCard({ body, onClose }: PlanetInfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="absolute left-4 top-1/2 -translate-y-1/2 w-80 bg-black/90 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden z-20"
    >
      {/* 头部 */}
      <div
        className="p-4 relative"
        style={{
          background: `linear-gradient(135deg, ${body.color}40, transparent)`,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full"
            style={{
              backgroundColor: body.color,
              boxShadow: `0 0 20px ${body.color}80`,
            }}
          />
          <div>
            <h3 className="text-xl font-bold text-white">{body.nameChinese}</h3>
            <p className="text-gray-400 text-sm">{body.name}</p>
          </div>
        </div>
      </div>

      {/* 描述 */}
      {body.description && (
        <div className="px-4 py-3 border-b border-gray-800">
          <p className="text-gray-300 text-sm leading-relaxed">{body.description}</p>
        </div>
      )}

      {/* 基本信息 */}
      <div className="p-4 space-y-3">
        <h4 className="text-gray-400 text-xs uppercase tracking-wider">基本参数</h4>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          {body.type !== 'star' && (
            <InfoItem
              label="轨道半径"
              value={formatDistance(body.semiMajorAxis)}
            />
          )}
          
          <InfoItem
            label="半径"
            value={body.radius < 1 
              ? `${(body.radius * 6371).toFixed(0)} km`
              : `${body.radius.toFixed(2)} R⊕`
            }
          />
          
          <InfoItem
            label="质量"
            value={body.mass < 1
              ? `${(body.mass * 100).toFixed(2)}% M⊕`
              : `${body.mass.toFixed(1)} M⊕`
            }
          />
          
          {body.type !== 'star' && (
            <InfoItem
              label="公转周期"
              value={body.orbitalPeriod < 1
                ? `${(body.orbitalPeriod * 365.25).toFixed(1)} 天`
                : `${body.orbitalPeriod.toFixed(2)} 年`
              }
            />
          )}
          
          <InfoItem
            label="自转周期"
            value={Math.abs(body.rotationPeriod) < 1
              ? `${(Math.abs(body.rotationPeriod) * 24).toFixed(1)} 小时`
              : `${Math.abs(body.rotationPeriod).toFixed(1)} 天`
            }
            note={body.rotationPeriod < 0 ? '(逆向)' : undefined}
          />
          
          {body.gravity && (
            <InfoItem
              label="表面重力"
              value={`${body.gravity.toFixed(2)} g`}
            />
          )}
        </div>
      </div>

      {/* 大气和温度 */}
      {(body.atmosphere || body.temperature) && (
        <div className="px-4 pb-4 space-y-2">
          {body.atmosphere && (
            <div>
              <span className="text-gray-500 text-xs">大气成分: </span>
              <span className="text-gray-300 text-xs">{body.atmosphere}</span>
            </div>
          )}
          {body.temperature && (
            <div>
              <span className="text-gray-500 text-xs">温度范围: </span>
              <span className="text-gray-300 text-xs">{body.temperature}</span>
            </div>
          )}
        </div>
      )}

      {/* 发现信息 */}
      {body.discovered && (
        <div className="px-4 pb-4">
          <span className="text-gray-500 text-xs">发现: </span>
          <span className="text-gray-400 text-xs">{body.discovered}</span>
        </div>
      )}

      {/* 卫星信息 */}
      {body.satellites && body.satellites.length > 0 && (
        <div className="px-4 pb-4 border-t border-gray-800 pt-3">
          <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-2">
            卫星 ({body.satellites.length})
          </h4>
          <div className="flex flex-wrap gap-1">
            {body.satellites.slice(0, 8).map(satellite => (
              <span
                key={satellite.id}
                className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300"
              >
                {satellite.nameChinese}
              </span>
            ))}
            {body.satellites.length > 8 && (
              <span className="px-2 py-0.5 text-xs text-gray-500">
                +{body.satellites.length - 8} 更多
              </span>
            )}
          </div>
        </div>
      )}

      {/* 特殊标记 */}
      <div className="px-4 pb-4 flex flex-wrap gap-2">
        {body.rings && (
          <span className="px-2 py-0.5 bg-yellow-900/30 border border-yellow-500/30 rounded text-xs text-yellow-400">
            💫 有光环
          </span>
        )}
        {body.type === 'star' && (
          <span className="px-2 py-0.5 bg-orange-900/30 border border-orange-500/30 rounded text-xs text-orange-400">
            ☀️ 恒星
          </span>
        )}
        {body.type === 'moon' && (
          <span className="px-2 py-0.5 bg-gray-700/50 border border-gray-500/30 rounded text-xs text-gray-400">
            🌙 卫星
          </span>
        )}
      </div>
    </motion.div>
  );
}

function InfoItem({ 
  label, 
  value, 
  note 
}: { 
  label: string; 
  value: string; 
  note?: string;
}) {
  return (
    <div>
      <div className="text-gray-500 text-xs">{label}</div>
      <div className="text-white">
        {value}
        {note && <span className="text-gray-500 text-xs ml-1">{note}</span>}
      </div>
    </div>
  );
}
