-- Run this migration to enable the notification preferences feature.
-- Execute once against your PostgreSQL database.

CREATE TABLE IF NOT EXISTS user_notification_preferences (
  user_email        TEXT    PRIMARY KEY,
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  marketing_emails  BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);
