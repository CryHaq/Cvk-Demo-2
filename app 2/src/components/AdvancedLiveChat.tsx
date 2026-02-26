import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, X, Send, User, Phone, Mail, Paperclip, Bot, 
  History, Star, Check, FileText, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '../services/chatService';
import EmojiPicker from './EmojiPicker';

interface ChatUserInfo {
  name: string;
  email: string;
  phone: string;
}

const QUICK_REPLIES = [
  'Sipariş durumum nedir?',
  'Teslimat süresi nedir?',
  'Fiyat teklifi alabilir miyim?',
  'Tasarım desteği var mı?',
  'Minimum sipariş miktarı?',
  'Malzeme seçenekleri neler?',
];

const SATISFACTION_EMOJIS = [
  { emoji: '😍', label: 'Mükemmel', value: 5 },
  { emoji: '🙂', label: 'İyi', value: 4 },
  { emoji: '😐', label: 'Orta', value: 3 },
  { emoji: '😕', label: 'Kötü', value: 2 },
  { emoji: '😠', label: 'Çok Kötü', value: 1 },
];

export default function AdvancedLiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [step, setStep] = useState<'intro' | 'form' | 'chat' | 'satisfaction'>('intro');
  const [userInfo, setUserInfo] = useState<ChatUserInfo>({ name: '', email: '', phone: '' });
  const [inputMessage, setInputMessage] = useState('');
  const [satisfactionRating, setSatisfactionRating] = useState<number | null>(null);
  const [satisfactionComment, setSatisfactionComment] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isTyping,
    isBotMode,
    messagesEndRef,
    sendMessage,
    sendFile,
    sendQuickReply,
    startSession,
    closeSession,
    saveChatHistory,
  } = useChat();

  // Auto-focus input when chat opens
  useEffect(() => {
    if (step === 'chat' && isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [step, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
  };

  const handleClose = () => {
    if (step === 'chat' && messages.length > 1) {
      setStep('satisfaction');
    } else {
      setIsOpen(false);
      setStep('intro');
    }
  };

  const handleStartChat = () => {
    setStep('form');
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.name || !userInfo.email) return;
    
    startSession(userInfo.name, userInfo.email);
    setStep('chat');
  };

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sendFile(file);
    }
    e.target.value = '';
  };

  const handleSatisfactionSubmit = () => {
    saveChatHistory();
    setIsOpen(false);
    setStep('intro');
    setSatisfactionRating(null);
    setSatisfactionComment('');
    closeSession();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = formatDate(msg.timestamp);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {} as Record<string, typeof messages>);

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-[#0077be] to-[#00a8e8] hover:from-[#005a8f] hover:to-[#0077be] rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
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
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[650px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0077be] to-[#00a8e8] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            {step === 'chat' && !isBotMode ? (
              <span className="text-2xl">👩‍💼</span>
            ) : (
              <Bot className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold">
              {step === 'chat' && !isBotMode ? 'Ayşe K.' : 'CVK Asistan'}
            </h3>
            <p className="text-white/70 text-xs flex items-center gap-1">
              {isTyping ? (
                <>
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Yazıyor...
                </>
              ) : isBotMode ? (
                <>
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  Çevrimiçi
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  Müşteri Temsilcisi
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {step === 'chat' && (
            <button
              onClick={saveChatHistory}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              title="Konuşmayı kaydet"
            >
              <History className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleClose}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {/* Intro */}
        {step === 'intro' && (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-[#0077be]/20 to-[#00a8e8]/20 rounded-full flex items-center justify-center mb-6">
              <Bot className="w-12 h-12 text-[#0077be]" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-3">Size Nasıl Yardımcı Olabilirim?</h4>
            <p className="text-gray-600 mb-6">
              7/24 aktif yapay zeka destek ve uzman müşteri temsilcilerimiz 
              size anında yardımcı olmak için hazır.
            </p>

            <div className="grid grid-cols-2 gap-3 w-full mb-6">
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <span className="text-2xl">⚡</span>
                <p className="text-sm text-gray-600 mt-1">Anında Yanıt</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <span className="text-2xl">🎯</span>
                <p className="text-sm text-gray-600 mt-1">Uzman Destek</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <span className="text-2xl">📎</span>
                <p className="text-sm text-gray-600 mt-1">Dosya Paylaşımı</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <span className="text-2xl">🔒</span>
                <p className="text-sm text-gray-600 mt-1">Güvenli</p>
              </div>
            </div>

            <Button
              onClick={handleStartChat}
              className="w-full bg-gradient-to-r from-[#0077be] to-[#00a8e8] hover:from-[#005a8f] hover:to-[#0077be] text-white font-semibold py-6 rounded-xl"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Sohbete Başla
            </Button>
            
            <p className="text-gray-400 text-xs mt-4">
              Ortalama yanıt süresi: &lt; 1 dakika
            </p>
          </div>
        )}

        {/* Form */}
        {step === 'form' && (
          <div className="h-full flex flex-col p-6">
            <h4 className="text-xl font-bold text-gray-900 mb-2">Bilgileriniz</h4>
            <p className="text-gray-500 text-sm mb-6">
              Size daha iyi hizmet verebilmemiz için lütfen bilgilerinizi girin.
            </p>
            
            <form onSubmit={handleSubmitInfo} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Adınız <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={userInfo.name}
                    onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-[#0077be] focus:ring-2 focus:ring-[#0077be]/20 focus:outline-none transition-all"
                    placeholder="Adınız Soyadınız"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  E-posta <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-[#0077be] focus:ring-2 focus:ring-[#0077be]/20 focus:outline-none transition-all"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Telefon
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-[#0077be] focus:ring-2 focus:ring-[#0077be]/20 focus:outline-none transition-all"
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0077be] to-[#00a8e8] hover:from-[#005a8f] hover:to-[#0077be] text-white font-semibold py-6 mt-4 rounded-xl"
              >
                Sohbete Başla
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>
        )}

        {/* Chat */}
        {step === 'chat' && (
          <div className="h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                  <div className="flex items-center justify-center mb-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                      {date}
                    </span>
                  </div>
                  
                  {dateMessages.map((message, index) => {
                    const isFirstInGroup = index === 0 || dateMessages[index - 1].sender !== message.sender;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
                      >
                        {message.sender !== 'user' && isFirstInGroup && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0077be]/20 to-[#00a8e8]/20 flex items-center justify-center mr-2 flex-shrink-0">
                            <span className="text-lg">{message.agentAvatar || '🤖'}</span>
                          </div>
                        )}
                        {message.sender !== 'user' && !isFirstInGroup && (
                          <div className="w-8 mr-2 flex-shrink-0" />
                        )}
                        
                        <div className={`max-w-[75%] ${message.sender !== 'user' && !isFirstInGroup ? 'ml-10' : ''}`}>
                          {isFirstInGroup && message.sender !== 'user' && (
                            <p className="text-xs text-gray-500 mb-1 ml-1">
                              {message.agentName}
                            </p>
                          )}
                          
                          <div
                            className={`px-4 py-2.5 rounded-2xl ${
                              message.sender === 'user'
                                ? 'bg-gradient-to-r from-[#0077be] to-[#00a8e8] text-white rounded-br-md'
                                : 'bg-gray-100 text-gray-900 rounded-bl-md'
                            }`}
                          >
                            {message.type === 'image' && message.fileUrl ? (
                              <div className="relative">
                                <img 
                                  src={message.fileUrl} 
                                  alt="Gönderilen görsel" 
                                  className="max-w-full rounded-lg mb-2"
                                />
                                <a 
                                  href={message.fileUrl}
                                  download={message.fileName}
                                  className="absolute bottom-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </div>
                            ) : message.type === 'file' ? (
                              <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                <span className="text-sm underline">{message.fileName}</span>
                              </div>
                            ) : null}
                            
                            <p className={`text-sm ${message.type === 'image' || message.type === 'file' ? 'mt-2' : ''}`}>
                              {message.text}
                            </p>
                            
                            <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0077be]/20 to-[#00a8e8]/20 flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-lg">{isBotMode ? '🤖' : '👩‍💼'}</span>
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
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {QUICK_REPLIES.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendQuickReply(reply)}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:border-[#0077be] hover:text-[#0077be] text-gray-600 text-xs rounded-full whitespace-nowrap transition-all"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                
                <button
                  onClick={handleFileUpload}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                  title="Dosya gönder"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <EmojiPicker onSelect={handleEmojiSelect} />
                
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-full text-gray-900 focus:border-[#0077be] focus:ring-2 focus:ring-[#0077be]/20 focus:outline-none transition-all"
                />
                
                <button
                  onClick={handleSend}
                  disabled={!inputMessage.trim()}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0077be] to-[#00a8e8] flex items-center justify-center text-white hover:from-[#005a8f] hover:to-[#0077be] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-xs text-gray-400 text-center mt-2">
                Enter ile gönder
              </p>
            </div>
          </div>
        )}

        {/* Satisfaction Survey */}
        {step === 'satisfaction' && (
          <div className="h-full flex flex-col p-6">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                <Star className="w-10 h-10 text-yellow-500" />
              </div>
              
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                Konuşmamız Nasıldı?
              </h4>
              <p className="text-gray-500 mb-8">
                Deneyiminizi değerlendirerek bize yardımcı olun.
              </p>

              <div className="flex gap-3 mb-6">
                {SATISFACTION_EMOJIS.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setSatisfactionRating(item.value)}
                    className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                      satisfactionRating === item.value
                        ? 'bg-[#0077be]/10 ring-2 ring-[#0077be]'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-3xl mb-1">{item.emoji}</span>
                    <span className="text-xs text-gray-600">{item.label}</span>
                  </button>
                ))}
              </div>

              <textarea
                value={satisfactionComment}
                onChange={(e) => setSatisfactionComment(e.target.value)}
                placeholder="Görüşlerinizi paylaşın (opsiyonel)"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-[#0077be] focus:ring-2 focus:ring-[#0077be]/20 focus:outline-none resize-none mb-4"
                rows={3}
              />

              <Button
                onClick={handleSatisfactionSubmit}
                className="w-full bg-gradient-to-r from-[#0077be] to-[#00a8e8] hover:from-[#005a8f] hover:to-[#0077be] text-white font-semibold py-6 rounded-xl"
              >
                <Check className="w-5 h-5 mr-2" />
                Gönder ve Kapat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
