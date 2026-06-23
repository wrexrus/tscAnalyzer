import React, { useEffect, useRef, useState } from 'react';
import { GrPowerReset } from "react-icons/gr";
import styles from './Chatbot.module.css';

const API_BASE = import.meta.env.VITE_API_URL;

export default function Chatbot({ open, onClose }) {
  const [messages, setMessages] = useState([
    { role:'assistant', content:"Hey! I'm your coding buddy. Ask me about Big-O, DSA ✨"}
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(()=>{
    if(open && listRef.current){
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  },[open,messages]);

  if(!open) return null;

  const send=async()=>{
    const text=input.trim();
    if(!text || sending) return;
    const next=[...messages,{ role:'user',content:text }];
    setMessages(next);
    setInput('');
    setSending(true);
    try{
      const res=await fetch(`${API_BASE}/chat`,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ messages: next })
      });
      const data=await res.json();
      setMessages(prev=>[...prev,{ role:'assistant',content:data.reply||'No reply' }]);
    }catch(e){
      setMessages(prev=>[...prev,{ role:'assistant',content:'Server error' }]);
    }finally{ 
      setSending(false);
    }
  };

  return(
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.sheet} onClick={(e)=>e.stopPropagation()}>
        <div className={styles.header}>
          <strong>Assistant</strong>
          <div className={styles.headerButtons}>
            <button className={styles.iconBtn} onClick={()=>setMessages([
              { role:'assistant',content:"Hey! I'm your coding buddy. Ask me about Big-O, DSA, or this app ✨"}
            ])}>  <GrPowerReset /></button>
            <button className={styles.iconBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        <div ref={listRef} className={styles.list}>
          {messages.map((m,i)=>(
            <div key={i} className={`${styles.bubble} ${m.role==='user' ? styles.user : styles.assistant}`}>
              {m.content}
            </div>
          ))}
          {sending && (
            <div className={`${styles.bubble} ${styles.assistant}`}>Thinking…</div>
          )}
        </div>

        <div className={styles.inputRow}>
          <textarea
            value={input}
            onChange={(e)=>setInput(e.target.value)}
            onKeyDown={(e)=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder="Ask anything"
            className={styles.textarea}
          />
          <button onClick={send} disabled={sending||!input.trim()} className={styles.send}>
            {sending?('...'):('Send')}
          </button>
        </div>
      </div>
    </div>
  );
}
