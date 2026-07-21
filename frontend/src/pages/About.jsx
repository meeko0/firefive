import { Link } from "react-router-dom";
import "./About.css";

const VALUES = [
  { icon: "01", title: "Built for GSU students", text: "Compare campus housing and nearby apartments using the costs, distances, and details that matter during a busy semester." },
  { icon: "02", title: "Experiences you can trust", text: "Student reviews require a verified .edu account and enter moderation before appearing publicly." },
  { icon: "03", title: "Clearer housing decisions", text: "Search, filters, safety ratings, management ratings, and budget matching turn scattered information into one practical view." },
];

export default function About() {
  return <main className="about-page">
    <section className="about-hero"><div><p className="about-eyebrow">About PantherDen</p><h1>A clearer path to student housing near Georgia State.</h1><p>PantherDen brings property information, real student experiences, and affordability tools together so students can choose housing with more confidence.</p><div className="about-actions"><Link to="/">Browse housing</Link><Link to="/write-review">Share your experience</Link></div></div><div className="about-hero__graphic"><span>GSU</span><strong>Housing decisions,<br />made together.</strong></div></section>
    <section className="about-values">{VALUES.map((item) => <article key={item.icon}><span>{item.icon}</span><h2>{item.title}</h2><p>{item.text}</p></article>)}</section>
    <section className="about-process"><div><p className="about-eyebrow">How it works</p><h2>From search to shortlist in a few steps</h2></div><ol><li><strong>Explore</strong><span>Search by building or address and filter by price, bedroom count, housing type, and amenities.</span></li><li><strong>Compare</strong><span>Review costs, location, student ratings, safety, maintenance response, and detailed experiences.</span></li><li><strong>Decide</strong><span>Save favorites and use the budget matcher to find options that fit your monthly plan.</span></li></ol></section>
    <section className="about-trust"><div><p className="about-eyebrow">Community standards</p><h2>Reviews with accountability</h2><p>Only verified university accounts can submit reviews. Every submission is reviewed by a moderator, and ratings are shown alongside the written experience—not separated from it.</p></div><Link to="/reviews">Read student reviews</Link></section>
  </main>;
}
