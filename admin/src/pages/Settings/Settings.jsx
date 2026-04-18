import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Settings.css";

const Settings = () => {

  const SETTINGS_API = "https://food-court-20n0.onrender.com/api/settings";
  const COUPON_API = "https://food-court-20n0.onrender.com/api/coupon";

  const [deliveryFee, setDeliveryFee] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [coupons, setCoupons] = useState([]);

  // LOAD DELIVERY FEE
  const loadSettings = async () => {
    try {
      const res = await axios.get(`${SETTINGS_API}`);
      if (res.data.deliveryFee !== undefined) {
        setDeliveryFee(res.data.deliveryFee);
      }
    } catch (error) {
      setSavedMessage("Failed to load settings");
    }
    setLoading(false);
  };

  // LOAD COUPONS
  const loadCoupons = async () => {
    try {
      const res = await axios.get(`${COUPON_API}/list`);
      if (res.data.success) {
        setCoupons(res.data.coupons);
      }
    } catch (error) {
      console.log("Failed to load coupons");
    }
  };

  // SAVE DELIVERY FEE
  const saveSettings = async () => {
    setSaving(true);
    setSavedMessage("");

    try {
      const res = await axios.post(`${SETTINGS_API}/update-delivery-fee`, {
        deliveryFee: Number(deliveryFee),
      });

      if (res.data.success) {
        setSavedMessage("Delivery fee updated successfully!");
      } else {
        setSavedMessage("Failed to update delivery fee.");
      }

    } catch (error) {
      setSavedMessage("Server error. Try again.");
    }

    setSaving(false);
  };

  // CREATE COUPON
  const createCoupon = async () => {

    setCouponMessage("");

    if (!couponCode || !discountAmount || !minOrderAmount) {
      setCouponMessage("Please fill all coupon fields");
      return;
    }

    try {

      const res = await axios.post(`${COUPON_API}/create`, {
        code: couponCode,
        discountAmount: Number(discountAmount),
        minOrderAmount: Number(minOrderAmount)
      });

      if (res.data.success) {

        setCouponMessage("Coupon created successfully!");

        setCouponCode("");
        setDiscountAmount("");
        setMinOrderAmount("");

        loadCoupons();

      } else {
        setCouponMessage(res.data.message || "Coupon creation failed");
      }

    } catch (error) {
      setCouponMessage("Server error while creating coupon");
    }
  };

  // DELETE COUPON
  const deleteCoupon = async (id) => {

    const confirmDelete = window.confirm("Delete this coupon?");
    if (!confirmDelete) return;

    try {

      const res = await axios.post(`${COUPON_API}/delete`, { id });

      if (res.data.success) {
        loadCoupons();
      }

    } catch (error) {
      alert("Failed to delete coupon");
    }

  };

  useEffect(() => {
    loadSettings();
    loadCoupons();
  }, []);

  if (loading) {
    return (
      <div className="settings-page">
        <p className="settings-loading">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">

      <h2 className="settings-title">Settings</h2>

      <div className="settings-container">

        {/* DELIVERY FEE */}
        <div className="settings-card">

          <h3 className="settings-subtitle">Delivery Fee</h3>

          <label className="settings-label">Amount (₹)</label>

          <input
            type="number"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
            className="settings-input"
          />

          <button
            className="settings-btn"
            onClick={saveSettings}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {savedMessage && (
            <p className="settings-success">{savedMessage}</p>
          )}

        </div>


        {/* CREATE COUPON */}
        <div className="settings-card">

          <h3 className="settings-subtitle">Create Coupon</h3>

          <label className="settings-label">Coupon Code</label>

          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="settings-input"
            placeholder="CAMPUS50"
          />

          <label className="settings-label">Discount Amount (₹)</label>

          <input
            type="number"
            value={discountAmount}
            onChange={(e) => setDiscountAmount(e.target.value)}
            className="settings-input"
            placeholder="50"
          />

          <label className="settings-label">Minimum Order Amount (₹)</label>

          <input
            type="number"
            value={minOrderAmount}
            onChange={(e) => setMinOrderAmount(e.target.value)}
            className="settings-input"
            placeholder="200"
          />

          <button
            className="settings-btn"
            onClick={createCoupon}
          >
            Create Coupon
          </button>

          {couponMessage && (
            <p className="settings-success">{couponMessage}</p>
          )}

        </div>


        {/* COUPON LIST */}
        <div className="settings-card">

          <h3 className="settings-subtitle">Created Coupons</h3>

          {coupons.length === 0 ? (
            <p>No coupons created</p>
          ) : (

            <div className="coupon-list">

              {coupons.map((coupon) => (

                <div key={coupon._id} className="coupon-item">

                  <div className="coupon-info">
                    <b>{coupon.code}</b> | ₹{coupon.discountAmount} | Min ₹{coupon.minOrderAmount}
                  </div>

                  <button
                    className="coupon-delete-btn"
                    onClick={() => deleteCoupon(coupon._id)}
                  >
                    Delete
                  </button>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default Settings;
