// src/components/QRPage.jsx
import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './QRPage.css';
import { BASE_URL } from '../config';
import { FiRefreshCw, FiList } from 'react-icons/fi';

const QRPage = () => {
  const [qrData, setQrData] = useState('');
  const [timer, setTimer] = useState(60);
  const [isQRCodeGenerated, setIsQRCodeGenerated] = useState(false);

  const fetchQRCode = async () => {
    const voterId = localStorage.getItem("voter_id");
    if (!voterId) {
      alert("Voter ID not found. Please verify OTP first.");
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/generate_qr`, { voter_id: voterId });
      setQrData(res.data.qr_code);
      setIsQRCodeGenerated(true);
      setTimer(60);
    } catch (err) {
      console.error("Error fetching QR code:", err);
      alert("Failed to fetch QR code.");
    }
  };

  useEffect(() => {
    fetchQRCode();
    const interval = setInterval(fetchQRCode, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  // Compute progress bar percentage
  const progressPercentage = (timer / 60) * 100;

  return (
    <div className="qr-container">
      {/* Header / Navbar */}
      <div className="qr-header">
        <div className="qr-header-title">
          <span>🗳️</span> E-Voting System
        </div>
        <div className="qr-header-nav">
          <Link to="/voters" className="nav-link">
            <FiList style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Voters List
          </Link>
        </div>
      </div>

      {/* Main card */}
      <div className="qr-card">
        <div className="session-badge">
          <span className="badge-dot"></span>
          Active Session
        </div>

        <h2>Scan to Cast Your Vote</h2>
        <p className="qr-card-subtitle">
          Scan this QR code using a mobile device to open the secure voting interface.
        </p>

        {isQRCodeGenerated ? (
          <div className="qr-code-wrapper">
            <QRCodeCanvas value={qrData} size={200} level="M" />
          </div>
        ) : (
          <div className="qr-code-wrapper" style={{ height: '248px', width: '248px' }}>
            <p style={{ color: '#000', fontSize: '14px', fontWeight: '500' }}>Generating QR...</p>
          </div>
        )}

        {/* Timer progress bar section */}
        <div className="timer-section">
          <div className="timer-details">
            <span>Session expires in</span>
            <span>{timer}s</span>
          </div>
          <div className="timer-progress-bar">
            <div 
              className={`timer-progress ${timer < 15 ? 'warning' : ''}`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Manual Refresh */}
        <button className="refresh-btn" onClick={fetchQRCode}>
          <FiRefreshCw className="refresh-icon" /> Refresh QR Code
        </button>
      </div>
    </div>
  );
};

export default QRPage;