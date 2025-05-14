<template>
  <h3 class="sub-class">导航器</h3>
  <div class="sub-ml">
    <ul>
      <li v-for="item in menuslist" :key="item.id" :class="item.class" @click="directoryClick(item)">
        <span :id="item.id" :class="{'active': curid == item.id}">{{ item.title }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref,watch,onMounted,onUnmounted } from 'vue';
const  curid = ref('')
const props = defineProps({
  items: Array,
})
const handleFlag = ref(false)

const box = document.querySelector(".know-box")
const menuslist = ref([])

watch(() =>  props.items, (newVal) => {
  if (newVal && newVal.length>0) {
      menuslist.value = newVal
      if (menuslist.value && menuslist.value.length>0) {
          curid.value = menuslist.value[0].id
      }
  }
}, {
  immediate: true
})

const directoryClick = (anchor) => {
  curid.value = anchor.id

  box.scrollTo({
	  top: anchor.pixel, // 竖向滚动距离
	  behavior: "smooth" // 平滑滚动
	})
}

const ml = ref(null)
const scrollEventListener = () => {
    let pixel = box.scrollTop + box.offsetTop + 1 + 135;
    const title = menuslist.value.reduce((prev, curr) => {
        if (curr.pixel <= pixel && (prev === null || pixel - curr.pixel < pixel - prev.pixel)) {
            return curr;
        }
        return prev;
    }, null);
    if (title) {
        let res = (ml.value.scrollHeight * title.pixel) / box.scrollHeight - 10
        ml.value.scrollTo({
          top: res, // 竖向滚动距离
          behavior: "smooth" // 平滑滚动
        })
        curid.value = title.id
    }
    handleFlag.value = true
}

const addScrollEventListener = ()=>{
  box.addEventListener('scroll', scrollEventListener,{ passive: true })
}

onMounted(()=>{
  menuslist.value = props.items
  ml.value = document.querySelector('.sub-ml')

  if (menuslist.value && menuslist.value.length>0) {
    curid.value = menuslist.value[0].id
  }
  addScrollEventListener()
})

onUnmounted(()=>{
    if(  handleFlag.value ){
        box.removeEventListener('scroll', scrollEventListener)
        handleFlag.value = false
    }
})


</script>

<style scoped>
.sub-ml {
  width: 100%;
  height: auto;
  margin-top: 1rem;
  min-height: 50px;
  max-height: 400px;
  overflow: hidden;
  overflow-y: auto;
}
.sub-ml::-webkit-scrollbar{
    display: none;
}

ul,
li {
  margin: 0;
  padding: 0;
}

li {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  position: relative;
  cursor: pointer;
  padding-left: 0.3rem;
  font-size: 16px;
  line-height: 2;
}

li .active{
  color: var(--mc)
}
li:hover{
  color: var(--mc)
}

li.directory-h3 span{
  margin-left: 1rem;
}
li.directory-h4 span{
  margin-left: 1.4rem;
}
li.directory-h5 span{
  margin-left: 1.8rem;
}
li.directory-h6 span{
  margin-left: 2.2rem;
}
.sub-class{
  margin-top: -10px;
  font-size: 16px;
}

</style>
