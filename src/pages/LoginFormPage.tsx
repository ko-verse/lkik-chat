import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function LoginFormPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const uid = user.uid;
      const name = user.displayName || "anonymous";
      const country = "unknown";

      localStorage.setItem("uid", uid);

      navigate("/chat", {
        state: { name, uid, country },
      });
    } catch (err: any) {
      alert("로그인 실패: " + err.message);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h1>Login (Email/Password)</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <br />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
