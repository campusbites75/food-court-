import React, { useState } from "react";
import axios from "axios";
import "./MonthlyReport.css";

const API_MONTHLY = "https://food-court-20n0.onrender.com/api/reports/monthly";
const API_DAILY = "https://food-court-20n0.onrender.com/api/reports/daily";

const MonthlyReport = () => {
  const [mode, setMode] = useState("monthly");
  const [date, setDate] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchReport = async () => {
    if (!date) {
      alert("Please select a date or month");
      return;
    }

    setLoading(true);
    try {
      const url =
        mode === "monthly"
          ? `${API_MONTHLY}?month=${date}`
          : `${API_DAILY}?date=${date}`;

      const res = await axios.get(url);
      setReport(res.data);
    } catch (err) {
      alert("Failed to load report");
      console.error(err);
    }
    setLoading(false);
  };

  const orders = report?.orders || [];

  const totalOrders = orders.length;
  const delivered = orders.filter(o => o.status === "delivered").length;
  const rejected = orders.filter(o => o.status === "rejected").length;

  // ✅ FIXED: Only count delivered orders
  let PackedSales = 0;
  let UnpackedSales = 0;

  const validOrders = orders.filter(
    order => order.status?.toLowerCase() === "delivered"
  );

  validOrders.forEach(order => {
    order.items?.forEach(item => {
      const amount = (item.price || 0) * (item.quantity || 1);

      const type = (item.productType || "")
        .toString()
        .trim()
        .toLowerCase();

      if (type === "packed") {
        PackedSales += amount;
      } else {
        UnpackedSales += amount;
      }
    });
  });

  const openView = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeView = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  return (
    <div className="mr-page">
      <div className="mr-header no-print">
        <h2 className="mr-title">📊 Sales Report</h2>

        <div className="mr-controls">
          <select value={mode} onChange={e => setMode(e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="daily">Daily</option>
          </select>

          {mode === "monthly" ? (
            <input type="month" value={date} onChange={e => setDate(e.target.value)} />
          ) : (
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          )}

          <button onClick={fetchReport} disabled={loading}>
            {loading ? "Loading..." : "Load Report"}
          </button>

          {report && (
            <button className="btn-print" onClick={() => window.print()}>
              Print
            </button>
          )}
        </div>
      </div>

      {!report && !loading && (
        <p className="mr-placeholder">
          Select {mode === "monthly" ? "a month" : "a date"} to view report
        </p>
      )}

      {report && (
        <div className="mr-card">
          {/* SUMMARY */}
          <h3 className="mr-section-title">Summary</h3>
          <div className="mr-grid">
            <div className="mr-box highlight">
              <h4>Total Orders</h4>
              <p>{totalOrders}</p>
            </div>
            <div className="mr-box">
              <h4>Delivered</h4>
              <p>{delivered}</p>
            </div>
            <div className="mr-box">
              <h4>Rejected</h4>
              <p>{rejected}</p>
            </div>
            <div className="mr-box highlight">
              <h4>Total Revenue</h4>
              <p>₹{report.totalRevenue || 0}</p>
            </div>
          </div>

          {/* SALES BREAKDOWN */}
          <h3 className="mr-section-title">Sales Breakdown</h3>
          <div className="mr-grid">
            <div className="mr-box Packed-box">
              <h4>📦 Packed Sales</h4>
              <p>₹{PackedSales}</p>
            </div>
            <div className="mr-box Unpacked-box">
              <h4>⚖️ Unpacked Sales</h4>
              <p>₹{UnpackedSales}</p>
            </div>
          </div>

          {/* TOP ITEMS */}
          <h3 className="mr-section-title">Top Selling Items</h3>
          <ul className="mr-list">
            {report.topItems?.length ? (
              report.topItems.map((i, idx) => (
                <li key={idx}>
                  <span>{i.name}</span>
                  <b>{i.count} sold</b>
                </li>
              ))
            ) : (
              <li>No data</li>
            )}
          </ul>

          {/* ORDERS TABLE */}
          <h3 className="mr-section-title">📋 All Orders ({orders.length})</h3>
          <div className="mr-orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td>{order._id.slice(-6)}</td>
                    <td>{order.paymentMethod === "POS" ? "POS" : "Online"}</td>
                    <td className={`status ${order.status}`}>
                      {order.status}
                    </td>
                    <td>₹{order.totalAmount || order.amount || 0}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-view" onClick={() => openView(order)}>
                        👁 View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mr-footer">
            Generated on {new Date().toLocaleString()}
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && selectedOrder && (
        <div className="modal-overlay no-print">
          <div className="modal fancy-modal">
            <div className="modal-header">
              <h3>🧾 Order Details</h3>
              <button className="modal-close" onClick={closeView}>✕</button>
            </div>

            <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <p><strong>Order ID:</strong> {selectedOrder._id}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>

              <hr />
              <h4>🍽 Items</h4>
              <ul>
                {selectedOrder.items.map((i, idx) => (
                  <li key={idx}>
                    {i.name} × {i.quantity} (
                    <span
                      style={{
                        marginLeft: "6px",
                        padding: "2px 6px",
                        borderRadius: "5px",
                        fontSize: "11px",
                        background:
                          (i.productType || "").toLowerCase() === "packed"
                            ? "#d1fae5"
                            : "#e5e7eb",
                        color:
                          (i.productType || "").toLowerCase() === "packed"
                            ? "#065f46"
                            : "#374151",
                      }}
                    >
                      {(i.productType || "").toLowerCase() === "packed"
                        ? "Packed"
                        : "Unpacked"}
                    </span>
                    )
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyReport;
