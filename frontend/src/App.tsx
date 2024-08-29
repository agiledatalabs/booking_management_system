import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AddResourcePage from './components/ResourcesMainComponent';
import './App.css';
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <>
      <Router>
        <div className="h-full">
          <Navbar />
          <Routes>
            <Route path="/" element={<AddResourcePage />} />
          </Routes>
        </div>
      </Router>
    </>
  );
};

export default App;
