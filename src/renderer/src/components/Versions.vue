<script setup>
import { reactive,ref, onMounted } from 'vue'
const versions = reactive({ ...window.electron.process.versions })
const appVersion = ref('')
onMounted(()=>{
    window.api.getVersion( (data) => {
        console.log(data)
        appVersion.value = data
    })
})
</script>

<template>
  <div class="versions">
    <span class="electron-version">Electron v{{ versions.electron }}</span>
    <span class="chrome-version">Chromium v{{ versions.chrome }}</span>
    <span class="node-version">Node v{{ versions.node }}</span>
    <span class="node-version">App by chenxiaozhi v{{ appVersion || "1.0"}}</span>
  </div>
</template>
<style  scoped>
  .versions{
    width: 100%;
    text-align: center;
    font-size: 12px;
    position: absolute;
    left: 0;
    bottom: 5px;
    opacity: 0.4;
    background: linear-gradient(to bottom, rgba(211, 230, 255,0), rgba(255,255,255,0.5));
  }
  .versions span{
    margin: 0 10px;
  }
</style>