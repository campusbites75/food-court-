import React, { useContext, useState, useEffect, useRef } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import { io } from "socket.io-client";
import { ShoppingBag, LogOut } from "lucide-react";

const Navbar = ({ setShowLogin }) => {

  const [menu, setMenu] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false); // ✅ NEW

  const [kitchenOpen, setKitchenOpen] = useState(true);
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
  <span
    onClick={() => {
      setMenu("menu");
      navigate('/');
      setTimeout(() => {
        const section = document.getElementById("explore-menu");
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }}
    className={menu === "menu" ? "active" : ""}
    style={{ cursor: "pointer" }}
  >
    MENU
  </span>
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
            <div className="navbar-profile" ref={profileRef}>
              <img
                src={
                  user?.picture ||
                  `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=ff5722&color=fff`
                }
                alt="profile"
                onClick={() => setShowProfileMenu(prev => !prev)}
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
                  <li><p><strong>{user?.name || "User"}</strong></p></li>
                  <hr />

<li
  onClick={() => {
    setShowProfileMenu(false);
    navigate('/myorders');
  }}
  style={{ display: "flex", alignItems: "center", gap: "10px" }}
>
  <ShoppingBag size={18} />
  <p>Orders</p>
</li>

                  <hr />

                  <li
  onClick={logout}
  style={{ display: "flex", alignItems: "center", gap: "10px" }}
>
  <LogOut size={18} />
  <p>Logout</p>
</li> 
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Mobile Kitchen Status */}
      {!hideGreenBox && (
        <div className={`kitchen-status-mobile ${kitchenOpen ? "open" : "closed"}`}>
          {kitchenOpen ? "🟢 Kitchen Open" : "🔴 Kitchen Closed"}
        </div>
      )}

      {/* ✅ FLOATING MOBILE MENU */}
      {!hideGreenBox && (
        <>
          <div 
            className="mobile-fab"
            onClick={() => setShowMobileMenu(prev => !prev)}
          >
            {showMobileMenu ? "✕" : "☰"}
          </div>

          {showMobileMenu && (
            <div className="mobile-menu">
  <Link to="/" onClick={() => setShowMobileMenu(false)}>Home</Link>

  <span
    onClick={() => {
      setShowMobileMenu(false);
      navigate('/');
      setTimeout(() => {
        const section = document.getElementById("explore-menu");
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }}
    style={{ cursor: "pointer", padding: "14px 22px" }}
  >
    Menu
  </span>

  <a href="#footer" onClick={() => setShowMobileMenu(false)}>
    Contact Us
  </a>

  <Link to="/myorders" onClick={() => setShowMobileMenu(false)}>
    Previous Orders
  </Link>
</div>
          )}
        </>
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
