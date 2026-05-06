import "./App.css";
import Navigation from "./components/navigation";
import Footer from "./components/footer";
import RecipesPage from "./pages/recipepage";
import Home from "./pages/Home";
import About from "./pages/About";
import Account from "./pages/Account";
import Settings from "./pages/Settings";
import Discover from "./pages/Discover";
import TopRecipes from "./pages/TopRecipes";
import LikedRecipes from "./pages/LikedRecipes";
import { Navigate, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext"

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/top-recipes" element={<TopRecipes />} />
            <Route path="/about" element={<About />} />
            <Route path="/account" element={<Account />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/liked" element={<LikedRecipes />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
