/**
 * 版权所有 © 2025 何健 保留所有权利
 *
 * 功能：品牌角标组件
 * 位置：右下角固定角标，点击跳转到作者个人站
 *
 * 若 Fork 后用于自己的项目，请保留原作者署名或在 README 中注明出处。
 */

'use client';

import { motion } from 'framer-motion';

export function BrandLogo() {
  return (
    <motion.a
      href="https://hj1982.cn"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      className="fixed bottom-3 right-3 z-[100] group"
      title="何健 · hj1982.cn"
    >
      <div
        className="flex items-center gap-2 px-2 py-1 md:px-3 md:py-1.5 rounded-full
                   bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-pink-500/15
                   backdrop-blur-md border border-white/20
                   hover:border-white/40 hover:from-blue-500/25 hover:via-purple-500/25 hover:to-pink-500/25
                   transition-all duration-300 shadow-lg shadow-black/50"
      >
        {/* 圆形头像占位（渐变背景 + 文字） */}
        <div
          className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-bold text-white
                     bg-gradient-to-br from-blue-500 to-purple-600 shadow-inner"
          aria-hidden="true"
        >
          HJ
        </div>

        {/* 移动端隐藏文字，只显示头像 */}
        <div className="hidden md:flex flex-col leading-tight">
          <span className="text-white text-[11px] font-semibold">何健 · He Jian</span>
          <span className="text-white/60 text-[9px] group-hover:text-white/90 transition-colors">
            hj1982.cn ↗
          </span>
        </div>
      </div>
    </motion.a>
  );
}

export default BrandLogo;
