import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { forgotPassword, resetPassword, verifyEmail } from "../api/auth";
import { useAuth } from "../context/authContext";
import "./FormPage.css";

export default function AccountAction({ mode }) {
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [devToken, setDevToken] = useState("");
  const { signIn } = useAuth();
  const token = params.get("token");
  useEffect(() => {
    if (mode === "verify" && token) verifyEmail(token).then((result) => { signIn(result); setMessage(result.message); }).catch((err) => setError(err.message));
  }, [mode, token, signIn]);
  async function submit(event) { event.preventDefault(); setError(""); try { if (mode === "forgot") { const result = await forgotPassword(email); setMessage(result.message); setDevToken(result.resetToken || ""); } else { const result = await resetPassword(token, password); setMessage(result.message); } } catch (err) { setError(err.message); } }
  const verify = mode === "verify";
  return <main className="form-page"><section><p className="form-eyebrow">Account security</p><h1>{verify ? "Verify your email" : mode === "forgot" ? "Reset your password" : "Choose a new password"}</h1>
    {verify ? <p>{message || error || (token ? "Verifying your student email…" : "Check your university inbox for your verification link.")}</p> : <form onSubmit={submit}><label>{mode === "forgot" ? "University email" : "New password"}<input type={mode === "forgot" ? "email" : "password"} value={mode === "forgot" ? email : password} onChange={(e) => mode === "forgot" ? setEmail(e.target.value) : setPassword(e.target.value)} minLength={mode === "reset" ? 8 : undefined} required /></label>{error && <p className="form-error">{error}</p>}{message && <p className="form-success">{message}</p>}{devToken && <Link to={`/reset-password?token=${devToken}`}>Open local reset link</Link>}<button type="submit">{mode === "forgot" ? "Send reset link" : "Update password"}</button></form>}
    {(message || error) && <p><Link to="/login">Return to login</Link></p>}
  </section></main>;
}
