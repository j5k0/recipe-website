import "./App.css";
import Navigation from "./components/navigation";
import ComingSoon from "./components/comingsoon";
import ShareRecipe from "./components/sharerecipe";
import Footer from "./components/footer";
import { Routes, Route } from "react-router-dom";

function Home() { return <div className="pt-20 px-6">Home</div>; }
function Recipes() { return <div className="pt-20 px-6">Recipes</div>; }
function About() { return <div className="pt-20 px-6">About</div>; }
function Account() { return <div className="pt-20 px-6">Account</div>; }
function Settings() { return <div className="pt-20 px-6">Settings</div>; }

function App() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/about" element={<About />} />
        <Route path="/account" element={<Account />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <ComingSoon />
      <ShareRecipe />
      <Footer />
    </>
  );
}

export default App;
