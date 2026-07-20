import {useState} from "react"

export default function Budget() {
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [bedCount, setbedCount] = useState('');

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Match My Budget</h1>
      <p style={{ color: "var(--muted)" }}>Budget page — build me out.</p>
    </main>
  );
}

