import { Routes, Route } from "react-router";

import SingUpPage from "@/pages/SingUp";
import HomePage from "@/pages/Home";
import LoginPage from "@/pages/Login";

const PrivateHome = () => {
  return <HomePage />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/SignUp" element={<SingUpPage />} />
      <Route path="/Home" element={<PrivateHome />} />
    </Routes>
  );
}

export default App;