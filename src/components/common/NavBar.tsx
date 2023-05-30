import { Link } from "react-router-dom";

export function NavBar() {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
