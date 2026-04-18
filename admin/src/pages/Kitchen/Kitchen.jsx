import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Kitchen.css";

const Kitchen = () => {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    try {
      const onlineRes = await axios.get(
        "https://food-court-20n0.onrender.com/api/order/kitchen"
      );
      const posRes = await axios.get(
        "https://food-court-20n0.onrender.com/api/pos/orders"
      );

      const online = onlineRes.data.orders || [];
      const pos =
        posRes.data.orders?.filter((o) => o.status === "preparing") || [];

      const posFormatted = pos.map((o) => ({ ...o, isPOS: true }));

      // POS first, then online
      setOrders([...posFormatted, ...online]);
    } catch (error) {
      console.error("Kitchen load error:", error);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const markPrepared = async (order) => {
    try {
      if (order.isPOS) {
        await axios.post("https://food-court-20n0.onrender.com/api/pos/update-status", {
          orderId: order._id,
          status: "prepared",
        });
      } else {
        await axios.post("https://food-court-20n0.onrender.com/api/order/prepared", {
          orderId: order._id,
          status: "prepared",
        });
      }

      loadOrders();
    } catch (err) {
      console.error("Prepare error:", err);
    }
  };

  return (
    <div className="kitchen-page">
      <h2 className="kitchen-title">Kitchen Orders</h2>

      {orders.length === 0 ? (
        <p className="kitchen-empty">No orders to prepare.</p>
      ) : (
        <div className="kitchen-grid">
          {orders.map((order) => (
            <div key={order._id} className="kitchen-card">
              {/* ===== Header ===== */}
              <div className="kitchen-header">
                <span className={order.isPOS ? "badge-pos" : "badge-online"}>
                  {order.isPOS ? "POS Order" : "Online Order"}
                </span>
                <span className="order-id">
                  ID: {order._id.slice(-6)}
                </span>
              </div>

              {/* ===== Items ===== */}
              <div className="kitchen-items">
                <h4>Items</h4>
                <ul>
                  {order.items?.map((i, index) => (
                    <li key={index}>
                      {i.name} × {i.quantity}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ===== Special Instructions (ONLINE ONLY) ===== */}
              {!order.isPOS && (
                <div className="kitchen-instructions-box">
                  <div className="kitchen-instructions-header">
                    ⚠ Special Instructions
                  </div>
                  <div className="kitchen-instructions-text">
                    {order.address?.specialInstructions &&
                    order.address.specialInstructions.trim() !== ""
                      ? order.address.specialInstructions
                      : "No special instructions"}
                  </div>
                </div>
              )}

              {/* ===== Action ===== */}
              <button
                className="kitchen-btn"
                onClick={() => markPrepared(order)}
              >
                Mark as Prepared
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Kitchen;
