import React, { useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { CloseOutlined, PieChartOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import Dashboard from './Dashboard'
import './Dashboard.scss'

// 销售总额圆环图组件
const SalesOverviewChart = ({ visible, onClose }) => {
  const [isVisible, setIsVisible] = useState(visible)

  React.useEffect(() => {
    if (visible) {
      setIsVisible(true)
    } else {
      // 延迟隐藏以显示动画
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [visible])

  if (!isVisible) return null;
    const chartOption = {
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicInOut',
    tooltip: {
      trigger: 'item',
      formatter: '{a}<br/>{b}: {c} ({d}%)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 12
      }
    },
    title: [
      {
        text: '2,545,124.24元',
        subtext: '销售总额',
        left: '70%',
        top: '18%',
        textAlign: 'center',
        textStyle: {
          color: '#fff',
          fontSize: 18,
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif'
        },
        subtextStyle: {
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: 12,
          fontWeight: 'normal'
        }
      },
      {
        text: '23.5%',
        subtext: '同比增长',
        left: '70%',
        top: '45%',
        textAlign: 'center',
        textStyle: {
          color: '#52c41a',
          fontSize: 14,
          fontWeight: 'bold'
        },
        subtextStyle: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 10
        }
      },
      {
        text: '1,286',
        subtext: '活跃商户',
        left: '70%',
        top: '65%',
        textAlign: 'center',
        textStyle: {
          color: '#1890ff',
          fontSize: 14,
          fontWeight: 'bold'
        },
        subtextStyle: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 10
        }
      }
    ],
    legend: {
      orient: 'horizontal',
      bottom: '3%',
      left: 'center',
      textStyle: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 9
      },
      itemWidth: 6,
      itemHeight: 6,
      itemGap: 10
    },
    series: [
      {
        name: '业务占比',
        type: 'pie',
        radius: ['30%', '50%'],
        center: ['30%', '42%'],
        avoidLabelOverlap: false,
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx) {
          return Math.random() * 200;
        },
        label: {
          show: false,
          position: 'outside',
          formatter: '{b}: {d}%',
          textStyle: {
            color: '#fff',
            fontSize: 11,
            fontWeight: 'bold'
          }
        },
        emphasis: {
          scale: true,
          scaleSize: 5,
          label: {
            show: true,
            fontSize: 13,
            fontWeight: 'bold',
            formatter: '{d}%',
            position: 'outside',
            textStyle: {
              color: '#fff',
              textShadowColor: 'rgba(0, 0, 0, 0.8)',
              textShadowBlur: 2
            }
          },
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
            borderColor: '#fff',
            borderWidth: 2
          }
        },
        labelLine: {
          show: false,
          emphasis: {
            show: true,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.9)',
              width: 2,
              type: 'solid'
            },
            length: 10,
            length2: 15
          }
        },
        data: [
          { value: 23.5, name: '业务1', itemStyle: { color: '#1890ff' } },
          { value: 19.8, name: '业务2', itemStyle: { color: '#13c2c2' } },
          { value: 18.7, name: '业务3', itemStyle: { color: '#52c41a' } },
          { value: 20.2, name: '业务4', itemStyle: { color: '#faad14' } },
          { value: 17.8, name: '业务5', itemStyle: { color: '#f759ab' } }
        ]
      }
    ]
  }

      return (
     <div className="sales-overview-chart" style={{
              position: 'fixed',
              top: '210px',
              left: '260px',
              zIndex: 1000,
              width: '320px',
      height: '230px',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      borderRadius: '8px',
      padding: '10px',
      pointerEvents: 'auto',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)',
      transition: 'all 0.3s ease-in-out'
    }}>
      {/* 关闭按钮 */}
      <CloseOutlined 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '12px',
          cursor: 'pointer',
          zIndex: 10,
          padding: '4px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
          e.target.style.color = '#fff'
          e.target.style.transform = 'scale(1.1)'
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
          e.target.style.color = 'rgba(255, 255, 255, 0.8)'
          e.target.style.transform = 'scale(1)'
        }}
      />
      
              <ReactECharts 
          option={chartOption}
          style={{ 
            height: '100%', 
            width: '100%'
          }}
          opts={{
            renderer: 'canvas'
          }}
          onEvents={{
            mouseover: (params) => {
              // 鼠标悬停时的效果
              if (params.componentType === 'series') {
                console.log(`悬停在${params.name}: ${params.percent}%`)
              }
            },
            mouseout: (params) => {
              // 鼠标离开时的效果
              if (params.componentType === 'series') {
                console.log(`离开${params.name}`)
              }
            }
          }}
        />
    </div>
  )
}

const Home = () => {
  const [chartVisible, setChartVisible] = useState(true)

  const handleCloseChart = () => {
    setChartVisible(false)
  }

  const handleShowChart = () => {
    setChartVisible(true)
  }

  return (
    <div style={{ position: 'relative' }}>
      <Dashboard />
      <SalesOverviewChart visible={chartVisible} onClose={handleCloseChart} />
      
      {/* 显示图表按钮 */}
      {!chartVisible && (
        <Button
          type="primary"
          icon={<PieChartOutlined />}
          onClick={handleShowChart}
          style={{
            position: 'fixed',
            top: '210px',
            left: '260px',
            zIndex: 1000,
            borderRadius: '8px',
            backgroundColor: 'rgba(24, 144, 255, 0.9)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            animation: 'fadeInScale 0.3s ease-out',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px) scale(1.05)'
            e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)'
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
        >
          显示销售数据统计
        </Button>
      )}
    </div>
  )
}

export default Home
