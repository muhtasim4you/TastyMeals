import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { FaStar, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import "./Admin.css";

const Stars = ({ value }) => (
  <span>
    {[1, 2, 3, 4, 5].map((n) => (
      <FaStar key={n} className={n <= value ? "star-sm" : "star-sm-empty"} />
    ))}
  </span>
);

const ManageReviews = () => {
  const { token } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data);
    } catch (error) {
      toast.error("Failed to load reviews");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this review? The restaurant's rating will be recalculated.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(reviews.filter((r) => r._id !== id));
      toast.success("Review removed");
    } catch (error) {
      toast.error("Failed to remove review");
    }
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Reviews</h1>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Restaurant</th>
              <th>Customer</th>
              <th>Food</th>
              <th>Delivery</th>
              <th>Comments</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r._id}>
                <td>
                  <strong>{r.restaurant?.name || "N/A"}</strong>
                  <br />
                  <span className="table-desc">{r.restaurant?.location || ""}</span>
                </td>
                <td>
                  <strong>{r.user?.name || "N/A"}</strong>
                  <br />
                  <span className="table-desc">{r.user?.email || ""}</span>
                </td>
                <td><Stars value={r.restaurantRating} /></td>
                <td><Stars value={r.deliveryRating} /></td>
                <td className="table-desc">
                  {r.restaurantComment && <div>Food: {r.restaurantComment}</div>}
                  {r.deliveryComment && <div>Delivery: {r.deliveryComment}</div>}
                </td>
                <td className="table-desc">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="admin-icon-btn delete" onClick={() => handleDelete(r._id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.length === 0 && (
          <p className="admin-empty-msg">No reviews submitted yet.</p>
        )}
      </div>
    </div>
  );
};

export default ManageReviews;
