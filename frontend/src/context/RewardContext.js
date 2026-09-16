import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { API_BASE } from "../config";

export const RewardContext = createContext();

export const RewardProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const API = `${API_BASE}/api/rewards`;

  useEffect(() => {
    if (user && token) {
      fetchRewards();
    } else {
      setBalance(0);
      setTransactions([]);
    }
  }, [user, token]);

  const fetchRewards = async () => {
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBalance(res.data.balance);
      setTransactions(res.data.transactions);
    } catch (error) {
      console.error("Failed to fetch rewards");
    }
  };

  return (
    <RewardContext.Provider value={{ balance, transactions, fetchRewards }}>
      {children}
    </RewardContext.Provider>
  );
};
