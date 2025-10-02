// src/pages/CreateAccPage.jsx

import { useState, useEffect, useRef } from 'react'; // ADDED useEffect and useRef
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css'; // CHANGED to use the main App.css file

export default function CreateAccPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDOB] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  // --- PARALLAX EFFECT CODE ---
  const gridRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const maxMovement = 12;
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;
      const moveX = (mouseX - 0.5) * maxMovement;
      const moveY = (mouseY - 0.5) * maxMovement;

      requestAnimationFrame(() => {
        if (gridRef.current) {
          gridRef.current.style.transform = `translate(${-moveX}px, ${-moveY}px)`;
        }
        if (cardRef.current) {
          cardRef.current.style.transform = `translate(${moveX * 0.3}px, ${moveY * 0.3}px)`;
          cardRef.current.style.boxShadow = `${8 + moveX * 0.4}px ${8 + moveY * 0.4}px 0px #e53e3e`;
        }
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  // --- END OF PARALLAX CODE ---

  const submitData = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/createAcc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, dob, password }),
      });
      const data = await response.json();
      alert(data.message);

      if (data.isValid) {
        login(data.user);
        navigate('/account-setup');
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
      console.error("Sign up error:", error);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-grid" ref={gridRef}></div>
      
      <div className="auth-card" ref={cardRef}>
        <h1>SIGN UP</h1>
        <form className="auth-form" onSubmit={submitData}>
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required/>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required/>
          <input type="date" placeholder="Date Of Birth" value={dob} onChange={(e) => setDOB(e.target.value)} required/>
          <input type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
          <button type="submit" className="auth-btn">CREATE ACCOUNT</button>
          <div className="link-container">
            <Link className="CP" to="/login"> Already Have an Account? </Link>
          </div>
        </form>
      </div>
    </div>
  );
}