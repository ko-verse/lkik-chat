// ChatPage.tsx
import { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useLocation } from "react-router-dom";

interface Message {
  text: string;
  name: string;
  createdAt: any;
  uid: string;
  to?: string;
  country?: string;
}

export default function ChatPage() {
  const location = useLocation();
  const { email = "anonymous", uid } = location.state || {};

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [lastSavedLength, setLastSavedLength] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map((doc) => doc.data() as Message)
        .filter(
          (msg) =>
            msg.createdAt &&
            (msg.uid === uid || (msg.uid === "admin" && msg.to === uid))
        );

      const newAdminMessages = msgs.filter(
        (msg) =>
          msg.name === "Admin" &&
          msg.to === uid &&
          msg.text !== lastMessageRef.current
      );

      if (newAdminMessages.length > 0) {
        setUnreadCount((prev) => prev + newAdminMessages.length);
        lastMessageRef.current =
          newAdminMessages[newAdminMessages.length - 1].text;
      }

      setMessages(msgs);
    });
  }, [uid]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length > lastSavedLength) {
      setSaved(false);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await addDoc(collection(db, "messages"), {
      text: input,
      name: email,
      uid,
      createdAt: serverTimestamp(),
    });
    setInput("");
    setUnreadCount(0);
  };

  const handleFocus = () => {
    setUnreadCount(0);
  };

  const handleSave = () => {
    setSaved(true);
    setLastSavedLength(messages.length);
  };

  const formatTime = (timestamp: any) => {
    const date = timestamp?.toDate?.();
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div onClick={handleFocus} style={{ padding: 20 }}>
      <h2>
        💬 Chat Room{" "}
        {unreadCount > 0 && (
          <span
            style={{
              background: "red",
              color: "white",
              borderRadius: "50%",
              padding: "2px 8px",
              fontSize: 14,
              marginLeft: 10,
            }}
          >
            {unreadCount}
          </span>
        )}
      </h2>

      <div
        style={{
          height: 500,
          overflowY: "scroll",
          padding: 20,
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.map((msg, i) => {
          const isOwn = msg.uid === uid && msg.name !== "Admin";
          const alignRight = isOwn;
          const bubbleStyle: React.CSSProperties = {
            maxWidth: "60%",
            padding: 10,
            borderRadius: 10,
            backgroundColor: alignRight ? "#d1f5d3" : "#fff",
            textAlign: "left",
            marginBottom: 10,
          };
          const containerStyle: React.CSSProperties = {
            display: "flex",
            justifyContent: alignRight ? "flex-end" : "flex-start",
            gap: 10,
            alignItems: "flex-end",
          };

          const profileImage = (
            <img
              src="https://www.gravatar.com/avatar?d=mp"
              alt="profile"
              width={30}
              height={30}
              style={{ borderRadius: "50%" }}
            />
          );

          const nameDisplay = (
            <div style={{ fontWeight: "bold", marginBottom: 5 }}>
              {msg.name === "Admin" ? "Admin (Korea)" : msg.name || "Unknown"}
            </div>
          );

          return (
            <div key={i} style={containerStyle}>
              {!alignRight && profileImage}
              <div style={bubbleStyle}>
                {nameDisplay}
                <div>{msg.text}</div>
                <div style={{ fontSize: 10, textAlign: "right", marginTop: 5 }}>
                  {formatTime(msg.createdAt)}
                </div>
              </div>
              {alignRight && profileImage}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ marginTop: 10 }}>
        <input
          style={{ width: "80%" }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message"
        />
        <button onClick={handleSend}>Send</button>
      </div>

      <div style={{ marginTop: 20 }}>
        {saved ? (
          <span style={{ color: "green", fontWeight: "bold" }}>
            ✅ Saved
          </span>
        ) : (
          <button onClick={handleSave}>📅 Save chat history</button>
        )}
      </div>
    </div>
  );
}
