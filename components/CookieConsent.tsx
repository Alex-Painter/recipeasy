"use client";

import CookieConsent from "react-cookie-consent";

const CookieConsentBanner = () => {
  return (
    <CookieConsent
      location="bottom"
      buttonText="I'm cool with that!"
      cookieName="cookie-consent"
      style={{
        background: "#BFCFBC",
        borderRadius: ".5rem",
      }}
      buttonStyle={{
        color: "#4e503b",
        background: "#FFB951",
        borderRadius: ".5rem",
        fontSize: "12px",
      }}
      expires={365}
    >
      <span className="text-sm text-slate-800">
        There are a couple functional cookies necessary for this site to work.
        We only use 3rd party cookies for authentication and payment processing.
        We never use tracking or analytical cookies.
      </span>
    </CookieConsent>
  );
};

export default CookieConsentBanner;
