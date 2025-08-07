import React, { useEffect, useState } from 'react'
import { Form, Input, Button, message, Upload } from 'antd'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { setUserinfo } from '@/store/reducers/userSlice'
// 导入api
import userApi from '@/api/user'

const UserCenterForm = (props) => {
  const { t } = useTranslation()
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

  // 图片上传前的验证
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
    if (!isJpgOrPng) {
      message.error(t('userProfile.imageFormatError'))
      return false
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error(t('userProfile.imageSizeError'))
      return false
    }
    return true
  }

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
        
        message.success(t('userProfile.avatarUploadSuccess'))
        onSuccess(response.data)
      } else {
        throw new Error(response.message || t('userProfile.avatarUploadFailed'))
      }
    } catch (error) {
      console.error('头像上传失败:', error)
      message.error(error.message || t('userProfile.avatarUploadFailed'))
      onError(error)
    } finally {
      setAvatarLoading(false)
    }
  }

  const uploadButton = (
    <div style={{ border: 0, background: 'none', color: '#666' }}>
      {avatarLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8, fontSize: 12 }}>
        {avatarLoading ? t('userProfile.uploading') : t('userProfile.uploadAvatar')}
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
        message.success(t('userProfile.profileUpdateSuccess'))
        onCancel()
      } else {
        throw new Error(response.message || t('userProfile.profileUpdateFailed'))
      }
    } catch (error) {
      console.error('修改个人信息失败:', error)
      message.error(error.response?.data?.message || error.message || t('userProfile.profileUpdateFailed'))
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
        message.error(t('userProfile.getUserInfoFailed'))
      }
    }
    
    if (user_id) {
      fetchUserInfo()
    }
  }, [form, user_id])
  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <div style={{ marginBottom: 10, fontSize: 14, color: '#666' }}>{t('userProfile.avatar')}</div>
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
          {t('userProfile.supportedFormats')}
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
          label={t('userProfile.username')} 
          rules={[{ type: 'string', min: 1, max: 20, message: t('userProfile.usernameRule') }]}
        >
          <Input disabled placeholder={t('userProfile.usernamePlaceholder')} />
        </Form.Item>
        
        <Form.Item 
          name="nickname" 
          label={t('userProfile.nickname')} 
          rules={[
            { type: 'string', max: 20, message: t('userProfile.nicknameRule') },
            { pattern: /^[a-zA-Z0-9\u4e00-\u9fa5_-]*$/, message: t('userProfile.nicknamePatternRule') }
          ]}
        >
          <Input placeholder={t('userProfile.nicknamePlaceholder')} />
        </Form.Item>
        
        <Form.Item 
          name="email" 
          label={t('userProfile.email')} 
          rules={[
            { required: true, message: t('userProfile.emailRequired') },
            { type: 'email', message: t('userProfile.emailRule') }
          ]}
        >
          <Input placeholder={t('userProfile.emailPlaceholder')} />
        </Form.Item>
        
        <Form.Item 
          name="phone" 
          label={t('userProfile.phone')} 
          rules={[
            { pattern: /^1[3-9]\d{9}$/, message: t('userProfile.phoneRule') }
          ]}
        >
          <Input placeholder={t('userProfile.phonePlaceholder')} />
        </Form.Item>
        
        <Form.Item style={{ textAlign: 'center', marginTop: 30 }}>
          <Button onClick={onCancel} style={{ marginRight: 16 }}>
            {t('userProfile.cancel')}
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={submitting}
          >
            {submitting ? t('userProfile.saving') : t('userProfile.confirmModify')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
export default UserCenterForm
