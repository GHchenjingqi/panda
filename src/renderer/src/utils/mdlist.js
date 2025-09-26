export const getMdList = async () => {
    return new Promise((resolve, reject) => {
        fetch('https://ghchenjingqi.github.io/resources/mds/pathList.js')
            .then(res => res.text())
            .then(text => {
                // 使用正则表达式提取数组字符串
                const match = text.match(/export const pathList = (\[.*?\])/s);
                if (match) {
                    // 将匹配到的字符串作为JSON解析
                    let  list = JSON.parse(match[1]);
                    resolve(list)
                } else {
                    console.error('未能从脚本中提取出pathList');
                    reject(null);
                }
            }).catch(error => {
                console.error(error);
                reject(null);
            })
    });


} 