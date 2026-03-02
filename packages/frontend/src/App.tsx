import "./App.css";
import Navigation from "./components/navigation";
import ComingSoon from "./components/comingsoon";
import ShareRecipe from "./components/sharerecipe";
import Footer from "./components/footer";
import RecipesPage from "./pages/recipepage";

function App() {
  return (
    <>
      <Navigation />
      <RecipesPage />
      <ShareRecipe />
      <Footer />
    </>
  );
}

export default App;
