import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button, Input, Card, Avatar, Typography, Space, Spin, message, Tooltip, Badge } from 'antd';
import { 
  SendOutlined, 
  ClearOutlined, 
  SoundOutlined,
  AudioOutlined,
  CloseOutlined,
  RobotOutlined,
  UserOutlined,
  ExpandOutlined,
  CompressOutlined
} from '@ant-design/icons';
import { askGemini } from '../../utils/geminiApi';
import './AiAssistant.scss';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

const AiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversation, setConversation] = useState([
    {
      id: 1,
      type: 'ai',
      content: '你好！我是你的AI助手小雪，有什么可以帮助你的吗？😊',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  // 初始化语音识别
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'zh-CN';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        setIsListening(false);
        message.error('语音识别失败，请重试');
      };
    }

    // 初始化语音合成
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // 发送消息给AI
  const sendMessage = useCallback(async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setConversation(prev => [...prev, userMessage]);
    const currentInputText = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await askGemini(currentInputText);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      };
      
      setConversation(prev => [...prev, aiMessage]);
      
      // 播放AI回复的语音
      if (synthRef.current) {
        synthRef.current.cancel();
        
        const utterance = new SpeechSynthesisUtterance(aiResponse);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        synthRef.current.speak(utterance);
      }
      
    } catch (error) {
      console.error('AI响应错误:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: '抱歉，我现在无法回复，请稍后再试。😔',
        timestamp: new Date(),
      };
      setConversation(prev => [...prev, errorMessage]);
      message.error('AI助手暂时无法响应');
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);

  // 文字转语音
  const speakText = useCallback((text) => {
    if (!synthRef.current) return;
    
    // 停止当前播放
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  }, []);

  // 开始语音识别
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      message.warning('您的浏览器不支持语音识别功能');
      return;
    }
    
    try {
      setIsListening(true);
      recognitionRef.current.start();
    } catch (error) {
      console.error('语音识别启动失败:', error);
      setIsListening(false);
      message.error('语音识别启动失败');
    }
  }, []);

  // 清空对话
  const clearConversation = useCallback(() => {
    setConversation([
      {
        id: 1,
        type: 'ai',
        content: '对话已清空，有什么新问题想问我吗？😊',
        timestamp: new Date(),
      }
    ]);
  }, []);

  // 处理回车键发送
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // 格式化时间
  const formatTime = useCallback((date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  // 处理输入变化
  const handleInputChange = useCallback((e) => {
    setInputText(e.target.value);
  }, []);

  // 主按钮组件（使用 useMemo 避免重复渲染）
  const mainButtonElement = useMemo(() => (
    <div className="ai-assistant-trigger">
      <Badge dot={!isOpen && conversation.length > 1}>
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<RobotOutlined />}
          onClick={() => setIsOpen(!isOpen)}
          className="main-trigger-btn"
          title="AI助手小雪"
        />
      </Badge>
    </div>
  ), [isOpen, conversation.length]);

  // 对话界面
  const ChatInterface = () => (
    <Card
      className={`ai-chat-card ${isExpanded ? 'expanded' : ''}`}
      title={
        <div className="chat-header">
          <Space>
            <Avatar 
              size="small" 
              style={{ backgroundColor: '#87d068' }}
              icon={<RobotOutlined />}
            />
            <Text strong>AI助手小雪</Text>
            <Badge status="success" text="在线" />
          </Space>
          <Space>
            <Tooltip title={isExpanded ? "收起" : "展开"}>
              <Button
                type="text"
                size="small"
                icon={isExpanded ? <CompressOutlined /> : <ExpandOutlined />}
                onClick={() => setIsExpanded(!isExpanded)}
              />
            </Tooltip>
            <Tooltip title="清空对话">
              <Button
                type="text"
                size="small"
                icon={<ClearOutlined />}
                onClick={clearConversation}
              />
            </Tooltip>
            <Tooltip title="关闭">
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => setIsOpen(false)}
              />
            </Tooltip>
          </Space>
        </div>
      }
      bodyStyle={{ 
        padding: 0, 
        height: isExpanded ? '600px' : '400px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 对话区域 */}
      <div className="chat-messages">
        {conversation.map((msg) => (
          <div 
            key={msg.id} 
            className={`message ${msg.type === 'user' ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-avatar">
              {msg.type === 'user' ? (
                <Avatar size="small" icon={<UserOutlined />} />
              ) : (
                <Avatar 
                  size="small" 
                  style={{ backgroundColor: '#87d068' }}
                  icon={<RobotOutlined />}
                />
              )}
            </div>
            <div className="message-content">
              <div className="message-bubble">
                <Paragraph className="message-text">
                  {msg.content}
                </Paragraph>
              </div>
              <div className="message-time">
                {formatTime(msg.timestamp)}
                {msg.type === 'ai' && (
                  <Button
                    type="text"
                    size="small"
                    icon={<SoundOutlined />}
                    loading={isSpeaking}
                    onClick={() => speakText(msg.content)}
                    className="speak-btn"
                    title="播放语音"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai-message">
            <div className="message-avatar">
              <Avatar 
                size="small" 
                style={{ backgroundColor: '#87d068' }}
                icon={<RobotOutlined />}
              />
            </div>
            <div className="message-content">
              <div className="message-bubble">
                <Spin size="small" />
                <Text type="secondary" style={{ marginLeft: '8px' }}>
                  小雪正在思考...
                </Text>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="chat-input">
        <TextArea
          value={inputText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="输入消息...（按Enter发送，Shift+Enter换行）"
          autoSize={{ minRows: 1, maxRows: 3 }}
          disabled={isLoading}
        />
        <div className="input-actions">
          <Space>
            <Tooltip title="语音输入">
              <Button
                type="text"
                icon={<AudioOutlined />}
                loading={isListening}
                onClick={startListening}
                disabled={isLoading}
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={sendMessage}
              loading={isLoading}
              disabled={!inputText.trim()}
            >
              发送
            </Button>
          </Space>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="ai-assistant-container">
      {mainButtonElement}
      {isOpen && <ChatInterface />}
    </div>
  );
};

export default AiAssistant;
