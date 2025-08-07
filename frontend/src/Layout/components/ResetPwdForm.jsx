import React from 'react'
import { Form, Input, Button, message } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
// 导入api
import userApi from '@/api/user'
// 导入全局登出方法
import { logout } from '@/store/reducers/userSlice'

export default function ResetPwdForm(props) {
  const { t } = useTranslation()
  const user_id = useSelector((state) => state.user.userinfo.user_id)
  const dispatch = useDispatch()
  const [form] = Form.useForm()

  const navigate = useNavigate()
  const location = useLocation()

  const onCancel = () => {
    form.resetFields()
    props.toggleResetStatus(false)
  }
  const onFinish = async (value) => {
    await userApi.manage.reset({ user_id, ...value })
    message.success(t('resetPassword.success'))
    props.toggleResetStatus(false)
    form.resetFields()
    // 重新登录
    dispatch(logout())
    navigate('/login', { replace: true, state: { preLocation: location } })
  }
  return (
    <>
      <Form
        form={form}
        layout="vertical"
        name="resetPwdForm"
        // initialValues={{ oldPasswordL: '', newPassword: '', confirmPassword: '' }}
        onFinish={onFinish}>
        <Form.Item name="old_password" label={t('resetPassword.oldPassword')} rules={[{ required: true, message: t('resetPassword.oldPasswordRequired') }]}>
          <Input.Password placeholder={t('resetPassword.oldPasswordPlaceholder')} />
        </Form.Item>
        <Form.Item name="password" label={t('resetPassword.newPassword')} rules={[{ required: true, type: 'string', min: 6, max: 10, message: t('resetPassword.newPasswordRule') }]}>
          <Input.Password placeholder={t('resetPassword.newPasswordPlaceholder')} />
        </Form.Item>
        <Form.Item
          name="repassword"
          label={t('resetPassword.confirmPassword')}
          rules={[
            { required: true, message: t('resetPassword.confirmPasswordRequired') },
            ({ getFieldValue }) => ({
              validator(rule, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(t('resetPassword.passwordMismatch'))
              }
            })
          ]}>
          <Input.Password placeholder={t('resetPassword.confirmPasswordPlaceholder')} />
        </Form.Item>
        <Form.Item wrapperCol={{ span: 16, offset: 8 }}>
          <Button onClick={onCancel}>{t('common.cancel')}</Button>
          <Button type="primary" htmlType="submit" style={{ marginLeft: 32 }}>
            {t('common.confirm')}
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
