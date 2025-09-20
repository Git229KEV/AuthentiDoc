import React, { useState, useEffect } from 'react';
import './AuthPage.css';
import { auth, googleProvider, db } from '../../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { deleteUser } from "firebase/auth";

const AuthPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    name: '', phone: '', email: '', password: '', age: '', source: ''
  });
  const [ageError, setAgeError] = useState('');
  const [error, setError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Auth State Changed:", { uid: user.uid, email: user.email });
      } else {
        console.log("No user authenticated");
        setAuthMessage("Please signup or login to continue.");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'signup') {
      if (name === 'age' && value && isNaN(parseInt(value, 10))) {
        setAgeError("Age must be a valid number");
        return;
      }
      setSignupData(prev => ({ ...prev, [name]: value }));
      if (name === 'age') setAgeError('');
    } else {
      setLoginData(prev => ({ ...prev, [name]: value }));
    }
  };

  // --- Signup with Email/Password ---
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const age = parseInt(signupData.age, 10);

    if (age < 18 || isNaN(age)) {
      setAgeError("Age must be a valid number and at least 18");
      return;
    }
    if (!signupData.name || !signupData.phone || !signupData.email || !signupData.password || !signupData.source) {
      setError("All fields are required for signup.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signupData.email, signupData.password);
      const user = userCredential.user;

      await sendEmailVerification(user);
      alert("Verification email sent! Please check your inbox.");

      // ✅ Create Firestore record if not exists
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          name: signupData.name,
          phone: signupData.phone,
          email: signupData.email,
          age: age,
          source: signupData.source,
          createdAt: new Date(),
          providerId: user.providerId
        });
      }

      setIsLoginView(true); // switch to login form
    } catch (err) {
      console.error("Signup error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please log in.");
      } else {
        setError(err.message);
      }
    }
  };

  // --- Login with Email/Password ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError("Please verify your email before logging in.");
        return;
      }

      // ✅ Check Firestore for existing record
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        navigate("/"); // proceed to homepage
      } else {
        setError("No user data found in database. Please sign up first.");
        await signOut(auth);
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email. Please sign up.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
      } else {
        setError(err.message);
      }
    }
  };

  // --- Google Signup ---
  const handleGoogleSignup = async () => {
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // ✅ First-time Google signup → create Firestore record
        await setDoc(userRef, {
          name: user.displayName || "Google User",
          phone: "",
          email: user.email,
          age: 0,
          source: "Google",
          createdAt: new Date(),
          providerId: user.providerId
        });
      }

      navigate("/");
    } catch (err) {
      console.error("Google signup error:", err);
      setError(err.message);
    }
  };

  // --- Google Login ---
  const handleGoogleLogin = async () => {
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // ❌ No Firestore record → force sign out
        try {
          await deleteUser(user);
        } catch (deleteErr) {
          console.warn("Could not delete user (might need re-auth):", deleteErr);
        }  
        await signOut(auth);
        setError("You've not yet Signed up with us!");
        return;
      }

      // ✅ Firestore record exists → proceed
      navigate("/");
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className={`form-flipper ${!isLoginView ? 'show-signup' : ''}`}>
        {/* Login Form */}
        <div className="form-wrapper login-form">
          <form onSubmit={handleLoginSubmit}>
            <h2>Login</h2>
            {authMessage && <p className="auth-message">{authMessage}</p>}
            <div className="form-group">
              <label htmlFor="login-email">Email ID</label>
              <input
                type="email"
                id="login-email"
                name="email"
                value={loginData.email}
                onChange={(e) => handleInputChange(e, 'login')}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                name="password"
                value={loginData.password}
                onChange={(e) => handleInputChange(e, 'login')}
                required
              />
            </div>
            <button type="submit" className="btn">Login</button>
            <button type="button" className="btn google-btn" onClick={handleGoogleLogin}>
              Login with Google
            </button>
            {error && <p className="error-message">{error}</p>}
            <p className="toggle-text">
              Don't have an account?{' '}
              <span onClick={() => setIsLoginView(false)}>Sign Up</span>
            </p>
          </form>
        </div>

        {/* Signup Form */}
        <div className="form-wrapper signup-form">
          <form onSubmit={handleSignupSubmit}>
            <h2>Sign Up</h2>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={signupData.name}
                onChange={(e) => handleInputChange(e, 'signup')}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={signupData.phone}
                onChange={(e) => handleInputChange(e, 'signup')}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-email">Email ID</label>
              <input
                type="email"
                id="signup-email"
                name="email"
                value={signupData.email}
                onChange={(e) => handleInputChange(e, 'signup')}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <input
                type="password"
                id="signup-password"
                name="password"
                value={signupData.password}
                onChange={(e) => handleInputChange(e, 'signup')}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={signupData.age}
                onChange={(e) => handleInputChange(e, 'signup')}
                required
              />
              {ageError && <p className="error-message">{ageError}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="source">How did you hear about us?</label>
              <select
                id="source"
                name="source"
                value={signupData.source}
                onChange={(e) => handleInputChange(e, 'signup')}
                required
              >
                <option value="" disabled>Select an option</option>
                <option value="social-media">Social Media</option>
                <option value="friend">From a friend</option>
                <option value="search-engine">Search Engine</option>
                <option value="advertisement">Advertisement</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button type="submit" className="btn">Sign Up</button>
            <button type="button" className="btn google-btn" onClick={handleGoogleSignup}>
              Sign Up with Google
            </button>
            {error && <p className="error-message">{error}</p>}
            <p className="toggle-text">
              Already have an account?{' '}
              <span onClick={() => setIsLoginView(true)}>Login</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
