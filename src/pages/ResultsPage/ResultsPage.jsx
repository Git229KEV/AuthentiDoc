import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ResultsPage.css";

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result } = location.state || {};
  const scrollRef = useRef(null); // Reference for the scrollable container

  useEffect(() => {
    if (result && result.verificationId) {
      console.log("RESULTS PAGE LOADED WITH VERIFICATION ID:", result.verificationId);
    }
  }, [result]);

  // Scroll handler for navigation buttons
  const scrollImages = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200; // Adjust scroll distance
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!result) {
    return (
      <div className="error-container">
        <h2>No results found</h2>
        <button onClick={() => navigate("/")}>Go Back</button>
      </div>
    );
  }

  const uniqueImages = result.images ? [...new Set(result.images)] : [];

  return (
    <div className="results-container">
      {/* 1. Header with Verdict & Verification ID */}
      <div className="verdict-header">
        <h1>Verification Results</h1>
        <p className={result.status === "Original" ? "verdict-original" : "verdict-fake"}>
          {result.status === "Original" ? "✅ Original Document" : "❌ Fake Document"}
        </p>
        {result.verificationId && (
          <p className="verification-id">
            <strong>Verification ID:</strong> {result.verificationId}
          </p>
        )}
      </div>

      {/* 2. Uploaded Document Preview (Slider) */}
      <div className="summary-section">
        <h3>Uploaded Document Preview</h3>
        {uniqueImages.length > 0 ? (
          <div className="slider-container">
            <button className="slider-button slider-left" onClick={() => scrollImages('left')}>
              &larr;
            </button>
            <div className="image-slider" ref={scrollRef}>
              {uniqueImages.map((img, idx) => (
                <div key={idx} className="pdf-image-wrapper">
                  <img src={`data:image/png;base64,${img}`} alt={`Page ${idx + 1}`} />
                  <p>Page {idx + 1}</p>
                </div>
              ))}
            </div>
            <button className="slider-button slider-right" onClick={() => scrollImages('right')}>
              &rarr;
            </button>
          </div>
        ) : <p>No PDF images available.</p>}
      </div>

      {/* 3. Page-wise Summaries */}
      <div className="summary-section">
        <h3>Page-wise Summaries</h3>
        {result.pageSummaries && result.pageSummaries.length > 0 ? (
          result.pageSummaries.map((summary, index) => (
            <div key={index} className="extracted-text-page">
              <h4>Page {index + 1}</h4>
              <div className="page-html-content">
                {summary || "No summary available."}
              </div>
            </div>
          ))
        ) : (
          <p>No summaries could be generated from the document.</p>
        )}
      </div>

      

      {/* 4. Analysis and Comparison Table Section */}
      <div className="summary-section">
        <h3>Analysis and Field Verification</h3>
        {result.analysis && <p className="analysis-text">{result.analysis}</p>}
        
        <div className="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>User Data</th>
                <th>Data From Document</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {result.details && result.details.length > 0 ? (
                result.details.map((d, idx) => (
                  <tr key={idx}>
                    <td>{d.field}</td>
                    <td className="document-data-cell">{d.userData || "-"}</td>
                    <td className="document-data-cell">{d.dataFromDocument || "-"}</td>
                    <td className={d.status === "✅ Match" ? "status-match" : "status-mismatch"}>
                      {d.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No verification details available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Optional: Reason for Fake Verdict */}
      {result.status !== "Original" && (
        <div className="mismatch-reason">
          <strong>Reason for "Fake" Verdict:</strong>
          <p>One or more fields did not match the data extracted from the document. Please review the mismatches highlighted in the table above.</p>
        </div>
      )}

      <button className="back-link" onClick={() => navigate("/")}>
        Verify Another Document
      </button>
    </div>
  );
};

export default ResultsPage;