import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

interface Message {
  text: string;
  name: string;
  createdAt: any;
  uid: string;
  country?: string;
}

export default function AdminPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState<{ uid: string; name: string; country?: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<{ [uid: string]: number }>({});
  const [readUsers, setReadUsers] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => doc.data() as Message);

      const userMap: { [uid: string]: { uid: string; name: string; country?: string } } = {};
      const unread: { [uid: string]: number } = {};

      msgs.forEach((msg) => {
        if (!userMap[msg.uid]) {
          userMap[msg.uid] = {
            uid: msg.uid,
            name: msg.name || "Unknown",
            country: msg.country || "Unknown",
          };
        }

        if (msg.name !== "Admin" && !readUsers.includes(msg.uid)) {
          unread[msg.uid] = (unread[msg.uid] || 0) + 1;
        }
      });

      setUsers(Object.values(userMap));
      setUnreadCounts(unread);

      if (selectedUser) {
        const filtered = msgs.filter((msg) => msg.uid === selectedUser && msg.createdAt);
        setMessages(filtered);
      }
    });
  }, [selectedUser, readUsers]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedUser) return;
    const newMessage: Message = {
      text: input,
      name: "Admin",
      uid: selectedUser,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);

    await addDoc(collection(db, "messages"), {
      ...newMessage,
      createdAt: serverTimestamp(),
    });
    setInput("");
  };

  const handleSelectUser = (uid: string) => {
    setSelectedUser(uid);
    if (!readUsers.includes(uid)) {
      setReadUsers((prev) => [...prev, uid]);
    }
    setUnreadCounts((prev) => ({ ...prev, [uid]: 0 }));
  };

  const formatTime = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={{ display: "flex" }}>
      {/* 유저 목록 */}
      <div style={{ width: 250, borderRight: "1px solid gray", padding: 10 }}>
        <h3>👥 Users</h3>
        {users.map((user) => (
          <div
            key={user.uid}
            onClick={() => handleSelectUser(user.uid)}
            style={{
              fontWeight: user.uid === selectedUser ? "bold" : "normal",
              cursor: "pointer",
              marginBottom: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              {user.name || "Unknown"} ({user.country || "Unknown"})
            </span>
            {!readUsers.includes(user.uid) && unreadCounts[user.uid] > 0 && (
              <span
                style={{
                  backgroundColor: "red",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 8px",
                  fontSize: 12,
                  marginLeft: 8,
                }}
              >
                {unreadCounts[user.uid]}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 채팅 화면 */}
      <div style={{ flex: 1, padding: 10 }}>
        <h2>👩‍💼 Admin Chat</h2>
        <div style={{ border: "1px solid gray", height: 400, overflowY: "scroll", padding: 10 }}>
          {messages.map((msg, i) => {
            const isAdmin = msg.name === "Admin";
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: isAdmin ? "row-reverse" : "row",
                  alignItems: "flex-end",
                  marginBottom: 12,
                }}
              >
                <img
                  src="https://www.gravatar.com/avatar?d=mp"
                  alt="avatar"
                  style={{ width: 36, height: 36, borderRadius: "50%", margin: "0 8px" }}
                />
                <div style={{ maxWidth: "70%" }}>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>
                    <strong>{msg.name}</strong> • {formatTime(msg.createdAt)}
                  </div>
                  <div
                    style={{
                      backgroundColor: isAdmin ? "#DCF8C6" : "#FFFFFF",
                      padding: "8px 12px",
                      borderRadius: 12,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
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
      </div>
    </div>
  );
}
