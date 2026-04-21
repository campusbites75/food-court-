import React, { useState, useEffect } from 'react';
import Home from './pages/Home/Home';
import Footer from './components/Footer/Footer';
import Navbar from './components/Navbar/Navbar';
import { Route, Routes, Navigate } from 'react-router-dom';
import Cart from './pages/Cart/Cart';
import LoginPopup from './components/LoginPopup/LoginPopup';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import MyOrders from './pages/MyOrders/MyOrders';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify/Verify';
import AdminDashboard from "./components/AdminDashboard";
import About from "./pages/About";
import Delivery from "./pages/Delivery";
import Privacy from "./pages/Privacy";

const App = () => {

  const [showLogin, setShowLogin] = useState(false);

  // 🔐 Auth state using token
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔁 Check login on app load
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setShowLogin(true); // 🔥 FORCE LOGIN POPUP
    }
  }, []);

  return (
    <>
      <ToastContainer />

      {/* 🔴 FORCE LOGIN */}
      {!isAuthenticated && (
        <LoginPopup showLogin={true} setShowLogin={setShowLogin} />
      )}

      {/* 🟢 MAIN APP ONLY IF LOGGED IN */}
      {isAuthenticated && (
        <>
          <div className="app">
            <Navbar setShowLogin={setShowLogin} />

            <Routes>

              {/* Admin Dashboard */}
              <Route path="/dashboard" element={<AdminDashboard />} />

              {/* Main Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/order" element={<PlaceOrder />} />
              <Route path="/myorders" element={<MyOrders />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/about" element={<About />} />
              <Route path="/delivery" element={<Delivery />} />
              <Route path="/privacy" element={<Privacy />} />

              {/* 🔒 Block unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </div>

          <Footer />
        </>
      )}
    </>
  );
};

export default App;
