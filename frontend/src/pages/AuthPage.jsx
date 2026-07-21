import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, signup } from "../api/auth";
import { useAuth } from "../context/authContext";
import "./AuthPage.css";

export default function AuthPage({ mode }) {
  const isSignup = mode === "signup";
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  function update(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const action = isSignup ? signup : login;
      const session = await action(values);
      signIn(session);
      if (isSignup) navigate(session.verificationToken ? `/verify?token=${session.verificationToken}` : "/verify");
      else navigate("/");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card__mark">P</div>
        <p className="auth-card__eyebrow">GSU student housing</p>
        <h1>{isSignup ? "Join PantherDen" : "Welcome back"}</h1>
        <p className="auth-card__intro">
          {isSignup
            ? "Create an account to save housing options and share your experience."
            : "Log in to continue exploring housing near Georgia State."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignup && (
            <label>
              Full name
              <input name="name" value={values.name} onChange={update} autoComplete="name" minLength="2" required />
            </label>
          )}
          <label>
            Email address
            <input name="email" type="email" value={values.email} onChange={update} autoComplete="email" required />
          </label>
          {!isSignup && <Link className="auth-form__forgot" to="/forgot-password">Forgot password?</Link>}
          <label>
            Password
            <input name="password" type="password" value={values.password} onChange={update} autoComplete={isSignup ? "new-password" : "current-password"} minLength={isSignup ? 8 : undefined} required />
          </label>

          {error && <p className="auth-form__error" role="alert">{error}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? "Please wait…" : isSignup ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="auth-card__switch">
          {isSignup ? "Already have an account?" : "New to PantherDen?"}{" "}
          <Link to={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Log in" : "Create an account"}
          </Link>
        </p>
      </section>
    </main>
  );
}
