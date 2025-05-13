<template>
    <div class="set ao">
        <div class="item">
            <label for="musicPath">音乐路径</label>
            <input type="text" v-model="form.musicPath">
            <button class="choose" @click="handleDirectorySelect('music')">选择</button>
        </div>
        <div class="item">
            <label for="warpperPath">壁纸路径</label>
            <input type="text" v-model="form.warpperPath">
            <button class="choose" @click="handleDirectorySelect('warpper')">选择</button>
        </div>
        <div class="item">
            <label for="mdPath">MD路径</label>
            <input type="text" v-model="form.mdPath">
            <button class="choose" @click="handleDirectorySelect('md')">选择</button>
        </div>
        <div class="item">
            <label for="windowBG">桌面壁纸</label>
            <input type="text" placeholder="前往壁纸中心设置" disabled v-model="form.windowBG">
        </div>
        <div class="item">
            <label for="appBG">应用主题</label>
            <input type="text"  placeholder="前往壁纸中心设置" disabled v-model="form.appBG">
        </div>
        <div class="item">
            <label for="autoLaunch">开机自启</label>
            <input type="checkbox" class="checkbox ao" v-model="form.autoLaunch">
        </div>
    </div>
    <div class="btn-group">
        <button @click="save">保存</button>
        <button @click="reset" style="background-color: #4f5b76;">重置</button>
    </div>
    <Notice v-if="msg" :message="msg" :type="infotype" />
</template>
<script setup>
import Notice from '@/components/Notice.vue';
import { ref, onMounted } from 'vue'
import { configs } from '../../config';
import { setAppBG } from '@/utils/comfun'
const {musicPath, warpperPath, windowBG, appBG, mdPath, autoLaunch} = configs()

const form = ref({
    musicPath: '',
    warpperPath: '',
    windowBG: '',
    mdPath: '',
    appBG: '',
    autoLaunch: false,
})

const msg = ref('')
const infotype = ref('')
const sendMSG = (newmsg, type = 'success') => {
    msg.value = newmsg
    infotype.value = type
    setTimeout(() => {
        msg.value = ''
        infotype.value  = ''
    }, 3500)
}
const handleDirectorySelect = async (type) => {
    const res = await api.invoke('send-path-file')
    if (!res) {
        sendMSG('获取路径失败', 'warning')
        return false
    }
    if (type === 'music') {
        form.value.musicPath = res
    }
    if (type === 'warpper') {
        form.value.warpperPath = res
    }
    if (type === 'md') {
        form.value.mdPath = res
    }
}
const save = async () => {
    const params = { ...form.value }
    await api.storage.setMultiple(params)
    await api.invoke('set-auto-launch', form.value.autoLaunch)
   
    sendMSG('保存成功', 'success')
}
const reset = async () => {
    await api.storage.clear()
    await api.storage.setMultiple({ musicPath, warpperPath, windowBG, appBG, mdPath, autoLaunch})
    form.value = { musicPath, warpperPath, windowBG, appBG,mdPath, autoLaunch}
    sendMSG('重置成功', 'success')
    setAppBG()
}
onMounted(async () => {
    const res = await api.storage.getAll()
    if (res && 'warpperPath' in res) {
        form.value = res
    }
})

</script>
<style scoped>
.set {
    padding: 2rem 1rem 1rem;
    box-sizing: border-box;
    border-radius: var(--radius);
    min-height: 30vh;
}
.set .item{
    margin-bottom: 1rem;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}
.set .item label {
    width: 70px;
    display: inline-block;
}
.set input:not([type="checkbox"]) {
    margin-left: 1rem;
    width: 360px;
    padding: 0 .6rem;
    box-sizing: border-box;
    border-color:var(--white);
    border-radius: 8px;
    height:36px
}
.set input:focus{
    outline: none;
    border-color:var(--mc);
}

.checkbox{
    margin-left: 1rem;
    width: 24px;
    height:24px;
    padding: 0 .6rem;
    box-sizing: border-box;
    border-radius: 8px;
}
.set .item button{
    margin-left: 1rem;
    height: 34px;
    padding: 0 .6rem;
    border-radius: 8px;
    border: none;
    background: #8e9ff1;
    color: #fff;
    cursor: pointer;
}
.btn-group{
    padding: 1.5rem 0;
    text-align: center;
}
.btn-group button{
    width: 120px;
    height: 36px;
    border: none;
    border-radius: 8px;
    margin: 0 1.5rem;
    background: var(--mc);
    color: #fff;
    cursor: pointer;
}
.btn-group button:hover{
   opacity: 0.6;
}
</style>