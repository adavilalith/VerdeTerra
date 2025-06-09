import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LiveDataPage from "./pages/LiveDataPage";
import ModelComparisionPage from "./pages/ModelComparisionPage";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LiveDataPage />} />
        <Route path="/model" element={<ModelComparisionPage />} />
      </Routes>
    </Router>
  );
}

export default App;