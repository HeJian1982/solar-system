/**
 * 版权所有 © 2025 何健 保留所有权利
 * 
 * 功能：太阳系探索器核心逻辑
 * 主要功能：
 *   - 自定义小行星轨道计算
 *   - 行星信息查询
 *   - 轨道预测
 *   - 时间控制
 */

import { CelestialBody, SOLAR_SYSTEM_DATA, calculateOrbitalPosition } from '@/data/solar-system-data';

// 自定义天体类型
export interface CustomAsteroid {
  id: string;
  name: string;
  semiMajorAxis: number;      // AU
  eccentricity: number;       // 0-1
  inclination: number;        // 度
  orbitalPeriod: number;      // 年
  color: string;
  radius: number;             // 相对地球
  initialAngle: number;       // 度
  createdAt: number;
}

// 探索任务类型
export interface ExplorationMission {
  id: string;
  name: string;
  description: string;
  targetBody: string;
  objectives: MissionObjective[];
  completed: boolean;
  reward: number;
}

export interface MissionObjective {
  id: string;
  description: string;
  type: 'visit' | 'observe' | 'measure' | 'compare';
  target?: string;
  completed: boolean;
}

// 预设探索任务
export const EXPLORATION_MISSIONS: ExplorationMission[] = [
  {
    id: 'mission-1',
    name: '初识太阳系',
    description: '访问太阳系的八大行星，了解它们的基本信息',
    targetBody: 'all-planets',
    objectives: [
      { id: 'obj-1-1', description: '访问水星', type: 'visit', target: 'mercury', completed: false },
      { id: 'obj-1-2', description: '访问金星', type: 'visit', target: 'venus', completed: false },
      { id: 'obj-1-3', description: '访问地球', type: 'visit', target: 'earth', completed: false },
      { id: 'obj-1-4', description: '访问火星', type: 'visit', target: 'mars', completed: false },
      { id: 'obj-1-5', description: '访问木星', type: 'visit', target: 'jupiter', completed: false },
      { id: 'obj-1-6', description: '访问土星', type: 'visit', target: 'saturn', completed: false },
      { id: 'obj-1-7', description: '访问天王星', type: 'visit', target: 'uranus', completed: false },
      { id: 'obj-1-8', description: '访问海王星', type: 'visit', target: 'neptune', completed: false },
    ],
    completed: false,
    reward: 100,
  },
  {
    id: 'mission-2',
    name: '伽利略卫星',
    description: '探索木星的四颗伽利略卫星',
    targetBody: 'jupiter-moons',
    objectives: [
      { id: 'obj-2-1', description: '观察木卫一（伊奥）的火山活动', type: 'observe', target: 'io', completed: false },
      { id: 'obj-2-2', description: '探索木卫二（欧罗巴）的冰层', type: 'visit', target: 'europa', completed: false },
      { id: 'obj-2-3', description: '测量木卫三（盖尼米德）的大小', type: 'measure', target: 'ganymede', completed: false },
      { id: 'obj-2-4', description: '观察木卫四（卡利斯托）的陨石坑', type: 'observe', target: 'callisto', completed: false },
    ],
    completed: false,
    reward: 150,
  },
  {
    id: 'mission-3',
    name: '土星环探秘',
    description: '近距离观察土星及其壮观的环系统',
    targetBody: 'saturn',
    objectives: [
      { id: 'obj-3-1', description: '观察土星环', type: 'observe', target: 'saturn', completed: false },
      { id: 'obj-3-2', description: '访问土卫六（泰坦）', type: 'visit', target: 'titan', completed: false },
      { id: 'obj-3-3', description: '探索土卫二（恩克拉多斯）的冰火山', type: 'observe', target: 'enceladus', completed: false },
    ],
    completed: false,
    reward: 200,
  },
  {
    id: 'mission-4',
    name: '类地行星对比',
    description: '比较四颗类地行星的特征',
    targetBody: 'terrestrial',
    objectives: [
      { id: 'obj-4-1', description: '比较水星和月球的表面', type: 'compare', target: 'mercury', completed: false },
      { id: 'obj-4-2', description: '了解金星的温室效应', type: 'observe', target: 'venus', completed: false },
      { id: 'obj-4-3', description: '观察火星的极冠', type: 'observe', target: 'mars', completed: false },
      { id: 'obj-4-4', description: '测量地球的自转周期', type: 'measure', target: 'earth', completed: false },
    ],
    completed: false,
    reward: 180,
  },
];

// 行星趣味知识
export const PLANET_FUN_FACTS: Record<string, string[]> = {
  sun: [
    '太阳每秒钟将400万吨物质转化为能量',
    '太阳的核心温度高达1500万摄氏度',
    '太阳光到达地球需要约8分20秒',
    '太阳占太阳系总质量的99.86%',
  ],
  mercury: [
    '水星是太阳系中最小的行星',
    '水星上一天等于地球上的176天',
    '水星表面温差可达600°C',
    '水星没有卫星',
  ],
  venus: [
    '金星是太阳系中最热的行星，比水星还热',
    '金星的一天比一年还长',
    '金星是逆向自转的',
    '金星的大气压是地球的92倍',
  ],
  earth: [
    '地球是太阳系中唯一已知存在生命的星球',
    '地球的71%被水覆盖',
    '地球的自转速度正在变慢',
    '地球的磁场保护我们免受太阳风侵害',
  ],
  mars: [
    '火星上有太阳系最高的山——奥林匹斯山',
    '火星的一天只比地球长37分钟',
    '火星曾经可能有液态水',
    '火星有两颗小卫星：火卫一和火卫二',
  ],
  jupiter: [
    '木星的大红斑是一个持续了至少400年的风暴',
    '木星有79颗已知卫星',
    '木星的质量是其他所有行星总和的2.5倍',
    '木星的自转是太阳系行星中最快的',
  ],
  saturn: [
    '土星的密度比水还小，理论上可以漂浮在水上',
    '土星环主要由冰和岩石组成',
    '土星有82颗已知卫星',
    '土星的风速可达每小时1800公里',
  ],
  uranus: [
    '天王星是"躺着"公转的，自转轴倾斜98度',
    '天王星的极昼和极夜各持续42年',
    '天王星是第一颗用望远镜发现的行星',
    '天王星有27颗已知卫星',
  ],
  neptune: [
    '海王星是通过数学计算预测发现的',
    '海王星的风速是太阳系最快的，可达每小时2100公里',
    '海王星的一年等于地球的165年',
    '海王星有14颗已知卫星',
  ],
};

// 计算自定义小行星位置
export function calculateAsteroidPosition(
  asteroid: CustomAsteroid,
  time: number
): { x: number; y: number; z: number } {
  const angularVelocity = (2 * Math.PI) / asteroid.orbitalPeriod;
  const initialAngleRad = (asteroid.initialAngle * Math.PI) / 180;
  const currentAngle = initialAngleRad + angularVelocity * time;
  
  // 考虑离心率的椭圆轨道
  const r = asteroid.semiMajorAxis * (1 - asteroid.eccentricity * asteroid.eccentricity) /
            (1 + asteroid.eccentricity * Math.cos(currentAngle));
  
  const x = r * Math.cos(currentAngle);
  const y = r * Math.sin(currentAngle);
  
  const inclinationRad = (asteroid.inclination * Math.PI) / 180;
  const z = r * Math.sin(inclinationRad) * Math.sin(currentAngle);
  
  return { x, y, z };
}

// 生成随机小行星
export function generateRandomAsteroid(): CustomAsteroid {
  const id = `asteroid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // 小行星带范围：2.2 - 3.2 AU
  const semiMajorAxis = 2.2 + Math.random() * 1.0;
  
  // 根据开普勒第三定律计算轨道周期
  const orbitalPeriod = Math.pow(semiMajorAxis, 1.5);
  
  return {
    id,
    name: `小行星 ${id.slice(-4).toUpperCase()}`,
    semiMajorAxis,
    eccentricity: Math.random() * 0.3,
    inclination: Math.random() * 20,
    orbitalPeriod,
    color: `hsl(${Math.random() * 60 + 20}, 50%, 50%)`,
    radius: 0.001 + Math.random() * 0.005,
    initialAngle: Math.random() * 360,
    createdAt: Date.now(),
  };
}

// 创建自定义小行星
export function createCustomAsteroid(params: {
  name: string;
  semiMajorAxis: number;
  eccentricity: number;
  inclination: number;
}): CustomAsteroid {
  const orbitalPeriod = Math.pow(params.semiMajorAxis, 1.5);
  
  return {
    id: `custom-${Date.now()}`,
    name: params.name,
    semiMajorAxis: params.semiMajorAxis,
    eccentricity: Math.min(0.9, Math.max(0, params.eccentricity)),
    inclination: params.inclination,
    orbitalPeriod,
    color: '#FFD700',
    radius: 0.003,
    initialAngle: Math.random() * 360,
    createdAt: Date.now(),
  };
}

// 计算两个天体之间的距离
export function calculateDistance(
  body1: CelestialBody | CustomAsteroid,
  body2: CelestialBody | CustomAsteroid,
  time: number
): number {
  let pos1: { x: number; y: number; z: number };
  let pos2: { x: number; y: number; z: number };
  
  if ('type' in body1) {
    pos1 = calculateOrbitalPosition(body1, time);
  } else {
    pos1 = calculateAsteroidPosition(body1, time);
  }
  
  if ('type' in body2) {
    pos2 = calculateOrbitalPosition(body2, time);
  } else {
    pos2 = calculateAsteroidPosition(body2, time);
  }
  
  return Math.sqrt(
    Math.pow(pos2.x - pos1.x, 2) +
    Math.pow(pos2.y - pos1.y, 2) +
    Math.pow(pos2.z - pos1.z, 2)
  );
}

// 获取随机趣味知识
export function getRandomFunFact(bodyId: string): string {
  const facts = PLANET_FUN_FACTS[bodyId];
  if (!facts || facts.length === 0) return '';
  return facts[Math.floor(Math.random() * facts.length)];
}

// 时间格式化
export function formatSimulationTime(years: number): string {
  if (years < 1) {
    const days = Math.floor(years * 365.25);
    return `${days} 天`;
  } else if (years < 100) {
    return `${years.toFixed(2)} 年`;
  } else {
    return `${years.toFixed(0)} 年`;
  }
}

// 距离格式化
export function formatDistance(au: number): string {
  if (au < 0.01) {
    const km = au * 149597870.7;
    return `${km.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} km`;
  } else {
    return `${au.toFixed(3)} AU`;
  }
}
