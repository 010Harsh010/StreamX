import React, { useState, useRef } from "react";
import "../CSS/support.css";
import AuthService from "../Server/auth.js";
import { Link } from "react-router-dom";

const Support = () => {
  const auth = new AuthService();
  const [contactForm, setContactForm] = useState(false);
  const messageRef = useRef();
  document.title = "StreamX-Support";
  const submitcheck =async () =>{
    if(messageRef.current.value === ""){
      return ;
    }
    try {
      const message = messageRef.current.value;
      const response = await auth.sendmessage({message});
      if(response.statusCode === 200){
        alert("We will Reach You As soon as possible");
      }
    } catch (error) {
      console.log(error);
      alert(error);
    }
    messageRef.current.value="";
  }

  return (
    <div>
      <div className="support-container">
        {contactForm && (
          <div className="support-contact-form">
            <div className="support-inner-form">
              <div className="support-heading">Support Form</div>
              <div className="supportmessagebox">
                <input
                  type="text"
                  placeholder="Enter your message"
                  ref={messageRef}
                />
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <button onClick={() => setContactForm(false)}>Cancel</button>
                  <button onClick={()=>submitcheck()}>Mail</button>
                </div>
              </div>
            </div>
          </div>
        )}
        <h1 className="support-title">We’re here to help</h1>
        <p className="support-subtitle">
          Have questions? We’re here to help. For{" "}
          <Link className="linking" to={"/policy"}>
            Privacy Policy
          </Link>{" "}
          click here.
        </p>
        <button
          onClick={() => setContactForm((prev) => !prev)}
          className="support-contact-button"
        >
          Contact
        </button>
        <div className="support-faq-section">
          {faqData.map((item, index) => (
            <details key={index} className="support-faq-item">
              <summary className="support-faq-question">{item.question}</summary>
              <p className="support-faq-answer">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

const faqData = [
  {
    question: "What are Privacy Policies?",
    answer:
      "We collect personal information like your name and email to improve your experience on our platform. Your data is never sold or shared without your consent. We use cookies to personalize content, and we donot take reasonable measures to protect your privacy. In Case Of Attack Data Share We Are Not Responsible....",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "Upto Now The Payment System Not Integrated. But Yes, you can try us for free for 30 days. If you want, we'll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible.",
  },
  {
    question: "Can I change my plan later?",
    answer: "Yes, you can upgrade or downgrade your plan anytime.",
  },
  {
    question: "What is your cancellation policy?",
    answer: "You can cancel anytime before your next billing cycle.",
  },
  {
    question: "How to Use Forget Password",
    answer: "In The Login page Click On fogot Password. Give there Entry of your username and New Password The Update password Work On Oauth...",
  },
  {
    question: "Is This Is In Testing Mode?",
    answer: "Yes This web is in Testing Mode. So Donot Upload Sensitive content...",
  },
  {
    question: "How do I change my account email?",
    answer: "Go to account settings to update your email.",
  },
  ,
  {
    question: "How do I change my account usename?",
    answer: "You Dont Change your Username Once Its Created",
  },
];

export default Support;
