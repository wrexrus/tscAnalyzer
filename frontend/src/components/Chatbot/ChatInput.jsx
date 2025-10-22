import React from "react";
import styles from "./Chatbot.module.css";

const ChatInput = ({ input, setInput, send, sending }) => (
  <div className={styles.inputRow}>
    <textarea
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          send();
        }
      }}
      placeholder="Ask anything"
      className={styles.textarea}
    />
    <button
      onClick={send}
      disabled={sending || !input.trim()}
      className={styles.send}
    >
      {sending ? "..." : "Send"}
    </button>
  </div>
);

export default ChatInput;
