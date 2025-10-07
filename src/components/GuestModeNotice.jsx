import React from "react";

const GuestModeNotice = ({ onSignIn, onContinueAsGuest }) => {
  return (
    <div className="guest-notice-sidebar">
      <div className="guest-notice-card-small floating">
        <div className="guest-notice-header-small">
          <span className="icon-brain-small">🧠</span>
          <h3 className="guest-notice-title-small">Ready to Quiz?</h3>
        </div>

        <p className="guest-notice-subtitle-small">
          Your adventure awaits! Pick your path:
        </p>

        <div className="guest-notice-actions-small">
          <button
            onClick={onContinueAsGuest}
            className="guest-btn guest-btn-secondary"
          >
            <span className="btn-icon">🎮</span>
            <span>Quick Play Mode</span>
          </button>

          <button onClick={onSignIn} className="guest-btn guest-btn-primary">
            <span className="btn-icon">✨</span>
            <span>Unlock Full Power</span>
          </button>
        </div>

        <div className="guest-notice-benefits-small">
          <div className="benefit-item-small">
            <span className="benefit-icon">⚡</span>
            <span>Quick: Instant quiz fun</span>
          </div>
          <div className="benefit-item-small highlight">
            <span className="benefit-icon">📊</span>
            <span>Pro: Track & dominate</span>
          </div>
        </div>

        <div className="floating-decorations">
          <div className="floating-dot dot-1"></div>
          <div className="floating-dot dot-2"></div>
          <div className="floating-dot dot-3"></div>
        </div>
      </div>
    </div>
  );
};

export default GuestModeNotice;
