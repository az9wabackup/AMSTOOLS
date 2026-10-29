
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function ProductReviews() {
  const { productId } = useParams();

  const customer = JSON.parse(
    localStorage.getItem("amsCustomer") || "null"
  );

  const [reviews, setReviews] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadReviews = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/reviews/product/${productId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load reviews.");
      }

      setReviews(data.reviews || []);
    } catch (err) {
      setError(err.message || "Unable to load reviews.");
    }
  };

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);
      setError("");

      await loadReviews();

      if (customer?.id) {
        try {
          const response = await fetch(
            `http://localhost:5000/api/orders/customer/${customer.id}`
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Unable to load your orders.");
          }

          // Keep orders that contain this product.
          const matchingOrders = [];

          for (const order of data.orders || []) {
            const detailsResponse = await fetch(
              `http://localhost:5000/api/orders/${order.order_id}`
            );

            if (!detailsResponse.ok) continue;

            const details = await detailsResponse.json();

            const containsProduct = (details.items || []).some(
              (item) => Number(item.product_id) === Number(productId)
            );

            if (containsProduct) {
              matchingOrders.push(order);
            }
          }

          setOrders(matchingOrders);
        } catch (err) {
          setMessage(err.message || "Unable to load your orders.");
        }
      }

      setLoading(false);
    };

    loadPage();
  }, [productId, customer?.id]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) /
        reviews.length
      : 0;

  const submitReview = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!customer?.id) {
      setMessage("Please log in before submitting a review.");
      return;
    }

    if (!selectedOrder) {
      setMessage("Please select an order containing this product.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/reviews/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId: customer.id,
            productId: Number(productId),
            orderId: Number(selectedOrder),
            rating: Number(rating),
            comment: comment.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit review.");
      }

      setMessage(data.message);
      setComment("");
      setRating(5);
      setSelectedOrder("");

      await loadReviews();
    } catch (err) {
      setMessage(err.message || "Unable to submit review.");
    }
  };

  return (
    <section className="product-reviews">
      <Link to="/products">← Back to Products</Link>

      <h1>Customer Reviews</h1>

      {loading ? (
        <p>Loading reviews and your orders...</p>
      ) : (
        <>
          {error && <p>{error}</p>}

          {reviews.length > 0 ? (
            <>
              <h2>⭐ {averageRating.toFixed(1)} / 5</h2>
              <p>{reviews.length} customer review(s)</p>

              {reviews.map((review) => (
                <article
                  className="customer-review-card"
                  key={review.review_id}
                >
                  <h3>{review.customer_name}</h3>
                  <p>
                    {"⭐".repeat(Number(review.rating))} ({review.rating}/5)
                  </p>
                  <p>{review.comment || "No comment provided."}</p>
                  <small>
                    {new Date(review.created_at).toLocaleDateString()}
                  </small>
                </article>
              ))}
            </>
          ) : (
            <p>No approved reviews yet.</p>
          )}

          <hr />

          <h2>Write a Review</h2>

          {!customer ? (
            <p>
              Please <Link to="/login">log in</Link> to review a product
              you purchased.
            </p>
          ) : orders.length === 0 ? (
            <p>
              No matching orders were found for this product. You can review
              it after ordering it.
            </p>
          ) : (
            <form onSubmit={submitReview}>
              <label htmlFor="review-order">Select your order</label>
              <select
                id="review-order"
                value={selectedOrder}
                onChange={(event) => setSelectedOrder(event.target.value)}
                required
              >
                <option value="">Choose an order</option>
                {orders.map((order) => (
                  <option key={order.order_id} value={order.order_id}>
                    Order #{order.order_id}
                  </option>
                ))}
              </select>

              <label htmlFor="review-rating">Your rating</label>
              <select
                id="review-rating"
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
              >
                <option value={5}>⭐⭐⭐⭐⭐ - Excellent</option>
                <option value={4}>⭐⭐⭐⭐ - Good</option>
                <option value={3}>⭐⭐⭐ - Average</option>
                <option value={2}>⭐⭐ - Poor</option>
                <option value={1}>⭐ - Very poor</option>
              </select>

              <label htmlFor="review-comment">Your comment</label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Share your experience with this product..."
                maxLength={1000}
                rows={4}
              />

              <button type="submit">Submit Review</button>
            </form>
          )}

          {message && <p role="status">{message}</p>}
        </>
      )}
    </section>
  );
}

export default ProductReviews;
