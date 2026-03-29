/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as contactConfirmation } from './contact-confirmation.tsx'
import { template as prayerReminder } from './prayer-reminder.tsx'
import { template as dailyReminder } from './daily-reminder.tsx'
import { template as quizReminder } from './quiz-reminder.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'contact-confirmation': contactConfirmation,
  'prayer-reminder': prayerReminder,
  'daily-reminder': dailyReminder,
  'quiz-reminder': quizReminder,
}
