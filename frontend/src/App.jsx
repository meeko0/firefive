import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Browse from "./pages/Browse";
import PropertyDetail from "./pages/PropertyDetail";
import Reviews from "./pages/Reviews";
import WriteReview from "./pages/WriteReview";
import About from "./pages/About";
import Budget from "./pages/Budget";

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Browse />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/write-review" element={<WriteReview />} />
        <Route path="/about" element={<About />} />
        <Route path="/budget" element={<Budget />} />
      </Routes>
    </>
  );
}
