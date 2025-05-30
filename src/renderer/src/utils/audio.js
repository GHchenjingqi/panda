import { sleep } from "./comfun";

let musicList = [], active , sigle , random;
let Listener = false

class AudioPlayer {
    constructor(src) {
      this.audio = new Audio();
      if (src){
        this.setSource(src);
        this.setupListeners();
      }
    }

    async init(){
        active = await api.storage.get('musicActive') || 1
        sigle = await api.storage.get('musicSingle') || false
        random = await api.storage.get('musicRandom') || false
        let res = await this.getMusics()
        if (res && res.length>0) {
            this.setNextSrc()
            this.getTitle()
            this.setupListeners();
        }
    }
    async getMusics(){
       let src =  await api.storage.get('musicPath') || null
       if(!src){
            musicList = []
            this.audio.src = ''
            return []
       } 
       musicList = await api.invoke('get-music',src)
       return musicList
    }
    setNextSrc() {
    if (musicList && musicList.length) {
        let len = musicList.length;
        if (!sigle) {
            if (!random) {
                // 顺序播放
                active = (active + 1) % len; // 循环播放
            } else {
                // 随机播放
                active = Math.floor(Math.random() * len); // 包括 0 到 len-1
            }
        } else {
            if (random) {
                active = Math.floor(Math.random() * len);
            } else {
                active = active; // 单曲循环
            }
        }

        let src = musicList[active];
        this.audio.src = this.getAssetURL(src);
    }
}
    getTitle(){
        if (!this.audio.src) return '暂无播放'
        let src = decodeURIComponent(this.audio.src)
        const filenameWithExtension = src.split('/').pop(); // 获取最后一段（含扩展名）
        const title = filenameWithExtension.replace(/\.\w+$/, ''); // 去掉最后一个 .后缀
        return title
    }
    async getTitleAsync(){
        await sleep(100)
        return this.getTitle()
    }
    getAudioStatus() {
        return {
          name: this.getTitle(),
          src: this.audio.src,
          play: this.audio.paused ? false : true,
          duration: this.audio.duration,
          currentTime: this.audio.currentTime,
          sigle,
          autoplay: this.audio.autoplay,
        }
    }
    
    getAssetURL(filePath){
        if (!filePath) return
        const processedPath = encodeURIComponent( filePath.replace(/\\/g, '/') )
        return `electron://${processedPath}`
    }
    // 设置音频源
    setSource(src) {
      this.audio.src = src;
    }
    // 单曲循环状态 默认false - 不开启
    async setSigleToggle(val) {
        sigle = val
        await api.storage.set('musicSingle', sigle)
    }
  
    async getSigle() {
        return await api.storage.get('musicSingle')
    }

    async setRandomToggle(val) {
        random = val
        await api.storage.set('musicRandom', random)
    }
    async getRandom() {
        return await api.storage.get('musicRandom')
    }
    async playByName(name) { 
        let src = musicList.find(item => item.includes(name))
        if (src) {
            this.setSource(this.getAssetURL(src))
            this.play()
        }
    }
    // 播放音频
    async play() {
        if (!this.audio.src) return
        if (this.audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            this.audio.play();
            return;
        }
        this.audio.addEventListener('canplay', ()=>{ this.audio.play()}, { once: true });
        // 显式加载音频
        this.audio.load();
        this.audio.addEventListener('error', () => {
            const errorCode = this.audio.error;
            if (errorCode) {
                console.error('音频错误:', {
                code: errorCode.code,
                message: {
                    1: 'MEDIA_ERR_ABORTED - 用户中止',
                    2: 'MEDIA_ERR_NETWORK - 网络错误',
                    3: 'MEDIA_ERR_DECODE - 解码错误',
                    4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - 格式不支持'
                }[errorCode.code]
                });
            }
        });
    }

    // 暂停音频
    pause() {
      this.audio.pause();
    }
  
    // 设置音量，接受0-1之间的浮点数
    setVolume(volumeLevel) {
      if (volumeLevel < 0 || volumeLevel > 1) {
        throw new Error('Volume must be between 0 and 1');
      }
      this.audio.volume = volumeLevel;
    }
  
    // 获取当前音量
    getVolume() {
      return this.audio.volume;
    }
    // 监听播放事件
    async setupListeners() {
        if (Listener) return
        if (!this.audio.src) return
        let that = this;
        this.audio.addEventListener('play', () => console.log('Audio started playing'));
        this.audio.addEventListener('pause', () => console.log('Audio paused'));
        this.audio.addEventListener('ended', () => {
            that.setNextSrc();
            that.play();
        });
        this.audio.addEventListener('error', (e) => console.error('An error occurred:', e));
        Listener = true
    }
  
    // 返回当前播放时间
    getCurrentTime() {
      return this.audio.currentTime;
    }
  
    // 跳转到指定时间
    setCurrentTime(time) {
      this.audio.currentTime = time;
    }
  
    // 返回音频总时长
    getDuration() {
      return this.audio.duration;
    }
    // 获取当前播放进度
    getProgress() {
        return this.audio.currentTime / this.audio.duration * 100;
    }
  }

  let isExist = false, audio = null;
  if (!isExist) {
    audio = new AudioPlayer();
    isExist = true;
  }

  export default audio;