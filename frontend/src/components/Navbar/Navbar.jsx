import React, { useContext, useState, useEffect, useRef } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import { io } from "socket.io-client";
const Navbar = ({ setShowLogin }) => {

  const [menu, setMenu] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [kitchenOpen, setKitchenOpen] = useState(true); // ✅ Kitchen status

  const profileRef = useRef(null);

  const {
    getTotalCartAmount,
    token,
    setToken,
    user,
    setUser
  } = useContext(StoreContext);

  const navigate = useNavigate();
  const location = useLocation();

  const hideGreenBox = location.pathname === "/select";

  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminKey, setAdminKey] = useState("");

  // 🔥 Fetch kitchen status
  useEffect(() => {
    const fetchKitchenStatus = async () => {
      try {
        const res = await fetch("https://food-court-20n0.onrender.com/api/settings");
        const data = await res.json();
        setKitchenOpen(data.kitchenOpen);
      } catch (err) {
        console.error("Failed to fetch kitchen status", err);
      }
    };

    fetchKitchenStatus();
  }, []);
// 🔥 LIVE SOCKET SYNC
useEffect(() => {
  const socket = io("https://food-court-20n0.onrender.com");

  socket.on("kitchenStatusUpdated", (status) => {
    console.log("🔥 Live update received:", status);
    setKitchenOpen(status);
  });

  return () => socket.disconnect();
}, []);
  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken("");
    setUser(null);

    setShowProfileMenu(false);
    window.location.reload();
  };

  return (
    <>
      <div className={`navbar ${scrolled ? "scrolled" : ""}`}>

        {/* Logo */}
        <Link to="/">
          <img className="logo" src={assets.logo} alt="logo" />
        </Link>

        {/* Menu */}
        {!hideGreenBox && (
          <ul className="navbar-menu">
            <li>
              <Link to="/" onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>
                HOME
              </Link>
            </li>

            <li>
              <a href="#explore-menu" onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>
                MENU
              </a>
            </li>

            <li>
              <a href="#footer" onClick={() => setMenu("contact")} className={menu === "contact" ? "active" : ""}>
                CONTACT US
              </a>
            </li>

            <li>
              <Link to="/myorders" onClick={() => setMenu("previous")} className={menu === "previous" ? "active" : ""}>
                PREVIOUS ORDERS
              </Link>
            </li>
          </ul>
        )}

        {/* Right Section */}
        <div className="navbar-right">

          {/* ✅ Kitchen Status (Desktop) */}
          {!hideGreenBox && (
            <div className={`kitchen-status ${kitchenOpen ? "open" : "closed"}`}>
              {kitchenOpen ? "🟢 Open" : "🔴 Closed"}
            </div>
          )}

          {!hideGreenBox && (
            <Link to="/cart" className="navbar-search-icon">
              <img src={assets.basket_icon} alt="cart" />
              {getTotalCartAmount() > 0 && <div className="dot"></div>}
            </Link>
          )}

          {!hideGreenBox && (
            <button
              className="admin-btn"
              onClick={() => setShowAdminAuth(true)}
            >
              Admin
            </button>
          )}

          {!token ? (
            <button 
              className="signin-btn"
              onClick={() => setShowLogin(true)}
            >
              Sign In
            </button>
          ) : (
            <div
              className="navbar-profile"
              ref={profileRef}
            >
              <img
                src={
                  user?.picture ||
                  `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=ff5722&color=fff`
                }
                alt="profile"
                onClick={() => setShowProfileMenu(prev => !prev)}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=ff5722&color=fff`;
                }}
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  cursor: "pointer"
                }}
              />

              {showProfileMenu && (
                <ul className="navbar-profile-dropdown">

                  <li style={{ cursor: "default" }}>
                    <p><strong>{user?.name || "User"}</strong></p>
                  </li>

                  <hr />

                  <li onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/myorders');
                  }}>
                    <img src={assets.bag_icon} alt="" />
                    <p>Orders</p>
                  </li>

                  <hr />

                  <li onClick={logout}>
                    <img src={assets.logout_icon} alt="" />
                    <p>Logout</p>
                  </li>

                </ul>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ✅ Mobile Kitchen Status Bar */}
      {!hideGreenBox && (
        <div className={`kitchen-status-mobile ${kitchenOpen ? "open" : "closed"}`}>
          {kitchenOpen ? "🟢 Kitchen Open" : "🔴 Kitchen Closed"}
        </div>
      )}

      {/* Admin Popup */}
      {showAdminAuth && (
        <div className="admin-overlay">
          <div className="admin-modal">
            <h3>Admin Access</h3>

            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter access code"
            />

            <button
              className="admin-enter-btn"
              onClick={() => {
                if (adminKey === "SRFOODCOURT26") {
                  window.location.href = "https://campusbitefoodcourtadmin.vercel.app";
                } else {
                  alert("Invalid Admin Code");
                }
              }}
            >
              Enter
            </button>

            <button
              className="admin-cancel-btn"
              onClick={() => setShowAdminAuth(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
