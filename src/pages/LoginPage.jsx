// src/pages/LoginPage.jsx

import { useState, useEffect, useRef } from 'react'; // ADDED useEffect and useRef
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css'; 

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  // --- PARALLAX EFFECT CODE ---
  const gridRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const maxMovement = 12; // A slightly more subtle effect
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;
      const moveX = (mouseX - 0.5) * maxMovement;
      const moveY = (mouseY - 0.5) * maxMovement;

      requestAnimationFrame(() => {
        if (gridRef.current) {
          // Move the grid in the opposite direction of the mouse
          gridRef.current.style.transform = `translate(${-moveX}px, ${-moveY}px)`;
        }
        if (cardRef.current) {
          // Move the card slightly with the mouse and adjust the shadow
          cardRef.current.style.transform = `translate(${moveX * 0.3}px, ${moveY * 0.3}px)`;
          cardRef.current.style.boxShadow = `${8 + moveX * 0.4}px ${8 + moveY * 0.4}px 0px #e53e3e`;
        }
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []); // The empty array ensures this runs only once
  // --- END OF PARALLAX CODE ---

  const submitData = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.isValid) {
        login(data.user);
        navigate('/');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("An error occurred during login. Please try again.");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* We add the separate grid div back for the effect */}
      <div className="auth-grid" ref={gridRef}></div> 

      <div className="auth-card" ref={cardRef}>
        <h1>SIGN IN</h1>
        <form className="auth-form" onSubmit={submitData}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="auth-btn">CONTINUE</button>
          <div className="link-container">
            <Link className="CP" to="/createAcc">Create A New Account</Link>
            <Link className="CP" to="/edit">Change Password</Link>
          </div>
        </form>
      </div>
    </div>
  );
}