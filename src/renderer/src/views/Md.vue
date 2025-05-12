<template>
    <div class="markdown">
        <h1>{{ titles }}</h1>
        <div class="mdcontent" v-html="compiledMarkdown"></div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import '@/assets/code.css';

// 编译后的 Markdown 内容
const compiledMarkdown = ref('');
const titles = ref('')
onMounted(() => {
    window.api.getChildParams(async (data) => {
        const { title, md } = data
        titles.value = title
        const response = await fetch(md);
        const markdownText = await response.text();
        compiledMarkdown.value = marked(markdownText);

        let time = setTimeout(() => {
            const blocks = document.querySelectorAll('pre code')
            if (blocks && blocks.length > 0) {
                blocks.forEach((block) => {
                    hljs.highlightBlock(block)
                })
            }
            clearTimeout(time)
        }, 0)
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

.mdcontent h1,.mdcontent h2,.mdcontent h3,.mdcontent h4,.mdcontent h5,.mdcontent h6{
    margin-top: 0.8rem;
    margin-bottom: 0.4rem;
    font-weight: 600;
}
.mdcontent h1{
    font-size: 1.2rem;
}
.mdcontent h2{
    font-size: 1.1rem;
}
.mdcontent h3{
    font-size: 1rem;
}
.mdcontent h4{
    font-size: 0.88rem;
}
.mdcontent h5{
    font-size: 0.84rem;
}
.mdcontent h6{
    font-size: 0.8rem;
}
.mdcontent img {
    width: 100%;
}
</style>
<style scoped>
.markdown {
    height: 100vh;
    padding-bottom: 2rem;
    box-sizing: border-box;
    overflow-x: hidden;
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