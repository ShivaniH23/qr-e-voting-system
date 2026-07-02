// src/components/VoteRedirect.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config';

const VoteRedirect = () => {
const navigate = useNavigate();
const [loading, setLoading] = useState(true); // ✅Added
 useEffect(() => {
const fetchSession = async () => {
const params = new URLSearchParams(window.location.search);
const session_id = params.get("session_id");
if (!session_id) {
navigate("/");
return;
}
try {
const res = await axios.get(`${BASE_URL}/validate_session?session_id=${session_id}`);
console.log("Validation Responce:",res.data);
setLoading(false);
if (res.data.success) {
localStorage.setItem("session_id", session_id);
localStorage.setItem("user_email", res.data.email);
localStorage.setItem("voter_id", res.data.voter_id);
localStorage.setItem("hasVoted", res.data.hasVoted);
navigate(res.data.hasVoted ? "/already-voted" : "/vote");
} else {
alert("Invalid or expired session.");
navigate("/");
}
} catch (error) {
setLoading(false);
console.error("Error validating session:", error);
alert("Error validating session.");
navigate("/");
}
};
fetchSession();
}, [navigate]);
return (
<div style={{ textAlign: "center", padding: "2rem" }}>
{loading ? <h2>Verifying QR Code... 🗳️</h2> : null}
</div>
);
};
export default VoteRedirect;