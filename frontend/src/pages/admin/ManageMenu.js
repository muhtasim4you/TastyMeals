import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaStar, FaCloudUploadAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import { API_BASE } from "../../config";
import "./Admin.css";

const ManageMenu = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", price: "", image: "", category: "Main", rating: "",
    discountPercentage: "", expiryDate: "",
    calories: "", protein: "", carbs: "", fat: "",
  });

  const API = `${API_BASE}/api/admin/restaurants/${id}`;

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/restaurants/${id}`);
      setRestaurant(res.data);
    } catch (error) {
      toast.error("Failed to load restaurant");
    }
  };

  const resetForm = () => {
    setForm({
      name: "", description: "", price: "", image: "", category: "Main", rating: "",
      discountPercentage: "", expiryDate: "",
      calories: "", protein: "", carbs: "", fat: "",
    });
    setImageFile(null);
    setImagePreview("");
    setEditing(null);
    setShowForm(false);
  };

  const toDatetimeLocal = (isoDate) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const openEdit = (item) => {
    setForm({
      name: item.name, description: item.description, price: item.price,
      image: item.image, category: item.category, rating: item.rating,
      discountPercentage: item.discountPercentage || "",
      expiryDate: toDatetimeLocal(item.expiryDate),
      calories: item.calories || "", protein: item.protein || "",
      carbs: item.carbs || "", fat: item.fat || "",
    });
    setImageFile(null);
    setImagePreview(item.image || "");
    setEditing(item._id);
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return form.image;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const res = await axios.post(`${API_BASE}/api/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      return res.data.imageUrl;
    } catch (error) {
      toast.error("Image upload failed");
      return form.image;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const imageUrl = await uploadImage();
    const data = {
      ...form,
      image: imageUrl,
      price: parseFloat(form.price),
      rating: parseFloat(form.rating) || 0,
      discountPercentage: parseFloat(form.discountPercentage) || 0,
      expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
      calories: parseFloat(form.calories) || 0,
      protein: parseFloat(form.protein) || 0,
      carbs: parseFloat(form.carbs) || 0,
      fat: parseFloat(form.fat) || 0,
    };
    try {
      if (editing) {
        const res = await axios.put(`${API}/menu/${editing}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRestaurant(res.data);
        toast.success("Menu item updated");
      } else {
        const res = await axios.post(`${API}/menu`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRestaurant(res.data);
        toast.success("Menu item added");
      }
      resetForm();
    } catch (error) {
      toast.error("Failed to save menu item");
    }
  };

  const handleDelete = async (itemId, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      const res = await axios.delete(`${API}/menu/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRestaurant(res.data);
      toast.success("Item deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  if (!restaurant) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <button className="admin-back-btn" onClick={() => navigate("/admin/restaurants")}>
            <FaArrowLeft /> Back
          </button>
          <h1 className="admin-page-title">{restaurant.name} — Menu</h1>
        </div>
        <button className="admin-add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
          <FaPlus /> Add Item
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h3>{editing ? "Edit Menu Item" : "Add New Menu Item"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="admin-form-group">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option>Main</option>
                  <option>Appetizer</option>
                  <option>Sides</option>
                  <option>Dessert</option>
                  <option>Drinks</option>
                </select>
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Price (৳)</label>
                <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div className="admin-form-group">
                <label>Rating</label>
                <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Discount (%)</label>
                <input type="number" step="1" min="0" max="90" placeholder="0" value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label>Expires At (for nearing-expiry deals)</label>
                <input type="datetime-local" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Calories (kcal)</label>
                <input type="number" step="1" min="0" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label>Protein (g)</label>
                <input type="number" step="1" min="0" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Carbs (g)</label>
                <input type="number" step="1" min="0" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label>Fat (g)</label>
                <input type="number" step="1" min="0" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} />
              </div>
            </div>
            <div className="admin-form-group">
              <label>Image</label>
              <div className="image-upload-area">
                <input type="file" accept="image/*" onChange={handleImageChange} id="menu-image" className="file-input" />
                <label htmlFor="menu-image" className="upload-label">
                  <FaCloudUploadAlt className="upload-icon" />
                  <span>{imageFile ? imageFile.name : "Click to upload image"}</span>
                </label>
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
            </div>
            <div className="admin-form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="admin-save-btn" disabled={uploading}>
                {uploading ? "Uploading..." : (editing ? "Update" : "Add") + " Item"}
              </button>
              <button type="button" className="admin-cancel-btn" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Rating</th>
              <th>Nutrition</th>
              <th>Deal</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {restaurant.menu.map((item) => (
              <tr key={item._id}>
                <td>
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="table-thumb" />
                  ) : (
                    <span className="table-muted">-</span>
                  )}
                </td>
                <td>
                  <strong>{item.name}</strong>
                  <br />
                  <span className="table-desc">{item.description}</span>
                </td>
                <td><span className="cat-badge">{item.category}</span></td>
                <td className="table-price">৳{item.price.toFixed(2)}</td>
                <td><FaStar className="star-sm" /> {item.rating}</td>
                <td>
                  {item.calories > 0 ? (
                    <span className="table-desc">{item.calories} kcal · P{item.protein} C{item.carbs} F{item.fat}</span>
                  ) : (
                    <span className="table-muted">-</span>
                  )}
                </td>
                <td>
                  {item.discountPercentage > 0 && item.expiryDate ? (
                    <span className={`cat-badge ${new Date(item.expiryDate) > new Date() ? "deal-badge-active" : "deal-badge-expired"}`}>
                      {item.discountPercentage}% off · {new Date(item.expiryDate) > new Date() ? `exp. ${new Date(item.expiryDate).toLocaleString()}` : "expired"}
                    </span>
                  ) : (
                    <span className="table-muted">-</span>
                  )}
                </td>
                <td>
                  <div className="table-actions">
                    <button className="admin-icon-btn edit" onClick={() => openEdit(item)}><FaEdit /></button>
                    <button className="admin-icon-btn delete" onClick={() => handleDelete(item._id, item.name)}><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {restaurant.menu.length === 0 && (
          <p className="admin-empty-msg">No menu items yet. Click "Add Item" to create one.</p>
        )}
      </div>
    </div>
  );
};

export default ManageMenu;
