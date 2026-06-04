import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { FaCheckCircle, FaMobileAlt, FaUniversity } from "react-icons/fa";
import toast from "react-hot-toast";
import "./Checkout.css";

const Checkout = () => {
  const { user, token } = useContext(AuthContext);
  const { cart, cartTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
  });

  const [bkashData, setBkashData] = useState({ phoneNumber: "", transactionId: "" });
  const [nagadData, setNagadData] = useState({ phoneNumber: "", transactionId: "" });
  const [bankData, setBankData] = useState({
    bankName: "",
    accountNumber: "",
    transactionId: "",
  });

  const [note, setNote] = useState("");

  const deliveryFee = 2.99;
  const tax = cartTotal * 0.08;
  const total = cartTotal + deliveryFee + tax;

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (cart.items.length === 0 && !orderPlaced) {
      navigate("/cart");
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.address) {
        const a = res.data.address;
        if (a.street || a.city || a.state || a.zip) {
          setAddress({
            street: a.street || "",
            city: a.city || "",
            state: a.state || "",
            zip: a.zip || "",
          });
        }
      }
    } catch (error) {
      // silently fail
    }
  };

  useEffect(() => {
    if (user && token) fetchProfile();
  }, [user, token]);

  const validateAddress = () => {
    if (!address.street || !address.city || !address.state || !address.zip) {
      toast.error("Please fill in all address fields");
      return false;
    }
    return true;
  };

  const validatePayment = () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return false;
    }
    if (paymentMethod === "bkash") {
      if (!bkashData.phoneNumber || !bkashData.transactionId) {
        toast.error("Please fill in Bkash phone number and transaction ID");
        return false;
      }
    } else if (paymentMethod === "nagad") {
      if (!nagadData.phoneNumber || !nagadData.transactionId) {
        toast.error("Please fill in Nagad phone number and transaction ID");
        return false;
      }
    } else if (paymentMethod === "bank") {
      if (!bankData.bankName || !bankData.accountNumber || !bankData.transactionId) {
        toast.error("Please fill in all bank details");
        return false;
      }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    let paymentInfo = { method: paymentMethod };
    if (paymentMethod === "bkash") {
      paymentInfo = { ...paymentInfo, ...bkashData };
    } else if (paymentMethod === "nagad") {
      paymentInfo = { ...paymentInfo, ...nagadData };
    } else if (paymentMethod === "bank") {
      paymentInfo = { ...paymentInfo, ...bankData };
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/orders",
        {
          payment: paymentInfo,
          deliveryAddress: address,
          note,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrderId(res.data._id);
      setOrderPlaced(true);
      setStep(4);
      toast.success("Order placed successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order");
    }
  };

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="order-success">
          <FaCheckCircle className="success-icon" />
          <h2>Order Placed Successfully!</h2>
          <p>Your order has been confirmed and is being prepared.</p>
          <div className="order-id">
            Order ID: <span>{orderId}</span>
          </div>
          <div className="success-actions">
            <button className="success-btn" onClick={() => navigate("/")}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="checkout-title">Checkout</h1>

      <div className="checkout-steps">
        <div className={`step ${step >= 1 ? "active" : ""}`}>
          <span className="step-num">1</span> Delivery
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 2 ? "active" : ""}`}>
          <span className="step-num">2</span> Payment
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 3 ? "active" : ""}`}>
          <span className="step-num">3</span> Review
        </div>
      </div>

      <div className="checkout-layout">
        <div className="checkout-form">
          {step === 1 && (
            <div className="checkout-section">
              <h2>Delivery Address</h2>
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  value={address.zip}
                  onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                  placeholder="ZIP Code"
                />
              </div>
              <div className="form-group">
                <label>Order Note (optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any special delivery instructions?"
                  rows={2}
                />
              </div>
              <button
                className="next-btn"
                onClick={() => {
                  if (validateAddress()) setStep(2);
                }}
              >
                Continue to Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="checkout-section">
              <h2>Payment Method</h2>
              <div className="payment-options">
                <div
                  className={`payment-card ${paymentMethod === "bkash" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("bkash")}
                >
                  <div className="payment-card-header">
                    <FaMobileAlt className="payment-icon bkash-icon" />
                    <div>
                      <h4>Bkash</h4>
                      <p>Pay with Bkash mobile banking</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`payment-card ${paymentMethod === "nagad" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("nagad")}
                >
                  <div className="payment-card-header">
                    <FaMobileAlt className="payment-icon nagad-icon" />
                    <div>
                      <h4>Nagad</h4>
                      <p>Pay with Nagad digital payment</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`payment-card ${paymentMethod === "bank" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("bank")}
                >
                  <div className="payment-card-header">
                    <FaUniversity className="payment-icon bank-icon" />
                    <div>
                      <h4>Bank Transfer</h4>
                      <p>Pay via bank account transfer</p>
                    </div>
                  </div>
                </div>
              </div>

              {paymentMethod === "bkash" && (
                <div className="payment-details">
                  <h3>Bkash Payment Details</h3>
                  <div className="payment-instruction">
                    Send <strong>${total.toFixed(2)}</strong> to <strong>01XXXXXXXXX</strong> (Merchant)
                  </div>
                  <div className="form-group">
                    <label>Your Bkash Number</label>
                    <input
                      type="text"
                      value={bkashData.phoneNumber}
                      onChange={(e) => setBkashData({ ...bkashData, phoneNumber: e.target.value })}
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                    />
                  </div>
                  <div className="form-group">
                    <label>Transaction ID</label>
                    <input
                      type="text"
                      value={bkashData.transactionId}
                      onChange={(e) => setBkashData({ ...bkashData, transactionId: e.target.value })}
                      placeholder="Enter Bkash Transaction ID"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "nagad" && (
                <div className="payment-details">
                  <h3>Nagad Payment Details</h3>
                  <div className="payment-instruction">
                    Send <strong>${total.toFixed(2)}</strong> to <strong>01XXXXXXXXX</strong> (Merchant)
                  </div>
                  <div className="form-group">
                    <label>Your Nagad Number</label>
                    <input
                      type="text"
                      value={nagadData.phoneNumber}
                      onChange={(e) => setNagadData({ ...nagadData, phoneNumber: e.target.value })}
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                    />
                  </div>
                  <div className="form-group">
                    <label>Transaction ID</label>
                    <input
                      type="text"
                      value={nagadData.transactionId}
                      onChange={(e) => setNagadData({ ...nagadData, transactionId: e.target.value })}
                      placeholder="Enter Nagad Transaction ID"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "bank" && (
                <div className="payment-details">
                  <h3>Bank Transfer Details</h3>
                  <div className="payment-instruction">
                    Transfer <strong>${total.toFixed(2)}</strong> to TastyMeals account and provide details below
                  </div>
                  <div className="form-group">
                    <label>Bank Name</label>
                    <input
                      type="text"
                      value={bankData.bankName}
                      onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                      placeholder="Enter your bank name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Number</label>
                    <input
                      type="text"
                      value={bankData.accountNumber}
                      onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
                      placeholder="Enter your account number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Transaction ID / Reference</label>
                    <input
                      type="text"
                      value={bankData.transactionId}
                      onChange={(e) => setBankData({ ...bankData, transactionId: e.target.value })}
                      placeholder="Enter transaction reference"
                    />
                  </div>
                </div>
              )}

              <div className="step-buttons">
                <button className="back-btn" onClick={() => setStep(1)}>Back</button>
                <button
                  className="next-btn"
                  onClick={() => {
                    if (validatePayment()) setStep(3);
                  }}
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="checkout-section">
              <h2>Review Your Order</h2>

              <div className="review-block">
                <h4>Delivery Address</h4>
                <p>{address.street}, {address.city}, {address.state} {address.zip}</p>
                {note && <p className="review-note">Note: {note}</p>}
              </div>

              <div className="review-block">
                <h4>Payment Method</h4>
                <p className="review-payment-method">
                  {paymentMethod === "bkash" && `Bkash - ${bkashData.phoneNumber}`}
                  {paymentMethod === "nagad" && `Nagad - ${nagadData.phoneNumber}`}
                  {paymentMethod === "bank" && `Bank Transfer - ${bankData.bankName}`}
                </p>
              </div>

              <div className="review-block">
                <h4>Order Items</h4>
                {cart.items.map((item) => (
                  <div key={item._id} className="review-item">
                    <span className="review-item-name">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="review-item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="step-buttons">
                <button className="back-btn" onClick={() => setStep(2)}>Back</button>
                <button className="place-order-btn" onClick={handlePlaceOrder}>
                  Place Order — ${total.toFixed(2)}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="checkout-summary">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {cart.items.map((item) => (
              <div key={item._id} className="summary-item">
                <span>{item.name} x{item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
