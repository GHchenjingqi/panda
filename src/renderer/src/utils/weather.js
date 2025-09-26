import axios, { all } from 'axios';

// 配置信息（需替换为你的高德API Key）
const API_CONFIG = {
  key: 'cd381f689a0780e75460a81d4bde65f5',
  ipUrl: 'https://restapi.amap.com/v3/ip',
  weatherUrl: 'https://restapi.amap.com/v3/weather/weatherInfo'
};

// 获取本地城市（IP定位）
export async function getLocalCity() {
  try {
    const response = await axios.get(API_CONFIG.ipUrl, {
      params: {
        key: API_CONFIG.key,
        output: 'json'
      }
    });

    if (response.data.status === '1') {
      return response.data.city; // 返回格式：北京市
    } else {
      throw new Error(`IP定位失败：${response.data.info}`);
    }
  } catch (error) {
    console.error('定位请求失败:', error.message);
    return null;
  }
}

// 获取天气信息
export async function getWeather(city) {
  try {
    const response = await axios.get(API_CONFIG.weatherUrl, {
      params: {
        key: API_CONFIG.key,
        city: city,
        extensions: 'base', // base=实况天气，all=天气预报
        output: 'json'
      }
    });

    if (response.data.status === '1' && response.data.count !== '0') {
      const weatherInfo = response.data.lives[0];
      return {
        city: weatherInfo.city,
        weather: weatherInfo.weather,
        temperature: weatherInfo.temperature + '°',
        wind: weatherInfo.winddirection +'风'+ weatherInfo.windpower + '级',
        humidity: weatherInfo.humidity + '%',
        reportTime: weatherInfo.reporttime,
        all: response.data.lives,
      };
    } else {
      throw new Error(`天气查询失败：${response.data.info}`);
    }
  } catch (error) {
    console.error('天气请求失败:', error.message);
    return null;
  }
}


let weatherCache = {
    data: {
      city:"unknow",
      reportTime:"unknow",
      wind:"unknow",
      temperature:"unknow"
    },
    timestamp: 0
};
 
const CACHE_DURATION = 0.5 * 60 * 60 * 1000; // 0.5小时（毫秒）
export const initWeather = async()=>{ 
    const cachedData = localStorage.getItem('weatherCache');
    if (cachedData) {
        weatherCache = JSON.parse(cachedData);
    }
    // 检查缓存有效性
    const now = Date.now();
    if (now - weatherCache.timestamp < CACHE_DURATION) {
        return weatherCache;
    }
    try {
        // 获取城市ip
        const ip = await getLocalCity();
        // 获取天气
        const weather = await getWeather(ip);
        
        // 更新缓存
        weatherCache = {
            data:weather,
            timestamp: now
        };
        localStorage.setItem('weatherCache', JSON.stringify(weatherCache));
        
        return weatherCache;
    } catch (error) {
        console.error('数据刷新失败，使用缓存数据');
        return weatherCache;
    }
}

export const updataWeather = async () => { 
   localStorage.setItem('weatherCache', '');
   weatherCache = {
      data: null,
      timestamp: 0
  };
   return await initWeather();
};


export const weatherList = {
  '晴': 'qing',
  '阴': 'yin',
  '多云': 'duoyun',
  '晴间多云': 'duoyun',
  '阴天': 'yin',
  '阵雨': 'leizhenyu',
  '雷阵雨': 'leizhenyu',
  '冰雹': 'bingbao',
  '雨夹雪': 'yuxue',
  '小雨': 'xiaoyu',
  '中雨': 'zhongyu',
  '大雨': 'dayu',
  '暴雨': 'dayu',
  '小雪': 'xiaoxue',
  '中雪': 'zhongxue',
  '大雪': 'daxue',
  '暴雪': 'daxue',
  '雾': 'wu',
  '霾': 'wu',
}