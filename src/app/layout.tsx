/**
 * 版权所有 © 2025 何健 保留所有权利
 *
 * 根布局：注入全局样式 + 元数据
 */

import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '太阳系探索器 · 3D 天体模拟 | 何健 hj1982.cn',
  description:
    '互动 3D 太阳系模拟器，基于 NASA JPL 真实天文数据。探索八大行星、主要卫星轨道，自定义小行星，完成探索任务。Three.js + Next.js 14 实现。',
  keywords: [
    '太阳系',
    '3D模拟',
    '行星',
    '天文',
    '宇宙探索',
    '科普',
    'Three.js',
    'Next.js',
    'solar-system',
    'astronomy',
  ],
  authors: [{ name: '何健 (He Jian)', url: 'https://hj1982.cn' }],
  creator: '何健 (He Jian)',
  openGraph: {
    title: '太阳系探索器 · 3D 天体模拟',
    description: '基于 NASA 真实数据的交互式 3D 太阳系',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '太阳系探索器',
    description: '3D 太阳系模拟，探索宇宙奥秘',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
