<template>
    <div class="ai-container">
        <div class="item" v-for="(item,index) in list" :key="index" @click="openLink(item.link)">
            <img :src="item.img" alt="">
            <p>{{ item.text }}</p>
        </div>
    </div>
</template>
<script setup>
import db from '@/assets/images/db.png'
import ds from '@/assets/images/ds.png'
import ty from '@/assets/images/ty.png'
import yb from '@/assets/images/yb.png'
import zp from '@/assets/images/zp.png'
import wx from '@/assets/images/wxyy.png'
const list = [
    {
        img: ds,
        text: 'DeepSeek',
        link: 'https://chat.deepseek.com/'   
    },
    {
        img: ty,
        text: '通义千问',
        link: 'https://www.tongyi.com/qianwen/'   
    },
    {
        img: wx,
        text: '文心一言',
        link: 'https://yiyan.baidu.com/'
    },
    {
        img: yb,
        text: '腾讯元宝',
        link: 'https://yuanbao.tencent.com/'
    },
    {
        img: zp,
        text: '智普清言',
        link: 'https://chatglm.cn/'
    },
    {
        img: db,
        text: '豆包',
        link: 'https://www.doubao.com/chat/'
    },
]

const openLink = (link)=>{
    window.open(link)
}
</script>
<style scoped>
    .ai-container{
        height: auto;
        overflow: hidden;
    }
    .item{
        padding: 1rem 0 0.2rem;
        width: 16.666%;
        float: left;
        text-align: center;
        cursor: pointer;
    }
    .item img{
        width: 48px;
        height: 48px;
    }
    .item p{
        font-size: 0.8rem;
    }
</style>