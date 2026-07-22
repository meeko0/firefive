import { NavLink } from "react-router-dom";
import "./NavBar.css";
import { useAuth } from "../context/authContext";

const linkClass = ({ isActive }) => (isActive ? "is-active" : "");

export default function NavBar() {
  const { user, signOut } = useAuth();

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
      {user ? (
        <div className="navbar__account">
          <NavLink to="/profile">Hi, {user.name.split(" ")[0]}</NavLink>
          {(user.isModerator || user.isAdmin) && <NavLink to="/admin">{user.isAdmin ? "Admin" : "Moderator"}</NavLink>}
          <button type="button" onClick={signOut}>Log out</button>
        </div>
      ) : (
        <div className="navbar__auth">
          <NavLink to="/login">Log in</NavLink>
          <NavLink to="/signup">Sign up</NavLink>
        </div>
      )}
    </header>
  );
}
