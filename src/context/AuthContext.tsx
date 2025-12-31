import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import UserDataService from "../services/userDataService";
import { useLocation } from "react-router-dom";
import { getMe, getUserByUserId, incrementVisitorCount, logout as logoutApi } from "../services/api";

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
    logout: () => Promise<void>;

    isCurrentUserLoading: boolean;
    setIsCurrentUserLoading: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isMe, setIsMe] = useState(false);
    const [isValidUser, setIsValidUser] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [isLoggedInUserLoading, setIsLoggedInUserLoading] = useState(true);
    const [loggedInUser, setLoggedInUser] = useState<any>(null);

    const [isCurrentUserLoading, setIsCurrentUserLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);  

    const location = useLocation();
    const match = location.pathname.match(/^\/user\/([^/]+)/);
    const currentUserId = match ? match[1] : undefined;

    const getLoggedInUser = async () => {
        const user = await getMe();
        setLoggedInUser(user);
    }

    const getCurrentUser = async (currentUserId: string | undefined) => {
        if (!currentUserId) {
            currentUserId = loggedInUser?.id;
        }
        try {
            const user = await getUserByUserId(currentUserId ?? '');
            setCurrentUser(user);
            
            // Increment visitor count if viewing someone else's portfolio (or if not logged in)
            // Only increment once per session to avoid spam
            const isViewingOwnProfile = loggedInUser && loggedInUser.id === currentUserId;
            if (currentUserId && !isViewingOwnProfile) {
                const visitKey = `visited_${currentUserId}`;
                const hasVisited = sessionStorage.getItem(visitKey);
                
                if (!hasVisited) {
                    try {
                        const result = await incrementVisitorCount(currentUserId);
                        sessionStorage.setItem(visitKey, 'true');
                        // Refresh user data to get accurate count from server
                        if (result && result.visitor_count !== undefined) {
                            setCurrentUser({ ...user, visitor_count: result.visitor_count });
                        } else {
                            // Fallback: increment locally if server response doesn't have count
                            setCurrentUser({ ...user, visitor_count: (user.visitor_count || 0) + 1 });
                        }
                    } catch (error) {
                        // Silently fail - visitor count is not critical
                        console.error('Failed to increment visitor count:', error);
                    }
                }
            }
        } catch (error) {
            setCurrentUser(null);
        }
    }

    useEffect(() => {
        const initialize = async () => {
            if (isLoggedInUserLoading) {
                await getLoggedInUser();
                setIsLoggedInUserLoading(false);
            }

            if (isCurrentUserLoading && !isLoggedInUserLoading) {
                await getCurrentUser(currentUserId);
                setIsCurrentUserLoading(false);
            }
        };
        initialize();
    }, [isCurrentUserLoading, isLoggedInUserLoading, currentUserId]);

    useEffect(() => {
        setIsAuthenticated(!!(loggedInUser && loggedInUser?.id));
        setIsMe(!!(loggedInUser && currentUser && loggedInUser?.id === currentUser?.id));
        setIsValidUser(!!(currentUser && currentUser?.id));
    }, [loggedInUser, currentUser, currentUserId]);

    const logout = async () => {
        // Call logout API to blacklist the token
        await logoutApi();
        // Clear local state
        setIsAuthenticated(false);
        setIsMe(false);
        setIsValidUser(false);
        setLoggedInUser(null);
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, isMe, setIsMe, isValidUser, setIsValidUser, loggedInUser, setLoggedInUser, currentUser, setCurrentUser, isLoading, logout, isCurrentUserLoading, setIsCurrentUserLoading }}>
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