import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
  e.preventDefault();

  try {
    // Send POST request to backend with role included
    const response = await fetch("http://127.0.0.1:5000/register/student", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role: "student", // explicitly set student role
      }),
    });

    // Parse JSON response from backend
    const data = await response.json();

    if (response.ok) {
      // Registration successful
      alert("Registration successful! You can now login.");
      navigate("/StudentLogin"); // redirect to login page
    } else {
      // Registration failed
      alert(`Registration failed: ${data.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error during registration:", error);
    alert("An error occurred. Please try again.");
  }
};



  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        padding: '50px 20px',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          border: '4px solid #6f42c1', // purple border
          padding: '50px 40px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 4px 25px rgba(0,0,0,0.15)',
          textAlign: 'center',
        }}
      >
        {/* Box Title */}
        <h2
          style={{
            color: '#6f42c1',
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '30px',
          }}
        >
          Student Registration
        </h2>

        {/* Registration Form */}
        <form onSubmit={handleRegister}>
          <div style={{ textAlign: 'left', marginBottom: '20px' }}>
            <label
              htmlFor="name"
              style={{
                display: 'block',
                fontWeight: '600',
                fontSize: '1rem',
                marginBottom: '8px',
                color: '#333',
              }}
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '1rem',
              }}
            />
          </div>

          <div style={{ textAlign: 'left', marginBottom: '20px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontWeight: '600',
                fontSize: '1rem',
                marginBottom: '8px',
                color: '#333',
              }}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '1rem',
              }}
            />
          </div>

          <div style={{ textAlign: 'left', marginBottom: '25px' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontWeight: '600',
                fontSize: '1rem',
                marginBottom: '8px',
                color: '#333',
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '1rem',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              fontWeight: 700,
              borderRadius: '12px',
              padding: '15px',
              fontSize: '1.2rem',
              background: 'linear-gradient(90deg, #b388ff, #7c4dff)',
              border: 'none',
              color: '#fff',
              transition: '0.3s',
            }}
            onMouseOver={(e) =>
              (e.target.style.background = 'linear-gradient(90deg, #9c6bff, #6a1b9a)')
            }
            onMouseOut={(e) =>
              (e.target.style.background = 'linear-gradient(90deg, #b388ff, #7c4dff)')
            }
          >
            Register
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '0.95rem' }}>
          Already registered?{' '}
          <span
            onClick={() => navigate('/StudentLogin')}
            style={{ color: '#6f42c1', fontWeight: '600', cursor: 'pointer' }}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}

export default StudentRegister;
