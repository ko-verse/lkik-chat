import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // ✅ 수정된 부분

interface Props {
  name: string;
  uid: string;
  country: string;
  setName: (name: string) => void;
  setUid: (uid: string) => void;
  setCountry: (country: string) => void;
}

export default function LoginPage({ name, uid, country, setName, setUid, setCountry }: Props) {
  const navigate = useNavigate();

  const handleStart = () => {
    if (!name.trim()) return alert("Please enter your name.");
    setUid(uid || Date.now().toString());
    navigate("/chat");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <img src={logo} alt="LKIK logo" width={100} style={{ marginBottom: 20 }} /> {/* ✅ 추가 */}
      <h1>Enter Your Info</h1>
      <input
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <br />
      <input
        placeholder="Your country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <br />
      <button onClick={handleStart}>Start Chat</button>
    </div>
  );
}
