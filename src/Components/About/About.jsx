import React from 'react';
import './About.css';
import about_img from "../../assets/Gemini_Generated_Image_mjrej0mjrej0mjre.png";



const About = () => {
  return (
    <div className="about">
      {/* Left Section with Images */}
      <div className="about-left">
        <img src={about_img} alt="About illustration" className="about-img" />
        
      </div>

      {/* Right Section with Content */}
      <div className="about-right">
        <h3>ABOUT OUR WEBSITE</h3>
        <h2>Turning Documents into Truth, Knowledge into Power</h2>

        <p>
          Our AI-powered cloud platform is built to transform the way you handle
          official documents, making the process smarter, faster, and more
          reliable. It instantly checks whether a document is real and authentic,
          validates that the format is correct, and ensures compliance with
          official standards.
        </p>

        <p>
          With integrated multi-language translation, you can convert documents
          across languages while preserving accuracy and meaning. Beyond simple
          verification, our intelligent system allows you to ask questions
          directly about your document, delivering clear, contextual answers that
          save time and eliminate confusion. Backed by secure cloud
          infrastructure, every document is processed and stored safely, giving
          you real-time accessibility, advanced protection against tampering, and
          complete peace of mind.
        </p>

        <p>
          By combining the power of artificial intelligence and cloud technology,
          we bring you a platform that ensures trust, transparency, and
          efficiency in every document you manage. Our instant verification
          system automatically checks whether your document is genuine, ensuring
          there are no forgeries or invalid copies.
        </p>
      </div>
    </div>
  );
};

export default About;
