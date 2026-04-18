import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [adminCode, setAdminCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // SEND THE SAME BODY YOU SENT IN POSTMAN
      const res = await axios.post(
        "https://food-court-20n0.onrender.com/api/admin/generate",
        { ownerName: "Test Owner" }
      );

      const validCode = res.data.code;  // example: ADM-D800SFXQ

      if (adminCode === validCode) {
        // store verification
        localStorage.setItem("adminVerified", "true");
        localStorage.setItem("adminCode", validCode);
        localStorage.setItem("ownerName", res.data.ownerName);

        navigate("/dashboard");
      } else {
        alert("Invalid Admin Code!");
      }

    } catch (error) {
      console.log(error);
      alert("Verification failed");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h2>Admin Verification</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Admin Code"
          value={adminCode}
          onChange={(e) => setAdminCode(e.target.value)}
          required
        />
        <br /><br />

        <button type="submit">Verify Admin</button>
      </form>
    </div>
  );
};

export default AdminLogin;
