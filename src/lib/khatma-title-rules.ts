/**
 * Client-side rules for khatma dedication titles.
 *
 * Constraints (per product spec):
 *  - Maximum 30 words.
 *  - Only Arabic letters + spaces + the ﷺ glyph (U+FDFA) are allowed.
 *  - No digits, punctuation, Latin letters, or symbols of any kind.
 *  - Allowed phrases (informational, not enforced wording): ﷺ, الطفل/الطفلة,
 *    الحاج/الحاجة, والدي/والدتي, جدي/جدتي, عمي/عمتي, ابن عمي/ابن عمتي,
 *    ابن خالي/ابن خالتي, الأئمة المعصومين.
 */

const MAX_WORDS = 30;

// Arabic letter range (U+0600–U+06FF) + Arabic Presentation Forms-A (U+FDF0–U+FDFF
// covers ﷺ U+FDFA), + tatweel/space. No digits, no Arabic-Indic digits, no punctuation.
const ALLOWED = /^[\u0600-\u06FF\u0750-\u077F\uFDF0-\uFDFF\u200F\u200E ]+$/;

// Explicitly ban: ASCII digits, Arabic-Indic digits, Latin letters, and any
// punctuation/symbol marks.
const BANNED = /[0-9\u0660-\u0669\u06F0-\u06F9A-Za-z!-\/:-@\[-`{-~،؛؟…ـ.]/;

export interface TitleCheck {
  ok: boolean;
  reason?: string;
  wordCount: number;
}

export function checkKhatmaTitle(raw: string): TitleCheck {
  const trimmed = raw.trim().replace(/\s+/g, ' ');
  if (!trimmed) return { ok: false, reason: 'الرجاء كتابة العنوان', wordCount: 0 };
  if (trimmed.length < 4) return { ok: false, reason: 'العنوان قصير جداً', wordCount: 0 };

  if (BANNED.test(trimmed)) {
    return {
      ok: false,
      reason: 'لا يُسمح بالأرقام أو النقاط أو أي رموز — حروف عربية ومسافات فقط',
      wordCount: trimmed.split(' ').length,
    };
  }
  if (!ALLOWED.test(trimmed)) {
    return {
      ok: false,
      reason: 'يُسمح بالحروف العربية والمسافات فقط',
      wordCount: trimmed.split(' ').length,
    };
  }

  const words = trimmed.split(' ').filter(Boolean);
  if (words.length > MAX_WORDS) {
    return {
      ok: false,
      reason: `الحد الأقصى ${MAX_WORDS} كلمة (الحالي ${words.length})`,
      wordCount: words.length,
    };
  }
  return { ok: true, wordCount: words.length };
}

export const TITLE_MAX_WORDS = MAX_WORDS;

export const ALLOWED_PHRASES = [
  'ﷺ (الصلاة على النبي)',
  'الطفل / الطفلة',
  'الحاج / الحاجة',
  'والدي / والدتي',
  'جدي / جدتي',
  'عمي / عمتي',
  'ابن عمي / ابن عمتي',
  'ابن خالي / ابن خالتي',
  'الأئمة المعصومين',
];
