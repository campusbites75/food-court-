import React from "react";
import "./StaticPages.css";

const Delivery = () => {
  return (
    <div className="static-page">

      <h1>Pickup Information</h1>

      {/* 🔥 Highlight Notice */}
      <div className="pickup-alert">
        🚶 Please note: No delivery service available. Pickup only.
      </div>

      <p>
        Campus Bites operates on a self-service model. Customers are required
        to visit the food court and collect their orders once ready.
      </p>

      <h3>Pickup Timings</h3>
      <ul>
        <li>Monday – Saturday: 9:00 AM – 4:30 PM</li>
      </ul>

      <h3>Order Preparation Time</h3>
      <p>
        Orders are usually prepared within 5–10 minutes depending on
        preparation time and order volume.
      </p>

      <h3>Important Note</h3>
      <p>
        Please collect your order from the designated pickup counter.
        Ensure you have your order details ready for a smooth and quick experience.
      </p>

    </div>
  );
};

export default Delivery;
