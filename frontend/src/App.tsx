import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Navbar from "./components/Navbar";
import ResourcePage from "./components/ResourcePage";
import Users from "./components/Users";
import Messages from "./components/Messages"
import { ModalProvider } from "./components/providers/modal-provider";
import Footer from "./components/Footer";

const App = () => {
  return (
    <>
      <ModalProvider />
        <Router>
          <div className="h-full">
            <Navbar />
            <Routes>
              <Route path="/" element={<Users />} />
              <Route path="/resource" element={<ResourcePage />} />
              <Route path="/messages" element={<Messages />} />
            </Routes>
            <Footer />
          </div>
        </Router>`
    </>
  );
};

export default App;
