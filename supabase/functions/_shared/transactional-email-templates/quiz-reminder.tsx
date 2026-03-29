import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "عِتَرَةً"

interface QuizReminderProps {
  type?: 'start' | 'close'
}

const QuizReminderEmail = ({ type = 'start' }: QuizReminderProps) => {
  const isStart = type === 'start'
  return (
    <Html lang="ar" dir="rtl">
      <Head />
      <Preview>{isStart ? '⏰ أسئلة اليوم تبدأ بعد ١٥ دقيقة!' : '⚡ باقي ١٠ دقائق على إغلاق أسئلة اليوم!'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logoText}>{SITE_NAME} · المسابقة</Text>
          </Section>
          <Hr style={divider} />
          <Heading style={h1}>
            {isStart ? '⏰ استعد للمسابقة!' : '⚡ الوقت ينفد!'}
          </Heading>
          <Text style={text}>
            {isStart
              ? 'أسئلة اليوم تبدأ بعد ١٥ دقيقة، استعد!'
              : 'باقي ١٠ دقائق على إغلاق أسئلة اليوم!'}
          </Text>
          <Section style={{ textAlign: 'center' as const }}>
            <Button style={button} href="https://atraa.xyz/quiz">
              ابدأ الآن
            </Button>
          </Section>
          <Hr style={divider} />
          <Text style={footer}>{SITE_NAME} · منصة إسلامية شيعية</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: QuizReminderEmail,
  subject: (data: Record<string, any>) =>
    data.type === 'close' ? '⚡ باقي ١٠ دقائق على إغلاق المسابقة!' : '⏰ مسابقة عِتَرَةً تبدأ قريباً!',
  displayName: 'تذكير المسابقة',
  previewData: { type: 'start' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'IBM Plex Sans Arabic', Arial, sans-serif" }
const container = { padding: '24px 28px', maxWidth: '480px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, padding: '12px 0' }
const logoText = { fontSize: '20px', fontWeight: '700', color: '#2d5a3d', margin: '0' }
const divider = { borderColor: '#e8e0d4', margin: '16px 0' }
const h1 = { fontSize: '20px', fontWeight: '700', color: '#1a3a24', margin: '0 0 12px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#3a5a44', lineHeight: '1.7', margin: '0 0 16px', textAlign: 'center' as const }
const button = { backgroundColor: '#2d5a3d', color: '#ffffff', padding: '12px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }
const footer = { fontSize: '11px', color: '#999999', margin: '16px 0 0', textAlign: 'center' as const }
