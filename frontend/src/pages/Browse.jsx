import { useEffect, useState } from "react";
import { fetchListings } from "../api/listings";
import TypeToggle from "../components/TypeToggle";
import ListingCard from "../components/ListingCard";
import "./Browse.css";

export default function Browse() {
  const [type, setType] = useState("all");
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();
    async function loadListings() {
      try {
        const data = await fetchListings(controller.signal);
        setListings(data);
        setStatus("success");
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Unable to load listings", error);
          setStatus("error");
        }
      }
    }

    loadListings();
    return () => controller.abort();
  }, []);

  const visible =
    type === "all" ? listings : listings.filter((l) => l.type === type);

  return (
    <main className="browse">
      <div className="browse__bar">
        <TypeToggle value={type} onChange={setType} />
        <span className="browse__count">{visible.length} listings near GSU</span>
      </div>

      {status === "loading" && <p className="browse__message">Loading listings…</p>}
      {status === "error" && (
        <p className="browse__message browse__message--error">
          We couldn&apos;t load housing listings. Make sure the backend is running and try again.
        </p>
      )}
      {status === "success" && visible.length === 0 && (
        <p className="browse__message">No listings found.</p>
      )}
      {status === "success" && visible.length > 0 && (
        <div className="browse__grid">
          {visible.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </main>
  );
}
