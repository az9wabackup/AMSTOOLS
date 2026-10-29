
import { useEffect, useState } from "react";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadReviews = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/reviews"
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load reviews.");
      }

      setReviews(data.reviews || []);
    } catch (error) {
      setMessage(error.message || "Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const updateStatus = async (reviewId, status) => {
    try {
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/admin/reviews/${reviewId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update review.");
      }

      setMessage(data.message);
      await loadReviews();
    } catch (error) {
      setMessage(error.message || "Unable to update review.");
    }
  };

  if (loading) {
    return <p>Loading reviews...</p>;
  }

  return (
    <section className="admin-reviews">
      <h1>Customer Reviews</h1>

      {message && <p role="status">{message}</p>}

      {reviews.length === 0 ? (
        <p>No customer reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <article
            key={review.review_id}
            className="admin-review-card"
          >
            <h3>{review.product_name}</h3>

            <p>
              <strong>Customer:</strong> {review.customer_name}
            </p>

            <p>
              <strong>Rating:</strong> {"⭐".repeat(review.rating)}
              {" "}({review.rating}/5)
            </p>

            <p>
              <strong>Order ID:</strong> {review.order_id}
            </p>

            <p>
              <strong>Comment:</strong>{" "}
              {review.comment || "No comment provided"}
            </p>

            <p>
              <strong>Status:</strong> {review.status}
            </p>

            {review.status === "PENDING" && (
              <div>
                <button
                  onClick={() =>
                    updateStatus(review.review_id, "APPROVED")
                  }
                >
                  Approve
                </button>

                <button
                  onClick={() =>
                    updateStatus(review.review_id, "REJECTED")
                  }
                >
                  Reject
                </button>
              </div>
            )}
          </article>
        ))
      )}
    </section>
  );
}

export default AdminReviews;
