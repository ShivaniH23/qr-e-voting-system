import React from 'react';
import './ThankYou.css';
import { FiCheck } from 'react-icons/fi';

const ThankYou = () => {
  return (
    <div className="thankyou-container">
      <div className="thankyou-card">
        <div className="thankyou-icon-wrapper">
          <FiCheck />
        </div>
        <h1>Vote Submitted!</h1>
        <p>Your ballot has been successfully cast and encrypted.</p>
        <p>We appreciate your participation in this secure election process.</p>
      </div>
    </div>
  );
};

export default ThankYou;
