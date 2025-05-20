<template>
    <div class="know">
       <div class="search">
            <form class="search-form" @submit="submit">
                <input type="text" class="ao" @keyup.enter="submit" v-model="seacherkey" placeholder="检索知识库...">
                <button type="submit">搜索</button>
            </form>

            <div class="tu list">
                <ul v-if="menus.length > 0">
                    <li v-for="(item,index) in menus" :key="item.path" :title="item.name" @click="openFile(item.path, item.name)">
                       {{ index + 1 }}.{{ item.name }}
                    </li>
                </ul>
                <p class="no-data" v-else>暂无匹配数据，请新增！</p>
            </div>
       </div>
    </div>
</template>
<script setup>
import { configs } from '@renderer/config.js';
import { ref , onMounted} from 'vue';
import { getName } from '@/utils/comfun.js'

const { base, knowledge } = configs();
const knowFiles = base + knowledge.mds

const menus = ref([]), menusList = ref([]), isLocal = ref(false);
let pathList=[];

const menusInit = (List)=>{
    return List.map(item=>{
        const path = isLocal.value ? item : knowFiles + item 
        let name = item
        if (name.includes('.md')) {
            if (isLocal.value) {
                name = getName(name)
            }
            name =  name.replace('.md', '')
            // 首字母大写
            name = name.replace(name[0], name[0].toUpperCase())
        }
        return {
            path,
            name
        }
    })
}

const openFile = (md,title)=>{
    window.api.childOpen({routepath:'/md',md,title})
}

const seacherkey = ref('');
const submit = (e) => {
    e.preventDefault();
    const value = seacherkey.value.trim();
    if (!value) {
        menus.value = menusList.value
        return false
    }
    let res = pathList.filter(item =>item.indexOf(value) > -1)
    menus.value = menusInit(res)
}

onMounted(async () => {
    let localPath = await api.storage.get('remoteMd') || ''
    try {
        if (localPath.includes(base)) {
            isLocal.value = false
            const module = await import('https://ghchenjingqi.github.io/home/public/pathList.js');
            pathList = module.pathList;
        }else{
            if (localPath) {
                // 获取本地目录的路径
                isLocal.value = true
                pathList = await api.invoke('get-md-list', localPath);
            }
        }
    } catch (error) {
        pathList = [];
        isLocal.value = true
    }

    menusList.value = menusInit(pathList);
    menus.value = menusList.value;
})

</script>

<style scoped>
    .search-form{
        margin-bottom: 1.3rem;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.2rem;
    }
    .search-form input{
        width: 240px;
        height: 44px;
        padding-left: 1.5rem;
        box-sizing: border-box;
        border-radius: 8px 0 0 8px;
    }
    .search-form button{
        width: 80px;
        height: 44px;
        border-radius: 0 8px 8px 0;
        background: var(--mc);
        color: var(--white);
        border: none;
        cursor: pointer;
    }
    .search-form button:focus{
        outline: none;
    }
    .search-form input:focus{
        outline: none;
        color: var(--mc);
    }
    .list{
        padding: 2rem;
        box-sizing: border-box;
        height: auto;
        border-radius: var(--radius);
    }
    .list ul{
        width: 100%;
        height: 100%;
        max-height: calc(100vh - 140px - 82px);
        overflow: hidden;
        overflow-y: auto;
    }
    .list li{
        height: 46px;
        line-height: 46px;
        cursor: pointer;
        width: 32%;
        margin-right: 2%;
        float: left;
        overflow: hidden;
    }
    .list li:nth-of-type(3n){
        margin-right: 0;
    }
    .list li:hover{
        color: var(--mc);
        text-decoration: underline;
    }
    .no-data{
        text-align: center;
        padding: 3rem 1rem;
    }
</style>