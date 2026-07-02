import os
import smtplib
from dotenv import load_dotenv

# Force load environment variables from .env
load_dotenv(override=True)

email = os.getenv("SENDER_EMAIL")
password = os.getenv("SENDER_PASSWORD")

print("--- SMTP Debug Test ---")
print(f"Loaded SENDER_EMAIL: {email}")
print(f"Loaded SENDER_PASSWORD length: {len(password) if password else 0}")
print(f"Raw password value: '{password}'")

if not email or not password:
    print("Error: Missing email or password in environment!")
    exit(1)

try:
    print("Connecting to smtp.gmail.com:587...")
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        print("Attempting login...")
        server.login(email, password)
        print("Login SUCCESSFUL! Your SMTP App Password configuration is working perfectly.")
except Exception as e:
    print(f"Login FAILED: {e}")
