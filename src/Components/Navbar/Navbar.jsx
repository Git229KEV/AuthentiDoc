import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../../assets/logo.png';
import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';

const Navbar = () => {
  const [sticky, setSticky] = useState(false);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/auth');
  };

  const getProfileImage = () => {
    if (user?.photoURL) {
      return user.photoURL;
    }
    return `https://ui-avatars.com/api/?name=${user?.displayName || user?.email || 'User'}&background=${Math.floor(Math.random()*16777215).toString(16)}&color=fff`;
  };

  return (
    <nav className={`container ${sticky ? 'dark-nav' : ''}`}>
      <img src={logo} alt="Logo" className="logo" />
      <ul>
        <li><Link to="/" className="nav-link">Home</Link></li>
        <li>Stories</li>
        <li>Document Scanner</li>
        <li>About Us</li>
        {!user ? (
          <li>
            <Link to="/auth" className="btn">Login</Link>
          </li>
        ) : (
          <>
            <Link to="/profile" className="profile-link">
              <li className="navbar-profile">
                <img
                  src={getProfileImage()}
                  alt="profile"
                  className="profile-pic"
                  style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8 }}
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${user.displayName || user.email || 'User'}&background=${Math.floor(Math.random()*16777215).toString(16)}&color=fff`; }}
                />
                <span>{user.displayName || user.email}</span>
              </li>
            </Link>
            <li>
              <button className="btn" onClick={handleSignOut}>Sign Out</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;