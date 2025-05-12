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
    bottom: 5px;
    opacity: 0.4;
  }
  .versions span{
    margin: 0 10px;
  }
</style>