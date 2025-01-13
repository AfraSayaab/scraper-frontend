// src/views/auth/auth-logic/useAuth.js
import { useContext } from "react";
import { AuthContext } from "./AuthContext"; // Adjust the path if necessary

const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;
