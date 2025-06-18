// AdminPage.tsx
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

const ADMIN_ID = "admin";
const ADMIN_PW = "0991";

export default function AdminPage() {
  const [login, setLogin] = useState(false);
  const [inputId, setInputId] = useState("");
  const [inputPw, setInputPw] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState<{ uid: string; name: string; country?: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<{ [uid: string]: number }>({});
  const [readUsers, setReadUsers] = useState<string[]>(
    () => JSON.parse(localStorage.getItem("readUsers") || "[]")
  );

  const bottomRef = useRef<HTMLDivElement>(null);

  const handleLogin = () => {
    if (inputId === ADMIN_ID && inputPw === ADMIN_PW) {
      setLogin(true);
    } else {
      alert("관리자 아이디 또는 비밀번호가 틀렸습니다.");
    }
  };

  useEffect(() => {
    if (!login) return;

    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => doc.data() as Message);

      // ✅ 사용자 리스트 구성 (관리자 제외, 최근 메시지 기준 정렬)
      const userMap: {
        [uid: string]: {
          uid: string;
          name: string;
          country?: string;
          lastMessageTime: number;
        };
      } = {};

      msgs.forEach((msg) => {
        if (msg.name === "Admin") return; // 관리자 제외

        const time = msg.createdAt?.toMillis?.() || new Date(msg.createdAt).getTime() || 0;
        if (!userMap[msg.uid] || time > userMap[msg.uid].lastMessageTime) {
          userMap[msg.uid] = {
            uid: msg.uid,
            name: msg.name || "Unknown",
            country: msg.country || "Unknown",
            lastMessageTime: time,
          };
        }
      });

      const sortedUsers = Object.values(userMap).sort(
        (a, b) => b.lastMessageTime - a.lastMessageTime
      );
      setUsers(sortedUsers);

      const unread: { [uid: string]: number } = {};
      msgs.forEach((msg) => {
        if (msg.name !== "Admin" && !readUsers.includes(msg.uid)) {
          unread[msg.uid] = (unread[msg.uid] || 0) + 1;
        }
      });
      setUnreadCounts(unread);

      if (selectedUser) {
        const filtered = msgs.filter((msg) => msg.uid === selectedUser && msg.createdAt);
        setMessages(filtered);
      } else {
        setMessages([]);
      }
    });
  }, [selectedUser, login]);

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
      const updated = [...readUsers, uid];
      setReadUsers(updated);
      localStorage.setItem("readUsers", JSON.stringify(updated));
    }

    setUnreadCounts((prev) => ({ ...prev, [uid]: 0 }));
  };

  const formatTime = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!login) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>관리자 로그인</h2>
        <input
          placeholder="아이디"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          style={{ margin: 5, padding: 5 }}
        />
        <br />
        <input
          placeholder="비밀번호"
          type="password"
          value={inputPw}
          onChange={(e) => setInputPw(e.target.value)}
          style={{ margin: 5, padding: 5 }}
        />
        <br />
        <button onClick={handleLogin} style={{ marginTop: 10 }}>로그인</button>
      </div>
    );
  }

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
