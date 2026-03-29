/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="ar" dir="rtl">
    <Head />
    <Preview>تأكيد تغيير البريد الإلكتروني في عِتَرَةً</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src="https://i.ibb.co/KxbCnTRd/phonto.png" width="48" height="48" alt="عِتَرَةً" style={logo} />
        <Heading style={h1}>تأكيد تغيير البريد الإلكتروني</Heading>
        <Text style={text}>
          لقد طلبت تغيير بريدك الإلكتروني في عِتَرَةً من {email} إلى {newEmail}.
        </Text>
        <Text style={text}>اضغط على الزر أدناه لتأكيد هذا التغيير:</Text>
        <Button style={button} href={confirmationUrl}>
          تأكيد تغيير البريد
        </Button>
        <Text style={footer}>
          إذا لم تطلب هذا التغيير، يرجى تأمين حسابك فوراً.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'IBM Plex Sans Arabic', Arial, sans-serif" }
const container = { padding: '20px 25px', textAlign: 'right' as const }
const logo = { margin: '0 auto 20px', display: 'block' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a3a2a', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.8', margin: '0 0 25px' }
const button = {
  backgroundColor: 'hsl(152, 42%, 22%)',
  color: '#f7f5f0',
  fontSize: '14px',
  borderRadius: '16px',
  padding: '12px 24px',
  textDecoration: 'none',
  fontWeight: 'bold' as const,
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
