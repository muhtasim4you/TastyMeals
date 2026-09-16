import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCloudUploadAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import { API_BASE } from "../../config";
import "./Admin.css";

const ManageCharities = () => {
  const { token } = useContext(AuthContext);
  const [charities, setCharities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", location: "", contactPhone: "", contactEmail: "", image: "",
  });

  const API = `${API_BASE}/api/admin/charities`;

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      const res = await axios.get(API, { headers: { Authorization: `Bearer ${token}` } });
      setCharities(res.data);
    } catch (error) {
      toast.error("Failed to load charities");
    }
  };

  const resetForm = () => {
    setForm({ name: "", description: "", location: "", contactPhone: "", contactEmail: "", image: "" });
    setImageFile(null);
    setImagePreview("");
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (c) => {
    setForm({
      name: c.name, description: c.description, location: c.location,
      contactPhone: c.contactPhone, contactEmail: c.contactEmail, image: c.image,
    });
    setImageFile(null);
    setImagePreview(c.image || "");
    setEditing(c._id);
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
    const data = { ...form, image: imageUrl };
    try {
      if (editing) {
        const res = await axios.put(`${API}/${editing}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCharities(charities.map((c) => (c._id === editing ? res.data : c)));
        toast.success("Charity updated");
      } else {
        const res = await axios.post(API, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCharities([res.data, ...charities]);
        toast.success("Charity added");
      }
      resetForm();
    } catch (error) {
      toast.error("Failed to save charity");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove partner "${name}"?`)) return;
    try {
      await axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setCharities(charities.filter((c) => c._id !== id));
      toast.success("Charity removed");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Charity Partners</h1>
        <button className="admin-add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
          <FaPlus /> Add Charity
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h3>{editing ? "Edit Charity" : "Add New Charity Partner"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="admin-form-group">
                <label>Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Contact Phone</label>
                <input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label>Contact Email</label>
                <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
              </div>
            </div>
            <div className="admin-form-group">
              <label>Image</label>
              <div className="image-upload-area">
                <input type="file" accept="image/*" onChange={handleImageChange} id="charity-image" className="file-input" />
                <label htmlFor="charity-image" className="upload-label">
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
                {uploading ? "Uploading..." : (editing ? "Update" : "Add") + " Charity"}
              </button>
              <button type="button" className="admin-cancel-btn" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-cards-grid">
        {charities.map((c) => (
          <div key={c._id} className="admin-restaurant-card">
            {c.image && <img src={c.image} alt={c.name} className="admin-rest-img" />}
            <div className="admin-rest-info">
              <h4>{c.name}</h4>
              <p className="admin-rest-meta">
                <span><FaMapMarkerAlt /> {c.location}</span>
              </p>
              {c.contactPhone && <p className="table-desc"><FaPhone /> {c.contactPhone}</p>}
              {c.contactEmail && <p className="table-desc"><FaEnvelope /> {c.contactEmail}</p>}
            </div>
            <div className="admin-rest-actions">
              <button className="admin-icon-btn edit" onClick={() => openEdit(c)}>
                <FaEdit />
              </button>
              <button className="admin-icon-btn delete" onClick={() => handleDelete(c._id, c.name)}>
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
        {charities.length === 0 && (
          <p className="admin-empty-msg">No charity partners yet. Click "Add Charity" to onboard one.</p>
        )}
      </div>
    </div>
  );
};

export default ManageCharities;
