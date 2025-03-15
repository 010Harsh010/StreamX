import React from "react";
import "../CSS/policy.css"; // Import the CSS file for styling
import { Link } from "react-router-dom";
import {FaTimes} from "react-icons/fa"
const PrivacyPolicy = () => {
  document.title="StreamX-Policy"
  return (
    <div className="outers">
        harsh
      <div className="privacy-policy-container">
        <h1 className="privacy-title">Privacy Policy <Link to="/support"><FaTimes style={{color:"red"}}/></Link></h1>
        <div className="privacy-section">
          <h2>1. Purpose of the Website</h2>
          <p>
            This website is designed for{" "}
            <strong>project work and testing purposes only</strong>. It may
            simulate features and functionality, but it is{" "}
            <strong>not a production-grade system</strong>. Therefore, the
            security of the data you upload or interact with cannot be
            guaranteed.
          </p>
        </div>

        <div className="privacy-section">
          <h2>2. No Upload of Private or Sensitive Information</h2>
          <p>
            We strongly advise against uploading or submitting any private,
            sensitive, or confidential information, such as:
          </p>
          <ul>
            <li>Personally identifiable information (PII)</li>
            <li>Financial details</li>
            <li>Medical records</li>
            <li>Passwords or other sensitive credentials</li>
          </ul>
          <p>
            The system is{" "}
            <strong>not equipped with advanced security measures</strong> to
            protect sensitive data.
          </p>
        </div>

        <div className="privacy-section">
          <h2>3. Data Usage and Storage</h2>
          <p>
            Any data entered into this website is used{" "}
            <strong>solely for testing purposes</strong>. We do not retain or
            analyze uploaded data for any purpose beyond testing functionality.
            Data may be deleted without prior notice during system updates or
            testing cycles.
          </p>
        </div>

        <div className="privacy-section">
          <h2>4. Testing Environment Risks</h2>
          <p>As a testing environment:</p>
          <ul>
            <li>
              The website may contain <strong>bugs or vulnerabilities</strong>.
            </li>
            <li>
              Data transmission to and from the website is{" "}
              <strong>not encrypted</strong>, and your information may be at
              risk of exposure.
            </li>
            <li>
              Features or functionality may not work as intended or may be
              subject to change without prior notice.
            </li>
          </ul>
        </div>

        <div className="privacy-section">
          <h2>5. Prohibited Use</h2>
          <p>You must not use this website for:</p>
          <ul>
            <li>Uploading false or misleading content</li>
            <li>Illegal or unethical activities</li>
            <li>
              Any use other than{" "}
              <strong>non-commercial testing purposes</strong>
            </li>
          </ul>
          <p>
            Violations of these terms may result in restricted access to the
            website.
          </p>
        </div>

        <div className="privacy-section">
          <h2>6. Third-Party Content</h2>
          <p>
            This website may include links or references to external services or
            content for testing purposes. We are{" "}
            <strong>not responsible</strong> for the privacy practices or
            content of third-party websites.
          </p>
        </div>

        <div className="privacy-section">
          <h2>7. Liability Disclaimer</h2>
          <p>
            This website and its content are provided <strong>"as-is"</strong>{" "}
            without any warranties, express or implied. By using this website,
            you agree that:
          </p>
          <ul>
            <li>You assume full responsibility for the use of this site.</li>
            <li>
              The developers are <strong>not liable</strong> for any data
              breaches, losses, or damages incurred.
            </li>
          </ul>
        </div>

        <div className="privacy-section">
          <h2>8. Future Changes</h2>
          <p>
            This Privacy Policy may be updated periodically to reflect changes
            in the project scope or functionality. Continued use of the website
            after changes indicates acceptance of the updated terms.
          </p>
        </div>

        <div className="privacy-section">
          <h2>9. Contact</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy,
            please contact us at:
          </p>
          <ul>
            <li>
              <strong>Email:</strong> [Insert Email Address]
            </li>
            <li>
              <strong>Phone:</strong> [Insert Phone Number]
            </li>
          </ul>
        </div>

        <p className="privacy-footer">
          By using this website, you acknowledge that it is{" "}
          <strong>not a secure environment</strong> and agree to use it for
          testing purposes only. Thank you for understanding and supporting our
          project.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
