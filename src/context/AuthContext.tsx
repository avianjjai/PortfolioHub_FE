import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import UserDataService from "../services/userDataService";

interface AuthContextType {
    isAuthenticated: boolean;
    setIsAuthenticated: (value: boolean) => void;
    loggedInUser: any;
    setLoggedInUser: (user: any) => void;
    isLoading: boolean;
    isMe: boolean;
    setIsMe: (value: boolean) => void;
    isValidUser: boolean;
    setIsValidUser: (value: boolean) => void;
    currentUser: any;
    setCurrentUser: (user: any) => void;
    validateToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isMe, setIsMe] = useState(false);
    const [isValidUser, setIsValidUser] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);  
    const [isLoading, setIsLoading] = useState(true);

    const validateToken = async () => {
        console.log('validateToken');
        const token = localStorage.getItem('access_token');
        if (!token) {
            setIsAuthenticated(false);
            return;
        }

        try {
            // Validate Token
            const user = await UserDataService.getInstance().getUserData();
            setLoggedInUser(user);
            setCurrentUser(user);
            setIsAuthenticated(true);
            setIsMe(true);
            setIsValidUser(true);
        } catch (error) {
            console.log('error', error);
            localStorage.removeItem('access_token');
            setLoggedInUser(null);
            setIsAuthenticated(false);
            setIsMe(false);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        validateToken();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, isMe, setIsMe, isValidUser, setIsValidUser, loggedInUser, setLoggedInUser, currentUser, setCurrentUser, isLoading, validateToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}