import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const OrderConfirmed = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{
      height: "80vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <h1 style={{ color: "green" }}>✅ Order Confirmed!</h1>
      <p>Your order has been placed successfully.</p>
      <p><strong>Order ID:</strong> {id}</p>

      <button 
        onClick={() => navigate("/")}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#ff4d4f",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Go to Home
      </button>
    </div>
  );
};

export default OrderConfirmed;