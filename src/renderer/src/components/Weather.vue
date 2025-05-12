<template>
    <img class="weather" :src="weathericon" alt="">
</template>
<script setup>
import { ref, onMounted } from 'vue'
import qing from '@/assets/weather/qing.png'
import bingbao from '@/assets/weather/qing.png'
import daxue from '@/assets/weather/daxue.png'
import dayu from '@/assets/weather/dayu.png'
import duoyun from '@/assets/weather/duoyun.png'
import leizhenyu from '@/assets/weather/leizhenyu.png'
import wu from '@/assets/weather/wu.png'
import xiaoxue from '@/assets/weather/xiaoxue.png'
import xiaoyu from '@/assets/weather/xiaoyu.png'
import yin from '@/assets/weather/yin.png'
import yuxue from '@/assets/weather/yuxue.png'
import zhongxue from '@/assets/weather/zhongxue.png'
import zhongyu from '@/assets/weather/zhongyu.png'

const props = defineProps({
    weather:{
        type:String,
        default:'qing',
    }
})

const weatherList = {
    qing,bingbao,daxue,dayu,duoyun,leizhenyu,wu,xiaoyu,xiaoxue,yin,yuxue,zhongyu,zhongxue
}

const weathericon = ref(null)
onMounted(()=>{
    weathericon.value = weatherList[props.weather]
})

</script>
<style scoped>
    .weather{
        width: 2.6rem;
        height: 2.6rem;
        margin-left: -1.6rem;
        margin-top: 0.6rem;
    }
</style>