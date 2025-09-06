import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Award, Certification, Education, Experience, Message, Project, Skill } from "../services/modal";
import { addSkill, getAwardsByUserId, getCertificationsByUserId, getEducationsByUserId, getExperiencesByUserId, getProjectsByUserId, getReceivedMessagesList, getSkillsByUserId } from "../services/api";
import { useAuth } from "./AuthContext";

interface PortfolioContextType {
    skills: Skill[];
    setSkills: (skills: Skill[]) => void;
    getSkills: (currentUserId: string) => Promise<void>;
    isSkillLoading: boolean;
    setIsSkillLoading: (isSkillLoading: boolean) => void;

    projects: Project[];
    setProjects: (projects: Project[]) => void;
    getProjects: (currentUserId: string) => Promise<void>;
    isProjectLoaded: boolean;
    
    experiences: Experience[];
    setExperiences: (experiences: Experience[]) => void;
    getExperiences: (currentUserId: string) => Promise<void>;
    isExperienceLoaded: boolean;
    
    educations: Education[];
    setEducations: (educations: Education[]) => void;
    getEducations: (currentUserId: string) => Promise<void>;
    isEducationLoaded: boolean;
    
    certifications: Certification[];
    setCertifications: (certifications: Certification[]) => void;
    getCertifications: (currentUserId: string) => Promise<void>;
    isCertificationLoaded: boolean;

    awards: Award[];
    setAwards: (awards: Award[]) => void;
    getAwards: (currentUserId: string) => Promise<void>;
    isAwardLoaded: boolean;

    messages: Message[];
    setMessages: (messages: Message[]) => void;
    getMessages: () => Promise<void>;
    isMessageLoaded: boolean;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isSkillLoading, setIsSkillLoading] = useState(true);   
    const { isAuthenticated, currentUser } = useAuth();

    const getSkills = async (currentUserId: string) => {
        const skills = await getSkillsByUserId(currentUserId);
        setSkills(skills);
    }

    const [projects, setProjects] = useState<Project[]>([]);
    const [isProjectLoaded, setIsProjectLoaded] = useState(false);
    const getProjects = async (currentUserId: string) => {
        const projects = await getProjectsByUserId(currentUserId);
        setProjects(projects);
    }

    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [isExperienceLoaded, setIsExperienceLoaded] = useState(false);
    const getExperiences = async (currentUserId: string) => {
        const experiences = await getExperiencesByUserId(currentUserId);
        setExperiences(experiences);
    }

    const [educations, setEducations] = useState<Education[]>([]);
    const [isEducationLoaded, setIsEducationLoaded] = useState(false);
    const getEducations = async (currentUserId: string) => {
        const educations = await getEducationsByUserId(currentUserId);
        setEducations(educations);
    }

    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [isCertificationLoaded, setIsCertificationLoaded] = useState(false);
    const getCertifications = async (currentUserId: string) => {
        const certifications = await getCertificationsByUserId(currentUserId);
        setCertifications(certifications);
    }

    const [awards, setAwards] = useState<Award[]>([]);
    const [isAwardLoaded, setIsAwardLoaded] = useState(false);
    const getAwards = async (currentUserId: string) => {
        const awards = await getAwardsByUserId(currentUserId);
        setAwards(awards);
    }

    const [messages, setMessages] = useState<Message[]>([]);
    const [isMessageLoaded, setIsMessageLoaded] = useState(false);
    const getMessages = async () => {
        const messages = await getReceivedMessagesList();
        setMessages(messages);
    }

    useEffect(() => {
        if (isAuthenticated && currentUser) {
            if (isSkillLoading) {
                getSkills(currentUser.id);
                setIsSkillLoading(false);
            }
            if (!isProjectLoaded) {
                getProjects(currentUser.id);
                setIsProjectLoaded(true);
            }
            if (!isExperienceLoaded) {
                getExperiences(currentUser.id);
                setIsExperienceLoaded(true);
            }
            if (!isEducationLoaded) {
                getEducations(currentUser.id);
                setIsEducationLoaded(true);
            }
            if (!isCertificationLoaded) {
                getCertifications(currentUser.id);
                setIsCertificationLoaded(true);
            }
            if (!isAwardLoaded) {
                getAwards(currentUser.id);
                setIsAwardLoaded(true);
            }
            if (!isMessageLoaded) {
                getMessages();
                setIsMessageLoaded(true);
            }
        }
    }, [
        skills, isSkillLoading, getSkills, 
        projects, isProjectLoaded, getProjects, 
        experiences, isExperienceLoaded, getExperiences, 
        educations, isEducationLoaded, getEducations, 
        certifications, isCertificationLoaded, getCertifications, 
        awards, isAwardLoaded, getAwards,
        messages, isMessageLoaded, getMessages,
    ]);

    return (
        <PortfolioContext.Provider value={{ 
            skills, isSkillLoading, getSkills, setSkills, setIsSkillLoading,
            projects, isProjectLoaded, getProjects, setProjects, 
            experiences, isExperienceLoaded, getExperiences, setExperiences, 
            educations, isEducationLoaded, getEducations, setEducations, 
            certifications, isCertificationLoaded, getCertifications, setCertifications, 
            awards, isAwardLoaded, getAwards, setAwards,
            messages, isMessageLoaded, getMessages, setMessages,
        }}>
            {children}
        </PortfolioContext.Provider>
    );
}

export const usePortfolio = () => {
    const context = useContext(PortfolioContext);
    if (!context) {
        throw new Error('usePortfolio must be used within a PortfolioProvider');
    }
    return context;
}