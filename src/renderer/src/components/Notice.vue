<template>
    <div class="notice" :class="type">
      {{ message }}
    </div>
</template>
<script setup>
import { ref ,onMounted} from 'vue'
const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'info',
  },
  duration: {
    type: Number,
    default: 3000, // 默认显示 3 秒
  },
})
const  visible = ref(true)
onMounted(()=>{
    setTimeout(() => {
        visible.value = false
    }, props.duration)
})
</script>
<style scoped>
.notice {
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  background-color: #323232;
  color: #fff;
  padding:4px 20px;
  border-radius: 4px;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-size: 14px;
}
.notice.info {
  background-color: #dfdfdf;
}
.notice.success {
  background-color: #4385ff;
}
.notice.warning {
  background-color: #ff9800;
}
.notice.error {
  background-color: #f44336;
}
</style>