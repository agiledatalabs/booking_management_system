import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import AddResourcePage from './components/ResourcesMainComponent';
import './App.css';
import Navbar from "./components/Navbar";
import ResourcePage from "./components/ResourcePage";
import { ModalProvider } from "./components/providers/modal-provider";

const App = () => {
  return (
    <>
    <ModalProvider />
      <Router>
        <div className="h-full">
          <Navbar />
          <Routes>
            <Route path="/" element={<ResourcePage />} />
          </Routes>
        </div>
      </Router>
    </>
  );
};

export default App;
