import { Link } from "react-router-dom";

export function Home() {
  return (
    <div>
      <ul>
        <li>
          <Link to="/tohuwavohu">Tohu Wa Vohu</Link>
        </li>
        <li>
          <Link to="/numberlink">Numberlink</Link>
        </li>
      </ul>
    </div>
  );
}
