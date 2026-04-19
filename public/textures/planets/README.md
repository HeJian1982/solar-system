# 太阳系行星纹理目录

## 📍 当前状态

✅ **地球纹理已就绪** - 高质量8K Natural Earth III纹理
- 文件: `2k_earth_daymap.jpg`
- 来源: Natural Earth III (免费公共领域)
- 分辨率: 8192x4096 (约9.5MB)

## 🌍 刷新浏览器查看真实地球

地球现在将显示：
- 真实的大陆和海洋
- 准确的地形颜色
- 专业级地理纹理

## 🪐 其他行星纹理下载

### 方法1: 手动下载（推荐）

访问 **Solar System Scope**: https://www.solarsystemscope.com/textures/

1. 点击每个行星
2. 下载2K分辨率JPG
3. 保存到此目录
4. 命名格式: `2k_<行星名>.jpg`

**需要下载的行星**:
- ☀️ 太阳: `2k_sun.jpg`
- ☿️ 水星: `2k_mercury.jpg`
- ♀️ 金星: `2k_venus_surface.jpg`
- ♂️ 火星: `2k_mars.jpg`
- ♃ 木星: `2k_jupiter.jpg`
- ♄ 土星: `2k_saturn.jpg`
- ♅ 天王星: `2k_uranus.jpg`
- ♆ 海王星: `2k_neptune.jpg`
- 🌙 月球: `2k_moon.jpg`

### 方法2: 使用自动化脚本

```powershell
# 在PowerShell中运行
cd "d:\HJ\个人网站入口\public\textures\planets"
.\download-textures.ps1
```

**注意**: 由于CORS限制，脚本可能无法下载所有纹理，建议使用方法1手动下载。

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
