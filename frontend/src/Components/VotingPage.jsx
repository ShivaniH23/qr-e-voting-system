// src/components/VotingPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './VotingPage.css';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';

const VotePage = () => {
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const navigate = useNavigate();

  // Clean candidates mapping with party subtitles for interview realism
  const candidates = [
    { name: 'Alice', party: 'Democratic Alliance', initial: 'A' },
    { name: 'Bob', party: 'Progressive Liberty Party', initial: 'B' },
    { name: 'Charlie', party: 'National Coalition Union', initial: 'C' }
  ];

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sid = localStorage.getItem("session_id") || urlParams.get("session_id");
    if (!sid) {
      alert("Missing session_id.");
      navigate('/');
      return;
    }
    setSessionId(sid);
    axios.get(`${BASE_URL}/validate_session?session_id=${sid}`)
      .then(res => {
        console.log("VotePage validate response:", res.data);
        if (res.data.success) {
          if (res.data.hasVoted) {
            navigate('/already-voted');
          } else {
            setLoading(false);
          }
        } else {
          alert(res.data.message);
          navigate('/');
        }
      })
      .catch(err => {
        console.error("Error validating session:", err);
        navigate('/');
      });
  }, [navigate]);

  const handleVote = async () => {
    if (!selectedCandidate) {
      alert("Please select a candidate.");
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/submit_vote`, {
        session_id: sessionId,
        vote: selectedCandidate
      });
      if (res.data.success) {
        navigate('/thank-you');
      } else if (res.data.message === "Already voted") {
        navigate('/already-voted');
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Vote error:", err);
      alert("Error submitting vote.");
    }
  };

  if (loading) {
    return (
      <div className="vote-container">
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Validating voting session...</p>
      </div>
    );
  }

  return (
    <div className="vote-container">
      <div className="vote-card">
        <h2>Secure Voting Portal</h2>
        <p className="vote-subtitle">
          Please select your preferred candidate. You can only cast one vote per session.
        </p>

        <ul className="candidate-list">
          {candidates.map((candidate) => (
            <li key={candidate.name} className="candidate-card-wrapper">
              <div 
                className={`candidate-card ${selectedCandidate === candidate.name ? 'selected' : ''}`}
                onClick={() => setSelectedCandidate(candidate.name)}
              >
                <div className="candidate-avatar">
                  {candidate.initial}
                </div>
                <div className="candidate-info">
                  <div className="candidate-name">{candidate.name}</div>
                  <div className="candidate-party">{candidate.party}</div>
                </div>
                <input
                  type="radio"
                  name="candidate"
                  value={candidate.name}
                  checked={selectedCandidate === candidate.name}
                  readOnly
                  className="candidate-radio"
                />
              </div>
            </li>
          ))}
        </ul>

        <button className="vote-btn" onClick={handleVote} disabled={!selectedCandidate}>
          Submit Secure Vote
        </button>
      </div>
    </div>
  );
};

export default VotePage;