import React,{createContext,useContext,useState} from "react";
const loginContext = createContext();
export const useLogin = () => useContext(loginContext);
export const LoginProvider = ({children}) => {
    const [login, setLogin] = useState(false);
    const toggleLogin = () => setLogin(!login);
    return (
        <loginContext.Provider value={{login,toggleLogin,setLogin}}>
            {children}
        </loginContext.Provider>
    )
}