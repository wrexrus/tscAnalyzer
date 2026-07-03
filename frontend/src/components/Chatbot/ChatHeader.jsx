import React from "react";
// import { GrPowerReset } from "react-icons/gr";
import styles from "./Chatbot.module.css";
import { X } from 'lucide-react';

const ChatHeader = ({ onClose, onReset }) => (
  <div className={styles.header}>
    <strong>Assistant</strong>
    <div className={styles.headerButtons}>
      <button className={styles.iconBtn} onClick={onReset}>
        <GrPowerReset />
      </button>
      <button className={styles.iconBtn} onClick={onClose}>
        <X />
      </button>
    </div>
  </div>
);

export default ChatHeader;
