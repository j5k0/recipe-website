import { pool } from "./pool";

export interface NotificationPreferences {
  email_notifications: boolean;
  marketing_emails: boolean;
}

export async function getPreferences(email: string): Promise<NotificationPreferences> {
  const { rows } = await pool.query<NotificationPreferences>(
    "SELECT email_notifications, marketing_emails FROM user_notification_preferences WHERE user_email = $1",
    [email]
  );
  return rows[0] ?? { email_notifications: true, marketing_emails: false };
}

export async function upsertPreferences(email: string, prefs: NotificationPreferences): Promise<void> {
  await pool.query(
    `INSERT INTO user_notification_preferences (user_email, email_notifications, marketing_emails)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_email) DO UPDATE
       SET email_notifications = EXCLUDED.email_notifications,
           marketing_emails    = EXCLUDED.marketing_emails`,
    [email, prefs.email_notifications, prefs.marketing_emails]
  );
}
