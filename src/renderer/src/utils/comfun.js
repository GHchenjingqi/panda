export const setAppBG = (url)=>{
    let app  = document.querySelector('#app')
    if(app ){
        if (url) {
            app.style.backgroundImage = `url('${url}')`
        }else{
            app.style.background = 'var(--linegrad)'
        }
    }
}


export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * 
 * @param {*} path 本地磁盘路径
 * @param {*} type 文件后缀 默认 .md
 * @returns 
 */
export const getName = (path, types = ['.md']) => {
    const parts = path.split('\\');
    const filenameWithExt = parts[parts.length - 1];
    // 遍历所有给定的类型，尝试匹配
    for (const type of types) {
        if (filenameWithExt.endsWith(type)) {
            return filenameWithExt.slice(0, -type.length);
        }
    }
    // 如果没有匹配的类型，则返回原始文件名
    return filenameWithExt;
};