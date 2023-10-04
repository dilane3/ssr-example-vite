import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ display: "block" }}>
      <h1>Home</h1>
      <p>This is the home page.</p>

      <div>
        <Link to="/setting">Go to setting page</Link>
      </div>
      <Link to="/profile">Go to profile page</Link>
    </div>
  );
}
