import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

function Alerts({ type, message }) {
    let icon;

    // Decide which icon to display based on the type
    if (type === "warning") {
        icon = faExclamationCircle;
    } else if (type === "error") {
        icon = faTimesCircle;
    } else if (type === "success") {
        icon = faCheckCircle;
    } else {
        icon = faCheckCircle; // default icon for unknown type
    }

    return (
        <div className={`alert-box ${type}`}>
            <div className="inner-alert">
                <div className="sign">
                    <FontAwesomeIcon icon={icon} className="alerticon" />
                </div>
                <div className="alert-content">
                    {message}
                </div>
            </div>
        </div>
    );
}

export default Alerts;
