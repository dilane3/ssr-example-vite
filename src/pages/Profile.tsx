import { Link } from "react-router-dom"

export default function Profile() {
  return (
    <div>
      <h1>Profile</h1>
      <p>This is the Profile page.</p>

      <Link to="/">Go to home page</Link>
    </div>
  )
}