import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 my-8 max-w-[40rem]">
      <h1 className="text-3xl font-bold text-center mb-6">Privacy Policy</h1>

      <p className="text-gray-700 mb-4">Effective Date: 18 November 2023</p>

      <p className="text-gray-700 mb-4">
        This Privacy Policy explains how we collect, use, disclose, and
        safeguard your information when you visit our website. We respect your
        privacy and are committed to protecting it through our compliance with
        this policy.
      </p>

      <h2 className="text-2xl font-semibold mb-3">Collection of Information</h2>
      <h3 className="text-xl font-semibold mb-2">
        Information You Provide to Us
      </h3>
      <p className="text-gray-700 mb-4">
        We collect information you provide directly to us. This includes:
      </p>
      <ul className="list-disc pl-8 mb-4">
        <li>
          Information attached to your Google account: full name, email address
          and profile picture
        </li>
      </ul>

      <h3 className="text-xl font-semibold mb-2">
        Information We Collect Automatically When You Use the Services
      </h3>
      <p className="text-gray-700 mb-4">
        <strong>Analytics Information:</strong> We collect analytics information
        when you use our website to help us improve our services. This includes
        information about your device type and the country you are accessing our
        website from.
        <br />
        <strong>Cookies and Tracking Technologies:</strong> We may use cookies
        and similar tracking technologies to access or store information.
      </p>

      <h2 className="text-2xl font-semibold mb-3">Use of Your Information</h2>
      <ul className="list-disc pl-8 mb-4">
        <li>To email you regarding your account or order.</li>
        <li>
          To compile anonymous statistical data and analysis for use internally.
        </li>
        <li>
          To monitor and analyze usage and trends to improve your experience
          with the website.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mb-3">
        Disclosure of Your Information
      </h2>
      <p className="text-gray-700 mb-4">
        We never share or sell your personal information with third parties.
      </p>

      <h2 className="text-2xl font-semibold mb-3">
        Storage and Security of Your Information
      </h2>
      <p className="text-gray-700 mb-4">
        Personal information is stored in EU data centers. What data we store,
        we protect within commercially acceptable means to prevent loss and
        theft, as well as unauthorised access, disclosure, copying, use or
        modification.
      </p>

      <h2 className="text-2xl font-semibold mb-3">
        Your Data Protection Rights Under General Data Protection Regulation
        (GDPR)
      </h2>
      <div className="text-gray-700 mb-4">
        If you are a resident of the European Economic Area (EEA), you have
        certain data protection rights. Omlete aims to take reasonable steps to
        allow you to correct, amend, delete, or limit the use of your personal
        data. You have the right to:
        <ul className="list-disc pl-8 mb-4">
          <li>Request access to your personal data.</li>
          <li>Request correction or deletion of your personal data.</li>
          <li>
            Request that we restrict the processing of your personal data.
          </li>
          <li>
            Withdraw your consent at any time where Omlete relied on your
            consent to process your personal information.
          </li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mb-3">
        Changes to This Privacy Policy
      </h2>
      <p className="text-gray-700 mb-4">
        We may update our Privacy Policy from time to time. We will notify you
        of any changes by posting the new Privacy Policy on this page and
        updating the Effective Date at the top of this Privacy Policy.
      </p>

      <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
      <p className="text-gray-700 mb-4">
        If you have questions or comments about this policy, you may email me at
        alex@omlete.com.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
