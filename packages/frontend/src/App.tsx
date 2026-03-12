import "./App.css";
import Navigation from "./components/navigation";
import Footer from "./components/footer";
import RecipesPage from "./pages/recipepage";
import Home from "./pages/Home";
import About from "./pages/About";
import Account from "./pages/Account";
import Settings from "./pages/Settings";
import ShareRecipeForm from "./components/sharerecipe";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/account" element={<Account />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <ShareRecipeForm />
        <Footer />
      </div>
    </>
  );
}

export default App;
