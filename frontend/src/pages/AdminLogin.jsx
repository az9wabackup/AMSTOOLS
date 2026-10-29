import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [mpin, setMpin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    if (!/^\d{4}$/.test(mpin)) {
      setError("M-PIN must be exactly 4 digits.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/admin/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone,
            mpin,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Admin login failed."
        );
      }

      localStorage.setItem(
        "amsAdminToken",
        data.token
      );

      localStorage.setItem(
        "amsAdmin",
        JSON.stringify(data.admin)
      );

      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-login-page">
      <div className="admin-login-card">

        <div className="admin-login-header">
          <h1>AMS TOOLS</h1>
          <p>ADMIN PANEL</p>
        </div>

        <form onSubmit={handleLogin}>

          <label>Phone Number</label>

          <input
            type="tel"
            placeholder="Enter admin phone"
            value={phone}
            maxLength="10"
            onChange={(e) =>
              setPhone(
                e.target.value.replace(/\D/g, "")
              )
            }
          />

          <label>M-PIN</label>

          <input
            type="password"
            placeholder="Enter 4-digit M-PIN"
            value={mpin}
            maxLength="4"
            onChange={(e) =>
              setMpin(
                e.target.value.replace(/\D/g, "")
              )
            }
          />

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "LOGGING IN..."
              : "ADMIN LOGIN"}
          </button>

        </form>
      </div>
    </section>
  );
}

export default AdminLogin;