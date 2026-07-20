import { useState } from "react";

export default function WriteReview() {

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const [overallRating, setOverallRating] = useState(0);
  const [safetyRating, setSafetyRating] = useState(0);
  const [managementRating, setManagementRating] = useState(0);

  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    const review = {
      name,
      title,
      body,
      overallRating,
      safetyRating,
      managementRating,
    };
    console.log(review);
    setSubmitted(true);
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Write a Review</h1>
      <p style={{ color: "var(--muted)" }}>WriteReview page </p>

      <div style={{ marginBottom: 16 }}>
        <p style={{ marginBottom: 4 }}>Overall Rating</p>
        {[1, 2, 3, 4, 5].map((num) => (
          <span
            key={num}
            onClick={() => setOverallRating(num)}
            style={{ cursor: "pointer", color: num <= overallRating ? "gold" : "lightgray" }}
          >
            ★
          </span>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <p style={{ marginBottom: 4 }}>Safety Rating</p>
        {[1, 2, 3, 4, 5].map((num) => (
          <span
            key={num}
            onClick={() => setSafetyRating(num)}
            style={{ cursor: "pointer", color: num <= safetyRating ? "gold" : "lightgray" }}
          >
            ★
          </span>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <p style={{ marginBottom: 4 }}>Management Rating</p>
        {[1, 2, 3, 4, 5].map((num) => (
          <span
            key={num}
            onClick={() => setManagementRating(num)}
            style={{ cursor: "pointer", color: num <= managementRating ? "gold" : "lightgray" }}
          >
            ★
          </span>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          style={{ width: "100%", padding: 8 }}
        ></textarea>
      </div>

      <button onClick={handleSubmit} style={{ padding: "8px 16px" }}>
        Submit Review
      </button>

      {submitted && <p style={{ color: "green" }}>Thanks for your review!</p>}

    </main>
  );
}