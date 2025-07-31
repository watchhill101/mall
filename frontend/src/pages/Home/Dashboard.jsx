import React, { useState, useEffect, useMemo } from 'react'
import { Card, Button, message } from 'antd'
import { ReloadOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
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

// 模拟各省份商家数据
const provinceData = [
  { name: '北京市', value: 1289 }, { name: '天津市', value: 956 },
  { name: '河北省', value: 1543 }, { name: '山西省', value: 432 },
  { name: '内蒙古自治区', value: 234 }, { name: '辽宁省', value: 876 },
  { name: '吉林省', value: 345 }, { name: '黑龙江省', value: 567 },
  { name: '上海市', value: 2987 }, { name: '江苏省', value: 1876 },
  { name: '浙江省', value: 1543 }, { name: '安徽省', value: 789 },
  { name: '福建省', value: 987 }, { name: '江西省', value: 654 },
  { name: '山东省', value: 1432 }, { name: '河南省', value: 1234 },
  { name: '湖北省', value: 1098 }, { name: '湖南省', value: 876 },
  { name: '广东省', value: 3456 }, { name: '广西壮族自治区', value: 543 },
  { name: '海南省', value: 234 }, { name: '重庆市', value: 1543 },
  { name: '四川省', value: 1876 }, { name: '贵州省', value: 432 },
  { name: '云南省', value: 654 }, { name: '西藏自治区', value: 123 },
  { name: '陕西省', value: 987 }, { name: '甘肃省', value: 345 },
  { name: '青海省', value: 156 }, { name: '宁夏回族自治区', value: 234 },
  { name: '新疆维吾尔自治区', value: 456 }
]

// 模拟城市数据（当点击省份时显示）
const cityData = {
  '广东省': [
    { name: '广州市', value: 1234 }, { name: '深圳市', value: 1876 },
    { name: '珠海市', value: 345 }, { name: '汕头市', value: 234 },
    { name: '佛山市', value: 567 }, { name: '韶关市', value: 123 },
    { name: '湛江市', value: 234 }, { name: '肇庆市', value: 156 }
  ],
  '江苏省': [
    { name: '南京市', value: 876 }, { name: '苏州市', value: 789 },
    { name: '无锡市', value: 456 }, { name: '常州市', value: 234 }
  ]
  // 可以继续添加其他省份的城市数据
}

const Dashboard = () => {
  const [currentView, setCurrentView] = useState('china') // 'china' 或 'province'
  const [currentProvince, setCurrentProvince] = useState('')
  const [chinaGeoData, setChinaGeoData] = useState(null)
  const [provinceGeoData, setProvinceGeoData] = useState(null)
  const [loading, setLoading] = useState(false)

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

    try {
      setLoading(true)
      const response = await axios.get(`https://geo.datav.aliyun.com/areas_v3/bound/${provinceCode}_full.json`)
      setProvinceGeoData(response.data)
      echarts.registerMap(provinceName, response.data)
      setCurrentProvince(provinceName)
      setCurrentView('province')
    } catch (error) {
      console.error('加载省份地图失败:', error)
      message.error('省份地图数据加载失败')
    } finally {
      setLoading(false)
    }
  }

  // 返回中国地图
  const backToChinaMap = () => {
    setCurrentView('china')
    setCurrentProvince('')
    setProvinceGeoData(null)
  }

  // 刷新地图数据
  const refreshMap = () => {
    if (currentView === 'china') {
      window.location.reload()
    } else {
      loadProvinceMap(currentProvince)
    }
  }

  // 中国地图配置
  const chinaMapOption = useMemo(() => {
    if (!chinaGeoData) return {}
    
    return {
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
          return `${params.name}<br/>商家数量: ${data ? data.value : 0}家`
        }
      },
      visualMap: {
        min: 0,
        max: 3500,
        left: 'left',
        top: 'bottom',
        text: ['高', '低'],
        calculable: true,
        inRange: {
          color: ['#e0f3ff', '#006edd']
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
            }
          },
          data: provinceData
        }
      ]
    }
  }, [chinaGeoData])

  // 省份地图配置
  const provinceMapOption = useMemo(() => {
    if (!provinceGeoData || !currentProvince) return {}
    
    const currentCityData = cityData[currentProvince] || []
    
    return {
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
          return `${params.name}<br/>商家数量: ${data ? data.value : 0}家`
        }
      },
      visualMap: {
        min: 0,
        max: Math.max(...currentCityData.map(item => item.value), 1),
        left: 'left',
        top: 'bottom',
        text: ['高', '低'],
        calculable: true,
        inRange: {
          color: ['#e0f3ff', '#006edd']
        }
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
            }
          },
          data: currentCityData
        }
      ]
    }
  }, [provinceGeoData, currentProvince])

  // 地图点击事件
  const onMapClick = (params) => {
    if (currentView === 'china' && params.componentType === 'series') {
      loadProvinceMap(params.name)
    }
  }

  return (
    <div className="dashboard-container">
      <Card 
        className="map-card" 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>商家地理分布</span>
            <div>
              {currentView === 'province' && (
                <Button 
                  type="primary" 
                  icon={<ArrowLeftOutlined />} 
                  onClick={backToChinaMap}
                  style={{ marginRight: 8 }}
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
            </div>
          </div>
        }
      >
        <ReactECharts 
          option={currentView === 'china' ? chinaMapOption : provinceMapOption}
          style={{ height: '600px', width: '100%' }}
          onEvents={{
            click: onMapClick
          }}
          loadingOption={{
            text: '地图加载中...',
            color: '#1890ff',
            textColor: '#333',
            maskColor: 'rgba(255, 255, 255, 0.8)',
            zlevel: 0
          }}
          showLoading={loading}
        />
      </Card>
    </div>
  )
}

export default Dashboard
