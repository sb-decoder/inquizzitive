// src/pages/AccountSetupPage.jsx

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useAuth } from '../context/AuthContext';
import { countries } from '../data/countries';
import '../App.css'; 

// --- NEW, EXPANDED LIST OF INTERESTS ---
const allInterests = [
  "Technology", "Sports", "Art", "Music", "Reading", "Travel", "Gaming", "Cooking",
  "Movies", "Photography", "History", "Science", "Fitness", "Writing", "Dancing",
  "Gardening", "Politics", "Fashion", "Finance", "Business", "Volunteering",
  "Hiking", "Yoga", "Coding", "DIY Projects", "Learning Languages"
];
// -----------------------------------------

const occupations = ["Student", "Working Professional", "Educator", "Entrepreneur", "Other"];

function getCroppedImg(image, crop) {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);
  return new Promise(resolve => resolve(canvas.toDataURL('image/jpeg')));
}

export default function AccountSetupPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '', phone: '', country: 'India', bio: '',
    occupation: 'Student', interests: [], avatarData: null
  });
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  const handleInputChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleInterestToggle = (interest) => {
    setFormData(p => ({ ...p, interests: p.interests.includes(interest) ? p.interests.filter(i => i !== interest) : [...p.interests, interest] }));
  };
  const handleAvatarSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height);
    setCrop(initialCrop);
  };
  const handleCropSave = async () => {
    if (completedCrop?.width && completedCrop?.height && imgRef.current) {
      const croppedDataUrl = await getCroppedImg(imgRef.current, completedCrop);
      setFormData(prev => ({ ...prev, avatarData: croppedDataUrl }));
      setImgSrc('');
    }
  };
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid, email: formData.email, phone: formData.phone,
          location: formData.country, bio: formData.bio, occupation: formData.occupation,
          interests: formData.interests, avatar_data: formData.avatarData
        }),
      });
      const data = await response.json();
      if (data.user) {
        login(data.user);
        navigate('/');
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to save details. Please try again.");
    }
  };

  return (
    <>
      <div className="auth-page-wrapper">
        <div className="auth-card">
          <div className="progress-bar">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
          </div>
          {step === 1 && (
            <div>
              <h2>Personal Details</h2>
              <p>Tell us a bit about yourself.</p>
              <input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" type="email" required />
              <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone Number" type="tel" />
              <select name="country" value={formData.country} onChange={handleInputChange}>
                {countries.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
              </select>
              <textarea name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Write a short bio..."></textarea>
              <button onClick={nextStep} className="auth-btn">Next Step</button>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2>Profession & Interests</h2>
              <p>What are you passionate about?</p>
              <label>I am a...</label>
              <select name="occupation" value={formData.occupation} onChange={handleInputChange}>
                {occupations.map(occ => <option key={occ} value={occ}>{occ}</option>)}
              </select>
              <label>My interests are...</label>
              <div className="interest-tags">
                {allInterests.map(interest => (
                  <div key={interest} className={`tag ${formData.interests.includes(interest) ? 'selected' : ''}`} onClick={() => handleInterestToggle(interest)}>
                    {interest}
                  </div>
                ))}
              </div>
              <div className="step-nav">
                <button onClick={prevStep} className="auth-btn secondary">Back</button>
                <button onClick={nextStep} className="auth-btn">Next Step</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2>Choose Your Avatar</h2>
              <p>Upload and adjust your profile picture.</p>
              <div className="avatar-uploader" onClick={() => document.getElementById('avatarInput').click()}>
                <input type="file" id="avatarInput" accept="image/*" onChange={handleAvatarSelect} style={{ display: 'none' }} />
                {formData.avatarData ? (
                  <img src={formData.avatarData} alt="Avatar Preview" className="avatar-preview" />
                ) : ( <span>Click to Upload</span> )}
              </div>
              <div className="step-nav">
                <button onClick={prevStep} className="auth-btn secondary">Back</button>
                <button onClick={handleSubmit} className="auth-btn">Finish Setup</button>
              </div>
            </div>
          )}
        </div>
      </div>
      {imgSrc && (
        <div className="crop-modal-overlay">
          <div className="crop-modal-content">
            <h2>Adjust Your Avatar</h2>
            <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={1}>
              <img ref={imgRef} alt="Crop me" src={imgSrc} onLoad={onImageLoad} />
            </ReactCrop>
            <div className="crop-modal-actions">
              <button onClick={() => setImgSrc('')} className="auth-btn secondary">Cancel</button>
              <button onClick={handleCropSave} className="auth-btn">Save Avatar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}