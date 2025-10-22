import React, { useState }  from 'react';

const Navbar = ({ onBotClick }) => {
  const [hoveredLink, setHoveredLink] = React.useState(null);
  const [chatbotHovered, setChatbotHovered] = useState(false);
  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        {['Home','Learn','Analyze'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            style={{
              ...styles.link,
              ...(hoveredLink === item ? styles.linkHover : {})
            }}
            onMouseEnter={() => setHoveredLink(item)}
            onMouseLeave={() => setHoveredLink(null)}
          >
            {item}
          </a>
        ))}
      
      </div>
      
     <div
      style={{ 
        ...styles.chatbot,
        ...(chatbotHovered ? styles.chatbotHover : {})
      }}
      onClick={onBotClick}
      role="button"
      onMouseEnter={() => setChatbotHovered(true)}
      onMouseLeave={() => setChatbotHovered(false)}
    >
      🤖 Ask me
    </div>

    </nav>
  );
};

const styles = {
  nav: {
    position:'sticky',
    top:0,
    zIndex:1000,
    padding:'16px 60px',
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center',
    // background:'rgba(255, 255, 255, 1)',
    backdropFilter:'#000000ff',
    fontFamily:'"Inter", sans-serif',
    // borderBottom:'1px solid #eee'
  },
  left: { display:'flex',gap:'30px'},
  link: {
    textDecoration:'none',
    color:'#ffffffff',
    fontSize:'1.4rem',
    fontWeight:'500',
    padding:'6px 10px',
    borderRadius:'4px',
    transition:'all .25s'
  },
  linkHover:{
    background:'#ffffffff',
    color:'#000000ff'
  },
  chatbot:{
    color:'#ffffffff',
    cursor:'pointer',
    fontSize:'1rem',
    padding:'6px 12px',
    border:'1px solid #ffffffff',
    borderRadius:'20px',
    transition:'all .25s',
  },
  chatbotHover:{
    color:'#000000ff',
    background:'#ffffffff'
  }
}

export default Navbar;
