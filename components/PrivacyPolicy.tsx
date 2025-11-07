/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface PolicyProps {
  onClose: () => void;
}

const PrivacyPolicy: React.FC<PolicyProps> = ({ onClose }) => {
  return (
    <div className="policy-container">
      <h1>Privacy Policy</h1>
      <p><em>Last Updated: July 24, 2024</em></p>

      <h2>Introduction</h2>
      <p>
        This Privacy Policy describes how TRĒSOR DẼSIGN handles information when you use our exploratory creative tool. Your privacy is important to us, and our policy is simple: we do not collect any personal information from you.
      </p>

      <h2>No Personal Data Collection</h2>
      <p>
        We do not collect, store, process, or share any personal data from our users. You can use our service without creating an account or providing any personal information such as your name, email address, or IP address.
      </p>

      <h2>Data Processed by Third Parties</h2>
      <p>
        Our application uses the Google Gemini API to generate content. The topics and words you submit as prompts are sent to Google's servers to process your request and return a response. Your interactions with the Gemini API are subject to Google's Privacy Policy. We encourage you to review their policy to understand how they handle data.
      </p>

      <h2>Cookies and Local Storage</h2>
      <p>
        This website does not use cookies or local storage for tracking, advertising, or any other purpose.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Any changes will be posted on this page. Your continued use of the service after any changes constitutes your acceptance of the new Privacy Policy.
      </p>

      <div className="back-button-container">
        <button onClick={onClose} className="back-button">Back to App</button>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
