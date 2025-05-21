<template>
    <div class="music">
        <img class="music-img " :class="{ 'rotate': musicState.play }" :src="defimg" alt="">
        <div class="play-box">
            <div class="play-top">
                <div class="title" @click="nextPlay" title="下一首">{{ musicState.name }}</div>
                <div class="play-btn">
                    <div class="item one" @click="changePlay">
                        <img :src="musicPlayIcon" alt="播放/暂停" title="播放/暂停">
                    </div>
                    <div class="item">
                        <img :src="RandomIcon" @click="changeRandomHandel()" alt="随机播放" title="随机播放">
                    </div>
                    <div class="item" @click="changeSigleHandel()">
                        <img :src="SigleIcon" alt="单曲循环" title="单曲循环">
                    </div>
                    <div class="item">
                        <img :src="listicon" @click="getMusic" alt="获取音乐" title="获取音乐">
                    </div>
                </div>
            </div>
            <div class="play-bottom">
                <div class="play-pregress ao" id="progress"></div>
            </div>
        </div>
    </div>
    <div class="music-list">
        <h3>即将播放 <span>共{{ musicList.length }}首</span></h3>
        <ul class="ao" v-if="musicList.length > 0">
            <li v-for="(item,index) in musicList" :class="{ 'curActive': index == cur }" :key="item" @click="playHandle(item)">{{ item }}</li>
        </ul>
        <div class="ao music-list-empty" v-else>暂无播放列表</div>
    </div>
    <Notice v-if="msg" :message="msg" :type="infotype" />
</template>
<script setup>
import Notice from '@/components/Notice.vue';
import defimg from '@/assets/images/music.jpg'
import listicon from '@/assets/images/list.png'
import playicon from '@/assets/images/play.png'
import stopicon from '@/assets/images/stop.png'
import randomicons from '@/assets/images/random.png'
import sigleicon from '@/assets/images/sigle.png'
import randomicon from '@/assets/images/random_s.png'
import sigleicons from '@/assets/images/sigle_s.png'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { inject } from 'vue';
import audio from '@/utils/audio';
import { getName } from '@/utils/comfun.js'

const msg = ref('')
const infotype = ref('')
const musicList = ref([])
const cur = ref(0)
const sendMSG = (newmsg, type = 'success') => {
    msg.value = newmsg
    infotype.value = type
    setTimeout(() => {
        msg.value = ''
        infotype.value = ''
    }, 3500)
}
// 注入批量提供的方法对象
const { changeMusic } = inject('music');
const musicState = ref({
    play: false,
    random: false,
    sigle: false,
    auto: true,
    name: '',
    progress: 0,
})

const musicPlayIcon = ref('')
const changeMusicPlayIcon = (type) => {
    // 1 开始播放 0 暂停播放
    musicPlayIcon.value = type == 1 ? stopicon : playicon
}
const SigleIcon = ref('')
const changeSigle = (type) => {
    // 1 单曲循环 0 列表循环
    SigleIcon.value = type == 1 ? sigleicons : sigleicon
    if (type == 1) {
        // 单曲循环
        audio.setSigleToggle(true)
    } else {
        // 列表循环
        audio.setSigleToggle(false)
    }
}
const RandomIcon = ref('')
const changeRandom = (type) => {
    // 1 随机播放 0 顺序播放
    RandomIcon.value = type == 1 ? randomicons : randomicon
    if (type == 1) {
        // 随机播放
        audio.setRandomToggle(true)
    } else {
        // 顺序播放
        audio.setRandomToggle(false)
    }
}


const playHandle = async (item,index) => {
    cur.value = index
    musicState.value.name = item
    audio.playByName(item)
    setProgress()
    changeMusicPlayIcon(1)
}

let timer = null

const setProgress = () => {
    if (timer) clearInterval(timer)
    timer = setInterval(async () => {
        let prg = audio.getProgress()
        if (Number(prg).toFixed(0) == 100) {
            clearInterval(timer)
            // 播放完成时获取下一首的标题
            let title = await audio.getTitleAsync()
            if (title) {
                musicState.value.name = title
                // 刷新进度条
                setProgress()
            } else {
                musicState.value.name = '播放结束'
            }
        } else {
            changeProgress(prg)
        }
    }, 50)
}
const nextPlay = () => {
    audio.pause()
    audio.setNextSrc()
    musicState.value.name = audio.getTitle()
    if (musicState.value.name !=  '暂无音乐' &&  musicState.value.name  != '暂无播放') {
        audio.play()
        musicState.value.play = true
        changeMusicPlayIcon(1)
        setProgress()
    }
}
const changePlay = () => {
    if (audio && musicState.value.name  &&  audioSize > 0) {
        musicState.value.play = !musicState.value.play
        changeMusicPlayIcon(musicState.value.play)
        changeMusic(musicState.value.play)

        if (musicState.value.play) {
            setProgress()
        } else {
            clearInterval(timer)
        }
    } else {
        sendMSG('请设置音乐目录！', 'error')
    }
}

const changeSigleHandel = () => {
    musicState.value.sigle = !musicState.value.sigle
    changeSigle(musicState.value.sigle)
}

const changeRandomHandel = () => {
    musicState.value.random = !musicState.value.random
    changeRandom(musicState.value.random)
}
const changeProgress = (val) => {
    let prg = document.getElementById('progress')
    if (prg) {
        prg.style.setProperty('--wit', val + '%')
    }
}

let audioSize = 0
const getMusicList = async () => { 
    let res = localStorage.getItem('musicList') || null
    if(!res){
        res = await audio.getMusics()
        res = res.map(item => {
            return getName(item, ['.mp3','.flac'])
        })
        localStorage.setItem('musicList', JSON.stringify(res))
    }else{
        res = JSON.parse(res)
    }
    return res

}

const getMusic = async () => {
    if (!audio.paused) {
        audio.pause()
        musicPlayIcon.value = playicon
        musicState.value.play = false
        changeProgress(0)
    }

    let res = await audio.getMusics()
    if (res) {
        if (res.length) {
            sendMSG(`成功获取到${res.length}首音乐！`, 'success')
            audioSize = res.length
            res = res.map(item => {
                return getName(item, ['.mp3','.flac'])
            })
            musicList.value = res
            localStorage.setItem('musicList', JSON.stringify(res))
            await audio.init()
            let title = audio.getTitle()
            if (title) {
                musicState.value.name = title
            }

            if (audio && title) {
                setupSpaceListener(changePlay)
            }
        } else {
            sendMSG('未获取到音频资源，请更改目录！', 'error')
            musicState.value.name = '暂无音乐'
            audio.setSource('')
        }
    }
}
const init = async () => {
    musicList.value = await getMusicList()
    audioSize = musicList.value.length
    let res = audio.getAudioStatus()
    if (res) {
        musicState.value = res
        if (res.play) {
            changeMusicPlayIcon(1)
        }
    }
    let sigle = await audio.getSigle() || false
    if (sigle) {
        changeSigle(1)
    } else {
        changeSigle(0)
    }

    let random = await audio.getRandom() || false
    if (random) {
        changeRandom(1)
    } else {
        changeRandom(0)
    }
    let title = await audio.getTitle() || '暂无音乐'
    if (title) {
        musicState.value.name = title
    }

    if (!isFirst) {
        audio.pause()
        isFirst = true
    } else {
        let prgs = audio.getProgress() || 0
        if (prgs != 0) {
            setProgress()
        }
    }
    if (audio && title) {
        setupSpaceListener(changePlay)
    }
}

// 监听事件仅注册一次
let _listenerSetup = false
const setupSpaceListener = (callback, delay = 300) => {
    if (_listenerSetup) return
    let timeoutId;

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            // 阻止默认行为（可选）
            event.preventDefault();

            // 清除之前的定时器
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            // 设置新的定时器
            timeoutId = setTimeout(() => {
                callback();
                timeoutId = null; // 可选：重置 timeoutId
            }, delay);
        }
    });
    _listenerSetup = true
}

const bodyClick = () => {
    // 模拟点击，触发音频播放潜质
    let clickEvent = new MouseEvent('click', {
        bubbles: true,    // 事件是否会在DOM树中冒泡
        cancelable: true, // 事件是否可以被取消默认动作
        view: window      // 指定事件的 AbstractView (document.defaultView 对应于 window)
    });

    document.body.dispatchEvent(clickEvent);
}

const getcur = (name) => { 
    let cur = 0
    for  (let i = 0; i < musicList.value.length; i++) {
        if (musicList.value[i] == name) {
            cur = i
            break
        }
    }
    return cur
}


watch(()=> musicState.value.name ,(news,olds)=>{
    if (news && news != olds) {
        cur.value  = getcur(news)
    }
})

onMounted(() => {
    bodyClick()
    changeMusicPlayIcon(0)
    SigleIcon.value = sigleicon
    RandomIcon.value = randomicon
    setTimeout(() => {
        init()
    }, 300)
})
onUnmounted(() => {
    if (timer) clearInterval(timer)
})
</script>
<style scoped>
.music {
    height: 90px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    position: relative;
}

.title {
    font-size: 0.88rem;
    line-height: 1.8;
    max-width: 135px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.music-img {
    width: 70px;
    height: 70px;
    border-radius: 100px;
    margin-left: 10px;
    margin-right: 20px;
    border: 10px solid #333;
}

.play-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.4rem;
}

.play-btn {
    width: 155px;
    display: inline-flex;
    justify-content: flex-start;
    align-items: center;
}

.play-btn .item {
    margin-left: .88rem;
    cursor: pointer;
}

.one img {
    width: 40px;
    height: 40px;
}

.play-pregress {
    width: 290px;
    height: 6px;
    border-radius: 10px;
    position: relative;
    --wit: 0%;
}

.play-pregress::before {
    content: '';
    display: block;
    position: absolute;
    top: -1px;
    left: 0;
    border-radius: 10px;
    width: var(--wit);
    height: 7px;
    background: var(--mc);
}

.rotate {
    transform-origin: center center;

    /* 动画名称、持续时间、计时函数以及是否循环 */
    animation: rotate360 8s linear infinite;
}

@keyframes rotate360 {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.music-list h3{
    padding-top: 1rem;
    width: 100%;
    overflow: hidden;
    font-weight: 600;
    font-size: 1.04rem;
}
.music-list h3 span{
    float: right;
    margin-top: 0.5rem;
    font-size: 0.8rem;
    font-weight: 400;
}
.music-list ul,.music-list-empty{
    margin-top: .6rem;
    height: 216px;
    padding: 1rem;
    box-sizing: border-box;
    overflow-y: auto;
    border-radius: 1rem;
}
.music-list-empty{
    line-height: 180px;
    text-align: center;
    font-size: 0.8rem;
}
.music-list ul::-webkit-scrollbar{
    width: 8px;
}
.music-list ul li{
    font-size: .9rem;
    line-height: 1.8;
    padding: 0 0.6rem;
    margin-bottom: 0.2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
}
.music-list ul li:hover,.curActive{
    color: var(--mc);
    border-radius: 0.3rem;
    overflow: hidden;
    background: #d2d9ff;
}
.music-list ul li:hover{
   opacity: .68;
}
</style>