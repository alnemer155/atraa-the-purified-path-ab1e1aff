import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Share2, Clock, ChevronLeft, Info, Copy, Check, Lightbulb, Gift, Calendar as CalendarIcon, Timer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getUser } from '@/lib/user';
import quizLogo from '@/assets/quiz-logo.png';

const QUIZ_EMOJIS = ['😎', '🍁', '📿', '🌙', '❤️', '🤲🏻', '😶‍🌫️', '🫥', '🫠', '👻', '👾', '💪🏻', '👀', '⚽️', '🎱', '🚗', '🗿', '🕋', '🙂', '💡'];

const QUIZ_START = new Date('2026-03-21T00:00:00+03:00');
const QUIZ_END = new Date('2026-05-21T23:59:59+03:00');
const QUESTIONS_START_HOUR = 9;
const QUESTIONS_END_HOUR = 21;
const QUESTIONS_END_MINUTE = 30;
const TIMER_DURATION = 600; // 10 minutes

// Special occasion dates (approximate Gregorian for 1447 AH)
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

  // New features
  const [timerSec, setTimerSec] = useState(TIMER_DURATION);
  const [timerActive, setTimerActive] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState('');
  const [hintLoading, setHintLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [answerHistory, setAnswerHistory] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });

  // Registration
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

  // Check participant on mount
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

  // Countdown to quiz start
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

  // Timer for questions
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
      questions: (qData?.questions || []) as QuizQuestion[],
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
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // === REGISTER VIEW ===
  if (view === 'register') {
    return (
      <div className="px-4 py-5 animate-fade-in">
        <button onClick={() => setView('home')} className="flex items-center gap-1.5 text-primary text-sm font-medium mb-4">
          <ChevronLeft className="w-4 h-4" /> رجوع
        </button>
        <div className="text-center mb-6">
          <img src={quizLogo} alt="مسابقة عترة" className="w-36 h-36 mx-auto mb-3 rounded-2xl object-contain" />
          <h1 className="text-xl font-semibold text-foreground">التسجيل في المسابقة</h1>
          <p className="text-xs text-muted-foreground mt-1">سجّل الآن واستعد لتحدي المعرفة الدينية</p>
        </div>
        <div className="space-y-4">
          {user?.name && (
            <label className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border cursor-pointer">
              <input type="checkbox" checked={regUseExisting} onChange={(e) => setRegUseExisting(e.target.checked)} className="w-4 h-4 accent-primary" />
              <span className="text-sm text-foreground">استخدام الاسم المسجل: {user.name}</span>
            </label>
          )}
          {!regUseExisting && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">اللقب</label>
              <input type="text" value={regNickname} onChange={(e) => setRegNickname(e.target.value)} placeholder="أدخل لقبك" className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">اختر إيموجي</label>
            <div className="grid grid-cols-10 gap-1.5">
              {QUIZ_EMOJIS.map(emoji => (
                <button key={emoji} onClick={() => setRegEmoji(emoji)} className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${regEmoji === emoji ? 'bg-primary/20 ring-2 ring-primary scale-110' : 'bg-card border border-border'}`}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">نبذة <span className="text-muted-foreground text-xs">(اختياري · ٣٠ حرف)</span></label>
            <input type="text" value={regBio} onChange={(e) => e.target.value.length <= 30 && setRegBio(e.target.value)} placeholder="نبذة قصيرة عنك..." maxLength={30} className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={regBioPublic} onChange={(e) => setRegBioPublic(e.target.checked)} className="w-4 h-4 accent-primary" />
                <span className="text-xs text-muted-foreground">عرض النبذة للجميع</span>
              </label>
              <span className="text-[10px] text-muted-foreground">{regBio.length}/30</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">العمر <span className="text-muted-foreground text-xs">(يحدد مستوى الأسئلة)</span></label>
            <input type="number" value={regAge} onChange={(e) => setRegAge(e.target.value)} placeholder="أدخل عمرك (١٢ - ٦٠)" min={12} max={60} className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          </div>
          <div className="p-3 rounded-xl bg-secondary/50 border border-border opacity-60">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">إنشاء فريق أو الانضمام</span>
              <span className="text-[10px] font-medium text-accent-foreground bg-accent/20 px-2 py-0.5 rounded-full">قريباً v2</span>
            </div>
          </div>
          <label className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border cursor-pointer">
            <input type="checkbox" checked={regAgreed} onChange={(e) => setRegAgreed(e.target.checked)} className="w-4 h-4 accent-primary mt-0.5" />
            <span className="text-xs text-muted-foreground leading-relaxed">أوافق على <a href="/policies" className="text-primary underline">سياسات الموقع وشروط المسابقة</a>. أقر بأن الأسئلة مولّدة بالذكاء الاصطناعي وقد تحتوي على أخطاء.</span>
          </label>
          {regError && <p className="text-sm text-destructive text-center">{regError}</p>}
          <button onClick={handleRegister} className="w-full py-3.5 rounded-lg islamic-gradient text-primary-foreground font-semibold text-base transition-all hover:opacity-90 shadow-card">
            تسجيل
          </button>
        </div>
      </div>
    );
  }

  // === LEADERBOARD VIEW ===
  if (view === 'leaderboard') {
    return (
      <div className="px-4 py-5 animate-fade-in">
        <button onClick={() => setView('home')} className="flex items-center gap-1.5 text-primary text-sm font-medium mb-4">
          <ChevronLeft className="w-4 h-4" /> رجوع
        </button>
        <div className="flex items-center gap-3 mb-5">
          <Trophy className="w-6 h-6 text-accent-foreground" />
          <h1 className="text-xl font-semibold text-foreground">قائمة المتصدرين</h1>
        </div>
        <div className="space-y-2">
          {leaderboard.map((p, i) => (
            <div key={p.id} className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all ${
              i < 3 ? 'bg-accent/10 border border-accent/20' : i < 20 ? 'bg-card border border-border' : 'bg-secondary/50 border border-border/50'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                i === 0 ? 'bg-accent text-accent-foreground' : i === 1 ? 'bg-muted text-foreground' : i === 2 ? 'bg-accent/50 text-accent-foreground' : 'bg-secondary text-muted-foreground'
              }`}>{i + 1}</div>
              <span className="text-lg">{p.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{p.nickname}</p>
                {p.bio_public && p.bio && <p className="text-[10px] text-muted-foreground truncate">{p.bio}</p>}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-primary">{p.score}</p>
                <p className="text-[9px] text-muted-foreground">نقطة</p>
              </div>
              {i >= 20 && <span className="text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">+20</span>}
            </div>
          ))}
          {leaderboard.length === 0 && (
            <div className="text-center py-12"><p className="text-sm text-muted-foreground">لا يوجد متسابقين بعد</p></div>
          )}
        </div>
      </div>
    );
  }

  // === QUESTIONS VIEW ===
  if (view === 'questions' && questions.length > 0) {
    const q = questions[currentQ];
    const answered = answers[currentQ] !== null;

    return (
      <div className="px-4 py-5 animate-fade-in min-h-[calc(100vh-130px)] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setView('home')} className="flex items-center gap-1.5 text-primary text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> رجوع
          </button>
          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono font-bold ${timerSec < 60 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
            <Timer className="w-3.5 h-3.5" />
            {formatTimer(timerSec)}
          </div>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-3">
          <img src={quizLogo} alt="مسابقة عترة" className="w-20 h-20 rounded-2xl object-contain" />
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-5">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i < currentQ ? 'islamic-gradient' : i === currentQ ? 'bg-primary/40' : 'bg-secondary'}`} />
          ))}
        </div>

        <p className="text-xs text-muted-foreground mb-2">السؤال {currentQ + 1} من 4</p>

        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground mb-5 leading-relaxed">{q.question}</h2>

          <div className="space-y-3">
            {q.options.map((option, i) => {
              const isSelected = answers[currentQ] === i;
              const isCorrect = i === q.correctIndex;
              const showResult = answered;
              return (
                <motion.button key={i} whileTap={!answered ? { scale: 0.97 } : {}} onClick={() => handleAnswer(i)} disabled={answered}
                  className={`w-full text-right p-4 rounded-2xl border-2 transition-all ${
                    showResult ? isCorrect ? 'border-primary bg-primary/10' : isSelected ? 'border-destructive bg-destructive/10' : 'border-border bg-card text-muted-foreground'
                    : isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'
                  }`}>
                  <span className="text-sm font-medium">{option}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Hint section */}
          {!answered && (
            <div className="mt-4">
              {currentHint && (
                <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-accent-foreground" />
                    <span className="text-xs font-semibold text-accent-foreground">تلميح</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{currentHint}</p>
                </div>
              )}
              <button onClick={fetchHint} disabled={hintsUsed >= 2 || hintLoading}
                className="flex items-center gap-1.5 text-xs text-accent-foreground font-medium disabled:opacity-40">
                <Lightbulb className={`w-3.5 h-3.5 ${hintLoading ? 'animate-pulse' : ''}`} />
                {hintLoading ? 'جاري التلميح...' : `تلميح (${2 - hintsUsed} متبقي)`}
              </button>
            </div>
          )}
        </div>

        {answered && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
            <button onClick={handleNext} className="w-full py-3.5 rounded-xl islamic-gradient text-primary-foreground font-semibold shadow-card">
              {currentQ < 3 ? 'السؤال التالي' : 'عرض النتيجة'}
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  // === RESULT VIEW ===
  if (view === 'result') {
    const today = getTodayDate();
    const isFriday = new Date().getDay() === 5;
    const special = SPECIAL_DATES[today];
    const bonus = (isFriday ? 1.5 : 0) + (special?.bonus || 0);

    return (
      <div className="px-4 py-5 animate-fade-in min-h-[calc(100vh-130px)] flex flex-col items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center w-full">
          <div className="text-5xl mb-4">{todayScore === 8 ? '🎉' : todayScore >= 4 ? '👏' : '💪🏻'}</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">نتيجتك اليوم</h1>
          <p className="text-4xl font-bold text-primary mb-1">{todayScore}</p>
          <p className="text-sm text-muted-foreground mb-2">من 8 نقاط</p>
          
          {bonus > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 mb-4">
              <Gift className="w-3.5 h-3.5 text-accent-foreground" />
              <span className="text-xs font-semibold text-accent-foreground">
                +{bonus} نقطة هدية! {isFriday ? '🎁 جمعة مباركة' : ''} {special ? `🎁 ${special.name}` : ''}
              </span>
            </div>
          )}

          <p className="text-sm text-foreground mb-6">
            {todayScore === 8 ? 'ممتاز! أجبت على جميع الأسئلة بشكل صحيح' : todayScore >= 4 ? 'أحسنت! استمر في المحاولة' : 'لا تقلق، حاول غداً!'}
          </p>

          <div className="space-y-3 w-full">
            <button onClick={handleShare} className="w-full py-3 rounded-xl islamic-gradient text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-card">
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'تم النسخ!' : 'مشاركة التحدي'}
            </button>
            <button onClick={() => { setView('leaderboard'); fetchLeaderboard(); }} className="w-full py-3 rounded-xl bg-card border border-border text-foreground font-medium flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4" /> قائمة المتصدرين
            </button>
            <button onClick={() => setView('home')} className="w-full py-3 rounded-xl bg-secondary text-foreground text-sm font-medium">
              الرئيسية
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // === HOME VIEW ===
  const quizDays = getQuizDays();
  const today = getTodayDate();

  return (
    <div className="px-4 py-5 animate-fade-in">
      {/* Header with big logo */}
      <div className="text-center mb-6">
        <img src={quizLogo} alt="مسابقة عترة" className="w-36 h-36 mx-auto mb-3 rounded-2xl object-contain shadow-card" />
        <h1 className="text-xl font-bold text-foreground mb-1">مسابقة عِتْرَة</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          أسئلة دينية وثقافية عن أهل البيت عليهم السلام
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          اختبر معلوماتك وتعلّم المزيد عن سيرة أهل البيت وأحاديثهم وفقههم ومعارفهم
        </p>
      </div>

      {/* Countdown before start */}
      {isBeforeStart && (
        <div className="bg-accent/10 rounded-2xl p-5 mb-4 text-center">
          <Clock className="w-6 h-6 text-accent-foreground mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground mb-3">المسابقة تبدأ في ٢١ مارس ٢٠٢٦</p>
          <div className="flex items-center justify-center gap-3">
            {[
              { v: countdown.d, l: 'يوم' },
              { v: countdown.h, l: 'ساعة' },
              { v: countdown.m, l: 'دقيقة' },
              { v: countdown.s, l: 'ثانية' },
            ].map(({ v, l }) => (
              <div key={l} className="bg-card rounded-xl px-3 py-2 shadow-card min-w-[50px]">
                <p className="text-lg font-bold text-primary">{v}</p>
                <p className="text-[9px] text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">سجّل الآن واستعد!</p>
        </div>
      )}

      {isAfterEnd && (
        <div className="bg-secondary rounded-2xl p-4 mb-4 text-center">
          <p className="text-sm font-semibold text-foreground">انتهت المسابقة</p>
          <p className="text-xs text-muted-foreground mt-1">شكراً لمشاركتك!</p>
        </div>
      )}

      {isQuizActive() && !isQuestionsTime() && (
        <div className="bg-accent/10 rounded-2xl p-4 mb-4 text-center">
          <Clock className="w-5 h-5 text-accent-foreground mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground">الأسئلة متاحة من ٩:٠٠ ص حتى ٩:٣٠ م</p>
          <p className="text-xs text-muted-foreground mt-1">عد لاحقاً!</p>
        </div>
      )}

      {/* Today special */}
      {SPECIAL_DATES[today] && (
        <div className="bg-accent/10 rounded-2xl p-3.5 mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-accent-foreground flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-foreground">🎁 هدية اليوم: {SPECIAL_DATES[today].name}</p>
            <p className="text-[10px] text-muted-foreground">+{SPECIAL_DATES[today].bonus} نقاط هدية عند حل أسئلة اليوم</p>
          </div>
        </div>
      )}

      {new Date().getDay() === 5 && isQuizActive() && (
        <div className="bg-accent/10 rounded-2xl p-3.5 mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-accent-foreground flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-foreground">🎁 جمعة مباركة! سؤال مغشوش + ١.٥ نقطة هدية</p>
          </div>
        </div>
      )}

      {/* Participant card */}
      {participant && (
        <div className="bg-card rounded-2xl shadow-card p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{participant.emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{participant.nickname}</p>
              <p className="text-xs text-muted-foreground">مجموع النقاط: {participant.score}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {todayAnswered ? (
              <button onClick={() => setStatusInfoIdx(0)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10">
                <span>🫡</span><span className="text-xs font-medium text-primary">تم الحل اليوم</span>
              </button>
            ) : !questionsAvailable && isQuizActive() ? (
              <button onClick={() => setStatusInfoIdx(1)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-destructive/10">
                <span>❗️</span><span className="text-xs font-medium text-destructive">فاتك السؤال</span>
              </button>
            ) : isQuizActive() ? (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/10">
                <span>⏳</span><span className="text-xs font-medium text-accent-foreground">لم يتم حل السؤال</span>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Status info modal */}
      <AnimatePresence>
        {statusInfoIdx !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm px-6" onClick={() => setStatusInfoIdx(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-card rounded-2xl p-6 shadow-elevated max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
              <p className="text-3xl mb-3">{statusInfoIdx === 0 ? '🫡' : '❗️'}</p>
              <p className="text-sm font-semibold text-foreground mb-2">{statusInfoIdx === 0 ? statusInfoTexts.solved.title : statusInfoTexts.missed.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{statusInfoIdx === 0 ? statusInfoTexts.solved.desc : statusInfoTexts.missed.desc}</p>
              <button onClick={() => setStatusInfoIdx(null)} className="mt-4 px-6 py-2 rounded-xl bg-secondary text-foreground text-sm font-medium">حسناً</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar */}
      {isQuizActive() && participant && (
        <div className="mb-4">
          <button onClick={() => setShowCalendar(!showCalendar)} className="flex items-center gap-2 mb-3">
            <CalendarIcon className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">{showCalendar ? 'إخفاء' : 'عرض'} جدول الأيام</span>
          </button>
          {showCalendar && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
              <div className="grid grid-cols-7 gap-1.5 max-h-[300px] overflow-y-auto hide-scrollbar p-1">
                {quizDays.map(day => {
                  const isPast = day.date < today;
                  const isToday = day.date === today;
                  const isFuture = day.date > today;
                  const answered = answerHistory.find(a => a.question_date === day.date);
                  return (
                    <button key={day.date} onClick={() => isPast && handleDayClick(day.date)} disabled={isFuture}
                      className={`aspect-square rounded-lg text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all ${
                        isToday ? 'ring-2 ring-primary bg-primary/10' : isPast && answered ? 'bg-primary/10' : isPast ? 'bg-destructive/10' : 'bg-secondary/50 opacity-50'
                      } ${day.isFriday ? 'border border-accent/30' : ''} ${day.special ? 'border border-accent' : ''}`}>
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
        </div>
      )}

      {/* Day detail modal */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm px-5" onClick={() => setSelectedDay(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-card rounded-2xl p-5 shadow-elevated max-w-sm w-full max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-sm font-semibold text-foreground mb-1">أسئلة يوم {selectedDay.date}</h3>
              <p className="text-xs text-muted-foreground mb-4">
                {selectedDay.solved ? `✅ تم الحل · ${selectedDay.score} نقاط` : '❌ لم يتم الحل'}
              </p>
              {selectedDay.questions.map((q: QuizQuestion, i: number) => (
                <div key={i} className="mb-4 p-3 rounded-xl bg-secondary/50">
                  <p className="text-xs font-semibold text-foreground mb-2">{i + 1}. {q.question}</p>
                  <div className="space-y-1.5">
                    {q.options.map((opt: string, j: number) => {
                      const isCorrect = j === q.correctIndex;
                      const wasSelected = selectedDay.userAnswers?.[i] === j;
                      return (
                        <div key={j} className={`px-3 py-2 rounded-lg text-[11px] ${
                          isCorrect ? 'bg-primary/10 text-primary font-semibold' : wasSelected ? 'bg-destructive/10 text-destructive' : 'bg-card text-muted-foreground'
                        }`}>{opt}</div>
                      );
                    })}
                  </div>
                  {!selectedDay.solved && (
                    <p className="text-[10px] text-primary mt-2 font-medium">📚 راجع الموضوع واستعد ليوم جديد!</p>
                  )}
                </div>
              ))}
              <button onClick={() => setSelectedDay(null)} className="w-full py-2 rounded-xl bg-secondary text-foreground text-sm font-medium">إغلاق</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="space-y-3 mt-4">
        {!participant ? (
          <button onClick={() => setView('register')} className="w-full py-3.5 rounded-xl islamic-gradient text-primary-foreground font-semibold text-base shadow-card">
            سجّل الآن
          </button>
        ) : questionsAvailable && !todayAnswered ? (
          <button onClick={() => { setView('questions'); fetchQuestions(); setCurrentQ(0); setAnswers([null, null, null, null]); setTimerSec(TIMER_DURATION); setTimerActive(true); setHintsUsed(0); setCurrentHint(''); submitRef.current = false; }}
            className="w-full py-3.5 rounded-xl islamic-gradient text-primary-foreground font-semibold text-base shadow-card">
            ابدأ أسئلة اليوم
          </button>
        ) : null}

        <button onClick={() => { setView('leaderboard'); fetchLeaderboard(); }} className="w-full py-3 rounded-xl bg-card border border-border text-foreground font-medium flex items-center justify-center gap-2 shadow-card">
          <Trophy className="w-4 h-4 text-accent-foreground" /> قائمة المتصدرين
        </button>

        <button onClick={handleShare} className="w-full py-3 rounded-xl bg-card border border-border text-foreground font-medium flex items-center justify-center gap-2 shadow-card">
          {copied ? <Check className="w-4 h-4 text-primary" /> : <Share2 className="w-4 h-4" />}
          {copied ? 'تم النسخ!' : 'شارك المسابقة'}
        </button>
      </div>

      {/* Info */}
      <div className="mt-6 bg-card rounded-2xl p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">عن المسابقة</p>
        </div>
        <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
          <li>• ٤ أسئلة يومية عن أهل البيت عليهم السلام</li>
          <li>• لكل سؤال صحيح نقطتان · عداد ١٠ دقائق لكل جولة</li>
          <li>• تلميحان من الذكاء الاصطناعي لكل جولة</li>
          <li>• الأسئلة متاحة من ٩:٠٠ صباحاً حتى ٩:٣٠ مساءً</li>
          <li>• المسابقة من ٢١ مارس حتى ٢١ مايو ٢٠٢٦</li>
          <li>• الأسئلة تتغير يومياً حسب عمرك ومستواك</li>
          <li>• كل جمعة: سؤال مغشوش + ١.٥ نقطة هدية 🎁</li>
          <li>• مناسبات أهل البيت: ٥ نقاط هدية 🎁</li>
        </ul>
      </div>

      {questionsLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">جاري تحميل الأسئلة...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
