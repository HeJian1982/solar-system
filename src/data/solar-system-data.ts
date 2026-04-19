/**
 * 版权所有 © 2025 何健 保留所有权利
 * 
 * 功能：太阳系准确天文数据
 * 数据来源：NASA JPL、IAU 标准天文数据
 * 
 * 单位说明：
 * - 距离：AU (天文单位，1 AU = 149,597,870.7 km = 地球到太阳的平均距离)
 * - 半径：地球半径 (1 R⊕ = 6,371 km)
 * - 质量：地球质量 (1 M⊕ = 5.972 × 10^24 kg)
 * - 周期：地球年 (1 year = 365.25 days)
 * - 自转周期：地球日 (1 day = 24 hours)
 */

export interface CelestialBody {
  id: string;
  name: string;
  nameChinese: string;
  type: 'star' | 'planet' | 'dwarf-planet' | 'moon';
  
  // 轨道参数
  semiMajorAxis: number;        // 半长轴 (AU)
  eccentricity: number;         // 轨道离心率
  orbitalPeriod: number;        // 公转周期 (地球年)
  inclination: number;          // 轨道倾角 (度)
  
  // 物理参数
  radius: number;               // 半径 (地球半径)
  mass: number;                 // 质量 (地球质量)
  rotationPeriod: number;       // 自转周期 (地球日)
  
  // 视觉参数
  color: string;                // 显示颜色
  texture?: string;             // 纹理（可选）
  rings?: boolean;              // 是否有光环
  
  // 初始位置（用于3D渲染）
  initialAngle?: number;        // 初始角度 (度)
  
  // 卫星系统
  parent?: string;              // 父天体ID（用于卫星）
  satellites?: CelestialBody[]; // 卫星列表
  
  // 详细信息（用于信息弹窗）
  description?: string;         // 简介
  atmosphere?: string;          // 大气成分
  temperature?: string;         // 温度范围
  gravity?: number;             // 表面重力 (地球=1)
  discovered?: string;          // 发现时间
}

/**
 * 太阳系天体数据
 * 数据基于 NASA JPL Horizons System 和 IAU 标准
 */
export const SOLAR_SYSTEM_DATA: CelestialBody[] = [
  // ==================== 太阳 ====================
  {
    id: 'sun',
    name: 'Sun',
    nameChinese: '太阳',
    type: 'star',
    semiMajorAxis: 0,
    eccentricity: 0,
    orbitalPeriod: 0,
    inclination: 0,
    radius: 109.0,              // 太阳半径 = 109 地球半径
    mass: 333000,               // 太阳质量 = 333,000 地球质量
    rotationPeriod: 25.4,       // 太阳赤道自转周期约25.4天
    color: '#FDB813',           // 金黄色
    initialAngle: 0,
    description: '太阳系的中心恒星，占太阳系总质量的99.86%',
    atmosphere: '73% H, 25% He, 2% 重元素',
    temperature: '5778K (表面), 1500万K (核心)',
    gravity: 28.0,
    discovered: '史前',
  },
  
  // ==================== 内行星（类地行星）====================
  {
    id: 'mercury',
    name: 'Mercury',
    nameChinese: '水星',
    type: 'planet',
    semiMajorAxis: 0.387,       // 0.387 AU
    eccentricity: 0.206,        // 较高的离心率
    orbitalPeriod: 0.241,       // 87.97 地球日
    inclination: 7.0,           // 7.0°
    radius: 0.383,              // 0.383 R⊕
    mass: 0.055,                // 0.055 M⊕
    rotationPeriod: 58.6,       // 58.6 地球日
    color: '#8C7853',           // 灰褐色
    initialAngle: 0,
    description: '距离太阳最近的行星，昼夜温差极大，无大气保护',
    atmosphere: '几乎真空（痕量Na、K）',
    temperature: '-173°C ~ 427°C',
    gravity: 0.38,
    discovered: '史前',
  },
  
  {
    id: 'venus',
    name: 'Venus',
    nameChinese: '金星',
    type: 'planet',
    semiMajorAxis: 0.723,       // 0.723 AU
    eccentricity: 0.007,        // 最接近圆形的轨道
    orbitalPeriod: 0.615,       // 224.7 地球日
    inclination: 3.4,           // 3.4°
    radius: 0.949,              // 0.949 R⊕
    mass: 0.815,                // 0.815 M⊕
    rotationPeriod: -243,       // -243 地球日（逆向自转）
    color: '#FFC649',           // 金黄色
    initialAngle: 45,
    description: '地球的姊妹星，拥有极端的温室效应和硫酸雨',
    atmosphere: '96.5% CO₂, 3.5% N₂',
    temperature: '462°C (太阳系最热)',
    gravity: 0.90,
    discovered: '史前',
  },
  
  {
    id: 'earth',
    name: 'Earth',
    nameChinese: '地球',
    type: 'planet',
    semiMajorAxis: 1.000,       // 1.000 AU（定义值）
    eccentricity: 0.017,        // 0.017
    orbitalPeriod: 1.000,       // 1.000 年（定义值）
    inclination: 0.0,           // 0° (参考面)
    radius: 1.000,              // 1.000 R⊕（定义值）
    mass: 1.000,                // 1.000 M⊕（定义值）
    rotationPeriod: 1.000,      // 1.000 天（定义值）
    color: '#4A90E2',           // 蓝色
    initialAngle: 90,
    description: '我们的家园，太阳系中唯一已知存在生命的星球',
    atmosphere: '78% N₂, 21% O₂, 1% Ar',
    temperature: '-89°C ~ 58°C',
    gravity: 1.0,
    discovered: '史前',
    satellites: [
      {
        id: 'moon',
        name: 'Moon',
        nameChinese: '月球',
        type: 'moon',
        parent: 'earth',
        semiMajorAxis: 0.00257,    // 384,400 km ≈ 0.00257 AU
        eccentricity: 0.0549,
        orbitalPeriod: 0.0748,     // 27.3 天
        inclination: 5.14,
        radius: 0.273,             // 0.273 R⊕
        mass: 0.0123,              // 0.0123 M⊕
        rotationPeriod: 27.3,      // 潮汐锁定
        color: '#C0C0C0',          // 银灰色
        initialAngle: 0,
        description: '地球唯一的天然卫星，影响潮汐和稳定地球自转轴',
        atmosphere: '几乎真空',
        temperature: '-173°C ~ 127°C',
        gravity: 0.166,
        discovered: '史前',
      },
    ],
  },
  
  {
    id: 'mars',
    name: 'Mars',
    nameChinese: '火星',
    type: 'planet',
    semiMajorAxis: 1.524,       // 1.524 AU
    eccentricity: 0.093,        // 0.093
    orbitalPeriod: 1.881,       // 686.98 地球日
    inclination: 1.8,           // 1.8°
    radius: 0.532,              // 0.532 R⊕
    mass: 0.107,                // 0.107 M⊕
    rotationPeriod: 1.026,      // 24.6 小时
    color: '#E27B58',           // 红褐色
    initialAngle: 135,
    description: '红色星球，曾经可能有液态水，是人类探索的重点',
    atmosphere: '95% CO₂, 3% N₂, 2% Ar',
    temperature: '-140°C ~ 20°C',
    gravity: 0.38,
    discovered: '史前',
    satellites: [
      {
        id: 'phobos',
        name: 'Phobos',
        nameChinese: '火卫一',
        type: 'moon',
        parent: 'mars',
        semiMajorAxis: 0.00006,    // 9,376 km
        eccentricity: 0.0151,
        orbitalPeriod: 0.00087,    // 0.32 天
        inclination: 1.093,
        radius: 0.0017,            // 11.1 km
        mass: 0.0000000018,
        rotationPeriod: 0.32,      // 潮汐锁定
        color: '#B8A494',          // 褐色
        initialAngle: 0,
        description: '距离母星最近的卫星之一，最终会撞向火星',
        atmosphere: '无',
        temperature: '-40°C',
        gravity: 0.00058,
        discovered: '1877年（阿萨夫·霍尔）',
      },
      {
        id: 'deimos',
        name: 'Deimos',
        nameChinese: '火卫二',
        type: 'moon',
        parent: 'mars',
        semiMajorAxis: 0.00016,    // 23,463 km
        eccentricity: 0.0002,
        orbitalPeriod: 0.00346,    // 1.26 天
        inclination: 0.93,
        radius: 0.00097,           // 6.2 km
        mass: 0.0000000002,
        rotationPeriod: 1.26,      // 潮汐锁定
        color: '#C5B7A8',          // 浅褐色
        initialAngle: 180,
        description: '表面非常平滑，覆盖着很厚的风化层',
        atmosphere: '无',
        temperature: '-40°C',
        gravity: 0.0003,
        discovered: '1877年（阿萨夫·霍尔）',
      },
    ],
  },
  
  // ==================== 外行星（气态巨行星）====================
  {
    id: 'jupiter',
    name: 'Jupiter',
    nameChinese: '木星',
    type: 'planet',
    semiMajorAxis: 5.203,       // 5.203 AU
    eccentricity: 0.048,        // 0.048
    orbitalPeriod: 11.862,      // 11.862 地球年
    inclination: 1.3,           // 1.3°
    radius: 11.209,             // 11.209 R⊕
    mass: 317.8,                // 317.8 M⊕
    rotationPeriod: 0.414,      // 9.9 小时（最快）
    color: '#C88B3A',           // 橙褐色
    initialAngle: 180,
    description: '太阳系最大的行星，质量是其他所有行星总和的2.5倍',
    atmosphere: '90% H₂, 10% He, 微量CH₄',
    temperature: '-148°C (云顶)',
    gravity: 2.53,
    discovered: '史前',
    satellites: [
      {
        id: 'io',
        name: 'Io',
        nameChinese: '木卫一 (伊奥)',
        type: 'moon',
        parent: 'jupiter',
        semiMajorAxis: 0.00282,    // 421,700 km
        eccentricity: 0.0041,
        orbitalPeriod: 0.00485,    // 1.77 天
        inclination: 0.05,
        radius: 0.286,             // 1,821 km
        mass: 0.015,
        rotationPeriod: 1.77,      // 潮汐锁定
        color: '#FDB462',          // 硫磺黄
        initialAngle: 0,
        description: '太阳系火山最活跃的天体，表面覆盖硫磺',
        atmosphere: '极稀薄 SO₂',
        temperature: '-143°C',
        gravity: 0.183,
        discovered: '1610年（伽利略）',
      },
      {
        id: 'europa',
        name: 'Europa',
        nameChinese: '木卫二 (欧罗巴)',
        type: 'moon',
        parent: 'jupiter',
        semiMajorAxis: 0.00449,    // 671,100 km
        eccentricity: 0.0094,
        orbitalPeriod: 0.00972,    // 3.55 天
        inclination: 0.47,
        radius: 0.245,             // 1,560 km
        mass: 0.008,
        rotationPeriod: 3.55,      // 潮汐锁定
        color: '#D4E6F1',          // 冰蓝色
        initialAngle: 90,
        description: '冰层下可能存在液态水海洋，是寻找地外生命的重要目标',
        atmosphere: '极稀薄 O₂',
        temperature: '-160°C',
        gravity: 0.134,
        discovered: '1610年（伽利略）',
      },
      {
        id: 'ganymede',
        name: 'Ganymede',
        nameChinese: '木卫三 (盖尼米德)',
        type: 'moon',
        parent: 'jupiter',
        semiMajorAxis: 0.00716,    // 1,070,400 km
        eccentricity: 0.0013,
        orbitalPeriod: 0.0196,     // 7.15 天
        inclination: 0.2,
        radius: 0.413,             // 2,634 km (最大卫星)
        mass: 0.025,
        rotationPeriod: 7.15,      // 潮汐锁定
        color: '#B8B8B8',          // 灰白色
        initialAngle: 180,
        description: '太阳系最大的卫星，比水星还大，拥有自己的磁场',
        atmosphere: '极稀薄 O₂',
        temperature: '-163°C',
        gravity: 0.146,
        discovered: '1610年（伽利略）',
      },
      {
        id: 'callisto',
        name: 'Callisto',
        nameChinese: '木卫四 (卡利斯托)',
        type: 'moon',
        parent: 'jupiter',
        semiMajorAxis: 0.0126,     // 1,882,700 km
        eccentricity: 0.0074,
        orbitalPeriod: 0.0457,     // 16.69 天
        inclination: 0.2,
        radius: 0.378,             // 2,410 km
        mass: 0.018,
        rotationPeriod: 16.69,     // 潮汐锁定
        color: '#8B7355',          // 褐色
        initialAngle: 270,
        description: '太阳系陨石坑最多的天体，表面极度古老',
        atmosphere: '极稀薄 CO₂',
        temperature: '-155°C',
        gravity: 0.126,
        discovered: '1610年（伽利略）',
      },
    ],
  },
  
  {
    id: 'saturn',
    name: 'Saturn',
    nameChinese: '土星',
    type: 'planet',
    semiMajorAxis: 9.537,       // 9.537 AU
    eccentricity: 0.054,        // 0.054
    orbitalPeriod: 29.457,      // 29.457 地球年
    inclination: 2.5,           // 2.5°
    radius: 9.449,              // 9.449 R⊕
    mass: 95.2,                 // 95.2 M⊕
    rotationPeriod: 0.444,      // 10.7 小时
    color: '#FAD5A5',           // 淡金色
    rings: true,                // 著名的光环
    initialAngle: 225,
    description: '拥有太阳系最壮观的光环系统，密度比水还小',
    atmosphere: '96% H₂, 3% He, 1% CH₄',
    temperature: '-178°C',
    gravity: 1.07,
    discovered: '史前',
    satellites: [
      {
        id: 'titan',
        name: 'Titan',
        nameChinese: '土卫六 (泰坦)',
        type: 'moon',
        parent: 'saturn',
        semiMajorAxis: 0.00817,    // 1,221,870 km
        eccentricity: 0.0288,
        orbitalPeriod: 0.0437,     // 15.95 天
        inclination: 0.3485,
        radius: 0.404,             // 2,575 km
        mass: 0.0225,
        rotationPeriod: 15.95,     // 潮汐锁定
        color: '#E5C17B',          // 金黄色
        initialAngle: 0,
        description: '太阳系唯一拥有浓厚大气层的卫星，表面有液态甲烷湖泊',
        atmosphere: '98.4% N₂, 1.4% CH₄',
        temperature: '-179°C',
        gravity: 0.138,
        discovered: '1655年（惠更斯）',
      },
      {
        id: 'rhea',
        name: 'Rhea',
        nameChinese: '土卫五 (瑞亚)',
        type: 'moon',
        parent: 'saturn',
        semiMajorAxis: 0.00352,    // 527,108 km
        eccentricity: 0.001,
        orbitalPeriod: 0.0124,     // 4.52 天
        inclination: 0.345,
        radius: 0.119,             // 763 km
        mass: 0.0004,
        rotationPeriod: 4.52,      // 潮汐锁定
        color: '#B0B0B0',          // 灰色
        initialAngle: 120,
        description: '土星第二大卫星，富含冰，可能有稀薄氧气',
        atmosphere: '极稀薄 O₂',
        temperature: '-174°C',
        gravity: 0.027,
        discovered: '1672年（卡西尼）',
      },
      {
        id: 'iapetus',
        name: 'Iapetus',
        nameChinese: '土卫八 (伊阿珀托斯)',
        type: 'moon',
        parent: 'saturn',
        semiMajorAxis: 0.0238,     // 3,560,820 km
        eccentricity: 0.0286,
        orbitalPeriod: 0.217,      // 79.32 天
        inclination: 15.47,        // 轨道倾角很大
        radius: 0.115,             // 734 km
        mass: 0.0003,
        rotationPeriod: 79.32,     // 潮汐锁定
        color: '#5C5C5C',          // 阴阳脸（一面黑一面白）
        initialAngle: 240,
        description: '著名的"阴阳脸"卫星，拥有巨大的赤道山脊',
        atmosphere: '无',
        temperature: '-143°C',
        gravity: 0.023,
        discovered: '1671年（卡西尼）',
      },
      {
        id: 'dione',
        name: 'Dione',
        nameChinese: '土卫四 (狄奥涅)',
        type: 'moon',
        parent: 'saturn',
        semiMajorAxis: 0.00252,    // 377,400 km
        eccentricity: 0.0022,
        orbitalPeriod: 0.0075,     // 2.74 天
        inclination: 0.019,
        radius: 0.088,             // 561 km
        mass: 0.00018,
        rotationPeriod: 2.74,      // 潮汐锁定
        color: '#D9D9D9',          // 浅灰色
        initialAngle: 60,
        description: '表面主要是冰层，有明显的撞击坑和裂谷',
        atmosphere: '极稀薄 O₂',
        temperature: '-186°C',
        gravity: 0.023,
        discovered: '1684年（卡西尼）',
      },
      {
        id: 'tethys',
        name: 'Tethys',
        nameChinese: '土卫三 (特提斯)',
        type: 'moon',
        parent: 'saturn',
        semiMajorAxis: 0.00197,    // 294,619 km
        eccentricity: 0.0001,
        orbitalPeriod: 0.00517,    // 1.89 天
        inclination: 1.12,
        radius: 0.083,             // 531 km
        mass: 0.0001,
        rotationPeriod: 1.89,      // 潮汐锁定
        color: '#E0E0E0',          // 亮灰色
        initialAngle: 300,
        description: '主要由水冰组成，有一个巨大的撞击坑"奥德修斯"',
        atmosphere: '无',
        temperature: '-187°C',
        gravity: 0.015,
        discovered: '1684年（卡西尼）',
      },
      {
        id: 'enceladus',
        name: 'Enceladus',
        nameChinese: '土卫二 (恩克拉多斯)',
        type: 'moon',
        parent: 'saturn',
        semiMajorAxis: 0.00159,    // 237,948 km
        eccentricity: 0.0047,
        orbitalPeriod: 0.00375,    // 1.37 天
        inclination: 0.019,
        radius: 0.039,             // 252 km
        mass: 0.000018,
        rotationPeriod: 1.37,      // 潮汐锁定
        color: '#FFFFFF',          // 纯白色（太阳系反照率最高）
        initialAngle: 180,
        description: '太阳系反照率最高的天体，南极有活跃的冰火山喷发',
        atmosphere: '91% H₂O, 4% N₂, 3.2% CO₂',
        temperature: '-198°C',
        gravity: 0.011,
        discovered: '1789年（赫歇尔）',
      },
      {
        id: 'mimas',
        name: 'Mimas',
        nameChinese: '土卫一 (米玛斯)',
        type: 'moon',
        parent: 'saturn',
        semiMajorAxis: 0.00124,    // 185,539 km
        eccentricity: 0.0202,
        orbitalPeriod: 0.00259,    // 0.94 天
        inclination: 1.566,
        radius: 0.031,             // 198 km
        mass: 0.000006,
        rotationPeriod: 0.94,      // 潮汐锁定
        color: '#A0A0A0',          // 灰色
        initialAngle: 90,
        description: '外形酷似《星球大战》中的死星，有一个巨大的撞击坑',
        atmosphere: '无',
        temperature: '-209°C',
        gravity: 0.006,
        discovered: '1789年（赫歇尔）',
      },
    ],
  },
  
  // ==================== 冰巨星 ====================
  {
    id: 'uranus',
    name: 'Uranus',
    nameChinese: '天王星',
    type: 'planet',
    semiMajorAxis: 19.191,      // 19.191 AU
    eccentricity: 0.047,        // 0.047
    orbitalPeriod: 84.011,      // 84.011 地球年
    inclination: 0.8,           // 0.8°
    radius: 4.007,              // 4.007 R⊕
    mass: 14.5,                 // 14.5 M⊕
    rotationPeriod: -0.718,     // -17.2 小时（逆向自转，横躺）
    color: '#4FD0E7',           // 淡蓝色
    rings: true,                // 有光环
    initialAngle: 270,
    description: '自转轴倾斜98°，几乎横躺着公转，极昼极夜各持续42年',
    atmosphere: '83% H₂, 15% He, 2% CH₄',
    temperature: '-216°C',
    gravity: 0.89,
    discovered: '1781年（赫歇尔）',
    satellites: [
      {
        id: 'titania',
        name: 'Titania',
        nameChinese: '天卫三 (泰坦尼亚)',
        type: 'moon',
        parent: 'uranus',
        semiMajorAxis: 0.0029,     // 435,900 km
        eccentricity: 0.0011,
        orbitalPeriod: 0.0238,     // 8.7 天
        inclination: 0.34,
        radius: 0.123,             // 788 km
        mass: 0.00059,
        rotationPeriod: 8.7,       // 潮汐锁定
        color: '#E0DCD5',          // 灰白色
        initialAngle: 0,
        description: '天王星最大的卫星，表面布满巨大的峡谷和断层',
        atmosphere: '极稀薄 CO₂',
        temperature: '-203°C',
        gravity: 0.039,
        discovered: '1787年（赫歇尔）',
      },
      {
        id: 'oberon',
        name: 'Oberon',
        nameChinese: '天卫四 (奥伯龙)',
        type: 'moon',
        parent: 'uranus',
        semiMajorAxis: 0.0039,     // 583,500 km
        eccentricity: 0.0014,
        orbitalPeriod: 0.0368,     // 13.46 天
        inclination: 0.058,
        radius: 0.119,             // 761 km
        mass: 0.0005,
        rotationPeriod: 13.46,     // 潮汐锁定
        color: '#A89B9B',          // 暗红色
        initialAngle: 180,
        description: '天王星第二大卫星，表面布满古老的陨石坑',
        atmosphere: '无',
        temperature: '-203°C',
        gravity: 0.035,
        discovered: '1787年（赫歇尔）',
      },
      {
        id: 'umbriel',
        name: 'Umbriel',
        nameChinese: '天卫二 (乌姆柏里厄尔)',
        type: 'moon',
        parent: 'uranus',
        semiMajorAxis: 0.00178,    // 266,000 km
        eccentricity: 0.0039,
        orbitalPeriod: 0.0113,     // 4.14 天
        inclination: 0.128,
        radius: 0.092,             // 584 km
        mass: 0.0002,
        rotationPeriod: 4.14,      // 潮汐锁定
        color: '#333333',          // 暗灰色（最暗的卫星）
        initialAngle: 90,
        description: '天王星最暗的卫星，表面古老且充满陨石坑，仅有一个明亮的光环状结构',
        atmosphere: '无',
        temperature: '-203°C',
        gravity: 0.023,
        discovered: '1851年（拉塞尔）',
      },
      {
        id: 'ariel',
        name: 'Ariel',
        nameChinese: '天卫一 (艾瑞尔)',
        type: 'moon',
        parent: 'uranus',
        semiMajorAxis: 0.00128,    // 191,020 km
        eccentricity: 0.0012,
        orbitalPeriod: 0.0069,     // 2.52 天
        inclination: 0.041,
        radius: 0.091,             // 578 km
        mass: 0.00022,
        rotationPeriod: 2.52,      // 潮汐锁定
        color: '#E6E6E6',          // 亮灰色（最亮的卫星）
        initialAngle: 45,
        description: '天王星最明亮的卫星，表面有巨大的裂谷系统',
        atmosphere: '无',
        temperature: '-203°C',
        gravity: 0.027,
        discovered: '1851年（拉塞尔）',
      },
      {
        id: 'miranda',
        name: 'Miranda',
        nameChinese: '天卫五 (米兰达)',
        type: 'moon',
        parent: 'uranus',
        semiMajorAxis: 0.00087,    // 129,390 km
        eccentricity: 0.0013,
        orbitalPeriod: 0.0038,     // 1.41 天
        inclination: 4.232,
        radius: 0.037,             // 235 km
        mass: 0.00001,
        rotationPeriod: 1.41,      // 潮汐锁定
        color: '#D8D8D8',          // 浅灰色
        initialAngle: 300,
        description: '拥有太阳系最复杂地形的卫星之一，包括高达20公里的悬崖',
        atmosphere: '无',
        temperature: '-187°C',
        gravity: 0.008,
        discovered: '1948年（柯伊伯）',
      },
    ],
  },
  
  {
    id: 'neptune',
    name: 'Neptune',
    nameChinese: '海王星',
    type: 'planet',
    semiMajorAxis: 30.069,      // 30.069 AU
    eccentricity: 0.009,        // 0.009
    orbitalPeriod: 164.79,      // 164.79 地球年
    inclination: 1.8,           // 1.8°
    radius: 3.883,              // 3.883 R⊕
    mass: 17.1,                 // 17.1 M⊕
    rotationPeriod: 0.671,      // 16.1 小时
    color: '#4166F5',           // 深蓝色
    initialAngle: 315,
    description: '太阳系风速最快的行星，拥有大暗斑气旋系统',
    atmosphere: '80% H₂, 19% He, 1% CH₄',
    temperature: '-214°C',
    gravity: 1.14,
    discovered: '1846年（勒威耶/伽勒）',
    satellites: [
      {
        id: 'triton',
        name: 'Triton',
        nameChinese: '海卫一 (特里同)',
        type: 'moon',
        parent: 'neptune',
        semiMajorAxis: 0.00237,    // 354,759 km
        eccentricity: 0.000016,
        orbitalPeriod: -0.016,     // -5.87 天 (逆行轨道)
        inclination: 156.8,        // 逆行轨道
        radius: 0.212,             // 1,353 km
        mass: 0.00359,
        rotationPeriod: 5.87,      // 潮汐锁定
        color: '#C2B2A8',          // 粉灰色
        initialAngle: 0,
        description: '太阳系最大的逆行卫星，有活跃的氮冰火山喷发',
        atmosphere: '稀薄 N₂',
        temperature: '-235°C (太阳系最冷之一)',
        gravity: 0.079,
        discovered: '1846年（拉塞尔）',
      },
    ],
  },
];

/**
 * 物理常数
 */
export const SOLAR_SYSTEM_CONSTANTS = {
  // 引力常数 (AU³ / (M⊕ × year²))
  G: 39.478,
  
  // 1 AU (天文单位) = 149,597,870.7 km
  AU_TO_KM: 149597870.7,
  
  // 地球半径 = 6,371 km
  EARTH_RADIUS_KM: 6371,
  
  // 地球质量 = 5.972 × 10^24 kg
  EARTH_MASS_KG: 5.972e24,
  
  // 缩放因子（用于3D可视化）
  SCALE: {
    distance: 10,              // 距离缩放（让行星不至于太远）
    planetRadius: 50,          // 行星半径缩放（让行星可见）
    sunRadius: 3,              // 太阳半径特殊缩放（不然太大）
  },
};

/**
 * 获取指定行星的数据
 */
export function getPlanetData(planetId: string): CelestialBody | undefined {
  return SOLAR_SYSTEM_DATA.find(body => body.id === planetId);
}

/**
 * 获取所有行星（不包括太阳）
 */
export function getAllPlanets(): CelestialBody[] {
  return SOLAR_SYSTEM_DATA.filter(body => body.type === 'planet');
}

/**
 * 计算行星在轨道上的位置（简化的圆形轨道）
 * @param body 天体
 * @param time 时间（地球年）
 * @returns {x, y, z} 3D 坐标 (AU)
 */
export function calculateOrbitalPosition(
  body: CelestialBody,
  time: number
): { x: number; y: number; z: number } {
  if (body.type === 'star') {
    return { x: 0, y: 0, z: 0 };
  }
  
  // 计算当前角度（弧度）
  const angularVelocity = (2 * Math.PI) / body.orbitalPeriod;
  const initialAngleRad = ((body.initialAngle || 0) * Math.PI) / 180;
  const currentAngle = initialAngleRad + angularVelocity * time;
  
  // 简化为圆形轨道（忽略离心率）
  const distance = body.semiMajorAxis;
  
  // 计算位置
  const x = distance * Math.cos(currentAngle);
  const y = distance * Math.sin(currentAngle);
  
  // 添加轨道倾角的影响（简化）
  const inclinationRad = (body.inclination * Math.PI) / 180;
  const z = distance * Math.sin(inclinationRad) * Math.sin(currentAngle);
  
  return { x, y, z };
}
