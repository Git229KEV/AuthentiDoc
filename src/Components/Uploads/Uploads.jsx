import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Upload.css";
import { Upload } from "lucide-react";
import { auth, googleProvider, storage } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, getBlob, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import * as pdfjsLib from "pdfjs-dist";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Buffer } from "buffer";

// Set up pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'; // Relative to public folder

// Initialize GoogleGenerativeAI with API key from environment variable
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const Uploads = () => {
  const [documentFile, setDocumentFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userFiles, setUserFiles] = useState([]);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); // For fetched file
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);

  const [formData, setFormData] = useState({
    sales: { cost: "", saleDate: "", ownerName: "", salespersonName: "", location: "" },
    gift: { giftDate: "", giverName: "", receiverName: "", location: "", giftType: "" },
    rental: { rentAmount: "", startDate: "", endDate: "", tenantName: "", landlordName: "", propertyLocation: "" },
    authority: { grantorName: "", granteeName: "", authorityType: "", validity: "", location: "" },
  });

  // Normalization and matching functions
  const normalize = (str) => (str ? String(str).trim().toLowerCase().replace(/[\s,-.]+/g, '') : '');
  const isNameMatch = (userName, docName) => {
    if (!userName || !docName) return false;
    const commonTitles = ['mr', 'mrs', 'ms', 'dr', 'prof', 'miss'];
    const clean = (s) => s.trim().toLowerCase().replace(/[.,]/g, '');
    const getWords = (s) => clean(s).split(/\s+/).filter(w => w && !commonTitles.includes(w));
    const userWords = getWords(userName);
    const docWords = getWords(docName);
    return userWords.every(word => docWords.includes(word));
  };

  // Document type configuration
  const getDocTypeConfig = (docType) => {
    switch (docType) {
      case "sales":
        return {
          fields: [
            { key: "cost", label: "Cost" },
            { key: "saleDate", label: "Sale Date" },
            { key: "ownerName", label: "Owner Name" },
            { key: "salespersonName", label: "Salesperson Name" },
            { key: "location", label: "Location" },
          ],
          prompt: "From the attached sales document PDF, extract the following information and return it as a JSON object: cost, sale date (format YYYY-MM-DD), owner name, salesperson name, and location. Also, provide a brief summary for each page of the document. If a value is not found, return null for that key.",
          schemaProperties: {
            cost: { type: "string" },
            saleDate: { type: "string" },
            ownerName: { type: "string" },
            salespersonName: { type: "string" },
            location: { type: "string" },
          },
          required: ["cost", "saleDate", "ownerName", "salespersonName", "location"],
        };
      case "gift":
        return {
          fields: [
            { key: "giftDate", label: "Gift Date" },
            { key: "giverName", label: "Giver Name" },
            { key: "receiverName", label: "Receiver Name" },
            { key: "location", label: "Enter Location where gift is received" },
            { key: "giftType", label: "Gift Type" },
          ],
          prompt: "From the attached gift giving document PDF, extract the following information and return it as a JSON object: gift date (format YYYY-MM-DD), giver name (donor name, which may be in any format), receiver name (donee name, which may be in any format), location (the address following the phrase 'Location of where the gift deed is received/ registered - '), and gift type. If the document contains keywords such as 'apartment' or 'car parking', set gift type to 'Immovable property'. Also, provide a brief summary for each page of the document. If a value is not found, return null for that key.",
          schemaProperties: {
            giftDate: { type: "string" },
            giverName: { type: "string" },
            receiverName: { type: "string" },
            location: { type: "string" },
            giftType: { type: "string" },
          },
          required: ["giftDate", "giverName", "receiverName", "location", "giftType"],
        };
      case "rental":
        return {
          fields: [
            { key: "rentAmount", label: "Rent Amount" },
            { key: "startDate", label: "Start Date" },
            { key: "endDate", label: "End Date" },
            { key: "tenantName", label: "Tenant Name" },
            { key: "landlordName", label: "Landlord Name" },
            { key: "propertyLocation", label: "Property Location" },
          ],
          prompt: "From the attached rental agreement PDF, extract the following information and return it as a JSON object: rent amount, start date (format YYYY-MM-DD), end date (format YYYY-MM-DD), tenant name, landlord name, and property location. Also, provide a brief summary for each page of the document. If a value is not found, return null for that key.",
          schemaProperties: {
            rentAmount: { type: "string" },
            startDate: { type: "string" },
            endDate: { type: "string" },
            tenantName: { type: "string" },
            landlordName: { type: "string" },
            propertyLocation: { type: "string" },
          },
          required: ["rentAmount", "startDate", "endDate", "tenantName", "landlordName", "propertyLocation"],
        };
      case "authority":
        return {
          fields: [
            { key: "grantorName", label: "Grantor Name" },
            { key: "granteeName", label: "Grantee Name" },
            { key: "authorityType", label: "Authority Type" },
            { key: "validity", label: "Validity" },
            { key: "location", label: "Location" },
          ],
          prompt: "From the attached power of authority document PDF, extract the following information and return it as a JSON object: grantor name, grantee name, authority type, validity date (format YYYY-MM-DD), and location. Also, provide a brief summary for each page of the document. If a value is not found, return null for that key.",
          schemaProperties: {
            grantorName: { type: "string" },
            granteeName: { type: "string" },
            authorityType: { type: "string" },
            validity: { type: "string" },
            location: { type: "string" },
          },
          required: ["grantorName", "granteeName", "authorityType", "validity", "location"],
        };
      default:
        throw new Error(`Unsupported document type: ${docType}`);
    }
  };

  // PDF to image conversion
  const convertPDFtoImages = async (pdfBuffer) => {
    try {
      const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
      const numPages = pdf.numPages;
      const imageBase64 = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const base64 = canvas.toDataURL("image/png").split(",")[1];
        imageBase64.push(base64);
      }

      return imageBase64;
    } catch (err) {
      console.error("PDF to image conversion error:", err.message);
      setError(`PDF to image conversion failed: ${err.message}`);
      return [];
    }
  };

  // Extract and compare using GoogleGenerativeAI
  const extractAndCompare = async (base64Pdf, userData, docType) => {
    const config = getDocTypeConfig(docType);

    const responseSchema = {
      type: "object",
      properties: {
        ...config.schemaProperties,
        pageSummaries: {
          type: "array",
          items: { type: "string", description: "A brief summary of the content on a single page." },
          description: "An array of strings, where each string is a summary of the corresponding page in the document.",
        },
      },
      required: [...config.required, "pageSummaries"],
    };

    const parts = [
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64Pdf,
        },
      },
      {
        text: config.prompt,
      },
    ];

    const generationConfig = {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    };

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig,
      });

      const responseText = result.response.candidates[0]?.content?.parts[0]?.text;
      if (!responseText) {
        throw new Error("No valid response text received from Gemini API");
      }

      let extracted;
      try {
        extracted = JSON.parse(responseText.trim()) || {};
      } catch (parseError) {
        console.error("Failed to parse Gemini response as JSON:", parseError.message);
        throw new Error("Invalid JSON response from Gemini API");
      }

      const details = config.fields.map((field) => {
        const userValue = userData[field.key] || "";
        const docValue = extracted[field.key] || "Not Found";
        let status;
        if (field.key === "giverName" || field.key === "receiverName") {
          status = isNameMatch(userValue, docValue) ? "✅ Match" : "❌ Mismatch";
        } else {
          status = normalize(userValue) === normalize(docValue) ? "✅ Match" : "❌ Mismatch";
        }
        return {
          field: field.label,
          userData: userValue,
          dataFromDocument: docValue,
          status,
        };
      });

      const allMatch = details.every((d) => d.status === "✅ Match");
      return {
        status: allMatch ? "Original" : "Fake",
        details,
        pageSummaries: extracted.pageSummaries || [],
      };
    } catch (err) {
      console.error("Gemini API error:", err.message);
      setError(`Failed to extract details using Gemini API: ${err.message}`);
      return { status: "Error", details: [], pageSummaries: [] };
    }
  };

  // Generate analysis
  const generateAnalysis = (docType, details) => {
    const getDetail = (fieldName) => details.find((d) => d.field === fieldName)?.dataFromDocument || "[not found]";
    switch (docType) {
      case "sales":
        const salesCost = getDetail("Cost");
        const saleDate = getDetail("Sale Date");
        const ownerName = getDetail("Owner Name");
        const salespersonName = getDetail("Salesperson Name");
        const salesLocation = getDetail("Location");
        return `This appears to be a sales document for a transaction costing ${salesCost} on ${saleDate}, involving owner ${ownerName} and salesperson ${salespersonName} at location ${salesLocation}.`;
      case "gift":
        const giftDate = getDetail("Gift Date");
        const giverName = getDetail("Giver Name");
        const receiverName = getDetail("Receiver Name");
        const giftLocation = getDetail("Enter Location where gift is received");
        const giftType = getDetail("Gift Type");
        return `This appears to be a gift giving document for a ${giftType}, given on ${giftDate} from ${giverName} to ${receiverName} at location ${giftLocation}.`;
      case "rental":
        const landlord = getDetail("Landlord Name");
        const tenant = getDetail("Tenant Name");
        const rent = getDetail("Rent Amount");
        const startDate = getDetail("Start Date");
        const rentalLocation = getDetail("Property Location");
        return `This appears to be a rental agreement between the landlord, ${landlord}, and the tenant, ${tenant}. The agreement, starting on ${startDate}, is for the property located at ${rentalLocation}. The specified monthly rent is ₹${rent}.`;
      case "authority":
        const grantor = getDetail("Grantor Name");
        const grantee = getDetail("Grantee Name");
        const authorityType = getDetail("Authority Type");
        const validity = getDetail("Validity");
        const authLocation = getDetail("Location");
        return `This appears to be a power of authority document granting ${authorityType} from ${grantor} to ${grantee}, valid until ${validity}, at location ${authLocation}.`;
      default:
        return "Analysis for this document type has not been implemented.";
    }
  };

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

  const fetchFile = async (fileName) => {
    if (!user || !storage) return;
    setIsLoading(true);
    try {
      const storageRef = ref(storage, `uploads/${user.uid}/${fileName}`);
      const blob = await getBlob(storageRef);
      const arrayBuffer = await blob.arrayBuffer();
      setDocumentFile(new File([arrayBuffer], fileName, { type: "application/pdf" }));
      setSelectedFile(fileName);
      setSuccess("File fetched successfully!");
    } catch (err) {
      setError(`Failed to fetch file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && !loading && storage) fetchUserFiles();
  }, [user, loading, storage]);

  const handleUploadToFirebase = async (file) => {
    if (!user) {
      setError("No authenticated user found.");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const uid = user.uid || "test-user";
      const storageRef = ref(storage, `uploads/${uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(snapshot.ref);
      setUploadedFileUrl(fileUrl);
      setFileName(snapshot.ref.fullPath);
      setDisplayName(file.name);
      setSuccess("✅ File uploaded successfully!");
      setTimeout(fetchUserFiles, 1000);
    } catch (err) {
      setError(`Failed to upload. [${err.message}]`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFile(file);
      setFileName(file.name);
      setDisplayName(file.name);
      handleUploadToFirebase(file);
    }
  };

  const handleChange = (docType, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        [field]: value,
      },
    }));
  };

  const mapSelectedTypeToKey = (selected) => {
    switch (selected) {
      case "Sales Document": return "sales";
      case "Gift Giving Document": return "gift";
      case "Rental Document": return "rental";
      case "Power of Authority": return "authority";
      default: return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!documentFile || !selectedType) {
      setError("Please upload or select a document and select its type first.");
      return;
    }

    const docTypeKey = mapSelectedTypeToKey(selectedType);
    if (!docTypeKey) {
      setError("Invalid document type selected.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const arrayBuffer = await documentFile.arrayBuffer();
      const pdfBuffer = Buffer.from(arrayBuffer);
      const base64Pdf = pdfBuffer.toString("base64");

      const imageBase64 = await convertPDFtoImages(pdfBuffer);
      const comparisonResult = await extractAndCompare(base64Pdf, formData[docTypeKey], docTypeKey);

      const result = {
        status: comparisonResult.status,
        details: comparisonResult.details,
        verificationId: crypto.randomUUID(),
        images: imageBase64,
        pageSummaries: comparisonResult.pageSummaries,
        analysis: generateAnalysis(docTypeKey, comparisonResult.details),
        docType: docTypeKey,
      };

      navigate("/results", { state: { result } });
    } catch (err) {
      console.error("Verification failed:", err.message);
      setError(`Verification failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const options = [
    "Rental Document",
    "Gift Giving Document",
    "Sales Document",
    "Power of Authority",
  ];

  if (loading) return <div>Loading authentication state...</div>;
  if (!user) {
    return (
      <div className="upload-component">
        <p>Please login to upload documents.</p>
        <button onClick={() => auth.signInWithPopup(googleProvider)}>Sign in with Google</button>
      </div>
    );
  }

  return (
    <form className="upload-container" onSubmit={handleSubmit}>
      <div className="upload-box">
        <label className="upload-label">
          <input
            type="file"
            onChange={handleFileChange}
            className="file-input"
            accept="application/pdf"
          />
          <Upload size={40} className="upload-icon" />
          <p className="upload-text">
            {displayName ? displayName : "Click or Drag & Drop your document here"}
          </p>
        </label>
      </div>

      <div className="options-row">
        {options.map((opt, idx) => (
          <button
            type="button"
            key={idx}
            className={`option-btn ${selectedType === opt ? "active" : ""}`}
            onClick={() => setSelectedType(opt)}
          >
            {opt}
          </button>
        ))}
      </div>

      

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {selectedType && (
        <div className="input-section">
          <h3 className="form-title">Enter Document Details</h3>
          {selectedType === "Sales Document" && (
            <>
              <input type="text" placeholder="Enter Cost" value={formData.sales.cost} onChange={(e) => handleChange("sales", "cost", e.target.value)} />
              <input type="date" value={formData.sales.saleDate} onChange={(e) => handleChange("sales", "saleDate", e.target.value)} />
              <input type="text" placeholder="Enter Owner Name" value={formData.sales.ownerName} onChange={(e) => handleChange("sales", "ownerName", e.target.value)} />
              <input type="text" placeholder="Enter Salesperson Name" value={formData.sales.salespersonName} onChange={(e) => handleChange("sales", "salespersonName", e.target.value)} />
              <input type="text" placeholder="Enter Location" value={formData.sales.location} onChange={(e) => handleChange("sales", "location", e.target.value)} />
            </>
          )}
          {selectedType === "Gift Giving Document" && (
            <>
              <input type="date" value={formData.gift.giftDate} onChange={(e) => handleChange("gift", "giftDate", e.target.value)} />
              <input type="text" placeholder="Enter Donor's Name" value={formData.gift.giverName} onChange={(e) => handleChange("gift", "giverName", e.target.value)} />
              <input type="text" placeholder="Enter Donee's Name" value={formData.gift.receiverName} onChange={(e) => handleChange("gift", "receiverName", e.target.value)} />
              <input type="text" placeholder="Enter Location" value={formData.gift.location} onChange={(e) => handleChange("gift", "location", e.target.value)} />
              <input type="text" placeholder="Type of Gift" value={formData.gift.giftType} onChange={(e) => handleChange("gift", "giftType", e.target.value)} />
            </>
          )}
          {selectedType === "Rental Document" && (
            <>
              <input type="text" placeholder="Rent Amount" value={formData.rental.rentAmount} onChange={(e) => handleChange("rental", "rentAmount", e.target.value)} />
              <input type="date" value={formData.rental.startDate} onChange={(e) => handleChange("rental", "startDate", e.target.value)} />
              <input type="date" value={formData.rental.endDate} onChange={(e) => handleChange("rental", "endDate", e.target.value)} />
              <input type="text" placeholder="Tenant Name" value={formData.rental.tenantName} onChange={(e) => handleChange("rental", "tenantName", e.target.value)} />
              <input type="text" placeholder="Landlord Name" value={formData.rental.landlordName} onChange={(e) => handleChange("rental", "landlordName", e.target.value)} />
              <input type="text" placeholder="Property Location" value={formData.rental.propertyLocation} onChange={(e) => handleChange("rental", "propertyLocation", e.target.value)} />
            </>
          )}
          {selectedType === "Power of Authority" && (
            <>
              <input type="text" placeholder="Grantor Name" value={formData.authority.grantorName} onChange={(e) => handleChange("authority", "grantorName", e.target.value)} />
              <input type="text" placeholder="Grantee Name" value={formData.authority.granteeName} onChange={(e) => handleChange("authority", "granteeName", e.target.value)} />
              <input type="text" placeholder="Authority Type" value={formData.authority.authorityType} onChange={(e) => handleChange("authority", "authorityType", e.target.value)} />
              <input type="date" value={formData.authority.validity} onChange={(e) => handleChange("authority", "validity", e.target.value)} />
              <input type="text" placeholder="Location" value={formData.authority.location} onChange={(e) => handleChange("authority", "location", e.target.value)} />
            </>
          )}
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Submit"}
          </button>
        </div>
      )}
    </form>
  );
};

export default Uploads;