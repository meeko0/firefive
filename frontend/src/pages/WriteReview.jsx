import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchListings, submitReview } from "../api/listings";
import { useAuth } from "../context/authContext";
import "./FormPage.css";

export default function WriteReview() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [values, setValues] = useState({ listingId: params.get("listing") || "", title: "", rating: "5", safetyRating: "5", maintenanceRating: "5", moveInDate: "", moveOutDate: "", reviewText: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { const controller = new AbortController(); fetchListings(controller.signal).then(setListings).catch(() => {}); return () => controller.abort(); }, []);
  const update = (event) => setValues({ ...values, [event.target.name]: event.target.value });
  async function submit(event) { event.preventDefault(); setError(""); try { const result = await submitReview(values); setMessage(result.message); } catch (err) { setError(err.message); } }
  if (!user) return <main className="form-page"><section><h1>Log in to write a review</h1><p>Only student accounts can submit housing experiences.</p><Link className="form-button" to="/login">Log in</Link></section></main>;
  if (!user.isVerified) return <main className="form-page"><section><h1>Verify your student email</h1><p>Reviews are available after your .edu email is verified.</p></section></main>;
  return <main className="form-page"><section><p className="form-eyebrow">Student experience</p><h1>Write a housing review</h1><p>Your review will be submitted to the moderation queue before it appears publicly.</p>
    <form onSubmit={submit}>
      <label>Property<select name="listingId" value={values.listingId} onChange={update} required><option value="">Select property</option>{listings.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Review title<input name="title" value={values.title} onChange={update} maxLength="160" required /></label>
      <div className="form-grid">{[["rating","Overall rating"],["safetyRating","Safety rating"],["maintenanceRating","Maintenance response"]].map(([name,label]) => <label key={name}>{label}<select name={name} value={values[name]} onChange={update}>{[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} stars</option>)}</select></label>)}</div>
      <div className="form-grid"><label>Move-in date<input name="moveInDate" type="date" value={values.moveInDate} onChange={update} required /></label><label>Move-out date (optional)<input name="moveOutDate" type="date" value={values.moveOutDate} onChange={update} /></label></div>
      <label>Your review<textarea name="reviewText" value={values.reviewText} onChange={update} minLength="50" rows="7" required /><small>{values.reviewText.length}/50 minimum characters</small></label>
      {error && <p className="form-error">{error}</p>}{message && <p className="form-success">{message}</p>}<button type="submit">Submit for review</button>
    </form></section></main>;
}
