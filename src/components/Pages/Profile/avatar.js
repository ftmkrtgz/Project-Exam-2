// AvatarModal.jsx
import React, { useState } from "react";

const AvatarModal = ({ isVisible, onClose }) => {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("default-avatar.png");

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setAvatarUrl(url);
    setPreviewUrl(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const profile = JSON.parse(localStorage.getItem("profile"));
    const userData = JSON.parse(localStorage.getItem("userData"));
    const apiKey = JSON.parse(localStorage.getItem("key"));
    const name = profile.name;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_ALL_PROFILES}${name}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${userData.accessToken}`,
            "Content-Type": "application/json",
            "X-Noroff-API-Key": apiKey.key,
          },
          body: JSON.stringify({
            avatar: {
              url: avatarUrl,
              alt: "User avatar",
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Avatar could not be updated");
      }
      profile.avatar.url = avatarUrl;
      localStorage.setItem("profile", JSON.stringify(profile));
      onClose();
    } catch (err) {
      alert("Error updating avatar: " + err.message);
    }
  };

  return (
    <div
      className={`modal fade ${isVisible ? "show" : ""}`}
      id="updateProfileAvatar"
      tabIndex="-1"
      aria-labelledby="exampleModalCenterTitle"
      aria-modal="true"
      role="dialog"
      style={{ display: isVisible ? "block" : "none" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form id="updateProfileAvatarForm" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h3 className="modal-title" id="exampleModalCenterTitle">
                Update Avatar Image
              </h3>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <img
                id="avatar-preview"
                className="w-100 rounded-circle"
                src={previewUrl}
                alt="Avatar Preview"
              />
              <label className="form-label" htmlFor="avatar">
                Avatar URL
              </label>
              <input
                type="url"
                className="form-control"
                name="avatar"
                id="avatar"
                placeholder="example.com/avatar.jpg"
                value={avatarUrl}
                onChange={handleUrlChange}
                required
              />
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-success">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AvatarModal;
