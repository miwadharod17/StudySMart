import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const redirect = (role) => {
    if(role === 'student') navigate('/StudentLogin');
    else if(role === 'vendor') navigate('/VendorLogin');
    else if(role === 'admin') navigate('/AdminLogin');
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '100px',
        backgroundColor: '#f8f9fa'
      }}
    >
      <div
        className="login-box"
        style={{
          background: '#fff',
          color: '#333',
          borderRadius: '20px',
          padding: '70px 50px',
          boxShadow: '0 4px 25px rgba(0,0,0,0.15)',
          width: '100%',
          maxWidth: '430px',
          minHeight: '520px',
          textAlign: 'center',
          border: '4px solid #6f42c1'
        }}
      >
        <h2 className="fw-bold mb-5" style={{ color: '#6f42c1', fontSize: '2.2rem' }}>
          Choose Your Role :
        </h2>

        {/* Student Button */}
        <button
          onClick={() => redirect('student')}
          style={{
            width: '100%',
            marginTop: '25px',
            fontWeight: 700,
            borderRadius: '12px',
            padding: '20px',
            fontSize: '1.2rem',
            background: 'linear-gradient(90deg, #b388ff, #7c4dff)',
            border: 'none',
            color: '#fff',
            transition: '0.3s'
          }}
          onMouseOver={e => e.target.style.background = 'linear-gradient(90deg, #9c6bff, #6a1b9a)'}
          onMouseOut={e => e.target.style.background = 'linear-gradient(90deg, #b388ff, #7c4dff)'}
        >
          Student
        </button>

        {/* Vendor Button */}
        <button
          onClick={() => redirect('vendor')}
          style={{
            width: '100%',
            marginTop: '25px',
            fontWeight: 700,
            borderRadius: '12px',
            padding: '20px',
            fontSize: '1.2rem',
            background: 'linear-gradient(90deg, #c77dff, #9d4edd)',
            border: 'none',
            color: '#fff',
            transition: '0.3s'
          }}
          onMouseOver={e => e.target.style.background = 'linear-gradient(90deg, #b15cff, #7b2cbf)'}
          onMouseOut={e => e.target.style.background = 'linear-gradient(90deg, #c77dff, #9d4edd)'}
        >
          Vendor
        </button>

        {/* Admin Button */}
        <button
          onClick={() => redirect('admin')}
          style={{
            width: '100%',
            marginTop: '25px',
            fontWeight: 700,
            borderRadius: '12px',
            padding: '20px',
            fontSize: '1.2rem',
            background: 'linear-gradient(90deg, #bb86fc, #6200ea)',
            border: 'none',
            color: '#fff',
            transition: '0.3s'
          }}
          onMouseOver={e => e.target.style.background = 'linear-gradient(90deg, #a56eff, #4a00b5)'}
          onMouseOut={e => e.target.style.background = 'linear-gradient(90deg, #bb86fc, #6200ea)'}
        >
          Admin
        </button>
      </div>
    </div>
  );
}

export default Home;
