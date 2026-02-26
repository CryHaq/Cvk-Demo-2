// CVK Dijital - Gelişmiş Chat Service
import { useEffect, useRef, useState, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent' | 'bot';
  timestamp: Date;
  type?: 'text' | 'image' | 'file' | 'quick_reply';
  fileUrl?: string;
  fileName?: string;
  agentName?: string;
  agentAvatar?: string;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  userName: string;
  userEmail: string;
  startedAt: Date;
  status: 'active' | 'closed' | 'waiting';
  assignedAgent?: string;
  topic?: string;
}

// Otomatik yanıt kuralları (Chatbot)
const AUTO_RESPONSES: { pattern: RegExp; response: string; category: string }[] = [
  {
    pattern: /sipari[sş].*durum|sipari[sş].*takip|kargo/i,
    response: 'Siparişinizi takip etmek için "Siparişlerim" sayfasını ziyaret edebilir veya sipariş numaranızı paylaşabilirsiniz. Size yardımcı olmaktan memnuniyet duyarız!',
    category: 'order'
  },
  {
    pattern: /fiyat|teklif|ne kadar|ücret/i,
    response: 'Fiyatlarımız ürün boyutu, malzeme ve miktarına göre değişmektedir. Hemen fiyat hesaplayıcımızı kullanabilir veya size özel teklif için bizimle iletişime geçebilirsiniz.',
    category: 'pricing'
  },
  {
    pattern: /teslimat|süre|ne zaman|kaç gün/i,
    response: 'Standart teslimat süremiz 7-15 iş günüdür. Öncelikli üretim seçeneği ile bu süreyi kısaltabilirsiniz. Detaylı bilgi için size yardımcı olabilirim.',
    category: 'delivery'
  },
  {
    pattern: /tasar[ıi]m|bask[ıi]|logo|grafik/i,
    response: 'Evet, ücretsiz tasarım desteği sunuyoruz! Profesyonel ekibimiz markanıza özel tasarımlar hazırlıyor. Ayrıca kendi tasarımınızı da yükleyebilirsiniz.',
    category: 'design'
  },
  {
    pattern: /malzeme|kalite|bariyer/i,
    response: 'Alüminyum bariyer, Kraft kağıt, Mat/Parlak BOPP ve geri dönüştürülebilir malzemeler sunuyoruz. Hangi ürününüz için ambalaj arıyorsunuz?',
    category: 'material'
  },
  {
    pattern: /minimum|min.*sipari[sş]|adet/i,
    response: 'Minimum sipariş miktarımız 100 adettir. Ne kadar yüksek miktar sipariş verirseniz, birim fiyat o kadar düşer. Detaylı bilgi için fiyat hesaplayıcımızı kullanabilirsiniz.',
    category: 'minimum'
  },
  {
    pattern: /merhaba|selam|günayd[ıi]n|iyi ak[sş]am/i,
    response: 'Merhaba! CVKDijital destek ekibine hoş geldiniz. Size nasıl yardımcı olabilirim?',
    category: 'greeting'
  },
  {
    pattern: /te[sş]ekkür|sa[gğ]ol|eyvallah/i,
    response: 'Rica ederiz! Başka bir konuda yardıma ihtiyacınız olursa bize ulaşabilirsiniz. İyi günler dilerim! 😊',
    category: 'thanks'
  },
];

// Chat hook - gelişmiş özellikler
export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isBotMode, setIsBotMode] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<ChatSession | null>(null);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Otomatik yanıt kontrolü
  const checkAutoResponse = useCallback((userMessage: string): string | null => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const rule of AUTO_RESPONSES) {
      if (rule.pattern.test(lowerMessage)) {
        return rule.response;
      }
    }
    
    return null;
  }, []);

  // Mesaj gönder
  const sendMessage = useCallback(async (
    text: string,
    type: ChatMessage['type'] = 'text',
    metadata?: Record<string, any>
  ) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      type,
      metadata,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Bot modu aktifse otomatik yanıt dene
    if (isBotMode) {
      const autoResponse = checkAutoResponse(text);
      
      if (autoResponse) {
        // Gerçekçi bir gecikme ekle
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: autoResponse,
          sender: 'bot',
          timestamp: new Date(),
          type: 'text',
          agentName: 'CVK Bot',
          agentAvatar: '🤖',
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        return;
      }
      
      // Otomatik yanıt bulunamazsa insan ajanına yönlendir
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const transferMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Bu konuda size daha iyi yardımcı olabilmem için bir temsilcimizi devreye alıyorum. Lütfen biraz bekleyin...',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
        agentName: 'CVK Bot',
        agentAvatar: '🤖',
      };
      
      setMessages(prev => [...prev, transferMessage]);
      setIsBotMode(false);
      
      // Simüle edilmiş insan ajanı yanıtı
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const agentMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        text: `Merhaba! Ben Ayşe, müşteri temsilciniz. Size nasıl yardımcı olabilirim?`,
        sender: 'agent',
        timestamp: new Date(),
        type: 'text',
        agentName: 'Ayşe K.',
        agentAvatar: '👩‍💼',
      };
      
      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
    } else {
      // İnsan ajanı modu - simüle edilmiş yanıt
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
      
      const responses = [
        'Anladım, konuyu inceliyorum...',
        'Size en kısa sürede yardımcı olacağım.',
        'Bu konuda size yardımcı olabilirim.',
        'Lütfen biraz bekleyin, bilgileri kontrol ediyorum.',
        'Hemen inceleyip dönüş yapıyorum.',
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: 'agent',
        timestamp: new Date(),
        type: 'text',
        agentName: 'Ayşe K.',
        agentAvatar: '👩‍💼',
      };
      
      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
    }
  }, [isBotMode, checkAutoResponse]);

  // Dosya gönder
  const sendFile = useCallback(async (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    
    const fileMessage: ChatMessage = {
      id: Date.now().toString(),
      text: `📎 ${file.name}`,
      sender: 'user',
      timestamp: new Date(),
      type: file.type.startsWith('image/') ? 'image' : 'file',
      fileUrl,
      fileName: file.name,
    };

    setMessages(prev => [...prev, fileMessage]);
    setIsTyping(true);

    // Dosya için otomatik yanıt
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: `Dosyanızı aldım. İnceleyip size dönüş yapacağım. Bu bir tasarım dosyası mı yoksa başka bir konuda mı yardıma ihtiyacınız var?`,
      sender: isBotMode ? 'bot' : 'agent',
      timestamp: new Date(),
      type: 'text',
      agentName: isBotMode ? 'CVK Bot' : 'Ayşe K.',
      agentAvatar: isBotMode ? '🤖' : '👩‍💼',
    };
    
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  }, [isBotMode]);

  // Hızlı yanıt gönder
  const sendQuickReply = useCallback((replyText: string) => {
    sendMessage(replyText, 'quick_reply');
  }, [sendMessage]);

  // Session başlat
  const startSession = useCallback((userName: string, userEmail: string, topic?: string) => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      userName,
      userEmail,
      startedAt: new Date(),
      status: 'active',
      topic,
    };
    
    setSession(newSession);
    sessionRef.current = newSession;
    
    // Hoş geldiniz mesajı
    const welcomeMessage: ChatMessage = {
      id: '1',
      text: `Merhaba ${userName}! CVKDijital destek ekibine hoş geldiniz. Size nasıl yardımcı olabilirim?\n\nAşağıdaki konularda yardımcı olabilirim:\n• Sipariş takibi\n• Fiyat bilgisi\n• Teslimat süreleri\n• Tasarım desteği\n• Malzeme seçimi`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
      agentName: 'CVK Bot',
      agentAvatar: '🤖',
    };
    
    setMessages([welcomeMessage]);
    setIsBotMode(true);
  }, []);

  // Session kapat
  const closeSession = useCallback(() => {
    if (sessionRef.current) {
      const closeMessage: ChatMessage = {
        id: Date.now().toString(),
        text: 'Konuşma sonlandırıldı. Bizi tercih ettiğiniz için teşekkür ederiz! İyi günler dileriz. 🙏',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
        agentName: 'CVK Bot',
        agentAvatar: '🤖',
      };
      
      setMessages(prev => [...prev, closeMessage]);
      
      setTimeout(() => {
        setSession(null);
        setMessages([]);
        sessionRef.current = null;
      }, 2000);
    }
  }, []);

  // Konuşma geçmişini kaydet
  const saveChatHistory = useCallback(() => {
    if (sessionRef.current && messages.length > 0) {
      const history = {
        session: sessionRef.current,
        messages,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(`chat_history_${sessionRef.current.id}`, JSON.stringify(history));
    }
  }, [messages]);

  // Konuşma geçmişini yükle
  const loadChatHistory = useCallback((sessionId: string) => {
    const saved = localStorage.getItem(`chat_history_${sessionId}`);
    if (saved) {
      try {
        const history = JSON.parse(saved);
        setSession(history.session);
        setMessages(history.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })));
        return true;
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }
    return false;
  }, []);

  return {
    messages,
    session,
    isTyping,
    isBotMode,
    unreadCount,
    messagesEndRef,
    sendMessage,
    sendFile,
    sendQuickReply,
    startSession,
    closeSession,
    saveChatHistory,
    loadChatHistory,
    setUnreadCount,
  };
};

export default useChat;
