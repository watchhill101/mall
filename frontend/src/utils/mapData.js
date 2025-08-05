// 中国省份地图数据
export const chinaMapData = [
  { name: '北京', value: 1289, code: 'beijing' },
  { name: '天津', value: 956, code: 'tianjin' },
  { name: '河北', value: 2341, code: 'hebei' },
  { name: '山西', value: 1567, code: 'shanxi' },
  { name: '内蒙古', value: 834, code: 'neimenggu' },
  { name: '辽宁', value: 1876, code: 'liaoning' },
  { name: '吉林', value: 923, code: 'jilin' },
  { name: '黑龙江', value: 1234, code: 'heilongjiang' },
  { name: '上海', value: 2987, code: 'shanghai' },
  { name: '江苏', value: 3456, code: 'jiangsu' },
  { name: '浙江', value: 2876, code: 'zhejiang' },
  { name: '安徽', value: 1987, code: 'anhui' },
  { name: '福建', value: 1654, code: 'fujian' },
  { name: '江西', value: 1432, code: 'jiangxi' },
  { name: '山东', value: 3123, code: 'shandong' },
  { name: '河南', value: 2543, code: 'henan' },
  { name: '湖北', value: 2109, code: 'hubei' },
  { name: '湖南', value: 1876, code: 'hunan' },
  { name: '广东', value: 4321, code: 'guangdong' },
  { name: '广西', value: 1234, code: 'guangxi' },
  { name: '海南', value: 567, code: 'hainan' },
  { name: '重庆', value: 1543, code: 'chongqing' },
  { name: '四川', value: 2765, code: 'sichuan' },
  { name: '贵州', value: 1098, code: 'guizhou' },
  { name: '云南', value: 1654, code: 'yunnan' },
  { name: '西藏', value: 234, code: 'xizang' },
  { name: '陕西', value: 1876, code: 'shaanxi' },
  { name: '甘肃', value: 876, code: 'gansu' },
  { name: '青海', value: 345, code: 'qinghai' },
  { name: '宁夏', value: 432, code: 'ningxia' },
  { name: '新疆', value: 987, code: 'xinjiang' },
  { name: '台湾', value: 1234, code: 'taiwan' },
  { name: '香港', value: 987, code: 'xianggang' },
  { name: '澳门', value: 234, code: 'aomen' }
]

// 省份城市数据 (以广东为例)
export const guangdongCityData = [
  { name: '广州市', value: 1234 },
  { name: '深圳市', value: 1876 },
  { name: '珠海市', value: 543 },
  { name: '汕头市', value: 432 },
  { name: '佛山市', value: 876 },
  { name: '韶关市', value: 234 },
  { name: '湛江市', value: 345 },
  { name: '肇庆市', value: 234 },
  { name: '江门市', value: 456 },
  { name: '茂名市', value: 345 },
  { name: '惠州市', value: 567 },
  { name: '梅州市', value: 234 },
  { name: '汕尾市', value: 123 },
  { name: '河源市', value: 234 },
  { name: '阳江市', value: 123 },
  { name: '清远市', value: 234 },
  { name: '东莞市', value: 987 },
  { name: '中山市', value: 654 },
  { name: '潮州市', value: 234 },
  { name: '揭阳市', value: 345 },
  { name: '云浮市', value: 123 }
]

// 江苏省城市数据
export const jiangsuCityData = [
  { name: '南京市', value: 876 },
  { name: '无锡市', value: 654 },
  { name: '徐州市', value: 543 },
  { name: '常州市', value: 432 },
  { name: '苏州市', value: 987 },
  { name: '南通市', value: 345 },
  { name: '连云港市', value: 234 },
  { name: '淮安市', value: 234 },
  { name: '盐城市', value: 345 },
  { name: '扬州市', value: 234 },
  { name: '镇江市', value: 234 },
  { name: '泰州市', value: 234 },
  { name: '宿迁市', value: 123 }
]

// 地图注册函数
export const registerMapData = async (echarts) => {
  if (!echarts || !echarts.registerMap) return

  try {
    // 注册中国地图 - 使用ECharts内置的中国地图
    // 如果需要更详细的地图数据，可以从CDN加载
    const chinaMapResponse = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
    if (chinaMapResponse.ok) {
      const chinaGeoJSON = await chinaMapResponse.json()
      echarts.registerMap('china', chinaGeoJSON)
    }

    // 注册广东省地图
    const guangdongMapResponse = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/440000_full.json')
    if (guangdongMapResponse.ok) {
      const guangdongGeoJSON = await guangdongMapResponse.json()
      echarts.registerMap('广东', guangdongGeoJSON)
    }

    // 注册江苏省地图  
    const jiangsuMapResponse = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/320000_full.json')
    if (jiangsuMapResponse.ok) {
      const jiangsuGeoJSON = await jiangsuMapResponse.json()
      echarts.registerMap('江苏', jiangsuGeoJSON)
    }

  } catch (error) {
    console.warn('地图数据加载失败，使用默认地图:', error)
    // 如果网络加载失败，使用简化版地图数据
    echarts.registerMap('china', {})
    echarts.registerMap('广东', {})
    echarts.registerMap('江苏', {})
  }
}
