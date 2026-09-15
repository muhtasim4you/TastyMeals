import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { FaStar, FaMapMarkerAlt, FaCloudUploadAlt, FaClipboardList } from "react-icons/fa";
import toast from "react-hot-toast";
import "../admin/Admin.css";

const MerchantDashboard = () => {
  const { token } = useContext(AuthContext);
  const [restaurant, setRestaurant] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", cuisine: "", location: "", image: "", description: "" });

  const API = "http://localhost:5000/api/merchant/restaurant";

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    try {
      const res = await axios.get(API, { headers: { Authorization: `Bearer ${token}` } });
      setRestaurant(res.data);
      setForm({
        name: res.data.name, cuisine: res.data.cuisine, location: res.data.location,
        image: res.data.image, description: res.data.description,
      });
      setImagePreview(res.data.image || "");
    } catch (error) {
      toast.error("Failed to load your restaurant");
    }
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
    setSaving(true);
    const imageUrl = await uploadImage();
    try {
      const res = await axios.put(API, { ...form, image: imageUrl }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRestaurant(res.data);
      setForm({
        name: res.data.name, cuisine: res.data.cuisine, location: res.data.location,
        image: res.data.image, description: res.data.description,
      });
      setImageFile(null);
      toast.success("Restaurant profile updated");
    } catch (error) {
      toast.error("Failed to update restaurant");
    } finally {
      setSaving(false);
    }
  };

  if (!restaurant) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">My Restaurant</h1>
        <Link to="/merchant/menu" className="admin-add-btn">
          <FaClipboardList /> Manage Menu ({restaurant.menu?.length || 0})
        </Link>
      </div>

      <div className="admin-form-card">
        <h3>Restaurant Profile</h3>
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
          <div className="admin-form-group">
            <label>Location</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
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
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-save-btn" disabled={uploading || saving}>
              {uploading ? "Uploading..." : saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-restaurant-card merchant-preview-card">
        {restaurant.image && <img src={restaurant.image} alt={restaurant.name} className="admin-rest-img" />}
        <div className="admin-rest-info">
          <h4>{restaurant.name}</h4>
          <p className="admin-rest-meta">
            <span>{restaurant.cuisine}</span>
            <span><FaStar className="star-sm" /> {restaurant.rating}</span>
            <span><FaMapMarkerAlt /> {restaurant.location}</span>
          </p>
          <p className="admin-rest-menu-count">{restaurant.menu?.length || 0} menu items</p>
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;
