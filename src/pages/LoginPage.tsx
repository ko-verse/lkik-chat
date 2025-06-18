// LoginPage.tsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";
import logo from "../assets/logo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(false);

  useEffect(() => {
    const savedUid = localStorage.getItem("uid");
    const savedEmail = localStorage.getItem("email");
    if (savedUid && savedEmail) {
      navigate("/chat", { state: { uid: savedUid, email: savedEmail } });
    }
  }, []);

  const handleAuth = async () => {
    try {
      if (isLoginMode) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        localStorage.setItem("uid", user.uid);
        localStorage.setItem("email", email);
        navigate("/chat", { state: { uid: user.uid, email } });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        localStorage.setItem("uid", user.uid);
        localStorage.setItem("email", email);
        navigate("/chat", { state: { uid: user.uid, email } });
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent.");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <img src={logo} alt="logo" width={100} style={{ marginBottom: 20 }} />
      <h1>Enter Your Info</h1>

      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <br />
      <input
        type="password"
        placeholder="Your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <br />
      {!isLoginMode && (
        <p style={{ fontSize: 12, color: "gray", marginBottom: 10 }}>
          * Password must be at least 6 characters long.
        </p>
      )}
      <button onClick={handleAuth}>
        {isLoginMode ? "Login" : "Start Chat"}
      </button>
      <br />
      <button onClick={() => setIsLoginMode(!isLoginMode)} style={{ marginTop: 10 }}>
        {isLoginMode ? "Go to Sign Up" : "Already a member? Login"}
      </button>
      <br />
      <button onClick={handleResetPassword} style={{ marginTop: 10 }}>
        Forgot Password
      </button>
    </div>
  );
}
