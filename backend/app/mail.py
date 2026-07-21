import smtplib
from email.message import EmailMessage

from flask import current_app


def send_email(recipient, subject, body):
    host = current_app.config.get("SMTP_HOST")
    if not host:
        current_app.logger.info("Email delivery skipped in local mode: %s", subject)
        return False
    message = EmailMessage()
    message["From"] = current_app.config["SMTP_FROM"]
    message["To"] = recipient
    message["Subject"] = subject
    message.set_content(body)
    with smtplib.SMTP(host, current_app.config["SMTP_PORT"]) as smtp:
        smtp.starttls()
        username = current_app.config.get("SMTP_USERNAME")
        if username:
            smtp.login(username, current_app.config["SMTP_PASSWORD"])
        smtp.send_message(message)
    return True
