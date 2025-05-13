<script setup>
import { ref } from 'vue';
// 节流函数优化频繁的 IPC 通信
const throttleMove = (fn, delay = 16) => {
  let lastCall = 0
  return (...args) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      fn(...args)
      lastCall = now
    }
  }
}

const isKeyDown = ref(false)
const dinatesX = ref(0)
const dinatesY = ref(0)
const mousedown = (e) => {
  isKeyDown.value = true
  dinatesX.value = e.x
  dinatesY.value = e.y
  // 获取初始鼠标屏幕坐标
  document.onmousemove = throttleMove((ev) => {
    if (isKeyDown.value) {
      // 获取移动后的鼠标屏幕坐标
      let x = ev.screenX - dinatesX.value
      let y = ev.screenY - dinatesY.value
      // 计算鼠标移动后的坐标差值
      const data = {
        appX: x,
        appY: y
      }
      window.api.invoke('move',data)
    }
  })
  document.onmouseup = () => {
    isKeyDown.value = false
  }
}

const gogit = () => {
  window.open('https://github.com/GHchenjingqi')
}
let isToggling = false; // 防抖标志
const oper = (type) => {
  if (isToggling) return;
  isToggling = true;
  window.api.invoke('oper',type);
  setTimeout(() => { isToggling = false; }, 300);
}
</script>
<template>
  <div class="header"  @mousedown="mousedown">
    <div class="oper">
      <img src="@/assets/images/git.png" class="git" @click="gogit" alt="">
      <img src="@/assets/images/min.png" @click="oper('min')" alt="">
      <!-- <img src="@/assets/images/max.png" @click="oper('max')" alt=""> -->
      <img src="@/assets/images/out.png" @click="oper('close')" alt="">
    </div>
  </div>
</template>
<style scoped>
    .header{
        height: 50px;
        user-select: none;
        background: transparent;
    }
    .oper{
      padding-top: 10px;
      text-align: right;
      padding-right: 0.5rem;
      background: linear-gradient(to bottom, rgba(211, 230, 255, 0.5), rgba(255,255,255,0));
    }
    .oper img{
      padding: 0.5rem;
      margin: 0 0.2rem;
      cursor: pointer;
      width: 36px;
    }
    .oper img.git{
      margin-right: 1rem;
    }
</style>