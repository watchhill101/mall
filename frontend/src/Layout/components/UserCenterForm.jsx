import React, { useEffect, useState } from 'react'
import { Form, Input, Button, message, Upload } from 'antd'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { setUserinfo } from '@/store/reducers/userSlice'
// 导入api
import userApi from '@/api/user'

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const UserCenterForm = (props) => {
  // 分发方法
  const dispatch = useDispatch()
  // 获取当前登录用户信息
  const userinfo = useSelector((state) => state.user.userinfo)
  // 获取当前登录用户的id
  const user_id = useSelector((state) => state.user.userinfo._id)
  // 上传及表单组件
  const [form] = Form.useForm()
  const [avatarLoading, setAvatarLoading] = useState(false)
  // upload组件回显图片
  const [imageUrl, setImageUrl] = useState()
  const [submitting, setSubmitting] = useState(false)

  /** 图片上传参数及方法 */
  const customRequest = async ({ file, onSuccess, onError }) => {
    setAvatarLoading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      
      const response = await userApi.center.uploadAvatar(formData)
      
      if (response.code === 200) {
        // 获取上传后的图片URL
        const avatarUrl = response.data.avatarUrl
        setImageUrl(avatarUrl)
        
        // 更新全局状态中的头像
        dispatch(setUserinfo({ ...userinfo, avatar: response.data.avatar }))
        
        message.success('头像上传成功!')
        onSuccess(response.data)
      } else {
        throw new Error(response.message || '上传失败')
      }
    } catch (error) {
      console.error('头像上传失败:', error)
      message.error(error.message || '头像上传失败，请重试')
      onError(error)
    } finally {
      setAvatarLoading(false)
    }
  }

  const uploadButton = (
    <div style={{ border: 0, background: 'none', color: '#666' }}>
      {avatarLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8, fontSize: 12 }}>
        {avatarLoading ? '上传中...' : '点击上传'}
      </div>
    </div>
  )

  const onCancel = () => {
    props.toggleCenterStatus(false)
  }
  
  const onFinish = async (values) => {
    setSubmitting(true)
    try {
      const response = await userApi.center.update(values)
      
      if (response.code === 200) {
        // 更新全局状态
        dispatch(setUserinfo({ 
          ...userinfo, 
          ...values, 
          avatar: imageUrl ? userinfo.avatar : userinfo.avatar 
        }))
        message.success('个人信息修改成功!')
        onCancel()
      } else {
        throw new Error(response.message || '修改失败')
      }
    } catch (error) {
      console.error('修改个人信息失败:', error)
      message.error(error.response?.data?.message || error.message || '修改失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    // 获取当前登录用户信息回显
    const fetchUserInfo = async () => {
      try {
        const response = await userApi.center.get(user_id)
        
        if (response.code === 200) {
          const { username, nickname, email, phone, avatar } = response.data
          
          form.setFieldsValue({
            username,
            nickname,
            email,
            phone
          })
          
          // 设置头像URL
          if (avatar) {
            // 如果已经是完整URL，直接使用
            if (avatar.startsWith('http')) {
              setImageUrl(avatar)
            } else {
              // 如果是相对路径，拼接服务器地址
              const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'
              setImageUrl(`${baseUrl}/${avatar}`)
            }
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        message.error('获取用户信息失败')
      }
    }
    
    if (user_id) {
      fetchUserInfo()
    }
  }, [form, user_id])
  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <div style={{ marginBottom: 10, fontSize: 14, color: '#666' }}>头像</div>
        <Upload
          name="avatar"
          listType="picture-circle"
          className="avatar-uploader"
          showUploadList={false}
          customRequest={customRequest}
          beforeUpload={beforeUpload}
          style={{ textAlign: 'center' }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="avatar"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          ) : (
            uploadButton
          )}
        </Upload>
        <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
          支持 JPG、PNG 格式，文件大小不超过 2MB
        </div>
      </div>
      
      {/* 其余表单项 */}
      <Form 
        form={form} 
        layout="vertical" 
        name="userCenterForm" 
        onFinish={onFinish}
        style={{ maxWidth: 400, margin: '0 auto' }}
      >
        <Form.Item 
          name="username" 
          label="用户名" 
          rules={[{ type: 'string', min: 1, max: 20, message: '用户名长度为1-20个字符' }]}
        >
          <Input disabled placeholder="用户名不可修改" />
        </Form.Item>
        
        <Form.Item 
          name="nickname" 
          label="昵称" 
          rules={[
            { type: 'string', max: 20, message: '昵称不能超过20个字符' },
            { pattern: /^[a-zA-Z0-9\u4e00-\u9fa5_-]*$/, message: '昵称只能包含中文、英文、数字、下划线和横线' }
          ]}
        >
          <Input placeholder="请输入昵称" />
        </Form.Item>
        
        <Form.Item 
          name="email" 
          label="邮箱" 
          rules={[
            { required: true, message: '请输入邮箱地址' },
            { type: 'email', message: '请输入有效的邮箱地址' }
          ]}
        >
          <Input placeholder="请输入邮箱地址" />
        </Form.Item>
        
        <Form.Item 
          name="phone" 
          label="手机号" 
          rules={[
            { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
          ]}
        >
          <Input placeholder="请输入手机号码" />
        </Form.Item>
        
        <Form.Item style={{ textAlign: 'center', marginTop: 30 }}>
          <Button onClick={onCancel} style={{ marginRight: 16 }}>
            取消
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={submitting}
          >
            {submitting ? '保存中...' : '确认修改'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
export default UserCenterForm
