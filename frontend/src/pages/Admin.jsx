import { useEffect, useState } from "react";
import { addProperty, fetchDashboard, moderateReview } from "../api/admin";
import { useAuth } from "../context/authContext";
import "./Admin.css";

export default function Admin() {
  const { user } = useAuth(); const [data, setData] = useState(null); const [error, setError] = useState("");
  const [property, setProperty] = useState({ name: "", address: "", type: "apartment", description: "", rentMin: "", rentMax: "", bedrooms: "", amenities: "" });
  const load = () => fetchDashboard().then(setData).catch((err) => setError(err.message));
  useEffect(() => { if (user?.isAdmin) load(); }, [user]);
  if (!user?.isAdmin) return <main className="admin-page"><h1>Administrator access required</h1></main>;
  async function moderate(id, status) { const reason = status === "rejected" ? window.prompt("Reason for rejecting this review:") : ""; if (status === "rejected" && !reason) return; await moderateReview(id, status, reason); load(); }
  async function create(event) { event.preventDefault(); await addProperty({ ...property, amenities: property.amenities.split(",").map((x) => x.trim()).filter(Boolean) }); setProperty({ name: "", address: "", type: "apartment", description: "", rentMin: "", rentMax: "", bedrooms: "", amenities: "" }); load(); }
  return <main className="admin-page"><h1>PantherDen administration</h1>{error && <p>{error}</p>}<div className="admin-stats">{data && Object.entries(data.counts).map(([label,value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
    <section><h2>Pending review queue</h2>{data?.pendingReviews.map((review) => <article key={review.id}><div><strong>{review.title}</strong><span>{review.listingName} · {review.author} · {review.rating}/5</span><p>{review.reviewText}</p></div><aside><button onClick={() => moderate(review.id,"approved")}>Approve</button><button className="reject" onClick={() => moderate(review.id,"rejected")}>Reject</button></aside></article>)}{data?.pendingReviews.length === 0 && <p>No reviews waiting for moderation.</p>}</section>
    <section><h2>Add a property</h2><form onSubmit={create}>{["name","address","description","rentMin","rentMax","bedrooms","amenities"].map((name) => <label key={name}>{name.replace(/([A-Z])/g," $1")}<input name={name} type={["rentMin","rentMax","bedrooms"].includes(name) ? "number" : "text"} value={property[name]} onChange={(e) => setProperty({ ...property, [name]: e.target.value })} required={["name","address"].includes(name)} /></label>)}<label>Type<select value={property.type} onChange={(e) => setProperty({...property,type:e.target.value})}><option value="apartment">Apartment</option><option value="dorm">Dorm</option></select></label><button type="submit">Add property</button></form></section>
  </main>;
}
