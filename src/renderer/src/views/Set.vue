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
            <label for="showMD">开启知识库</label>
            <input type="checkbox" class="checkbox" v-model="form.showMD">
        </div>
        <div class="item" v-if="form.showMD">
            <label for="mdPath">知识库地址</label>
            <input type="text" v-model="form.remoteMd">
            <button class="choose" @click="handleDirectorySelect('rmd')">选择</button>
        </div>
        <div class="item">
            <label for="autoLaunch">开机自启</label>
            <input type="checkbox" class="checkbox" v-model="form.autoLaunch">
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
const settings = configs().settings

const form = ref({
    musicPath: '',
    warpperPath: '',
    windowBG: '',
    mdPath: '',
    appBG: '',
    remoteMd:'',
    autoLaunch: false,
    showMD: false
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
    if (type === 'rmd') {
        form.value.remoteMd = res
    }
}
const save = async () => {
    const {  musicPath, warpperPath,  windowBG, mdPath, appBG,  autoLaunch, showMD ,remoteMd} = form.value
    await api.storage.setMultiple({  musicPath, warpperPath,  windowBG, mdPath, appBG,  autoLaunch, showMD, remoteMd })
    await api.invoke('set-auto-launch', autoLaunch )
    await api.send('set-menu-md', showMD )
    sendMSG('保存成功', 'success')
}
const reset = async () => {
    await api.storage.clear()
    await api.storage.setMultiple({ ...settings})
    form.value = { ...settings}
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
    padding: 2rem;
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
    width: 80px;
    display: inline-block;
}
.set input:not([type="checkbox"]) {
    margin-left: 1rem;
    width: 360px;
    padding: 0 .6rem;
    box-sizing: border-box;
    border: 1px solid;
    border-color:var(--textColor);
    border-radius: 8px;
    background: var(--bgcolor);
    color: var(--textColor);
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