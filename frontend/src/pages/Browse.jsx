import { useState } from "react";
import { listings } from "../data/mockListings";
import TypeToggle from "../components/TypeToggle";
import ListingCard from "../components/ListingCard";
import "./Browse.css";

export default function Browse() {
  const [type, setType] = useState("all");

  const visible =
    type === "all" ? listings : listings.filter((l) => l.type === type);

  return (
    <main className="browse">
      <div className="browse__bar">
        <TypeToggle value={type} onChange={setType} />
        <span className="browse__count">{visible.length} listings near GSU</span>
      </div>

      <div className="browse__grid">
        {visible.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </main>
  );
}
