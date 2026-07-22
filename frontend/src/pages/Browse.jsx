import { useEffect, useState } from "react";
import { addFavorite, fetchFavorites, fetchListings, removeFavorite } from "../api/listings";
import { useAuth } from "../context/authContext";
import TypeToggle from "../components/TypeToggle";
import ListingCard from "../components/ListingCard";
import "./Browse.css";

export default function Browse() {
  const [type, setType] = useState("all");
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState("loading");
  const [filters, setFilters] = useState({ search: "", minPrice: "", maxPrice: "", bedrooms: "", amenity: "" });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const { user } = useAuth();

  useEffect(() => {
    const controller = new AbortController();
    async function loadListings() {
      try {
        const data = await fetchListings(controller.signal, { ...appliedFilters, type });
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
  }, [appliedFilters, type]);

  useEffect(() => {
    if (user) fetchFavorites().then((items) => setFavoriteIds(new Set(items.map((item) => item.id)))).catch(() => {});
  }, [user]);

  async function toggleFavorite(id) {
    if (!user) return;
    const next = new Set(favoriteIds);
    if (next.has(id)) { await removeFavorite(id); next.delete(id); }
    else { await addFavorite(id); next.add(id); }
    setFavoriteIds(next);
  }

  const visible = listings;

  return (
    <main className="browse">
      <div className="browse__bar">
        <TypeToggle value={type} onChange={setType} />
        <span className="browse__count">{visible.length} listings near GSU</span>
      </div>
      <form className="browse__filters" onSubmit={(event) => { event.preventDefault(); setAppliedFilters(filters); }}>
        <label className="browse__search">Search<input aria-label="Search by property or address" placeholder="Property name or address" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></label>
        <label>Min price<input type="number" min="0" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} /></label>
        <label>Max price<input type="number" min="0" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} /></label>
        <label>Bedrooms<select value={filters.bedrooms} onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}><option value="">Any</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select></label>
        <label>Amenity<select value={filters.amenity} onChange={(e) => setFilters({ ...filters, amenity: e.target.value })}><option value="">Any</option><option>Parking</option><option>Laundry</option><option>Gym</option><option>Dining</option></select></label>
        <button type="submit">Search</button>
      </form>

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
            <ListingCard key={listing.id} listing={listing} isFavorite={favoriteIds.has(listing.id)} onFavorite={toggleFavorite} canFavorite={Boolean(user)} />
          ))}
        </div>
      )}
    </main>
  );
}
