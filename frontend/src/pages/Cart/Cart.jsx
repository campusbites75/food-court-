import React, { useContext, useState, useEffect } from "react";
import "./Cart.css";
import { StoreContext } from "../../Context/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Cart = () => {

  const {
    cartItems,
    food_list,
    removeFromCart,
    addToCart, // 👈 make sure this exists in StoreContext
    getTotalCartAmount,
    url,
    currency,
    deliveryFee
  } = useContext(StoreContext);

  const navigate = useNavigate();
  useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [discount, setDiscount] = useState(0);

  const applyCoupon = async () => {

    if (!promoCode) {
      setPromoMessage("Enter a promo code");
      return;
    }

    const usedCoupons =
      JSON.parse(localStorage.getItem("usedCoupons")) || [];

    if (usedCoupons.includes(promoCode.toUpperCase())) {
      setPromoMessage("This coupon was already used on this device");
      return;
    }

    try {

      const res = await axios.post(
        "https://food-court-20n0.onrender.com/api/coupon/apply",
        {
          code: promoCode,
          subtotal: getTotalCartAmount()
        }
      );

      if (res.data.success) {

        setDiscount(res.data.discount);

        usedCoupons.push(promoCode.toUpperCase());
        localStorage.setItem("usedCoupons", JSON.stringify(usedCoupons));

        setPromoMessage(`Coupon applied! ₹${res.data.discount} discount`);

      } else {

        setDiscount(0);
        setPromoMessage(res.data.message || "Invalid coupon");

      }

    } catch (error) {

      console.error(error);
      setPromoMessage("Server error");

    }

  };

  return (
    <div className="cart">

      <div className="cart-items">

        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
        </div>

        <br />
        <hr />

        {food_list.map((item, index) => {

          if (cartItems[item._id] > 0) {

            return (
              <div key={index}>

                <div className="cart-items-title cart-items-item">

                  <img src={url + "/images/" + item.image} alt="" />

                  <p>{item.name}</p>

                  <p>{currency}{item.price}</p>

                  {/* 🔥 NEW QUANTITY CONTROL */}
                  <div className="cart-quantity-control">

                    <button
                      onClick={() => removeFromCart(item._id)}
                    >
                      -
                    </button>

                    <span>{cartItems[item._id]}</span>

                    <button
                      onClick={() => addToCart(item._id)}
                    >
                      +
                    </button>

                  </div>

                  <p>{currency}{item.price * cartItems[item._id]}</p>

                </div>

                <hr />

              </div>
            );

          }

          return null;

        })}

      </div>


      <div className="cart-bottom">

        <div className="cart-total">

          <h2>Cart Totals</h2>

          <div>

            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>{currency}{getTotalCartAmount()}</p>
            </div>

            <hr />

            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>{currency}{getTotalCartAmount() === 0 ? 0 : deliveryFee}</p>
            </div>

            <hr />

            {discount > 0 && (
              <>
                <div className="cart-total-details">
                  <p>Discount</p>
                  <p>-{currency}{discount}</p>
                </div>
                <hr />
              </>
            )}

            <div className="cart-total-details">
              <b>Total</b>
              <b>
                {currency}
                {getTotalCartAmount() === 0
                  ? 0
                  : getTotalCartAmount() + deliveryFee - discount}
              </b>
            </div>

            {discount > 0 && (
              <p style={{ color: "green", marginTop: "10px" }}>
                🎉 You saved {currency}{discount} on this order!
              </p>
            )}

          </div>

          <button onClick={() => navigate("/order")}>
            PROCEED TO CHECKOUT
          </button>

        </div>


        <div className="cart-promocode">

          <div>

            <p>If you have a promo code, Enter it here</p>

            <div className="cart-promocode-input">

              <input
                type="text"
                placeholder="promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />

              <button onClick={applyCoupon}>
                Submit
              </button>

            </div>

            {promoMessage && (
              <p className="cart-promocode-message">
                {promoMessage}
              </p>
            )}

          </div>

        </div>

      </div>

    </div>
  );

};

export default Cart;
