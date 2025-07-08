<template>
    <div class="wrapper tu">
        <h3>壁纸中心 <span v-if="imgList.length" @click="refresh">
                <img class="refresh" :class="loading2 ? 'rotate' : ''" :src="flush" alt="">刷新</span>
        </h3>
        <div v-if="!wrapPath" class="none">暂未设置壁纸图片资源路径 <span @click="router.push('/set')">前往设置</span></div>
        <div v-if="wrapPath" class="wrap">
            <ul v-show="imgList.length > 0" ref="imageContainer">
                <li v-for="(item, index) in showImgs" :key="index">
                    <img :src="defimg" :data-src="item.url" class="lazy-load">
                    <p> 设置 <span @click="setWin(item)">桌面壁纸</span> <span @click="setApp(item)">应用壁纸</span></p>
                </li>
                <div class="wrap-footer"> {{ !isEnd ? '正在加载中...' : '已全部加载！'}} </div>
            </ul>
            <div v-if="imgList.length == 0" class="none">当前路径暂未找到壁纸图片资源</div>
        </div>
    </div>
    <Notice v-if="msg" :message="msg" :type="infotype" />
</template>

<script setup>
import Notice from '@/components/Notice.vue';
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { setAppBG } from '@/utils/comfun'
import defimg from '@/assets/images/loading.gif'
import flush from '@/assets/images/flush.png'
const router = useRouter()

const msg = ref('')
const infotype = ref('')
const imageContainer = ref(null)
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
let io = null
const initLazyLoading = () => {
    if (!io) {
        io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const imgElement = entry.target;
                    imgElement.src = imgElement.dataset.src;
                    io.unobserve(imgElement); // 图片加载后取消观察
                }
            });
        }, {
            rootMargin: '0px 0px -100px 0px',
            threshold: 1
        });
    }
    // 观察所有懒加载图片
    const images = document.querySelectorAll('.lazy-load');
    images.forEach((img) => io.observe(img));
};

const getWrappers = async () => {
    let wraps = window.localStorage.getItem('warppers') || null
    if (!wraps || wraps == '[]') {
        wraps = await api.invoke('get-imgs') || []
        window.localStorage.setItem('warppers', JSON.stringify(wraps))
    } else {
        wraps = JSON.parse(wraps)
    }
    return wraps
}
const loading2 = ref(false)
const page = ref(1)
const pagesize = 9
let showImgs = computed(() => {
    return imgList.value.slice(0, page.value * pagesize)
})

const isEnd = ref(false)
let endo = null
const initLoadEnd = ()=>{
    // console.log('initLoadEnd')
    if (!endo) {
         endo = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // console.log('initLoadEnd:12312')
                    if (page.value * pagesize < imgList.value.length) {
                        page.value++
                        nextTick(() => {
                            initLazyLoading()
                        })
                        // console.log('page', page.value)
                    }else{
                        isEnd.value = true
                        endo.unobserve(box);
                    }
                }
            });
        }, {
            root: document.querySelector('.wrap'),
            rootMargin: '0px 0px 20px 0px',
            threshold: 0.1
        });
    }
    const box = document.querySelector('.wrap-footer');
    endo.observe(box); 
}

const refresh = async () => {
    loading2.value = true
    isEnd.value = false
    page.value = 1
    window.localStorage.removeItem('warppers')
    let wraps = await getWrappers()
    imgList.value = wraps.map(item => {
        return {
            src: item,
            url: 'asset://' + encodeURIComponent(item)
        }
    })
    nextTick(() => {
        initLazyLoading()
        initLoadEnd()
    })
    setTimeout(() => {
        loading2.value = false
    }, 1500)
}
onMounted(async () => {
    wrapPath.value = await api.storage.get('warpperPath') || null
    if (wrapPath.value) {
        await refresh()
    }
})
onUnmounted(() => {
    if (io) {
        io.disconnect();
        io = null;
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
.wrap-footer{
    display: block;
    float: left;
    width: 100%;
    text-align: center;
    padding: 10px;
    color: #999;
    font-size: 0.7rem;
}

.wrapper {
    padding: 1rem;
    box-sizing: border-box;
    border-radius: var(--radius);
}

.wrapper h3 {
    font-weight: 600;
    margin-bottom: 1rem;
    font-size: 1rem;
    font-family: '微软雅黑';
}

.wrapper h3 span {
    float: right;
    font-size: 0.7rem;
    color: var(--textColor);
    cursor: pointer;
}

.wrapper ul {
    width: 100%;
    height: auto;
    max-height: calc(100vh - 140px - 4rem);
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

.refresh {
    vertical-align: middle;
    margin-right: 3px;
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
    height: 24vh;
    border-radius: 8px;
    object-fit: cover;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
}

.wrapper ul li img:hover {
    transform: scale(1.05);
    border-radius: 8px;
}

.load-more-trigger {
    height: 1px;
    width: 100%;
    visibility: hidden;
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

.refresh.rotate {
    animation: spin 1.5s linear infinite;
    /* 持续旋转 */
    transform-origin: center center;
    /* 绕中心旋转 */
}

/* 关键帧动画 */
@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>