import "./App.css";
import Navigation from "./components/navigation";
import ShareRecipe from "./components/sharerecipe";
import Footer from "./components/footer";
import RecipesPage from "./pages/recipepage";
import About from "./pages/About";
import Account from "./pages/Account";
import Settings from "./pages/Settings";

import { Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<RecipesPage />} />
        <Route path="/recipes" element={<Navigate to="/" replace />} />
        <Route path="/about" element={<About />} />
        <Route path="/account" element={<Account />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>

      <ShareRecipe />
      <Footer />
    </>
  );
}

export default App;
