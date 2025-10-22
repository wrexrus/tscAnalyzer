import React, { forwardRef } from "react";
import styles from "./Chatbot.module.css";

const ChatList = forwardRef(({ messages, sending }, ref) => (
  <div ref={ref} className={styles.list}>
    {messages.map((m, i) => (
      <div
        key={i}
        className={`${styles.bubble} ${
          m.role === "user" ? styles.user : styles.assistant
        }`}
      >
        {m.content}
      </div>
    ))}
    {sending && (
      <div className={`${styles.bubble} ${styles.assistant}`}>Thinking…</div>
    )}
  </div>
));

export default ChatList;
