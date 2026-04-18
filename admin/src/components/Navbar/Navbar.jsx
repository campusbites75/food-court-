import React, { useContext, useEffect, useRef } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { KitchenContext } from '../../context/KitchenContext';
import { toast } from "react-toastify";

const Navbar = () => {

  const { kitchenOpen, toggleKitchen } = useContext(KitchenContext);
  const googleBtnRef = useRef(null);

  const handleToggle = async () => {
    try {
      const newStatus = await toggleKitchen();
      toast.success(
        newStatus ? "Kitchen Opened ✅" : "Kitchen Closed ❌"
      );
    } catch (error) {
      toast.error("Something went wrong ❌");
      console.error(error);
    }
  };

  // ✅ GOOGLE SIGN-IN CALLBACK
  const handleCredentialResponse = (response) => {
    console.log("Google response:", response);

    const token = response.credential;

    toast.success("Login Successful 🎉");

    // 👉 You can send token to backend here
    // fetch("/api/auth/google", { method: "POST", body: JSON.stringify({ token }) })
  };

  // ✅ GOOGLE SIGN-IN INIT (FIXED)
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google && googleBtnRef.current) {
        clearInterval(interval);

        window.google.accounts.id.initialize({
          client_id: "850316169928-5a6nn5cq63ikm5vrdr9q5gm9mqplhohg.apps.googleusercontent.com",
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          googleBtnRef.current,
          {
            theme: "outline",
            size: "large",
          }
        );
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className='navbar'>
      <img className='logo' src={assets.logo} alt="logo" />

      <div className="navbar-right">

        {/* ✅ GOOGLE SIGN-IN BUTTON */}
        <div ref={googleBtnRef}></div>

        {/* 🔥 TOGGLE BUTTON */}
        <button
          className={`kitchen-toggle ${kitchenOpen ? "open" : "closed"}`}
          onClick={handleToggle}
        >
          <span className="toggle-dot"></span>

          {kitchenOpen === null
            ? "Loading..."
            : kitchenOpen
            ? "Kitchen Open"
            : "Kitchen Closed"}
        </button>

        <img className='profile' src={assets.profile_image} alt="profile" />
      </div>
    </header>
  );
};

export default Navbar;  
