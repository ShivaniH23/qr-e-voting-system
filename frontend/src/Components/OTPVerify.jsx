// src/components/OTPVerify.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';

const OTPVerify = () => {
const [voterId, setVoterId] = useState('');
const [otp, setOtp] = useState('');
const navigate = useNavigate();
const handleVerify = async () => {
try {
const res = await axios.post(`${BASE_URL}/verify-otp`, {voter_id: voterId, otp});
if (res.data.success) {
localStorage.setItem('voter_id', voterId);
alert('OTP Verified ✅');
navigate('/qr');
} else {
alert(res.data.message || 'OTP Verification Failed ❌');
}
} catch (error) {
console.error('OTP Verification Error:', error);
alert('Something went wrong. Please try again.');
}
};
return (
<div className="otp-verify-container">
<h2>Verify Your OTP</h2>
<input
type="text"
placeholder="Enter Student/Voter ID"
value={voterId}
onChange={(e) => setVoterId(e.target.value)}
/>
<input
type="text"
placeholder="Enter OTP"
value={otp}
onChange={(e) => setOtp(e.target.value)}
/>
<button onClick={handleVerify}>Verify OTP</button>
</div>
);
};
export default OTPVerify;