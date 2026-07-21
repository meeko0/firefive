import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchListing } from "../api/listings";

export default function PropertyDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();

    async function loadListing() {
      try {
        const data = await fetchListing(id, controller.signal);
        setListing(data);
        setStatus("success");
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Unable to load listing", error);
          setStatus("error");
        }
      }
    }

    loadListing();
    return () => controller.abort();
  }, [id]);

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1>
        {status === "loading" && "Loading property…"}
        {status === "error" && "Property not found"}
        {status === "success" && listing.name}
      </h1>
      <p style={{ color: "var(--muted)" }}>
        {status === "error"
          ? "We couldn't load this property. Please return to Browse and try again."
          : "Property detail page — build me out (photos, rating breakdown, cost calculator, reviews)."}
      </p>
    </main>
  );
}
