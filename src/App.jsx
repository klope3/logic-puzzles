import "./App.css";
import { Home } from "./components/Home/Home";
import { Numberlink } from "./components/Numberlink/Numberlink";
import { TohuWaVohu } from "./components/TohuWaVohu/TohuWaVohu";
import { NavBar } from "./components/common/NavBar";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tohuwavohu" element={<TohuWaVohu />} />
        <Route path="/numberlink" element={<Numberlink />} />
      </Routes>
    </div>
  );
}

export default App;
