import React, { useEffect } from 'react';
import { useLogin } from "../contextApi/LoginContext.jsx";
import { useNavigate } from 'react-router-dom';

const LoginWrapper = ({ children }) => {
    const navigate = useNavigate();
    const { login } = useLogin();

    useEffect(() => {
        if (!login) {
            navigate("/login"); 
        }
    }, [login, navigate]);

    if (!login) return null;

    return <>{children}</>;
};

export default LoginWrapper;
