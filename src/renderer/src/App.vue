<script setup>
import { ref, onMounted, onBeforeMount, watch, onUnmounted } from 'vue';
import Layout from '@/components/Layout.vue';
import { RouterView } from 'vue-router';
import { configs } from '@renderer/config.js'
import { useRoute } from 'vue-router'
import { provide } from 'vue';
import audio from './utils/audio';
import customArrow from '@/assets/images/mousepointer.png';
import customHand from '@/assets/images/handpointer.png';
const route = useRoute()
const allScreens = configs().settings.allscreenPath
const isScreenFlag = ref(false)

const getScreenFlag = () => {
  const path = route.path
  return allScreens.includes(path)
}

const playMusic = async () => {
  await audio.play()
}

const pauseMusic = () => {
  audio.pause()
}

const changeMusic = (flag) => {
  if (flag) {
    playMusic()
  } else {
    pauseMusic()
  }
}

provide('music', { changeMusic });

onMounted(() => {
  isScreenFlag.value = getScreenFlag()
  window.isFirst = false
})
watch(() => route.path, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    isScreenFlag.value = getScreenFlag()
  }
});
onBeforeMount(async () => {
  await audio.init()
  window.localStorage.clear()

  // 设置CSS变量
  document.documentElement.style.setProperty('--customarrow', `url(${customArrow})`);
  document.documentElement.style.setProperty('--custom-hand', `url(${customHand})`);
})

onUnmounted(() => { })
</script>

<template>
  <Layout :allScreen="isScreenFlag" :class="isScreenFlag ? 'all-screen' : ''">
    <router-view v-slot="{ Component }">
      <transition name="router-fade" mode="out-in">
        <keep-alive>
          <div>
            <component :is="Component" />
          </div>
        </keep-alive>
      </transition>
    </router-view>
  </Layout>
</template>
<style>
#app{
  cursor: url(--customarrow), auto;
}

#app a, #app button,#app img:hover ,.list li:hover, .wrapper ul li p span:hover{
  cursor: var(--custom-hand), pointer;
}
</style>
<style scoped>
.all-screen {
  background: #fff;
  border-radius: 0;
}
</style>