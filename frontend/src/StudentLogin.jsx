import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if logged in user is actually a student
        if (data.user.role !== 'student') {
          alert('This login page is only for students.');
          return;
        }

        // Successful login
        alert(`Welcome ${data.user.name}!`);
        navigate('/student'); // redirect to student dashboard
      } else {
        // Login failed
        alert(data.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred. Please try again.');
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
          border: '4px solid #6f42c1',
          padding: '50px 40px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 4px 25px rgba(0,0,0,0.15)',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            color: '#6f42c1',
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '30px',
          }}
        >
          Student Login
        </h2>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ textAlign: 'left', marginBottom: '20px' }}>
            <label htmlFor="email" style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>

          {/* Password */}
          <div style={{ textAlign: 'left', marginBottom: '25px' }}>
            <label htmlFor="password" style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
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
            Login
          </button>
        </form>

        {/* Register Link */}
        <p style={{ marginTop: '20px', fontSize: '0.95rem' }}>
          Not registered?{' '}
          <span
            onClick={() => navigate('/StudentRegister')}
            style={{ color: '#6f42c1', fontWeight: '600', cursor: 'pointer' }}
          >
            Create an account
          </span>
        </p>
      </div>
    </div>
  );
}

export default StudentLogin;
