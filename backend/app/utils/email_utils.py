from flask_mail import Message
from app import mail
from flask import current_app

def send_verification_email(to_email, token):
    """
    Sends an email with a verification link to the employer.
    """
    verification_link = f"http://localhost:5000/api/auth/verify-employer/{token}"  # backend route

    msg = Message(
        subject="Verify Your Employer Account - SmartMatch",
        sender=current_app.config.get("MAIL_USERNAME"),
        recipients=[to_email],
        body=f"""
Hello,

Thank you for registering as an employer on SmartMatch.

Please verify your account by clicking the link below:

{verification_link}

This link will expire in 24 hours.

If you did not register, please ignore this email.

Best regards,
SmartMatch Team
"""
    )
    mail.send(msg)
