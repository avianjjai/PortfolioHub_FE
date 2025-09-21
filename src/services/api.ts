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

// Create axios authenticated instance with the passed token
const authenticatedApi = (token: string) => {
    return axios.create({
        baseURL: getApiBaseUrl(),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
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
export const register = async (email: string, password: string) => {
    try {
        const response = await api.post(
            `${getApiBaseUrl()}/auth/register`,
            { 
                email: email,
                password: password,
                username: email
            },
            { 
                headers: { 
                    'Content-Type': 'application/json' 
                } 
            }
        );
        return response.data;
    } catch (error: any) {
        throw error;
    }
}

// Get Me API Call
export const getMe = async () => {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('No token found');
        }

        const response = await api.get(`${getApiBaseUrl()}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw error;
    }
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
 * Get Skill by ID
 * @param skillId - ID of the skill to get
 * @returns Skill object if successful, throws error if failed
 */
export const getSkillById = async(skillId: string): Promise<Skill> => {
    try {
        const response = await api.get(`/skills/${skillId}`);
        return response.data;
    } catch (error: any) {
        throw new Error('Failed to get skill. Please try again.');
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
 * Get Project by ID
 * @param projectId - ID of the project to get
 * @returns Project object if successful, throws error if failed
 */
export const getProjectById = async(projectId: string): Promise<Project> => {
    try {
        const response = await api.get(`/projects/${projectId}`);
        return response.data;
    } catch (error: any) {
        throw new Error('Failed to get project. Please try again.');
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
 * Get Experience by ID
 * @param experienceId - ID of the experience to get
 * @returns Experience object if successful, throws error if failed
 */
export const getExperienceById = async(experienceId: string): Promise<Experience> => {
    try {
        const response = await api.get(`/experiences/${experienceId}`);
        return response.data;
    } catch (error: any) {
        throw new Error('Failed to get experience. Please try again.');
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
 * Get Education by ID
 * @param educationId - ID of the education to get
 * @returns Education object if successful, throws error if failed
 */
export const getEducationById = async(educationId: string): Promise<Education> => {
    try {
        const response = await api.get(`/educations/${educationId}`);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to get education. Please try again.');
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
 * Get Certification by ID
 * @param certificationId - ID of the certification to get
 * @returns Certification object if successful, throws error if failed
 */
export const getCertificationById = async(certificationId: string): Promise<Certification> => {
    try {
        const response = await api.get(`/certifications/${certificationId}`);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to get certification. Please try again.');
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
 * Get Award by ID
 * @param awardId - ID of the award to get
 * @returns Award object if successful, throws error if failed
 */
export const getAwardById = async(awardId: string): Promise<Award> => {
    try {
        const response = await api.get(`/awards/${awardId}`);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to get award. Please try again.');
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
        const response = await api.get('/messages');
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
 * @param message - Message object containing messageSubject, messageContent, and recipientUserId
 * @returns Message object if successful, throws error if failed
 */
export const sendAuthenticatedUserMessage = async(message: Omit<Message, 'id' | 'created_at' | 'updated_at'>): Promise<Message> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).post('/message', message);
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
export const sendUnauthenticatedUserMessage = async(message: Omit<Message, 'id' | 'created_at' | 'updated_at'>): Promise<Message> => {
    try {
        const response = await api.post('/message/unauthenticated', message);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to send message. Please try again.');
    }
}

/**
 * Get Message Count by 
 * @returns Message count object if successful, throws error if failed
 */
export const getMessageCount = async(): Promise<MessageCount> => {
    try {
        const response = await api.get('/message/count');
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
        const response = await authenticatedApi(token).get('/message/received');
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to get received messages list. Please try again.');
    }
}

/**
 * Get Received Message by message ID
 * @param messageId - ID of the message to get
 * @returns Message object if successful, throws error if failed
 */
export const getReceivedMessage = async(messageId: string): Promise<Message> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).get(`/message/received/${messageId}`);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to get received message. Please try again.');
    }
}

/**
 * Update Message
 * @param messageId - ID of the message to update
 * @param message - Message object containing read
 * @returns Message object if successful, throws error if failed
 */
export const updateMessage = async(messageId: string, message: Message): Promise<Message> => {
    const token = localStorage.getItem('access_token') ?? '';
    try {
        const response = await authenticatedApi(token).put(`/message/${messageId}`, message);
        return response.data;
    } catch(error: any) {
        throw new Error('Failed to update message. Please try again.');
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