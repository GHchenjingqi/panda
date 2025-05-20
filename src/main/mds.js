import fs from 'fs'
import path from 'path'
// 音频文件扩展名
const audioExtensions = ['.md'];

/**
 * 扫描目录中的音乐文件
 * @param {string} dir - 目录路径
 * @returns {Array} 音乐文件路径列表
 */
export async function scanMd(dir) {
  if (!fs.existsSync(dir)) {
      console.error('path is not exist:', dir);
      return [];
  }

  const stats = fs.statSync(dir);
  if (!stats.isDirectory()) {
      console.error('path is not mulu:', dir);
      return [];
  }

  let musicFiles = [];

  function _scan(currentDir) {
      try {
          const files = fs.readdirSync(currentDir);

          files.forEach((file) => {
              const filePath = path.join(currentDir, file);
              let stat;

              try {
                  stat = fs.statSync(filePath);
              } catch (err) {
                  console.error('not get:', filePath, err);
                  return;
              }

              if (stat.isDirectory()) {
                  _scan(filePath); // 递归进入子目录
              } else {
                  const ext = path.extname(file).toLowerCase();
                  if (audioExtensions.includes(ext)) {
                      musicFiles.push(filePath); // 添加匹配的音频文件
                  }
              }
          });
      } catch (err) {
          console.error('get mulu is failed:', currentDir, err);
      }
  }

  _scan(dir); // 开始扫描

  return musicFiles;
}

