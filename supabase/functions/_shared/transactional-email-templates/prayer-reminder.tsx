import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "عِتَرَةً"

interface PrayerReminderProps {
  prayerName?: string
  prayerTime?: string
}

const PrayerReminderEmail = ({ prayerName, prayerTime }: PrayerReminderProps) => (
  <Html lang="ar" dir="rtl">
    <Head />
    <Preview>حان وقت صلاة {prayerName || 'الصلاة'} 🕌</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={logoText}>{SITE_NAME}</Text>
        </Section>
        <Hr style={divider} />
        <Heading style={h1}>🕌 نداء السماء ينتظرك</Heading>
        <Text style={text}>
          حان وقت صلاة <strong>{prayerName || 'الصلاة'}</strong>
          {prayerTime ? ` — الساعة ${prayerTime}` : ''}
        </Text>
        <Text style={quoteText}>
          «إنَّ الصَّلاةَ كانَتْ عَلَى المُؤمِنينَ كِتابًا مَوقوتًا»
        </Text>
        <Hr style={divider} />
        <Text style={footer}>
          {SITE_NAME} · منصة إسلامية شيعية
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PrayerReminderEmail,
  subject: (data: Record<string, any>) => `حان وقت صلاة ${data.prayerName || 'الصلاة'} 🕌`,
  displayName: 'تذكير بالصلاة',
  previewData: { prayerName: 'الفجر', prayerTime: '٤:٣٠' },
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
