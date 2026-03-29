import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "عِتَرَةً"

interface ContactConfirmationProps {
  name?: string
}

const ContactConfirmationEmail = ({ name }: ContactConfirmationProps) => (
  <Html lang="ar" dir="rtl">
    <Head />
    <Preview>شكراً لتواصلك مع {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `شكراً لك، ${name}!` : 'شكراً لتواصلك معنا!'}
        </Heading>
        <Text style={text}>
          لقد استلمنا رسالتك وسنعود إليك في أقرب وقت ممكن.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>مع تحيات فريق {SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactConfirmationEmail,
  subject: 'شكراً لتواصلك معنا',
  displayName: 'تأكيد نموذج الاتصال',
  previewData: { name: 'أحمد' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'IBM Plex Sans Arabic', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: 'hsl(152, 42%, 22%)', margin: '0 0 20px', textAlign: 'right' as const }
const text = { fontSize: '15px', color: 'hsl(150, 10%, 45%)', lineHeight: '1.7', margin: '0 0 25px', textAlign: 'right' as const }
const hr = { borderColor: 'hsl(150, 15%, 88%)', margin: '30px 0' }
const footer = { fontSize: '13px', color: 'hsl(150, 10%, 45%)', margin: '0', textAlign: 'right' as const }
