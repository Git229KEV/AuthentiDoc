import React, { useState, useEffect } from "react";
import { auth, storage } from "../../firebase"; // Adjust the import path if needed
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, listAll, deleteObject } from "firebase/storage";
import deleteIcon from "../../assets/delete_icon.png"; // Add this import for the delete icon
import "./ProfilePage.css"; // Create this CSS file for styling

const ProfilePage = () => {
  const [user, loading] = useAuthState(auth);
  const [userFiles, setUserFiles] = useState([]);
  const [error, setError] = useState("");

  const fetchUserFiles = async () => {
    if (!user || !storage) {
      setError("Authentication or storage not initialized.");
      return;
    }
    try {
      const storageRef = ref(storage, `uploads/${user.uid}/`);
      const result = await listAll(storageRef);
      const files = result.items.map((item) => item.name);
      setUserFiles(files);
    } catch (err) {
      setError(`Failed to list files. [${err.message}]`);
    }
  };

  useEffect(() => {
    if (user && !loading && storage) {
      fetchUserFiles();
    }
  }, [user, loading, storage]);

  const handleDelete = async (fileToDelete) => {
    if (!user || !storage) {
      setError("Authentication or storage not initialized.");
      return;
    }
    try {
      const fileRef = ref(storage, `uploads/${user.uid}/${fileToDelete}`);
      await deleteObject(fileRef);
      setUserFiles(userFiles.filter((file) => file !== fileToDelete));
    } catch (err) {
      setError(`Failed to delete file. [${err.message}]`);
    }
  };

  if (loading) {
    return <div className="profile-container">Loading profile...</div>;
  }

  if (!user) {
    return <div className="profile-container">Please log in to view your profile.</div>;
  }

  return (
    <div className="profile-container">
      <h1>Hello, {user.displayName || user.email}!</h1>
      
      <div className="file-list-section">
        <h2>Your Uploaded Files:</h2>
        {error && <div className="error-message">{error}</div>}
        {userFiles.length > 0 ? (
          <ul>
            {userFiles.map((file, index) => (
              <li key={index} className="file-item">
                {file}
                <button className="delete-btn" onClick={() => handleDelete(file)}>
                  <img src={deleteIcon} alt="Delete" className="delete-icon" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No files uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;