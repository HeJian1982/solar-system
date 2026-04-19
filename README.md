# 🌌 Solar System Explorer · 3D 太阳系探索器

> 一个基于真实 NASA JPL 天文数据的交互式 3D 太阳系可视化项目。  
> 支持八大行星运行、卫星系统、自定义小行星轨道、探索任务系统。

**Live Demo**: <https://hj1982.cn/solar-system>  
**Author**: 何健 (He Jian) · <https://hj1982.cn>  
**License**: MIT

---

## ✨ 功能亮点

- 🪐 **真实天文数据** — 基于 NASA JPL Horizons 系统 + IAU 标准，包含太阳、8 大行星、主要卫星。
- 🎨 **双纹理系统** — 优先加载真实纹理贴图 (`public/textures/planets/`)，失败自动回退到程序化 Canvas 纹理，永不空白。
- 🚀 **探索任务系统** — 4 个预设任务（初识太阳系、伽利略卫星、土星环探秘、类地行星对比），带积分奖励。
- ✨ **自定义小行星** — 基于开普勒第三定律，可自由设定半长轴/离心率/倾角，实时计算公转周期。
- 🎬 **相机飞行动画** — 点击星球自动飞行聚焦，缓动曲线 1.5 秒到位。
- ⚡ **性能优化** — 程序化纹理全局缓存、轨道线 memoization、WebGL 上下文丢失/恢复处理。
- 📱 **响应式** — 桌面完整控制面板，移动端可收起式 UI。
- ⌨️ **键盘快捷键** — `Space` 暂停/继续、`↑↓` 调速、`M` 任务面板、`A` 小行星创建器、`R` 切换自转、`Esc` 关闭。

## 🛠️ 技术栈

- **框架**: [Next.js 14](https://nextjs.org) (App Router)
- **3D 引擎**: [Three.js](https://threejs.org) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://github.com/pmndrs/drei)
- **UI**: React 18 + TypeScript 5 + [Tailwind CSS 3](https://tailwindcss.com) + [Framer Motion](https://www.framer.com/motion/)
- **Node**: `>=20` (LTS 22 已验证)

## 📦 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/HeJian1982/solar-system-explorer.git
cd solar-system-explorer
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
# 访问 http://localhost:3100
```

### 4. 生产构建

```bash
npm run build
npm start
```

## 🗂️ 目录结构

```
solar-system-standalone/
├── public/
│   └── textures/planets/          # 9 张 2K 行星真实纹理 (JPG)
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # 全局布局
│   │   ├── page.tsx               # 主页（直接渲染 SolarSystemExplorer）
│   │   └── globals.css            # Tailwind + 基础样式
│   ├── components/
│   │   ├── BrandLogo.tsx          # 右下角品牌角标
│   │   ├── SolarSystemVisualization3D.tsx   # 3D 核心渲染（1200+ 行）
│   │   └── SolarSystemExplorer/   # 上层交互模块
│   │       ├── index.tsx          # 容器组件
│   │       ├── MissionPanel.tsx   # 任务面板
│   │       ├── AsteroidCreator.tsx# 小行星创建器
│   │       ├── TimeController.tsx # 时间流速控制
│   │       └── PlanetInfoCard.tsx # 行星信息卡片
│   ├── data/
│   │   └── solar-system-data.ts   # NASA JPL 天文数据 (755 行)
│   └── lib/
│       ├── solar-system-explorer.ts   # 任务/小行星核心逻辑
│       └── local-texture-loader.ts    # 纹理加载 + 回退
├── LICENSE                        # MIT + 作者署名条款
└── package.json
```

## 🎮 操作说明

| 操作 | 效果 |
|------|------|
| 🖱️ 左键拖动 | 旋转视角 |
| 🎯 滚轮 | 缩放距离 |
| ↔️ 右键拖动 | 平移位置 |
| 点击行星（首次）| 相机飞行聚焦 |
| 点击行星（再次）| 打开详情卡片 |
| `Space` | 暂停/继续 |
| `↑` / `↓` | 加速/减速时间 |
| `M` | 打开任务面板 |
| `A` | 打开小行星创建器 |
| `R` | 切换行星自转 |
| `Esc` | 关闭所有弹窗 |

## 🌐 数据与资产来源

- **天文数据**: [NASA JPL Horizons System](https://ssd.jpl.nasa.gov/horizons/) + IAU 标准 — 公共领域
- **行星纹理**: [Solar System Scope](https://www.solarsystemscope.com/textures/) — CC Attribution 4.0
- **地球纹理**（可选）: [Natural Earth III](https://www.shadedrelief.com/natural3/) — 公共领域

> 默认仓库包含 9 张 2K 纹理（太阳/水星/金星/火星/木星/土星/天王星/海王星/月球）。  
> 地球暂未包含（走程序化纹理），可从 Solar System Scope 下载 `2k_earth_daymap.jpg` 放入 `public/textures/planets/`。

## 🧩 二次开发指引

### 添加新天体

在 `src/data/solar-system-data.ts` 的 `SOLAR_SYSTEM_DATA` 数组中追加：

```ts
{
  id: 'pluto',
  name: 'Pluto',
  nameChinese: '冥王星',
  type: 'dwarf-planet',
  semiMajorAxis: 39.48,
  eccentricity: 0.2488,
  orbitalPeriod: 248.0,
  // ... 其他字段见 CelestialBody 接口
}
```

### 添加新任务

在 `src/lib/solar-system-explorer.ts` 的 `EXPLORATION_MISSIONS` 数组中追加即可。

### 替换品牌 Logo

编辑 `src/components/BrandLogo.tsx`，改文字/链接/样式即可。

## 📜 License & 署名

本项目采用 **MIT License**，保留作者署名条款：

- 你可以自由使用、修改、分发、商用
- **请保留源码文件头的 `/** 版权所有 © 2025 何健 保留所有权利 */` 注释**
- **请保留 `BrandLogo.tsx` 中的作者链接**（或替换为你自己的署名，但请在 README 中注明基于本项目）

完整条款见 [LICENSE](./LICENSE)。

## 🙏 致谢

- NASA JPL — 提供权威天文数据
- Solar System Scope — 提供开源行星纹理
- Poimandres / @react-three — 优秀的 React Three.js 生态

---

**Made with ❤️ by 何健 · <https://hj1982.cn>**
