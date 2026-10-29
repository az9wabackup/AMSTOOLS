import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [mpin, setMpin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!phone || !mpin) {
      setError("Please enter phone number and M-PIN.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    if (!/^\d{4}$/.test(mpin)) {
      setError("M-PIN must be exactly 4 digits.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
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
        setError(data.message);
        return;
      }

      localStorage.setItem("amsToken", data.token);
      localStorage.setItem(
        "amsCustomer",
        JSON.stringify(data.customer)
      );

      navigate("/");
    } catch (error) {
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p>Login to AMS TOOLS</p>

        <form onSubmit={handleLogin}>
          <input
            type="tel"
            placeholder="Phone Number"
            maxLength="10"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, ""))
            }
          />

          <input
            type="password"
            placeholder="M-PIN"
            maxLength="4"
            value={mpin}
            onChange={(e) =>
              setMpin(e.target.value.replace(/\D/g, ""))
            }
          />

          {error && (
            <p className="auth-error">{error}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account?{" "}
          <Link to="/signup">Create Account</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;