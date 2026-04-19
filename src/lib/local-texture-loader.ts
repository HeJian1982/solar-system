/**
 * 版权所有 © 2025 何健 保留所有权利
 * 
 * 功能：本地纹理加载器
 * 解决CORS问题，使用本地存储的行星纹理
 */

import * as THREE from 'three';

// 本地纹理路径配置 - 只包含实际存在的纹理文件
const LOCAL_TEXTURE_URLS: Record<string, { map: string; normalMap?: string; specularMap?: string }> = {
  // 太阳
  sun: {
    map: '/textures/planets/2k_sun.jpg',
  },
  // 行星（只有主纹理，移除不存在的normalMap/specularMap避免404）
  mercury: {
    map: '/textures/planets/2k_mercury.jpg',
  },
  venus: {
    map: '/textures/planets/2k_venus_surface.jpg',
  },
  earth: {
    map: '/textures/planets/2k_earth_daymap.jpg',
  },
  mars: {
    map: '/textures/planets/2k_mars.jpg',
  },
  jupiter: {
    map: '/textures/planets/2k_jupiter.jpg',
  },
  saturn: {
    map: '/textures/planets/2k_saturn.jpg',
  },
  uranus: {
    map: '/textures/planets/2k_uranus.jpg',
  },
  neptune: {
    map: '/textures/planets/2k_neptune.jpg',
  },
  // 卫星（只有月球有本地纹理，其他使用程序化纹理）
  moon: {
    map: '/textures/planets/2k_moon.jpg',
  },
};

// 纹理缓存
const textureCache = new Map<string, THREE.Texture>();
const loadingPromises = new Map<string, Promise<THREE.Texture>>();

// 纹理加载器
const textureLoader = new THREE.TextureLoader();

/**
 * 创建程序化fallback纹理
 */
function createProceduralTexture(planetId: string): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // 基础颜色配置（包含所有天体的程序化纹理颜色）
  const planetColors: Record<string, string> = {
    // 恒星
    sun: '#FDB813',
    // 行星
    mercury: '#8C7853',
    venus: '#FFC649',
    earth: '#4A90E2',
    mars: '#CD5C5C',
    jupiter: '#DAA520',
    saturn: '#F4E99B',
    uranus: '#4FD0E0',
    neptune: '#4B70DD',
    // 地球卫星
    moon: '#C0C0C0',
    // 火星卫星
    phobos: '#8B7355',
    deimos: '#A0826D',
    // 木星卫星
    io: '#FFFF99',
    europa: '#F0E68C',
    ganymede: '#8B7D6B',
    callisto: '#5C4033',
    // 土星卫星
    titan: '#E8B64A',
    enceladus: '#F5F5F5',
    mimas: '#C8C8C8',
    tethys: '#D0D0D0',
    dione: '#D8D8D8',
    rhea: '#BEBEBE',
    iapetus: '#8B8378',
    // 天王星卫星
    miranda: '#A0A0A0',
    ariel: '#B8B8B8',
    umbriel: '#707070',
    titania: '#909090',
    oberon: '#787878',
    // 海王星卫星
    triton: '#87CEEB',
  };

  const color = planetColors[planetId] || '#808080';
  
  // 基础填充
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 添加简单纹理变化
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = 5 + Math.random() * 15;
    const opacity = Math.random() * 0.3;
    
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    ctx.fillRect(x, y, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * 加载单个本地纹理
 */
async function loadLocalTexture(url: string, fallbackId: string): Promise<THREE.Texture> {
  // 检查缓存
  if (textureCache.has(url)) {
    return textureCache.get(url)!;
  }

  // 检查是否正在加载
  if (loadingPromises.has(url)) {
    return loadingPromises.get(url)!;
  }

  // 创建加载Promise
  const loadingPromise = new Promise<THREE.Texture>((resolve, reject) => {
    textureLoader.load(
      url,
      (texture) => {
        // 设置纹理属性
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        
        // 缓存纹理
        textureCache.set(url, texture);
        loadingPromises.delete(url);
        
        resolve(texture);
      },
      undefined,
      (error) => {
        console.warn(`Failed to load local texture ${url}, using procedural fallback`);
        loadingPromises.delete(url);
        
        // 使用程序化纹理作为fallback
        const fallbackTexture = createProceduralTexture(fallbackId);
        textureCache.set(url, fallbackTexture);
        resolve(fallbackTexture);
      }
    );
  });

  loadingPromises.set(url, loadingPromise);
  return loadingPromise;
}

/**
 * 获取本地行星纹理集合
 */
export async function getLocalPlanetTextures(planetId: string): Promise<{
  map?: THREE.Texture;
  normalMap?: THREE.Texture;
  specularMap?: THREE.Texture;
}> {
  const textureUrls = LOCAL_TEXTURE_URLS[planetId];
  if (!textureUrls) {
    // 没有本地纹理配置，静默使用程序化纹理（避免控制台警告刷屏）
    return { map: createProceduralTexture(planetId) };
  }

  const textures: {
    map?: THREE.Texture;
    normalMap?: THREE.Texture;
    specularMap?: THREE.Texture;
  } = {};

  // 并行加载所有纹理
  const loadPromises: Promise<void>[] = [];

  if (textureUrls.map) {
    loadPromises.push(
      loadLocalTexture(textureUrls.map, planetId).then(texture => {
        textures.map = texture;
      })
    );
  }

  if (textureUrls.normalMap) {
    loadPromises.push(
      loadLocalTexture(textureUrls.normalMap, planetId).then(texture => {
        textures.normalMap = texture;
      })
    );
  }

  if (textureUrls.specularMap) {
    loadPromises.push(
      loadLocalTexture(textureUrls.specularMap, planetId).then(texture => {
        textures.specularMap = texture;
      })
    );
  }

  await Promise.all(loadPromises);
  return textures;
}

/**
 * 预加载所有本地行星纹理
 */
export async function preloadAllLocalPlanetTextures(): Promise<void> {
  const planetIds = Object.keys(LOCAL_TEXTURE_URLS);
  
  try {
    await Promise.all(
      planetIds.map(planetId => getLocalPlanetTextures(planetId))
    );
  } catch {
    // 纹理预加载失败，静默处理
  }
}

/**
 * 清理纹理缓存
 */
export function clearLocalTextureCache(): void {
  // 释放所有纹理内存
  textureCache.forEach(texture => texture.dispose());
  textureCache.clear();
  loadingPromises.clear();
}

/**
 * 获取纹理缓存统计
 */
export function getLocalTextureCacheStats(): { loaded: number; loading: number } {
  return {
    loaded: textureCache.size,
    loading: loadingPromises.size,
  };
}

/**
 * 处理 WebGL 上下文丢失
 * 清空所有缓存，强制重新加载
 */
export function handleTextureContextLost(): void {
  console.warn('清理本地纹理缓存 (Context Lost)');
  // 不需要调用 dispose，因为上下文已经丢失了，显存已经被驱动释放
  textureCache.clear();
  loadingPromises.clear();
}
