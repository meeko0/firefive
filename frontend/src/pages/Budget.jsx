import { useState } from "react";
import { listings } from "../data/mockListings";
import ListingCard from "../components/ListingCard";
import "./Budget.css";

//estimate a monthly cost for any listing so we can compare against a monthly budget
function monthlyCost(listing) {
  if (listing.type === "dorm") return Math.round(listing.pricePerSemester / 4); //~4 months per semester
  return listing.rentMin; //starting monthly rent
}

export default function Budget() {
  const [budget, setBudget] = useState("");
  const [type, setType] = useState("all");
  const [beds, setBeds] = useState("any");
  const [results, setResults] = useState(null); //null = hasn't searched yet

  function handleFind() {
    const max = Number(budget);
    if (!max || max <= 0) {
      setResults([]);
      return;
    }
    const matches = listings
      .filter((l) => type === "all" || l.type === type)
      .filter((l) => {
        if (beds === "any") return true;
        if (l.type !== "apartment") return false; //bedrooms only apply to apartments
        return beds === "3" ? l.beds >= 3 : l.beds === Number(beds);
      })
      .filter((l) => monthlyCost(l) <= max)
      .sort((a, b) => monthlyCost(a) - monthlyCost(b));
    setResults(matches);
  }

  return (
    <main className="budget">
      <header className="budget__head">
        <h1>Match My Budget</h1>
        <p>Tell us your monthly budget and we'll show the GSU housing you can afford.</p>
      </header>

      <div className="budget__form">
        <label className="field">
          <span className="field__label">Monthly budget</span>
          <div className="field__money">
            <span>$</span>
            <input
              type="number"
              min="0"
              placeholder="1400"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
            <span className="field__suffix">/ mo</span>
          </div>
        </label>

        <label className="field">
          <span className="field__label">Housing type</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All housing</option>
            <option value="apartment">Apartments</option>
            <option value="dorm">Dorms</option>
          </select>
        </label>

        <label className="field">
          <span className="field__label">Bedrooms</span>
          <select value={beds} onChange={(e) => setBeds(e.target.value)}>
            <option value="any">Any</option>
            <option value="1">1 bed</option>
            <option value="2">2 beds</option>
            <option value="3">3+ beds</option>
          </select>
        </label>

        <button className="budget__find" onClick={handleFind}>Find</button>
      </div>

      {results !== null && (
        <section className="budget__results">
          {results.length > 0 ? (
            <>
              <p className="budget__count">
                {results.length} {results.length === 1 ? "place fits" : "places fit"} your $
                {Number(budget).toLocaleString()}/mo budget
              </p>
              <div className="budget__grid">
                {results.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </>
          ) : (
            <p className="budget__empty">
              No places match yet. Try raising your budget or widening the filters.
            </p>
          )}
        </section>
      )}
    </main>
  );
}
