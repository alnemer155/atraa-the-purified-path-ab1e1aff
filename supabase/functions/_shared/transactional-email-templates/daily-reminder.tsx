import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "عِتَرَةً"

interface DailyReminderProps {
  type?: 'dhikr_morning' | 'dhikr_evening' | 'salawat' | 'dua'
}

const CONTENT: Record<string, { emoji: string; title: string; body: string; verse: string }> = {
  dhikr_morning: {
    emoji: '🌅',
    title: 'أذكار الصباح',
    body: 'صباح الخير، لا تنسَ أذكار الصباح',
    verse: '«فَاذْكُرُونِي أَذْكُرْكُمْ»',
  },
  dhikr_evening: {
    emoji: '🌇',
    title: 'أذكار المساء',
    body: 'لا تنسَ أذكار المساء',
    verse: '«وَسَبِّحْ بِحَمْدِ رَبِّكَ بِالْعَشِيِّ وَالْإِبْكَارِ»',
  },
  salawat: {
    emoji: '🤲🏻',
    title: 'الصلاة على النبي',
    body: 'اللهم صلِّ على محمد وآل محمد',
    verse: '«إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ»',
  },
  dua: {
    emoji: '📖',
    title: 'دعاء اليوم',
    body: 'لا تنسَ قراءة دعاء اليوم',
    verse: '«ادْعُونِي أَسْتَجِبْ لَكُمْ»',
  },
}

const DailyReminderEmail = ({ type = 'dhikr_morning' }: DailyReminderProps) => {
  const content = CONTENT[type] || CONTENT.dhikr_morning
  return (
    <Html lang="ar" dir="rtl">
      <Head />
      <Preview>{content.emoji} {content.body}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logoText}>{SITE_NAME}</Text>
          </Section>
          <Hr style={divider} />
          <Heading style={h1}>{content.emoji} {content.title}</Heading>
          <Text style={text}>{content.body}</Text>
          <Text style={quoteText}>{content.verse}</Text>
          <Hr style={divider} />
          <Text style={footer}>{SITE_NAME} · منصة إسلامية شيعية</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: DailyReminderEmail,
  subject: (data: Record<string, any>) => {
    const c = CONTENT[data.type] || CONTENT.dhikr_morning
    return `${c.emoji} ${c.title}`
  },
  displayName: 'تذكير يومي',
  previewData: { type: 'dhikr_morning' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'IBM Plex Sans Arabic', Arial, sans-serif" }
const container = { padding: '24px 28px', maxWidth: '480px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, padding: '12px 0' }
const logoText = { fontSize: '20px', fontWeight: '700', color: '#2d5a3d', margin: '0' }
const divider = { borderColor: '#e8e0d4', margin: '16px 0' }
const h1 = { fontSize: '20px', fontWeight: '700', color: '#1a3a24', margin: '0 0 12px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#3a5a44', lineHeight: '1.7', margin: '0 0 16px', textAlign: 'center' as const }
const quoteText = { fontSize: '13px', color: '#6b8a74', lineHeight: '1.7', margin: '0 0 16px', textAlign: 'center' as const, fontStyle: 'italic' as const, padding: '12px 16px', backgroundColor: '#f5f2ec', borderRadius: '12px' }
const footer = { fontSize: '11px', color: '#999999', margin: '16px 0 0', textAlign: 'center' as const }
