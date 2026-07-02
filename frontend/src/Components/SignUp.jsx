import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SignUp.css";
import { BASE_URL } from "../config";
import { FiUser, FiMail, FiLock, FiShield, FiCheck } from "react-icons/fi";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [voterId, setVoterId] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!name || !email || !voterId) {
      setMessage("Name, Email, and Student/Voter ID are required.");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/send-otp`, {
        name,
        email,
        voter_id: voterId,
      });
      setMessage(res.data.message || "OTP sent!");
      setOtpSent(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error sending OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setMessage("Please enter the OTP.");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/verify-otp`, {
        voter_id: voterId,
        otp,
      });
      setMessage(res.data.message);
      if (res.data.success) {
        localStorage.setItem("user_email", email);
        localStorage.setItem("voter_id", voterId);
        navigate("/qr");
      }
    } catch (error) {
      setMessage("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      {/* Left panel - Hero / Banner */}
      <div className="signup-left">
        <div className="left-header">
          <span>🗳️</span> E-Voting System
        </div>
        
        <div className="left-content">
          <h1>Secure & Verified Digital Elections.</h1>
          <p>
            An institutional, database-free voting platform using time-limited QR codes and email OTP validation.
          </p>
          
          <div className="features-list">
            <div className="feature-item">
              <FiCheck className="feature-icon" />
              <span>Time-limited, session-bound QR sessions</span>
            </div>
            <div className="feature-item">
              <FiCheck className="feature-icon" />
              <span>Decentralized JSON-based file storage</span>
            </div>
            <div className="feature-item">
              <FiCheck className="feature-icon" />
              <span>Strict one-vote-per-identity enforcement</span>
            </div>
          </div>
        </div>
        
        <div className="left-footer">
          © 2026 Secure QR E-Voting System. All rights reserved.
        </div>
      </div>

      {/* Right panel - Form card */}
      <div className="signup-right">
        <div className="signup-box">
          <h2>Voter Registration</h2>
          <p className="signup-subtitle">Enter your credentials to verify identity and get your QR code.</p>
          
          {/* Name Field */}
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <div className="input-field-wrapper">
              <FiUser className="input-icon" />
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={otpSent}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-field-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={otpSent}
              />
            </div>
          </div>

          {/* Student/Voter ID Field */}
          <div className="input-group">
            <label className="input-label">Student / Voter ID</label>
            <div className="input-field-wrapper">
              <FiShield className="input-icon" />
              <input
                type="text"
                placeholder="Enter ID (e.g. STU123)"
                value={voterId}
                onChange={(e) => setVoterId(e.target.value)}
                disabled={otpSent}
              />
            </div>
          </div>

          {/* OTP Field (Shown only when OTP sent) */}
          {otpSent && (
            <div className="input-group" style={{ animation: "fadeIn 0.3s ease-in-out" }}>
              <label className="input-label">Verification Code</label>
              <div className="input-field-wrapper">
                <FiLock className="input-icon" />
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="btn-container">
            {!otpSent ? (
              <button onClick={handleSendOtp} disabled={loading}>
                {loading ? "Requesting OTP..." : "Send Verification OTP"}
              </button>
            ) : (
              <button onClick={handleVerifyOtp} disabled={loading}>
                {loading ? "Verifying..." : "Verify & Generate QR"}
              </button>
            )}
          </div>

          {/* Status Message */}
          {message && (
            <p
              className={`message ${
                message.toLowerCase().includes("error") ||
                message.toLowerCase().includes("invalid") ||
                message.toLowerCase().includes("already") ||
                message.toLowerCase().includes("failed")
                  ? "error"
                  : "success"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SignUp;
