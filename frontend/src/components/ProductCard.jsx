import { Link } from "react-router-dom";
function ProductCard({ product, addToCart }) {
  const customer = JSON.parse(
    localStorage.getItem("amsCustomer")
  );
    const discountedPrice =
  product.price - (product.price * product.discount) / 100;
  return (
    <div className="product-card">

      <div className="product-image">

  <img
  src={product.image || "/src/assets/products/knife.jpeg"}
  alt={product.name}
/>

<button
  className="wishlist-button"
  onClick={async () => {
    if (!customer) {
      alert("Please login to use wishlist.");
      return;
    }

    console.log("WISHLIST CUSTOMER:", customer);
console.log("WISHLIST PRODUCT:", product);
console.log(
  "CUSTOMER ID:",
  customer.id
);
console.log(
  "PRODUCT ID:",
  product.product_id || product.id
);




    try {
      const response = await fetch(
        "http://localhost:5000/api/wishlist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId: customer.id,
            productId: product.product_id || product.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Added to wishlist ❤️");

    } catch (error) {
      console.error("WISHLIST ERROR:", error);
      alert("Unable to add to wishlist.");
    }
  }}
>
  ♡
</button>

</div>

      <div className="product-info">

        <span className="product-type">
  {product.type}
</span>
<h3>{product.name}</h3>

<Link
  to={`/products/${product.product_id || product.id}/reviews`}
>
  ⭐ View Customer Reviews
</Link>

<p className="description">
  {product.description}
</p>

<div className="price-section">

  {product.discount > 0 && (
    <p className="original-price">
      ₹{product.price}
    </p>
  )}

  <p className="price">
    ₹{discountedPrice.toFixed(2)}
  </p>

  {product.discount > 0 && (
    <span className="discount">
      {product.discount}% OFF
    </span>
  )}

</div>
<p className="stock">
  {product.stock > 0
    ? `${product.stock} items available`
    : "Out of Stock"}
</p>

        <button
  className="add-cart-button"
  onClick={() => addToCart(product)}
>
  ADD TO CART
</button>

      </div>

    </div>
  );
}

export default ProductCard;