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
    isProjectLoading: boolean;
    setIsProjectLoading: (isProjectLoading: boolean) => void;
    
    experiences: Experience[];
    setExperiences: (experiences: Experience[]) => void;
    getExperiences: (currentUserId: string) => Promise<void>;
    isExperienceLoading: boolean;
    setIsExperienceLoading: (isExperienceLoading: boolean) => void;
    
    educations: Education[];
    setEducations: (educations: Education[]) => void;
    getEducations: (currentUserId: string) => Promise<void>;
    isEducationLoading: boolean;
    setIsEducationLoading: (isEducationLoading: boolean) => void;
    
    certifications: Certification[];
    setCertifications: (certifications: Certification[]) => void;
    getCertifications: (currentUserId: string) => Promise<void>;
    isCertificationLoading: boolean;
    setIsCertificationLoading: (isCertificationLoading: boolean) => void;

    awards: Award[];
    setAwards: (awards: Award[]) => void;
    getAwards: (currentUserId: string) => Promise<void>;
    isAwardLoading: boolean;
    setIsAwardLoading: (isAwardLoading: boolean) => void;

    messages: Message[];
    setMessages: (messages: Message[]) => void;
    getMessages: () => Promise<void>;
    isMessageLoading: boolean;
    setIsMessageLoading: (isMessageLoading: boolean) => void;
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
    const [isProjectLoading, setIsProjectLoading] = useState(true);
    const getProjects = async (currentUserId: string) => {
        const projects = await getProjectsByUserId(currentUserId);
        setProjects(projects);
    }

    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [isExperienceLoading, setIsExperienceLoading] = useState(true);
    const getExperiences = async (currentUserId: string) => {
        const experiences = await getExperiencesByUserId(currentUserId);
        setExperiences(experiences);
    }

    const [educations, setEducations] = useState<Education[]>([]);
    const [isEducationLoading, setIsEducationLoading] = useState(true);
    const getEducations = async (currentUserId: string) => {
        const educations = await getEducationsByUserId(currentUserId);
        setEducations(educations);
    }

    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [isCertificationLoading, setIsCertificationLoading] = useState(true);
    const getCertifications = async (currentUserId: string) => {
        const certifications = await getCertificationsByUserId(currentUserId);
        setCertifications(certifications);
    }

    const [awards, setAwards] = useState<Award[]>([]);
    const [isAwardLoading, setIsAwardLoading] = useState(true);
    const getAwards = async (currentUserId: string) => {
        const awards = await getAwardsByUserId(currentUserId);
        setAwards(awards);
    }

    const [messages, setMessages] = useState<Message[]>([]);
    const [isMessageLoading, setIsMessageLoading] = useState(true);
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
            if (isProjectLoading) {
                getProjects(currentUser.id);
                setIsProjectLoading(false);
            }
            if (isExperienceLoading) {
                getExperiences(currentUser.id);
                setIsExperienceLoading(false);
            }
            if (isEducationLoading) {
                getEducations(currentUser.id);
                setIsEducationLoading(false);
            }
            if (isCertificationLoading) {
                getCertifications(currentUser.id);
                setIsCertificationLoading(false);
            }
            if (isAwardLoading) {
                getAwards(currentUser.id);
                setIsAwardLoading(false);
            }
            if (isMessageLoading) {
                getMessages();
                setIsMessageLoading(false);
            }
        }
    }, [
        skills, isSkillLoading, getSkills, setIsSkillLoading,
        projects, isProjectLoading, getProjects, setIsProjectLoading,
        experiences, isExperienceLoading, getExperiences, setIsExperienceLoading,   
        educations, isEducationLoading, getEducations, setIsEducationLoading,
        certifications, isCertificationLoading, getCertifications, setIsCertificationLoading,
        awards, isAwardLoading, getAwards, setIsAwardLoading,
        messages, isMessageLoading, getMessages, setIsMessageLoading,
    ]);

    return (
        <PortfolioContext.Provider value={{ 
            skills, isSkillLoading, getSkills, setSkills, setIsSkillLoading,
            projects, isProjectLoading, getProjects, setProjects, setIsProjectLoading,
            experiences, isExperienceLoading, getExperiences, setExperiences, setIsExperienceLoading,
            educations, isEducationLoading, getEducations, setEducations, setIsEducationLoading,
            certifications, isCertificationLoading, getCertifications, setCertifications, setIsCertificationLoading,
            awards, isAwardLoading, getAwards, setAwards, setIsAwardLoading,
            messages, isMessageLoading, getMessages, setMessages, setIsMessageLoading,
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