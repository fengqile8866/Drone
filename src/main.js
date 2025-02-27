import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';
import { audioManager } from './audio.js';

// 场景初始化
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// 相机位置设置
camera.position.set(0, 800, 1500);
camera.lookAt(0, 0, 0);

// 轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 音频控制
const audioToggleBtn = document.getElementById('audio-toggle');
let isAudioEnabled = true;

audioToggleBtn.addEventListener('click', () => {
  isAudioEnabled = !isAudioEnabled;
  if (isAudioEnabled) {
    audioManager.toggleSound();
    audioManager.toggleMusic();
    audioManager.playMusic();
    audioToggleBtn.textContent = '声音：开启';
  } else {
    audioManager.toggleSound();
    audioManager.toggleMusic();
    audioManager.pauseMusic();
    audioToggleBtn.textContent = '声音：关闭';
  }
});

// 初始化音频
audioManager.playMusic();

// 创建无人机粒子系统
const DRONE_COUNT = 10000;
const MIN_DISTANCE = 8; // 增加最小距离
const MIN_HEIGHT = 300;
const FORMATION_SIZE = 600; // 增加整体尺寸以获得更好的空间分布

// 添加闪烁控制状态
let isFlickerEnabled = true;

const particles = new THREE.BufferGeometry();
const positions = new Float32Array(DRONE_COUNT * 3);
const colors = new Float32Array(DRONE_COUNT * 3);
const targetPositions = new Float32Array(DRONE_COUNT * 3);
const droneStates = new Array(DRONE_COUNT).fill(null).map(() => ({
  speed: 0.01 + Math.random() * 0.03,  // 随机速度
  delay: Math.random() * 2000,  // 随机延迟（毫秒）
  startTime: 0,  // 起飞开始时间
  isFlying: false,  // 是否正在飞行
  isGrounded: true  // 新增：是否在地面
}));

// 初始化无人机位置
for (let i = 0; i < DRONE_COUNT; i++) {
  const i3 = i * 3;
  const gridSize = Math.sqrt(DRONE_COUNT);
  const row = Math.floor(i / gridSize);
  const col = i % gridSize;
  
  // 计算网格位置，使编队更加紧凑和可见
  positions[i3] = (col - gridSize/2) * MIN_DISTANCE;
  positions[i3 + 1] = 0;  // 初始高度为0
  positions[i3 + 2] = (row - gridSize/2) * MIN_DISTANCE;
  
  targetPositions[i3] = positions[i3];
  targetPositions[i3 + 1] = positions[i3 + 1];
  targetPositions[i3 + 2] = positions[i3 + 2];
  
  colors[i3] = 1;
  colors[i3 + 1] = 1;
  colors[i3 + 2] = 1;
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
  size: 4,
  vertexColors: true,
  transparent: true,
  opacity: 1,
  blending: THREE.AdditiveBlending,
  sizeAttenuation: true
});

const points = new THREE.Points(particles, material);
scene.add(points);

// 造型生成函数
const formations = {
  takeoff: () => {
    const currentTime = Date.now();
    for (let i = 0; i < DRONE_COUNT; i++) {
      const i3 = i * 3;
      const angle = (i / DRONE_COUNT) * Math.PI * 2;
      const radius = (i / DRONE_COUNT) * FORMATION_SIZE * 0.5;
      
      targetPositions[i3] = Math.cos(angle) * radius;
      targetPositions[i3 + 1] = MIN_HEIGHT + Math.sin(i / 100) * 50;
      targetPositions[i3 + 2] = Math.sin(angle) * radius;
      
      droneStates[i].startTime = currentTime;
      droneStates[i].isFlying = true;
      droneStates[i].isGrounded = false;
      droneStates[i].delay = Math.random() * 1000;
      droneStates[i].speed = 0.01 + Math.random() * 0.02;
    }
    updateColors([1, 1, 1]);
  },
  
  landing: () => {
    const currentTime = Date.now();
    for (let i = 0; i < DRONE_COUNT; i++) {
      const i3 = i * 3;
      const angle = (i / DRONE_COUNT) * Math.PI * 2;
      const radius = (i / DRONE_COUNT) * FORMATION_SIZE * 0.3;
      
      targetPositions[i3] = Math.cos(angle) * radius;
      targetPositions[i3 + 1] = 0;
      targetPositions[i3 + 2] = Math.sin(angle) * radius;
      
      droneStates[i].startTime = currentTime;
      droneStates[i].isFlying = true;
      droneStates[i].isGrounded = true;
      droneStates[i].delay = Math.random() * 1000;
      droneStates[i].speed = 0.01 + Math.random() * 0.02;
    }
    updateColors([1, 1, 1]);
  },
  
  flower: () => {
    const currentTime = Date.now();
    const petals = 8;
    const layers = 5;
    
    for (let i = 0; i < DRONE_COUNT; i++) {
      const i3 = i * 3;
      const layer = Math.floor((i / DRONE_COUNT) * layers);
      const layerOffset = layer / layers;
      const angle = (i / DRONE_COUNT) * Math.PI * 2;
      const petalAngle = angle * petals;
      
      const radius = FORMATION_SIZE * (0.2 + 0.8 * Math.pow(Math.abs(Math.sin(petalAngle)), 0.5));
      const heightVariation = 300 * (1 - layerOffset);
      
      targetPositions[i3] = Math.cos(angle) * radius * (1 - layerOffset * 0.3);
      targetPositions[i3 + 1] = MIN_HEIGHT + layer * 100 + Math.sin(petalAngle) * heightVariation;
      targetPositions[i3 + 2] = Math.sin(angle) * radius * (1 - layerOffset * 0.3);
      
      droneStates[i].startTime = currentTime;
      droneStates[i].isFlying = true;
      droneStates[i].isGrounded = false;
      droneStates[i].delay = Math.random() * 1000;
      droneStates[i].speed = 0.01 + Math.random() * 0.02;
    }
    updateColors([1, 0.3, 0.5]);
  },
  
  heart: () => {
    const currentTime = Date.now();
    const layers = 8;
    const shellThickness = 0.3;
    
    for (let i = 0; i < DRONE_COUNT; i++) {
      const i3 = i * 3;
      const layer = Math.floor((i / DRONE_COUNT) * layers);
      const layerProgress = layer / layers;
      const t = ((i % (DRONE_COUNT / layers)) / (DRONE_COUNT / layers)) * Math.PI * 2;
      
      const shellRadius = 1 - Math.random() * shellThickness;
      const x = 16 * Math.pow(Math.sin(t), 3) * shellRadius;
      const z = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * shellRadius;
      const y = MIN_HEIGHT + layer * 60 + Math.sin(t * 3) * 30;
      
      const scale = FORMATION_SIZE / 16 * (1 - layerProgress * 0.3);
      const rotationAngle = layerProgress * Math.PI * 0.3;
      
      targetPositions[i3] = x * Math.cos(rotationAngle) * scale;
      targetPositions[i3 + 1] = y;
      targetPositions[i3 + 2] = (z * Math.cos(rotationAngle) + x * Math.sin(rotationAngle)) * scale;
      
      droneStates[i].startTime = currentTime;
      droneStates[i].isFlying = true;
      droneStates[i].isGrounded = false;
      droneStates[i].delay = Math.random() * 1000;
      droneStates[i].speed = 0.01 + Math.random() * 0.02;
    }
    updateColors([1, 0, 0]);
  },
  
  dragon: () => {
    const currentTime = Date.now();
    const segments = 15; // 增加段数以获得更细腻的效果
    const segmentLength = FORMATION_SIZE * 3 / segments;
    
    for (let i = 0; i < DRONE_COUNT; i++) {
      const i3 = i * 3;
      const segment = Math.floor((i / DRONE_COUNT) * segments);
      const segmentProgress = segment / segments;
      const localT = ((i % (DRONE_COUNT / segments)) / (DRONE_COUNT / segments)) * Math.PI * 2;
      
      // 优化龙身的曲线
      const spineX = Math.sin(segmentProgress * Math.PI * 2.5) * FORMATION_SIZE * 1.2;
      const spineY = MIN_HEIGHT + Math.sin(segmentProgress * Math.PI * 5) * 300 + 
                    Math.sin(currentTime * 0.001 + segmentProgress * Math.PI * 2) * 50; // 添加呼吸动效
      const spineZ = segmentProgress * FORMATION_SIZE * 2.5 - FORMATION_SIZE;
      
      // 优化身体横截面，使其更丰满
      const bodyShape = Math.sin(segmentProgress * Math.PI) * 0.5 + 0.5; // 身体粗细变化
      const radius = FORMATION_SIZE * 0.3 * (bodyShape + 0.2) * (1 - segmentProgress * 0.3);
      
      // 创建更复杂的螺旋效果
      const spiralT = localT + segmentProgress * Math.PI * 4;
      const spiralX = Math.cos(spiralT) * radius * (1 + Math.sin(spiralT * 2) * 0.2);
      const spiralY = Math.sin(spiralT) * radius * (1 + Math.cos(spiralT * 2) * 0.2);
      
      // 动态扭动效果
      const twistAngle = segmentProgress * Math.PI * 6 + 
                        currentTime * 0.001 * (1 + Math.sin(segmentProgress * Math.PI) * 0.5);
      
      // 计算最终位置
      const finalX = spineX + spiralX * Math.cos(twistAngle) - spiralY * Math.sin(twistAngle);
      const finalY = spineY + spiralX * Math.sin(twistAngle) + spiralY * Math.cos(twistAngle);
      
      targetPositions[i3] = finalX;
      targetPositions[i3 + 1] = finalY;
      targetPositions[i3 + 2] = spineZ;
      
      // 设置无人机状态
      droneStates[i].startTime = currentTime;
      droneStates[i].isFlying = true;
      droneStates[i].isGrounded = false;
      droneStates[i].delay = Math.random() * 1000;
      droneStates[i].speed = 0.01 + Math.random() * 0.02;
    }
    
    // 使用渐变色彩
    const colors = particles.attributes.color.array;
    for (let i = 0; i < DRONE_COUNT; i++) {
      const i3 = i * 3;
      const segment = Math.floor((i / DRONE_COUNT) * segments);
      const segmentProgress = segment / segments;
      
      // 从紫色到红色的渐变
      colors[i3] = 1; // 红色分量
      colors[i3 + 1] = 0.2 * (1 - segmentProgress); // 绿色分量
      colors[i3 + 2] = 0.8 * (1 - segmentProgress); // 蓝色分量
    }
    particles.attributes.color.needsUpdate = true;
  },
  
  phoenix: () => {
    const currentTime = Date.now();
    const wingLayers = 6;
    
    for (let i = 0; i < DRONE_COUNT; i++) {
      const i3 = i * 3;
      const layer = Math.floor((i / DRONE_COUNT) * wingLayers);
      const layerProgress = layer / wingLayers;
      const t = (i / DRONE_COUNT) * Math.PI * 2;
      
      const wingSpan = FORMATION_SIZE * (1.5 - layerProgress * 0.5);
      const wingCurve = Math.pow(Math.abs(Math.sin(t * 2)), 0.5);
      const bodyRadius = FORMATION_SIZE * 0.3;
      
      const bodyX = Math.cos(t) * bodyRadius * (1 - layerProgress * 0.5);
      const bodyZ = Math.sin(t) * bodyRadius * (1 - layerProgress * 0.5);
      const wingX = Math.cos(t) * wingSpan * wingCurve;
      const wingZ = Math.sin(t) * wingSpan * wingCurve;
      
      const height = MIN_HEIGHT + layer * 80 + Math.sin(t * 4 + currentTime * 0.001) * 50;
      const blendFactor = Math.pow(Math.sin(t * 2), 2);
      
      targetPositions[i3] = bodyX * (1 - blendFactor) + wingX * blendFactor;
      targetPositions[i3 + 1] = height;
      targetPositions[i3 + 2] = bodyZ * (1 - blendFactor) + wingZ * blendFactor;
      
      droneStates[i].startTime = currentTime;
      droneStates[i].isFlying = true;
      droneStates[i].isGrounded = false;
      droneStates[i].delay = Math.random() * 1000;
      droneStates[i].speed = 0.01 + Math.random() * 0.02;
    }
    updateColors([1, 0.2, 0]);
  },

  lace: () => {
    const currentTime = Date.now();
    const layers = 10;
    const spirals = 8;
    const wavesPerSpiral = 6;
    
    for (let i = 0; i < DRONE_COUNT; i++) {
      const i3 = i * 3;
      const layer = Math.floor((i / DRONE_COUNT) * layers);
      const layerProgress = layer / layers;
      const t = (i / DRONE_COUNT) * Math.PI * 2;
      
      // 创建多层螺旋结构
      const spiralAngle = t * spirals + layerProgress * Math.PI;
      const spiralRadius = FORMATION_SIZE * (0.3 + 0.7 * (1 - layerProgress));
      const waveOffset = Math.sin(t * wavesPerSpiral + currentTime * 0.001) * FORMATION_SIZE * 0.15;
      
      // 添加波浪和褶皱效果
      const verticalWave = Math.sin(spiralAngle * 3) * FORMATION_SIZE * 0.1;
      const horizontalWave = Math.cos(spiralAngle * 2) * FORMATION_SIZE * 0.1;
      
      // 计算基础螺旋坐标
      const baseX = Math.cos(spiralAngle) * (spiralRadius + waveOffset);
      const baseZ = Math.sin(spiralAngle) * (spiralRadius + waveOffset);
      
      // 添加立体感和层次
      const height = MIN_HEIGHT + layer * 40 + verticalWave;
      const radialOffset = Math.sin(t * 8 + layerProgress * Math.PI * 2) * FORMATION_SIZE * 0.05;
      
      // 最终位置计算，包含所有效果
      targetPositions[i3] = baseX + horizontalWave + radialOffset * Math.cos(spiralAngle);
      targetPositions[i3 + 1] = height;
      targetPositions[i3 + 2] = baseZ + horizontalWave + radialOffset * Math.sin(spiralAngle);
      
      // 设置无人机状态
      droneStates[i].startTime = currentTime;
      droneStates[i].isFlying = true;
      droneStates[i].isGrounded = false;
      droneStates[i].delay = Math.random() * 1000;
      droneStates[i].speed = 0.01 + Math.random() * 0.02;
    }
    
    // 使用柔和的蓝紫色调
    updateColors([0.6, 0.4, 1]);
  },

  riverside: () => {
    const currentTime = Date.now();
    const width = FORMATION_SIZE * 2;
    const height = FORMATION_SIZE;
    
    for (let i = 0; i < DRONE_COUNT; i++) {
      const i3 = i * 3;
      const x = (i % 100) / 100;
      const y = Math.floor(i / 100) / (DRONE_COUNT / 100);
      
      const terrainHeight = Math.sin(x * Math.PI * 4) * 50 + Math.cos(x * Math.PI * 8) * 30;
      const buildingHeight = Math.sin(x * Math.PI * 6) * 100 * Math.pow(y, 2);
      
      targetPositions[i3] = (x - 0.5) * width;
      targetPositions[i3 + 1] = MIN_HEIGHT + terrainHeight + buildingHeight * y;
      targetPositions[i3 + 2] = (y - 0.5) * height;
      
      droneStates[i].startTime = currentTime;
      droneStates[i].isFlying = true;
      droneStates[i].isGrounded = false;
      droneStates[i].delay = Math.random() * 1000;
      droneStates[i].speed = 0.01 + Math.random() * 0.02;
    }
    updateColors([0.8, 0.6, 0.4]);
  },

  monalisa: () => {
    const currentTime = Date.now();
    const width = FORMATION_SIZE;
    const height = FORMATION_SIZE * 1.5;
    
    for (let i = 0; i < DRONE_COUNT; i++) {
      const i3 = i * 3;
      const progress = i / DRONE_COUNT;
      const angle = progress * Math.PI * 2;
      
      // 创建蒙娜丽莎的轮廓
      const portraitShape = Math.sin(progress * Math.PI);
      const radius = width * 0.3 * Math.abs(portraitShape);
      
      targetPositions[i3] = Math.cos(angle) * radius;
      targetPositions[i3 + 1] = MIN_HEIGHT + (progress - 0.5) * height;
      targetPositions[i3 + 2] = Math.sin(angle) * radius * 0.6;
      
      droneStates[i].startTime = currentTime;
      droneStates[i].isFlying = true;
      droneStates[i].isGrounded = false;
      droneStates[i].delay = Math.random() * 1000;
      droneStates[i].speed = 0.01 + Math.random() * 0.02;
    }
    updateColors([0.7, 0.5, 0.3]);
  },

  rocket: () => {
    const currentTime = Date.now();
    const height = FORMATION_SIZE * 2;
    
    for (let i = 0; i < DRONE_COUNT; i++) {
      const i3 = i * 3;
      const progress = i / DRONE_COUNT;
      const angle = progress * Math.PI * 2;
      
      // 创建火箭的主体
      const bodyRadius = FORMATION_SIZE * 0.2 * (1 - Math.pow(progress, 2));
      const bodyHeight = progress * height;
      
      // 添加火箭尾部的火焰效果
      const flameSpread = Math.sin(progress * Math.PI * 8) * (1 - progress) * FORMATION_SIZE * 0.3;
      
      targetPositions[i3] = Math.cos(angle) * (bodyRadius + flameSpread);
      targetPositions[i3 + 1] = MIN_HEIGHT + bodyHeight;
      targetPositions[i3 + 2] = Math.sin(angle) * (bodyRadius + flameSpread);
      
      droneStates[i].startTime = currentTime;
      droneStates[i].isFlying = true;
      droneStates[i].isGrounded = false;
      droneStates[i].delay = Math.random() * 1000;
      droneStates[i].speed = 0.01 + Math.random() * 0.02;
    }
    updateColors([1, 0.3, 0]);
  },

  year2025: () => {
    const currentTime = Date.now();
    const width = FORMATION_SIZE * 2;
    const height = FORMATION_SIZE;
    
    for (let i = 0; i < DRONE_COUNT; i++) {
      const i3 = i * 3;
      const digitIndex = Math.floor((i / DRONE_COUNT) * 4); // 4位数字
      const digitProgress = (i % (DRONE_COUNT / 4)) / (DRONE_COUNT / 4);
      
      // 为每个数字创建不同的位置
      const digitX = (digitIndex - 1.5) * (width / 4);
      const digitY = MIN_HEIGHT + Math.sin(digitProgress * Math.PI * 2) * (height / 2);
      const digitZ = Math.cos(digitProgress * Math.PI * 2) * (width / 8);
      
      targetPositions[i3] = digitX;
      targetPositions[i3 + 1] = digitY;
      targetPositions[i3 + 2] = digitZ;
      
      droneStates[i].startTime = currentTime;
      droneStates[i].isFlying = true;
      droneStates[i].isGrounded = false;
      droneStates[i].delay = Math.random() * 1000;
      droneStates[i].speed = 0.01 + Math.random() * 0.02;
    }
    updateColors([0, 1, 1]);
  },

  moon: () => {
    const currentTime = Date.now();
    
    for (let i = 0; i < DRONE_COUNT; i++) {
      const i3 = i * 3;
      const progress = i / DRONE_COUNT;
      const angle = progress * Math.PI * 2;
      
      // 创建月牙形状
      const outerRadius = FORMATION_SIZE * 0.8;
      const innerRadius = FORMATION_SIZE * 0.6;
      const crescent = Math.sin(angle * 2) * FORMATION_SIZE * 0.2;
      
      targetPositions[i3] = Math.cos(angle) * (outerRadius - crescent);
      targetPositions[i3 + 1] = MIN_HEIGHT + Math.sin(angle) * innerRadius;
      targetPositions[i3 + 2] = Math.sin(angle) * (outerRadius - crescent);
      
      droneStates[i].startTime = currentTime;
      droneStates[i].isFlying = true;
      droneStates[i].isGrounded = false;
      droneStates[i].delay = Math.random() * 1000;
      droneStates[i].speed = 0.01 + Math.random() * 0.02;
    }
    updateColors([1, 1, 0.5]);
  },

  spaceship: () => {
    const currentTime = Date.now();
    
    for (let i = 0; i < DRONE_COUNT; i++) {
      const i3 = i * 3;
      const progress = i / DRONE_COUNT;
      const angle = progress * Math.PI * 2;
      
      // 创建飞船主体
      const bodyRadius = FORMATION_SIZE * 0.5 * (1 - Math.pow(progress - 0.5, 2));
      const wingSpread = Math.sin(angle * 3) * FORMATION_SIZE * 0.3;
      
      targetPositions[i3] = Math.cos(angle) * (bodyRadius + wingSpread);
      targetPositions[i3 + 1] = MIN_HEIGHT + Math.sin(progress * Math.PI * 2) * FORMATION_SIZE * 0.3;
      targetPositions[i3 + 2] = Math.sin(angle) * (bodyRadius + wingSpread);
      
      droneStates[i].startTime = currentTime;
      droneStates[i].isFlying = true;
      droneStates[i].isGrounded = false;
      droneStates[i].delay = Math.random() * 1000;
      droneStates[i].speed = 0.01 + Math.random() * 0.02;
    }
    updateColors([0.5, 0.8, 1]);
  },

  buildings: () => {
    const currentTime = Date.now();
    const width = FORMATION_SIZE * 2;
    const maxHeight = FORMATION_SIZE * 1.5;
    
    for (let i = 0; i < DRONE_COUNT; i++) {
      const i3 = i * 3;
      const x = (i % 100) / 100;
      const z = Math.floor(i / 100) / (DRONE_COUNT / 100);
      
      // 创建不同高度的建筑
      const buildingHeight = Math.pow(Math.sin(x * Math.PI * 8) * Math.cos(z * Math.PI * 4), 2) * maxHeight;
      
      targetPositions[i3] = (x - 0.5) * width;
      targetPositions[i3 + 1] = MIN_HEIGHT + buildingHeight;
      targetPositions[i3 + 2] = (z - 0.5) * width * 0.5;
      
      droneStates[i].startTime = currentTime;
      droneStates[i].isFlying = true;
      droneStates[i].isGrounded = false;
      droneStates[i].delay = Math.random() * 1000;
      droneStates[i].speed = 0.01 + Math.random() * 0.02;
    }
    updateColors([0.3, 0.6, 0.9]);
  },

  nezha: () => {
    const currentTime = Date.now();
    const height = FORMATION_SIZE * 1.5;
    
    for (let i = 0; i < DRONE_COUNT; i++) {
      const i3 = i * 3;
      const progress = i / DRONE_COUNT;
      const angle = progress * Math.PI * 2;
      
      // 创建哪吒的轮廓
      const bodyRadius = FORMATION_SIZE * 0.3 * Math.sin(progress * Math.PI);
      const ribbonEffect = Math.sin(angle * 6) * FORMATION_SIZE * 0.2;
      
      targetPositions[i3] = Math.cos(angle) * (bodyRadius + ribbonEffect);
      targetPositions[i3 + 1] = MIN_HEIGHT + progress * height;
      targetPositions[i3 + 2] = Math.sin(angle) * (bodyRadius + ribbonEffect);
      
      droneStates[i].startTime = currentTime;
      droneStates[i].isFlying = true;
      droneStates[i].isGrounded = false;
      droneStates[i].delay = Math.random() * 1000;
      droneStates[i].speed = 0.01 + Math.random() * 0.02;
    }
    updateColors([1, 0.4, 0.4]);
  },

  flame: () => {
    const currentTime = Date.now();
    
    for (let i = 0; i < DRONE_COUNT; i++) {
      const i3 = i * 3;
      const progress = i / DRONE_COUNT;
      const angle = progress * Math.PI * 2;
      
      // 创建火焰效果
      const flameHeight = Math.pow(1 - progress, 2) * FORMATION_SIZE * 2;
      const flameWidth = Math.sin(progress * Math.PI) * FORMATION_SIZE * 0.5;
      
      targetPositions[i3] = Math.cos(angle) * flameWidth;
      targetPositions[i3 + 1] = MIN_HEIGHT + flameHeight;
      targetPositions[i3 + 2] = Math.sin(angle) * flameWidth;
      
      droneStates[i].startTime = currentTime;
      droneStates[i].isFlying = true;
      droneStates[i].isGrounded = false;
      droneStates[i].delay = Math.random() * 1000;
      droneStates[i].speed = 0.01 + Math.random() * 0.02;
    }
    updateColors([1, 0.3, 0]);
  },

  fireworks: () => {
    const currentTime = Date.now();
    
    for (let i = 0; i < DRONE_COUNT; i++) {
      const i3 = i * 3;
      const shellIndex = Math.floor(i / (DRONE_COUNT / 5)); // 5个烟花
      const particleInShell = i % (DRONE_COUNT / 5);
      const particleProgress = particleInShell / (DRONE_COUNT / 5);
      const particleAngle = particleProgress * Math.PI * 2;
      
      // 计算每个烟花的位置
      const shellOffset = (shellIndex - 2) * FORMATION_SIZE * 0.5;
      const explosionRadius = FORMATION_SIZE * 0.3;
      
      targetPositions[i3] = shellOffset + Math.cos(particleAngle) * explosionRadius;
      targetPositions[i3 + 1] = MIN_HEIGHT + Math.sin(particleProgress * Math.PI) * FORMATION_SIZE;
      targetPositions[i3 + 2] = Math.sin(particleAngle) * explosionRadius;
      
      droneStates[i].startTime = currentTime;
      droneStates[i].isFlying = true;
      droneStates[i].isGrounded = false;
      droneStates[i].delay = Math.random() * 1000;
      droneStates[i].speed = 0.01 + Math.random() * 0.02;
    }
    updateColors([1, 0.5, 0]);
  }
};

// 更新颜色函数
function updateColors([r, g, b]) {
  const colors = particles.attributes.color.array;
  for (let i = 0; i < DRONE_COUNT; i++) {
    const i3 = i * 3;
    colors[i3] = r;
    colors[i3 + 1] = g;
    colors[i3 + 2] = b;
  }
  particles.attributes.color.needsUpdate = true;
}

// 绑定按钮事件
document.getElementById('takeoff').addEventListener('click', formations.takeoff);
document.getElementById('landing').addEventListener('click', formations.landing);
document.getElementById('flower').addEventListener('click', formations.flower);
document.getElementById('heart').addEventListener('click', formations.heart);
document.getElementById('dragon').addEventListener('click', formations.dragon);
document.getElementById('phoenix').addEventListener('click', formations.phoenix);
document.getElementById('lace').addEventListener('click', formations.lace);
document.getElementById('riverside').addEventListener('click', formations.riverside);
document.getElementById('monalisa').addEventListener('click', formations.monalisa);
document.getElementById('rocket').addEventListener('click', formations.rocket);
document.getElementById('year2025').addEventListener('click', formations.year2025);
document.getElementById('moon').addEventListener('click', formations.moon);
document.getElementById('spaceship').addEventListener('click', formations.spaceship);
document.getElementById('buildings').addEventListener('click', formations.buildings);
document.getElementById('nezha').addEventListener('click', formations.nezha);
document.getElementById('flame').addEventListener('click', formations.flame);
document.getElementById('fireworks').addEventListener('click', formations.fireworks);
document.getElementById('flicker').addEventListener('click', toggleFlicker);

// 动画循环
let globalSpeedFactor = 1;
document.getElementById('speed').addEventListener('input', (e) => {
  globalSpeedFactor = parseFloat(e.target.value);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  
  const currentTime = Date.now();
  const positions = particles.attributes.position.array;
  const colors = particles.attributes.color.array;
  const baseColors = particles.attributes.color.array.slice();
  
  for (let i = 0; i < DRONE_COUNT; i++) {
    const i3 = i * 3;
    const droneState = droneStates[i];
    
    // 更新无人机位置
    if (droneState.isFlying && currentTime >= droneState.startTime + droneState.delay) {
      if (targetPositions[i3] !== undefined && 
          (Math.abs(targetPositions[i3] - positions[i3]) > 0.01 || 
           Math.abs(targetPositions[i3 + 1] - positions[i3 + 1]) > 0.01 || 
           Math.abs(targetPositions[i3 + 2] - positions[i3 + 2]) > 0.01)) {
        positions[i3] += (targetPositions[i3] - positions[i3]) * droneState.speed * globalSpeedFactor;
        positions[i3 + 1] += (targetPositions[i3 + 1] - positions[i3 + 1]) * droneState.speed * globalSpeedFactor;
        positions[i3 + 2] += (targetPositions[i3 + 2] - positions[i3 + 2]) * droneState.speed * globalSpeedFactor;
      } else {
        droneState.isFlying = false;
      }
    }
    
    // 优化的闪烁效果
    if (isFlickerEnabled) {
      const time = currentTime * 0.001;
      // 为每个无人机设置独立的闪烁周期
      const individualPhase = Math.sin(time + i * 0.1) * Math.PI;
      // 添加随机因子，使闪烁更自然
      const randomOffset = Math.sin(time * 0.5 + i * 0.3) * 0.3;
      // 计算闪烁强度，确保不会完全熄灭
      const flicker = 0.7 + (Math.sin(individualPhase) * 0.2) + randomOffset;
      // 应用闪烁效果
      colors[i3] = baseColors[i3] * flicker;
      colors[i3 + 1] = baseColors[i3 + 1] * flicker;
      colors[i3 + 2] = baseColors[i3 + 2] * flicker;
    } else {
      // 不闪烁时保持原始颜色
      colors[i3] = baseColors[i3];
      colors[i3 + 1] = baseColors[i3 + 1];
      colors[i3 + 2] = baseColors[i3 + 2];
    }
  }
  
  particles.attributes.position.needsUpdate = true;
  particles.attributes.color.needsUpdate = true;
  renderer.render(scene, camera);
}

// 窗口大小调整
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 开始动画
animate();

// 添加闪烁控制按钮事件处理函数
function toggleFlicker() {
  isFlickerEnabled = !isFlickerEnabled;
  document.getElementById('flicker').textContent = isFlickerEnabled ? '关闭闪烁' : '开启闪烁';
}

// 音频控制
document.getElementById('toggleSound').addEventListener('click', () => {
  const enabled = audioManager.toggleSound();
  document.getElementById('toggleSound').textContent = `音效：${enabled ? '开' : '关'}`;
});

document.getElementById('toggleMusic').addEventListener('click', () => {
  const enabled = audioManager.toggleMusic();
  document.getElementById('toggleMusic').textContent = `音乐：${enabled ? '开' : '关'}`;
});

document.getElementById('volume').addEventListener('input', (e) => {
  audioManager.setVolume(parseFloat(e.target.value));
});

// 在相应的事件中播放音效
document.getElementById('takeoff').addEventListener('click', () => {
  audioManager.playSound('takeoff');
});

document.getElementById('landing').addEventListener('click', () => {
  audioManager.playSound('landing');
});

// 为所有造型按钮添加音效
const patternButtons = document.querySelectorAll('.controls button:not(#takeoff):not(#landing):not(#flicker):not(#toggleSound):not(#toggleMusic)');
patternButtons.forEach(button => {
  button.addEventListener('click', () => {
    audioManager.playSound('transform');
  });
});

// 初始化音乐
audioManager.playMusic();