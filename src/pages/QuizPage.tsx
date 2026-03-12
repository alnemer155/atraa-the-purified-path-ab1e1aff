import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Share2, Clock, Users, ChevronLeft, Info, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getUser } from '@/lib/user';
import quizLogo from '@/assets/quiz-logo.png';

const QUIZ_EMOJIS = ['😎', '🍁', '📿', '🌙', '❤️', '🤲🏻', '😶‍🌫️', '🫥', '🫠', '👻', '👾', '💪🏻', '👀', '⚽️', '🎱', '🚗', '🗿', '🕋', '⛩️', '💡'];

const QUIZ_START = new Date('2026-03-21T00:00:00');
const QUIZ_END = new Date('2026-05-21T23:59:59');
const QUESTIONS_START_HOUR = 9; // 9:00 AM
const QUESTIONS_END_HOUR = 21; // 9:30 PM
const QUESTIONS_END_MINUTE = 30;

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
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('atraa_quiz_device_id', id);
  }
  return id;
};

const generateShareCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const isQuizActive = (): boolean => {
  const now = new Date();
  return now >= QUIZ_START && now <= QUIZ_END;
};

const isQuestionsTime = (): boolean => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  if (hours < QUESTIONS_START_HOUR) return false;
  if (hours > QUESTIONS_END_HOUR) return false;
  if (hours === QUESTIONS_END_HOUR && minutes > QUESTIONS_END_MINUTE) return false;
  return true;
};

const getTodayDate = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
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

  // Registration form
  const [regNickname, setRegNickname] = useState('');
  const [regEmoji, setRegEmoji] = useState('😎');
  const [regBio, setRegBio] = useState('');
  const [regBioPublic, setRegBioPublic] = useState(false);
  const [regAge, setRegAge] = useState('');
  const [regUseExisting, setRegUseExisting] = useState(false);
  const [regError, setRegError] = useState('');

  const user = getUser();

  // Check if user is already registered
  useEffect(() => {
    checkParticipant();
  }, []);

  const checkParticipant = async () => {
    setLoading(true);
    try {
      const deviceId = getDeviceId();
      const { data } = await supabase
        .from('quiz_participants')
        .select('*')
        .eq('device_id', deviceId)
        .maybeSingle();

      if (data) {
        setParticipant(data as Participant);
        await checkTodayAnswer(data.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checkTodayAnswer = async (participantId: string) => {
    const today = getTodayDate();
    const { data } = await supabase
      .from('quiz_answers')
      .select('*')
      .eq('participant_id', participantId)
      .eq('question_date', today)
      .maybeSingle();

    if (data) {
      setTodayAnswered(true);
      setTodayScore(data.score);
    }
  };

  const handleRegister = async () => {
    setRegError('');
    const nickname = regUseExisting && user ? user.name : regNickname.trim();
    if (!nickname) { setRegError('يرجى إدخال اللقب'); return; }
    
    const age = parseInt(regAge);
    if (isNaN(age) || age < 5 || age > 60) { setRegError('العمر يجب أن يكون بين ٥ و ٦٠ سنة'); return; }
    if (age > 60) { setRegError('العمر الأقصى ٦٠ سنة'); return; }
    if (age >= 100) { setRegError('هذا العمر مستحيل!'); return; }

    if (regBio.length > 30) { setRegError('النبذة ٣٠ حرف كحد أقصى'); return; }

    try {
      const deviceId = getDeviceId();
      const response = await supabase.functions.invoke('quiz-register', {
        body: {
          device_id: deviceId,
          nickname,
          emoji: regEmoji,
          bio: regBio || null,
          bio_public: regBioPublic,
          age,
        }
      });

      if (response.error) throw response.error;
      const data = response.data;
      setParticipant(data.participant);
      setView('home');
    } catch (e: any) {
      setRegError(e.message || 'حدث خطأ');
    }
  };

  const fetchQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const today = getTodayDate();
      
      // Check if questions exist for today
      const { data: existing } = await supabase
        .from('quiz_daily_questions')
        .select('questions')
        .eq('question_date', today)
        .maybeSingle();

      if (existing) {
        setQuestions(existing.questions as unknown as QuizQuestion[]);
      } else {
        // Generate new questions via edge function
        const response = await supabase.functions.invoke('quiz-questions', {
          body: { date: today }
        });
        if (response.error) throw response.error;
        setQuestions(response.data.questions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (answers[currentQ] !== null) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQ < 3) {
      setCurrentQ(currentQ + 1);
    } else {
      submitAnswers();
    }
  };

  const submitAnswers = async () => {
    if (!participant) return;
    const score = answers.reduce((acc, ans, i) => {
      if (ans === questions[i]?.correctIndex) return acc + 2;
      return acc;
    }, 0);

    try {
      await supabase.functions.invoke('quiz-submit', {
        body: {
          device_id: getDeviceId(),
          participant_id: participant.id,
          question_date: getTodayDate(),
          answers,
          score,
        }
      });
      setTodayScore(score);
      setTodayAnswered(true);
      setParticipant(prev => prev ? { ...prev, score: (prev.score || 0) + score } : null);
      setView('result');
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('quiz_participants')
      .select('*')
      .order('score', { ascending: false })
      .limit(30);

    if (data) setLeaderboard(data as Participant[]);
  };

  const handleShare = async () => {
    if (!participant) return;
    const shareCode = generateShareCode();
    
    await supabase.functions.invoke('quiz-share', {
      body: { participant_id: participant.id, share_code: shareCode }
    });

    const shareText = `جرّب مسابقة عِتْرَةً الدينية وشارك التحدي مع الأهل والأصدقاء\n\nhttps://atraa.xyz/q/${shareCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const now = new Date();
  const isBeforeStart = now < QUIZ_START;
  const isAfterEnd = now > QUIZ_END;
  const questionsAvailable = isQuestionsTime() && isQuizActive();

  // Status info popups
  const statusInfoTexts: Record<string, { emoji: string; title: string; desc: string }> = {
    solved: {
      emoji: '🫡',
      title: 'هذا يعني تم حل سؤال اليوم بنجاح ✅',
      desc: 'أحسنت! لقد أجبت على سؤال اليوم وحصلت على نقطتين في رصيدك، استعد لسؤال الغداً',
    },
    missed: {
      emoji: '❗️',
      title: 'هذا يعني فاتك السؤال ❌',
      desc: 'لا تقلق! سيكون هناك سؤال جديد غداً من الساعة 9:00 صباحاً، لا تفوّته',
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-130px)]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Register view
  if (view === 'register') {
    return (
      <div className="px-4 py-5 animate-fade-in">
        <button onClick={() => setView('home')} className="flex items-center gap-1.5 text-primary text-sm font-medium mb-4">
          <ChevronLeft className="w-4 h-4" />
          رجوع
        </button>

        <div className="text-center mb-6">
          <img src={quizLogo} alt="مسابقة عترة" className="w-24 h-24 mx-auto mb-3 rounded-2xl object-contain" />
          <h1 className="text-xl font-semibold text-foreground">التسجيل في المسابقة</h1>
        </div>

        <div className="space-y-4">
          {/* Use existing name */}
          {user?.name && (
            <label className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border cursor-pointer">
              <input
                type="checkbox"
                checked={regUseExisting}
                onChange={(e) => setRegUseExisting(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm text-foreground">استخدام الاسم المسجل: {user.name}</span>
            </label>
          )}

          {!regUseExisting && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">اللقب</label>
              <input
                type="text"
                value={regNickname}
                onChange={(e) => setRegNickname(e.target.value)}
                placeholder="أدخل لقبك"
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
          )}

          {/* Emoji picker */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">اختر إيموجي</label>
            <div className="grid grid-cols-10 gap-1.5">
              {QUIZ_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setRegEmoji(emoji)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                    regEmoji === emoji ? 'bg-primary/20 ring-2 ring-primary scale-110' : 'bg-card border border-border'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              نبذة <span className="text-muted-foreground text-xs">(اختياري · ٣٠ حرف)</span>
            </label>
            <input
              type="text"
              value={regBio}
              onChange={(e) => e.target.value.length <= 30 && setRegBio(e.target.value)}
              placeholder="نبذة قصيرة عنك..."
              maxLength={30}
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={regBioPublic}
                  onChange={(e) => setRegBioPublic(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-xs text-muted-foreground">عرض النبذة للجميع</span>
              </label>
              <span className="text-[10px] text-muted-foreground">{regBio.length}/30</span>
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">العمر</label>
            <input
              type="number"
              value={regAge}
              onChange={(e) => setRegAge(e.target.value)}
              placeholder="أدخل عمرك (٥ - ٦٠)"
              min={5}
              max={60}
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          {/* Teams - Coming soon */}
          <div className="p-3 rounded-xl bg-secondary/50 border border-border opacity-60">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">إنشاء فريق أو الانضمام</span>
              <span className="text-[10px] font-medium text-accent-foreground bg-accent/20 px-2 py-0.5 rounded-full">قريباً v2</span>
            </div>
          </div>

          {regError && (
            <p className="text-sm text-destructive text-center">{regError}</p>
          )}

          <button
            onClick={handleRegister}
            className="w-full py-3.5 rounded-lg islamic-gradient text-primary-foreground font-semibold text-base transition-all hover:opacity-90 shadow-card"
          >
            تسجيل
          </button>
        </div>
      </div>
    );
  }

  // Leaderboard view
  if (view === 'leaderboard') {
    return (
      <div className="px-4 py-5 animate-fade-in">
        <button onClick={() => setView('home')} className="flex items-center gap-1.5 text-primary text-sm font-medium mb-4">
          <ChevronLeft className="w-4 h-4" />
          رجوع
        </button>
        
        <div className="flex items-center gap-3 mb-5">
          <Trophy className="w-6 h-6 text-accent-foreground" />
          <h1 className="text-xl font-semibold text-foreground">قائمة المتصدرين</h1>
        </div>

        <div className="space-y-2">
          {leaderboard.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all ${
                i < 3 ? 'bg-accent/10 border border-accent/20' : i < 20 ? 'bg-card border border-border' : 'bg-secondary/50 border border-border/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                i === 0 ? 'bg-accent text-accent-foreground' : i === 1 ? 'bg-muted text-foreground' : i === 2 ? 'bg-accent/50 text-accent-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                {i + 1}
              </div>
              <span className="text-lg">{p.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{p.nickname}</p>
                {p.bio_public && p.bio && (
                  <p className="text-[10px] text-muted-foreground truncate">{p.bio}</p>
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-primary">{p.score}</p>
                <p className="text-[9px] text-muted-foreground">نقطة</p>
              </div>
              {i >= 20 && (
                <span className="text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">+20</span>
              )}
            </div>
          ))}
          {leaderboard.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">لا يوجد متسابقين بعد</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Questions view
  if (view === 'questions' && questions.length > 0) {
    const q = questions[currentQ];
    const answered = answers[currentQ] !== null;

    return (
      <div className="px-4 py-5 animate-fade-in min-h-[calc(100vh-130px)] flex flex-col">
        <button onClick={() => setView('home')} className="flex items-center gap-1.5 text-primary text-sm font-medium mb-4">
          <ChevronLeft className="w-4 h-4" />
          رجوع
        </button>

        {/* Progress */}
        <div className="flex gap-2 mb-5">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
              i < currentQ ? 'islamic-gradient' : i === currentQ ? 'bg-primary/40' : 'bg-secondary'
            }`} />
          ))}
        </div>

        <p className="text-xs text-muted-foreground mb-2">السؤال {currentQ + 1} من 4</p>

        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground mb-6 leading-relaxed">{q.question}</h2>

          <div className="space-y-3">
            {q.options.map((option, i) => {
              const isSelected = answers[currentQ] === i;
              const isCorrect = i === q.correctIndex;
              const showResult = answered;

              return (
                <motion.button
                  key={i}
                  whileTap={!answered ? { scale: 0.97 } : {}}
                  onClick={() => handleAnswer(i)}
                  disabled={answered}
                  className={`w-full text-right p-4 rounded-2xl border-2 transition-all ${
                    showResult
                      ? isCorrect
                        ? 'border-primary bg-primary/10 text-foreground'
                        : isSelected
                        ? 'border-destructive bg-destructive/10 text-foreground'
                        : 'border-border bg-card text-muted-foreground'
                      : isSelected
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border bg-card text-foreground hover:border-primary/30'
                  }`}
                >
                  <span className="text-sm font-medium">{option}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5"
          >
            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-xl islamic-gradient text-primary-foreground font-semibold shadow-card"
            >
              {currentQ < 3 ? 'السؤال التالي' : 'عرض النتيجة'}
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  // Result view
  if (view === 'result') {
    return (
      <div className="px-4 py-5 animate-fade-in min-h-[calc(100vh-130px)] flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-5xl mb-4">
            {todayScore === 8 ? '🎉' : todayScore >= 4 ? '👏' : '💪🏻'}
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">نتيجتك اليوم</h1>
          <p className="text-4xl font-bold text-primary mb-1">{todayScore}</p>
          <p className="text-sm text-muted-foreground mb-6">من 8 نقاط</p>
          
          <p className="text-sm text-foreground mb-6">
            {todayScore === 8 ? 'ممتاز! أجبت على جميع الأسئلة بشكل صحيح' :
             todayScore >= 4 ? 'أحسنت! استمر في المحاولة' :
             'لا تقلق، حاول غداً!'}
          </p>

          <div className="space-y-3 w-full">
            <button
              onClick={handleShare}
              className="w-full py-3 rounded-xl islamic-gradient text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-card"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'تم النسخ!' : 'مشاركة التحدي'}
            </button>
            <button
              onClick={() => { setView('leaderboard'); fetchLeaderboard(); }}
              className="w-full py-3 rounded-xl bg-card border border-border text-foreground font-medium flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              قائمة المتصدرين
            </button>
            <button
              onClick={() => setView('home')}
              className="w-full py-3 rounded-xl bg-secondary text-foreground text-sm font-medium"
            >
              الرئيسية
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Home view
  return (
    <div className="px-4 py-5 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6">
        <img src={quizLogo} alt="مسابقة عترة" className="w-28 h-28 mx-auto mb-3 rounded-2xl object-contain" />
        <h1 className="text-xl font-bold text-foreground mb-1">مسابقة عِتْرَة</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          أسئلة دينية وثقافية عن أهل البيت عليهم السلام
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          اختبر معلوماتك وتعلّم المزيد عن سيرة أهل البيت وأحاديثهم ومعارفهم
        </p>
      </div>

      {/* Quiz status */}
      {isBeforeStart && (
        <div className="bg-accent/10 rounded-2xl p-4 mb-4 text-center">
          <Clock className="w-5 h-5 text-accent-foreground mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground">المسابقة تبدأ في ٢١ مارس ٢٠٢٦</p>
          <p className="text-xs text-muted-foreground mt-1">سجّل الآن واستعد!</p>
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

      {/* Today's status */}
      {participant && (
        <div className="bg-card rounded-2xl shadow-card p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{participant.emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{participant.nickname}</p>
              <p className="text-xs text-muted-foreground">مجموع النقاط: {participant.score}</p>
            </div>
          </div>

          {/* Day status */}
          <div className="flex items-center gap-2">
            {todayAnswered ? (
              <button
                onClick={() => setStatusInfoIdx(0)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10"
              >
                <span>🫡</span>
                <span className="text-xs font-medium text-primary">تم الحل اليوم</span>
              </button>
            ) : !questionsAvailable ? (
              <button
                onClick={() => setStatusInfoIdx(1)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-destructive/10"
              >
                <span>❗️</span>
                <span className="text-xs font-medium text-destructive">فاتك السؤال</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/10">
                <span>⏳</span>
                <span className="text-xs font-medium text-accent-foreground">لم يتم حل السؤال</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status info modal */}
      <AnimatePresence>
        {statusInfoIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm px-6"
            onClick={() => setStatusInfoIdx(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl p-6 shadow-elevated max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-3xl mb-3">{statusInfoIdx === 0 ? '🫡' : '❗️'}</p>
              <p className="text-sm font-semibold text-foreground mb-2">
                {statusInfoIdx === 0 ? statusInfoTexts.solved.title : statusInfoTexts.missed.title}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {statusInfoIdx === 0 ? statusInfoTexts.solved.desc : statusInfoTexts.missed.desc}
              </p>
              <button
                onClick={() => setStatusInfoIdx(null)}
                className="mt-4 px-6 py-2 rounded-xl bg-secondary text-foreground text-sm font-medium"
              >
                حسناً
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="space-y-3 mt-4">
        {!participant ? (
          <button
            onClick={() => setView('register')}
            className="w-full py-3.5 rounded-xl islamic-gradient text-primary-foreground font-semibold text-base shadow-card"
          >
            سجّل الآن
          </button>
        ) : questionsAvailable && !todayAnswered ? (
          <button
            onClick={() => { setView('questions'); fetchQuestions(); setCurrentQ(0); setAnswers([null, null, null, null]); }}
            className="w-full py-3.5 rounded-xl islamic-gradient text-primary-foreground font-semibold text-base shadow-card"
          >
            ابدأ أسئلة اليوم
          </button>
        ) : null}

        <button
          onClick={() => { setView('leaderboard'); fetchLeaderboard(); }}
          className="w-full py-3 rounded-xl bg-card border border-border text-foreground font-medium flex items-center justify-center gap-2 shadow-card"
        >
          <Trophy className="w-4 h-4 text-accent-foreground" />
          قائمة المتصدرين
        </button>

        <button
          onClick={handleShare}
          className="w-full py-3 rounded-xl bg-card border border-border text-foreground font-medium flex items-center justify-center gap-2 shadow-card"
        >
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
          <li>• لكل سؤال صحيح نقطتان</li>
          <li>• الأسئلة متاحة من ٩:٠٠ صباحاً حتى ٩:٣٠ مساءً</li>
          <li>• المسابقة من ٢١ مارس حتى ٢١ مايو ٢٠٢٦</li>
          <li>• الأسئلة متغيرة يومياً ولا تتكرر</li>
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
