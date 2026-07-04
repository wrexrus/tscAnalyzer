import React, { useEffect, useRef, useState } from 'react';
import { GrPowerReset } from "react-icons/gr";
import styles from './Chatbot.module.css';
import { API_BASE_URL } from "../../api";
import { X } from 'lucide-react';

export default function Chatbot({ open, onClose }) {
  const [messages, setMessages] = useState([
    { role:'assistant', content:"Hey! I'm your coding buddy. Ask me about Big-O, DSA;"}
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(()=>{
    const handleAuthChange = () => {
      setMessages([{ role:'assistant', content:"Hey! I'm your coding buddy. Ask me about Big-O, DSA;"}]);
    };
    window.addEventListener('authChanged', handleAuthChange);
    return () => window.removeEventListener('authChanged', handleAuthChange);
  }, []);

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
    try {
      const res=await fetch(`${API_BASE_URL}/chat`,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ messages: next })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let assistantReply = "";
      
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      setSending(false); 

      let buffer = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop(); // Keep the last incomplete part in the buffer
          
          for (const part of parts) {
            const lines = part.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6);
                if (dataStr === '[DONE]') {
                  done = true;
                  break;
                }
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.text) {
                    for (const char of parsed.text) {
                      assistantReply += char;
                      setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1].content = assistantReply;
                        return newMessages;
                      });
                      await new Promise(r => setTimeout(r, 10));
                    }
                  }
                } catch (e) {}
              }
            }
          }
        }
      }
    }catch(e){
      setMessages(prev=>[...prev,{ role:'assistant',content:'Server error' }]);
      setSending(false);
    }
  };

  return(
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.sheet} onClick={(e)=>e.stopPropagation()}>
        <div className={styles.header}>
          <strong>Assistant </strong>
          <div className={styles.headerButtons}>
            
            <button className={styles.iconBtn} onClick={()=>setMessages([
              { role:'assistant',content:"Hey! I'm your coding buddy. Ask me about Big-O, DSA;"}
            ])}>  <GrPowerReset /></button>
            <button className={styles.iconBtn} onClick={onClose}><X /></button>
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
