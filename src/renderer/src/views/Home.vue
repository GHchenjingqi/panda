<template>
    <div class="home">
        <div class="home-header">
            <div class="item tu w1">
                <div class="mark">
                    <img :src="site" alt="">
                    <span>{{weather.city}}</span>
                    <span>{{ weather.reportTime?.substr(0,10) }}</span>
                </div>
                <div class="weather">
                    <Weather v-if="weather.wt" :weather="weather.wt" />
                    <div class="wea-box">
                        <b>{{ weather.temperature}}</b>
                        <p>{{  weather.weather  }} {{ weather.wind }}</p>
                    </div>
                </div>
            </div>
            <div class="item tu w1">
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
import { pathList  } from 'https://ghchenjingqi.github.io/home/public/pathList.js'
import { initWeather,weatherList } from '@/utils/weather.js'
import { useRouter } from 'vue-router'
const router = useRouter()

const weather = ref({wt: '',})
const knows = ref(0)
const news = ref([])

const getNewsHandle = async ()=>{
    news.value = await api.invoke('get-news') 
}
let timer = null
onMounted( async()=>{
    knows.value = pathList.length
    const { data } = await initWeather()
    weather.value = data
    weather.value.wt = weatherList[data.weather]
    getNewsHandle()
    timer = setTimeout(()=>{
        getNewsHandle()
    },1000 * 60 * 5)
})

 onBeforeUnmount(()=>{
    clearInterval(timer)
 })
const goyuque = ()=>{
    router.push('/nmd')
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
    z-index: 9999;
}
</style>