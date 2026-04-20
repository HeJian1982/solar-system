# 太阳系行星纹理目录

## 📍 当前状态

所有基础纹理均已就绪，来源为 **Solar System Scope** (CC Attribution 4.0) 的 2K 分辨率 JPG：

| 天体 | 文件 |
| --- | --- |
| ☀️ 太阳 | `2k_sun.jpg` |
| ☿️ 水星 | `2k_mercury.jpg` |
| ♀️ 金星 | `2k_venus_surface.jpg` |
| 🌍 地球 | `2k_earth_daymap.jpg` |
| ♂️ 火星 | `2k_mars.jpg` |
| ♃ 木星 | `2k_jupiter.jpg` |
| ♄ 土星 | `2k_saturn.jpg` |
| ♅ 天王星 | `2k_uranus.jpg` |
| ♆ 海王星 | `2k_neptune.jpg` |
| 🌙 月球 | `2k_moon.jpg` |

## 🪐 补充或替换纹理

如需更高分辨率或替换某个纹理：

1. 访问 **Solar System Scope**: https://www.solarsystemscope.com/textures/
2. 下载对应 JPG（建议 2K，兼顾质量与性能）
3. 覆盖到此目录，保持上表中的文件名
4. 硬刷新浏览器（Ctrl+Shift+R）清除纹理缓存

或使用 PowerShell 直接下载单个文件：

```powershell
Invoke-WebRequest `
  -Uri "https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg" `
  -OutFile "public\textures\planets\2k_earth_daymap.jpg" `
  -UseBasicParsing
```

## 📋 可选纹理

### 高级地球纹理（可选）
- 法线贴图: `2k_earth_normal_map.jpg` - 增强表面细节
- 镜面贴图: `2k_earth_specular_map.jpg` - 海洋反光效果
- 云层贴图: `2k_earth_clouds.jpg` - 独立云层

### 火星和月球（可选）
- 火星法线: `2k_mars_normal_map.jpg`
- 月球法线: `2k_moon_normal_map.jpg`

## 🔄 应用纹理

1. 将纹理文件放入此目录
2. 确保文件名与配置匹配
3. 刷新浏览器（按F5或Ctrl+R）
4. 如果未加载，检查浏览器控制台是否有错误

## 🎨 程序化纹理回退

如果纹理文件不存在或加载失败，系统会自动使用程序化纹理作为备选。这确保：
- 永不出现空白球体
- 即使离线也能正常工作
- 性能优化

## 📊 文件大小参考

- 2K纹理: 约3-10MB每个
- 建议总空间: 100-200MB
- 加载时间: 初次5-10秒，后续即时（缓存）

## 🚀 性能提示

- 2K分辨率最适合Web应用
- 4K适合高端设备演示
- JPEG格式平衡质量和大小
- 系统会自动缓存已加载纹理

## 📜 许可证

- **Natural Earth III**: 公共领域，完全免费
- **Solar System Scope**: CC Attribution 4.0（需注明来源）
- **NASA纹理**: 公共领域

使用Solar System Scope纹理时，请在项目说明中注明：
> Textures courtesy of Solar System Scope (https://www.solarsystemscope.com)

## 🔧 故障排除

**纹理未显示？**
1. 检查文件名拼写是否正确
2. 确认文件格式为JPG
3. 查看浏览器控制台错误信息
4. 尝试硬刷新（Ctrl+Shift+R）

**纹理加载慢？**
1. 考虑使用2K而非8K分辨率
2. 检查网络连接
3. 清除浏览器缓存后重试

**需要帮助？**
查看项目主README或联系开发团队。
