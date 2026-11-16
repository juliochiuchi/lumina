import { supabase } from '@/utils/supabase'

export type NotifyCouncilPayload = {
  month: string
  year: string | number
  platformUrl?: string
  cashFlowName?: string
}

export type NotifyCouncilResult = {
  sent: number
  failed: number
  recipients: number
}

export const notificationService = {
  async notifyCouncil(payload: NotifyCouncilPayload): Promise<NotifyCouncilResult> {
    const { data, error } = await supabase.functions.invoke<NotifyCouncilResult>(
      'send-month-notification',
      {
        body: {
          ...payload,
          platformUrl: payload.platformUrl ?? window.location.origin,
        },
      },
    )

    if (error) {
      throw error
    }

    return data as NotifyCouncilResult
  },
}
