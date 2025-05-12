const axios = require('axios');
const cheerio = require('cheerio');

export async function fetchBaiduHotSearch() {
    try {
        // 发送请求到百度热搜页面
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        };
        const response = await axios.get('https://top.baidu.com/board?tab=realtime', { headers: headers });
        const html = response.data;
        // 使用 cheerio 加载 HTML
        const $ = cheerio.load(html);

        // 选择器可能需要根据实际网页结构调整
        const hotSearchList = [];
        $('.category-wrap_iQLoo').each((index, element) => {
            if (index >= 20) return false; // 只取前10个
            // 获取链接（假设链接在 .c-single-text-ellipsis 的父级元素下的 a 标签里）
            const linkElement = $(element).find('.c-single-text-ellipsis').parent('a');
            const link = linkElement.attr('href') || '';
            const title = $(element).find('.c-single-text-ellipsis').text().trim();
            hotSearchList.push({
                rank: index + 1,
                title: title || '无标题',
                link: link.startsWith('http') ? link : 'https://top.baidu.com' + link // 确保链接是完整的URL
            });
        });
        return hotSearchList;
    } catch (error) {
        console.error('抓取过程中出现错误:', error.message);
        return [];
    }
}

// fetchBaiduHotSearch();