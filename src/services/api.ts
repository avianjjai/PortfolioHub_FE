import axios from 'axios';
import env, { getApiBaseUrl } from '../config/env.config';
import { Award, Certification, Education, Experience, Message, MessageCount, Project, Skill } from './modal';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: env.API_TIMEOUT,
});

// Helper function to decode JWT token and check expiry
const isTokenExpiringSoon = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        const timeUntilExpiry = exp - now;
        // Refresh if token expires in less than 5 minutes (300000 ms)
        return timeUntilExpiry < 300000;
    } catch (error) {
        return false;
    }
};

// Flag to prevent recursive refresh calls
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Create axios authenticated instance with the passed token
const authenticatedApi = (token: string) => {
    const instance = axios.create({
        baseURL: getApiBaseUrl(),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    // Request interceptor to refresh token if expiring soon
    instance.interceptors.request.use(
        async (config) => {
            // Skip interceptor for refresh endpoint to prevent infinite loop
            if (config.url?.includes('/auth/refresh')) {
                return config;
            }

            const currentToken = localStorage.getItem('access_token');
            if (currentToken && isTokenExpiringSoon(currentToken) && !isRefreshing) {
                try {
                    // Use existing refresh promise if one is in progress
                    if (!refreshPromise) {
                        isRefreshing = true;
                        refreshPromise = refreshToken();
                    }
                    const newToken = await refreshPromise;
                    if (newToken) {
                        config.headers.Authorization = `Bearer ${newToken}`;
                    }
                    // Reset after refresh completes
                    isRefreshing = false;
                    refreshPromise = null;
                } catch (error) {
                    // If refresh fails, continue with original token
                    console.error('Token refresh failed:', error);
                    isRefreshing = false;
                    refreshPromise = null;
                }
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor to handle 401 and refresh token
    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            // Skip interceptor for refresh endpoint to prevent infinite loop
            if (originalRequest.url?.includes('/auth/refresh')) {
                return Promise.reject(error);
            }

            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    // Use existing refresh promise if one is in progress
                    if (!refreshPromise) {
                        isRefreshing = true;
                        refreshPromise = refreshToken();
                    }
                    const newToken = await refreshPromise;
                    if (newToken) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        // Reset after refresh completes
                        isRefreshing = false;
                        refreshPromise = null;
                        return instance(originalRequest);
                    }
                    // Reset if refresh failed
                    isRefreshing = false;
                    refreshPromise = null;
                } catch (refreshError) {
                    localStorage.removeItem('access_token');
                    isRefreshing = false;
                    refreshPromise = null;
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );

    return instance;
}

export const getUserByUserId = async(userId: string): Promise<any> => {
    try {
        const response = await api.get(`/user/${userId}`);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to get user. Please try again.');
    }
}

// Increment visitor count
export const incrementVisitorCount = async(userId: string): Promise<any> => {
    try {
        const response = await api.post(`/user/${userId}/increment-visitor`);
        return response.data;
    } catch(error: any) {
        // Silently fail - visitor count is not critical
        console.error('Failed to increment visitor count:', error);
        return null;
    }
}

// Login API Call
export const login = async (username: string, password: string) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    try {
        const response = await api.post(
            `${getApiBaseUrl()}/auth/token`,
            params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

// Register API Call
export const register = async (user: { email: string; password: string; username: string }) => {
    try {
        const response = await api.post(`/auth/register`, user);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}

// Refresh Token API Call - uses base api instance to avoid interceptor loop
export const refreshToken = async (): Promise<string | null> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        return null;
    }
    try {
        // Use base api instance with manual token header to avoid interceptor loop
        const response = await axios.post(
            `${getApiBaseUrl()}/auth/refresh`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
        const newToken = response.data.access_token;
        localStorage.setItem('access_token', newToken);
        return newToken;
    } catch (error: any) {
        // If refresh fails, clear token and logout
        localStorage.removeItem('access_token');
        return null;
    }
}

// Logout API Call
export const logout = async (): Promise<void> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        return;
    }
    try {
        await authenticatedApi(token).post('/auth/logout');
    } catch (error: any) {
        // Even if logout fails, clear token on frontend
        console.error('Logout API call failed:', error);
    } finally {
        // Always clear token from localStorage
        localStorage.removeItem('access_token');
    }
}

// Get Me API Call
export const getMe = async () => {
    const token = localStorage.getItem('access_token');
    let response = null;
    if (token) {
        try {
            response = await authenticatedApi(token).get('/auth/me');
            // Check if response has new token in headers (if using auto-refresh)
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 401) {
                // Try to refresh token on 401
                const newToken = await refreshToken();
                if (newToken) {
                    // Retry the request with new token
                    try {
                        response = await authenticatedApi(newToken).get('/auth/me');
                        return response.data;
                    } catch (retryError) {
                        localStorage.removeItem('access_token');
                    }
                } else {
                    localStorage.removeItem('access_token');
                }
            }
            return error.response?.data;
        }
    }
    return response;
}

/**
 * Get Skills by User ID
 * @param userId - ID of the user to get skills for
 * @returns Array of skills if successful, throws error if failed
 */
export const getSkillsByUserId = async(userId: string): Promise<Skill[]> => {
    try {
        const response = await api.get(`/skills/user/${userId}`);
        return response.data;
    } catch (error: any) {
        throw new Error('Failed to get skills. Please try again.');
    }
}

/**
 * Add Skill
 * @param skill - Skill object containing name, category, and proficiency
 * @returns Skill object if successful, throws error if failed
 */
export const addSkill = async(skill: Skill): Promise<Skill> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).post('/skills', skill);
        return response.data;
    } catch (error: any) {
        return error.response.data.detail;
    }
}

/**
 * Update Skill
 * @param skillId - ID of the skill to update
 * @param skill - Skill object containing name, category, and proficiency
 * @returns Skill object if successful, throws error if failed
 */
export const updateSkill = async(skillId: string, skill: Skill): Promise<Skill> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).put(`/skills/${skillId}`, skill);
        return response.data;
    } catch (error: any) {
        throw new Error('Failed to update skill. Please try again.');
    }
}

/**
 * Delete Skill
 * @param skillId - ID of the skill to delete
 * @returns Skill object if successful, throws error if failed
 */
export const deleteSkill = async(skillId: string): Promise<Skill> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).delete(`/skills/${skillId}`);
        return response.data;
    } catch (error: any) {
        throw new Error('Failed to delete skill. Please try again.');
    }
}

/**
 * Get Projects by User ID
 * @param userId - ID of the user to get projects for
 * @returns Array of projects if successful, throws error if failed
 */
export const getProjectsByUserId = async(userId: string): Promise<Project[]> => {
    try {
        const response = await api.get(`/projects/user/${userId}`);
        return response.data;
    } catch (error: any) {
        throw new Error('Failed to get projects. Please try again.');
    }
}

/**
 * Add Project
 * @param project - Project object containing title, description, technologies, live_url, code_url, image_url, start_date, and end_date
 * @returns Project object if successful, throws error if failed
 */
export const addProject = async(project: Project): Promise<Project> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).post('/projects', project);
        return response.data;
    } catch (error: any) {
        throw new Error('Failed to add project. Please try again.');
    }
}

/**
 * Update Project
 * @param projectId - ID of the project to update
 * @param project - Project object containing title, description, technologies, live_url, code_url, image_url, start_date, and end_date
 * @returns Project object if successful, throws error if failed
 */
export const updateProject = async(projectId: string, project: Project): Promise<Project> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).put(`/projects/${projectId}`, project);
        return response.data;
    } catch (error: any) {
        throw new Error('Failed to update project. Please try again.');
    }
}

/**
 * Delete Project
 * @param projectId - ID of the project to delete
 * @returns Project object if successful, throws error if failed
 */
export const deleteProject = async(projectId: string): Promise<Project> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).delete(`/projects/${projectId}`);
        return response.data;
    } catch (error: any) {
        throw new Error('Failed to delete project. Please try again.');
    }
}

/**
 * Get Experiences by User ID
 * @param userId - ID of the user to get experiences for
 * @returns Array of experiences if successful, throws error if failed
 */
export const getExperiencesByUserId = async(userId: string): Promise<Experience[]> => {
    try {
        const response = await api.get(`/experiences/user/${userId}`);
        return response.data;
    } catch (error: any) {
        throw new Error('Failed to get experiences. Please try again.');
    }
}

/**
 * Add Experience
 * @param experience - Experience object containing title, company, description, technologies, start_date, and end_date
 * @returns Experience object if successful, throws error if failed
 */
export const addExperience = async(experience: Experience): Promise<Experience> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).post('/experiences', experience);
        return response.data;
    } catch (error: any) {
        throw new Error('Failed to add experience. Please try again.');
    }
}

/**
 * Update Experience
 * @param experienceId - ID of the experience to update
 * @param experience - Experience object containing title, company, description, technologies, start_date, and end_date
 * @returns Experience object if successful, throws error if failed
 */
export const updateExperience = async(experienceId: string, experience: Experience): Promise<Experience> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).put(`/experiences/${experienceId}`, experience);
        return response.data;
    } catch (error: any) {
        throw new Error('Failed to update experience. Please try again.');
    }
}

/**
 * Delete Experience
 * @param experienceId - ID of the experience to delete
 * @returns Experience object if successful, throws error if failed
 */
export const deleteExperience = async(experienceId: string): Promise<Experience> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).delete(`/experiences/${experienceId}`);
        return response.data;
    } catch (error: any) {
        throw new Error('Failed to delete experience. Please try again.');
    }
}

/**
 * Get Educations by User ID
 * @param userId - ID of the user to get educations for
 * @returns Array of educations if successful, throws error if failed
 */
export const getEducationsByUserId = async(userId: string): Promise<Education[]> => {
    try {
        const response = await api.get(`/educations/user/${userId}`);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to get educations. Please try again.');
    }
}

/**
 * Add Education
 * @param education - Education object containing degree, institution, start_date, end_date, and description
 * @returns Education object if successful, throws error if failed
 */
export const addEducation = async(education: Education): Promise<Education> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).post('/educations', education);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to add education. Please try again.');
    }
}

/**
 * Update Education
 * @param educationId - ID of the education to update
 * @param education - Education object containing degree, institution, start_date, end_date, and description
 * @returns Education object if successful, throws error if failed
 */
export const updateEducation = async(educationId: string, education: Education): Promise<Education> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).put(`/educations/${educationId}`, education);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to update education. Please try again.');
    }
}

/**
 * Delete Education
 * @param educationId - ID of the education to delete
 * @returns Education object if successful, throws error if failed
 */
export const deleteEducation = async(educationId: string): Promise<Education> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).delete(`/educations/${educationId}`);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to delete education. Please try again.');
    }
}

/**
 * Get Certifications by User ID
 * @param userId - ID of the user to get certifications for
 * @returns Array of certifications if successful, throws error if failed
 */
export const getCertificationsByUserId = async(userId: string): Promise<Certification[]> => {
    try {
        const response = await api.get(`/certifications/user/${userId}`);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to get certifications. Please try again.');
    }
}

/**
 * Add Certification
 * @param certification - Certification object containing name, issuer, date, and description
 * @returns Certification object if successful, throws error if failed
 */
export const addCertification = async(certification: Certification): Promise<Certification> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).post('/certifications', certification);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to add certification. Please try again.');
    }
}

/**
 * Update Certification
 * @param certificationId - ID of the certification to update
 * @param certification - Certification object containing name, issuer, date, and description
 * @returns Certification object if successful, throws error if failed
 */
export const updateCertification = async(certificationId: string, certification: Certification): Promise<Certification> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).put(`/certifications/${certificationId}`, certification);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to update certification. Please try again.');
    }
}

/**
 * Delete Certification
 * @param certificationId - ID of the certification to delete
 * @returns Certification object if successful, throws error if failed
 */
export const deleteCertification = async(certificationId: string): Promise<Certification> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).delete(`/certifications/${certificationId}`);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to delete certification. Please try again.');
    }
}

/**
 * Get Awards by User ID
 * @param userId - ID of the user to get awards for
 * @returns Array of awards if successful, throws error if failed
 */
export const getAwardsByUserId = async(userId: string): Promise<Award[]> => {
    try {
        const response = await api.get(`/awards/user/${userId}`);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to get awards. Please try again.');
    }
}

/**
 * Add Award
 * @param award - Award object containing name, description, and date
 * @returns Award object if successful, throws error if failed
 */
export const addAward = async(award: Omit<Award, 'id' | 'created_at' | 'updated_at'>): Promise<Award> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).post('/awards', award);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to add award. Please try again.');
    }
}

/**
 * Update Award
 * @param awardId - ID of the award to update
 * @param award - Award object containing name, description, and date
 * @returns Award object if successful, throws error if failed
 */
export const updateAward = async(awardId: string, award: Award): Promise<Award> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).put(`/awards/${awardId}`, award);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to update award. Please try again.');
    }
}

/**
 * Delete Award
 * @param awardId - ID of the award to delete
 * @returns Award object if successful, throws error if failed
 */
export const deleteAward = async(awardId: string): Promise<Award> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).delete(`/awards/${awardId}`);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to delete award. Please try again.');
    }
}

/**
 * Get Messages
 * @returns Array of messages if successful, throws error if failed
 */
export const getMessages = async(): Promise<Message[]> => {
    try {
        const response = await api.get('/message');
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to get messages. Please try again.');
    }
}

/**
 * Get Contact by ID
 * @param contactId - ID of the contact to get
 * @returns Contact object if successful, throws error if failed
 */
export const getContactById = async(contactId: string): Promise<Message> => {
    try {
        const response = await api.get(`/contacts/${contactId}`);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to get contact. Please try again.');
    }
}

/**
 * Send Authenticated User Message
 * @param message - Message object containing messageSubject, messageContent, and recipientEmail
 * @returns Message object if successful, throws error if failed
 */
export const sendAuthenticatedUserMessage = async(message: {
    messageSubject?: string;  // Optional subject, backend will provide default if not provided
    messageContent: string;
    recipientEmail: string;
}): Promise<Message> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).post('/message/send', message);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to send message. Please try again.');
    }
}

/**
 * Send Unauthenticated User Message
 * @param message - Message object containing senderName, senderEmail, messageSubject, messageContent, and recipientUserId
 * @returns Message object if successful, throws error if failed
 */
export const sendUnauthenticatedUserMessage = async(message: {
    senderName: string;
    senderEmail: string;
    messageSubject?: string;  // Optional subject, backend will provide default if not provided
    messageContent: string;
    recipientUserId: string;
}): Promise<Message> => {
    try {
        const response = await api.post('/message/send/unauthenticated', message);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to send message. Please try again.');
    }
}

/**
 * Get Message Count by 
 * @returns Message count object if successful, throws error if failed
 */
export const getMessageCounts = async(): Promise<MessageCount> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).get('/message/count');
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to get message count. Please try again.');
    }
}

/**
 * Get Received Messages List
 * @returns Array of messages if successful, throws error if failed
 */
export const getReceivedMessagesList = async(): Promise<Message[]> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).get('/message');
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to get received messages list. Please try again.');
    }
}

/**
 * Mark messages as read
 * @param messageIds - Array of message ids to mark as read
 */
export const markMessagesAsRead = async(messageIds: string[]): Promise<void> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).put('/message/read', { messageIds });
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to mark messages as read. Please try again.');
    }
}

/**
 * Delete Message
 * @param messageId - ID of the message to delete
 * @returns Message object if successful, throws error if failed
 */
export const deleteMessage = async(messageId: string): Promise<Message> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).delete(`/message/${messageId}`);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to delete message. Please try again.');
    }
}

/**
 * Delete Conversation
 * @param conversationId - ID of the conversation to delete
 * @returns Response object with deletion details if successful, throws error if failed
 */
export const deleteConversation = async(conversationId: string): Promise<{message: string; deleted_count: number}> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).delete(`/message/conversation/${conversationId}`);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to delete conversation. Please try again.');
    }
}

/**
 * Get Portfolio (current authenticated user)
 * @returns Portfolio object if successful, throws error if failed
 */
export const getPortfolio = async(): Promise<any> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).get('/portfolio/');
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to get portfolio. Please try again.');
    }
}

/**
 * Get Portfolio by User ID
 * @param userId - ID of the user to get portfolio for
 * @returns Portfolio object if successful, throws error if failed
 */
export const getPortfolioByUserId = async(userId: string): Promise<any> => {
    try {
        const response = await api.get(`/portfolio/user/${userId}`);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to get portfolio. Please try again.');
    }
}

/**
 * Update Portfolio
 * @param portfolio - Portfolio object containing portfolio information
 * @returns Portfolio object if successful, throws error if failed
 */
export const updatePortfolio = async(portfolio: Partial<any>): Promise<any> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).put('/portfolio/', portfolio);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to update portfolio. Please try again.');
    }
}

/**
 * Download Resume PDF for current authenticated user using LaTeX (backend generation)
 * Uses LaTeX template for professional formatting
 * @returns Promise that resolves when PDF is downloaded
 */
export const downloadResume = async (): Promise<void> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).get('/resume/latex', {
            responseType: 'blob',
        });
        
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const contentDisposition = response.headers['content-disposition'];
        let filename = 'Resume.pdf';
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        }
        
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error: any) {
        throw new Error(error.message || 'Failed to download resume. Please try again.');
    }
}