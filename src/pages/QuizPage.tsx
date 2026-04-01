import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Share2, Clock, ChevronLeft, Info, Copy, Check, Lightbulb, Gift, Calendar as CalendarIcon, Timer, Users, Sparkles, ArrowLeft, Edit3, Star, Zap, Target, Crown, Medal, Award, TrendingUp, BookOpen, X as XIcon, AlertTriangle, CheckCircle, CircleDot, PartyPopper, ThumbsUp, Flame, Heart } from 'lucide-react';
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
const TIMER_DURATION = 180;
const HINT_AVAILABLE_AT = 90;

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

type QuizView = 'home' | 'register' | 'questions' | 'leaderboard' | 'result' | 'edit-profile';

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

/* ─── Animations ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } }),
};

const scaleIn = {
  hidden: { scale: 0.85, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

/* ─── Glass Card ─── */
const GlassCard = ({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div onClick={onClick} className={`bg-card/80 backdrop-blur-sm rounded-2xl border border-border/40 shadow-card ${className}`}>
    {children}
  </div>
);

/* ─── Back Button ─── */
const BackButton = ({ onClick }: { onClick: () => void }) => (
  <motion.button initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} onClick={onClick}
    className="flex items-center gap-2 text-primary text-sm font-semibold mb-6 group">
    <div className="w-8 h-8 rounded-xl bg-primary/8 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary/15 transition-all duration-200 group-active:scale-90">
      <ChevronLeft className="w-4 h-4" />
    </div>
    <span className="group-hover:translate-x-0.5 transition-transform duration-200">رجوع</span>
  </motion.button>
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
    if (age >= 99) { setRegError('العمر يجب أن يكون أقل من ١٠٠ سنة'); return; }
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
    const shareText = `جرّب مسابقة عِتَرَةً الدينية وشارك التحدي مع الأهل والأصدقاء\n\nhttps://atraa.xyz/q/${shareCode}`;
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
    solved: { title: 'تم حل سؤال اليوم بنجاح', desc: 'أحسنت! لقد أجبت على سؤال اليوم وحصلت على نقطتين في رصيدك، استعد لسؤال الغداً' },
    missed: { title: 'فاتك السؤال', desc: 'لا تقلق! سيكون هناك سؤال جديد غداً من الساعة 9:00 صباحاً، لا تفوّته' },
  };

  /* ─── LOADING ─── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-130px)]">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl islamic-gradient flex items-center justify-center shadow-elevated">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="absolute inset-0 w-14 h-14 rounded-2xl border-2 border-primary/20 animate-ping" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">جاري التحميل...</p>
        </motion.div>
      </div>
    );
  }

  /* ═══════════════════════════════════════ */
  /* REGISTER VIEW                          */
  /* ═══════════════════════════════════════ */
  if (view === 'register') {
    return (
      <motion.div initial="hidden" animate="visible" className="px-4 py-5 pb-32">
        <BackButton onClick={() => setView('home')} />

        {/* Header */}
        <motion.div variants={fadeUp} custom={0} className="text-center mb-8">
          <div className="relative inline-block">
            <img src={quizFace} alt="مسابقة عترة" className="w-24 h-24 mx-auto mb-4 rounded-3xl object-contain shadow-elevated" />
            <div className="absolute -bottom-1 -left-1 w-8 h-8 rounded-xl islamic-gradient flex items-center justify-center shadow-card">
              <Edit3 className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-xl font-black text-foreground">التسجيل في المسابقة</h1>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-[260px] mx-auto leading-relaxed">سجّل الآن واستعد لتحدي المعرفة الدينية</p>
        </motion.div>

        <div className="space-y-4">
          {/* Use existing name */}
          {user?.name && (
            <motion.div variants={fadeUp} custom={1}>
              <GlassCard className="p-4">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setRegUseExisting(!regUseExisting)}>
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${regUseExisting ? 'border-primary bg-primary' : 'border-border'}`}>
                    {regUseExisting && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <span className="text-sm text-foreground">استخدام الاسم المسجل: <strong className="text-primary">{user.name}</strong></span>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Nickname */}
          {!regUseExisting && (
            <motion.div variants={fadeUp} custom={1.5}>
              <GlassCard className="p-4">
                <label className="block text-xs font-bold text-foreground mb-2.5">اللقب</label>
                <div className="relative">
                  <input type="text" value={regNickname} onChange={(e) => setRegNickname(e.target.value)} placeholder="أدخل لقبك"
                    className="w-full px-4 py-3.5 rounded-xl bg-secondary/40 border border-border/60 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 text-sm transition-all" />
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Emoji */}
          <motion.div variants={fadeUp} custom={2}>
            <GlassCard className="p-4">
              <label className="block text-xs font-bold text-foreground mb-3">اختر إيموجي</label>
              <div className="grid grid-cols-10 gap-1.5">
                {QUIZ_EMOJIS.map(emoji => (
                  <motion.button key={emoji} whileTap={{ scale: 0.85 }} onClick={() => setRegEmoji(emoji)}
                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all duration-200 ${
                      regEmoji === emoji
                        ? 'islamic-gradient shadow-sm scale-110 ring-2 ring-primary/30'
                        : 'bg-secondary/50 hover:bg-secondary active:scale-90'
                    }`}>
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Bio */}
          <motion.div variants={fadeUp} custom={3}>
            <GlassCard className="p-4">
              <label className="block text-xs font-bold text-foreground mb-2.5">
                نبذة <span className="text-muted-foreground font-normal">(اختياري · ٣٠ حرف)</span>
              </label>
              <input type="text" value={regBio} onChange={(e) => e.target.value.length <= 30 && setRegBio(e.target.value)} placeholder="نبذة قصيرة عنك..." maxLength={30}
                className="w-full px-4 py-3.5 rounded-xl bg-secondary/40 border border-border/60 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 text-sm transition-all" />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setRegBioPublic(!regBioPublic)}>
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${regBioPublic ? 'border-primary bg-primary' : 'border-border'}`}>
                    {regBioPublic && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <span className="text-[11px] text-muted-foreground">عرض النبذة للجميع</span>
                </div>
                <span className="text-[10px] text-muted-foreground/60 font-mono tabular-nums">{regBio.length}/30</span>
              </div>
            </GlassCard>
          </motion.div>

          {/* Age */}
          <motion.div variants={fadeUp} custom={4}>
            <GlassCard className="p-4">
              <label className="block text-xs font-bold text-foreground mb-2.5">
                العمر <span className="text-muted-foreground font-normal">(يحدد مستوى الأسئلة)</span>
              </label>
              <input type="number" value={regAge} onChange={(e) => setRegAge(e.target.value)} placeholder="١٢ — ٦٠" min={12} max={60}
                className="w-full px-4 py-3.5 rounded-xl bg-secondary/40 border border-border/60 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 text-sm transition-all" />
            </GlassCard>
          </motion.div>

          {/* Teams - coming soon */}
          <motion.div variants={fadeUp} custom={5}>
            <div className="p-4 rounded-2xl bg-secondary/30 border border-dashed border-border/50 opacity-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground">إنشاء فريق أو الانضمام</span>
                </div>
                <span className="text-[10px] font-bold text-accent-foreground bg-accent/15 px-2.5 py-1 rounded-full">قريباً v2</span>
              </div>
            </div>
          </motion.div>

          {/* Agreement */}
          <motion.div variants={fadeUp} custom={6}>
            <GlassCard className="p-4">
              <div className="flex items-start gap-3 cursor-pointer" onClick={() => setRegAgreed(!regAgreed)}>
                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all mt-0.5 flex-shrink-0 ${regAgreed ? 'border-primary bg-primary' : 'border-border'}`}>
                  {regAgreed && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
                <span className="text-[11px] text-muted-foreground leading-relaxed">
                  أوافق على <a href="/policies" onClick={(e) => e.stopPropagation()} className="text-primary underline font-medium">سياسات الموقع وشروط المسابقة</a>.
                  أقر بأن الأسئلة مولّدة بالذكاء الاصطناعي وقد تحتوي على أخطاء.
                </span>
              </div>
            </GlassCard>
          </motion.div>

          {regError && (
            <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="p-3.5 rounded-xl bg-destructive/8 border border-destructive/15">
              <p className="text-sm text-destructive text-center font-medium">{regError}</p>
            </motion.div>
          )}

          <motion.div variants={fadeUp} custom={7}>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleRegister}
              className="w-full py-4 rounded-2xl islamic-gradient text-primary-foreground font-bold text-base shadow-elevated transition-all">
              تسجيل
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  /* ═══════════════════════════════════════ */
  /* LEADERBOARD VIEW                       */
  /* ═══════════════════════════════════════ */
  if (view === 'leaderboard') {
    return (
      <motion.div initial="hidden" animate="visible" className="px-4 py-5 pb-32">
        <BackButton onClick={() => setView('home')} />

        <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl islamic-gradient flex items-center justify-center shadow-elevated">
            <Trophy className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-black text-foreground">قائمة المتصدرين</h1>
            <p className="text-[11px] text-muted-foreground">أفضل {Math.min(leaderboard.length, 20)} متسابق</p>
          </div>
        </motion.div>

        {/* Top 3 podium */}
        {leaderboard.length >= 3 && (
          <motion.div variants={fadeUp} custom={1} className="mb-6">
            <GlassCard className="p-5 pb-6">
              <div className="flex items-end justify-center gap-4">
                {[1, 0, 2].map((rank) => {
                  const p = leaderboard[rank];
                  const isFirst = rank === 0;
                  const medalColors = ['', 'bg-muted text-muted-foreground', ''][rank] || 'bg-accent/20 text-accent-foreground';
                  return (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: rank * 0.12 }}
                      className={`flex flex-col items-center ${isFirst ? 'order-2 -mt-3' : rank === 1 ? 'order-1' : 'order-3'}`}>
                      <div className={`relative mb-2 ${isFirst ? '' : ''}`}>
                        {isFirst && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <Crown className="w-5 h-5 text-accent" />
                          </div>
                        )}
                        <div className={`rounded-2xl flex items-center justify-center ${
                          isFirst ? 'w-16 h-16 text-3xl bg-accent/10 ring-2 ring-accent/40 shadow-elevated' : 'w-13 h-13 text-2xl bg-secondary ring-1 ring-border/60'
                        }`} style={!isFirst ? { width: 52, height: 52 } : {}}>
                          {p.emoji}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ${
                          isFirst ? 'bg-accent text-accent-foreground' : rank === 1 ? 'bg-muted-foreground/15 text-foreground' : 'bg-accent/30 text-accent-foreground'
                        }`}>
                          {rank + 1}
                        </div>
                      </div>
                      <p className="text-[11px] font-bold text-foreground truncate max-w-[72px] text-center">{p.nickname}</p>
                      <p className="text-[10px] font-black text-primary mt-0.5">{p.score} نقطة</p>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}

        <div className="space-y-2">
          {leaderboard.slice(leaderboard.length >= 3 ? 3 : 0).map((p, i) => {
            const rank = leaderboard.length >= 3 ? i + 4 : i + 1;
            const isCurrentUser = participant && p.id === participant.id;
            return (
              <motion.div key={p.id} variants={fadeUp} custom={i * 0.3 + 2}
                className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all ${
                  isCurrentUser ? 'bg-primary/5 border border-primary/20' : 'bg-card/80 backdrop-blur-sm border border-border/40'
                }`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black ${
                  isCurrentUser ? 'islamic-gradient text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                  {rank}
                </div>
                <span className="text-xl">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                    {p.nickname} {isCurrentUser && <span className="text-[10px] text-muted-foreground">(أنت)</span>}
                  </p>
                  {p.bio_public && p.bio && <p className="text-[10px] text-muted-foreground truncate">{p.bio}</p>}
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-primary tabular-nums">{p.score}</p>
                  <p className="text-[9px] text-muted-foreground">نقطة</p>
                </div>
              </motion.div>
            );
          })}
          {leaderboard.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-3xl bg-secondary/60 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-7 h-7 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground">لا يوجد متسابقين بعد</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  /* ═══════════════════════════════════════ */
  /* QUESTIONS VIEW                         */
  /* ═══════════════════════════════════════ */
  if (view === 'questions' && questions.length > 0) {
    const q = questions[currentQ];
    const answered = answers[currentQ] !== null;
    const timerPercent = (timerSec / TIMER_DURATION) * 100;

    return (
      <motion.div initial="hidden" animate="visible" className="px-4 py-5 min-h-[calc(100vh-130px)] flex flex-col">
        {/* Top bar */}
        <motion.div variants={fadeUp} custom={0} className="flex items-center justify-between mb-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setView('home')}
            className="w-9 h-9 rounded-xl bg-card/80 backdrop-blur-sm border border-border/40 flex items-center justify-center shadow-sm">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </motion.button>

          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-mono font-black text-sm backdrop-blur-sm border transition-all ${
            timerSec < 30 ? 'bg-destructive/10 text-destructive border-destructive/20 animate-pulse' : timerSec < 60 ? 'bg-destructive/8 text-destructive border-destructive/15' : timerSec < 120 ? 'bg-accent/10 text-accent-foreground border-accent/20' : 'bg-primary/8 text-primary border-primary/15'
          }`}>
            <Timer className="w-3.5 h-3.5" />
            <span className="tabular-nums">{formatTimer(timerSec)}</span>
          </div>
        </motion.div>

        {/* Timer progress bar */}
        <motion.div variants={fadeUp} custom={0.5} className="mb-5">
          <div className="h-1 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-colors ${timerSec < 30 ? 'bg-destructive' : timerSec < 60 ? 'bg-destructive/70' : 'bg-primary'}`}
              animate={{ width: `${timerPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Progress steps */}
        <motion.div variants={fadeUp} custom={1} className="flex gap-2 mb-1.5">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${
                i < currentQ ? 'islamic-gradient' : i === currentQ ? 'bg-primary/30' : 'bg-secondary'
              }`} />
            </div>
          ))}
        </motion.div>
        <p className="text-[11px] text-muted-foreground mb-5 text-center tabular-nums">السؤال {currentQ + 1} من 4</p>

        {/* Question */}
        <div className="flex-1">
          <motion.div variants={fadeUp} custom={2}>
            <GlassCard className="p-5 mb-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl islamic-gradient flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4 text-primary-foreground" />
                </div>
                <h2 className="text-[15px] font-bold text-foreground leading-[1.8]">{q.question}</h2>
              </div>
            </GlassCard>
          </motion.div>

          <div className="space-y-2.5">
            {q.options.map((option, i) => {
              const isSelected = answers[currentQ] === i;
              const isCorrect = i === q.correctIndex;
              const showResult = answered;
              const letters = ['أ', 'ب', 'ج', 'د'];
              return (
                <motion.button key={i} variants={fadeUp} custom={i * 0.4 + 3}
                  whileTap={!answered ? { scale: 0.97 } : {}} onClick={() => handleAnswer(i)} disabled={answered}
                  className={`w-full text-right p-4 rounded-2xl border-2 transition-all duration-300 ${
                    showResult
                      ? isCorrect ? 'border-primary bg-primary/8 shadow-sm' : isSelected ? 'border-destructive/60 bg-destructive/5' : 'border-border/30 bg-card/40 opacity-50'
                      : isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 bg-card/70 backdrop-blur-sm hover:border-primary/30 hover:bg-card active:scale-[0.98]'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 transition-all ${
                      showResult
                        ? isCorrect ? 'islamic-gradient text-primary-foreground' : isSelected ? 'bg-destructive/15 text-destructive' : 'bg-secondary text-muted-foreground'
                        : isSelected ? 'islamic-gradient text-primary-foreground' : 'bg-secondary/70 text-muted-foreground'
                    }`}>
                      {showResult && isCorrect ? <Check className="w-4 h-4" /> : letters[i]}
                    </div>
                    <span className="text-sm font-medium text-foreground">{option}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Hint */}
          {!answered && (
            <motion.div variants={fadeUp} custom={7} className="mt-5">
              <AnimatePresence>
                {currentHint && (
                  <motion.div initial={{ opacity: 0, y: 8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <GlassCard className="mb-3 p-4 !bg-accent/5 !border-accent/15">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-3.5 h-3.5 text-accent-foreground" />
                        <span className="text-[11px] font-bold text-accent-foreground">تلميح</span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">{currentHint}</p>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.button whileTap={{ scale: 0.95 }} onClick={fetchHint} disabled={hintsUsed >= 2 || hintLoading || timerSec > HINT_AVAILABLE_AT}
                className="flex items-center gap-2 text-xs font-semibold text-accent-foreground disabled:opacity-25 transition-all px-3 py-2 rounded-xl hover:bg-accent/5">
                <Lightbulb className={`w-3.5 h-3.5 ${hintLoading ? 'animate-pulse' : ''}`} />
                {timerSec > HINT_AVAILABLE_AT ? `متاح بعد ${formatTimer(timerSec - HINT_AVAILABLE_AT)}` : hintLoading ? 'جاري التلميح...' : `تلميح (${2 - hintsUsed} متبقي)`}
              </motion.button>
            </motion.div>
          )}
        </div>

        {answered && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-5 pb-4">
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleNext}
              className="w-full py-4 rounded-2xl islamic-gradient text-primary-foreground font-bold shadow-elevated transition-all">
              {currentQ < 3 ? 'السؤال التالي' : 'عرض النتيجة'}
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  /* ═══════════════════════════════════════ */
  /* RESULT VIEW                            */
  /* ═══════════════════════════════════════ */
  if (view === 'result') {
    const today = getTodayDate();
    const isFriday = new Date().getDay() === 5;
    const special = SPECIAL_DATES[today];
    const bonus = (isFriday ? 1.5 : 0) + (special?.bonus || 0);
    const perfect = todayScore === 8;
    const scorePercent = (todayScore / 8) * 100;

    return (
      <div className="px-4 py-5 min-h-[calc(100vh-130px)] flex flex-col items-center justify-center pb-32">
        <motion.div initial="hidden" animate="visible" className="text-center w-full max-w-sm">
          {/* Emoji celebration */}
          <motion.div variants={scaleIn} className="mb-6">
            <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center islamic-gradient shadow-elevated">
              {perfect ? <PartyPopper className="w-10 h-10 text-primary-foreground" /> : todayScore >= 6 ? <Star className="w-10 h-10 text-primary-foreground" /> : todayScore >= 4 ? <ThumbsUp className="w-10 h-10 text-primary-foreground" /> : <Flame className="w-10 h-10 text-primary-foreground" />}
            </div>
          </motion.div>

          {/* Score card */}
          <motion.div variants={fadeUp} custom={1}>
            <GlassCard className="p-6 mb-6">
              <h1 className="text-lg font-black text-foreground mb-4">نتيجتك اليوم</h1>

              {/* Circular progress */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                  <motion.circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round"
                    initial={{ strokeDashoffset: 327 }}
                    animate={{ strokeDashoffset: 327 - (327 * scorePercent / 100) }}
                    transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
                    strokeDasharray="327"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
                    className="text-3xl font-black text-primary tabular-nums">{todayScore}</motion.span>
                  <span className="text-xs text-muted-foreground">/8 نقاط</span>
                </div>
              </div>

              {bonus > 0 && (
                <motion.div variants={fadeUp} custom={2} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-accent/8 border border-accent/15 mb-3">
                  <Gift className="w-4 h-4 text-accent-foreground" />
                  <span className="text-xs font-bold text-accent-foreground">
                    +{bonus} نقطة هدية! {isFriday ? 'جمعة مباركة' : ''} {special ? special.name : ''}
                  </span>
                </motion.div>
              )}

              <p className="text-sm text-foreground font-medium leading-relaxed">
                {perfect ? 'ممتاز! أجبت على جميع الأسئلة بشكل صحيح' : todayScore >= 4 ? 'أحسنت! استمر في المحاولة' : 'لا تقلق، حاول غداً!'}
              </p>
            </GlassCard>
          </motion.div>

          <motion.div variants={fadeUp} custom={3} className="space-y-2.5 w-full">
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleShare}
              className="w-full py-3.5 rounded-2xl islamic-gradient text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-elevated">
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'تم النسخ!' : 'شارك التحدي'}
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setView('leaderboard'); fetchLeaderboard(); }}
              className="w-full py-3 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/40 text-foreground font-semibold flex items-center justify-center gap-2 shadow-card">
              <Trophy className="w-4 h-4 text-accent-foreground" /> قائمة المتصدرين
            </motion.button>
            <button onClick={() => setView('home')} className="w-full py-3 rounded-2xl bg-secondary/60 text-foreground text-sm font-semibold">
              الرئيسية
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  /* ═══════════════════════════════════════ */
  /* HOME VIEW                              */
  /* ═══════════════════════════════════════ */
  const quizDays = getQuizDays();
  const today = getTodayDate();

  return (
    <motion.div initial="hidden" animate="visible" className="px-4 py-5 pb-32">
      {/* Hero header */}
      <motion.div variants={fadeUp} custom={0} className="text-center mb-7">
        <motion.div variants={scaleIn} className="relative inline-block mb-4">
          <img src={quizFace} alt="مسابقة عترة" className="w-28 h-28 mx-auto rounded-3xl object-contain shadow-elevated" />
          <div className="absolute -bottom-2 -left-2 w-9 h-9 rounded-xl islamic-gradient flex items-center justify-center shadow-card">
            <Trophy className="w-4 h-4 text-primary-foreground" />
          </div>
        </motion.div>
        <h1 className="text-xl font-black text-foreground mb-1">مسابقة عِتَرَةً</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px] mx-auto">أسئلة دينية وثقافية عن أهل البيت عليهم السلام</p>
      </motion.div>

      {/* Status banners */}
      <div className="space-y-3 mb-5">
        {/* Countdown */}
        {isBeforeStart && (
          <motion.div variants={fadeUp} custom={1}>
            <GlassCard className="text-center p-5 !bg-accent/5 !border-accent/15">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-5 h-5 text-accent-foreground" />
              </div>
              <p className="text-sm font-bold text-foreground mb-4">المسابقة تبدأ في ٢١ مارس ٢٠٢٦</p>
              <div className="flex items-center justify-center gap-2.5">
                {[
                  { v: countdown.d, l: 'يوم' },
                  { v: countdown.h, l: 'ساعة' },
                  { v: countdown.m, l: 'دقيقة' },
                  { v: countdown.s, l: 'ثانية' },
                ].map(({ v, l }) => (
                  <div key={l} className="bg-card/90 backdrop-blur-sm rounded-2xl px-3.5 py-3 shadow-card min-w-[56px] border border-border/40">
                    <p className="text-xl font-black text-primary tabular-nums">{v}</p>
                    <p className="text-[9px] text-muted-foreground font-medium mt-0.5">{l}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-4">سجّل الآن واستعد!</p>
            </GlassCard>
          </motion.div>
        )}

        {isAfterEnd && (
          <motion.div variants={fadeUp} custom={1}>
            <GlassCard className="text-center p-5">
              <div className="w-14 h-14 rounded-3xl bg-secondary/40 flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-7 h-7 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-bold text-foreground">انتهت المسابقة</p>
              <p className="text-xs text-muted-foreground mt-1">شكراً لمشاركتك!</p>
            </GlassCard>
          </motion.div>
        )}

        {isQuizActive() && !isQuestionsTime() && (
          <motion.div variants={fadeUp} custom={1}>
            <GlassCard className="text-center p-5 !bg-accent/5 !border-accent/15">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-2.5">
                <Clock className="w-4 h-4 text-accent-foreground" />
              </div>
              <p className="text-sm font-bold text-foreground">الأسئلة متاحة من ٩:٠٠ ص حتى ٩:٣٠ م</p>
              <p className="text-[11px] text-muted-foreground mt-1.5">عد لاحقاً!</p>
            </GlassCard>
          </motion.div>
        )}

        {/* Special day */}
        {SPECIAL_DATES[today] && (
          <motion.div variants={fadeUp} custom={1.5}>
            <GlassCard className="p-4 !bg-accent/5 !border-accent/15">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-accent/15 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">هدية اليوم: {SPECIAL_DATES[today].name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">+{SPECIAL_DATES[today].bonus} نقاط هدية عند حل أسئلة اليوم</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {new Date().getDay() === 5 && isQuizActive() && (
          <motion.div variants={fadeUp} custom={1.5}>
            <GlassCard className="p-4 !bg-accent/5 !border-accent/15">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-accent/15 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">جمعة مباركة! سؤال مغشوش (نقطتان هدية) + ١.٥ نقطة إضافية</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>

      {/* Participant card */}
      {participant && (
        <motion.div variants={fadeUp} custom={2}>
          <GlassCard className="mb-4 p-4">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-2xl bg-primary/8 flex items-center justify-center text-2xl ring-2 ring-primary/15" style={{ width: 52, height: 52 }}>
                {participant.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{participant.nickname}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/8">
                    <Star className="w-3 h-3 text-primary" />
                    <p className="text-xs font-bold text-primary tabular-nums">{participant.score}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">نقطة</span>
                </div>
              </div>

              {/* Status badge */}
              {todayAnswered ? (
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setStatusInfoIdx(0)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-primary/8 border border-primary/15">
                  <CheckCircle className="w-4 h-4 text-primary" /><span className="text-[11px] font-bold text-primary">تم الحل</span>
                </motion.button>
              ) : !questionsAvailable && isQuizActive() ? (
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setStatusInfoIdx(1)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-destructive/8 border border-destructive/15">
                  <AlertTriangle className="w-4 h-4 text-destructive" /><span className="text-[11px] font-bold text-destructive">فاتك</span>
                </motion.button>
              ) : isQuizActive() ? (
                <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-accent/8 border border-accent/15">
                  <CircleDot className="w-4 h-4 text-accent-foreground" /><span className="text-[11px] font-bold text-accent-foreground">لم يُحل</span>
                </div>
              ) : null}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Status info modal */}
      <AnimatePresence>
        {statusInfoIdx !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 backdrop-blur-md px-6" onClick={() => setStatusInfoIdx(null)}>
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-card rounded-3xl p-7 shadow-elevated max-w-sm w-full text-center border border-border/40" onClick={(e) => e.stopPropagation()}>
              <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center {statusInfoIdx === 0 ? 'bg-primary/10' : 'bg-destructive/10'}">
                {statusInfoIdx === 0 ? <CheckCircle className="w-8 h-8 text-primary" /> : <AlertTriangle className="w-8 h-8 text-destructive" />}
              </div>
              <p className="text-sm font-bold text-foreground mb-2">{statusInfoIdx === 0 ? statusInfoTexts.solved.title : statusInfoTexts.missed.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{statusInfoIdx === 0 ? statusInfoTexts.solved.desc : statusInfoTexts.missed.desc}</p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setStatusInfoIdx(null)} className="mt-6 px-8 py-2.5 rounded-2xl bg-secondary text-foreground text-sm font-semibold">حسناً</motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar */}
      {isQuizActive() && participant && (
        <motion.div variants={fadeUp} custom={3}>
          <GlassCard className="mb-4 overflow-hidden">
            <button onClick={() => setShowCalendar(!showCalendar)} className="flex items-center justify-between w-full p-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl islamic-gradient flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 text-primary-foreground" />
                </div>
                <h3 className="text-sm font-bold text-foreground">جدول الأيام</h3>
              </div>
              <span className="text-xs text-primary font-semibold">{showCalendar ? 'إخفاء' : 'عرض'}</span>
            </button>
            <AnimatePresence>
              {showCalendar && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="grid grid-cols-7 gap-1.5 max-h-[280px] overflow-y-auto hide-scrollbar px-4 pb-4">
                    {quizDays.map(day => {
                      const isPast = day.date < today;
                      const isToday = day.date === today;
                      const isFuture = day.date > today;
                      const answeredDay = answerHistory.find(a => a.question_date === day.date);
                      return (
                        <motion.button key={day.date} whileTap={!isFuture ? { scale: 0.9 } : {}} onClick={() => isPast && handleDayClick(day.date)} disabled={isFuture}
                          className={`aspect-square rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all ${
                            isToday ? 'ring-2 ring-primary bg-primary/8' : isPast && answeredDay ? 'bg-primary/6' : isPast ? 'bg-destructive/5' : 'bg-secondary/30 opacity-35'
                          } ${day.isFriday ? 'border border-accent/25' : ''} ${day.special ? 'border-2 border-accent/60' : ''}`}>
                          <span className="text-foreground">{day.dayNum}</span>
                          {isPast && answeredDay && <Check className="w-2.5 h-2.5 text-primary" />}
                          {isPast && !answeredDay && <XIcon className="w-2.5 h-2.5 text-destructive" />}
                          {isToday && !todayAnswered && <CircleDot className="w-2.5 h-2.5 text-accent-foreground" />}
                          {isToday && todayAnswered && <Check className="w-2.5 h-2.5 text-primary" />}
                          {day.isFriday && <Gift className="w-2.5 h-2.5 text-accent-foreground" />}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>
      )}

      {/* Day detail modal */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 backdrop-blur-md px-5" onClick={() => setSelectedDay(null)}>
            <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 20 }} transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-card rounded-3xl p-5 shadow-elevated max-w-sm w-full max-h-[70vh] overflow-y-auto border border-border/40" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-sm font-bold text-foreground mb-1">أسئلة يوم {selectedDay.date}</h3>
              <p className="text-xs text-muted-foreground mb-4">
                {selectedDay.solved ? `✅ تم الحل · ${selectedDay.score} نقاط` : '❌ لم يتم الحل'}
              </p>
              {selectedDay.questions.map((q: QuizQuestion, i: number) => (
                <div key={i} className="mb-4 p-3.5 rounded-2xl bg-secondary/40 border border-border/30">
                  <p className="text-xs font-bold text-foreground mb-2.5">{i + 1}. {q.question}</p>
                  <div className="space-y-1.5">
                    {q.options.map((opt: string, j: number) => {
                      const isCorrect = j === q.correctIndex;
                      const wasSelected = selectedDay.userAnswers?.[i] === j;
                      return (
                        <div key={j} className={`px-3 py-2.5 rounded-xl text-[11px] transition-all ${
                          isCorrect ? 'bg-primary/8 text-primary font-bold border border-primary/15' : wasSelected ? 'bg-destructive/8 text-destructive border border-destructive/15' : 'bg-card text-muted-foreground border border-border/20'
                        }`}>{opt}</div>
                      );
                    })}
                  </div>
                  {!selectedDay.solved && (
                    <p className="text-[10px] text-primary mt-2.5 font-semibold">📚 راجع الموضوع واستعد ليوم جديد!</p>
                  )}
                </div>
              ))}
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setSelectedDay(null)} className="w-full py-3 rounded-2xl bg-secondary text-foreground text-sm font-semibold">إغلاق</motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <motion.div variants={fadeUp} custom={4} className="space-y-2.5 mt-5">
        {!participant ? (
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setView('register')}
            className="w-full py-4 rounded-2xl islamic-gradient text-primary-foreground font-bold text-base shadow-elevated transition-all flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" />
            سجّل الآن
          </motion.button>
        ) : questionsAvailable && !todayAnswered ? (
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setView('questions'); fetchQuestions(); setCurrentQ(0); setAnswers([null, null, null, null]); setTimerSec(TIMER_DURATION); setTimerActive(true); setHintsUsed(0); setCurrentHint(''); submitRef.current = false; }}
            className="w-full py-4 rounded-2xl islamic-gradient text-primary-foreground font-bold text-base shadow-elevated transition-all flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            ابدأ أسئلة اليوم
          </motion.button>
        ) : null}

        <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setView('leaderboard'); fetchLeaderboard(); }}
          className="w-full py-3.5 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/40 text-foreground font-semibold flex items-center justify-center gap-2 shadow-card transition-all">
          <Trophy className="w-4 h-4 text-accent-foreground" /> قائمة المتصدرين
        </motion.button>

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleShare}
          className="w-full py-3 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/40 text-foreground font-semibold flex items-center justify-center gap-2 shadow-card transition-all">
          {copied ? <Check className="w-4 h-4 text-primary" /> : <Share2 className="w-4 h-4" />}
          {copied ? 'تم النسخ!' : 'شارك المسابقة'}
        </motion.button>
      </motion.div>

      {/* About section */}
      <motion.div variants={fadeUp} custom={5} className="mt-6">
        <GlassCard className="p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl islamic-gradient flex items-center justify-center">
              <Info className="w-4 h-4 text-primary-foreground" />
            </div>
            <h3 className="text-sm font-bold text-foreground">عن المسابقة</h3>
          </div>
          <ul className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            {[
              { icon: <Target className="w-3 h-3 text-primary flex-shrink-0" />, text: '٤ أسئلة يومية عن أهل البيت عليهم السلام' },
              { icon: <Star className="w-3 h-3 text-primary flex-shrink-0" />, text: 'لكل سؤال صحيح نقطتان · عداد ٣ دقائق لكل جولة' },
              { icon: <Lightbulb className="w-3 h-3 text-primary flex-shrink-0" />, text: 'تلميحان من الذكاء الاصطناعي لكل جولة' },
              { icon: <Clock className="w-3 h-3 text-primary flex-shrink-0" />, text: 'الأسئلة متاحة من ٩:٠٠ صباحاً حتى ٩:٣٠ مساءً' },
              { icon: <CalendarIcon className="w-3 h-3 text-primary flex-shrink-0" />, text: 'المسابقة من ٢١ مارس حتى ٢١ مايو ٢٠٢٦' },
              { icon: <TrendingUp className="w-3 h-3 text-primary flex-shrink-0" />, text: 'الأسئلة تتغير يومياً حسب عمرك ومستواك' },
              { icon: <Gift className="w-3 h-3 text-accent-foreground flex-shrink-0" />, text: 'كل جمعة: سؤال مغشوش + ١.٥ نقطة هدية' },
              { icon: <Gift className="w-3 h-3 text-accent-foreground flex-shrink-0" />, text: 'مناسبات أهل البيت: ٥ نقاط هدية' },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">{item.icon}<span className="mt-[-1px]">{item.text}</span></li>
            ))}
          </ul>
        </GlassCard>
      </motion.div>

      {/* Questions loading overlay */}
      {questionsLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl islamic-gradient flex items-center justify-center shadow-elevated">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 w-12 h-12 rounded-2xl border-2 border-primary/20 animate-ping" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">جاري تحميل الأسئلة...</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuizPage;
