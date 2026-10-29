import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem(
        "amsAdminToken"
      );

      const response = await fetch(
        "http://localhost:5000/api/admin/products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load products."
        );
      }

      setProducts(data.products);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="page">
        <h2>Loading Products...</h2>
      </section>
    );
  }


  const updateStock = async (productId, newStock) => {
  try {
    const token = localStorage.getItem(
      "amsAdminToken"
    );

    const response = await fetch(
      `http://localhost:5000/api/admin/products/${productId}/stock`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stock: newStock,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to update stock."
      );
    }

    alert("Stock updated successfully.");

    fetchProducts();

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};



  return (
    <section className="admin-products-page">

      <div className="admin-products-header">
        <div>
          <h1>Products</h1>
          <p>
            Manage AMS TOOLS products
          </p>
        </div>

        <Link to="/admin/products/add">
          <button>
            + ADD PRODUCT
          </button>
        </Link>
      </div>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {products.length === 0 ? (
        <div className="empty-state">
          <h2>No Products Found</h2>
        </div>
      ) : (
        <div className="admin-products-list">

          {products.map((product) => (
            <div
              className="admin-product-card"
              key={product.product_id}
            >

              <div className="admin-product-image">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                  />
                ) : (
                  <span>
                    NO IMAGE
                  </span>
                )}
              </div>

              <div className="admin-product-info">

                <div className="product-title-row">
                  <h2>{product.name}</h2>

                  <span
                    className={
                      product.active
                        ? "active-badge"
                        : "inactive-badge"
                    }
                  >
                    {product.active
                      ? "ACTIVE"
                      : "INACTIVE"}
                  </span>
                </div>

                <p>
                  {product.description}
                </p>

                <div className="admin-product-details">

                  <span>
                    Type: {product.type}
                  </span>

                  <span>
                    Price: ₹
                    {Number(
                      product.price
                    ).toFixed(2)}
                  </span>

                  <span>
                    Stock: {product.stock}
                  </span>

                  <span>
                    Discount:{" "}
                    {product.discount}%
                  </span>

                </div>

                <div className="admin-product-actions">
  <Link
    to={`/admin/products/edit/${product.product_id}`}
  >
    <button>EDIT</button>
  </Link>

  <button
  onClick={() => {
    const newStock = window.prompt(
      `Enter new stock for ${product.name}:`,
      product.stock
    );

    if (newStock === null) return;

    if (
      newStock === "" ||
      Number(newStock) < 0 ||
      !Number.isInteger(Number(newStock))
    ) {
      alert("Please enter a valid stock number.");
      return;
    }

    updateStock(
      product.product_id,
      Number(newStock)
    );
  }}
>
  STOCK
</button>
</div>

              </div>

            </div>
          ))}

        </div>
      )}

    </section>
  );
}

export default AdminProducts;