import { useState, useEffect } from 'react'
import dictApi from '@/api/dict'

// 自定义Hook，用于获取字典数据
const useDict = (dictName) => {
  const [dictionary, setDictionary] = useState([])

  useEffect(() => {
    const fetchDictionary = async () => {
      try {
        // 调用接口获取字典值
        const { data } = await dictApi.getByType(dictName)
        setDictionary(data || [])
      } catch (error) {
        console.error(`获取字典数据失败 (${dictName}):`, error)
        setDictionary([])
      }
    }

    if (dictName) {
      fetchDictionary()
    }
  }, [dictName])

  return dictionary
}
export default useDict
