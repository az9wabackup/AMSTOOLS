import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const customer = JSON.parse(
    localStorage.getItem("amsCustomer") || "null"
  );

  useEffect(() => {
    if (customer) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/wishlist/${customer.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load wishlist.");
      }

      setItems(data.wishlist || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (wishlistId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/wishlist/${wishlistId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to remove item.");
      }

      setItems((previous) =>
        previous.filter((item) => item.wishlist_id !== wishlistId)
      );
    } catch (err) {
      alert(err.message);
    }
  };

  if (!customer) {
    return (
      <section className="page">
        <h1>Please Login</h1>
        <Link to="/login">Login to view your wishlist</Link>
      </section>
    );
  }

  if (loading) {
    return <section className="page"><h2>Loading Wishlist...</h2></section>;
  }

  return (
    <section className="products-section">
      <h1>My Wishlist</h1>

      {error && <p>{error}</p>}

      {items.length === 0 ? (
        <div>
          <h2>Your wishlist is empty</h2>
          <Link to="/products">Explore Products</Link>
        </div>
      ) : (
        <div className="products-grid">
          {items.map((item) => (
            <div className="product-card" key={item.wishlist_id}>
              <div className="product-info">
                <span className="product-type">{item.type}</span>
                <h2>{item.name}</h2>
                <p>{item.description}</p>
                <p>₹{Number(item.price).toFixed(2)}</p>
                <p>
                  {item.stock > 0
                    ? `${item.stock} items available`
                    : "Out of Stock"}
                </p>

                <button
  disabled={item.stock <= 0}
  onClick={() => {
    const product = {
      id: item.product_id,
      name: item.name,
      price: Number(item.price),
      image: item.image_url || "/src/assets/products/knife.jpeg",
      description: item.description,
      stock: item.stock,
      type: item.type,
      discount: Number(item.discount),
      active: Boolean(item.active),
    };

    // We'll connect this to the existing cart next.
    window.dispatchEvent(
      new CustomEvent("ams-add-to-cart", {
        detail: product,
      })
    );

    alert("Product sent to cart!");
  }}
>
  ADD TO CART
</button>

<button
  onClick={() => removeItem(item.wishlist_id)}
>
  REMOVE
</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link to="/products">← Continue Shopping</Link>
    </section>
  );
}

export default Wishlist;