import React from "react";
import "./StaticPages.css";

const Privacy = () => {
  return (
    <div className="static-page">
      <h1>Privacy Policy</h1>

      <p>
        At Campus Bites, we respect your privacy and are committed to
        protecting your personal information.
      </p>

      <h3>Information We Collect</h3>
      <ul>
        <li>Name and contact details</li>
        <li>Delivery location within campus</li>
        <li>Order history</li>
      </ul>

      <h3>How We Use Your Information</h3>
      <ul>
        <li>To process and deliver your orders</li>
        <li>To improve our services</li>
        <li>To communicate order updates</li>
      </ul>

      <h3>Data Protection</h3>
      <p>
        Your data is securely stored and is never sold or shared with third
        parties without consent.
      </p>

      <p>
        By using Campus Bites, you agree to this privacy policy.
      </p>
    </div>
  );
};

export default Privacy;
