import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Square, Copy, Check, Share2, RefreshCw, Volume2, Plus, Image as ImageIcon, Search, BookOpen, X, ArrowRight, Trash2, Edit3, Clock, SortAsc, SortDesc, MessageCircle, Sparkles, AlertCircle, Compass } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import aiLogo from '@/assets/ai-logo.png';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

const getDeviceId = (): string => {
  let id = localStorage.getItem('atraa_device_id');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('atraa_device_id', id); }
  return id;
};

const AiPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deepSearch, setDeepSearch] = useState(false);
  const [searchPhase, setSearchPhase] = useState<'idle' | 'searching' | 'found' | 'writing'>('idle');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sortNewest, setSortNewest] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const loadConversations = async () => {
    const { data } = await supabase.from('chat_conversations').select('*').eq('device_id', getDeviceId()).order('updated_at', { ascending: !sortNewest });
    if (data) setConversations(data as Conversation[]);
  };

  const loadConversation = async (convId: string) => {
    const { data } = await supabase.from('chat_messages').select('*').eq('conversation_id', convId).order('created_at', { ascending: true });
    if (data) {
      setMessages(data.map(m => ({ id: m.id, role: m.role as 'user' | 'assistant', content: m.content, sources: m.sources as any[] | undefined })));
      setConversationId(convId);
      setShowHistory(false);
    }
  };

  const startNewChat = () => { setMessages([]); setConversationId(null); setShowHistory(false); };

  const saveMessage = async (convId: string, role: string, content: string, sources?: any[]) => {
    await supabase.from('chat_messages').insert({ conversation_id: convId, role, content, sources: sources || null });
  };

  const getOrCreateConversation = async (firstMessage: string): Promise<string> => {
    if (conversationId) return conversationId;
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
    const { data } = await supabase.from('chat_conversations').insert({ device_id: getDeviceId(), title }).select().single();
    if (data) { setConversationId(data.id); return data.id; }
    throw new Error('Failed to create conversation');
  };

  const stopGeneration = () => { abortRef.current?.abort(); setIsStreaming(false); setIsLoading(false); setSearchPhase('idle'); };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: messageText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);

    if (deepSearch) {
      setSearchPhase('searching');
      setTimeout(() => setSearchPhase('found'), 1500);
      setTimeout(() => setSearchPhase('writing'), 2500);
    }

    const abortController = new AbortController();
    abortRef.current = abortController;
    let assistantContent = '';
    const assistantId = crypto.randomUUID();

    try {
      const convId = await getOrCreateConversation(messageText);
      await saveMessage(convId, 'user', messageText);
      const allMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: allMessages, deep_search: deepSearch }),
        signal: abortController.signal,
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'فشل الاتصال');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      setSearchPhase('writing');

      const updateAssistant = (content: string) => {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && last.id === assistantId) {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content } : m);
          }
          return [...prev, { id: assistantId, role: 'assistant' as const, content }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) { assistantContent += content; updateAssistant(assistantContent); }
          } catch { textBuffer = line + '\n' + textBuffer; break; }
        }
      }

      const sources = extractSources(assistantContent);
      await saveMessage(convId, 'assistant', assistantContent, sources.length > 0 ? sources : undefined);
      await supabase.from('chat_conversations').update({ updated_at: new Date().toISOString() }).eq('id', convId);
    } catch (e: any) {
      if (e.name === 'AbortError') return;
      console.error(e);
      toast.error(e.message || 'حدث خطأ');
      if (!assistantContent) {
        setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.' }]);
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setSearchPhase('idle');
      setDeepSearch(false);
    }
  };

  const extractSources = (text: string): any[] => {
    const sources: any[] = [];
    const pattern = /(?:المصدر|المرجع|الكتاب)[:\s]+([^\n،,]+)/g;
    let match;
    while ((match = pattern.exec(text)) !== null) sources.push({ title: match[1].trim() });
    return sources;
  };

  const copyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareMessage = async (content: string) => {
    const shareText = `من ذكاء عِتَرَةً (حُسين):\n\n${content.slice(0, 500)}${content.length > 500 ? '...' : ''}\n\nجرّب ذكاء عِتَرَةً: https://atraa.xyz/ai`;
    if (navigator.share) { try { await navigator.share({ text: shareText }); return; } catch {} }
    await navigator.clipboard.writeText(shareText);
    toast.success('تم نسخ الرد');
  };

  const speakMessage = (content: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(content.replace(/[#*_`~\[\]()]/g, ''));
      u.lang = 'ar-SA';
      u.rate = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const arMale = voices.find(v => v.lang.startsWith('ar') && v.name.toLowerCase().includes('male'));
      if (arMale) u.voice = arMale;
      window.speechSynthesis.speak(u);
    }
  };

  const regenerate = async () => {
    if (messages.length < 2) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;
    setMessages(prev => prev.slice(0, -1));
    await sendMessage(lastUserMsg.content);
  };

  const handleDeleteConversation = async (id: string) => {
    if (deleteConfirmText !== 'تأكيد ذلك') return;
    await supabase.from('chat_conversations').delete().eq('id', id);
    setDeleteConfirmId(null);
    setDeleteConfirmText('');
    if (conversationId === id) startNewChat();
    loadConversations();
    toast.success('تم حذف المحادثة');
  };

  const handleRenameConversation = async (id: string) => {
    if (!editTitle.trim()) return;
    await supabase.from('chat_conversations').update({ title: editTitle.trim() }).eq('id', id);
    setEditingId(null);
    setEditTitle('');
    loadConversations();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setInput(prev => prev + `\n[صورة مرفقة: ${file.name}]`); toast.info('تم إرفاق الصورة'); };
    reader.readAsDataURL(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const quickSuggestions = [
    { q: 'ما هي أركان الصلاة؟', icon: Compass },
    { q: 'اشرح لي سورة الفاتحة', icon: BookOpen },
    { q: 'ما هو دعاء كميل؟', icon: MessageCircle },
  ];

  // ─── HISTORY VIEW ───
  if (showHistory) {
    return (
      <div className="flex flex-col h-[calc(100vh-130px)] animate-fade-in">
        <div className="px-5 py-4 border-b border-border/15 flex items-center justify-between bg-background/60 backdrop-blur-2xl">
          <button onClick={() => setShowHistory(false)} className="flex items-center gap-2 text-primary text-sm font-semibold group">
            <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
            رجوع
          </button>
          <h2 className="text-sm font-bold text-foreground">سجل المحادثات</h2>
          <button onClick={() => setSortNewest(!sortNewest)}
            className="w-9 h-9 rounded-xl bg-secondary/40 flex items-center justify-center hover:bg-secondary/60 transition-colors">
            {sortNewest ? <SortDesc className="w-4 h-4 text-muted-foreground" /> : <SortAsc className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
          {conversations.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-3xl bg-secondary/30 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-muted-foreground/25" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground/50">لا توجد محادثات سابقة</p>
              <p className="text-[11px] text-muted-foreground/30 mt-1">ابدأ محادثة جديدة مع حُسين</p>
            </div>
          ) : (
            conversations.map((conv, i) => (
              <motion.div key={conv.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.2) }}
                className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/20 p-4 shadow-sm hover:border-primary/20 transition-all">
                {editingId === conv.id ? (
                  <div className="flex gap-2">
                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="الاسم الجديد"
                      className="flex-1 px-3 py-2.5 rounded-xl bg-secondary/40 border border-border/30 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20" autoFocus />
                    <button onClick={() => handleRenameConversation(conv.id)}
                      className="px-4 py-2.5 rounded-xl islamic-gradient text-primary-foreground text-xs font-bold shadow-sm">حفظ</button>
                    <button onClick={() => setEditingId(null)}
                      className="px-3 py-2.5 rounded-xl bg-secondary/40 text-xs font-medium">إلغاء</button>
                  </div>
                ) : deleteConfirmId === conv.id ? (
                  <div className="space-y-2.5">
                    <p className="text-[11px] text-muted-foreground font-medium">اكتب "تأكيد ذلك" لحذف المحادثة</p>
                    <div className="flex gap-2">
                      <input value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} placeholder="تأكيد ذلك"
                        className="flex-1 px-3 py-2.5 rounded-xl bg-secondary/40 border border-border/30 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-destructive/20" />
                      <button onClick={() => handleDeleteConversation(conv.id)} disabled={deleteConfirmText !== 'تأكيد ذلك'}
                        className="px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold disabled:opacity-40">حذف</button>
                      <button onClick={() => { setDeleteConfirmId(null); setDeleteConfirmText(''); }}
                        className="px-3 py-2.5 rounded-xl bg-secondary/40 text-xs font-medium">إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button onClick={() => loadConversation(conv.id)} className="w-full text-right">
                      <p className="text-[13px] font-bold text-foreground truncate leading-snug">{conv.title}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-1.5 font-medium">
                        {new Date(conv.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </button>
                    <div className="flex gap-1 mt-2.5 pt-2.5 border-t border-border/10">
                      <button onClick={() => { setEditingId(conv.id); setEditTitle(conv.title); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium text-muted-foreground hover:bg-secondary/50 transition-colors">
                        <Edit3 className="w-3 h-3" /> تعديل
                      </button>
                      <button onClick={() => setDeleteConfirmId(conv.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium text-destructive/60 hover:bg-destructive/8 transition-colors">
                        <Trash2 className="w-3 h-3" /> حذف
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ─── MAIN CHAT VIEW ───
  return (
    <div className="flex flex-col h-[calc(100vh-130px)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              {/* AI Logo */}
              <div className="relative inline-block mb-5">
                <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-2xl scale-150" />
                <img src={aiLogo} alt="حُسين" className="relative w-20 h-20 mx-auto rounded-3xl shadow-xl shadow-primary/10 object-contain" />
              </div>
              <h1 className="text-xl font-bold text-foreground mb-2 tracking-tight">ذِكاء عِتَرَةً</h1>
              <p className="text-[12px] text-muted-foreground max-w-[260px] mx-auto leading-relaxed font-medium">
                حُسين يبحث لك في المصادر الإسلامية الموثوقة
                <br />
                <span className="text-muted-foreground/50">ومهدي يبسّط لك المعلومات</span>
              </p>
            </motion.div>

            {/* Quick suggestions */}
            <div className="mt-7 space-y-2.5 w-full max-w-xs">
              {quickSuggestions.map(({ q, icon: Icon }, i) => (
                <motion.button key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => { setInput(q); sendMessage(q); }}
                  className="w-full text-right px-4 py-3.5 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/20 text-[13px] font-semibold text-foreground hover:border-primary/25 hover:shadow-md transition-all shadow-sm active:scale-[0.98] flex items-center gap-3.5 group">
                  <div className="w-9 h-9 rounded-xl bg-primary/6 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/12 transition-colors">
                    <Icon className="w-4 h-4 text-primary/50 group-hover:text-primary transition-colors" />
                  </div>
                  <span className="flex-1">{q}</span>
                </motion.button>
              ))}
            </div>

            {/* Subscription Plans */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="mt-8 w-full max-w-xs">
              <p className="text-[10px] text-muted-foreground/40 font-bold mb-2.5 text-center">خطط الاشتراك</p>
              <div className="space-y-2">
                {/* Platinum - Free */}
                <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl border border-border/20 p-3.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-secondary/50 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-foreground">بلاتينيوم</p>
                        <p className="text-[9px] text-muted-foreground">٣٠ رسالة يومياً</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-primary bg-primary/8 px-2.5 py-1 rounded-lg">مجاناً</span>
                  </div>
                </div>
                {/* Titanium - Paid */}
                <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl border border-primary/20 p-3.5 shadow-sm overflow-hidden">
                  <div className="absolute top-2 left-2">
                    <span className="text-[8px] font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded-md">قريباً</span>
                  </div>
                  <div className="flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl islamic-gradient flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-foreground">تيتانيوم</p>
                        <p className="text-[9px] text-muted-foreground">٣٥٠ رسالة · نقاش عميق</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-foreground">١٩.٩٩ ر.س</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bottom links */}
            <div className="mt-5 flex items-center gap-4">
              <button onClick={() => { loadConversations(); setShowHistory(true); }}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground/40 hover:text-primary font-medium transition-colors">
                <Clock className="w-3.5 h-3.5" /> سجل المحادثات
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[88%] ${msg.role === 'user'
                    ? 'islamic-gradient text-primary-foreground rounded-2xl rounded-bl-md px-4 py-3 shadow-lg shadow-primary/10'
                    : 'bg-card/80 backdrop-blur-sm border border-border/20 rounded-2xl rounded-br-md px-4 py-3.5 shadow-sm'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <>
                        <div className="flex items-center gap-2 mb-2.5">
                          <img src={aiLogo} alt="حُسين" className="w-5 h-5 rounded-lg object-contain" />
                          <span className="text-[10px] font-bold text-primary">حُسين</span>
                          {isStreaming && idx === messages.length - 1 && (
                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}
                              className="w-1.5 h-1.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <div className="prose prose-sm max-w-none text-foreground text-[13px] leading-[1.8] [&_strong]:text-primary [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-bold [&_h3]:text-sm [&_table]:text-xs [&_table]:border [&_th]:bg-secondary/20 [&_th]:px-2.5 [&_th]:py-1.5 [&_td]:px-2.5 [&_td]:py-1.5 [&_td]:border [&_code]:bg-secondary/40 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-[11px] [&_blockquote]:border-r-2 [&_blockquote]:border-primary/30 [&_blockquote]:pr-3 [&_blockquote]:text-muted-foreground [&_ul]:space-y-1 [&_ol]:space-y-1">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>

                        {/* Actions */}
                        {(!isStreaming || idx < messages.length - 1) && (
                          <div className="flex items-center gap-0.5 mt-3 pt-2.5 border-t border-border/10">
                            {[
                              { icon: copiedId === msg.id ? Check : Copy, action: () => copyMessage(msg.id, msg.content), active: copiedId === msg.id },
                              { icon: Share2, action: () => shareMessage(msg.content) },
                              { icon: Volume2, action: () => speakMessage(msg.content) },
                              ...(idx === messages.length - 1 ? [{ icon: RefreshCw, action: regenerate }] : []),
                            ].map((btn, bi) => (
                              <button key={bi} onClick={btn.action}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${btn.active ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/50 text-muted-foreground/50 hover:text-muted-foreground'}`}>
                                <btn.icon className="w-3.5 h-3.5" />
                              </button>
                            ))}
                            {msg.sources && msg.sources.length > 0 && (
                              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/6 mr-auto">
                                <BookOpen className="w-3 h-3 text-primary/60" />
                                <span className="text-[9px] text-primary/60 font-bold">{msg.sources.length} مصدر</span>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Search phase */}
            {searchPhase !== 'idle' && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                <div className="bg-card/80 backdrop-blur-sm border border-border/20 rounded-2xl px-4 py-3.5 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    {searchPhase === 'searching' ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full" />
                    ) : searchPhase === 'found' ? (
                      <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-primary" />
                      </div>
                    ) : (
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }}
                        className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center">
                        <Edit3 className="w-2.5 h-2.5 text-primary" />
                      </motion.div>
                    )}
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {searchPhase === 'searching' && 'جاري البحث في المصادر...'}
                      {searchPhase === 'found' && 'تم العثور على المصادر'}
                      {searchPhase === 'writing' && 'جاري كتابة الإجابة...'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Loading */}
            {isLoading && searchPhase === 'idle' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                <div className="bg-card/80 backdrop-blur-sm border border-border/20 rounded-2xl px-4 py-3.5 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} animate={{ scale: [1, 1.3, 1] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                          className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                      ))}
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium">جاري التفكير...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-3 pb-3 pt-1">
        <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl border border-border/25 shadow-md overflow-hidden">
          {/* Plus menu */}
          <AnimatePresence>
            {showPlusMenu && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="border-b border-border/15 px-3 py-2.5 flex gap-2">
                <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary/40 text-[11px] font-medium text-foreground cursor-pointer hover:bg-secondary/60 transition-colors">
                  <ImageIcon className="w-3.5 h-3.5" /> إضافة صورة
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <button onClick={() => { setDeepSearch(true); setShowPlusMenu(false); }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-medium transition-all ${deepSearch ? 'islamic-gradient text-primary-foreground shadow-sm' : 'bg-secondary/40 text-foreground hover:bg-secondary/60'}`}>
                  <Search className="w-3.5 h-3.5" /> نقاش عميق
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-1.5 p-2.5">
            <button onClick={() => setShowPlusMenu(!showPlusMenu)}
              className="w-9 h-9 rounded-xl hover:bg-secondary/50 transition-all flex items-center justify-center flex-shrink-0">
              <Plus className={`w-5 h-5 transition-all duration-200 ${showPlusMenu ? 'rotate-45 text-primary' : 'text-muted-foreground/50'}`} />
            </button>

            <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="اسأل عِتَرَةً..." rows={1} dir="rtl"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 resize-none outline-none py-2 px-1 max-h-[120px] leading-relaxed font-medium" />

            {isStreaming ? (
              <button onClick={stopGeneration}
                className="w-9 h-9 rounded-xl bg-destructive/10 hover:bg-destructive/15 transition-colors flex items-center justify-center flex-shrink-0">
                <Square className="w-4 h-4 text-destructive fill-destructive" />
              </button>
            ) : (
              <button onClick={() => sendMessage()} disabled={!input.trim() && !isLoading}
                className="w-9 h-9 rounded-xl islamic-gradient text-primary-foreground disabled:opacity-20 transition-all flex items-center justify-center flex-shrink-0 active:scale-90 shadow-sm shadow-primary/15">
                <Send className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>

          {/* Deep search indicator */}
          {deepSearch && !showPlusMenu && (
            <div className="px-3 pb-2.5 flex items-center gap-1.5">
              <span className="text-[10px] text-primary font-bold bg-primary/8 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Search className="w-3 h-3" /> نقاش عميق
              </span>
              <button onClick={() => setDeepSearch(false)} className="p-0.5 rounded-full hover:bg-secondary/50 transition-colors">
                <X className="w-3 h-3 text-muted-foreground/40" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between mt-2.5 px-2">
          <button onClick={() => { loadConversations(); setShowHistory(true); }}
            className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40 hover:text-primary font-medium transition-colors">
            <Clock className="w-3 h-3" /> السجل
          </button>
          {messages.length > 0 && (
            <button onClick={startNewChat}
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40 hover:text-primary font-medium transition-colors">
              <Plus className="w-3 h-3" /> محادثة جديدة
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiPage;
