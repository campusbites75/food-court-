import React, { useContext, useEffect, useRef } from "react";
import "./LoginPopup.css";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";

const LoginPopup = ({ showLogin = true, setShowLogin }) => {
  const { setToken, setUser, url } = useContext(StoreContext);
  const googleDivRef = useRef(null);

  // ================= GOOGLE RESPONSE =================
  const handleGoogleResponse = async (response) => {
    const googleToken = response.credential;

    try {
      const res = await axios.post(`${url}/api/user/google-login`, {
        token: googleToken,
      });

      if (res.data.success) {
        const newToken = res.data.token;
        const userData = res.data.user;

        // ✅ Save to localStorage
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));

        // ✅ Update global state
        setToken(newToken);
        setUser(userData);

        // 🛒 Merge guest cart
        const guestCart =
          JSON.parse(localStorage.getItem("guestCart")) || {};

        if (Object.keys(guestCart).length > 0) {
          await axios.post(
            `${url}/api/cart/merge`,
            { guestCart },
            {
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
            }
          );

          localStorage.removeItem("guestCart");
        }

        toast.success("Login Successful 🎉");

        if (setShowLogin) setShowLogin(false);

        // 🔁 Reload to unlock app
        window.location.reload();

      } else {
        toast.error(res.data.message || "Login failed");
      }
    } catch (err) {
      console.log(err);
      toast.error("Google login failed");
    }
  };

  // ================= GOOGLE INIT =================
  useEffect(() => {
    if (!window.google || !googleDivRef.current) return;

    googleDivRef.current.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id:
        "850316169928-5a6nn5cq63ikm5vrdr9q5gm9mqplhohg.apps.googleusercontent.com",
      callback: handleGoogleResponse,
    });

    window.google.accounts.id.renderButton(googleDivRef.current, {
      theme: "outline",
      size: "large",
      width: 300,
    });
  }, []);

  // ================= UI =================
  return (
    <div className="login-popup">
      <div className="login-popup-container">

        <div className="login-popup-title">
          <h2>Sign in to continue</h2>
        </div>

        <div
          ref={googleDivRef}
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
          }}
        ></div>

        <p style={{ marginTop: "15px", fontSize: "12px", textAlign: "center" }}>
          Please sign in with Google to use the canteen
        </p>

      </div>
    </div>
  );
};

export default LoginPopup;
