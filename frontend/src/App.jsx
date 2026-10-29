import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import ProductCard from "./components/ProductCard";


import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminAddProduct from "./pages/AdminAddProduct";
import AdminEditProduct from "./pages/AdminEditProduct";
import AdminOrders from "./pages/AdminOrders";
import AdminOrderDetails from "./pages/AdminOrderDetails";
import AdminCustomers from "./pages/AdminCustomers";
import AdminCustomerOrders from "./pages/AdminCustomerOrders";
import AdminReports from "./pages/AdminReports";
import Wishlist from "./pages/Wishlist";
import AdminReviews from "./pages/AdminReviews";
import ProductReviews from "./pages/ProductReviews";



import knifeImage from "./assets/products/knife.jpeg";
import peelerImage from "./assets/products/peeler.jpeg";
import comboImage from "./assets/products/combo.jpeg";



/* =========================
   HOME PAGE
========================= */

function Home({ addToCart, products }) {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <p className="shop-name">APSAR MUTTON SHOP</p>

          <h1>AMS TOOLS</h1>

          <p className="hero-description">
            Tools built for the trade.
          </p>

          <Link to="/products">
            <button className="explore-button">
              Explore Products
            </button>
          </Link>
        </div>
      </section>

      {/* SHOP BY TYPE */}
      <section className="shop-section">
        <h2>Shop by Type</h2>

        <div className="type-container">

          <div className="type-card">
            <h3>SINGLES</h3>
            <p>Individual professional tools</p>

            <Link to="/products">
              <button>View Singles</button>
            </Link>
          </div>

          <div className="type-card">
            <h3>COMBOS</h3>
            <p>Useful tool combinations</p>

            <Link to="/products">
              <button>View Combos</button>
            </Link>
          </div>

        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="products-section">
        <h2>Featured Products</h2>

        <div className="products-grid">

          {products.map((product) => (
  <ProductCard
    key={product.id}
    product={product}
    addToCart={addToCart}
  />
))}

        </div>
      </section>
    </>
  );
}

/* =========================
   PRODUCTS PAGE
========================= */

function Products({ addToCart, products }) {
  return (
    <section className="products-section">
      <h1>All Products</h1>

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
  );
}

/* =========================
   CART PAGE
========================= */

function Cart({
  cart,
  setCart,
  cartTotal,
  setShowCheckout,
}) {
  return (
    <section className="cart-section">

      <h2>Your Cart</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="cart-items">

          {cart.map((item) => (
            <div className="cart-item" key={item.id}>

              <img
                src={item.image}
                alt={item.name}
              />

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
                                  quantity:
                                    product.quantity - 1,
                                }
                              : product
                          )
                          .filter(
                            (product) =>
                              product.quantity > 0
                          )
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
                                quantity:
                                  product.quantity + 1,
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
                        (product) =>
                          product.id !== item.id
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

            <h3>
              Total: ₹{cartTotal.toFixed(2)}
            </h3>

            <Link to="/checkout">
  <button className="checkout-button">
    PROCEED TO CHECKOUT
  </button>
</Link>

          </div>

        </div>
      )}

    </section>
  );
}

/* =========================
   CHECKOUT PAGE
========================= */

function Checkout({ cart, cartTotal }) {
  const navigate = useNavigate();

  const customer = JSON.parse(
    localStorage.getItem("amsCustomer")
  );

  const [fullName, setFullName] = useState(
    customer?.fullName || ""
  );
  const [phone, setPhone] = useState(
    customer?.phone || ""
  );
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (localStorage.getItem("amsOrderCreated") === "true") {
  navigate("/payment");
  return;
}

    if (!customer) {
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (
      !fullName ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      setError("Please fill all delivery details.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/orders/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId: customer.id,
            totalAmount: cartTotal,
            fullName,
            phone,
            address,
            city,
            state,
            pincode,
            items: cart.map((item) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create order."
        );
      }

      // Save order ID for the payment page
      localStorage.setItem(
  "amsOrderId",
  data.orderId
);

localStorage.setItem(
  "amsOrderCreated",
  "true"
);

navigate("/payment");
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!customer) {
    return (
      <section className="checkout-section">
        <h2>Please Login</h2>

        <p>
          You must login before placing an order.
        </p>

        <Link to="/login">
          <button className="place-order-button">
            LOGIN
          </button>
        </Link>
      </section>
    );
  }

  return (
    <section className="checkout-section">
      <h2>Checkout</h2>

      <form
        className="checkout-form"
        onSubmit={handlePlaceOrder}
      >
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) =>
            setFullName(e.target.value)
          }
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
        />

        <textarea
          placeholder="Delivery Address"
          rows="4"
          value={address}
          onChange={(e) =>
            setAddress(e.target.value)
          }
        />

        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) =>
            setCity(e.target.value)
          }
        />

        <input
          type="text"
          placeholder="State"
          value={state}
          onChange={(e) =>
            setState(e.target.value)
          }
        />

        <input
          type="text"
          placeholder="PIN Code"
          value={pincode}
          onChange={(e) =>
            setPincode(e.target.value)
          }
        />

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <h3>
          Order Total: ₹{cartTotal.toFixed(2)}
        </h3>

        <button
          type="submit"
          className="place-order-button"
          disabled={loading}
        >
          {loading
            ? "CREATING ORDER..."
            : "CONTINUE TO PAYMENT"}
        </button>
      </form>
    </section>
  );
}

/* =========================
   PAYMENT PAGE
========================= */

function Payment({
  cartTotal,
  setOrderPlaced,
}) {
  return (
    <section className="payment-section">

      <h2>Payment</h2>

      <div className="payment-card">

        <h3>UPI Payment</h3>

        <p>Order Total</p>

        <h2>
          ₹{cartTotal.toFixed(2)}
        </h2>

        <div className="qr-placeholder">
          QR CODE
        </div>

        <p className="upi-text">
          Scan the QR code using any UPI app
        </p>

        <p>
          Google Pay • PhonePe • Paytm • BHIM
        </p>

        <Link to="/order-success">
  <button className="pay-button">
    I HAVE PAID
  </button>
</Link>

      </div>

    </section>
  );
}

/* =========================
   ORDER SUCCESS PAGE
========================= */

function OrderSuccess({
  setCart,
  setShowCheckout,
  setShowPayment,
  setOrderPlaced,
}) {
  return (
    <section className="order-success">

      <div className="success-card">

        <div className="success-icon">
          ✓
        </div>

        <h2>
          Order Placed Successfully!
        </h2>

        <p>
          Thank you for shopping with AMS TOOLS.
        </p>

        <p>
          Your order will be processed shortly.
        </p>

        <Link to="/">
          <button
            className="continue-shopping-button"
            onClick={() => {
              setCart([]);

              localStorage.removeItem("amsOrderCreated");
localStorage.removeItem("amsOrderId");

              setShowCheckout(false);
              setShowPayment(false);
              setOrderPlaced(false);
            }}
          >
            CONTINUE SHOPPING
          </button>
        </Link>

      </div>

    </section>
  );
}

/* =========================
   MAIN APP
========================= */

function App() {

  const [cart, setCart] = useState([]);

  const [showCheckout, setShowCheckout] =
    useState(false);

  const [showPayment, setShowPayment] =
    useState(false);

  const [orderPlaced, setOrderPlaced] =
    useState(false);

  const addToCart = (product) => {

    const existingProduct = cart.find(
      (item) => item.id === product.id
    );

    if (existingProduct) {

      setCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        )
      );

    } else {

      setCart([
        ...cart,
        {
          ...product,
          quantity: 1,
        },
      ]);

    }
  };

  useEffect(() => {
  const handleWishlistAdd = (event) => {
    addToCart(event.detail);
  };

  window.addEventListener("ams-add-to-cart", handleWishlistAdd);

  return () => {
    window.removeEventListener(
      "ams-add-to-cart",
      handleWishlistAdd
    );
  };
}, [addToCart]);

  const cartTotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const customer = JSON.parse(
  localStorage.getItem("amsCustomer")
);

const handleLogout = () => {
  localStorage.removeItem("amsToken");
  localStorage.removeItem("amsCustomer");

  window.location.href = "/login";
};


useEffect(() => {
  fetchProducts();
}, []);

const fetchProducts = async () => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/admin/customer-products"
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to load products."
      );
    }

    const formattedProducts = data.products.map((product) => ({
      id: product.product_id,
      name: product.name,
      price: Number(product.price),
      image: product.image_url || "",
      description: product.description,
      stock: product.stock,
      type: product.type,
      discount: Number(product.discount),
      active: Boolean(product.active),
    }));

    console.log("PRODUCTS FROM DATABASE:", formattedProducts);

    setProducts(formattedProducts);

  } catch (error) {
    console.error("PRODUCT LOAD ERROR:", error);
  }
};


const [products, setProducts] = useState([]);




  return (
    <div className="app">

      {/* NAVBAR */}

      <nav className="navbar">

        <div className="logo">
          AMS TOOLS
        </div>

        <div className="nav-links">
  <Link to="/">Home</Link>
  <Link to="/products">Products</Link>
  <Link to="/about">About Us</Link>
  <Link to="/contact">Contact</Link>

  {customer ? (
    <>
      <Link to="/profile" className="customer-name">
  👤 {customer.fullName}
</Link>

      <button
        className="logout-button"
        onClick={handleLogout}
      >
        Logout
      </button>
    </>
  ) : (
    <Link to="/login">
      <button className="login-button">
        Login
      </button>
    </Link>
  )}

  <Link to="/cart">
    <button className="cart-button">
      🛒 {cart.length}
    </button>
  </Link>
</div>

      </nav>

      {/* ROUTES */}

      <Routes>

  <Route
  path="/"
  element={
    <Home
      addToCart={addToCart}
      products={products}
    />
  }
/>

  <Route
  path="/products"
  element={
    <Products
      addToCart={addToCart}
      products={products}
    />
  }
/>

  <Route
    path="/cart"
    element={
      <Cart
        cart={cart}
        setCart={setCart}
        cartTotal={cartTotal}
        setShowCheckout={setShowCheckout}
      />
    }
  />

  <Route
  path="/checkout"
  element={
    <Checkout
      cart={cart}
      cartTotal={cartTotal}
    />
  }
/>

  <Route
    path="/payment"
    element={
      <Payment
        cartTotal={cartTotal}
        setOrderPlaced={setOrderPlaced}
      />
    }
  />

  <Route
    path="/order-success"
    element={
      <OrderSuccess
        setCart={setCart}
        setShowCheckout={setShowCheckout}
        setShowPayment={setShowPayment}
        setOrderPlaced={setOrderPlaced}
      />
    }
  />

  <Route
    path="/about"
    element={
      <div className="page">
        <h1>About Us</h1>
        <p>
          Welcome to AMS TOOLS - APSAR MUTTON SHOP.
        </p>
      </div>
    }
  />

  <Route
    path="/contact"
    element={
      <div className="page">
        <h1>Contact Us</h1>
        <p>
          Contact AMS TOOLS for more information.
        </p>
      </div>
    }
  />

<Route path="/login" element={<Login />} />

<Route path="/signup" element={<Signup />} />

<Route
  path="/profile"
  element={<Profile />}
/>

<Route
  path="/orders"
  element={<Orders />}
/>

<Route
  path="/orders/:orderId"
  element={<OrderDetails />}
/>

<Route
  path="/admin/login"
  element={<AdminLogin />}
/>

<Route
  path="/admin"
  element={<AdminDashboard />}
/>


<Route
  path="/admin/products"
  element={<AdminProducts />}
/>

<Route
  path="/admin/products/add"
  element={<AdminAddProduct />}
/>

<Route
  path="/admin/products/edit/:id"
  element={<AdminEditProduct />}
/>

<Route
  path="/admin/orders"
  element={<AdminOrders />}
/>

<Route
  path="/admin/orders/:orderId"
  element={<AdminOrderDetails />}
/>

<Route
  path="/admin/customers"
  element={<AdminCustomers />}
/>

<Route
  path="/admin/customers/:customerId/orders"
  element={<AdminCustomerOrders />}
/>

<Route
  path="/admin/reports"
  element={<AdminReports />}
/>

<Route
  path="/wishlist"
  element={<Wishlist />}
/>

<Route
  path="/admin/reviews"
  element={<AdminReviews />}
/>

<Route
  path="/products/:productId/reviews"
  element={<ProductReviews />}
/>


</Routes>

    </div>
  );
}

export default App;