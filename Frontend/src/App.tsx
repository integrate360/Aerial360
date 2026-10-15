import MainContent from "./Components/MainContent/MainContent";
import SideBar from "./Components/SideBar/SideBar";
import "./styles/Main.css";
function App() {
  return (
    <div className="App">
      <SideBar />
      <MainContent />
    </div>
  );
}

export default App;
