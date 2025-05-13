<script setup>
import { reactive } from 'vue'

const versions = reactive({ ...window.electron.process.versions })
</script>

<template>
  <div class="versions">
    <span class="electron-version">Electron v{{ versions.electron }}</span>
    <span class="chrome-version">Chromium v{{ versions.chrome }}</span>
    <span class="node-version">Node v{{ versions.node }}</span>
  </div>
</template>
<style  scoped>
  .versions{
    width: 100%;
    text-align: center;
    font-size: 12px;
    position: absolute;
    left: 0;
    bottom: 0;
    opacity: 0.4;
    background: linear-gradient(to bottom, rgba(211, 230, 255,0), rgba(255,255,255,0.5));
  }
  .versions span{
    margin: 0 10px;
  }
</style>