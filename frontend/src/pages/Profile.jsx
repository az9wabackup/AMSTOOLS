import { Link } from "react-router-dom";

function Profile() {
  const customer = JSON.parse(
    localStorage.getItem("amsCustomer")
  );

  if (!customer) {
    return (
      <section className="page">
        <h1>Please Login</h1>
        <Link to="/login">
          <button>LOGIN</button>
        </Link>
      </section>
    );
  }

  return (
    <section className="profile-section">
      <div className="profile-card">
        <div className="profile-avatar">
          {customer.fullName.charAt(0).toUpperCase()}
        </div>

        <h1>{customer.fullName}</h1>

        <p className="profile-phone">
          📱 {customer.phone}
        </p>

        <div className="profile-options">
          <Link to="/orders">
            <button>📦 My Orders</button>
          </Link>

          <Link to="/wishlist">
            <button>♡ Wishlist</button>
          </Link>

          <Link to="/cart">
            <button>🛒 My Cart</button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Profile;