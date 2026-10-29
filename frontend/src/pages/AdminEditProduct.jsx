
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function AdminEditProduct() {
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/admin/products",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("amsAdminToken")}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load products.");
        }

        const product = data.products.find(
          (item) => String(item.product_id) === String(id)
        );

        if (!product) {
          throw new Error("Product not found.");
        }

        setForm({
          name: product.name || "",
          description: product.description || "",
          price: product.price ?? "",
          stock: product.stock ?? "",
          type: product.type || "SINGLE",
          discount: product.discount ?? "0",
          image_url: product.image_url || "",
          active: Boolean(product.active),
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

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

      return data.imageUrl;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("amsAdminToken");

      if (!token) {
        throw new Error("Please log in as an admin.");
      }

      // Upload a replacement image only if one was selected.
      const imageUrl = await uploadImage();

      const response = await fetch(
        `http://localhost:5000/api/admin/products/${id}`,
        {
          method: "PUT",
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
        throw new Error(data.message || "Unable to update product.");
      }

      setForm((previous) => ({
        ...previous,
        image_url: imageUrl,
      }));
      setImageFile(null);
      setMessage("Product updated successfully.");

      setTimeout(() => {
        navigate("/admin/products");
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="page">
        <h2>Loading Product...</h2>
      </section>
    );
  }

  if (error && !form.name) {
    return (
      <section className="page">
        <h2>Unable to Load Product</h2>
        <p>{error}</p>
        <Link to="/admin/products">
          <button type="button">BACK TO PRODUCTS</button>
        </Link>
      </section>
    );
  }

  const previewUrl = imageFile
    ? URL.createObjectURL(imageFile)
    : form.image_url;

  return (
    <section className="admin-add-product-page">
      <div className="admin-add-product-header">
        <div>
          <h1>Edit Product</h1>
          <p>Update AMS TOOLS product</p>
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
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
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

          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Product preview"
              style={{
                display: "block",
                width: "160px",
                height: "160px",
                objectFit: "contain",
                marginBottom: "10px",
              }}
            />
          ) : (
            <p>No product image uploaded yet.</p>
          )}

          <input
            id="product-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
          />

          <small>
            Select a new image to replace the current one. JPG, PNG or WEBP,
            maximum 5 MB.
          </small>

          {imageFile && <p>New image selected: {imageFile.name}</p>}
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
          disabled={saving || uploadingImage}
        >
          {uploadingImage
            ? "UPLOADING IMAGE..."
            : saving
              ? "SAVING..."
              : "SAVE CHANGES"}
        </button>
      </form>
    </section>
  );
}

export default AdminEditProduct;
