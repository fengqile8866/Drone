// 音频管理模块
class AudioManager {
  constructor() {
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.volume = 0.5;
    
    // 创建音频上下文
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // 音效
    this.sounds = {
      takeoff: this.createAudio('/sounds/takeoff.mp3'),
      landing: this.createAudio('/sounds/landing.mp3'),
      transform: this.createAudio('/sounds/transform.mp3')
    };
    
    // 背景音乐
    this.bgMusic = this.createAudio('/sounds/background.mp3', true);
    this.bgMusicNode = null;
  }

  // 创建音频元素
  createAudio(src, loop = false) {
    const audio = new Audio(src);
    audio.loop = loop;
    return audio;
  }

  // 播放音效
  playSound(name) {
    if (this.soundEnabled && this.sounds[name]) {
      const sound = this.sounds[name];
      sound.currentTime = 0;
      sound.volume = this.volume;
      sound.play().catch(e => console.log('播放音效失败:', e));
    }
  }

  // 播放背景音乐
  playMusic() {
    if (this.musicEnabled && this.bgMusic) {
      this.bgMusic.volume = this.volume;
      this.bgMusic.play().catch(e => console.log('播放音乐失败:', e));
    }
  }

  // 暂停背景音乐
  pauseMusic() {
    if (this.bgMusic) {
      this.bgMusic.pause();
    }
  }

  // 设置音量
  setVolume(value) {
    this.volume = value;
    if (this.bgMusic) {
      this.bgMusic.volume = value;
    }
    Object.values(this.sounds).forEach(sound => {
      sound.volume = value;
    });
  }

  // 切换音效状态
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  // 切换音乐状态
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.playMusic();
    } else {
      this.pauseMusic();
    }
    return this.musicEnabled;
  }
}

export const audioManager = new AudioManager();