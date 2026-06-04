import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { FaPlus, FaEdit, FaTrash, FaStar, FaMapMarkerAlt, FaCloudUploadAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import "./Admin.css";

const ManageRestaurants = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "", cuisine: "", rating: "", location: "", image: "", description: "",
  });

  const API = "http://localhost:5000/api/admin/restaurants";

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get(API, { headers: { Authorization: `Bearer ${token}` } });
      setRestaurants(res.data);
    } catch (error) {
      toast.error("Failed to load restaurants");
    }
  };

  const resetForm = () => {
    setForm({ name: "", cuisine: "", rating: "", location: "", image: "", description: "" });
    setImageFile(null);
    setImagePreview("");
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (r) => {
    setForm({
      name: r.name, cuisine: r.cuisine, rating: r.rating, location: r.location,
      image: r.image, description: r.description,
    });
    setImageFile(null);
    setImagePreview(r.image || "");
    setEditing(r._id);
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
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
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
    const data = { ...form, image: imageUrl, rating: parseFloat(form.rating) || 0 };
    try {
      if (editing) {
        const res = await axios.put(`${API}/${editing}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRestaurants(restaurants.map((r) => (r._id === editing ? res.data : r)));
        toast.success("Restaurant updated");
      } else {
        const res = await axios.post(API, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRestaurants([res.data, ...restaurants]);
        toast.success("Restaurant added");
      }
      resetForm();
    } catch (error) {
      toast.error("Failed to save restaurant");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" and all its menu items?`)) return;
    try {
      await axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setRestaurants(restaurants.filter((r) => r._id !== id));
      toast.success("Restaurant deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Manage Restaurants</h1>
        <button className="admin-add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
          <FaPlus /> Add Restaurant
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h3>{editing ? "Edit Restaurant" : "Add New Restaurant"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="admin-form-group">
                <label>Cuisine</label>
                <input value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })} required />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
              </div>
              <div className="admin-form-group">
                <label>Rating</label>
                <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
              </div>
            </div>
            <div className="admin-form-group">
              <label>Image</label>
              <div className="image-upload-area">
                <input type="file" accept="image/*" onChange={handleImageChange} id="rest-image" className="file-input" />
                <label htmlFor="rest-image" className="upload-label">
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
                {uploading ? "Uploading..." : (editing ? "Update" : "Add") + " Restaurant"}
              </button>
              <button type="button" className="admin-cancel-btn" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-cards-grid">
        {restaurants.map((r) => (
          <div key={r._id} className="admin-restaurant-card">
            {r.image && <img src={r.image} alt={r.name} className="admin-rest-img" />}
            <div className="admin-rest-info">
              <h4>{r.name}</h4>
              <p className="admin-rest-meta">
                <span>{r.cuisine}</span>
                <span><FaStar className="star-sm" /> {r.rating}</span>
                <span><FaMapMarkerAlt /> {r.location}</span>
              </p>
              <p className="admin-rest-menu-count">{r.menu?.length || 0} menu items</p>
            </div>
            <div className="admin-rest-actions">
              <button className="admin-icon-btn edit" onClick={() => navigate(`/admin/restaurants/${r._id}/menu`)}>
                Menu
              </button>
              <button className="admin-icon-btn edit" onClick={() => openEdit(r)}>
                <FaEdit />
              </button>
              <button className="admin-icon-btn delete" onClick={() => handleDelete(r._id, r.name)}>
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageRestaurants;
