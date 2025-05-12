<template>
    <div class="wrapper tu">
        <div v-if="!wrapPath" class="none">暂未设置壁纸图片资源路径 <span @click="router.push('/set')">前往设置</span></div>
        <div v-if="wrapPath" class="wrap">
            <ul v-show="imgList.length > 0" ref="imageContainer">
                <li v-for="(item, index) in imgList" :key="index">
                    <img :src="defimg" :data-src="item.url" class="lazy-load">
                    <p> 设置 <span @click="setWin(item)">桌面壁纸</span> <span @click="setApp(item)">应用壁纸</span></p>
                </li>
            </ul>
            <div v-if="imgList.length == 0" class="none">当前路径暂未找到壁纸图片资源</div>
        </div>
    </div>
    <Notice v-if="msg" :message="msg" :type="infotype" />
</template>
<script setup>
import Notice from '@/components/Notice.vue';
import { ref, onMounted,watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { setAppBG } from '@/utils/comfun'
import defimg from '@/assets/images/loading.gif'
const router = useRouter()

const msg = ref('')
const infotype = ref('')
const imageContainer = ref(null)
const io = ref(null)
const sendMSG = (newmsg, type = 'success') => {
    msg.value = newmsg
    infotype.value = type
    setTimeout(() => {
        msg.value = ''
        infotype.value = ''
    }, 3500)
}

let wrapPath = ref(null)
let imgList = ref([])


// 检查 imgList 是否已加载
watch(()=>imgList.value, (newList) => {
  if (newList.length > 0) {
    initLazyLoading();
  }
});
const initLazyLoading = () => {
    if (!io.value) {
        io.value = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const imgElement = entry.target;
                    imgElement.src = imgElement.dataset.src;
                    io.value.unobserve(imgElement); // 图片加载后取消观察
                }
            });
        }, {
            // 可以根据需要调整观察选项
            rootMargin: '0px',
            threshold: 0.1
        });
    }

    // 观察所有懒加载图片
    const images = document.querySelectorAll('.lazy-load');
    images.forEach((img) => {
        io.value.observe(img);
    });
};

onMounted(async () => {
    wrapPath.value = await api.storage.get('warpperPath') || null
    if (wrapPath.value) {
        let list = await api.invoke('get-imgs')
        imgList.value = list.map(item => {
            return {
                src: item,
                url: 'asset://' + encodeURIComponent(item)
            }
        })
        setTimeout(()=>{
            initLazyLoading()
        },20)
    }
})


const setWin = (item) => {
    api.send('set-wallpaper', item.src)
    api.storage.set('windowBG', item.src)
    sendMSG('设置桌面壁纸成功', 'success')
}

const setApp = (item) => {
    setAppBG(item.url)
    api.storage.set('appBG', item.src)
    sendMSG('设置应用壁纸成功', 'success')
}
</script>

<style scoped>
.wrapper {
    padding: 1rem;
    box-sizing: border-box;
    border-radius: var(--radius);
}

.wrapper ul {
    width: 100%;
    height: auto;
    max-height: calc(100vh - 140px);
    overflow: hidden;
    overflow-y: auto;
}

.wrapper ul li {
    width: 32%;
    margin-right: 2%;
    margin-bottom: 1rem;
    float: left;
    overflow: hidden;
}

.wrapper ul li:nth-of-type(3n) {
    margin-right: 0;
}

.wrapper ul li p {
    margin: 0;
    padding: 0.2rem 0;
    font-size: 0.8rem;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.wrapper ul li p span {
    display: inline-block;
    margin-left: 0.5rem;
    font-size: 0.6rem;
    padding: 0.2rem 0.6rem;
    color: var(--textColor);
    border: 1px solid var(--textColor);
    border-radius: var(--radius);
    cursor: pointer;
}

.wrapper ul li img {
    width: 100%;
    border-radius: 8px;
    height: 24vh;
    object-fit: cover;
}

.none {
    padding: 1rem;
    text-align: center;
    line-height: 30vh;
}

.none span {
    color: var(--mc);
    cursor: pointer;
}
</style>