import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [mpin, setMpin] = useState("");
  const [confirmMpin, setConfirmMpin] = useState("");
  const [error, setError] = useState("");

  const handleSignup =async (e) => {
    e.preventDefault();

    setError("");

    if (!fullName || !phone || !mpin || !confirmMpin) {
      setError("Please fill all fields.");
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

    if (mpin !== confirmMpin) {
      setError("M-PINs do not match.");
      return;
    }

    try {
  const response = await fetch(
    "http://localhost:5000/api/auth/signup",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
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

  alert("Account created successfully!");

  navigate("/login");
} catch (error) {
  setError("Unable to connect to server.");
}
  };

  return (
    <section className="auth-section">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p>Join AMS TOOLS</p>

        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

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
            placeholder="Create 4-digit M-PIN"
            maxLength="4"
            value={mpin}
            onChange={(e) =>
              setMpin(e.target.value.replace(/\D/g, ""))
            }
          />

          <input
            type="password"
            placeholder="Confirm M-PIN"
            maxLength="4"
            value={confirmMpin}
            onChange={(e) =>
              setConfirmMpin(
                e.target.value.replace(/\D/g, "")
              )
            }
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit">
            CREATE ACCOUNT
          </button>
        </form>

        <p className="auth-link">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}

export default Signup;