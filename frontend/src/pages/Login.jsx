import { useState, useEffect } from "react";

export default function Login() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      redirectToCanteen();
    }
  }, []);

  const handleLogin = () => {
    if (!email) {
      alert("Enter email");
      return;
    }

    // Save user
    localStorage.setItem("user", email);

    redirectToCanteen();
  };

  const redirectToCanteen = () => {
    const link = localStorage.getItem("canteenLink");

    if (link) {
      window.location.href = link;
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Login to Continue</h2>

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleLogin} style={styles.button}>
          Login
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    width: "300px",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "15px 0",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#ff5722",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};
