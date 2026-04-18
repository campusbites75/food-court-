import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./Orders.css";
import { QRCodeCanvas } from "qrcode.react";


const Orders = () => {
  /* ================= ONLINE ORDERS ================= */
  const [onlineOrders, setOnlineOrders] = useState([]);
  const [rejectingOrders, setRejectingOrders] = useState([]);
  const rejectTimers = useRef({});

  /* ================= POS ORDERS ================= */
  const [posOrders, setPosOrders] = useState([]);
  const [qrOrder, setQrOrder] = useState(null);

  /* ================= MODAL ================= */
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalType, setModalType] = useState("online"); // online | pos

  const API_BASE = "https://food-court-20n0.onrender.com";

  // ONLINE APIs
  const LIST_API = `${API_BASE}/api/order/list`;
  const ACCEPT_API = `${API_BASE}/api/order/accept`;
  const REJECT_API = `${API_BASE}/api/order/reject`;
  const DELIVERED_API = `${API_BASE}/api/order/delivered`;
  const PREPARED_API = `${API_BASE}/api/order/prepared`;

  // POS APIs
  const POS_LIST_API = `${API_BASE}/api/pos/orders`;
  const POS_STATUS_API = `${API_BASE}/api/pos/update-status`;

  /* ================= LOAD ONLINE ORDERS ================= */
  const loadOrders = async () => {
    try {
      const res = await axios.get(LIST_API);
      const orders =
        res.data.data?.filter(
          (o) => o.status !== "rejected" && o.status !== "delivered"
        ) || [];
      setOnlineOrders(orders);
    } catch (err) {
      console.error("Failed to load orders", err);
    }
  };

  /* ================= LOAD POS ORDERS ================= */
  const loadPosOrders = async () => {
    try {
      const res = await axios.get(POS_LIST_API);
      const orders =
        res.data.orders?.filter(
          (o) => o.status !== "rejected" && o.status !== "delivered"
        ) || [];
      setPosOrders(orders);
    } catch (err) {
      console.error("Failed to load POS orders", err);
    }
  };

  useEffect(() => {
    loadOrders();
    loadPosOrders();

    const interval = setInterval(() => {
      loadOrders();
      loadPosOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /* ================= ONLINE ACTIONS ================= */
  const acceptOrder = async (id) => {
    if (rejectTimers.current[id]) {
      clearTimeout(rejectTimers.current[id]);
      delete rejectTimers.current[id];
      setRejectingOrders((prev) => prev.filter((x) => x !== id));
    }

    await axios.post(ACCEPT_API, { orderId: id });
    loadOrders();
    closeModal();
  };

  const rejectOrder = (id) => {
    if (rejectTimers.current[id]) return;

    setRejectingOrders((prev) => [...prev, id]);

    rejectTimers.current[id] = setTimeout(async () => {
      await axios.post(REJECT_API, { orderId: id });

      delete rejectTimers.current[id];
      setRejectingOrders((prev) => prev.filter((x) => x !== id));
      setOnlineOrders((prev) => prev.filter((o) => o._id !== id));
    }, 15000);
  };

  const deliverOrder = async (id) => {
    await axios.post(DELIVERED_API, { orderId: id });
    setOnlineOrders((prev) => prev.filter((o) => o._id !== id));
    closeModal();
  };

  const markPrepared = async (id) => {
    await axios.post(PREPARED_API, { orderId: id });
    loadOrders();
  };

  /* ================= POS ACTIONS ================= */
  const updatePosStatus = async (id, status) => {
    await axios.post(POS_STATUS_API, { orderId: id, status });
    loadPosOrders();
  };

  /* ================= MODAL ================= */
  const openViewModal = (order, type = "online") => {
    setSelectedOrder(order);
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  /* ================= HELPERS ================= */
  const renderItems = (order) => {
    if (!order.items || order.items.length === 0) return "No items";

    const grouped = {};

    order.items.forEach((item) => {
      if (grouped[item.name]) {
        grouped[item.name] += item.quantity;
      } else {
        grouped[item.name] = item.quantity;
      }
    });

    return (
      <div className="items-list">
        {Object.entries(grouped).map(([name, qty], index) => (
          <div key={index}>
            {name} × {qty}
          </div>
        ))}
      </div>
    );
  };

  const statusClass = (status) => {
    const s = status?.toLowerCase();
    if (s === "pending") return "status-pill status-pending";
    if (s === "preparing") return "status-pill status-processing";
    if (s === "prepared") return "status-pill status-prepared";
    return "status-pill status-default";
  };

  const generateUPILink = (order) => {
    const upiId = "9569763863@kotak811"; // replace with your UPI
    const amount = order.totalAmount || order.amount;

    return `upi://pay?pa=${upiId}&pn=CampusBites&am=${amount}&cu=INR`;
  };

  /* ================= RENDER ================= */
  return (
    <div className="orders-page">
      <h2 className="orders-title">Orders Dashboard</h2>

      {/* ================= ONLINE ORDERS ================= */}
      <div className="orders-table-wrapper">
        <table className="orders-table modern-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Items</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="col-action">Action</th>
            </tr>
          </thead>
          <tbody>
            {onlineOrders.map((order) => (
              <tr key={order._id}>
                <td className="bold">{order.orderNumber}</td>
                <td>{renderItems(order)}</td>
                <td className="bold">
                  {order.address?.fullName || "No Name"}
                </td>
                <td className="bold price">
                  ₹{(order.amount + (order.deliveryFee || 0)).toFixed(2)}
                </td>
               {/* ✅ ORDER STATUS */}
{/* STATUS */}
<td>
  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    
    <span className={statusClass(order.status)}>
      {rejectingOrders.includes(order._id)
        ? "Rejecting (15s)"
        : order.status}
    </span>

    {/* PAYMENT INLINE */}
    <span className="payment-pill">
      {order.paymentMethod === "COD" ? "💵 CASH" : "💳 PAID"}
    </span>

  </div>
</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-small"
                      onClick={() => openViewModal(order, "online")}
                    >
                      View
                    </button>

                    {order.status !== "prepared" ? (
                      <>
                        <button
                          className="btn-small btn-accept"
                          onClick={() => acceptOrder(order._id)}
                        >
                          Accept
                        </button>
                        <button
                          className="btn-small btn-reject"
                          onClick={() => rejectOrder(order._id)}
                        >
                          Reject
                        </button>
                        <button
                          className="btn-small btn-prepared"
                          onClick={() => markPrepared(order._id)}
                        >
                          Already Cooked
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn-small btn-delivered"
                        onClick={() => deliverOrder(order._id)}
                      >
                        Delivered
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= POS ORDERS ================= */}
      <h3 style={{ marginTop: 40 }}>POS Orders</h3>

      <div className="orders-table-wrapper">
        <table className="orders-table modern-table pos-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Items</th>
              <th>Customer</th>
              <th>Order Type</th>
              <th>Status</th>
 {/* ✅ NEW COLUMN */}
<th className="col-action">Action</th>
            </tr>
          </thead>

          <tbody>
            {posOrders.map((order) => (
              <tr key={order._id}>
                <td className="bold">{order.orderNumber}</td>
                <td>{renderItems(order)}</td>
                <td>
                  <div className="customer-cell">
                    <span>{order.customerName || "Walk-in"}</span>
                    <small>{order.customerPhone || "—"}</small>
                  </div>
                </td>
                <td className="text-cap">{order.orderType}</td>
                <td>
                  <span className={statusClass(order.status)}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons pos-actions-fixed">
                    <button
                      className="btn-small"
                      onClick={() => openViewModal(order, "pos")}
                    >
                      View
                    </button>

                    <button
                      className="btn-small btn-pay"
                      onClick={() => setQrOrder(order)}
                    >
                      QR Pay
                    </button>

                    {order.status !== "prepared" ? (
                      <button
                        className="btn-small btn-accept"
                        onClick={() => updatePosStatus(order._id, "prepared")}
                      >
                        Mark Prepared
                      </button>
                    ) : (
                      <button
                        className="btn-small btn-delivered"
                        onClick={() => updatePosStatus(order._id, "delivered")}
                      >
                        Delivered
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= ORDER DETAILS MODAL ================= */}
      {showModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal fancy-modal">
            <div className="modal-header">
              <h3>🧾 Order Details</h3>
              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {modalType === "online" ? (
                <>
                  <div className="modal-section">
                    <h4>Customer Info</h4>
                    <p>
                      <strong>Name:</strong> {selectedOrder.address?.fullName}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedOrder.address?.phone}
                    </p>
                    <p>
                      <strong>User Type:</strong>{" "}
                      {selectedOrder.address?.userType}
                    </p>
                  </div>

                  <div className="modal-section">
                    <h4>Delivery Details</h4>
                    <p>
                      <strong>Break Time:</strong>{" "}
                      {selectedOrder.address?.breakTime || "—"}
                    </p>
                  </div>

                  <div className="modal-section">
                    <h4>Items</h4>
                    {renderItems(selectedOrder)}
                  </div>

                  <div className="modal-section">
                    <h4>Total</h4>
                    ₹{selectedOrder.amount}
                  </div>
                </>
              ) : (
                <>
                  <div className="modal-section">
                    <h4>Customer Info (POS)</h4>
                    <p>
                      <strong>Name:</strong>{" "}
                      {selectedOrder.customerName || "Walk-in"}
                    </p>
                    <p>
                      <strong>Phone:</strong>{" "}
                      {selectedOrder.customerPhone || "—"}
                    </p>
                  </div>

                  <div className="modal-section">
                    <h4>Order Details</h4>
                    <p>
                      <strong>Order Type:</strong> {selectedOrder.orderType}
                    </p>
                    <p>
                      <strong>Payment:</strong> {selectedOrder.paymentMethod}
                    </p>
                    <p>
                      <strong>Status:</strong> {selectedOrder.status}
                    </p>
                  </div>

                  <div className="modal-section instructions-box">
                    <h4>⚠ Special Instructions</h4>
                    <p>{selectedOrder.instructions || "None"}</p>
                  </div>

                  <div className="modal-section">
                    <h4>Items</h4>
                    {renderItems(selectedOrder)}
                  </div>

                  {selectedOrder.couponCode && (
                    <div className="modal-section">
                      <h4>Coupon Applied</h4>
                      <p>
                        <strong>Code:</strong> {selectedOrder.couponCode}
                      </p>
                      <p>
                        <strong>Discount:</strong> ₹{selectedOrder.discount}
                      </p>
                    </div>
                  )}

                  <div className="modal-section">
                    <h4>Order Pricing</h4>
                    <p>
                      <strong>Subtotal:</strong>{" "}
                      ₹
                      {(
                        selectedOrder.amount + (selectedOrder.discount || 0)
                      ).toFixed(2)}
                    </p>

                    {selectedOrder.discount > 0 && (
                      <>
                        <p>
                          <strong>Coupon:</strong> {selectedOrder.couponCode}
                        </p>
                        <p>
                          <strong>Discount:</strong> -₹{selectedOrder.discount}
                        </p>
                      </>
                    )}

                    <p>
                      <strong>Total:</strong> ₹{selectedOrder.amount}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= QR PAYMENT MODAL ================= */}
      {qrOrder && (
        <div className="modal-overlay">
          <div className="modal fancy-modal">
            <div className="modal-header">
              <h3>Scan to Pay</h3>
              <button className="modal-close" onClick={() => setQrOrder(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body qr-modal-body">
              <QRCodeCanvas
                value={generateUPILink(qrOrder)}
                size={220}
              />

              <p style={{ marginTop: "15px", fontWeight: "600" }}>
                Amount: ₹{qrOrder.totalAmount || qrOrder.amount}
              </p>

              <p style={{ fontSize: "13px", color: "#6b7280" }}>
                Scan using any UPI app (GPay, PhonePe, Paytm)
              </p>

              <button
                className="btn-small"
                style={{ marginTop: "15px" }}
                onClick={() => setQrOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
