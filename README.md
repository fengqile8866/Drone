# 无人机编队表演动画

一个基于Three.js的3D无人机编队表演动画项目，支持多种炫酷的编队造型和动画效果。

## 功能特点

- 🚁 10000架无人机同时表演
- 🎨 丰富的编队造型
  - 经典图案：花朵、爱心、中国龙、凤凰、蕾丝
  - 新增图案：火箭、2025、月亮、宇宙飞船
  - 艺术图案：高楼大厦、哪吒、火焰、烟花、清明上河图、蒙娜丽莎
- 🎵 沉浸式音效系统
  - 背景音乐
  - 起飞/降落音效
  - 变换音效
- ⚙️ 交互控制
  - 无人机速度调节
  - 声音开关控制
  - 闪烁效果切换
  - 自定义图案上传

## 技术栈

- Three.js - 3D渲染引擎
- Vite - 构建工具
- GSAP - 动画库
- Web Audio API - 音频处理

## 安装说明

1. 克隆项目到本地

```bash
git clone [项目地址]
cd 无人机2
```

2. 安装依赖

```bash
npm install
```

3. 启动开发服务器

```bash
npm run dev
```

4. 打开浏览器访问 http://localhost:5174

## 使用说明

### 基础控制

- 点击「起飞」按钮：所有无人机从地面升空
- 点击「降落」按钮：所有无人机降落到地面
- 点击「声音」按钮：开启/关闭音效和背景音乐
- 点击「关闭闪烁」按钮：开启/关闭无人机闪烁效果
- 使用速度滑块：调节无人机运动速度

### 图案切换

点击左侧控制面板中的不同图案按钮，无人机编队将变换成对应的造型：

- 经典图案
  - 花朵：绽放的花朵造型
  - 爱心：浪漫的心形图案
  - 中国龙：灵动的龙形图案
  - 凤凰：展翅的凤凰造型
  - 蕾丝：精致的蕾丝图案

- 新增图案
  - 火箭：腾空的火箭造型
  - 2025：数字年份展示
  - 月亮：明亮的月牙造型
  - 宇宙飞船：科幻的飞船图案

- 艺术图案
  - 高楼大厦：城市建筑轮廓
  - 哪吒：中国神话人物
  - 火焰：跃动的火焰效果
  - 烟花：绚丽的烟花绽放
  - 清明上河图：经典国画场景
  - 蒙娜丽莎：世界名画再现

### 自定义图案

点击「上传图片」按钮，可以上传自己的图片作为无人机编队的造型参考。

### 视角控制

- 鼠标左键：旋转视角
- 鼠标右键：平移视角
- 鼠标滚轮：缩放视角

## 开发说明

### 项目结构

```
├── public/
│   └── sounds/         # 音效文件
├── src/
│   ├── main.js        # 主程序入口
│   └── audio.js       # 音频管理模块
├── index.html         # 页面入口
└── package.json       # 项目配置
```

### 构建部署

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 许可证

MIT License