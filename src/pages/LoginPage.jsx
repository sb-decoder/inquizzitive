import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './login.css';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const gridRef = useRef(null);
  const mainRef = useRef(null);
  const maxMovement = 16;
  const { login } = useAuth();
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
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!data.isValid) {
        alert(data.message);
        return;
      }
      if (data.isValid) {
        login(data.user);
        navigate('/');
      }

    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      submitData();
    }
  };

  return (
    <div className="login-container">
      <title>LOG IN</title>
      <div id="parallax-grid" ref={gridRef}> </div>
      <div id="main-login" ref={mainRef}>
        <div id="toggle">
        </div>

        <h1>SIGN IN</h1>
        <div id="login">
          <input type="text" id="user" placeholder="Username" value={username.trim()} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" id="password" placeholder="Password" value={password.trim()} onKeyDown={handleKeyDown} onChange={(e) => setPassword(e.target.value)} />
          <button id="submit" onClick={(e) => { e.preventDefault(); submitData(); }}>CONTINUE</button>
          <div className="link-container">
            <Link className="CP" to="/createAcc"> Create A New Account </Link>
            <Link className="CP" to="/edit"> Change Password </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;