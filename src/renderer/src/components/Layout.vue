<template>
  <div class="layout" v-if="!allScreen">
    <Header />
    <div class="main">
        <Menu />
        <div class="content">
            <slot></slot>
        </div>
    </div>
    <Versions />
  </div>
  <div class="laybox" v-else>
    <slot></slot>
  </div>
</template>
<script setup>
import Header from '@/components/Header.vue';
import Versions from '@/components/Versions.vue'
import Menu from '@/components/Menu.vue'
import { onMounted} from 'vue';

const props = defineProps({
    allScreen:{
        type: Boolean,
        default: false
    }
})
const setAppBG = async ()=>{
    let app  = document.querySelector('#app')
    const src = await api.storage.get('appBG') || null
    if(app && src){
        const paths =  'asset://' + encodeURIComponent(src)
        app.style.backgroundImage = `url('${paths}')`
    }

    let theme = await api.storage.get('theme') || 'light' 
    if (theme=='dark') {
       document.documentElement.classList.toggle('dark');
    }
}
onMounted(()=>{
    setAppBG()
})
</script>
<style scoped>
    .layout{
        width: 100%;
        height: 100%;
        position: relative;
    }
    .main{
        width: 100%;
        height: calc(100% - 50px - 30px);
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
    }
    .content{
        width: calc(100% - 120px);
        padding: 1rem 1rem 1rem 0;
        box-sizing: border-box;
    }
    .laybox{
        padding: 1rem;
        box-sizing: border-box;
    }
</style>