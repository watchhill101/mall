import React from 'react'
import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function NotFound() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  
  const backHome = () => {
    navigate('/home', { replace: true })
  }
  
  return (
    <Result
      status="404"
      title={t('notFound.errorCode')}
      subTitle={t('notFound.description')}
      extra={
        <Button type="primary" onClick={backHome}>
          {t('notFound.backHome')}
        </Button>
      }
    />
  )
}
