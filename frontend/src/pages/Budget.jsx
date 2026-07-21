import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchListings } from "../api/listings";
import "./Budget.css";
import "./BudgetCosts.css";

const baseMonthlyCost = (listing) => listing.type === "dorm" ? Math.round(listing.pricePerSemester / 4) : listing.rentMin;

export default function Budget() {
  const [listings, setListings] = useState([]);
  const [values, setValues] = useState({ budget: "1500", type: "all", bedrooms: "" });
  useEffect(() => { const controller = new AbortController(); fetchListings(controller.signal).then(setListings).catch(() => {}); return () => controller.abort(); }, []);
  const monthlyBudget = Number(values.budget || 0);
  const matches = useMemo(() => listings.map((listing) => {
    const baseCost = baseMonthlyCost(listing);
    const additionalCosts = [listing.averageUtilities, listing.parkingCost, listing.insuranceCost].filter((value) => value != null);
    return { ...listing, baseCost, projectedTotal: baseCost + additionalCosts.reduce((sum, value) => sum + value, 0), knownCostCount: additionalCosts.length };
  }).filter((listing) => (values.type === "all" || listing.type === values.type) && (!values.bedrooms || listing.bedrooms >= Number(values.bedrooms)) && listing.projectedTotal <= monthlyBudget).sort((a,b) => b.projectedTotal - a.projectedTotal), [listings, values.type, values.bedrooms, monthlyBudget]);
  const update = (event) => setValues({ ...values, [event.target.name]: event.target.value });
  const formatCost = (value) => value == null ? "Not provided" : `$${value.toLocaleString()}`;

  return <main className="budget-page"><header><div><p>Housing budget tool</p><h1>Find a home that fits your housing budget.</h1><span>Compare each property using its rent or dorm cost and the housing expenses provided by its moderator.</span></div><div className="budget-total"><span>Monthly housing budget</span><strong>${monthlyBudget.toLocaleString()}</strong><small>maximum projected housing cost</small></div></header>
    <div className="budget-layout"><section className="budget-form"><h2>Your housing plan</h2><label>Maximum monthly housing budget<input name="budget" type="number" min="0" value={values.budget} onChange={update} /></label><div className="budget-fields"><label>Housing type<select name="type" value={values.type} onChange={update}><option value="all">All housing</option><option value="apartment">Apartments</option><option value="dorm">Dorms</option></select></label><label>Minimum bedrooms<select name="bedrooms" value={values.bedrooms} onChange={update}><option value="">Any</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select></label></div><div className="budget-guidance"><strong>What is included?</strong><p>Each match uses that property&apos;s base housing cost plus any optional average utilities, parking, and renter&apos;s insurance entered by a moderator.</p><p>Missing expenses are shown as “Not provided” instead of being guessed.</p></div></section>
      <section className="budget-results"><div><h2>{matches.length} housing match{matches.length === 1 ? "" : "es"}</h2><p>Dorm prices are converted to a four-month monthly estimate. Results stay within your selected monthly housing budget using the property costs currently available.</p></div>{matches.map((listing) => <article key={listing.id}><div><span>{listing.type}</span><h3>{listing.name}</h3><p>{listing.address} · {listing.bedrooms ? `${listing.bedrooms} bedroom${listing.bedrooms === 1 ? "" : "s"}` : "Bedrooms not listed"}</p><div className="property-cost-details"><span>Base <strong>${listing.baseCost.toLocaleString()}</strong></span><span>Utilities <strong>{formatCost(listing.averageUtilities)}</strong></span><span>Parking <strong>{formatCost(listing.parkingCost)}</strong></span><span>Insurance <strong>{formatCost(listing.insuranceCost)}</strong></span></div>{listing.knownCostCount < 3 && <small className="cost-warning">Projected total excludes costs marked “Not provided.”</small>}</div><div className="budget-result__cost"><strong>${listing.projectedTotal.toLocaleString()}</strong><span>projected monthly housing</span><small>${(monthlyBudget - listing.projectedTotal).toLocaleString()} below budget</small><Link to={`/property/${listing.id}`}>View property</Link></div></article>)}{matches.length === 0 && <div className="budget-empty"><h3>No matches at this housing budget</h3><p>Try adjusting the monthly budget, housing type, or minimum bedrooms.</p></div>}</section>
    </div><p className="budget-disclaimer">Confirm all rent, dorm charges, utilities, parking, and insurance requirements directly with each housing provider before signing an agreement.</p>
  </main>;
}
