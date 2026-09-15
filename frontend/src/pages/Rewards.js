import { useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { RewardContext } from "../context/RewardContext";
import { FaSeedling, FaFire, FaArrowUp, FaArrowDown } from "react-icons/fa";
import "./Rewards.css";

const POINT_VALUE = 0.5;

const Rewards = () => {
  const { user } = useContext(AuthContext);
  const { balance, transactions } = useContext(RewardContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);

  return (
    <div className="rewards-page">
      <div className="rewards-hero">
        <FaSeedling className="rewards-hero-icon" />
        <h1>{balance} Points</h1>
        <p>Worth ৳{(balance * POINT_VALUE).toFixed(2)} off your next order</p>
      </div>

      <div className="rewards-how">
        <h3><FaFire /> How to Earn Points</h3>
        <p>
          Every time you order a <Link to="/offers">discounted item nearing expiry</Link>, you help
          rescue food that would otherwise go to waste — and earn <strong>10 points per unit</strong> ordered.
          Redeem 100 points for ৳50 off any future order at checkout.
        </p>
      </div>

      <div className="rewards-history">
        <h3>Points History</h3>
        {transactions.length === 0 ? (
          <div className="rewards-empty">
            <p>No points activity yet. Order a Deal to get started!</p>
          </div>
        ) : (
          <div className="rewards-list">
            {transactions.map((t) => (
              <div key={t._id} className="reward-row">
                <div className={`reward-icon ${t.type}`}>
                  {t.type === "earned" ? <FaArrowUp /> : <FaArrowDown />}
                </div>
                <div className="reward-info">
                  <span className="reward-reason">{t.reason}</span>
                  <span className="reward-date">{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
                <span className={`reward-points ${t.type}`}>
                  {t.points > 0 ? "+" : ""}{t.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rewards;
