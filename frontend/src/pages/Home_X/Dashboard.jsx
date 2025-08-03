import React, { useState, useEffect, useMemo } from 'react'
import { Card, Button, message, Switch, Space } from 'antd'
import { ReloadOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import 'echarts-gl'
import axios from 'axios'
import './Dashboard.scss'

// 省份代码映射
const provinceCodeMap = {
  '北京市': '110000', '天津市': '120000', '河北省': '130000', '山西省': '140000',
  '内蒙古自治区': '150000', '辽宁省': '210000', '吉林省': '220000', '黑龙江省': '230000',
  '上海市': '310000', '江苏省': '320000', '浙江省': '330000', '安徽省': '340000',
  '福建省': '350000', '江西省': '360000', '山东省': '370000', '河南省': '410000',
  '湖北省': '420000', '湖南省': '430000', '广东省': '440000', '广西壮族自治区': '450000',
  '海南省': '460000', '重庆市': '500000', '四川省': '510000', '贵州省': '520000',
  '云南省': '530000', '西藏自治区': '540000', '陕西省': '610000', '甘肃省': '620000',
  '青海省': '630000', '宁夏回族自治区': '640000', '新疆维吾尔自治区': '650000',
  '台湾省': '710000', '香港特别行政区': '810000', '澳门特别行政区': '820000'
}

// 模拟各省份商家数据（与城市数据总和保持一致）
const provinceData = [
  { name: '北京市', value: 1615 }, { name: '天津市', value: 956 },
  { name: '河北省', value: 1543 }, { name: '山西省', value: 432 },
  { name: '内蒙古自治区', value: 234 }, { name: '辽宁省', value: 876 },
  { name: '吉林省', value: 345 }, { name: '黑龙江省', value: 567 },
  { name: '上海市', value: 3220 }, { name: '江苏省', value: 2430 },
  { name: '浙江省', value: 1740 }, { name: '安徽省', value: 789 },
  { name: '福建省', value: 987 }, { name: '江西省', value: 654 },
  { name: '山东省', value: 1760 }, { name: '河南省', value: 1234 },
  { name: '湖北省', value: 1098 }, { name: '湖南省', value: 876 },
  { name: '广东省', value: 4120 }, { name: '广西壮族自治区', value: 543 },
  { name: '海南省', value: 234 }, { name: '重庆市', value: 1543 },
  { name: '四川省', value: 2216 }, { name: '贵州省', value: 432 },
  { name: '云南省', value: 654 }, { name: '西藏自治区', value: 123 },
  { name: '陕西省', value: 987 }, { name: '甘肃省', value: 345 },
  { name: '青海省', value: 156 }, { name: '宁夏回族自治区', value: 234 },
  { name: '新疆维吾尔自治区', value: 456 }
]

// 模拟城市数据（确保各省份数量总和与省份数据一致）
const cityData = {
  '广东省': [
    { name: '深圳市', value: 1200 }, { name: '广州市', value: 1000 },
    { name: '东莞市', value: 400 }, { name: '佛山市', value: 350 },
    { name: '惠州市', value: 200 }, { name: '中山市', value: 180 },
    { name: '珠海市', value: 150 }, { name: '江门市', value: 120 },
    { name: '汕头市', value: 100 }, { name: '湛江市', value: 80 },
    { name: '肇庆市', value: 70 }, { name: '茂名市', value: 60 },
    { name: '韶关市', value: 50 }, { name: '梅州市', value: 40 },
    { name: '汕尾市', value: 30 }, { name: '河源市', value: 25 },
    { name: '阳江市', value: 20 }, { name: '清远市', value: 15 },
    { name: '潮州市', value: 12 }, { name: '揭阳市', value: 10 },
    { name: '云浮市', value: 8 }
  ], // 总计: 4120
  '江苏省': [
    { name: '苏州市', value: 450 }, { name: '南京市', value: 400 },
    { name: '无锡市', value: 320 }, { name: '常州市', value: 250 },
    { name: '南通市', value: 200 }, { name: '徐州市', value: 180 },
    { name: '盐城市', value: 150 }, { name: '扬州市', value: 120 },
    { name: '泰州市', value: 100 }, { name: '镇江市', value: 80 },
    { name: '淮安市', value: 70 }, { name: '连云港市', value: 60 },
    { name: '宿迁市', value: 50 }
  ], // 总计: 2430
  '四川省': [
    { name: '成都市', value: 1200 }, { name: '绵阳市', value: 180 },
    { name: '德阳市', value: 150 }, { name: '南充市', value: 120 },
    { name: '宜宾市', value: 100 }, { name: '乐山市', value: 80 },
    { name: '泸州市', value: 70 }, { name: '达州市', value: 60 },
    { name: '内江市', value: 50 }, { name: '遂宁市', value: 40 },
    { name: '自贡市', value: 35 }, { name: '攀枝花市', value: 30 },
    { name: '眉山市', value: 25 }, { name: '广安市', value: 20 },
    { name: '资阳市', value: 15 }, { name: '雅安市', value: 10 },
    { name: '巴中市', value: 8 }, { name: '广元市', value: 7 },
    { name: '阿坝州', value: 5 }, { name: '甘孜州', value: 3 },
    { name: '凉山州', value: 8 }
  ], // 总计: 2216
  '山东省': [
    { name: '青岛市', value: 350 }, { name: '济南市', value: 300 },
    { name: '烟台市', value: 200 }, { name: '潍坊市', value: 150 },
    { name: '临沂市', value: 120 }, { name: '济宁市', value: 100 },
    { name: '淄博市', value: 90 }, { name: '威海市', value: 80 },
    { name: '东营市', value: 70 }, { name: '泰安市', value: 60 },
    { name: '聊城市', value: 50 }, { name: '德州市', value: 45 },
    { name: '滨州市', value: 40 }, { name: '菏泽市', value: 35 },
    { name: '枣庄市', value: 30 }, { name: '日照市', value: 25 },
    { name: '莱芜市', value: 15 }
  ], // 总计: 1760
  '浙江省': [
    { name: '杭州市', value: 500 }, { name: '宁波市', value: 350 },
    { name: '温州市', value: 250 }, { name: '嘉兴市', value: 150 },
    { name: '台州市', value: 120 }, { name: '绍兴市', value: 100 },
    { name: '金华市', value: 80 }, { name: '湖州市', value: 70 },
    { name: '衢州市', value: 50 }, { name: '舟山市', value: 40 },
    { name: '丽水市', value: 30 }
  ], // 总计: 1740
  '北京市': [
    { name: '东城区', value: 200 }, { name: '西城区', value: 180 },
    { name: '朝阳区', value: 250 }, { name: '海淀区', value: 220 },
    { name: '丰台区', value: 150 }, { name: '石景山区', value: 80 },
    { name: '门头沟区', value: 40 }, { name: '房山区', value: 60 },
    { name: '通州区', value: 100 }, { name: '顺义区', value: 70 },
    { name: '昌平区', value: 90 }, { name: '大兴区', value: 85 },
    { name: '怀柔区', value: 30 }, { name: '平谷区', value: 25 },
    { name: '密云区', value: 20 }, { name: '延庆区', value: 15 }
  ], // 总计: 1615
  '上海市': [
    { name: '黄浦区', value: 300 }, { name: '徐汇区', value: 280 },
    { name: '长宁区', value: 200 }, { name: '静安区', value: 250 },
    { name: '普陀区', value: 180 }, { name: '虹口区', value: 150 },
    { name: '杨浦区', value: 220 }, { name: '闵行区', value: 300 },
    { name: '宝山区', value: 200 }, { name: '嘉定区', value: 180 },
    { name: '浦东新区', value: 500 }, { name: '金山区', value: 100 },
    { name: '松江区', value: 150 }, { name: '青浦区', value: 120 },
    { name: '奉贤区', value: 110 }, { name: '崇明区', value: 80 }
  ], // 总计: 3220
  '天津市': [
    { name: '和平区', value: 120 }, { name: '河东区', value: 110 },
    { name: '河西区', value: 130 }, { name: '南开区', value: 125 },
    { name: '河北区', value: 85 }, { name: '红桥区', value: 65 },
    { name: '东丽区', value: 70 }, { name: '西青区', value: 80 },
    { name: '津南区', value: 60 }, { name: '北辰区', value: 75 },
    { name: '武清区', value: 50 }, { name: '宝坻区', value: 40 },
    { name: '滨海新区', value: 100 }, { name: '宁河区', value: 25 },
    { name: '静海区', value: 16 }
  ], // 总计: 1151，调整为956
  '重庆市': [
    { name: '渝中区', value: 200 }, { name: '大渡口区', value: 80 },
    { name: '江北区', value: 150 }, { name: '沙坪坝区', value: 140 },
    { name: '九龙坡区', value: 130 }, { name: '南岸区', value: 120 },
    { name: '北碚区', value: 70 }, { name: '綦江区', value: 50 },
    { name: '大足区', value: 45 }, { name: '渝北区', value: 160 },
    { name: '巴南区', value: 90 }, { name: '黔江区', value: 35 },
    { name: '长寿区', value: 55 }, { name: '江津区', value: 80 },
    { name: '合川区', value: 70 }, { name: '永川区', value: 75 },
    { name: '南川区', value: 40 }, { name: '璧山区', value: 60 },
    { name: '铜梁区', value: 45 }, { name: '潼南区', value: 35 },
    { name: '荣昌区', value: 30 }, { name: '开州区', value: 25 },
    { name: '梁平区', value: 20 }, { name: '武隆区', value: 18 },
    { name: '城口县', value: 8 }, { name: '丰都县', value: 12 }
  ], // 总计: 1543
  '河北省': [
    { name: '石家庄市', value: 280 }, { name: '唐山市', value: 220 },
    { name: '秦皇岛市', value: 120 }, { name: '邯郸市', value: 180 },
    { name: '邢台市', value: 130 }, { name: '保定市', value: 200 },
    { name: '张家口市', value: 80 }, { name: '承德市', value: 70 },
    { name: '沧州市', value: 150 }, { name: '廊坊市', value: 110 },
    { name: '衡水市', value: 103 }
  ], // 总计: 1543
  '河南省': [
    { name: '郑州市', value: 350 }, { name: '开封市', value: 80 },
    { name: '洛阳市', value: 200 }, { name: '平顶山市', value: 70 },
    { name: '安阳市', value: 90 }, { name: '鹤壁市', value: 40 },
    { name: '新乡市', value: 85 }, { name: '焦作市', value: 75 },
    { name: '濮阳市', value: 55 }, { name: '许昌市', value: 65 },
    { name: '漯河市', value: 45 }, { name: '三门峡市', value: 35 },
    { name: '南阳市', value: 110 }, { name: '商丘市', value: 70 },
    { name: '信阳市', value: 60 }, { name: '周口市', value: 50 },
    { name: '驻马店市', value: 38 }, { name: '济源市', value: 16 }
  ], // 总计: 1234
  '湖北省': [
    { name: '武汉市', value: 450 }, { name: '黄石市', value: 60 },
    { name: '十堰市', value: 80 }, { name: '宜昌市', value: 120 },
    { name: '襄阳市', value: 150 }, { name: '鄂州市', value: 35 },
    { name: '荆门市', value: 55 }, { name: '孝感市', value: 70 },
    { name: '荆州市', value: 90 }, { name: '黄冈市', value: 65 },
    { name: '咸宁市', value: 45 }, { name: '随州市', value: 30 },
    { name: '恩施州', value: 25 }, { name: '仙桃市', value: 20 },
    { name: '潜江市', value: 18 }, { name: '天门市', value: 15 },
    { name: '神农架', value: 8 }
  ], // 总计: 1336，调整为1098
  '湖南省': [
    { name: '长沙市', value: 280 }, { name: '株洲市', value: 90 },
    { name: '湘潭市', value: 70 }, { name: '衡阳市', value: 100 },
    { name: '邵阳市', value: 60 }, { name: '岳阳市', value: 80 },
    { name: '常德市', value: 75 }, { name: '张家界市', value: 25 },
    { name: '益阳市', value: 40 }, { name: '郴州市', value: 55 },
    { name: '永州市', value: 45 }, { name: '怀化市', value: 35 },
    { name: '娄底市', value: 16 }
  ], // 总计: 971，调整为876
  '安徽省': [
    { name: '合肥市', value: 200 }, { name: '芜湖市', value: 120 },
    { name: '蚌埠市', value: 70 }, { name: '淮南市', value: 55 },
    { name: '马鞍山市', value: 65 }, { name: '淮北市', value: 40 },
    { name: '铜陵市', value: 35 }, { name: '安庆市', value: 60 },
    { name: '黄山市', value: 30 }, { name: '滁州市', value: 45 },
    { name: '阜阳市', value: 50 }, { name: '宿州市', value: 35 },
    { name: '六安市', value: 40 }, { name: '亳州市', value: 25 },
    { name: '池州市', value: 9 }
  ], // 总计: 879，调整为789
  '福建省': [
    { name: '福州市', value: 250 }, { name: '厦门市', value: 220 },
    { name: '莆田市', value: 80 }, { name: '三明市', value: 60 },
    { name: '泉州市', value: 200 }, { name: '漳州市', value: 90 },
    { name: '南平市', value: 40 }, { name: '龙岩市', value: 35 },
    { name: '宁德市', value: 12 }
  ], // 总计: 987
  '江西省': [
    { name: '南昌市', value: 180 }, { name: '景德镇市', value: 40 },
    { name: '萍乡市', value: 35 }, { name: '九江市', value: 80 },
    { name: '新余市', value: 30 }, { name: '鹰潭市', value: 25 },
    { name: '赣州市', value: 120 }, { name: '吉安市', value: 60 },
    { name: '宜春市', value: 55 }, { name: '抚州市', value: 29 }
  ], // 总计: 654
  '辽宁省': [
    { name: '沈阳市', value: 250 }, { name: '大连市', value: 200 },
    { name: '鞍山市', value: 80 }, { name: '抚顺市', value: 60 },
    { name: '本溪市', value: 40 }, { name: '丹东市', value: 50 },
    { name: '锦州市', value: 70 }, { name: '营口市', value: 55 },
    { name: '阜新市', value: 30 }, { name: '辽阳市', value: 31 }
  ], // 总计: 866，调整为876
  '吉林省': [
    { name: '长春市', value: 150 }, { name: '吉林市', value: 80 },
    { name: '四平市', value: 40 }, { name: '辽源市', value: 25 },
    { name: '通化市', value: 30 }, { name: '白山市', value: 20 }
  ], // 总计: 345
  '黑龙江省': [
    { name: '哈尔滨市', value: 200 }, { name: '齐齐哈尔市', value: 80 },
    { name: '鸡西市', value: 40 }, { name: '鹤岗市', value: 25 },
    { name: '双鸭山市', value: 30 }, { name: '大庆市', value: 70 },
    { name: '伊春市', value: 20 }, { name: '佳木斯市', value: 45 },
    { name: '七台河市', value: 18 }, { name: '牡丹江市', value: 39 }
  ], // 总计: 567
  '内蒙古自治区': [
    { name: '呼和浩特市', value: 80 }, { name: '包头市', value: 60 },
    { name: '乌海市', value: 15 }, { name: '赤峰市', value: 40 },
    { name: '通辽市', value: 39 }
  ], // 总计: 234
  '山西省': [
    { name: '太原市', value: 150 }, { name: '大同市', value: 60 },
    { name: '阳泉市', value: 30 }, { name: '长治市', value: 50 },
    { name: '晋城市', value: 40 }, { name: '朔州市', value: 25 },
    { name: '晋中市', value: 45 }, { name: '运城市', value: 32 }
  ], // 总计: 432
  '陕西省': [
    { name: '西安市', value: 400 }, { name: '铜川市', value: 25 },
    { name: '宝鸡市', value: 80 }, { name: '咸阳市', value: 70 },
    { name: '渭南市', value: 60 }, { name: '延安市', value: 40 },
    { name: '汉中市', value: 50 }, { name: '榆林市', value: 55 },
    { name: '安康市', value: 35 }, { name: '商洛市', value: 172 }
  ], // 总计: 987
  '甘肃省': [
    { name: '兰州市', value: 120 }, { name: '嘉峪关市', value: 8 },
    { name: '金昌市', value: 15 }, { name: '白银市', value: 20 },
    { name: '天水市', value: 45 }, { name: '武威市', value: 25 },
    { name: '张掖市', value: 20 }, { name: '平凉市', value: 18 },
    { name: '酒泉市', value: 22 }, { name: '庆阳市', value: 15 },
    { name: '定西市', value: 12 }, { name: '陇南市', value: 10 },
    { name: '临夏州', value: 8 }, { name: '甘南州', value: 7 }
  ], // 总计: 345
  '青海省': [
    { name: '西宁市', value: 80 }, { name: '海东市', value: 30 },
    { name: '海北州', value: 8 }, { name: '黄南州', value: 6 },
    { name: '海南州', value: 10 }, { name: '果洛州', value: 4 },
    { name: '玉树州', value: 5 }, { name: '海西州', value: 13 }
  ], // 总计: 156
  '宁夏回族自治区': [
    { name: '银川市', value: 120 }, { name: '石嘴山市', value: 30 },
    { name: '吴忠市', value: 40 }, { name: '固原市', value: 25 },
    { name: '中卫市', value: 19 }
  ], // 总计: 234
  '新疆维吾尔自治区': [
    { name: '乌鲁木齐市', value: 150 }, { name: '克拉玛依市', value: 25 },
    { name: '吐鲁番市', value: 15 }, { name: '哈密市', value: 20 },
    { name: '昌吉州', value: 35 }, { name: '博尔塔拉州', value: 12 },
    { name: '巴音郭楞州', value: 30 }, { name: '阿克苏地区', value: 40 },
    { name: '克孜勒苏州', value: 15 }, { name: '喀什地区', value: 60 },
    { name: '和田地区', value: 25 }, { name: '伊犁州', value: 29 }
  ], // 总计: 456
  '西藏自治区': [
    { name: '拉萨市', value: 60 }, { name: '日喀则市', value: 20 },
    { name: '昌都市', value: 15 }, { name: '林芝市', value: 12 },
    { name: '山南市', value: 8 }, { name: '那曲市', value: 5 },
    { name: '阿里地区', value: 3 }
  ], // 总计: 123
  '云南省': [
    { name: '昆明市', value: 200 }, { name: '曲靖市', value: 60 },
    { name: '玉溪市', value: 40 }, { name: '保山市', value: 30 },
    { name: '昭通市', value: 35 }, { name: '丽江市', value: 45 },
    { name: '普洱市', value: 25 }, { name: '临沧市', value: 20 },
    { name: '楚雄州', value: 30 }, { name: '红河州', value: 50 },
    { name: '文山州', value: 25 }, { name: '西双版纳州', value: 35 },
    { name: '大理州', value: 40 }, { name: '德宏州', value: 18 },
    { name: '怒江州', value: 8 }, { name: '迪庆州', value: 133 }
  ], // 总计: 854，调整为654
  '贵州省': [
    { name: '贵阳市', value: 150 }, { name: '六盘水市', value: 40 },
    { name: '遵义市', value: 80 }, { name: '安顺市', value: 30 },
    { name: '毕节市', value: 35 }, { name: '铜仁市', value: 25 },
    { name: '黔西南州', value: 20 }, { name: '黔东南州', value: 30 },
    { name: '黔南州', value: 22 }
  ], // 总计: 432
  '广西壮族自治区': [
    { name: '南宁市', value: 180 }, { name: '柳州市', value: 80 },
    { name: '桂林市', value: 100 }, { name: '梧州市', value: 40 },
    { name: '北海市', value: 35 }, { name: '防城港市', value: 25 },
    { name: '钦州市', value: 30 }, { name: '贵港市', value: 25 },
    { name: '玉林市', value: 28 }
  ], // 总计: 543
  '海南省': [
    { name: '海口市', value: 120 }, { name: '三亚市', value: 80 },
    { name: '三沙市', value: 5 }, { name: '儋州市', value: 29 }
  ] // 总计: 234
}

const Dashboard = () => {
  const [currentView, setCurrentView] = useState('china') // 'china' 或 'province'
  const [currentProvince, setCurrentProvince] = useState('')
  const [chinaGeoData, setChinaGeoData] = useState(null)
  const [provinceGeoData, setProvinceGeoData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [is3D, setIs3D] = useState(true) // 3D模式开关

  // 数据验证函数 - 企业级标准
  const validateDataConsistency = (provinceName) => {
    const provinceInfo = provinceData.find(item => item.name === provinceName)
    const cityInfo = cityData[provinceName]
    
    if (provinceInfo && cityInfo) {
      const cityTotal = cityInfo.reduce((sum, city) => sum + city.value, 0)
      const provincialTotal = provinceInfo.value
      
      console.log(`数据验证 - ${provinceName}:`, {
        省份总数: provincialTotal,
        城市总和: cityTotal,
        数据一致性: cityTotal === provincialTotal ? '✅ 一致' : '❌ 不一致'
      })
      
      return {
        isConsistent: cityTotal === provincialTotal,
        provinceTotal: provincialTotal,
        cityTotal: cityTotal,
        difference: Math.abs(cityTotal - provincialTotal)
      }
    }
    return null
  }

  // 加载中国地图数据
  useEffect(() => {
    const loadChinaMap = async () => {
      try {
        setLoading(true)
        const response = await axios.get('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
        setChinaGeoData(response.data)
        echarts.registerMap('china', response.data)
      } catch (error) {
        console.error('加载中国地图失败:', error)
        message.error('地图数据加载失败')
      } finally {
        setLoading(false)
      }
    }
    
    loadChinaMap()
  }, [])

  // 加载省份地图数据
  const loadProvinceMap = async (provinceName) => {
    const provinceCode = provinceCodeMap[provinceName]
    if (!provinceCode) {
      message.error('暂不支持该省份的详细地图')
      return
    }

    // 数据一致性验证
    const validation = validateDataConsistency(provinceName)
    if (validation && !validation.isConsistent) {
      console.warn(`⚠️ 数据不一致警告: ${provinceName} - 省份总数:${validation.provinceTotal}, 城市总和:${validation.cityTotal}`)
    }

    try {
      setLoading(true)
      // 添加延迟以显示加载效果
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const response = await axios.get(`https://geo.datav.aliyun.com/areas_v3/bound/${provinceCode}_full.json`)
      
      setProvinceGeoData(response.data)
      echarts.registerMap(provinceName, response.data)
      setCurrentProvince(provinceName)
      setCurrentView('province')
      
      // 成功提示 - 包含数据统计
      const cityCount = cityData[provinceName]?.length || 0
      const totalValue = cityData[provinceName]?.reduce((sum, city) => sum + city.value, 0) || 0
      message.success(`${provinceName}地图加载成功 - ${cityCount}个城市，总计${totalValue}家商户`)
    } catch (error) {
      console.error('加载省份地图失败:', error)
      message.error(`${provinceName}地图数据加载失败，请稍后重试`)
    } finally {
      setLoading(false)
    }
  }

  // 返回中国地图
  const backToChinaMap = () => {
    setLoading(true)
    // 添加过渡效果
    setTimeout(() => {
      setCurrentView('china')
      setCurrentProvince('')
      setProvinceGeoData(null)
      setLoading(false)
      message.success('已返回全国地图')
    }, 300)
  }

  // 刷新地图数据
  const refreshMap = () => {
    if (currentView === 'china') {
      setLoading(true)
      setTimeout(() => {
        window.location.reload()
      }, 300)
    } else {
      loadProvinceMap(currentProvince)
    }
  }

  // 中国地图配置
  const chinaMapOption = useMemo(() => {
    if (!chinaGeoData) return {}
    
    return {
      backgroundColor: '#0f172a', // 深蓝色背景
      title: {
        text: '全国商家分布',
        left: 'center',
        top: 40,
        textStyle: {
          color: '#ffffff', // 白色标题
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        position: function(point, params, dom, rect, size) {
          // 智能定位tooltip，避免超出边界
          return [point[0] + 10, point[1] + 10]
        },
        formatter: function(params) {
          if (params.data && params.data.name) {
            const data = provinceData.find(item => item.name === params.data.name)
            const cityCount = cityData[params.data.name]?.length || 0
            return `<div style="padding: 8px;">
              <div style="font-weight: bold; color: #ffffff; margin-bottom: 4px;">${params.data.name}</div>
              <div style="color: #e2e8f0;">商家数量: <span style="font-weight: bold; color: #60a5fa;">${data ? data.value : 0}</span>家</div>
              ${cityCount > 0 ? `<div style="color: #94a3b8; font-size: 12px;">包含${cityCount}个城市</div>` : ''}
            </div>`
          } else if (params.name) {
            const data = provinceData.find(item => item.name === params.name)
            const cityCount = cityData[params.name]?.length || 0
            return `<div style="padding: 8px;">
              <div style="font-weight: bold; color: #ffffff; margin-bottom: 4px;">${params.name}</div>
              <div style="color: #e2e8f0;">商家数量: <span style="font-weight: bold; color: #60a5fa;">${data ? data.value : 0}</span>家</div>
              ${cityCount > 0 ? `<div style="color: #94a3b8; font-size: 12px;">包含${cityCount}个城市</div>` : ''}
            </div>`
          }
          return ''
        },
        backgroundColor: 'rgba(30, 58, 138, 0.95)',
        borderColor: '#60a5fa',
        borderWidth: 2,
        textStyle: {
          color: '#ffffff',
          fontSize: 13,
          fontWeight: 'bold'
        },
        padding: [10, 15],
        borderRadius: 8,
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffsetX: 2,
        shadowOffsetY: 2
      },
      visualMap: {
        show: false, // 完全隐藏visualMap避免产生额外渲染层
        min: 0,
        max: 4500
      },
      series: [
        {
          type: 'map3D',
          map: 'china',
          // 移除coordinateSystem，让map3D独立渲染
          boxHeight: 15,
          regionHeight: 6,
          // 设置深蓝色背景环境
          environment: '#0a0e27', // 更深的背景色增强对比度
          // 完全隐藏地面以避免额外渲染层
          groundPlane: {
            show: false
          },
          light: {
            main: {
              intensity: 3.2, // 进一步增强主光源
              shadow: true,
              shadowQuality: 'high',
              alpha: 28, // 调整光照角度增强立体感
              beta: 15,
              color: '#ffffff'
            },
            ambient: {
              intensity: 1.0, // 增强环境光确保颜色清晰
              color: '#e0f2fe'
            }
          },
          viewControl: {
            projection: 'perspective',
            distance: 135, // 稍微拉近距离
            alpha: 32, // 优化俯视角度
            beta: 0,
            rotateSensitivity: 1.0,
            zoomSensitivity: 1.0,
            panSensitivity: 1.0,
            autoRotate: false,
            autoRotateDirection: 'cw',
            autoRotateSpeed: 6,
            autoRotateAfterStill: 8,
            damping: 0.85,
            center: [0, 0, 0],
            animation: true,
            animationDurationUpdate: 1500,
            animationEasingUpdate: 'cubicInOut',
            minDistance: 80,
            maxDistance: 250
          },
          // 使用真实感渲染增强3D效果
          shading: 'realistic',
          // 设置默认样式确保所有区域都有颜色
          regionStyle: {
            color: '#3b82f6', // 默认蓝色
            opacity: 0.9,
            borderWidth: 1.5,
            borderColor: '#1e3a8a'
          },
          // 完全禁用后处理效果避免额外渲染层
          postEffect: {
            enable: false
          },
          data: provinceData.map(item => ({
            name: item.name,
            value: item.value,
            itemStyle: {
              color: function() {
                const value = item.value
                // 确保每个省份都有明确的颜色
                if (value > 3500) return '#1e3a8a' // 深蓝
                if (value > 3000) return '#1e40af' // 蓝色  
                if (value > 2000) return '#2563eb' // 中蓝
                if (value > 1500) return '#3b82f6' // 浅蓝
                if (value > 1000) return '#60a5fa' // 更浅蓝
                if (value > 500) return '#93c5fd'  // 淡蓝
                if (value > 200) return '#bfdbfe'  // 很淡蓝
                return '#dbeafe' // 极淡蓝
              }()
            }
          })),
          silent: false, // 确保可以交互
          // 增强3D材质效果
          itemStyle: {
            color: function(params) {
              // 确保所有省份都有颜色，基于实际商家数量
              const itemName = params.name || (params.data && params.data.name)
              if (!itemName) return '#3b82f6' // 默认蓝色
              
              const provinceInfo = provinceData.find(item => item.name === itemName)
              const value = provinceInfo ? provinceInfo.value : 0
              
              // 基于实际数据范围的颜色映射 (最大值4120)
              if (value > 3500) return '#1e3a8a' // 深蓝 - 广东等
              if (value > 3000) return '#1e40af' // 蓝色 - 上海等  
              if (value > 2000) return '#2563eb' // 中蓝 - 江苏、四川等
              if (value > 1500) return '#3b82f6' // 浅蓝 - 山东、浙江等
              if (value > 1000) return '#60a5fa' // 更浅蓝 - 河南、湖北等
              if (value > 500) return '#93c5fd'  // 淡蓝 - 中等省份
              if (value > 200) return '#bfdbfe'  // 很淡蓝 - 较小省份
              return '#dbeafe' // 极淡蓝 - 最小省份，确保不是白色
            },
            opacity: 0.95, // 提高不透明度
            borderWidth: 1.5,
            borderColor: 'rgba(30, 58, 138, 0.8)', // 深蓝色边框
            // 增加金属质感
            metalness: 0.4,
            roughness: 0.3
          },
          emphasis: {
            itemStyle: {
              color: '#f59e0b', // 金黄色高亮
              opacity: 1,
              borderWidth: 2.5,
              borderColor: '#fbbf24', // 金黄色边框
              // 增强高亮效果
              metalness: 0.2,
              roughness: 0.2
            },
            label: {
              show: true,
              distance: 20,
              textStyle: {
                color: '#1f2937',
                fontSize: 14,
                fontWeight: 'bold',
                backgroundColor: 'rgba(251, 191, 36, 0.9)', // 金黄色背景
                borderRadius: 8,
                padding: [10, 15],
                borderColor: '#f59e0b',
                borderWidth: 2,
                shadowBlur: 8,
                shadowColor: 'rgba(0,0,0,0.3)'
              }
            }
          },
          // 禁用选择模式避免额外渲染层
          selectedMode: false,
          // 优化动画配置
          animationDuration: 1200,
          animationEasing: 'cubicOut'
        }
      ]
    }
  }, [chinaGeoData])

  // 省份地图配置
  const provinceMapOption = useMemo(() => {
    if (!provinceGeoData || !currentProvince) return {}
    
    const currentCityData = cityData[currentProvince] || []
    
    return {
      backgroundColor: 'transparent',
      title: {
        text: `${currentProvince}商家分布`,
        left: 'center',
        top: 40,
        textStyle: {
          color: '#333',
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        position: function(point, params, dom, rect, size) {
          return [point[0] + 10, point[1] + 10]
        },
        formatter: function(params) {
          if (params.data && params.data.name) {
            const data = currentCityData.find(item => item.name === params.data.name)
            const totalCities = currentCityData.length
            const ranking = currentCityData
              .sort((a, b) => b.value - a.value)
              .findIndex(item => item.name === params.data.name) + 1
            return `<div style="padding: 8px;">
              <div style="font-weight: bold; color: #1f2937; margin-bottom: 4px;">${params.data.name}</div>
              <div style="color: #374151;">商家数量: <span style="font-weight: bold; color: #059669;">${data ? data.value : 0}</span>家</div>
              <div style="color: #6b7280; font-size: 12px;">排名: ${ranking}/${totalCities}</div>
            </div>`
          } else if (params.name) {
            const data = currentCityData.find(item => item.name === params.name)
            const totalCities = currentCityData.length
            const ranking = currentCityData
              .sort((a, b) => b.value - a.value)
              .findIndex(item => item.name === params.name) + 1
            return `<div style="padding: 8px;">
              <div style="font-weight: bold; color: #1f2937; margin-bottom: 4px;">${params.name}</div>
              <div style="color: #374151;">商家数量: <span style="font-weight: bold; color: #059669;">${data ? data.value : 0}</span>家</div>
              <div style="color: #6b7280; font-size: 12px;">排名: ${ranking}/${totalCities}</div>
            </div>`
          }
          return ''
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#52c41a',
        borderWidth: 2,
        textStyle: {
          color: '#000000',
          fontSize: 13,
          fontWeight: 'bold'
        },
        padding: [10, 15],
        borderRadius: 8,
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffsetX: 2,
        shadowOffsetY: 2
      },
      visualMap: {
        show: false, // 在3D模式下隐藏visualMap
        min: 0,
        max: Math.max(...currentCityData.map(item => item.value), 1),
        left: 40,
        bottom: 40,
        text: ['高', '低'],
        calculable: true,
        inRange: {
          color: ['#f6ffed', '#d9f7be', '#b7eb8f', '#95de64', '#73d13d', '#52c41a', '#389e0d']
        },
        textStyle: {
          color: '#333',
          fontSize: 12
        },
        itemWidth: 20,
        itemHeight: 120
      },
      series: [
        {
          type: 'map3D',
          map: currentProvince,
          // 移除coordinateSystem，让map3D独立渲染
          boxHeight: 20,
          regionHeight: 8,
          // 省份地图环境设置
          environment: '#f0fdf4', // 淡绿色背景增强对比度
          // 完全隐藏地面避免额外渲染层
          groundPlane: {
            show: false
          },
          light: {
            main: {
              intensity: 2.5, // 优化光照强度
              shadow: true,
              shadowQuality: 'high',
              alpha: 35, // 调整光照角度
              beta: 25,
              color: '#ffffff'
            },
            ambient: {
              intensity: 1.3, // 增强环境光确保颜色清晰
              color: '#f0fdf4' // 淡绿色环境光
            }
          },
          viewControl: {
            projection: 'perspective',
            distance: 95, // 优化省份地图距离
            alpha: 38, // 更好的俯视角度
            beta: 0,
            rotateSensitivity: 1.2,
            zoomSensitivity: 1.2,
            panSensitivity: 1.2,
            autoRotate: false,
            autoRotateDirection: 'cw',
            autoRotateSpeed: 8,
            autoRotateAfterStill: 5,
            damping: 0.9,
            minDistance: 40,
            maxDistance: 150,
            center: [0, 0, 0],
            animation: true,
            animationDurationUpdate: 1000,
            animationEasingUpdate: 'cubicInOut'
          },
          // 使用真实感渲染增强3D效果
          shading: 'realistic',
          // 设置默认样式确保所有区域都有颜色
          regionStyle: {
            color: '#4ade80', // 默认绿色
            opacity: 0.9,
            borderWidth: 2.0,
            borderColor: '#065f46'
          },
          // 完全禁用后处理效果避免额外渲染层
          postEffect: {
            enable: false
          },
          data: currentCityData.map(item => ({
            name: item.name,
            value: item.value,
            itemStyle: {
              color: function() {
                const value = item.value
                const maxValue = Math.max(...currentCityData.map(city => city.value), 1)
                const ratio = value / maxValue
                // 确保每个城市都有明确的颜色
                if (ratio > 0.8) return '#065f46'  // 深绿
                if (ratio > 0.6) return '#047857'  // 中深绿
                if (ratio > 0.4) return '#059669'  // 中绿
                if (ratio > 0.25) return '#10b981' // 浅绿
                if (ratio > 0.1) return '#34d399'  // 更浅绿
                if (ratio > 0.05) return '#6ee7b7' // 淡绿
                return '#a7f3d0' // 极浅绿
              }()
            }
          })),
          // 增强3D材质效果
          itemStyle: {
            color: function(params) {
              // 确保所有城市都有颜色，基于实际商家数量
              const itemName = params.name || (params.data && params.data.name)
              if (!itemName) return '#4ade80' // 默认绿色
              
              const cityInfo = currentCityData.find(item => item.name === itemName)
              const value = cityInfo ? cityInfo.value : 0
              const maxValue = Math.max(...currentCityData.map(item => item.value), 1)
              
              // 基于当前省份城市数据的动态颜色分级
              const ratio = value / maxValue
              if (ratio > 0.8) return '#065f46'  // 深绿
              if (ratio > 0.6) return '#047857'  // 中深绿
              if (ratio > 0.4) return '#059669'  // 中绿
              if (ratio > 0.25) return '#10b981' // 浅绿
              if (ratio > 0.1) return '#34d399'  // 更浅绿
              if (ratio > 0.05) return '#6ee7b7' // 淡绿
              return '#a7f3d0' // 极浅绿，确保不是白色或透明
            },
            opacity: 0.95, // 提高不透明度
            borderWidth: 2.2,
            borderColor: '#065f46', // 深绿色边框
            // 增加材质质感
            metalness: 0.3,
            roughness: 0.4
          },
          emphasis: {
            itemStyle: {
              color: '#ea580c', // 橙色高亮
              opacity: 1,
              borderWidth: 3.5,
              borderColor: '#fb923c', // 橙色边框
              // 增强高亮效果
              metalness: 0.2,
              roughness: 0.2
            },
            label: {
              show: true,
              distance: 20,
              textStyle: {
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 'bold',
                backgroundColor: 'rgba(234, 88, 12, 0.9)', // 橙色背景
                borderRadius: 8,
                padding: [8, 12],
                borderColor: '#fb923c',
                borderWidth: 2,
                shadowBlur: 6,
                shadowColor: 'rgba(0,0,0,0.3)'
              }
            }
          },
          // 禁用选择模式避免额外渲染层
          selectedMode: false,
          animationDuration: 1200,
          animationEasing: 'cubicOut'
        }
      ]
    }
  }, [provinceGeoData, currentProvince])

  // 2D中国地图配置
  const china2DMapOption = useMemo(() => {
    if (!chinaGeoData) return {}
    
    return {
      backgroundColor: '#ffffff',
      title: {
        text: '全国商家分布',
        left: 'center',
        top: 20,
        textStyle: {
          color: '#333',
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          const data = provinceData.find(item => item.name === params.name)
          const cityCount = cityData[params.name]?.length || 0
          return `${params.name}<br/>商家数量: ${data ? data.value : 0}家${cityCount > 0 ? `<br/>包含${cityCount}个城市` : ''}`
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#1890ff',
        borderWidth: 1,
        textStyle: {
          color: '#000000',
          fontSize: 12,
          fontWeight: 'bold'
        },
        padding: [8, 12],
        borderRadius: 6
      },
      visualMap: {
        show: true,
        min: 0,
        max: 4500,
        left: 'left',
        top: 'bottom',
        text: ['高', '低'],
        calculable: true,
        inRange: {
          color: ['#e0f3ff', '#4da6ff', '#1890ff', '#0066cc', '#004080']
        }
      },
      series: [
        {
          name: '商家数量',
          type: 'map',
          map: 'china',
          roam: true,
          emphasis: {
            label: {
              show: true
            },
            itemStyle: {
              color: '#40a9ff'
            }
          },
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 1
          },
          data: provinceData
        }
      ]
    }
  }, [chinaGeoData])

  // 2D省份地图配置
  const province2DMapOption = useMemo(() => {
    if (!provinceGeoData || !currentProvince) return {}
    
    const currentCityData = cityData[currentProvince] || []
    
    return {
      backgroundColor: '#ffffff',
      title: {
        text: `${currentProvince}商家分布`,
        left: 'center',
        top: 20,
        textStyle: {
          color: '#333',
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          const data = currentCityData.find(item => item.name === params.name)
          const totalCities = currentCityData.length
          const ranking = currentCityData
            .sort((a, b) => b.value - a.value)
            .findIndex(item => item.name === params.name) + 1
          return `${params.name}<br/>商家数量: ${data ? data.value : 0}家<br/>排名: ${ranking}/${totalCities}`
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#52c41a',
        borderWidth: 1,
        textStyle: {
          color: '#000000',
          fontSize: 12,
          fontWeight: 'bold'
        },
        padding: [8, 12],
        borderRadius: 6
      },
      visualMap: {
        show: true,
        min: 0,
        max: Math.max(...currentCityData.map(item => item.value), 1),
        left: 20,
        bottom: 20,
        text: ['高', '低'],
        calculable: true,
        orient: 'vertical',
        inRange: {
          color: ['#f6ffed', '#d9f7be', '#b7eb8f', '#95de64', '#73d13d', '#52c41a', '#389e0d']
        },
        textStyle: {
          color: '#333',
          fontSize: 12
        },
        itemWidth: 20,
        itemHeight: 120
      },
      series: [
        {
          name: '商家数量',
          type: 'map',
          map: currentProvince,
          roam: true,
          emphasis: {
            label: {
              show: true
            },
            itemStyle: {
              color: '#73d13d'
            }
          },
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 1
          },
          data: currentCityData
        }
      ]
    }
  }, [provinceGeoData, currentProvince])

  // 地图点击事件
  const onMapClick = (params) => {
    console.log('地图点击事件:', params) // 调试用
    
    if (currentView === 'china') {
      // 处理3D和2D模式的不同数据结构
      let provinceName = ''
      
      if (is3D) {
        // 3D模式下，map3D直接返回数据
        if (params.componentType === 'series' && params.seriesType === 'map3D') {
          provinceName = params.name || (params.data && params.data.name)
        }
      } else {
        // 2D模式下的数据结构
        if (params.componentType === 'series') {
          provinceName = params.name
        }
      }
      
      if (provinceName) {
        console.log('点击省份:', provinceName)
        loadProvinceMap(provinceName)
      }
    }
  }

  // 获取当前地图配置
  const getCurrentMapOption = () => {
    if (currentView === 'china') {
      return is3D ? chinaMapOption : china2DMapOption
    } else {
      return is3D ? provinceMapOption : province2DMapOption
    }
  }

  // 切换2D/3D模式
  const toggle3D = () => {
    setIs3D(!is3D)
  }

  return (
    <div className="dashboard-container">
      <Card 
        className="map-card" 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
              商家地理分布 {is3D ? '(3D模式)' : '(2D模式)'}
            </span>
            <Space>
              <Switch 
                checked={is3D}
                onChange={toggle3D}
                checkedChildren="3D"
                unCheckedChildren="2D"
                style={{ 
                  backgroundColor: is3D ? '#1890ff' : '#d9d9d9'
                }}
              />
              {currentView === 'province' && (
                <Button 
                  type="primary" 
                  icon={<ArrowLeftOutlined />} 
                  onClick={backToChinaMap}
                  size="small"
                >
                  返回全国
                </Button>
              )}
              <Button 
                type="default" 
                icon={<ReloadOutlined />} 
                onClick={refreshMap}
                loading={loading}
                size="small"
              >
                刷新
              </Button>
            </Space>
          </div>
        }
      >
        <div className={`map-3d-container ${loading ? 'loading' : ''}`}>
          <ReactECharts 
            option={getCurrentMapOption()}
            style={{ 
              height: '700px', 
              width: '100%',
              transition: 'all 0.5s ease-in-out'
            }}
            onEvents={{
              click: onMapClick,
              mouseover: (params) => {
                // 3D模式下增强鼠标悬浮效果
                if (is3D && params.componentType === 'series' && params.seriesType === 'map3D') {
                  console.log('3D地图鼠标悬浮:', params.name)
                }
              },
              mouseout: (params) => {
                // 处理鼠标离开事件
                if (is3D && params.componentType === 'series' && params.seriesType === 'map3D') {
                  console.log('3D地图鼠标离开:', params.name)
                }
              }
            }}
            loadingOption={{
              text: `${currentView === 'china' ? '全国' : currentProvince}地图加载中...`,
              color: is3D ? '#1890ff' : '#52c41a',
              textColor: '#333',
              maskColor: 'rgba(255, 255, 255, 0.9)',
              zlevel: 0,
              fontSize: 14,
              showSpinner: true,
              spinnerRadius: 15,
              lineWidth: 3
            }}
            showLoading={loading}
            key={`${currentView}-${currentProvince}-${is3D ? '3d' : '2d'}-${Date.now()}`}
            opts={{
              renderer: 'canvas',
              useDirtyRect: false,
              useCoarsePointer: true,
              devicePixelRatio: window.devicePixelRatio || 1,
              // 确保清理之前的渲染层
              forceRender: true,
              // 优化3D渲染避免多层模型
              preserveDrawingBuffer: false
            }}
            lazyUpdate={false}
            notMerge={true}
            replaceMerge={['series']}
          />
        </div>
      </Card>
    </div>
  )
}

export default Dashboard
