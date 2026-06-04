import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { FaUsers, FaStore, FaClipboardList, FaDollarSign, FaClock } from "react-icons/fa";
import "./Admin.css";

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch stats");
    }
  };

  if (!stats) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <FaUsers className="stat-icon" />
          <div>
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card stat-green">
          <FaStore className="stat-icon" />
          <div>
            <h3>{stats.totalRestaurants}</h3>
            <p>Restaurants</p>
          </div>
        </div>
        <div className="stat-card stat-orange">
          <FaClipboardList className="stat-icon" />
          <div>
            <h3>{stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card stat-red">
          <FaDollarSign className="stat-icon" />
          <div>
            <h3>৳{stats.totalRevenue.toFixed(2)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card stat-purple">
          <FaClock className="stat-icon" />
          <div>
            <h3>{stats.pendingOrders}</h3>
            <p>Active Orders</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
