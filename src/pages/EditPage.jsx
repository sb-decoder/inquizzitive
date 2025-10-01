import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './edit.css';

export default function EditPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [npass, setNPass] = useState("");
  const gridRef = useRef(null);
  const mainRef = useRef(null);
  const maxMovement = 16;
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.background = '#1a1a2e';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;
      const moveX = (mouseX - 0.5) * maxMovement;
      const moveY = (mouseY - 0.5) * maxMovement;
      requestAnimationFrame(() => {
        if (gridRef.current) {
          gridRef.current.style.transform = `translate(${-moveX}px, ${-moveY}px)`;
        }
        if (mainRef.current) {
          mainRef.current.style.transform = `translate(${8 + moveX * 0.4}px, ${8 + moveY * 0.4}px)`;
          mainRef.current.style.boxShadow = `var(--primary) ${12 - moveX * 0.4}px ${12 - moveY * 0.4}px`;
        }
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const submitData = async () => {
    try {
      const response = await fetch("http://localhost:8000/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, npass }),
      });
      const data = await response.json();
      if (!data.isValid) {
        alert(data.message);
        return;
      }
      if (data.isValid) {
        alert("Password changed successfully! Please log in again.");
        navigate('/login');
      }
    } catch (error) {
      console.error("Edit password error:", error);
      alert("An error occurred. Is the Deno backend server running?");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      submitData();
    }
  };

  return (
    <div className="login-container">
      <div id="parallax-grid" ref={gridRef}> </div>
      <div id="main-login" ref={mainRef}>
        <h1>CHANGE PASSWORD</h1>
        <div id="login">
          <input type="text" id="user" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" id="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="password" id="new-password" placeholder="New Password" value={npass} onKeyDown={handleKeyDown} onChange={(e) => setNPass(e.target.value)} />
          <button id="submit" onClick={submitData}>CONTINUE</button>
          <div className="link-container">
            <Link className="CP" to="/login"> Back To Login </Link>
          </div>
        </div>
      </div>
    </div>
  );
}