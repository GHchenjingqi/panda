<template>
    <div class="markdown ao know-box">
        <h1>{{ titles }}</h1>
        <div class="mdcontent" v-html="compiledMarkdown"></div>
    </div>
    <div class="sub-mulu fixed-sidebar ao"  v-if="headingList.length > 0">
        <FolderMenu :items="headingList" :key="headingsKey" />
     </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { marked } from 'marked';
import FolderMenu from '@/components/FolderMenu.vue'
import hljs from 'highlight.js';
import '@/assets/code.css';

// 编译后的 Markdown 内容
const compiledMarkdown = ref('');
const titles = ref('')


const headingList = ref([])
const headingsKey = ref(1001)
const submulu = async () => {
    const content = document.querySelector('.mdcontent')
    if (!content) return false
    if(headingsKey.value < 0){
        // 随机整数
        headingsKey.value = Math.floor(Math.random() * 1000)
    }else{
        headingsKey.value++
    }
    headingList.value = await getMdMl(content)
}

const getMdMl = async (element) => {
    let res = []
    let n = 0
    const anchors = element.querySelectorAll('h1,h2,h3,h4,h5,h6');
    const arr = Array.from(anchors).filter((title) => !!title.innerText.trim());
    if (!arr.length) {
        return res;
    }
    const hTags = Array.from(new Set(arr.map((title) => title.tagName))).sort();
    for (let index = 0; index < arr.length; index++) {
        const el = arr[index];
        res.push({
            id: 'directory-' + el.localName + n,
            class: 'directory-' + el.localName,
            title: el.innerText,
            lineIndex: el.localName,
            indent: hTags.indexOf(el.tagName),
            pixel: el.getBoundingClientRect().top - 60
        })
        n++
    }
    return res;
}

const copycreate = (blocks) => {
    var copyButton = document.createElement('span');
    copyButton.className = 'copy';
    copyButton.textContent = '复制代码';
    // 创建包裹代码块和按钮的容器元素
    var container = document.createElement('div');
    container.className = 'code-container';
    container.style.position = 'relative';
    copyButton.style.position = 'absolute';
    copyButton.style.top = '3px';
    copyButton.style.right = '6px';
    copyButton.style.fontSize = '12px';
    copyButton.style.zIndex = 99
    copyButton.style.color = "#fff"
    copyButton.style.padding = "0.2rem 0.4rem"
    copyButton.style.borderRadius = "4px"
    copyButton.style.cursor = "pointer"
    copyButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

    // 将按钮添加到容器元素内
    container.appendChild(copyButton);

    blocks.parentNode.insertBefore(container, blocks);
    copyButton.addEventListener('click', function () {
        // 获取代码块的文本内容textContent
        var code = blocks.innerText;

        if (navigator.clipboard && window.isSecureContext) {
            try {
                navigator.clipboard.writeText(code).then(() => {
                    // 修改复制按钮文本为“已复制”
                    this.textContent = '复制成功';
                    this.style.color = "green"

                }).catch(() => {
                    this.textContent = '复制失败';
                    this.style.color = "red"
                });
            } catch (err) {
                this.textContent = '复制失败';
                 this.style.color = "red"
            }
        } else {
            // 创建一个临时的textarea元素，并将代码块的内容设置为其值
            var textarea = document.createElement('textarea');
            textarea.value = code;
            // 将textarea元素追加到body中
            document.body.appendChild(textarea);
            // 选中textarea中的文本
            textarea.select();
            // 执行复制操作
            document.execCommand('copy');
            // 移除临时的textarea元素
            document.body.removeChild(textarea);
            this.textContent = '复制成功';
            this.style.color = "green"
        }
        //一定时间后把按钮名改回来
        setTimeout(() => {
            this.textContent = "复制代码";
            this.style.color = "#fff"
        }, 1800);
    });
}
onMounted( async() => {
    let localPath = await api.storage.get('remoteMd') || ''
    window.api.getChildParams(async (data) => {
        const { title, md } = data
        titles.value = title
        if ( localPath.includes('http')) {
            const response = await fetch(md);
            const markdownText = await response.text();
            compiledMarkdown.value = marked(markdownText);
        }else{
            const markdownText = await api.invoke('readLocalFile', md);
            compiledMarkdown.value = marked(markdownText);
        }

        let time = setTimeout(() => {
            const blocks = document.querySelectorAll('pre code')
            if (blocks && blocks.length > 0) {
                blocks.forEach((block) => {
                    hljs.highlightBlock(block)
                    copycreate(block)
                })
            }
            clearTimeout(time)
        }, 0)

        let time3 = setTimeout(() => {
            submulu()
            clearTimeout(time3)
        }, 300)

    });
});
</script>
<style>
.mdcontent {
    font-size: 0.8rem;
    line-height: 1.6;
}

.mdcontent pre {
    margin: 1rem 0;
    position: relative;
}

.mdcontent pre::before {
    content: "";
    position: absolute;
    border-radius: 50%;
    background: #fc625d;
    width: 12px;
    height: 12px;
    left: 14px;
    top: 12px;
    box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b;
    z-index: 2;
}

.mdcontent pre code {
    display: block;
    overflow-x: auto;
    padding: 2.5rem 1rem 1rem;
    border-radius: 6px;
    color: #abb2bf;
    font-size: 14px;
    background: #282c34;
}

.mdcontent h1,
.mdcontent h2,
.mdcontent h3,
.mdcontent h4,
.mdcontent h5,
.mdcontent h6 {
    margin-top: 0.8rem;
    margin-bottom: 0.4rem;
    font-weight: 600;
}

.mdcontent h1 {
    font-size: 1.2rem;
}

.mdcontent h2 {
    font-size: 1.1rem;
}

.mdcontent h3 {
    font-size: 1rem;
}

.mdcontent h4 {
    font-size: 0.88rem;
}

.mdcontent h5 {
    font-size: 0.84rem;
}

.mdcontent h6 {
    font-size: 0.8rem;
}

.mdcontent img {
    width: 100%;
}

.sub-mulu {
    display: none;
    width: 280px;
    padding: 2rem 1rem;
    box-sizing: border-box;
    border-radius: 8px;
    background: #f7fbff;
    margin-left: auto;
}

@media (min-width: 769px) {
    .sub-mulu {
        display: block;
    }
}

.fixed-sidebar {
    position: fixed;
    top: 30px;
    right: 30px;
    z-index: 100;
}
</style>
<style scoped>
.markdown {
    max-width: 1200px;
    margin: 0 auto;
    height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    border-radius: 16px;
    overflow-y: auto;
}

.markdown h1 {
    text-align: center;
    font-weight: 600;
    margin-top: 1rem;
    font-size: 1.4rem;
    margin-bottom: 1rem;
}
</style>