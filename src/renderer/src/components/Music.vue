<template>
    <div class="music">
        <img class="music-img " :class="{ 'rotate' : musicState.play }" :src="defimg" alt="">
        <div class="play-box">
            <div class="play-top">
                <div class="title" @click="nextPlay">{{ musicState.name }}</div>
                <div class="play-btn">
                    <div class="item one" @click="changePlay">
                        <img :src="musicPlayIcon"  alt="">
                    </div>
                    <div class="item">
                        <img :src="RandomIcon" @click="changeRandomHandel()" alt="">
                    </div>
                    <div class="item"  @click="changeSigleHandel()" >
                        <img :src="SigleIcon" alt="">
                    </div>
                    <div class="item">
                        <img :src="listicon" @click="getMusic" alt="">
                    </div>
                </div>
            </div>
            <div class="play-bottom">
                <div class="play-pregress ao" id="progress"></div>
            </div>
        </div>
    </div>
</template>
<script setup>
    import defimg from '@/assets/images/music.jpg'
    import listicon from '@/assets/images/list.png'
    import playicon from '@/assets/images/play.png'
    import stopicon from '@/assets/images/stop.png'
    import randomicons from '@/assets/images/random.png'
    import sigleicon from '@/assets/images/sigle.png'
    import randomicon from '@/assets/images/random_s.png'
    import sigleicons from '@/assets/images/sigle_s.png'
    import { ref, onMounted, onUnmounted } from 'vue'
    import { inject } from 'vue'; 
    import audio from '@/utils/audio';


    // 注入批量提供的方法对象
    const { changeMusic } = inject('music');
    const musicState = ref({
        play: false,
        random: false,
        sigle: false,
        auto:true,
        name: '',
        progress: 0,
    }) 

    const musicPlayIcon = ref('')
    const changeMusicPlayIcon = (type)=>{
        // 1 开始播放 0 暂停播放
        musicPlayIcon.value = type == 1 ? stopicon : playicon
    }
    const SigleIcon = ref('')
    const changeSigle = (type)=>{
        // 1 单曲循环 0 列表循环
        SigleIcon.value = type == 1 ? sigleicons : sigleicon
        if(type == 1){
            // 单曲循环
            audio.setSigleToggle(true)
        }else{
            // 列表循环
            audio.setSigleToggle(false)
        }
    }
    const RandomIcon = ref('')
    const changeRandom = (type)=>{
        // 1 随机播放 0 顺序播放
        RandomIcon.value = type == 1 ? randomicons : randomicon
        if(type == 1){
            // 随机播放
            audio.setRandomToggle(true)
        }else{
            // 顺序播放
            audio.setRandomToggle(false)
        }
    }

    let timer = null

    const setProgress = ()=>{ 
        if (timer)  clearInterval(timer)
        timer = setInterval(()=>{
            let prg = audio.getProgress()
            if  (Number(prg).toFixed(0) == 100) {
                let title = audio.getTitle()
                if(title){
                    musicState.value.name  = title
                    setProgress()
                }
                else{
                    clearInterval(timer)
                }
            }else{
                changeProgress(prg)
            }
        },50)
    }
    const nextPlay =  ()=>{ 
        audio.pause()
        audio.setNextSrc()
        audio.play()
        musicState.value.name = audio.getTitle()
        setProgress()
    }
    const changePlay = ()=>{
        if(audioSize >0 ){
            musicState.value.play = !musicState.value.play
            changeMusicPlayIcon(musicState.value.play)
            changeMusic(musicState.value.play)

            if (musicState.value.play) {
                setProgress()
            }else{
                clearInterval(timer)
            }
        }else{
            alert(`请设置音乐目录！`)
        }
    }
 
    const changeSigleHandel = ()=>{
        musicState.value.sigle = !musicState.value.sigle
        changeSigle(musicState.value.sigle)
    }

    const changeRandomHandel = ()=>{
        musicState.value.random = !musicState.value.random
        changeRandom(musicState.value.random)
    }
    const changeProgress = (val)=>{ 
        let prg = document.getElementById('progress')
        if (prg) {
            prg.style.setProperty('--wit', val + '%')
        }
    }

    const getMusic = async()=>{
        let res = await audio.getMusics()
        if  (res) { 
            if (res.length) {
                alert(`成功获取到${res.length}首音乐！`)
                audio.init()
                let title = audio.getTitle()
                debugger
                if(title){
                    musicState.value.name  = title
                }
            }else{
                alert(`请设置音乐目录！`)
            }
        }
    }
    let audioSize = 0
    const init = async ()=>{ 
        let res  = await audio.getMusics()
        audioSize = res.length
        res = audio.getAudioStatus()
        if (res) {
            musicState.value = res
            if (res.play) {
                changeMusicPlayIcon(1)
            }
        }
        let sigle = await audio.getSigle() || false
        if (sigle) {
            changeSigle(1)
        }else{
            changeSigle(0)
        }

        let random = await audio.getRandom() || false
        if (random) {
            changeRandom(1)
        }else{
            changeRandom(0)
        }
        let title = audio.getTitle()
        if(title){
            musicState.value.name  = title
        }
        if(!isFirst){
            audio.pause()
            isFirst  = true
        }else{
            let prgs = window.localStorage.getItem('progress') || 0
            if (prgs != 0) {
                setProgress()
            }
        }
    }
    const bodyClick = ()=>{
        // 模拟点击，触发音频播放潜质
        let clickEvent = new MouseEvent('click', {
            bubbles: true,    // 事件是否会在DOM树中冒泡
            cancelable: true, // 事件是否可以被取消默认动作
            view: window      // 指定事件的 AbstractView (document.defaultView 对应于 window)
        });
       
        document.body.dispatchEvent(clickEvent);
    }
    onMounted(()=>{
        bodyClick()
        changeMusicPlayIcon(0)
        setTimeout(()=>{
            init()
        }, 300)
    })
    onUnmounted(()=>{
        let prg = audio.getProgress()
        if(prg) window.localStorage.setItem('progress', prg)
        if(timer) clearInterval(timer)
    })
</script>
<style scoped>
.music{
    height: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}
.title {
    font-size: 0.88rem;
    line-height: 1.8;
    max-width: 135px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.music-img{
    width: 70px;
    height: 70px;
    border-radius: 100px;
    margin-left: 10px;
    margin-right: 20px;
    border: 10px solid #333;
}
.play-top{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.4rem;
}
.play-btn{
    width: 155px;
    display: inline-flex;
    justify-content: flex-start;
    align-items: center;
}
.play-btn .item{
    margin-left: .88rem;
    cursor: pointer;
}
.one img{
    width: 40px;
    height: 40px;
}
.play-pregress {
    width: 290px;
    height: 10px;
    border-radius: 10px;
    position: relative;
    --wit:0%;
}
.play-pregress::before{
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 10px;
    width: var(--wit);
    height:10px;
    background: var(--mc);
}

.rotate{
    transform-origin: center center;
  
    /* 动画名称、持续时间、计时函数以及是否循环 */
    animation: rotate360 8s linear infinite;
}
@keyframes rotate360{
    from{
        transform: rotate(0deg);
    }
    to{
        transform: rotate(360deg);
    }
}
</style>