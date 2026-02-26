import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, User, Phone, Mail, Paperclip, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/lib/api';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  agentName?: string;
  agentAvatar?: string;
}

interface Agent {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'busy' | 'offline';
  title: string;
}

const API_BASE = API_ENDPOINTS.chat;
const POLLING_INTERVAL = 3000; // 3 seconds

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [step, setStep] = useState<'intro' | 'form' | 'chat'>('intro');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [connectedAgent, setConnectedAgent] = useState<Agent | null>(null);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', phone: '' });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [quickReplies] = useState<string[]>([
    'Sipariş durumum nedir?',
    'Teslimat süresi nedir?',
    'Fiyat teklifi alabilir miyim?',
    'Tasarım desteği var mı?',
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMessageIdRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Polling for new messages
  const pollMessages = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`${API_BASE}?action=get_messages&session_id=${sessionId}&last_id=${lastMessageIdRef.current}`);
      const data = await response.json();
      
      if (data.success && data.messages.length > 0) {
        const newMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          text: msg.text,
          sender: msg.sender as 'user' | 'agent',
          timestamp: new Date(msg.timestamp),
          agentName: msg.agent_name,
          agentAvatar: msg.agent_avatar,
        }));
        
        setMessages(prev => [...prev, ...newMessages]);
        lastMessageIdRef.current = Math.max(...data.messages.map((m: any) => m.id));
        
        // If we received agent messages, stop typing indicator
        if (newMessages.some((m: Message) => m.sender === 'agent')) {
          setIsTyping(false);
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, [sessionId]);

  // Start polling when entering chat
  useEffect(() => {
    if (step === 'chat' && sessionId) {
      pollingRef.current = setInterval(pollMessages, POLLING_INTERVAL);
      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
      };
    }
  }, [step, sessionId, pollMessages]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
  };

  const handleStartChat = () => {
    setStep('form');
  };

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.name || !userInfo.email) return;
    
    setIsConnecting(true);
    
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_session',
          name: userInfo.name,
          email: userInfo.email,
          phone: userInfo.phone,
          page: window.location.pathname,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSessionId(data.session_id);
        setConnectedAgent(data.agent);
        setStep('chat');
        
        // Add initial messages
        const initialMessages: Message[] = [
          {
            id: 1,
            text: 'Merhaba! CVKDijital destek ekibine hoş geldiniz. Size nasıl yardımcı olabilirim?',
            sender: 'agent',
            timestamp: new Date(),
            agentName: 'Destek Ekibi',
            agentAvatar: '🤖',
          },
        ];
        
        if (data.agent) {
          initialMessages.push({
            id: 2,
            text: `Merhaba ${userInfo.name}! Ben ${data.agent.name}, ${data.agent.title}. Size nasıl yardımcı olabilirim?`,
            sender: 'agent',
            timestamp: new Date(),
            agentName: data.agent.name,
            agentAvatar: data.agent.avatar,
          });
        }
        
        setMessages(initialMessages);
        lastMessageIdRef.current = 2;
      }
    } catch (error) {
      console.error('Connection error:', error);
      // Fallback to local chat
      setStep('chat');
      setMessages([{
        id: 1,
        text: 'Merhaba! CVKDijital destek ekibine hoş geldiniz. Size nasıl yardımcı olabilirim?',
        sender: 'agent',
        timestamp: new Date(),
        agentName: 'Destek Ekibi',
        agentAvatar: '🤖',
      }]);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    
    // Send to server
    if (sessionId) {
      try {
        await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send_message',
            session_id: sessionId,
            message: inputMessage,
            sender_type: 'user',
          }),
        });
        
        setIsTyping(true);
      } catch (error) {
        console.error('Send error:', error);
      }
    } else {
      // Local fallback
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const responses = [
          'Anladım, konuyu inceliyorum...',
          'Size en kısa sürede yardımcı olacağım.',
          'Bu konuda size yardımcı olabilirim.',
          'Lütfen biraz bekleyin, bilgileri kontrol ediyorum.',
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: randomResponse,
          sender: 'agent',
          timestamp: new Date(),
          agentName: connectedAgent?.name,
          agentAvatar: connectedAgent?.avatar,
        }]);
      }, 1500 + Math.random() * 1500);
    }
  };

  const handleQuickReply = (reply: string) => {
    setInputMessage(reply);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileMessage: Message = {
        id: Date.now(),
        text: `📎 Dosya gönderildi: ${file.name}`,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fileMessage]);
    }
  };

  const handleClose = async () => {
    if (sessionId) {
      try {
        await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'close_session',
            session_id: sessionId,
          }),
        });
      } catch (error) {
        console.error('Close error:', error);
      }
    }
    setIsOpen(false);
    setStep('intro');
    setMessages([]);
    setSessionId('');
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#0077be] hover:bg-[#005a8f] rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
        >
          <MessageCircle className="w-7 h-7 text-white" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">
              1
            </span>
          )}
          <span className="absolute right-full mr-3 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Canlı Destek
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0077be] to-[#00a8e8] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                {step === 'chat' && connectedAgent ? (
                  <span className="text-2xl">{connectedAgent.avatar}</span>
                ) : (
                  <MessageCircle className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  {step === 'chat' && connectedAgent ? connectedAgent.name : 'Canlı Destek'}
                </h3>
                <p className="text-white/70 text-xs">
                  {step === 'chat' && connectedAgent ? connectedAgent.title : 'Size yardımcı olalım'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {step === 'intro' && (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-[#f0f7fc] rounded-full flex items-center justify-center mb-6">
                  <Bot className="w-10 h-10 text-[#0077be]" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Yapay Zeka Destek</h4>
                <p className="text-gray-600 mb-6">
                  7/24 aktif yapay zeka destek ekibimiz size anında yardımcı olmak için hazır. 
                  Sorularınızı yanıtlamak ve destek sağlamak için buradayız.
                </p>

                <Button
                  onClick={handleStartChat}
                  className="w-full bg-[#0077be] hover:bg-[#005a8f] text-white font-semibold py-6"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Sohbete Başla
                </Button>
                
                <p className="text-gray-400 text-xs mt-4">
                  Ortalama yanıt süresi: Anlık
                </p>
              </div>
            )}

            {step === 'form' && (
              <div className="h-full flex flex-col p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Bilgileriniz</h4>
                <p className="text-gray-600 text-sm mb-6">
                  Size daha iyi hizmet verebilmemiz için lütfen bilgilerinizi girin.
                </p>
                
                <form onSubmit={handleSubmitInfo} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Adınız *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={userInfo.name}
                        onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:border-[#0077be] focus:outline-none"
                        placeholder="Adınız Soyadınız"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">E-posta *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={userInfo.email}
                        onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:border-[#0077be] focus:outline-none"
                        placeholder="ornek@email.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Telefon</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={userInfo.phone}
                        onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:border-[#0077be] focus:outline-none"
                        placeholder="+90 5XX XXX XX XX"
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isConnecting}
                    className="w-full bg-[#0077be] hover:bg-[#005a8f] text-white font-semibold py-6 mt-4"
                  >
                    {isConnecting ? 'Bağlanıyor...' : 'Devam Et'}
                  </Button>
                </form>
              </div>
            )}

            {step === 'chat' && (
              <div className="h-full flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.sender === 'agent' && (
                        <div className="w-8 h-8 rounded-full bg-[#f0f7fc] flex items-center justify-center mr-2 flex-shrink-0">
                          <span className="text-lg">{message.agentAvatar || '🤖'}</span>
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-[#0077be] text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="w-8 h-8 rounded-full bg-[#f0f7fc] flex items-center justify-center mr-2 flex-shrink-0">
                        <span className="text-lg">{connectedAgent?.avatar || '🤖'}</span>
                      </div>
                      <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                <div className="px-4 py-2 border-t border-gray-100">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {quickReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickReply(reply)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-[#0077be]/10 text-gray-600 hover:text-[#0077be] text-xs rounded-full whitespace-nowrap transition-colors"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleFileUpload}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Mesajınızı yazın..."
                      className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-full text-gray-900 focus:border-[#0077be] focus:outline-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className="w-10 h-10 rounded-full bg-[#0077be] flex items-center justify-center text-white hover:bg-[#005a8f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
