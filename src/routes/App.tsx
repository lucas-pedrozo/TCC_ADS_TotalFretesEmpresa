import { Routes, Route } from "react-router-dom";

import SingUpPage from "@/pages/SingUp";
import LoginPage from "@/pages/Login";
import HomePage from "@/pages/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/SignUp" element={<SingUpPage />} />

      <Route path="/Home" element={<HomePage />} />
    </Routes>
  );
}

export default App;