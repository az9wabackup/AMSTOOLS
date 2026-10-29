
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminAddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    type: "SINGLE",
    discount: "0",
    image_url: "",
    active: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    setError("");
    setMessage("");
    setImageFile(null);

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please select a JPG, PNG, or WEBP image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be 5 MB or less.");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setForm((previous) => ({
      ...previous,
      image_url: "",
    }));
  };

  const uploadImage = async () => {
    if (!imageFile) return form.image_url;

    setUploadingImage(true);

    try {
      const token = localStorage.getItem("amsAdminToken");
      const imageData = new FormData();
      imageData.append("image", imageFile);

      const response = await fetch(
        "http://localhost:5000/api/upload/product-image",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: imageData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Image upload failed.");
      }

      setForm((previous) => ({
        ...previous,
        image_url: data.imageUrl,
      }));

      return data.imageUrl;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("amsAdminToken");

      if (!token) {
        throw new Error("Please log in as an admin.");
      }

      // Upload image first, if one was selected.
      const imageUrl = await uploadImage();

      const response = await fetch(
        "http://localhost:5000/api/admin/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            image_url: imageUrl,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create product.");
      }

      setMessage("Product created successfully.");

      setTimeout(() => {
        navigate("/admin/products");
      }, 1000);
    } catch (err) {
      console.error("CREATE PRODUCT ERROR:", err);
      setError(err.message || "Unable to create product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-add-product-page">
      <div className="admin-add-product-header">
        <div>
          <h1>Add Product</h1>
          <p>Create a new AMS TOOLS product</p>
        </div>

        <Link to="/admin/products">
          <button type="button">← BACK</button>
        </Link>
      </div>

      <form className="admin-product-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Example: Professional Meat Knife"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter product description"
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price (₹)</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="799"
              required
            />
          </div>

          <div className="form-group">
            <label>Stock</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              min="0"
              step="1"
              placeholder="25"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Product Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
            >
              <option value="SINGLE">SINGLE</option>
              <option value="COMBO">COMBO</option>
            </select>
          </div>

          <div className="form-group">
            <label>Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={form.discount}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="product-image">Product Image</label>
          <input
            id="product-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
          />
          <small>JPG, PNG or WEBP. Maximum size: 5 MB.</small>

          {imageFile && (
            <p>Selected image: {imageFile.name}</p>
          )}

          {imageFile && (
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Selected product preview"
              style={{
                width: "160px",
                height: "160px",
                objectFit: "contain",
                marginTop: "10px",
              }}
            />
          )}

          {form.image_url && (
            <p>Image uploaded successfully.</p>
          )}
        </div>

        <label className="active-checkbox">
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={handleChange}
          />
          Product Active
        </label>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <button
          className="create-product-button"
          type="submit"
          disabled={loading || uploadingImage}
        >
          {uploadingImage
            ? "UPLOADING IMAGE..."
            : loading
              ? "CREATING..."
              : "CREATE PRODUCT"}
        </button>
      </form>
    </section>
  );
}

export default AdminAddProduct;
