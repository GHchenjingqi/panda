import fs from 'fs'
import path from 'path'

// 使用 fs/promises 中的 readdir（Node.js v14+ 原生支持）
const { readdir } = fs.promises;

const imageTypes = new Set(['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg']);
export async function readImagesFromDir(dirPath) {
  try {
    const files = await readdir(dirPath); // 异步等待目录读取完成

    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageTypes.has(ext);
      })
      .map(file => path.join(dirPath, file));

    // console.log('找到的图片:', images); // 这里输出是有值的
    return images;
  } catch (err) {
    // console.error('无法读取目录:', err);
    return []; // 出错时返回空数组，避免未处理异常
  }
}
// 使用绝对路径调用函数
// const dirPath = '/absolute/path/to/your/images'; // 替换为你的图片目录的绝对路径
//  readImagesFromDir(dirPath);
