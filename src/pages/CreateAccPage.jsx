import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './createAcc.css';

function CreateAcc() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDOB] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const gridRef = useRef(null);
  const mainRef = useRef(null);
  const maxMovement = 16;

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
        if (gridRef.current) { gridRef.current.style.transform = `translate(${-moveX}px, ${-moveY}px)`; }
        if (mainRef.current) {
          mainRef.current.style.transform = `translate(${8 + moveX * 0.4}px, ${8 + moveY * 0.4}px)`;
          mainRef.current.style.boxShadow = `var(--primary) ${12 - moveX * 0.4}px ${12 - moveY * 0.4}px`;
        }
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => { document.removeEventListener('mousemove', handleMouseMove); };
  }, []);

  const submitData = async () => {
    try {
      const response = await fetch("http://localhost:8000/createAcc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, dob, password }),
      });
      const data = await response.json();
      alert(data.message);
      if (data.isValid) {
        navigate('/login');
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
      console.error("Sign up error:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      submitData();
    }
  };

  return (
    <div className="login-container">
      <title>SIGN UP</title>
      <div id="parallax-grid" ref={gridRef}> </div>
      <div id="main-login" ref={mainRef}>
        <h1>SIGN UP</h1>
        <div id="login">
          <input type="text" id="name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="text" id="user" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="date" id="dob" placeholder="Date Of Birth" value={dob} onChange={(e) => setDOB(e.target.value)} />
          <input type="password" id="password" placeholder="New Password" value={password} onKeyDown={handleKeyDown} onChange={(e) => setPassword(e.target.value)} />
          <button id="submit" onClick={(e) => { e.preventDefault(); submitData(); }}>CONTINUE</button>
          <div className="link-container">
            <Link className="CP" to="/login"> Already Have an Account </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateAcc;