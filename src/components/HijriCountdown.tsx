import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getHijriAdjustment } from '@/lib/user';
import PeaceBeUponHim from '@/components/PeaceBeUponHim';

/**
 * Replace honorific parentheticals like "(عليه السلام)" / "(صلى الله عليه وآله)" /
 * "(عجل الله فرجه)" with the project's PBUH icon (small image), per design system.
 * The icon is rendered inline with the surrounding text.
 */
const renderHonored = (text: string, iconSize = 14) => {
  const re = /\s*\((?:عليه السلام|عليها السلام|عليهم السلام|عليهما السلام|صلى الله عليه وآله(?:\s*وسلم)?|عجل الله(?:\s+تعالى)?\s+فرجه(?:\s+الشريف)?|عج)\)\s*/g;
  const parts: Array<string | { honor: true }> = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push({ honor: true });
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  if (parts.length === 0) parts.push(text);
  return parts.map((p, i) =>
    typeof p === 'string'
      ? <span key={i}>{p}</span>
      : <PeaceBeUponHim key={i} size={iconSize} />
  );
};


interface HijriData {
  day: number;
  month: string;
  monthEn: string;
  monthNumber: number;
  year: number;
  daysInMonth: number;
  weekdayAr: string;
  gregorianDate: string;
}

// Major Ahlul Bayt (a.s.) occasions — month, day, label, full description
interface Occasion {
  month: number;
  day: number;
  ar: string;
  en: string;
  type: 'birth' | 'martyrdom' | 'event' | 'fasting';
  /** Featured occasions get priority placement and elevated styling */
  featured?: boolean;
  /** Full descriptive paragraph (no bullets, no headings) */
  descriptionAr: string;
  descriptionEn: string;
}

const OCCASIONS: Occasion[] = [
  // Muharram
  {
    month: 1, day: 1, ar: 'بداية السنة الهجرية', en: 'Hijri New Year', type: 'event',
    descriptionAr: 'بداية السنة الهجرية الجديدة هي بداية شهر محرم الحرام أول الأشهر القمرية الإسلامية، وقد جعلها أمير المؤمنين عمر بن الخطاب مبدأً للتقويم الإسلامي إحياءً لذكرى هجرة النبي محمد صلى الله عليه وآله من مكة المكرمة إلى المدينة المنورة، وهي محطة فاصلة في تاريخ الإسلام تذكّر المؤمنين بمعاني التضحية والصبر والثبات على الحق وبدء صفحة جديدة من الطاعة والقرب من الله تعالى.',
    descriptionEn: 'The first day of the Hijri year marks the beginning of the sacred month of Muharram, the first month in the Islamic lunar calendar. It commemorates the Prophet Muhammad’s migration from Mecca to Medina, a defining moment that reminds believers of sacrifice, patience, perseverance in truth, and the start of a renewed page of devotion to God.',
  },
  {
    month: 1, day: 9, ar: 'تاسوعاء الإمام الحسين (عليه السلام)', en: 'Tasua of Imam Hussain (a.s.)', type: 'event',
    descriptionAr: 'يوم تاسوعاء هو اليوم التاسع من شهر محرم الحرام، وهو اليوم الذي حاصرت فيه جيوش يزيد بن معاوية الإمام الحسين بن علي عليه السلام وأهل بيته وأصحابه في كربلاء، ومنعوا عنهم الماء، وهو يوم مظلوميتهم وثباتهم. يحييه المؤمنون بإقامة مجالس العزاء وذكر مصائب أبي عبد الله الحسين عليه السلام تمهيداً ليوم عاشوراء الأعظم.',
    descriptionEn: 'The ninth day of Muharram, when the armies of Yazid besieged Imam Hussain (a.s.), his family, and companions in Karbala and cut off their water. Believers commemorate this day with mourning gatherings preparing for Ashura.',
  },
  {
    month: 1, day: 10, ar: 'عاشوراء — استشهاد الإمام الحسين (عليه السلام)', en: 'Ashura — Martyrdom of Imam Hussain (a.s.)', type: 'martyrdom', featured: true,
    descriptionAr: 'يوم عاشوراء هو اليوم العاشر من شهر محرم الحرام، اليوم الذي استشهد فيه الإمام أبو عبد الله الحسين بن علي بن أبي طالب سبط رسول الله صلى الله عليه وآله، مع أهل بيته الكرام وثلة من خيار أصحابه في معركة كربلاء سنة إحدى وستين للهجرة، وذلك دفاعاً عن الإسلام ورفضاً للظلم وبيعة الفسق. هذا اليوم رمز خالد للتضحية والإباء والكرامة، يحييه المؤمنون بالحزن والبكاء وإقامة مجالس العزاء وتجديد العهد مع الإمام الحسين عليه السلام على نصرة الحق ورفض الباطل في كل زمان ومكان.',
    descriptionEn: 'The tenth of Muharram, the day Imam Hussain (a.s.), grandson of the Prophet (s.), was martyred along with his family and a small band of his loyal companions on the plains of Karbala in 61 AH. He stood against tyranny and refused to pledge allegiance to corruption. Ashura remains an eternal symbol of sacrifice, dignity, and the unwavering stand for truth — commemorated by believers with mourning gatherings and renewed devotion to the cause of justice.',
  },
  {
    month: 1, day: 25, ar: 'استشهاد الإمام علي بن الحسين زين العابدين (عليه السلام)', en: 'Martyrdom of Imam Sajjad (a.s.)', type: 'martyrdom',
    descriptionAr: 'في الخامس والعشرين من محرم الحرام استشهد الإمام السجاد علي بن الحسين زين العابدين عليه السلام، الإمام الرابع من أئمة أهل البيت، الذي حمل راية الإسلام بعد كربلاء بالعبادة والدعاء والعلم. ترك للأمة الصحيفة السجادية المعروفة بزبور آل محمد، ورسالة الحقوق التي تحدد حقوق الله والنفس والأرحام والمجتمع. كان قدوة في الزهد والعبادة والصبر على المصائب.',
    descriptionEn: 'On 25 Muharram, Imam Ali ibn al-Hussain Zayn al-Abidin (a.s.), the fourth Imam, was martyred. After Karbala he carried the message of Islam through worship, supplication, and knowledge. He left behind the Sahifa Sajjadiyya — known as the Psalms of the Family of Muhammad — and his Treatise on Rights, defining the rights of God, self, family, and society.',
  },
  // Safar
  {
    month: 2, day: 7, ar: 'استشهاد الإمام الحسن المجتبى (عليه السلام)', en: 'Martyrdom of Imam Hassan (a.s.)', type: 'martyrdom',
    descriptionAr: 'استشهاد الإمام الحسن بن علي بن أبي طالب عليه السلام سبط رسول الله صلى الله عليه وآله، الإمام الثاني من أئمة أهل البيت، سيد شباب أهل الجنة. صالح معاوية بن أبي سفيان حقناً لدماء المسلمين وحفاظاً على الإسلام، ثم استشهد مسموماً على يد زوجته جعدة بنت الأشعث بتدبير من معاوية، ودفن في البقيع بالمدينة المنورة بعد أن مُنع من الدفن قرب جده رسول الله.',
    descriptionEn: 'Imam Hassan ibn Ali (a.s.), grandson of the Prophet and the second Imam, master of the youth of Paradise. He made peace with Mu‘awiya to preserve Muslim lives and the integrity of Islam, and was later martyred by poisoning at the orchestration of Mu‘awiya. He was buried in al-Baqi cemetery in Medina after being denied burial near his grandfather the Prophet.',
  },
  {
    month: 2, day: 20, ar: 'الأربعين الحسيني', en: 'Arbaeen of Imam Hussain (a.s.)', type: 'event', featured: true,
    descriptionAr: 'الأربعين هو اليوم العشرون من شهر صفر الموافق لمرور أربعين يوماً على استشهاد الإمام الحسين عليه السلام في كربلاء. يجتمع فيه ملايين المؤمنين من شتى بقاع الأرض في زيارة الأربعين سيراً على الأقدام إلى مدينة كربلاء المقدسة، في أعظم تجمع بشري عرفته البشرية. يحيي المؤمنون فيه ذكرى رجوع السبايا وجابر بن عبد الله الأنصاري إلى قبر الإمام، وزيارته من أعظم القربات وعلامة المؤمن كما ورد عن الأئمة عليهم السلام.',
    descriptionEn: 'Arbaeen marks forty days after the martyrdom of Imam Hussain (a.s.). Tens of millions of believers from every nation walk on foot to the holy city of Karbala in the largest peaceful pilgrimage on Earth. It commemorates the return of the captives and the visit of Jabir ibn Abdullah al-Ansari to the Imam’s grave. Visiting Hussain on Arbaeen is among the noblest acts and is described in narrations as a hallmark of true faith.',
  },
  {
    month: 2, day: 28, ar: 'وفاة النبي (صلى الله عليه وآله) واستشهاد الإمام الحسن (عليه السلام)', en: 'Demise of the Prophet (s.) & Imam Hassan (a.s.)', type: 'martyrdom',
    descriptionAr: 'في الثامن والعشرين من شهر صفر يحيي المؤمنون ذكرى وفاة سيد الكائنات وأشرف المرسلين النبي محمد صلى الله عليه وآله وسلم في المدينة المنورة سنة الحادية عشرة للهجرة، بعد أن بلّغ الرسالة وأدّى الأمانة ونصح للأمة. ويوافق هذا اليوم أيضاً ذكرى استشهاد سبطه الإمام الحسن المجتبى عليه السلام على رواية أخرى. يوم حزن عظيم على آل محمد عليهم الصلاة والسلام.',
    descriptionEn: 'The 28th of Safar marks the demise of the Prophet Muhammad (s.) in Medina in the 11th year of Hijra after he conveyed the message and entrusted his nation with the guidance. According to a narration, this is also the day of martyrdom of his grandson Imam Hassan (a.s.). A day of profound grief for the Family of Muhammad.',
  },
  // Rabi al-Awwal
  {
    month: 3, day: 8, ar: 'بداية إمامة الإمام المهدي (عجل الله فرجه)', en: 'Beginning of Imam Mahdi (a.s.) Imamate', type: 'event',
    descriptionAr: 'في الثامن من ربيع الأول استشهد الإمام الحسن العسكري عليه السلام، وفي اليوم نفسه بدأت إمامة ولده الإمام الثاني عشر المهدي المنتظر عجل الله تعالى فرجه الشريف، وهو الإمام الحي الذي يقود الأمة إلى يومنا هذا في غيبته الكبرى، في انتظار اليوم الموعود الذي يملأ الله به الأرض قسطاً وعدلاً كما مُلئت ظلماً وجوراً.',
    descriptionEn: 'On 8 Rabi al-Awwal, Imam Hassan al-Askari (a.s.) was martyred and the Imamate of his son, the awaited Imam Mahdi (a.s.), began. He is the living Imam who continues to guide the nation during his Major Occultation, until the promised day when God fills the earth with justice and equity after it has been filled with oppression.',
  },
  {
    month: 3, day: 17, ar: 'مولد النبي (صلى الله عليه وآله) ومولد الإمام الصادق (عليه السلام)', en: 'Birth of the Prophet (s.) & Imam Sadiq (a.s.)', type: 'birth', featured: true,
    descriptionAr: 'في السابع عشر من ربيع الأول وُلد سيد الخلق وحبيب الحق النبي محمد بن عبد الله صلى الله عليه وآله وسلم في مكة المكرمة عام الفيل، رحمةً للعالمين وخاتماً للنبيين. وفي اليوم نفسه وُلد الإمام جعفر بن محمد الصادق عليه السلام عام ثلاث وثمانين للهجرة، الإمام السادس من أئمة أهل البيت، مؤسس المذهب الجعفري، الذي تخرّج من مدرسته آلاف العلماء في الفقه والحديث والكلام والعلوم. يحتفل المؤمنون بهذا اليوم العظيم بإحياء مولديهما الكريمين.',
    descriptionEn: 'On 17 Rabi al-Awwal the master of creation, Prophet Muhammad ibn Abdullah (s.), was born in Mecca in the Year of the Elephant — a mercy to all worlds and the seal of all prophets. On the same date in 83 AH, Imam Ja‘far al-Sadiq (a.s.), the sixth Imam and founder of the Ja‘fari school, was born. Thousands of scholars in jurisprudence, hadith, theology and the sciences graduated from his school. Believers joyfully commemorate both blessed births.',
  },
  // Jumada al-Thani
  {
    month: 6, day: 3, ar: 'استشهاد السيدة فاطمة الزهراء (عليها السلام)', en: 'Martyrdom of Sayyida Zahra (a.s.)', type: 'martyrdom', featured: true,
    descriptionAr: 'في الثالث من جمادى الآخرة استشهدت سيدة نساء العالمين فاطمة الزهراء بنت محمد المصطفى صلى الله عليه وآله، زوجة أمير المؤمنين علي بن أبي طالب وأم الحسن والحسين عليهم السلام. لاقت بعد رحيل أبيها الكريم الظلم والاعتداء وكسر ضلعها وإسقاط جنينها المحسن، فلم تمتد بها الأيام حتى التحقت بأبيها بعد خمسة وتسعين يوماً من رحيله، وأوصت بأن تُدفن ليلاً ولا يُعلم قبرها حتى يومنا هذا، احتجاجاً على ظلامتها.',
    descriptionEn: 'On 3 Jumada al-Thani, the Mistress of the Women of the Worlds, Fatima al-Zahra (a.s.) — daughter of Prophet Muhammad (s.), wife of Imam Ali, and mother of Hassan and Hussain — was martyred. After her father’s passing she endured oppression, the breaking of her rib and the loss of her unborn son Muhsin. She joined her father just 95 days after his passing. She willed to be buried at night with her grave hidden — unknown to this day — as a lasting protest against the injustice she suffered.',
  },
  {
    month: 6, day: 20, ar: 'مولد السيدة الزهراء (عليها السلام)', en: 'Birth of Sayyida Zahra (a.s.)', type: 'birth', featured: true,
    descriptionAr: 'في العشرين من جمادى الآخرة وُلدت سيدة نساء العالمين فاطمة الزهراء عليها السلام بنت سيد الأنبياء محمد صلى الله عليه وآله وأم خديجة بنت خويلد، في مكة المكرمة قبل البعثة بخمس سنوات. هي بضعة الرسول وروحه التي بين جنبيه، زوجة علي وأم الأئمة الأحد عشر. هذا اليوم المبارك جعله الإمام الخميني يوماً عالمياً للمرأة المسلمة، تكريماً لمكانتها في الإسلام.',
    descriptionEn: 'On 20 Jumada al-Thani, Sayyida Fatima al-Zahra (a.s.) — daughter of the Prophet (s.) and Khadija — was born in Mecca, five years before the start of the Prophetic mission. She is the part of the Prophet, the wife of Ali, and the mother of the eleven Imams. This blessed day was designated by Imam Khomeini as the International Day of the Muslim Woman in honor of her exalted status.',
  },
  // Rajab
  {
    month: 7, day: 13, ar: 'مولد أمير المؤمنين الإمام علي بن أبي طالب (عليه السلام)', en: 'Birth of Imam Ali (a.s.)', type: 'birth', featured: true,
    descriptionAr: 'في الثالث عشر من شهر رجب الأصب المبارك وُلد أمير المؤمنين وسيد الوصيين الإمام علي بن أبي طالب عليه السلام داخل الكعبة المشرفة في مكة المكرمة، وهو الوحيد في تاريخ البشرية الذي شُرّف بهذا المولد العظيم. ولد لأبي طالب وفاطمة بنت أسد في حدث جلل أخبرت فيه فاطمة قومها بأن جدران الكعبة انشقت لها فدخلت ثم انضمت، وخرجت بعد ثلاثة أيام بمولودها الكريم. هذا اليوم عيد عظيم عند المؤمنين.',
    descriptionEn: 'On 13 Rajab, the Commander of the Faithful Imam Ali ibn Abi Talib (a.s.) was born inside the holy Kaaba in Mecca — the only person in history honored with this miraculous birthplace. Born to Abu Talib and Fatima bint Asad, his mother reported that the walls of the Kaaba parted for her, then closed, and three days later she emerged with her noble newborn. This day is a great celebration for believers.',
  },
  {
    month: 7, day: 27, ar: 'المبعث النبوي الشريف', en: 'Mab\'ath of the Prophet (s.)', type: 'event', featured: true,
    descriptionAr: 'في السابع والعشرين من شهر رجب الأصب يحيي المؤمنون ذكرى المبعث النبوي الشريف، وهو اليوم الذي بُعث فيه النبي محمد بن عبد الله صلى الله عليه وآله رسولاً إلى الناس كافة، وذلك في غار حراء بمكة المكرمة وعمره أربعون سنة، حين نزل عليه الوحي الإلهي بأول آيات القرآن الكريم: اقرأ باسم ربك الذي خلق. هذا اليوم بداية أعظم تحول في تاريخ البشرية وانتقالها من ظلمات الجاهلية إلى نور الإسلام.',
    descriptionEn: 'On 27 Rajab, believers commemorate the Mab‘ath — the day Prophet Muhammad (s.) received his prophethood at age forty in the Cave of Hira near Mecca, when the first verses of the Quran were revealed: “Read in the name of your Lord who created.” It marks the most profound turning point in human history, from the darkness of ignorance to the light of Islam.',
  },
  // Shaban
  {
    month: 8, day: 3, ar: 'مولد الإمام الحسين سيد الشهداء (عليه السلام)', en: 'Birth of Imam Hussain (a.s.)', type: 'birth', featured: true,
    descriptionAr: 'في الثالث من شهر شعبان المعظم وُلد سيد الشهداء وريحانة رسول الله الإمام الحسين بن علي بن أبي طالب عليه السلام في المدينة المنورة سنة الرابعة للهجرة. هو ابن أمير المؤمنين علي وفاطمة الزهراء بنت رسول الله صلى الله عليه وآله، الإمام الثالث من أئمة أهل البيت، وسيد شباب أهل الجنة. يحتفل المؤمنون بهذا اليوم العظيم احتفاءً بمولد من أحيا الإسلام بدمائه الزكية في كربلاء.',
    descriptionEn: 'On 3 Sha‘ban, the Master of the Martyrs, Imam Hussain ibn Ali (a.s.), was born in Medina in 4 AH. Son of Imam Ali and Fatima al-Zahra, grandson of the Prophet (s.), and the third Imam — master of the youth of Paradise. Believers celebrate the birth of the one whose pure blood revived Islam at Karbala.',
  },
  {
    month: 8, day: 15, ar: 'مولد الإمام المهدي المنتظر (عجل الله فرجه)', en: 'Birth of Imam Mahdi (a.s.)', type: 'birth', featured: true,
    descriptionAr: 'في الخامس عشر من شهر شعبان المعظم وُلد الإمام المهدي محمد بن الحسن العسكري عليه السلام، الإمام الثاني عشر من أئمة أهل البيت، صاحب العصر والزمان، إمام الحق والعدل، الذي وعد الله ورسوله بظهوره ليملأ الأرض قسطاً وعدلاً كما مُلئت ظلماً وجوراً. وُلد في سامراء سنة خمس وخمسين ومائتين للهجرة، وهو في غيبته الكبرى منذ سنة 329 هـ ينتظره المؤمنون بشوق وحنين، نسأل الله تعجيل فرجه الشريف.',
    descriptionEn: 'On 15 Sha‘ban, Imam al-Mahdi Muhammad ibn al-Hassan al-Askari (a.s.), the twelfth Imam — the Master of the Age and the Imam of justice — was born in Samarra in 255 AH. God and His Messenger promised that he will appear to fill the earth with justice after it has been filled with oppression. He has been in the Major Occultation since 329 AH, and the faithful await him with longing. May God hasten his noble reappearance.',
  },
  // Ramadan
  {
    month: 9, day: 1, ar: 'بداية شهر رمضان المبارك', en: 'Beginning of Ramadan', type: 'fasting', featured: true,
    descriptionAr: 'بداية شهر رمضان المبارك شهر الله الأعظم، شهر الصيام والقيام والقرآن، شهر الرحمة والمغفرة والعتق من النار. فيه أُنزل القرآن هدى للناس وبينات من الهدى والفرقان، وفيه ليلة القدر التي هي خير من ألف شهر. يستقبل المؤمنون هذا الشهر العظيم بالفرح والاستعداد للصيام والعبادة والإكثار من الذكر والدعاء وقراءة القرآن، طالبين رحمة الله وغفرانه وعتقه من النار.',
    descriptionEn: 'The beginning of the blessed month of Ramadan — the greatest month of God, the month of fasting, night prayer, and the Quran; the month of mercy, forgiveness, and freedom from the Fire. In it the Quran was revealed as guidance for humanity, and within it lies the Night of Power, better than a thousand months. Believers welcome it with joy, preparing for fasting, worship, abundant remembrance, supplication, and Quran recitation.',
  },
  {
    month: 9, day: 19, ar: 'ضربة الإمام علي (عليه السلام) في محراب الكوفة', en: 'Striking of Imam Ali (a.s.)', type: 'martyrdom',
    descriptionAr: 'في فجر التاسع عشر من شهر رمضان المبارك ضُرب أمير المؤمنين الإمام علي بن أبي طالب عليه السلام بسيف مسموم على يد الشقي عبد الرحمن بن ملجم المرادي وهو ساجد في محراب مسجد الكوفة يصلي الفجر. فقال كلمته الخالدة: فزتُ ورب الكعبة. وبقي مجروحاً يعاني من السم ثلاثة أيام أوصى فيها وصاياه الخالدة لولديه الحسن والحسين وللأمة جمعاء.',
    descriptionEn: 'At dawn on 19 Ramadan, the Commander of the Faithful, Imam Ali (a.s.), was struck with a poisoned sword by Ibn Muljam while prostrating in the prayer-niche of the Kufa Mosque during the dawn prayer. He uttered his immortal words: “By the Lord of the Kaaba, I have succeeded.” He remained wounded for three days, leaving his eternal counsel to Hassan, Hussain, and the entire nation.',
  },
  {
    month: 9, day: 21, ar: 'استشهاد أمير المؤمنين الإمام علي (عليه السلام)', en: 'Martyrdom of Imam Ali (a.s.)', type: 'martyrdom', featured: true,
    descriptionAr: 'في الحادي والعشرين من شهر رمضان المبارك استشهد أمير المؤمنين وسيد الوصيين الإمام علي بن أبي طالب عليه السلام في الكوفة، متأثراً بضربة ابن ملجم لعنه الله. هو أول من آمن برسول الله من الرجال، وأخوه ووصيه ووزيره وزوج ابنته الزهراء. حمل راية الإسلام في كل المعارك، وكان باب مدينة العلم النبوي. دُفن في النجف الأشرف في موضع لم يعرفه إلا أبناؤه الأئمة عليهم السلام، حتى دلّ عليه الإمام الصادق.',
    descriptionEn: 'On 21 Ramadan, the Commander of the Faithful Imam Ali (a.s.) was martyred in Kufa from the wound inflicted by Ibn Muljam. He was the first man to believe in the Messenger of God, his brother, executor, vizier, and husband of his daughter Fatima. He carried Islam’s banner in every battle and was the gate of the Prophet’s city of knowledge. He was buried in al-Najaf at a site known only to his sons the Imams, later revealed by Imam al-Sadiq (a.s.).',
  },
  {
    month: 9, day: 23, ar: 'ليلة القدر', en: 'Laylat al-Qadr', type: 'event', featured: true,
    descriptionAr: 'ليلة القدر هي الليلة المباركة التي وصفها الله تعالى بأنها خير من ألف شهر. تتنزل فيها الملائكة والروح بإذن ربهم من كل أمر، وفيها يقدّر الله مقادير العباد للسنة المقبلة من الأرزاق والآجال. أرجح الروايات عند أهل البيت عليهم السلام أنها ليلة الثالث والعشرين من شهر رمضان المبارك. يحييها المؤمنون بالعبادة والدعاء والقرآن وأعمال خاصة منها رفع المصحف الشريف والتوسل بالأئمة الطاهرين، طلباً لرحمة الله وغفرانه وكتابة الاسم في ديوان السعداء.',
    descriptionEn: 'The Night of Power is the blessed night that God described as better than a thousand months. The angels and the Spirit descend by their Lord’s permission with every decree. On it God ordains people’s provisions and lifespans for the coming year. According to the Ahlul Bayt (a.s.), the most likely night is the 23rd of Ramadan. Believers spend it in worship, supplication, Quran recitation, and special acts including raising the Quran and seeking intercession through the pure Imams, asking for mercy, forgiveness, and being recorded among the blessed.',
  },
  // Shawwal
  {
    month: 10, day: 1, ar: 'عيد الفطر المبارك', en: 'Eid al-Fitr', type: 'event', featured: true,
    descriptionAr: 'عيد الفطر المبارك هو أول أيام شهر شوال، يوم فرح المؤمنين بإتمام صيام شهر رمضان وقيامه وما حصلوه فيه من عبادات وقربات. يُستحب فيه صلاة العيد وإخراج زكاة الفطرة قبل الصلاة، والاغتسال ولبس أحسن الثياب والتطيب، وتبادل التهاني والتزاور وصلة الأرحام. هو يوم الجائزة من الله تعالى لعباده الصائمين، يوم الفرح والشكر والثواب على ما قدّموا من صيام وعبادة في الشهر الفضيل.',
    descriptionEn: 'Eid al-Fitr is the first day of Shawwal — the joyful day on which believers celebrate completing the fast of Ramadan. It is recommended to pray the Eid prayer, give the Zakat al-Fitra before the prayer, perform ghusl, wear one’s best clothes, apply perfume, exchange greetings, and visit family. It is the Day of Reward from God to His fasting servants — a day of joy, gratitude, and recompense for the worship offered in the noble month.',
  },
  {
    month: 10, day: 25, ar: 'استشهاد الإمام جعفر الصادق (عليه السلام)', en: 'Martyrdom of Imam Sadiq (a.s.)', type: 'martyrdom',
    descriptionAr: 'في الخامس والعشرين من شهر شوال استشهد الإمام جعفر بن محمد الصادق عليه السلام، الإمام السادس من أئمة أهل البيت، مؤسس المذهب الجعفري، مسموماً على يد الطاغية أبي جعفر المنصور العباسي سنة ثمان وأربعين ومائة للهجرة. تخرّج من مدرسته آلاف العلماء كهشام بن الحكم وزرارة ومحمد بن مسلم وأبو حنيفة، ولا تزال علومه ومعارفه مرجعاً للأمة الإسلامية إلى يومنا هذا. دُفن في البقيع بالمدينة المنورة.',
    descriptionEn: 'On 25 Shawwal, Imam Ja‘far ibn Muhammad al-Sadiq (a.s.), the sixth Imam and founder of the Ja‘fari school, was martyred by poisoning at the order of the Abbasid tyrant al-Mansur in 148 AH. Thousands of scholars graduated from his school, including Hisham ibn al-Hakam, Zurara, Muhammad ibn Muslim, and Abu Hanifa. His knowledge remains a reference for the Muslim nation to this day. He was buried in al-Baqi in Medina.',
  },
  // Dhu al-Qadah
  {
    month: 11, day: 11, ar: 'مولد الإمام علي بن موسى الرضا (عليه السلام)', en: 'Birth of Imam Reza (a.s.)', type: 'birth',
    descriptionAr: 'في الحادي عشر من شهر ذي القعدة الحرام وُلد الإمام علي بن موسى الرضا عليه السلام في المدينة المنورة سنة ثمان وأربعين ومائة للهجرة. هو الإمام الثامن من أئمة أهل البيت، عالم آل محمد، وضامن الجنة لمن زاره عارفاً بحقه. عاصر خمسة من خلفاء بني العباس، وأكرهه المأمون على ولاية العهد لأهداف سياسية، ثم اغتاله مسموماً، فاستشهد ودُفن في خراسان (طوس / مشهد المقدسة) التي أصبحت قبلة للمؤمنين.',
    descriptionEn: 'On 11 Dhu al-Qadah, Imam Ali ibn Musa al-Reza (a.s.) was born in Medina in 148 AH. He is the eighth Imam, the scholar of the Family of Muhammad, and the guarantor of Paradise for those who visit him knowing his right. He lived through five Abbasid caliphs and was forced into the position of crown prince by al-Ma’mun for political reasons before being martyred by poisoning. He was buried in Khorasan (Tus / holy Mashhad), which has become a destination for believers.',
  },
  {
    month: 11, day: 29, ar: 'استشهاد الإمام محمد الجواد (عليه السلام)', en: 'Martyrdom of Imam Jawad (a.s.)', type: 'martyrdom',
    descriptionAr: 'في التاسع والعشرين من شهر ذي القعدة استشهد الإمام محمد بن علي الجواد عليه السلام، الإمام التاسع من أئمة أهل البيت، مسموماً على يد المعتصم العباسي بتدبير من زوجته أم الفضل بنت المأمون سنة عشرين ومائتين للهجرة، وعمره الشريف خمس وعشرون سنة فقط. تولى الإمامة وهو طفل صغير وأبهر العلماء بعلمه ومعارفه. دُفن إلى جوار جده الإمام موسى الكاظم في الكاظمية ببغداد.',
    descriptionEn: 'On 29 Dhu al-Qadah, Imam Muhammad ibn Ali al-Jawad (a.s.), the ninth Imam, was martyred by poisoning at the orchestration of the Abbasid al-Mu‘tasim through his wife Umm al-Fadl in 220 AH, at the age of only twenty-five. He assumed the Imamate as a young child and astounded scholars with his knowledge. He was buried beside his grandfather Imam Musa al-Kadhim in al-Kadhimiyya, Baghdad.',
  },
  // Dhu al-Hijjah
  {
    month: 12, day: 9, ar: 'يوم عرفة', en: 'Day of Arafah', type: 'event', featured: true,
    descriptionAr: 'يوم عرفة هو اليوم التاسع من شهر ذي الحجة الحرام، أعظم أيام السنة عند الله تعالى. يقف فيه الحجاج على صعيد عرفات في الموقف الأعظم تلبيةً وذكراً ودعاءً ورجاءً لمغفرة الله ورحمته. وبالنسبة لغير الحجاج فهو يوم عبادة عظيم يُستحب فيه الصيام، وقراءة دعاء عرفة لمولانا الإمام الحسين عليه السلام، وهو من أعظم الأدعية وأبلغها في حق المعرفة بالله، يُقرأ في عصر هذا اليوم تأسياً بالإمام عليه السلام الذي قرأه على صعيد عرفات.',
    descriptionEn: 'The Day of Arafah is the ninth of Dhu al-Hijjah — the greatest day of the year before God. Pilgrims stand on the plain of Arafat in the supreme station of pilgrimage, calling, remembering, supplicating, and hoping for divine mercy and forgiveness. For non-pilgrims, it is a day of profound worship: fasting is recommended, as is reciting the famous supplication of Imam Hussain (a.s.) on Arafah — among the most sublime supplications about the knowledge of God — read at the afternoon hour in emulation of the Imam who recited it on the plain of Arafat.',
  },
  {
    month: 12, day: 10, ar: 'عيد الأضحى المبارك', en: 'Eid al-Adha', type: 'event', featured: true,
    descriptionAr: 'عيد الأضحى المبارك هو العاشر من شهر ذي الحجة الحرام، أحد أعياد المسلمين الكبرى وذكرى تضحية النبي إبراهيم الخليل عليه السلام بولده إسماعيل عليه السلام طاعةً لأمر الله، فجاء الفداء العظيم من الله تعالى. يُستحب فيه صلاة العيد، والأضحية لمن استطاع إليها سبيلاً، وتوزيع لحومها على الفقراء والمحتاجين، والاجتماع على الذكر والشكر والتزاور وصلة الأرحام. يوم بهجة وسرور للمؤمنين في كل بقاع الأرض.',
    descriptionEn: 'Eid al-Adha is the tenth of Dhu al-Hijjah — one of the greatest Muslim festivals, commemorating Prophet Ibrahim’s readiness to sacrifice his son Isma‘il in obedience to God, when God ransomed Isma‘il with a great sacrifice. Believers pray the Eid prayer, perform the sacrifice if able, and distribute its meat to the poor and needy. They gather in remembrance, gratitude, family visits, and joy across the world.',
  },
  {
    month: 12, day: 18, ar: 'عيد الغدير الأغر — أعظم أعياد المؤمنين', en: 'Eid al-Ghadir — The Greatest Feast', type: 'event', featured: true,
    descriptionAr: 'عيد الغدير الأغر هو الثامن عشر من شهر ذي الحجة الحرام، عيد الله الأكبر وأعظم أعياد المؤمنين على الإطلاق، وهو اليوم الذي أكمل الله فيه دينه وأتم نعمته على عباده ورضي لهم الإسلام ديناً. في هذا اليوم العظيم سنة عشر للهجرة، عند منصرف النبي محمد صلى الله عليه وآله من حجة الوداع، نزل عليه أمر الله تعالى في غدير خم بين مكة والمدينة بأن يبلّغ الأمة بولاية أمير المؤمنين علي بن أبي طالب عليه السلام، فأمر بحبس الناس وأقام خطبته الجامعة المشهورة، ثم رفع يد علي عليه السلام بيده الشريفة قائلاً قولته الخالدة: من كنت مولاه فهذا علي مولاه، اللهم والِ من والاه وعادِ من عاداه. يحيي المؤمنون هذا اليوم بصيامه وصلاته الخاصة وزيارة أمير المؤمنين والتزاور والتهنئة وتجديد البيعة بالولاية.',
    descriptionEn: 'Eid al-Ghadir is the 18th of Dhu al-Hijjah — the greatest feast of God and of the believers, the day on which God perfected His religion, completed His favor, and approved Islam as the faith. In the year 10 AH, on his return from the Farewell Pilgrimage, the Prophet Muhammad (s.) received the divine command at Ghadir Khumm — between Mecca and Medina — to convey the guardianship of the Commander of the Faithful Ali ibn Abi Talib (a.s.). He halted the caravan, delivered his celebrated comprehensive sermon, raised Ali’s hand with his blessed hand and uttered the immortal declaration: “Whoever I am his master, this Ali is his master. O God, befriend whoever befriends him and oppose whoever opposes him.” Believers honor this day with fasting, its special prayer, the Ziyarat of the Commander of the Faithful, exchanging visits and greetings, and renewing their pledge of allegiance to the Wilayah.',
  },
  {
    month: 12, day: 24, ar: 'يوم المباهلة', en: 'Day of Mubahala', type: 'event',
    descriptionAr: 'في الرابع والعشرين من شهر ذي الحجة الحرام يحيي المؤمنون ذكرى يوم المباهلة، اليوم الذي خرج فيه النبي محمد صلى الله عليه وآله مع أصحاب الكساء — الإمام علي والسيدة فاطمة والحسن والحسين عليهم السلام — لمباهلة نصارى نجران، تحقيقاً لقول الله تعالى: قل تعالوا ندعُ أبناءنا وأبناءكم ونساءنا ونساءكم وأنفسنا وأنفسكم. فلما رأى النصارى نور أهل البيت ووجوههم المباركة آثروا الصلح والخراج. هذا اليوم دليل قاطع على عظمة أهل البيت ومكانتهم عند الله تعالى.',
    descriptionEn: 'On 24 Dhu al-Hijjah, believers commemorate the Day of Mubahala — when Prophet Muhammad (s.) emerged with the People of the Cloak (Imam Ali, Sayyida Fatima, Hassan, and Hussain) for the divine challenge with the Christians of Najran, fulfilling the verse: “Say, come, let us call our sons and your sons, our women and your women, ourselves and yourselves…” When the Christians saw the radiance of the Family, they chose peace and tribute. This day is a decisive proof of the exalted status of the Ahlul Bayt before God.',
  },
];

const MONTH_NAMES_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة',
  'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];
const MONTH_NAMES_EN = [
  'Muharram', 'Safar', 'Rabi I', 'Rabi II', 'Jumada I', 'Jumada II',
  'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah',
];

const HijriCountdown = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  // Ahlul Bayt (a.s.) occasions are Shia-specific. For Sunni users, show only
  // the Hijri calendar (date, month, progress) without the occasions list.
  const madhhab = (typeof window !== 'undefined' && localStorage.getItem('atraa_madhhab') === 'sunni') ? 'sunni' : 'shia';
  const showOccasions = madhhab === 'shia';
  const [hijri, setHijri] = useState<HijriData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [openOccasion, setOpenOccasion] = useState<Occasion | null>(null);

  const fetchHijri = (adj: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + adj);
    const dd = String(targetDate.getDate()).padStart(2, '0');
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const yyyy = targetDate.getFullYear();

    fetch(`https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=26.4207&longitude=50.0888&method=4&timezonestring=Asia/Riyadh`)
      .then(res => res.json())
      .then(data => {
        const h = data?.data?.date?.hijri;
        if (h) {
          setHijri({
            day: parseInt(h.day),
            month: h.month.ar,
            monthEn: h.month.en,
            monthNumber: parseInt(h.month.number),
            year: parseInt(h.year),
            daysInMonth: h.month.days ? parseInt(h.month.days) : 30,
            weekdayAr: h.weekday?.ar || '',
            gregorianDate: data?.data?.date?.gregorian?.date || '',
          });
        }
      })
      .catch(() => { /* silent */ });
  };

  useEffect(() => {
    const adj = getHijriAdjustment();
    fetchHijri(adj);

    const handleCustomEvent = (e: Event) => {
      const ce = e as CustomEvent<number>;
      fetchHijri(ce.detail);
    };
    window.addEventListener('hijri-adjust-changed', handleCustomEvent);
    return () => window.removeEventListener('hijri-adjust-changed', handleCustomEvent);
  }, []);

  const daysRemaining = hijri ? Math.max(0, hijri.daysInMonth - hijri.day) : 0;
  const progress = hijri ? (hijri.day / hijri.daysInMonth) * 100 : 0;

  // Compute upcoming occasions in the current and next month — featured come first
  const upcomingOccasions = (hijri && showOccasions) ? [
    ...OCCASIONS.filter(o => o.month === hijri.monthNumber && o.day >= hijri.day),
    ...OCCASIONS.filter(o => o.month === ((hijri.monthNumber % 12) + 1)),
  ].sort((a, b) => {
    if (a.month === b.month) {
      if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
      return a.day - b.day;
    }
    return 0;
  }) : [];

  const todaysOccasion = (hijri && showOccasions)
    ? OCCASIONS.find(o => o.month === hijri.monthNumber && o.day === hijri.day)
    : undefined;

  const typeColor = (type: Occasion['type']) =>
    type === 'martyrdom' ? 'bg-foreground/8 text-foreground/70'
    : type === 'birth' ? 'bg-gold/15 text-gold'
    : type === 'fasting' ? 'bg-primary/10 text-primary'
    : 'bg-secondary/40 text-foreground/60';

  const typeLabel = (type: Occasion['type']) =>
    type === 'martyrdom' ? (isAr ? 'استشهاد' : 'Martyrdom')
    : type === 'birth' ? (isAr ? 'مولد' : 'Birth')
    : type === 'fasting' ? (isAr ? 'صيام' : 'Fasting')
    : (isAr ? 'مناسبة' : 'Event');

  return (
    <>
      <button
        onClick={() => hijri && setShowDetails(true)}
        disabled={!hijri}
        className={`rounded-2xl bg-card border border-border/20 p-3.5 min-h-[100px] flex flex-col justify-between text-${isAr ? 'right' : 'left'} active:scale-[0.98] transition-transform relative overflow-hidden`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[8px] text-muted-foreground/40 tracking-widest font-light uppercase">
            {isAr ? 'التقويم' : 'Calendar'}
          </span>
          {hijri && (
            <ChevronLeft
              className={`w-3 h-3 text-muted-foreground/30 ${isAr ? '' : 'rotate-180'}`}
            />
          )}
        </div>
        {hijri ? (
          <div className="w-full">
            <p className="text-[15px] text-foreground leading-snug">
              {hijri.day} {isAr ? hijri.month : MONTH_NAMES_EN[hijri.monthNumber - 1]}
            </p>
            <p className="text-[9px] text-muted-foreground/40 mt-0.5 font-light">
              {hijri.year} {isAr ? 'هـ' : 'AH'}
            </p>

            <div className="mt-2.5">
              <div className="h-[2px] rounded-full bg-secondary/30 overflow-hidden">
                <div
                  className="h-full rounded-full bg-foreground/15 transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[7px] text-muted-foreground/30 mt-1 font-light">
                {daysRemaining > 0
                  ? (isAr ? `${daysRemaining} يوم متبقي` : `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} left`)
                  : (isAr ? 'آخر يوم' : 'Last day')}
              </p>
            </div>
            {todaysOccasion && (
              <span className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-4 w-20 rounded-md bg-secondary/30 animate-pulse" />
            <div className="h-2.5 w-14 rounded-md bg-secondary/20 animate-pulse" />
          </div>
        )}
      </button>

      {/* Details modal — full-screen on mobile for clarity */}
      <AnimatePresence>
        {showDetails && hijri && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-md flex items-end sm:items-center justify-center"
            onClick={() => setShowDetails(false)}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="bg-background rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[92vh] flex flex-col overflow-hidden"
            >
              {/* Header — clean monochrome, matches the rest of the app */}
              <div className="relative flex-shrink-0 px-5 pt-5 pb-4 border-b border-border/10">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-muted-foreground/55 tracking-[0.3em] font-light uppercase mb-2">
                      {isAr ? 'التقويم الهجري' : 'Hijri Calendar'}
                    </p>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-[36px] text-foreground leading-none font-light tabular-nums">
                        {hijri.day}
                      </span>
                      <span className="text-[14px] text-foreground/85 leading-tight">
                        {isAr ? hijri.month : MONTH_NAMES_EN[hijri.monthNumber - 1]}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground/65 font-light">
                      {hijri.year} {isAr ? 'هـ' : 'AH'}{isAr && hijri.weekdayAr ? ` · ${hijri.weekdayAr}` : ''}
                    </p>
                    <p className="text-[10px] text-muted-foreground/45 font-light tabular-nums mt-0.5">
                      {hijri.gregorianDate}
                    </p>

                    {/* Inline progress micro-bar — neutral */}
                    <div className="mt-3 max-w-[180px]">
                      <div className="h-[2px] rounded-full bg-secondary/40 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-foreground/25 transition-all duration-700 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-muted-foreground/50 mt-1 font-light">
                        {daysRemaining > 0
                          ? (isAr ? `${daysRemaining} يوم متبقي من الشهر` : `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} left in month`)
                          : (isAr ? 'آخر يوم من الشهر' : 'Last day of the month')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-3 h-8 rounded-full bg-secondary/40 border border-border/20 text-[11px] text-foreground/75 font-light active:scale-95 flex-shrink-0"
                  >
                    {isAr ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              </div>

              {/* Body — scrollable */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Today's occasion — restrained gold accent (single gold hairline) */}
                {todaysOccasion && (
                  <button
                    onClick={() => setOpenOccasion(todaysOccasion)}
                    className="w-full text-start rounded-2xl bg-card border border-border/20 p-4 active:scale-[0.99] transition-transform relative overflow-hidden"
                  >
                    <div className="absolute inset-y-0 start-0 w-[2px] bg-gold/60" />
                    <p className="text-[9px] text-muted-foreground/60 uppercase tracking-[0.25em] font-light mb-2">
                      {isAr ? 'مناسبة اليوم' : 'Today'}
                    </p>
                    <p className="text-[15px] text-foreground leading-relaxed">
                      {renderHonored(isAr ? todaysOccasion.ar : todaysOccasion.en)}
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 mt-2 font-light">
                      {isAr ? 'اضغط لقراءة تفاصيل المناسبة' : 'Tap to read full details'}
                    </p>
                  </button>
                )}

                {/* Ramadan / Eid prediction — clean text card, no icons */}
                {hijri.monthNumber === 8 && (
                  <div className="rounded-2xl bg-card border border-border/15 p-4">
                    <p className="text-[9px] text-muted-foreground/55 uppercase tracking-[0.25em] font-light mb-1.5">
                      {isAr ? 'توقّع' : 'Forecast'}
                    </p>
                    <p className="text-[12px] text-foreground">
                      {isAr ? 'بداية متوقعة لشهر رمضان المبارك' : 'Expected start of Ramadan'}
                    </p>
                    <p className="text-[10px] text-muted-foreground/55 mt-1 font-light leading-relaxed">
                      {isAr
                        ? `بعد حوالي ${30 - hijri.day + 1} يوم — يخضع لرؤية الهلال`
                        : `In about ${30 - hijri.day + 1} days — subject to moon sighting`}
                    </p>
                  </div>
                )}
                {hijri.monthNumber === 9 && (
                  <div className="rounded-2xl bg-card border border-border/15 p-4">
                    <p className="text-[9px] text-muted-foreground/55 uppercase tracking-[0.25em] font-light mb-1.5">
                      {isAr ? 'توقّع' : 'Forecast'}
                    </p>
                    <p className="text-[12px] text-foreground">
                      {isAr ? 'بداية متوقعة لعيد الفطر المبارك' : 'Expected Eid al-Fitr'}
                    </p>
                    <p className="text-[10px] text-muted-foreground/55 mt-1 font-light leading-relaxed">
                      {isAr
                        ? `بعد حوالي ${hijri.daysInMonth - hijri.day + 1} يوم — يخضع لرؤية الهلال`
                        : `In about ${hijri.daysInMonth - hijri.day + 1} days — subject to moon sighting`}
                    </p>
                  </div>
                )}

                {/* Upcoming occasions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] text-muted-foreground/55 uppercase tracking-[0.25em] font-light">
                      {isAr ? 'المناسبات القادمة' : 'Upcoming occasions'}
                    </p>
                    {upcomingOccasions.length > 0 && (
                      <span className="text-[9px] text-muted-foreground/40 tabular-nums font-light">
                        {upcomingOccasions.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {upcomingOccasions.length === 0 && (
                      <p className="text-[11px] text-muted-foreground/40 font-light text-center py-4">
                        {isAr ? 'لا توجد مناسبات قريبة' : 'No upcoming occasions'}
                      </p>
                    )}
                    {upcomingOccasions.map((o, i) => (
                      <button
                        key={`${o.month}-${o.day}-${i}`}
                        onClick={() => setOpenOccasion(o)}
                        className="w-full flex items-stretch gap-3 p-3 rounded-2xl bg-card border border-border/15 active:scale-[0.985] transition-transform text-start relative overflow-hidden"
                      >
                        {o.featured && (
                          <span className="absolute inset-y-0 start-0 w-[2px] bg-gold/55" />
                        )}
                        <div className="w-12 h-14 rounded-xl bg-secondary/40 flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-[15px] tabular-nums leading-none mt-0.5 text-foreground">{o.day}</span>
                          <span className="text-[7px] text-muted-foreground/60 font-light mt-1 uppercase tracking-wider">
                            {(isAr ? MONTH_NAMES_AR[o.month - 1] : MONTH_NAMES_EN[o.month - 1]).slice(0, 4)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-foreground leading-snug">
                            {renderHonored(isAr ? o.ar : o.en)}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className={`text-[8px] font-light px-1.5 py-0.5 rounded-md ${typeColor(o.type)}`}>
                              {typeLabel(o.type)}
                            </span>
                          </div>
                        </div>
                        <ChevronLeft className={`w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0 self-center ${isAr ? '' : 'rotate-180'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-[9px] text-muted-foreground/35 text-center font-light pt-2">
                  {isAr ? 'التواريخ تقريبية وقد تتغير برؤية الهلال' : 'Dates are approximate and subject to moon sighting'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Occasion detail modal — full description, no bullets, monochrome */}
      <AnimatePresence>
        {openOccasion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-foreground/45 backdrop-blur-lg flex items-end sm:items-center justify-center"
            onClick={() => setOpenOccasion(null)}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="bg-background rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[88vh] flex flex-col overflow-hidden"
            >
              {/* Header — neutral, no gradients */}
              <div className="relative px-5 py-5 flex-shrink-0 border-b border-border/10">
                {openOccasion.featured && (
                  <span className="absolute inset-y-0 start-0 w-[2px] bg-gold/60" />
                )}
                <button
                  onClick={() => setOpenOccasion(null)}
                  className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} px-3 h-8 rounded-full bg-secondary/40 border border-border/20 text-[11px] text-foreground/75 font-light active:scale-95`}
                >
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[9px] font-light px-2 py-0.5 rounded-md ${typeColor(openOccasion.type)}`}>
                    {typeLabel(openOccasion.type)}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground/60 font-light tabular-nums mb-1.5">
                  {openOccasion.day} {isAr ? MONTH_NAMES_AR[openOccasion.month - 1] : MONTH_NAMES_EN[openOccasion.month - 1]}
                </p>
                <h2 className={`text-[17px] text-foreground leading-snug ${isAr ? 'pl-20' : 'pr-20'}`}>
                  {renderHonored(isAr ? openOccasion.ar : openOccasion.en)}
                </h2>
              </div>

              {/* Body — full description as a single flowing paragraph */}
              <div className="flex-1 overflow-y-auto p-5">
                <p
                  className="text-foreground/90 leading-[2.1] text-[14px]"
                  style={{ textAlign: isAr ? 'justify' as const : 'left' as const, hyphens: 'auto' }}
                >
                  {renderHonored(isAr ? openOccasion.descriptionAr : openOccasion.descriptionEn)}
                </p>
                <p className="text-[9px] text-muted-foreground/35 text-center font-light mt-6 pt-4 border-t border-border/10">
                  {isAr
                    ? 'المعلومات مختصرة لأغراض التذكير — للتفصيل يُرجى الرجوع إلى المصادر المعتمدة'
                    : 'Information is summarized for remembrance — refer to authoritative sources for details'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HijriCountdown;
