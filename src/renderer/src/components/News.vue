<template>
    <div class="new-container">
        <ul>
            <li v-for="(item,index) in news" :key="index">
                <a :href="item.link" target="_blank" rel="noopener noreferrer"><span>{{item.rank}}</span> <b> {{item.title}}</b></a>
            </li>
        </ul>
    </div>
</template>
<script setup>
const props  = defineProps({
    news:{
        type:Array,
        default:[]
    }
})
</script>
<style scoped>
    .ai-container{
        height: auto;
        overflow: hidden;
    }
    ul{
        padding: 1rem ;
        box-sizing: border-box;
        overflow: hidden;
        list-style: none;
        max-height: 26vh;
        overflow-y: auto;
        margin: 0;
    }
    li{
        width: 48%;
        float: left;
        margin-right: 2;
        font-size: 0.9rem;
        line-height: 1.8;
    }
    li a{
        color: var(--textColor);
        text-decoration: none;
    }
    li a span{
        display: inline-block;
        width: 1.2rem;
        line-height: 1.2rem;
        height: 1.2rem;
        border-radius: 0.2rem;
        text-align: center;
        background: #cdd9f1;
        color: #fff;
        font-size: 0.7rem;
    }
    li:nth-of-type(1) a span{
        background: red;
    }
    li:nth-of-type(2) a span{
        background: rgb(255, 104, 4);
    }
    li:nth-of-type(3) a span{
        background: #ffbc00;
    }
    li:nth-of-type(4) a span{
        background: rgb(50, 202, 4);
    }
    li:nth-of-type(5) a span{
        background: #8068ff;
    }
    li:nth-of-type(6) a span{
        background: rgb(4, 29, 255);
    }
    li a:hover{
        color: var(--mc);
    }
    li:nth-of-type(2n){
        margin-right: 0;
    }
</style>