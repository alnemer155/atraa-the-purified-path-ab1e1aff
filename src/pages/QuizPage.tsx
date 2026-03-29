import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Share2, Clock, ChevronLeft, Info, Copy, Check, Lightbulb, Gift, Calendar as CalendarIcon, Timer, Users, Sparkles, ArrowLeft, Edit3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getUser } from '@/lib/user';
import quizFace from '@/assets/quiz/quiz-face.png';
import quizQuestionsImg from '@/assets/quiz/quiz-questions.png';

const QUIZ_EMOJIS = ['😎', '🍁', '📿', '🌙', '❤️', '🤲🏻', '😶‍🌫️', '🫥', '🫠', '👻', '👾', '💪🏻', '👀', '⚽️', '🎱', '🚗', '🗿', '🕋', '🙂', '💡'];

const QUIZ_START = new Date('2026-03-21T00:00:00+03:00');
const QUIZ_END = new Date('2026-05-21T23:59:59+03:00');
const QUESTIONS_START_HOUR = 9;
const QUESTIONS_END_HOUR = 21;
const QUESTIONS_END_MINUTE = 30;
const TIMER_DURATION = 180; // 3 minutes
const HINT_AVAILABLE_AT = 90; // hints available after 1.5 minutes (when timer reaches 90s)

const SPECIAL_DATES: Record<string, { name: string; bonus: number }> = {
  '2026-03-28': { name: 'عيد الفطر المبارك', bonus: 5 },
  '2026-04-27': { name: 'ولادة السيدة فاطمة المعصومة', bonus: 5 },
};

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface Participant {
  id: string;
  nickname: string;
  emoji: string;
  bio: string | null;
  bio_public: boolean;
  age: number;
  score: number;
}

type QuizView = 'home' | 'register' | 'questions' | 'leaderboard' | 'result';

const getDeviceId = (): string => {
  let id = localStorage.getItem('atraa_quiz_device_id');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('atraa_quiz_device_id', id); }
  return id;
};

const generateShareCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let r = '';
  for (let i = 0; i < 8; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
  return r;
};

const isQuizActive = (): boolean => { const n = new Date(); return n >= QUIZ_START && n <= QUIZ_END; };

const isQuestionsTime = (): boolean => {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes();
  if (h < QUESTIONS_START_HOUR) return false;
  if (h > QUESTIONS_END_HOUR) return false;
  if (h === QUESTIONS_END_HOUR && m > QUESTIONS_END_MINUTE) return false;
  return true;
};

const getTodayDate = (): string => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
};

const formatTimer = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

const getQuizDays = () => {
  const days: { date: string; dayNum: number; isFriday: boolean; special?: string }[] = [];
  const cur = new Date(QUIZ_START);
  let dayNum = 1;
  while (cur <= QUIZ_END) {
    const ds = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
    days.push({ date: ds, dayNum, isFriday: cur.getDay() === 5, special: SPECIAL_DATES[ds]?.name });
    cur.setDate(cur.getDate() + 1);
    dayNum++;
  }
  return days;
};

/* ─── Section Card ─── */
const Section = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card rounded-2xl border border-border/60 shadow-card p-4 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, children }: { icon: any; children: React.ReactNode }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="w-7 h-7 rounded-xl islamic-gradient flex items-center justify-center">
      <Icon className="w-3.5 h-3.5 text-primary-foreground" />
    </div>
    <h3 className="text-sm font-bold text-foreground">{children}</h3>
  </div>
);

/* ─── Back Button ─── */
const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="flex items-center gap-1.5 text-primary text-sm font-semibold mb-5 group">
    <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
      <ChevronLeft className="w-4 h-4" />
    </div>
    رجوع
  </button>
);

const QuizPage = () => {
  const [view, setView] = useState<QuizView>('home');
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null, null]);
  const [todayAnswered, setTodayAnswered] = useState(false);
  const [todayScore, setTodayScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<Participant[]>([]);
  const [copied, setCopied] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [statusInfoIdx, setStatusInfoIdx] = useState<number | null>(null);

  const [timerSec, setTimerSec] = useState(TIMER_DURATION);
  const [timerActive, setTimerActive] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState('');
  const [hintLoading, setHintLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [answerHistory, setAnswerHistory] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });

  const [regNickname, setRegNickname] = useState('');
  const [regEmoji, setRegEmoji] = useState('😎');
  const [regBio, setRegBio] = useState('');
  const [regBioPublic, setRegBioPublic] = useState(false);
  const [regAge, setRegAge] = useState('');
  const [regUseExisting, setRegUseExisting] = useState(false);
  const [regError, setRegError] = useState('');
  const [regAgreed, setRegAgreed] = useState(false);

  const user = getUser();
  const submitRef = useRef(false);

  useEffect(() => { checkParticipant(); }, []);

  const checkParticipant = async () => {
    setLoading(true);
    try {
      const deviceId = getDeviceId();
      const { data } = await supabase.from('quiz_participants').select('*').eq('device_id', deviceId).maybeSingle();
      if (data) {
        setParticipant(data as Participant);
        await checkTodayAnswer(data.id);
        fetchAnswerHistory(data.id);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const checkTodayAnswer = async (pid: string) => {
    const { data } = await supabase.from('quiz_answers').select('*').eq('participant_id', pid).eq('question_date', getTodayDate()).maybeSingle();
    if (data) { setTodayAnswered(true); setTodayScore(data.score); }
  };

  const fetchAnswerHistory = async (pid: string) => {
    const { data } = await supabase.from('quiz_answers').select('*').eq('participant_id', pid);
    if (data) setAnswerHistory(data);
  };

  const now = new Date();
  const isBeforeStart = now < QUIZ_START;
  const isAfterEnd = now > QUIZ_END;
  const questionsAvailable = isQuestionsTime() && isQuizActive();

  useEffect(() => {
    if (!isBeforeStart) return;
    const update = () => {
      const diff = QUIZ_START.getTime() - Date.now();
      if (diff <= 0) { window.location.reload(); return; }
      setCountdown({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [isBeforeStart]);

  useEffect(() => {
    if (!timerActive || timerSec <= 0) return;
    const iv = setInterval(() => {
      setTimerSec(prev => {
        if (prev <= 1) { setTimerActive(false); if (!submitRef.current) { submitRef.current = true; submitAnswers(); } return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [timerActive]);

  const handleRegister = async () => {
    setRegError('');
    const nickname = regUseExisting && user ? user.name : regNickname.trim();
    if (!nickname) { setRegError('يرجى إدخال اللقب'); return; }
    const age = parseInt(regAge);
    if (isNaN(age)) { setRegError('يرجى إدخال العمر'); return; }
    if (age >= 99) { setRegError('لك طولت العمر إذا قربت من الـ ١٠٠ افصل الشاحن 😂'); return; }
    if (age < 12 || age > 60) { setRegError('العمر يجب أن يكون بين ١٢ و ٦٠ سنة'); return; }
    if (regBio.length > 30) { setRegError('النبذة ٣٠ حرف كحد أقصى'); return; }
    if (!regAgreed) { setRegError('يجب الموافقة على سياسات الموقع وشروط المسابقة'); return; }
    try {
      const response = await supabase.functions.invoke('quiz-register', {
        body: { device_id: getDeviceId(), nickname, emoji: regEmoji, bio: regBio || null, bio_public: regBioPublic, age }
      });
      if (response.error) throw response.error;
      setParticipant(response.data.participant);
      setView('home');
    } catch (e: any) { setRegError(e.message || 'حدث خطأ'); }
  };

  const fetchQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const today = getTodayDate();
      const { data: existing } = await supabase.from('quiz_daily_questions').select('questions').eq('question_date', today).maybeSingle();
      if (existing) {
        setQuestions(existing.questions as unknown as QuizQuestion[]);
      } else {
        const response = await supabase.functions.invoke('quiz-questions', {
          body: { date: today, age: participant?.age || 18 }
        });
        if (response.error) throw response.error;
        setQuestions(response.data.questions);
      }
    } catch (e) { console.error(e); }
    finally { setQuestionsLoading(false); }
  };

  const handleAnswer = (idx: number) => {
    if (answers[currentQ] !== null) return;
    const newA = [...answers];
    newA[currentQ] = idx;
    setAnswers(newA);
  };

  const handleNext = () => {
    if (currentQ < 3) { setCurrentQ(currentQ + 1); setCurrentHint(''); }
    else { submitAnswers(); }
  };

  const submitAnswers = async () => {
    if (!participant || submitRef.current) return;
    submitRef.current = true;
    setTimerActive(false);
    const score = answers.reduce((acc, ans, i) => ans === questions[i]?.correctIndex ? acc + 2 : acc, 0);
    try {
      const today = getTodayDate();
      const isFriday = new Date().getDay() === 5;
      await supabase.functions.invoke('quiz-submit', {
        body: { device_id: getDeviceId(), participant_id: participant.id, question_date: today, answers, score, is_friday: isFriday }
      });
      setTodayScore(score);
      setTodayAnswered(true);
      setParticipant(prev => prev ? { ...prev, score: (prev.score || 0) + score + (isFriday ? 1.5 : 0) + (SPECIAL_DATES[today]?.bonus || 0) } : null);
      setView('result');
    } catch (e) { console.error(e); }
  };

  const fetchLeaderboard = async () => {
    const { data } = await supabase.from('quiz_participants').select('*').order('score', { ascending: false }).limit(30);
    if (data) setLeaderboard(data as Participant[]);
  };

  const handleShare = async () => {
    if (!participant) return;
    const shareCode = generateShareCode();
    await supabase.functions.invoke('quiz-share', { body: { participant_id: participant.id, share_code: shareCode } });
    const shareText = `جرّب مسابقة عِتْرَةً الدينية وشارك التحدي مع الأهل والأصدقاء\n\nhttps://atraa.xyz/q/${shareCode}`;
    if (navigator.share) {
      try { await navigator.share({ text: shareText }); return; } catch {}
    }
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchHint = async () => {
    if (hintsUsed >= 2 || hintLoading || !questions[currentQ]) return;
    setHintLoading(true);
    try {
      const q = questions[currentQ];
      const response = await supabase.functions.invoke('quiz-hint', {
        body: { question: q.question, options: q.options }
      });
      if (response.data?.hint) { setCurrentHint(response.data.hint); setHintsUsed(prev => prev + 1); }
    } catch (e) { console.error(e); }
    finally { setHintLoading(false); }
  };

  const handleDayClick = async (date: string) => {
    const today = getTodayDate();
    if (date > today) return;
    const { data: qData } = await supabase.from('quiz_daily_questions').select('questions').eq('question_date', date).maybeSingle();
    const answer = answerHistory.find(a => a.question_date === date);
    setSelectedDay({
      date,
      questions: (qData?.questions || []) as unknown as QuizQuestion[],
      userAnswers: answer?.answers || null,
      score: answer?.score || 0,
      solved: !!answer,
    });
  };

  const statusInfoTexts = {
    solved: { title: 'هذا يعني تم حل سؤال اليوم بنجاح ✅', desc: 'أحسنت! لقد أجبت على سؤال اليوم وحصلت على نقطتين في رصيدك، استعد لسؤال الغداً' },
    missed: { title: 'هذا يعني فاتك السؤال ❌', desc: 'لا تقلق! سيكون هناك سؤال جديد غداً من الساعة 9:00 صباحاً، لا تفوّته' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-130px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // REGISTER VIEW
  // ═══════════════════════════════════════
  if (view === 'register') {
    return (
      <div className="px-4 py-5 animate-fade-in">
        <BackButton onClick={() => setView('home')} />

        {/* Header */}
        <div className="text-center mb-6">
          <img src={quizFace} alt="مسابقة عترة" className="w-28 h-28 mx-auto mb-4 rounded-3xl object-contain shadow-elevated" />
          <h1 className="text-xl font-bold text-foreground">التسجيل في المسابقة</h1>
          <p className="text-xs text-muted-foreground mt-1.5">سجّل الآن واستعد لتحدي المعرفة الدينية</p>
        </div>

        <div className="space-y-4">
          {/* Use existing name */}
          {user?.name && (
            <Section>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={regUseExisting} onChange={(e) => setRegUseExisting(e.target.checked)} className="w-4 h-4 accent-primary rounded" />
                <span className="text-sm text-foreground">استخدام الاسم المسجل: <strong>{user.name}</strong></span>
              </label>
            </Section>
          )}

          {/* Nickname */}
          {!regUseExisting && (
            <Section>
              <label className="block text-xs font-bold text-foreground mb-2">اللقب</label>
              <input type="text" value={regNickname} onChange={(e) => setRegNickname(e.target.value)} placeholder="أدخل لقبك"
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm transition-all" />
            </Section>
          )}

          {/* Emoji */}
          <Section>
            <label className="block text-xs font-bold text-foreground mb-2.5">اختر إيموجي</label>
            <div className="grid grid-cols-10 gap-1.5">
              {QUIZ_EMOJIS.map(emoji => (
                <button key={emoji} onClick={() => setRegEmoji(emoji)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all duration-150 ${
                    regEmoji === emoji
                      ? 'bg-primary/15 ring-2 ring-primary scale-110 shadow-sm'
                      : 'bg-secondary/60 hover:bg-secondary'
                  }`}>
                  {emoji}
                </button>
              ))}
            </div>
          </Section>

          {/* Bio */}
          <Section>
            <label className="block text-xs font-bold text-foreground mb-2">
              نبذة <span className="text-muted-foreground font-normal">(اختياري · ٣٠ حرف)</span>
            </label>
            <input type="text" value={regBio} onChange={(e) => e.target.value.length <= 30 && setRegBio(e.target.value)} placeholder="نبذة قصيرة عنك..." maxLength={30}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm transition-all" />
            <div className="flex items-center justify-between mt-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={regBioPublic} onChange={(e) => setRegBioPublic(e.target.checked)} className="w-4 h-4 accent-primary rounded" />
                <span className="text-[11px] text-muted-foreground">عرض النبذة للجميع</span>
              </label>
              <span className="text-[10px] text-muted-foreground font-mono">{regBio.length}/30</span>
            </div>
          </Section>

          {/* Age */}
          <Section>
            <label className="block text-xs font-bold text-foreground mb-2">
              العمر <span className="text-muted-foreground font-normal">(يحدد مستوى الأسئلة)</span>
            </label>
            <input type="number" value={regAge} onChange={(e) => setRegAge(e.target.value)} placeholder="١٢ — ٦٠" min={12} max={60}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm transition-all" />
          </Section>

          {/* Teams - coming soon */}
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border/50 opacity-60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">إنشاء فريق أو الانضمام</span>
              </div>
              <span className="text-[10px] font-bold text-accent-foreground bg-accent/20 px-2.5 py-1 rounded-full">قريباً v2</span>
            </div>
          </div>

          {/* Agreement */}
          <Section>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={regAgreed} onChange={(e) => setRegAgreed(e.target.checked)} className="w-4 h-4 accent-primary mt-0.5 rounded" />
              <span className="text-[11px] text-muted-foreground leading-relaxed">
                أوافق على <a href="/policies" className="text-primary underline font-medium">سياسات الموقع وشروط المسابقة</a>.
                أقر بأن الأسئلة مولّدة بالذكاء الاصطناعي وقد تحتوي على أخطاء.
              </span>
            </label>
          </Section>

          {regError && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive text-center font-medium">{regError}</p>
            </motion.div>
          )}

          <button onClick={handleRegister}
            className="w-full py-4 rounded-2xl islamic-gradient text-primary-foreground font-bold text-base shadow-elevated hover:opacity-95 transition-all active:scale-[0.98]">
            تسجيل
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // LEADERBOARD VIEW
  // ═══════════════════════════════════════
  if (view === 'leaderboard') {
    return (
      <div className="px-4 py-5 animate-fade-in">
        <BackButton onClick={() => setView('home')} />

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl islamic-gradient flex items-center justify-center shadow-card">
            <Trophy className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">قائمة المتصدرين</h1>
            <p className="text-[11px] text-muted-foreground">أفضل {Math.min(leaderboard.length, 20)} متسابق</p>
          </div>
        </div>

        {/* Top 3 podium */}
        {leaderboard.length >= 3 && (
          <div className="flex items-end justify-center gap-3 mb-6">
            {[1, 0, 2].map((rank) => {
              const p = leaderboard[rank];
              const isFirst = rank === 0;
              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: rank * 0.1 }}
                  className={`flex flex-col items-center ${isFirst ? 'order-2' : rank === 1 ? 'order-1' : 'order-3'}`}>
                  <div className={`relative mb-1 ${isFirst ? 'scale-110' : ''}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                      isFirst ? 'bg-accent/20 ring-2 ring-accent shadow-elevated' : 'bg-secondary ring-1 ring-border'
                    }`}>
                      {p.emoji}
                    </div>
                    <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isFirst ? 'bg-accent text-accent-foreground' : rank === 1 ? 'bg-muted-foreground/20 text-foreground' : 'bg-accent/40 text-accent-foreground'
                    }`}>
                      {rank + 1}
                    </div>
                  </div>
                  <p className="text-[11px] font-bold text-foreground truncate max-w-[70px] text-center">{p.nickname}</p>
                  <p className="text-[10px] font-bold text-primary">{p.score} نقطة</p>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="space-y-2">
          {leaderboard.slice(leaderboard.length >= 3 ? 3 : 0).map((p, i) => {
            const rank = leaderboard.length >= 3 ? i + 4 : i + 1;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all ${
                  rank <= 20 ? 'bg-card border border-border/60' : 'bg-secondary/40 border border-border/30'
                }`}>
                <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-[11px] font-black text-muted-foreground">
                  {rank}
                </div>
                <span className="text-lg">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{p.nickname}</p>
                  {p.bio_public && p.bio && <p className="text-[10px] text-muted-foreground truncate">{p.bio}</p>}
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-primary">{p.score}</p>
                  <p className="text-[9px] text-muted-foreground">نقطة</p>
                </div>
              </motion.div>
            );
          })}
          {leaderboard.length === 0 && (
            <div className="text-center py-16">
              <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">لا يوجد متسابقين بعد</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // QUESTIONS VIEW
  // ═══════════════════════════════════════
  if (view === 'questions' && questions.length > 0) {
    const q = questions[currentQ];
    const answered = answers[currentQ] !== null;

    return (
      <div className="px-4 py-5 animate-fade-in min-h-[calc(100vh-130px)] flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setView('home')} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-mono font-black ${
            timerSec < 60 ? 'bg-destructive/10 text-destructive animate-pulse' : timerSec < 180 ? 'bg-accent/10 text-accent-foreground' : 'bg-primary/10 text-primary'
          }`}>
            <Timer className="w-3.5 h-3.5" />
            {formatTimer(timerSec)}
          </div>
        </div>

        {/* Logo small */}
        <div className="flex justify-center mb-4">
          <img src={quizFace} alt="مسابقة عترة" className="w-16 h-16 rounded-2xl object-contain shadow-card" />
        </div>

        {/* Progress steps */}
        <div className="flex gap-2 mb-2">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex-1 relative">
              <div className={`h-2 rounded-full transition-all duration-500 ${
                i < currentQ ? 'islamic-gradient' : i === currentQ ? 'bg-primary/30' : 'bg-secondary'
              }`} />
              {i <= currentQ && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${
                    i < currentQ ? 'islamic-gradient text-primary-foreground' : 'bg-primary/20 text-primary'
                  }`}>
                    {i + 1}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mb-4 text-center">السؤال {currentQ + 1} من 4</p>

        {/* Question */}
        <div className="flex-1">
          <Section className="mb-4">
            <h2 className="text-base font-bold text-foreground leading-relaxed">{q.question}</h2>
          </Section>

          <div className="space-y-2.5">
            {q.options.map((option, i) => {
              const isSelected = answers[currentQ] === i;
              const isCorrect = i === q.correctIndex;
              const showResult = answered;
              return (
                <motion.button key={i} whileTap={!answered ? { scale: 0.97 } : {}} onClick={() => handleAnswer(i)} disabled={answered}
                  className={`w-full text-right p-4 rounded-2xl border-2 transition-all duration-200 ${
                    showResult
                      ? isCorrect ? 'border-primary bg-primary/10 shadow-sm' : isSelected ? 'border-destructive bg-destructive/5' : 'border-border/40 bg-card/50 opacity-60'
                      : isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0 ${
                      showResult
                        ? isCorrect ? 'islamic-gradient text-primary-foreground' : isSelected ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-muted-foreground'
                        : isSelected ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {String.fromCharCode(1571 + i)}
                    </div>
                    <span className="text-sm font-medium text-foreground">{option}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Hint */}
          {!answered && (
            <div className="mt-4">
              {currentHint && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                  <Section className="mb-3 !bg-accent/5 !border-accent/20">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-accent-foreground" />
                      <span className="text-[11px] font-bold text-accent-foreground">تلميح</span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{currentHint}</p>
                  </Section>
                </motion.div>
              )}
              <button onClick={fetchHint} disabled={hintsUsed >= 2 || hintLoading}
                className="flex items-center gap-1.5 text-xs font-semibold text-accent-foreground disabled:opacity-30 transition-opacity">
                <Lightbulb className={`w-3.5 h-3.5 ${hintLoading ? 'animate-pulse' : ''}`} />
                {hintLoading ? 'جاري التلميح...' : `تلميح (${2 - hintsUsed} متبقي)`}
              </button>
            </div>
          )}
        </div>

        {answered && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
            <button onClick={handleNext}
              className="w-full py-4 rounded-2xl islamic-gradient text-primary-foreground font-bold shadow-elevated active:scale-[0.98] transition-transform">
              {currentQ < 3 ? 'السؤال التالي' : 'عرض النتيجة'}
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════
  // RESULT VIEW
  // ═══════════════════════════════════════
  if (view === 'result') {
    const today = getTodayDate();
    const isFriday = new Date().getDay() === 5;
    const special = SPECIAL_DATES[today];
    const bonus = (isFriday ? 1.5 : 0) + (special?.bonus || 0);
    const perfect = todayScore === 8;

    return (
      <div className="px-4 py-5 animate-fade-in min-h-[calc(100vh-130px)] flex flex-col items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="text-center w-full">
          <div className="text-6xl mb-5">{perfect ? '🎉' : todayScore >= 4 ? '👏' : '💪🏻'}</div>

          <Section className="mb-5">
            <h1 className="text-xl font-black text-foreground mb-3">نتيجتك اليوم</h1>
            <div className="flex items-center justify-center gap-1">
              <span className="text-5xl font-black text-primary">{todayScore}</span>
              <span className="text-lg text-muted-foreground font-medium">/8</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">نقاط</p>
            
            {bonus > 0 && (
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent/10 mt-3">
                <Gift className="w-3.5 h-3.5 text-accent-foreground" />
                <span className="text-xs font-bold text-accent-foreground">
                  +{bonus} نقطة هدية! {isFriday ? '🎁 جمعة مباركة' : ''} {special ? `🎁 ${special.name}` : ''}
                </span>
              </div>
            )}

            <p className="text-sm text-foreground mt-3 font-medium">
              {perfect ? 'ممتاز! أجبت على جميع الأسئلة بشكل صحيح' : todayScore >= 4 ? 'أحسنت! استمر في المحاولة' : 'لا تقلق، حاول غداً!'}
            </p>
          </Section>

          <div className="space-y-2.5 w-full">
            <button onClick={handleShare}
              className="w-full py-3.5 rounded-2xl islamic-gradient text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-elevated active:scale-[0.98] transition-transform">
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'تم النسخ!' : 'شارك التحدي'}
            </button>
            <button onClick={() => { setView('leaderboard'); fetchLeaderboard(); }}
              className="w-full py-3 rounded-2xl bg-card border border-border text-foreground font-semibold flex items-center justify-center gap-2 shadow-card">
              <Trophy className="w-4 h-4 text-accent-foreground" /> قائمة المتصدرين
            </button>
            <button onClick={() => setView('home')} className="w-full py-3 rounded-2xl bg-secondary text-foreground text-sm font-semibold">
              الرئيسية
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // HOME VIEW
  // ═══════════════════════════════════════
  const quizDays = getQuizDays();
  const today = getTodayDate();

  return (
    <div className="px-4 py-5 animate-fade-in">
      {/* Hero header */}
      <div className="text-center mb-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
          <img src={quizFace} alt="مسابقة عترة" className="w-32 h-32 mx-auto mb-4 rounded-3xl object-contain shadow-elevated" />
        </motion.div>
        <h1 className="text-xl font-black text-foreground mb-1.5">مسابقة عِتْرَة</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">أسئلة دينية وثقافية عن أهل البيت عليهم السلام</p>
        <p className="text-[11px] text-muted-foreground/70 mt-1">اختبر معلوماتك وتعلّم المزيد عن سيرتهم وأحاديثهم</p>
      </div>

      {/* Status banners */}
      <div className="space-y-3 mb-5">
        {/* Countdown */}
        {isBeforeStart && (
          <Section className="text-center !bg-accent/5 !border-accent/20">
            <Clock className="w-7 h-7 text-accent-foreground mx-auto mb-3" />
            <p className="text-sm font-bold text-foreground mb-3">المسابقة تبدأ في ٢١ مارس ٢٠٢٦</p>
            <div className="flex items-center justify-center gap-2.5">
              {[
                { v: countdown.d, l: 'يوم' },
                { v: countdown.h, l: 'ساعة' },
                { v: countdown.m, l: 'دقيقة' },
                { v: countdown.s, l: 'ثانية' },
              ].map(({ v, l }) => (
                <div key={l} className="bg-card rounded-2xl px-3 py-2.5 shadow-card min-w-[52px] border border-border/50">
                  <p className="text-xl font-black text-primary">{v}</p>
                  <p className="text-[9px] text-muted-foreground font-medium">{l}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">سجّل الآن واستعد!</p>
          </Section>
        )}

        {isAfterEnd && (
          <Section className="text-center">
            <p className="text-sm font-bold text-foreground">انتهت المسابقة 🏁</p>
            <p className="text-xs text-muted-foreground mt-1">شكراً لمشاركتك!</p>
          </Section>
        )}

        {isQuizActive() && !isQuestionsTime() && (
          <Section className="text-center !bg-accent/5 !border-accent/20">
            <Clock className="w-5 h-5 text-accent-foreground mx-auto mb-2" />
            <p className="text-sm font-bold text-foreground">الأسئلة متاحة من ٩:٠٠ ص حتى ٩:٣٠ م</p>
            <p className="text-[11px] text-muted-foreground mt-1">عد لاحقاً!</p>
          </Section>
        )}

        {/* Special day / Friday */}
        {SPECIAL_DATES[today] && (
          <Section className="!bg-accent/5 !border-accent/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center text-lg">🎁</div>
              <div>
                <p className="text-xs font-bold text-foreground">هدية اليوم: {SPECIAL_DATES[today].name}</p>
                <p className="text-[10px] text-muted-foreground">+{SPECIAL_DATES[today].bonus} نقاط هدية عند حل أسئلة اليوم</p>
              </div>
            </div>
          </Section>
        )}

        {new Date().getDay() === 5 && isQuizActive() && (
          <Section className="!bg-accent/5 !border-accent/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center text-lg">🎁</div>
              <div>
                <p className="text-xs font-bold text-foreground">جمعة مباركة! سؤال مغشوش + ١.٥ نقطة هدية</p>
              </div>
            </div>
          </Section>
        )}
      </div>

      {/* Participant card */}
      {participant && (
        <Section className="mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl ring-2 ring-primary/20">
              {participant.emoji}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">{participant.nickname}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3 h-3 text-accent-foreground" />
                <p className="text-xs font-semibold text-primary">{participant.score} نقطة</p>
              </div>
            </div>

            {/* Status badge */}
            {todayAnswered ? (
              <button onClick={() => setStatusInfoIdx(0)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
                <span className="text-sm">🫡</span><span className="text-[11px] font-bold text-primary">تم الحل</span>
              </button>
            ) : !questionsAvailable && isQuizActive() ? (
              <button onClick={() => setStatusInfoIdx(1)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-destructive/10 border border-destructive/20">
                <span className="text-sm">❗️</span><span className="text-[11px] font-bold text-destructive">فاتك</span>
              </button>
            ) : isQuizActive() ? (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/10 border border-accent/20">
                <span className="text-sm">⏳</span><span className="text-[11px] font-bold text-accent-foreground">لم يُحل</span>
              </div>
            ) : null}
          </div>
        </Section>
      )}

      {/* Status info modal */}
      <AnimatePresence>
        {statusInfoIdx !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm px-6" onClick={() => setStatusInfoIdx(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-card rounded-3xl p-6 shadow-elevated max-w-sm w-full text-center border border-border/50" onClick={(e) => e.stopPropagation()}>
              <p className="text-4xl mb-3">{statusInfoIdx === 0 ? '🫡' : '❗️'}</p>
              <p className="text-sm font-bold text-foreground mb-2">{statusInfoIdx === 0 ? statusInfoTexts.solved.title : statusInfoTexts.missed.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{statusInfoIdx === 0 ? statusInfoTexts.solved.desc : statusInfoTexts.missed.desc}</p>
              <button onClick={() => setStatusInfoIdx(null)} className="mt-5 px-8 py-2.5 rounded-2xl bg-secondary text-foreground text-sm font-semibold">حسناً</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar */}
      {isQuizActive() && participant && (
        <Section className="mb-4">
          <button onClick={() => setShowCalendar(!showCalendar)} className="flex items-center justify-between w-full">
            <SectionTitle icon={CalendarIcon}>جدول الأيام</SectionTitle>
            <span className="text-xs text-primary font-semibold">{showCalendar ? 'إخفاء' : 'عرض'}</span>
          </button>
          <AnimatePresence>
            {showCalendar && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="grid grid-cols-7 gap-1.5 max-h-[280px] overflow-y-auto hide-scrollbar pt-2">
                  {quizDays.map(day => {
                    const isPast = day.date < today;
                    const isToday = day.date === today;
                    const isFuture = day.date > today;
                    const answered = answerHistory.find(a => a.question_date === day.date);
                    return (
                      <button key={day.date} onClick={() => isPast && handleDayClick(day.date)} disabled={isFuture}
                        className={`aspect-square rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all ${
                          isToday ? 'ring-2 ring-primary bg-primary/10' : isPast && answered ? 'bg-primary/8' : isPast ? 'bg-destructive/5' : 'bg-secondary/40 opacity-40'
                        } ${day.isFriday ? 'border border-accent/30' : ''} ${day.special ? 'border-2 border-accent' : ''}`}>
                        <span className="text-foreground">{day.dayNum}</span>
                        {isPast && answered && <span className="text-[8px]">🫡</span>}
                        {isPast && !answered && <span className="text-[8px]">❗️</span>}
                        {isToday && !todayAnswered && <span className="text-[8px]">⏳</span>}
                        {isToday && todayAnswered && <span className="text-[8px]">🫡</span>}
                        {day.isFriday && <span className="text-[7px]">🎁</span>}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>
      )}

      {/* Day detail modal */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm px-5" onClick={() => setSelectedDay(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-card rounded-3xl p-5 shadow-elevated max-w-sm w-full max-h-[70vh] overflow-y-auto border border-border/50" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-sm font-bold text-foreground mb-1">أسئلة يوم {selectedDay.date}</h3>
              <p className="text-xs text-muted-foreground mb-4">
                {selectedDay.solved ? `✅ تم الحل · ${selectedDay.score} نقاط` : '❌ لم يتم الحل'}
              </p>
              {selectedDay.questions.map((q: QuizQuestion, i: number) => (
                <div key={i} className="mb-4 p-3 rounded-2xl bg-secondary/50 border border-border/40">
                  <p className="text-xs font-bold text-foreground mb-2">{i + 1}. {q.question}</p>
                  <div className="space-y-1.5">
                    {q.options.map((opt: string, j: number) => {
                      const isCorrect = j === q.correctIndex;
                      const wasSelected = selectedDay.userAnswers?.[i] === j;
                      return (
                        <div key={j} className={`px-3 py-2 rounded-xl text-[11px] ${
                          isCorrect ? 'bg-primary/10 text-primary font-bold' : wasSelected ? 'bg-destructive/10 text-destructive' : 'bg-card text-muted-foreground'
                        }`}>{opt}</div>
                      );
                    })}
                  </div>
                  {!selectedDay.solved && (
                    <p className="text-[10px] text-primary mt-2 font-semibold">📚 راجع الموضوع واستعد ليوم جديد!</p>
                  )}
                </div>
              ))}
              <button onClick={() => setSelectedDay(null)} className="w-full py-2.5 rounded-2xl bg-secondary text-foreground text-sm font-semibold">إغلاق</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="space-y-2.5 mt-5">
        {!participant ? (
          <button onClick={() => setView('register')}
            className="w-full py-4 rounded-2xl islamic-gradient text-primary-foreground font-bold text-base shadow-elevated active:scale-[0.98] transition-transform">
            سجّل الآن
          </button>
        ) : questionsAvailable && !todayAnswered ? (
          <button onClick={() => { setView('questions'); fetchQuestions(); setCurrentQ(0); setAnswers([null, null, null, null]); setTimerSec(TIMER_DURATION); setTimerActive(true); setHintsUsed(0); setCurrentHint(''); submitRef.current = false; }}
            className="w-full py-4 rounded-2xl islamic-gradient text-primary-foreground font-bold text-base shadow-elevated active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            ابدأ أسئلة اليوم
          </button>
        ) : null}

        <button onClick={() => { setView('leaderboard'); fetchLeaderboard(); }}
          className="w-full py-3 rounded-2xl bg-card border border-border text-foreground font-semibold flex items-center justify-center gap-2 shadow-card active:scale-[0.98] transition-transform">
          <Trophy className="w-4 h-4 text-accent-foreground" /> قائمة المتصدرين
        </button>

        <button onClick={handleShare}
          className="w-full py-3 rounded-2xl bg-card border border-border text-foreground font-semibold flex items-center justify-center gap-2 shadow-card active:scale-[0.98] transition-transform">
          {copied ? <Check className="w-4 h-4 text-primary" /> : <Share2 className="w-4 h-4" />}
          {copied ? 'تم النسخ!' : 'شارك المسابقة'}
        </button>
      </div>

      {/* About section */}
      <Section className="mt-5">
        <SectionTitle icon={Info}>عن المسابقة</SectionTitle>
        <ul className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> ٤ أسئلة يومية عن أهل البيت عليهم السلام</li>
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> لكل سؤال صحيح نقطتان · عداد ١٠ دقائق لكل جولة</li>
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> تلميحان من الذكاء الاصطناعي لكل جولة</li>
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> الأسئلة متاحة من ٩:٠٠ صباحاً حتى ٩:٣٠ مساءً</li>
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> المسابقة من ٢١ مارس حتى ٢١ مايو ٢٠٢٦</li>
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> الأسئلة تتغير يومياً حسب عمرك ومستواك</li>
          <li className="flex items-start gap-2"><span className="text-accent-foreground mt-0.5">🎁</span> كل جمعة: سؤال مغشوش + ١.٥ نقطة هدية</li>
          <li className="flex items-start gap-2"><span className="text-accent-foreground mt-0.5">🎁</span> مناسبات أهل البيت: ٥ نقاط هدية</li>
        </ul>
      </Section>

      {/* Questions loading overlay */}
      {questionsLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground font-medium">جاري تحميل الأسئلة...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
