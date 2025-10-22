import React, { useState, useEffect } from "react";

function Home(){
  const mainText = "Think faster. Code smarter.";
  const [displayedText,setDisplayedText] = useState('');
  const [textIndex,setTextIndex]   = useState(0);
  const [showSub,setShowSub]       = useState(false);
  const [showTag,setShowTag]       = useState(false);

  useEffect(()=>{
    if(textIndex < mainText.length){
      const t = setTimeout(()=>{
        setDisplayedText((p)=>p+mainText[textIndex]);
        setTextIndex(textIndex+1);
      },60);
      return ()=> clearTimeout(t);
    } else {
      setTimeout(()=>setShowSub(true),300);
      setTimeout(()=>setShowTag(true),800);
    }
  },[textIndex]);

  return (
    <section id="home" style={styles.section}>
      <h1 style={styles.hero}>{displayedText}</h1>

      <p style={{...styles.sub, opacity:showSub?1:0}}>
        Your complexity journey starts here
      </p>
      <h3 style={{...styles.tag, opacity:showTag?1:0}}>
        Crack the code — before it cracks your runtime!
      </h3>
    </section>
  );
}

const styles={
  section:{
    height:'90vh',
    display:'flex',
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center', 
    color:'#ffffffff',
    fontFamily:'"Inter", sans-serif',
    textAlign:'center',
    minheight:'80vh',
    // fontSize: '80rem'
  },
  hero:{
    fontSize:'3.5rem',
    fontWeight:'700',
    letterSpacing:'1px'
  },
  sub:{
    marginTop:'10px',
    fontSize:'1.6rem',
    transition:'opacity .6s',
  },
  tag:{
    marginTop:'4px',
    fontSize:'1.3rem',
    fontWeight:500,
    transition:'opacity .6s'
  }
}

export default Home;
