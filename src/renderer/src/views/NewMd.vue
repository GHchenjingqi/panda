<template>
    <MdEditor class="md-editor ao" v-model="text" :toolbars="toolbars" @onSave="handleSave"></MdEditor>
    <div class="open-file">
        <div class="item"  @click="handleOpenFile">
            <svg t="1746517476631" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2871" width="18" height="18"><path d="M275.84 160H124.192l1.824 580.096a32 32 0 0 1-64 0L60.16 160a64 64 0 0 1 64-64h177.92l97.28 96h498.272a32 32 0 1 1 0 64H373.152l-97.28-96z" fill="#515151" p-id="2872"></path><path d="M127.52 735.616a32 32 0 0 1-63.04-10.944l54.624-314.144C127.904 359.936 174.784 320 225.76 320h668.864c55.36 0 93.92 46.72 84.384 101.472l-72.32 416C897.824 888.064 850.976 928 800 928H160a32 32 0 0 1 0-64h640c19.712 0 40.096-17.376 43.616-37.472l72.32-416c2.784-15.904-5.984-26.528-21.312-26.528H225.76c-19.68 0-40.096 17.376-43.584 37.472l-54.656 314.144z" fill="#515151" p-id="2873"></path></svg>
        </div>
        <div class="item" @click="handleClear">
            <svg t="1746523343255" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2648" width="16" height="16"><path d="M876.564398 512.149985h30.697002c7.699248 0 15.398496 0 22.997754-2.599746 33.296748-8.999121 46.095498-43.495752 37.096378-104.889757-3.799629-28.197246-24.297627-46.095498-54.99463-46.095498H614.290011v-24.297627c0-65.293624-3.799629-130.487257 0-195.780881C616.889757 75.792598 589.992384 18.198223 537.49751 2.899717c-15.398496-3.799629-38.39625-3.799629-51.195 0C458.105263 13.098721 421.008886 39.996094 413.409628 79.692218c-2.599746 12.79875-3.799629 24.297627-3.799629 35.796504v243.076262H113.938873c-40.896006 0-60.094131 19.198125-60.094131 61.394004v7.699249c0 72.892882 7.699248 80.59213 80.592129 84.491748 2.599746 0 6.399375 1.299873 10.199004 1.299873-28.197246 145.885753-56.294502 290.471634-86.991504 435.057514-7.699248 35.796504 0 62.693878 30.697002 75.492628h844.417537c29.397129-12.79875 38.39625-38.39625 31.996876-72.892882-30.597012-145.985744-58.794258-290.571624-88.191388-438.957133zM509.300264 54.094717c31.996875 0 52.494874 22.997754 52.494873 61.394005 0 74.192755 1.299873 147.185626 1.299873 221.378381v21.797871H459.405136V115.488722c0-37.096377 19.198125-60.194122 49.895128-61.394005zM102.439996 460.954985v-51.195001h818.820037V460.954985H102.439996z m200.880383 511.750024c8.999121-63.993751 17.898252-133.087003 26.897373-199.580509 1.299873-11.498877 2.599746-21.797871 3.799629-31.996876 1.299873-15.398496-3.799629-28.197246-19.198125-30.697002-17.898252-2.599746-28.197246 6.399375-30.697002 22.997754-6.399375 42.195879-11.498877 83.191876-17.898252 125.387755-3.799629 37.096377-8.999121 75.492628-14.098624 113.888878H103.739869c33.296748-153.585001 66.493506-307.070013 101.090128-460.655014h610.340397c33.296748 153.585001 66.493506 307.070013 101.090127 460.655014h-612.940142z" p-id="2649"></path></svg>
        </div>
    </div>
    <Notice v-if="msg" :message="msg" :type="infotype" />
</template>
<script setup>
import Notice from '@/components/Notice.vue';
import { ref, onMounted } from 'vue';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css'; 

const text = ref('')
// 自定义工具栏（显示哪些按钮）
const toolbars = [
  'bold',          // 粗体
  'underline',     // 下划线
  'italic',        // 斜体
  'strikeThrough', // 删除线
  '-',             // 分隔线
  'title',         // 标题
  'sub',           // 下标
  'sup',           // 上标
  'quote',         // 引用
  'unorderedList', // 无序列表
  'orderedList',   // 有序列表
  'task',          // 任务列表
  '-',
  'codeRow',       // 行内代码
  'code',          // 代码块
  'link',          // 链接
//   'image',         // 图片（需配合 @onUploadImg）
  'table',         // 表格
  'mermaid',       // Mermaid 流程图
  'katex',         // LaTeX 公式
  '-',
  'revoke',        // 撤销
  'next',          // 重做
  'prettier', // 美化
  'preview',      
  '-',
  'save'
];

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

const handleClear = () => {
    text.value = ''
    currentFilePath.value = ''
    window.localStorage.setItem('text', '')
}

// 当前文件路径
const currentFilePath = ref('');
// 打开文件
const handleOpenFile = async () => {
  try {
    const fileData = await api.invoke('get-md');
    if (fileData) {
      text.value = fileData.content;
      // 可以同时记录文件路径用于后续保存
      currentFilePath.value = fileData.path;
    }
  } catch (err) {
    console.error('文件打开失败:', err);
  }
};
// 保存事件
const handleSave =async ()=>{
    window.localStorage.setItem('text', text.value)
    let src = await api.storage.get('mdPath')
    if (!src) {
        sendMSG('请先前往设置保存路径', 'error')
        return
    }
    let title = '新笔记.md'
    await api.invoke('save-md', { src,title, text: text.value })
    window.localStorage.setItem('text', '')
    sendMSG(`文件已存至：${src}目录`, 'success')
}

onMounted(()=>{
    text.value = window.localStorage.getItem('text') || ''
})

</script>
<style>
    .md-editor .md-editor-preview .md-editor-code pre{
        position: inherit !important;
        border: none !important;
        border-radius: 0 !important;
    }
    .md-editor .md-editor-preview .md-editor-code pre::before{
        display: none !important;
    }
</style>
<style scoped>
    .md-editor{
        --md-bk-color: transparent !important;
        --md-border-color: none !important;
        --md-scrollbar-bg-color: var(--mdbtn) !important;
        --md-bk-hover-color: var(--mdbtn) !important;
        --md-bk-color-outstand: var(--mdbtn) !important;
        --md-scrollbar-thumb-color: var(--mc) !important;
        
        border-radius: 16px;
        height: 550px;
        padding: 1rem;
        box-sizing: border-box;
        background: var(--white);
    }
    .open-file{
        width: 80px;
        position: absolute;
        display: flex;
        align-items: center;
        right: 2.2rem;
        z-index: 6;
        top: 5.54rem;
    }
    .open-file .item{
        width:30px;
        text-align: center;
        cursor: pointer;
    }
    .open-file svg{
        width: 16px;
    }
</style>