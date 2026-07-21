import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAccount, fetchProfile } from "../api/auth";
import { fetchFavorites } from "../api/listings";
import { useAuth } from "../context/authContext";
import ListingCard from "../components/ListingCard";
import "./Profile.css";

export default function Profile() {
  const { user, token, signOut } = useAuth(); const navigate = useNavigate();
  const [profile, setProfile] = useState(null); const [favorites, setFavorites] = useState([]);
  useEffect(() => { if (token) { fetchProfile(token).then(setProfile); fetchFavorites().then(setFavorites); } }, [token]);
  if (!user) return <main className="profile-page"><h1>Log in to view your profile</h1></main>;
  async function remove() { if (!window.confirm("Delete your account and all of your reviews? This cannot be undone.")) return; await deleteAccount(token); signOut(); navigate("/"); }
  return <main className="profile-page"><header><div><p>Student profile</p><h1>{user.name}</h1><span>{user.email} · {user.isVerified ? "Verified" : "Verification pending"}</span></div><button onClick={remove}>Delete account</button></header>
    <section><h2>Saved housing</h2><div className="profile-grid">{favorites.map((item) => <ListingCard key={item.id} listing={item} canFavorite={false} />)}{favorites.length === 0 && <p>No favorites saved yet.</p>}</div></section>
    <section><h2>My reviews</h2>{profile?.reviews?.map((review) => <article className="profile-review" key={review.id}><strong>{review.title}</strong><span>{review.listingName} · {review.status}</span>{review.rejectionReason && <p>Moderator note: {review.rejectionReason}</p>}</article>)}{profile?.reviews?.length === 0 && <p>No reviews submitted yet.</p>}</section>
  </main>;
}
