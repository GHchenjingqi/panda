<template>
    <div class="home">
        <div class="home-header">
            <div class="item tu w1">
                <div class="mark">
                    <img :src="site" alt="">
                    <span>{{weather.city?.substr(0, weather.city.length - 1)}}</span>
                    <span style="font-size: 0.72rem;">{{ weather.reportTime }}</span>
                    <img class="refresh" :class="loading ? 'rotate' : ''" @click="updataWeatherHandle" :src="flush" alt="">
                </div>
                <div class="weather">
                    <Weather v-if="weather.wt" :weather="weather.wt" />
                    <div class="wea-box">
                        <b>{{ weather.temperature}}</b>
                        <p>{{  weather.weather  }} {{ weather.wind }}</p>
                    </div>
                </div>
            </div>
            <div class="item tu w1 point">
                <div class="mark">
                    <span>知识库 <i>{{knows}}</i> 篇</span>
                </div>
                <div class="add-box" @click="goyuque">
                    <img :src="yumao" alt="">
                    <span>写一篇</span>
                </div>
            </div>
            <div class="item tu w2 music-box">
                <Music />
            </div>
        </div>
        <div class="home-box tu">
            <h3>AI编程助手</h3>
            <AI />
        </div>
        <div class="home-box tu" v-if="news.length">
            <h3>今日热门</h3>
            <News :news="news"/>    
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Weather from '@/components/Weather.vue'
import AI from '@/components/AI.vue'
import News from '@/components/News.vue'
import Music from '@/components/Music.vue'
import yumao from '@/assets/images/yumao.png'
import site from '@/assets/images/site.png'
import flush from '@/assets/images/flush.png'

import { pathList  } from 'https://ghchenjingqi.github.io/home/public/pathList.js'
import { initWeather,weatherList, updataWeather } from '@/utils/weather.js'

const weather = ref({wt: '',})
const knows = ref(0)
const news = ref([])

const loading = ref(false)
const updataWeatherHandle = async ()=>{ 
    loading.value = true
    const { data } = await updataWeather()
    debugger 
    weather.value = data
    weather.value.wt = weatherList[data.weather]
    setTimeout(()=>{ 
        loading.value  = false
    },1500)
}
const getNewsHandle = async ()=>{
    news.value = await api.invoke('get-news') 
}
let timer = null
onMounted( async()=>{
    loading.value = true
    knows.value = pathList.length
    const { data } = await initWeather()
    console.log("天气",data)
    weather.value = data
    weather.value.wt = weatherList[data.weather]
    setTimeout(()=>{ 
        loading.value  = false
    },1500)
    getNewsHandle()
    timer = setTimeout(()=>{
        getNewsHandle()
    },1000 * 60 * 5)
})

 onBeforeUnmount(()=>{
    clearInterval(timer)
 })
const goyuque = ()=>{
    window.api.send('createMdEditWindow')
    // router.push('/nmd')
}
</script>
<style scoped>
.home{
    box-sizing: border-box;
}
.home-header{
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 2fr;
    height: 120px; box-sizing: border-box;
    gap:0 20px;
}
.item{
    border-radius: var(--radius);
    height:120px;
    box-sizing: border-box;
    padding: 1rem;
    position: relative;
    overflow: hidden;
}
.mark{
    margin-top: -0.4rem;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    position: relative;
}
.mark span{
    margin-right: 0.3rem;
}
.mark span i{
    font-style: normal;
    font-size: 1rem;
    color: var(--mc);
}
.mark img{
    margin-right: 0.3rem;
}
.refresh{
    position: absolute;
    right: -.4rem;
    opacity: 0.6;
    cursor: pointer;
}
.refresh.rotate{
    animation: spin 1.5s linear infinite; /* 持续旋转 */
  transform-origin: center center;   /* 绕中心旋转 */
}
/* 关键帧动画 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.add-box{
    padding-top: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
}
.add-box img{
    margin-right: 1rem;
    width: 2.4rem;
    height: auto;
}
.add-box span{
    font-size: 1.2rem;
}
.weather {
    display: flex;
    justify-content: center;
    align-items: center;
}
.wea-box{
    padding-top: .6rem;
    margin-left: 1rem;
}
.wea-box b{
    font-size: 2.4rem;
    font-weight: 500;
    line-height: 1;
}
.wea-box p{
    font-size: 0.8rem;
    font-weight: 400;
    motion-path: 0.4rem;
}
.home-box{
    margin-top: 1rem;
    height: auto;
    border-radius: var(--radius);
    width: 100%;
    box-sizing: border-box;
    padding: 1rem;
}
.home-box h3{
    font-size: 1rem;
    font-weight: 600;
    font-family: '微软雅黑';
}

.music-box:hover{
    position: sticky;
    height: 400px;
    transition: all 0.5s;
    box-shadow: 3px 4px 9px rgba(47, 75, 134, 0.15);
    z-index: 9999;
}
</style>