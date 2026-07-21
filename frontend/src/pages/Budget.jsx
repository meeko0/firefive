import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchListings } from "../api/listings";
import "./Budget.css";
import "./BudgetHousing.css";

const baseMonthlyCost = (listing) => listing.type === "dorm" ? Math.round(listing.pricePerSemester / 4) : listing.rentMin;

export default function Budget() {
  const [listings, setListings] = useState([]);
  const [values, setValues] = useState({ budget: "1500", utilities: "120", parking: "0", insurance: "20", moveInFund: "1800", type: "all", bedrooms: "" });
  useEffect(() => { const controller = new AbortController(); fetchListings(controller.signal).then(setListings).catch(() => {}); return () => controller.abort(); }, []);
  const monthlyBudget = Number(values.budget || 0);
  const parking = Number(values.parking || 0);
  const insurance = Number(values.insurance || 0);
  const utilities = Number(values.utilities || 0);
  const moveInFund = Number(values.moveInFund || 0);
  const matches = useMemo(() => listings.map((listing) => {
    const baseCost = baseMonthlyCost(listing);
    const projectedTotal = baseCost + parking + insurance + (listing.type === "apartment" ? utilities : 0);
    return { ...listing, baseCost, projectedTotal, estimatedMoveIn: baseCost + 250 };
  }).filter((listing) => (values.type === "all" || listing.type === values.type) && (!values.bedrooms || listing.bedrooms >= Number(values.bedrooms)) && listing.projectedTotal <= monthlyBudget).sort((a,b) => b.projectedTotal - a.projectedTotal), [listings, values.type, values.bedrooms, monthlyBudget, parking, insurance, utilities]);
  const update = (event) => setValues({ ...values, [event.target.name]: event.target.value });

  return <main className="budget-page"><header><div><p>Housing budget tool</p><h1>Find a home that fits your housing budget.</h1><span>Compare rent or dorm cost together with utilities, parking, insurance, and move-in expenses.</span></div><div className="budget-total"><span>Monthly housing budget</span><strong>${monthlyBudget.toLocaleString()}</strong><small>maximum all-in housing cost</small></div></header>
    <div className="budget-layout"><section className="budget-form"><h2>Your housing plan</h2><label>Maximum monthly housing budget<input name="budget" type="number" min="0" value={values.budget} onChange={update} /></label><div className="budget-fields"><label>Apartment utilities estimate<input name="utilities" type="number" min="0" value={values.utilities} onChange={update} /></label><label>Monthly parking<input name="parking" type="number" min="0" value={values.parking} onChange={update} /></label></div><div className="budget-fields"><label>Renter&apos;s insurance<input name="insurance" type="number" min="0" value={values.insurance} onChange={update} /></label><label>Move-in fund<input name="moveInFund" type="number" min="0" value={values.moveInFund} onChange={update} /></label></div><div className="budget-fields"><label>Housing type<select name="type" value={values.type} onChange={update}><option value="all">All housing</option><option value="apartment">Apartments</option><option value="dorm">Dorms</option></select></label><label>Minimum bedrooms<select name="bedrooms" value={values.bedrooms} onChange={update}><option value="">Any</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select></label></div><div className="budget-breakdown"><span>Apartment rent allowance<strong>${Math.max(0, monthlyBudget - utilities - parking - insurance).toLocaleString()}</strong></span><span>Dorm cost allowance<strong>${Math.max(0, monthlyBudget - parking - insurance).toLocaleString()}</strong></span><span>Available for move-in costs<strong>${moveInFund.toLocaleString()}</strong></span></div></section>
      <section className="budget-results"><div><h2>{matches.length} housing match{matches.length === 1 ? "" : "es"}</h2><p>Dorm prices are converted to a four-month semester estimate. Apartment totals include your utility estimate; every result includes parking and renter&apos;s insurance.</p></div>{matches.map((listing) => <article key={listing.id}><div><span>{listing.type}</span><h3>{listing.name}</h3><p>{listing.address} · {listing.bedrooms ? `${listing.bedrooms} bedroom${listing.bedrooms === 1 ? "" : "s"}` : "Bedrooms not listed"}</p><small className={moveInFund >= listing.estimatedMoveIn ? "move-in-ready" : "move-in-short"}>{moveInFund >= listing.estimatedMoveIn ? "Move-in fund covers estimated first payment + $250 fees" : `About $${(listing.estimatedMoveIn - moveInFund).toLocaleString()} more needed for estimated move-in`}</small></div><div className="budget-result__cost"><strong>${listing.projectedTotal.toLocaleString()}</strong><span>projected monthly housing</span><small>${listing.baseCost.toLocaleString()} base housing cost</small><Link to={`/property/${listing.id}`}>View property</Link></div></article>)}{matches.length === 0 && <div className="budget-empty"><h3>No matches at this housing budget</h3><p>Try adjusting housing expenses, housing type, or minimum bedrooms.</p></div>}</section>
    </div><p className="budget-disclaimer">Housing estimates are for comparison only. Confirm rent, deposits, application fees, utilities, parking, insurance requirements, and dorm billing directly with each provider.</p>
  </main>;
}
