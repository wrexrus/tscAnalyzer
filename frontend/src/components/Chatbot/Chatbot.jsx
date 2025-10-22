import React, { useEffect, useRef, useState } from 'react';
import { GrPowerReset } from "react-icons/gr";

const API_BASE = import.meta.env.REACT_APP_API_BASE || "http://localhost:5000";

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
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.sheet} onClick={(e)=>e.stopPropagation()}>
        <div style={styles.header}>
          <strong>Assistant</strong>
          <div style={{display:'flex',gap:'10px'}}>
            <button style={styles.iconBtn} onClick={()=>setMessages([
              { role:'assistant',content:"Hey! I'm your coding buddy. Ask me about Big-O, DSA, or this app ✨"}
            ])}>  <GrPowerReset /></button>
            <button style={styles.iconBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        <div ref={listRef} style={styles.list}>
          {messages.map((m,i)=>(
            <div key={i} style={{...styles.bubble, ...(m.role==='user'?styles.user:styles.assistant)}}>
              {m.content}
            </div>
          ))}
          {sending && (
            <div style={{...styles.bubble,...styles.assistant}}>Thinking…</div>
          )}
        </div>

        <div style={styles.inputRow}>
          <textarea
            value={input}
            onChange={(e)=>setInput(e.target.value)}
            onKeyDown={(e)=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder="Ask anything"
            style={styles.textarea}
          />
          <button onClick={send} disabled={sending||!input.trim()} style={styles.send}>
            {sending?('...'):('Send')}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles={
  backdrop:{
    position:'fixed',bottom:'20px',right:'20px',zIndex:2000
  },
  sheet:{
    width:'350px',
    height:'480px',
    background:'#fefefe',
    color:'#000',
    border:'1px solid #ddd',
    borderRadius:'12px',
    boxShadow:'0 4px 20px rgba(0,0,0,0.2)',
    display:'flex',flexDirection:'column',
    overflow:'hidden'
  },
  header:{
    padding:'10px 16px',
    borderBottom:'1px solid #eee',
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center',
    fontFamily:'Inter,sans-serif',
  },
  iconBtn:{
    background:'transparent',
    border:'none',
    fontSize:'1.1rem',
    cursor:'pointer'
  },
  list:{
    flex:1,
    overflowY:'auto',
    padding:'12px',
    display:'flex',
    flexDirection:'column',
    gap:'8px'
  },
  bubble:{
    padding:'8px 12px',
    borderRadius:'10px',
    maxWidth:'80%',
    lineHeight:1.3,
    fontFamily:'Inter,sans-serif'
  },
  user:{ alignSelf:'flex-end', background:'#000',color:'#fff'},
  assistant:{ alignSelf:'flex-start', background:'#eaeaea',color:'#000'},
  inputRow:{
    display:'flex',alignItems:'center',gap:'8px',
    borderTop:'1px solid #eee',
    padding:'10px'
  },
  textarea:{
    flex:1,minHeight:'38px',maxHeight:'100px',
    resize:'vertical',border:'1px solid #ccc',
    borderRadius:'8px',fontFamily:'Inter,sans-serif',
    padding:'6px 8px'
  },
  send:{
    background:'#000',color:'#fff',
    border:'none',borderRadius:'8px',
    padding:'8px 16px',cursor:'pointer'
  }
};
