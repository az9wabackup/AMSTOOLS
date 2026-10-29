import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import ProductCard from "./components/ProductCard";

import knifeImage from "./assets/products/knife.jpeg";
import peelerImage from "./assets/products/peeler.jpeg";
import comboImage from "./assets/products/combo.jpeg";

const products = [
  {
    id: 1,
    name: "Professional Meat Knife",
    price: 799,
    image: knifeImage,
    description: "Sharp and durable knife for professional meat cutting.",
    stock: 25,
    type: "SINGLE",
    discount: 10,
    active: true,
  },
  {
    id: 2,
    name: "Professional Peeler",
    price: 399,
    image: peelerImage,
    description: "Strong and easy-to-use peeler for daily kitchen work.",
    stock: 40,
    type: "SINGLE",
    discount: 0,
    active: true,
  },
  {
    id: 3,
    name: "Knife & Peeler Combo",
    price: 1099,
    image: comboImage,
    description: "A useful combination of professional knife and peeler.",
    stock: 15,
    type: "COMBO",
    discount: 15,
    active: true,
  },
];


function Home() {
  return (
    <div className="page">
      <h1>AMS TOOLS</h1>
      <p>Welcome to AMS TOOLS.</p>
    </div>
  );
}

function Products() {
  return (
    <div className="page">
      <h1>Products</h1>
      <p>Our products will appear here.</p>
    </div>
  );
}


function App() {

  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const addToCart = (product) => {
  const existingProduct = cart.find(
    (item) => item.id === product.id
  );

  if (existingProduct) {
    setCart(
      cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  } else {
    setCart([...cart, { ...product, quantity: 1 }]);
  }
};

const cartTotal = cart.reduce(
  (total, item) => total + item.price * item.quantity,
  0
);


  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          AMS TOOLS
        </div>

        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">Products</a>
          <a href="#">About Us</a>
          <a href="#">Contact</a>
          <button className="cart-button">
  🛒 {cart.length}
</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <p className="shop-name">APSAR MUTTON SHOP</p>

          <h1>AMS TOOLS</h1>

          <p className="hero-description">
            Tools built for the trade.
          </p>

          <button className="explore-button">
            Explore Products
          </button>
        </div>
      </section>

      {/* SHOP BY TYPE */}
      <section className="shop-section">
        <h2>Shop by Type</h2>

        <div className="type-container">

          <div className="type-card">
            <h3>SINGLES</h3>
            <p>Individual professional tools</p>
            <button>View Singles</button>
          </div>

          <div className="type-card">
            <h3>COMBOS</h3>
            <p>Useful tool combinations</p>
            <button>View Combos</button>
          </div>

        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="products-section">
        <h2>Featured Products</h2>

        <div className="products-grid">

          {products
  .filter((product) => product.active)
  .map((product) => (
    <ProductCard
  key={product.id}
  product={product}
  addToCart={addToCart}
/>
  ))}
          
        </div>
      </section>



      {/* CART */}
<section className="cart-section">
  <h2>Your Cart</h2>

  {cart.length === 0 ? (
    <p>Your cart is empty.</p>
  ) : (
    <div className="cart-items">

      {cart.map((item) => (
        <div className="cart-item" key={item.id}>

          <img src={item.image} alt={item.name} />

          <div className="cart-item-info">
            <h3>{item.name}</h3>

            <p>₹{item.price}</p>

            <div className="quantity-controls">

              <button
                onClick={() => {
                  setCart(
                    cart
                      .map((product) =>
                        product.id === item.id
                          ? {
                              ...product,
                              quantity: product.quantity - 1,
                            }
                          : product
                      )
                      .filter((product) => product.quantity > 0)
                  );
                }}
              >
                −
              </button>

              <span>{item.quantity}</span>

              <button
                onClick={() => {
                  setCart(
                    cart.map((product) =>
                      product.id === item.id
                        ? {
                            ...product,
                            quantity: product.quantity + 1,
                          }
                        : product
                    )
                  );
                }}
              >
                +
              </button>

            </div>

            <button
              className="remove-button"
              onClick={() => {
                setCart(
                  cart.filter(
                    (product) => product.id !== item.id
                  )
                );
              }}
            >
              Remove
            </button>

          </div>

        </div>
      ))}


      <div className="cart-summary">
      <h3>Total: ₹{cartTotal.toFixed(2)}</h3>

  <button
  className="checkout-button"
  onClick={() => setShowCheckout(true)}>
  PROCEED TO CHECKOUT
  </button>
</div>


{showCheckout && (
  <section className="checkout-section">

    <h2>Checkout</h2>

    <div className="checkout-form">

      <input
        type="text"
        placeholder="Full Name"
      />

      <input
        type="tel"
        placeholder="Phone Number"
      />

      <textarea
        placeholder="Delivery Address"
        rows="4"
      />

      <input
        type="text"
        placeholder="City"
      />

      <input
        type="text"
        placeholder="State"
      />

      <input
        type="text"
        placeholder="PIN Code"
      />

      <h3>
        Order Total: ₹{cartTotal.toFixed(2)}
      </h3>

      <button
  className="place-order-button"
  onClick={() => setShowPayment(true)}
>
  CONTINUE TO PAYMENT
</button>

    </div>

  </section>
)}



{showPayment && (
  <section className="payment-section">

    <h2>Payment</h2>

    <div className="payment-card">

      <h3>UPI Payment</h3>

      <p>Order Total</p>

      <h2>₹{cartTotal.toFixed(2)}</h2>

      <div className="qr-placeholder">
        QR CODE
      </div>

      <p className="upi-text">
        Scan the QR code using any UPI app
      </p>

      <p>
        Google Pay • PhonePe • Paytm • BHIM
      </p>

      <button
  className="pay-button"
  onClick={() => setOrderPlaced(true)}
>
  I HAVE PAID
</button>

    </div>

  </section>
)}


{orderPlaced && (
  <section className="order-success">

    <div className="success-card">

      <div className="success-icon">
        ✓
      </div>

      <h2>Order Placed Successfully!</h2>

      <p>
        Thank you for shopping with AMS TOOLS.
      </p>

      <p>
        Your order will be processed shortly.
      </p>

      <button
        className="continue-shopping-button"
        onClick={() => {
          setCart([]);
          setShowCheckout(false);
          setShowPayment(false);
          setOrderPlaced(false);
        }}
      >
        CONTINUE SHOPPING
      </button>

    </div>

  </section>
)}



    </div>
  )}
</section>

    </div>
  );
}

export default App;