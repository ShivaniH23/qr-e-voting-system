from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import uuid
import os
from dotenv import load_dotenv

load_dotenv(override=True)

app = Flask(__name__)
CORS(app)

OTP_FILE = "otp_data.json"
SESSION_FILE = "sessions.json"
VOTERS_FILE = "voters.json"

import requests

JSONBIN_API_KEY = os.getenv("JSONBIN_API_KEY")
JSONBIN_BIN_ID = os.getenv("JSONBIN_BIN_ID")

def get_remote_data():
    if not JSONBIN_API_KEY or not JSONBIN_BIN_ID:
        return None
    try:
        url = f"https://api.jsonbin.io/v3/b/{JSONBIN_BIN_ID}/latest"
        headers = {"X-Master-Key": JSONBIN_API_KEY}
        r = requests.get(url, headers=headers, timeout=5)
        if r.status_code == 200:
            return r.json().get("record", {})
    except Exception as e:
        print("Error reading from JSONbin:", e)
    return None

def save_remote_data(data):
    if not JSONBIN_API_KEY or not JSONBIN_BIN_ID:
        return False
    try:
        url = f"https://api.jsonbin.io/v3/b/{JSONBIN_BIN_ID}"
        headers = {
            "X-Master-Key": JSONBIN_API_KEY,
            "Content-Type": "application/json"
        }
        r = requests.put(url, headers=headers, json=data, timeout=5)
        return r.status_code == 200
    except Exception as e:
        print("Error writing to JSONbin:", e)
    return False

def load_json(file):
    # Try reading from remote JSONbin if configured
    remote_data = get_remote_data()
    if remote_data is not None:
        key = os.path.basename(file).replace(".json", "")
        return remote_data.get(key, {})

    # Fallback to local files
    try:
        with open(file, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def save_json(file, data):
    # Try writing to remote JSONbin if configured
    remote_data = get_remote_data()
    if remote_data is not None:
        key = os.path.basename(file).replace(".json", "")
        remote_data[key] = data
        save_remote_data(remote_data)
        return

    # Fallback to local files
    with open(file, "w") as f:
        json.dump(data, f, indent=4)

def generate_otp():
    return str(random.randint(100000, 999999))

def send_email(receiver, subject, otp, name):
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_PASSWORD")
    if not sender_email or not sender_password:
        raise ValueError("Gmail SMTP credentials are not configured. Please check the backend .env file.")
    html = f"""
    <html><body>
    <p>Hi <b>{name}</b>,</p>
    <p>Your OTP is: <b>{otp}</b></p>
    <p>Valid for 2 mins. Don't share.</p>
    <p>Thanks,<br>QR Voting System</p>
    </body></html>
    """
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = receiver
    msg.attach(MIMEText(html, "html"))
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)

@app.route("/")
def home():
    return jsonify({
        "status": "online",
        "message": "Secure QR Code E-Voting API Server is Running!",
        "version": "1.0.0"
    })

@app.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    voter_id = data.get("voter_id")
    print(f"Received request: Name = {name}, Email = {email}, Voter ID = {voter_id}")
    if not name or not email or not voter_id:
        return jsonify({"success": False, "message": "Missing name/email/voter_id"}), 400
    
    # Check if voter_id already exists in voters database
    voters = load_json(VOTERS_FILE)
    if voter_id in voters:
        if voters[voter_id].get("hasVoted"):
            return jsonify({"success": False, "message": "This Voter ID has already voted."}), 403

    # Check if email is already registered under another voter_id
    for existing_id, voter in voters.items():
        if voter.get("email") == email and existing_id != voter_id:
            return jsonify({"success": False, "message": "This email is already registered with another Voter ID."}), 400

    otp_data = load_json(OTP_FILE)
    otp = generate_otp()
    otp_data[voter_id] = {
        "name": name,
        "email": email,
        "otp": otp,
        "verified": False,
        "timestamp": datetime.now().isoformat()
    }
    try:
        send_email(email, "Your OTP for QR Voting", otp, name)
    except Exception as e:
        print(f"Email sending failed: {e}")
        return jsonify({"success": False, "message": "Failed to send OTP. Please check server SMTP configuration."}), 500
    save_json(OTP_FILE, otp_data)
    return jsonify({"success": True, "message": "OTP sent successfully."})

@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    voter_id = data.get("voter_id")
    entered_otp = data.get("otp")
    otp_data = load_json(OTP_FILE)
    user = otp_data.get(voter_id)
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404
    if user["verified"]:
        return jsonify({"success": False, "message": "Already verified."}), 403
    if user["otp"] == entered_otp:
        user["verified"] = True
        save_json(OTP_FILE, otp_data)
        
        # Write to voters.json using voter_id as the key
        voters = load_json(VOTERS_FILE)
        if voter_id not in voters:
            voters[voter_id] = {
                "name": user["name"],
                "email": user["email"],
                "hasVoted": False,
                "votedFor": ""
            }
        save_json(VOTERS_FILE, voters)
        return jsonify({"success": True, "message": "OTP verified."})
    return jsonify({"success": False, "message": "Invalid OTP."}), 401

@app.route("/generate_qr", methods=["POST"])
def generate_qr():
    data = request.get_json()
    voter_id = data.get("voter_id")
    if not voter_id:
        return jsonify({"success": False, "message": "Voter ID missing in request"}), 400
    session_id = str(uuid.uuid4())
    expiry = datetime.now() + timedelta(seconds=60)
    sessions = load_json(SESSION_FILE)
    sessions[session_id] = {
        "voter_id": voter_id,
        "expires_at": expiry.isoformat()
    }
    frontend_url = os.getenv("FRONTEND_URL")
    if frontend_url:
        qr_url = f"{frontend_url.rstrip('/')}/vote-redirect?session_id={session_id}"
    else:
        qr_url = f"http://192.168.43.130:3000/vote-redirect?session_id={session_id}"
    return jsonify({"success": True, "qr_code": qr_url})

@app.route("/validate_session", methods=["GET"])
def validate_session():
    session_id = request.args.get("session_id")
    sessions = load_json(SESSION_FILE)
    session = sessions.get(session_id)
    if not session:
        return jsonify({"success": False, "message": "Invalid session"}), 400
    if datetime.now() > datetime.fromisoformat(session["expires_at"]):
        return jsonify({"success": False, "message": "Session expired"}), 403
    voter_id = session.get("voter_id")
    if not voter_id:
        return jsonify({"success": False, "message": "No voter ID attached to session"}), 400
    voters = load_json(VOTERS_FILE)
    has_voted = voters.get(voter_id, {}).get("hasVoted", False)
    email = voters.get(voter_id, {}).get("email", "")
    return jsonify({
        "success": True,
        "voter_id": voter_id,
        "email": email,
        "hasVoted": has_voted
    })

@app.route("/submit_vote", methods=["POST"])
def submit_vote():
    data = request.get_json()
    session_id = data.get("session_id")
    vote = data.get("vote")
    sessions = load_json(SESSION_FILE)
    session = sessions.get(session_id)
    if not session:
        return jsonify({"success": False, "message": "Invalid session"}), 400
    voter_id = session.get("voter_id")
    if not voter_id:
        return jsonify({"success": False, "message": "No voter ID attached to session"}), 400
    voters = load_json(VOTERS_FILE)
    if voter_id not in voters:
        return jsonify({"success": False, "message": "Voter record not found. Please verify your OTP first."}), 400
    if voters[voter_id].get("hasVoted"):
        return jsonify({"success": False, "message": "Already voted"}), 403
    voters[voter_id]["hasVoted"] = True
    voters[voter_id]["votedFor"] = vote
    save_json(VOTERS_FILE, voters)
    return jsonify({"success": True, "message": "Vote submitted successfully."})

@app.route("/get_voters", methods=["GET"])
def get_voters():
    voters = load_json(VOTERS_FILE)
    voted_names = []
    for voter_id, v in voters.items():
        if v.get("hasVoted"):
            name = v.get("name")
            email = v.get("email")
            
            # Handle legacy records where the key was the email address
            if not email and "@" in voter_id:
                email = voter_id
            if not name:
                name = email.split("@")[0].capitalize() if email else "Anonymous"
                
            if email and email != voter_id:
                voted_names.append(f"{name} ({email} - {voter_id})")
            else:
                voted_names.append(f"{name} ({email})")
                
    return jsonify({"votedList": voted_names})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")