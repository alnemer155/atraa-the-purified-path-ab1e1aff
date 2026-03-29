import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Square, Copy, Check, Share2, RefreshCw, Volume2, ChevronDown, Plus, Image as ImageIcon, Search, BookOpen, X, ArrowLeft, Trash2, Edit3, Clock, SortAsc, SortDesc } from 'lucide-react';
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
  const [showImageUpload, setShowImageUpload] = useState(false);
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
    const { data } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('device_id', getDeviceId())
      .order('updated_at', { ascending: !sortNewest });
    if (data) setConversations(data as Conversation[]);
  };

  const loadConversation = async (convId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    if (data) {
      setMessages(data.map(m => ({ id: m.id, role: m.role as 'user' | 'assistant', content: m.content, sources: m.sources as any[] | undefined })));
      setConversationId(convId);
      setShowHistory(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setShowHistory(false);
  };

  const saveMessage = async (convId: string, role: string, content: string, sources?: any[]) => {
    await supabase.from('chat_messages').insert({
      conversation_id: convId,
      role,
      content,
      sources: sources || null,
    });
  };

  const getOrCreateConversation = async (firstMessage: string): Promise<string> => {
    if (conversationId) return conversationId;
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
    const { data } = await supabase
      .from('chat_conversations')
      .insert({ device_id: getDeviceId(), title })
      .select()
      .single();
    if (data) {
      setConversationId(data.id);
      return data.id;
    }
    throw new Error('Failed to create conversation');
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setIsLoading(false);
    setSearchPhase('idle');
  };

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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
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
            if (content) {
              assistantContent += content;
              updateAssistant(assistantContent);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Extract sources from content
      const sources = extractSources(assistantContent);
      await saveMessage(convId, 'assistant', assistantContent, sources.length > 0 ? sources : undefined);
      await supabase.from('chat_conversations').update({ updated_at: new Date().toISOString() }).eq('id', convId);

    } catch (e: any) {
      if (e.name === 'AbortError') return;
      console.error(e);
      toast.error(e.message || 'حدث خطأ');
      if (!assistantContent) {
        setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '⚠️ عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.' }]);
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
    const patterns = [
      /(?:المصدر|المرجع|الكتاب)[:\s]+([^\n،,]+)/g,
      /(?:📚|📖)\s*([^\n]+)/g,
    ];
    patterns.forEach(p => {
      let match;
      while ((match = p.exec(text)) !== null) {
        sources.push({ title: match[1].trim() });
      }
    });
    return sources;
  };

  const copyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareMessage = async (content: string) => {
    const shareText = `💬 من ذكاء عِتَرَةً (حُسين):\n\n${content.slice(0, 500)}${content.length > 500 ? '...' : ''}\n\nجرّب ذكاء عِتَرَةً: https://atraa.xyz/ai`;
    if (navigator.share) {
      try { await navigator.share({ text: shareText }); return; } catch {}
    }
    await navigator.clipboard.writeText(shareText);
    toast.success('تم نسخ الرد');
  };

  const speakMessage = (content: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(content.replace(/[#*_`~\[\]()]/g, ''));
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const arMale = voices.find(v => v.lang.startsWith('ar') && v.name.toLowerCase().includes('male'));
      if (arMale) utterance.voice = arMale;
      window.speechSynthesis.speak(utterance);
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
    reader.onload = () => {
      setInput(prev => prev + `\n[صورة مرفقة: ${file.name}]`);
      setShowImageUpload(false);
      toast.info('تم إرفاق الصورة');
    };
    reader.readAsDataURL(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─── HISTORY VIEW ───
  if (showHistory) {
    return (
      <div className="flex flex-col h-[calc(100vh-130px)] animate-fade-in">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
          <button onClick={() => setShowHistory(false)} className="flex items-center gap-1.5 text-primary text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" />
            رجوع
          </button>
          <h2 className="text-sm font-bold text-foreground">سجل المحادثات</h2>
          <button onClick={() => setSortNewest(!sortNewest)} className="p-2 rounded-xl bg-secondary/50">
            {sortNewest ? <SortDesc className="w-4 h-4 text-muted-foreground" /> : <SortAsc className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-20">
              <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">لا توجد محادثات سابقة</p>
            </div>
          ) : (
            conversations.map(conv => (
              <motion.div key={conv.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border/30 p-3.5 shadow-card">
                {editingId === conv.id ? (
                  <div className="flex gap-2">
                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="الاسم الجديد"
                      className="flex-1 px-3 py-2 rounded-xl bg-secondary/50 border border-border text-sm text-foreground" autoFocus />
                    <button onClick={() => handleRenameConversation(conv.id)} className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium">حفظ</button>
                    <button onClick={() => setEditingId(null)} className="px-3 py-2 rounded-xl bg-secondary/50 text-xs">إلغاء</button>
                  </div>
                ) : deleteConfirmId === conv.id ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">اكتب "تأكيد ذلك" لحذف المحادثة</p>
                    <div className="flex gap-2">
                      <input value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} placeholder="تأكيد ذلك"
                        className="flex-1 px-3 py-2 rounded-xl bg-secondary/50 border border-border text-sm text-foreground" />
                      <button onClick={() => handleDeleteConversation(conv.id)}
                        disabled={deleteConfirmText !== 'تأكيد ذلك'}
                        className="px-3 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-medium disabled:opacity-50">حذف</button>
                      <button onClick={() => { setDeleteConfirmId(null); setDeleteConfirmText(''); }} className="px-3 py-2 rounded-xl bg-secondary/50 text-xs">إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button onClick={() => loadConversation(conv.id)} className="w-full text-right">
                      <p className="text-sm font-medium text-foreground truncate">{conv.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(conv.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </button>
                    <div className="flex gap-1 mt-2">
                      <button onClick={() => { setEditingId(conv.id); setEditTitle(conv.title); }} className="p-1.5 rounded-lg hover:bg-secondary/50">
                        <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => setDeleteConfirmId(conv.id)} className="p-1.5 rounded-lg hover:bg-destructive/10">
                        <Trash2 className="w-3.5 h-3.5 text-destructive/70" />
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
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              <img src={aiLogo} alt="حُسين" className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-elevated object-contain" />
              <h1 className="text-lg font-bold text-foreground mb-1">اسأل عِتَرَةً</h1>
              <p className="text-xs text-muted-foreground max-w-[220px] mx-auto leading-relaxed">
                حُسين يبحث لك في المصادر الإسلامية الموثوقة ومهدي يبسّط لك المعلومات
              </p>
            </motion.div>

            {/* Quick suggestions */}
            <div className="mt-6 space-y-2 w-full max-w-xs">
              {['ما هي أركان الصلاة؟', 'اشرح لي سورة الفاتحة', 'ما هو دعاء كميل؟'].map((q, i) => (
                <motion.button key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                  onClick={() => { setInput(q); sendMessage(q); }}
                  className="w-full text-right px-4 py-3 rounded-2xl bg-card border border-border/30 text-sm text-foreground hover:bg-secondary/30 transition-colors shadow-card">
                  {q}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] ${msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-bl-md px-4 py-3'
                    : 'bg-card border border-border/30 rounded-2xl rounded-br-md px-4 py-3 shadow-card'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <img src={aiLogo} alt="حُسين" className="w-5 h-5 rounded-md object-contain" />
                          <span className="text-[10px] font-bold text-primary">حُسين</span>
                        </div>
                        <div className="prose prose-sm max-w-none text-foreground text-[13px] leading-relaxed [&_strong]:text-primary [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_table]:text-xs [&_table]:border [&_th]:bg-secondary/30 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_td]:border">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>

                        {/* Action buttons */}
                        {(!isStreaming || idx < messages.length - 1) && (
                          <div className="flex items-center gap-1 mt-3 pt-2 border-t border-border/20">
                            <button onClick={() => copyMessage(msg.id, msg.content)}
                              className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
                              {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                            </button>
                            <button onClick={() => shareMessage(msg.content)} className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
                              <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                            <button onClick={() => speakMessage(msg.content)} className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
                              <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                            {idx === messages.length - 1 && (
                              <button onClick={regenerate} className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
                                <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                            )}
                            {msg.sources && msg.sources.length > 0 && (
                              <button className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground">{msg.sources.length}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Search phase indicator */}
            {searchPhase !== 'idle' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                <div className="bg-card border border-border/30 rounded-2xl px-4 py-3 shadow-card">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-primary" />
                      {searchPhase === 'searching' && (
                        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                          className="absolute inset-0 rounded-full bg-primary/20" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {searchPhase === 'searching' && '🧠 جاري البحث...'}
                      {searchPhase === 'found' && '✅ تم العثور على المصادر'}
                      {searchPhase === 'writing' && '✍️ جاري الكتابة...'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Loading indicator */}
            {isLoading && searchPhase === 'idle' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                <div className="bg-card border border-border/30 rounded-2xl px-4 py-3 shadow-card">
                  <div className="flex items-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                    <span className="text-xs text-muted-foreground">جاري التفكير...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area - ChatGPT style */}
      <div className="px-3 pb-3 pt-1">
        <div className="relative bg-card rounded-2xl border border-border/40 shadow-elevated overflow-hidden">
          {/* Plus menu */}
          <AnimatePresence>
            {showPlusMenu && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="border-b border-border/20 px-3 py-2 flex gap-2">
                <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/50 text-xs text-foreground cursor-pointer hover:bg-secondary transition-colors">
                  <ImageIcon className="w-3.5 h-3.5" />
                  إضافة صورة
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <button onClick={() => { setDeepSearch(true); setShowPlusMenu(false); }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-colors ${deepSearch ? 'bg-primary/15 text-primary' : 'bg-secondary/50 text-foreground hover:bg-secondary'}`}>
                  <Search className="w-3.5 h-3.5" />
                  نقاش عميق
                </button>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/30 text-xs text-muted-foreground opacity-50">
                  <ImageIcon className="w-3.5 h-3.5" />
                  إنشاء صور
                  <span className="text-[9px] bg-accent/15 text-accent-foreground px-1.5 py-0.5 rounded-full">قريباً</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-1 p-2">
            <button onClick={() => setShowPlusMenu(!showPlusMenu)}
              className="p-2 rounded-xl hover:bg-secondary/50 transition-colors flex-shrink-0 mb-0.5">
              <Plus className={`w-5 h-5 transition-transform ${showPlusMenu ? 'rotate-45 text-primary' : 'text-muted-foreground'}`} />
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اسأل عِتَرَةً..."
              rows={1}
              dir="rtl"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none py-2 px-1 max-h-[120px] leading-relaxed"
            />

            {isStreaming ? (
              <button onClick={stopGeneration}
                className="p-2 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-colors flex-shrink-0 mb-0.5">
                <Square className="w-4 h-4 text-destructive fill-destructive" />
              </button>
            ) : (
              <button onClick={() => sendMessage()}
                disabled={!input.trim() && !isLoading}
                className="p-2 rounded-xl islamic-gradient text-primary-foreground disabled:opacity-30 transition-all flex-shrink-0 mb-0.5 active:scale-95">
                <Send className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>

          {/* Deep search indicator */}
          {deepSearch && !showPlusMenu && (
            <div className="px-3 pb-2 flex items-center gap-1.5">
              <span className="text-[10px] text-primary font-medium bg-primary/8 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Search className="w-3 h-3" /> نقاش عميق
              </span>
              <button onClick={() => setDeepSearch(false)}>
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between mt-2 px-1">
          <button onClick={() => { loadConversations(); setShowHistory(true); }}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            <Clock className="w-3 h-3" />
            السجل
          </button>
          {messages.length > 0 && (
            <button onClick={startNewChat}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="w-3 h-3" />
              محادثة جديدة
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiPage;
