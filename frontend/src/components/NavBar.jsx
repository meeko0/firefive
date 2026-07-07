import { NavLink } from "react-router-dom";
import "./NavBar.css";

const linkClass = ({ isActive }) => (isActive ? "is-active" : "");

export default function NavBar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="navbar__logo">PantherDen</NavLink>
      <nav className="navbar__links">
        <NavLink to="/" end className={linkClass}>Browse</NavLink>
        <NavLink to="/reviews" className={linkClass}>Reviews</NavLink>
        <NavLink to="/about" className={linkClass}>About</NavLink>
        <NavLink to="/budget" className={linkClass}>Budget</NavLink>
      </nav>
      <NavLink to="/write-review" className="navbar__cta">+ Write a review</NavLink>
    </header>
  );
}
