// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import AdminPage from "./pages/AdminPage";

function App() {
  const [name, setName] = useState("");
  const [uid, setUid] = useState("");
  const [country, setCountry] = useState("");

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <LoginPage
              name={name}
              uid={uid}
              country={country}
              setName={setName}
              setUid={setUid}
              setCountry={setCountry}
            />
          }
        />
        <Route path="/admin" element={<AdminPage />} />
        <Route
          path="/chat"
          element={<ChatPage name={name} uid={uid} country={country} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
