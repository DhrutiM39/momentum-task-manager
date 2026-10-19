import { useState } from "react";
import * as api from "../api/taskApi.js";

export default function AuthForm({ onAuthenticate, notice }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (mode === "register") {
        await api.registerUser({ email, password });
      }
      const response = await api.loginUser({ email, password });
      onAuthenticate(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || "Could not connect to the API");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode((current) => current === "login" ? "register" : "login");
    setError("");
  };

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-panel__brand">
          <span className="auth-panel__mark" aria-hidden="true">M</span>
          <span>MOMENTUM / TASK MANAGER</span>
        </div>
        <p className="auth-panel__eyebrow">YOUR WORKSPACE, IN FOCUS</p>
        <h1 id="auth-title">{mode === "login" ? "Welcome back." : "Make it yours."}</h1>
        <p className="auth-panel__copy">
          {mode === "login" ? "Sign in to pick up where you left off." : "Create an account to start organizing your work."}
        </p>

        {notice && <div className="auth-message" role="status">{notice}</div>}
        {error && <div className="auth-message auth-message--error" role="alert">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="auth-email">Email address</label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button className="auth-form__submit" type="submit" disabled={submitting}>
            {submitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="auth-panel__switch">
          {mode === "login" ? "New to Momentum?" : "Already have an account?"}
          <button type="button" onClick={toggleMode}>
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </section>
      <aside className="auth-aside" aria-hidden="true">
        <div className="auth-aside__art">
          <div className="auth-aside__orbit">
            <span className="auth-aside__orbit-dot" />
            <span className="auth-aside__orbit-dot" />
            <div className="auth-aside__note">
              <span className="auth-aside__note-check" />
              <span />
              <span />
            </div>
          </div>
        </div>
        <p>PLAN WITH INTENTION.<br />MOVE WITH MOMENTUM.</p>
        <div className="auth-aside__rule" />
      </aside>
    </main>
  );
}