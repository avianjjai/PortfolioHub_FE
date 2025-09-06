export interface Project {
    id: number;
    title: string;
    description: string;
    technologies: string[];
    live_url?: string;
    code_url?: string;
    image_url?: string;
    start_date: string;
    end_date?: string;
    created_at: string;
    updated_at: string;
}

export interface Skill {
    _id?: string | null;
    name: string;
    category: string;
    proficiency: number;
    created_at?: string;
    updated_at?: string;

    status_code?: number;
    message?: string;
}

export interface Experience {
    id: number;
    title: string;
    company: string;
    period: string;
    description: string;
    technologies: string[];
    created_at: string;
    updated_at: string;
    start_date: string;
    end_date?: string;
}

export interface Education {
    id: number;
    degree: string;
    institution: string;
    start_date: string;
    end_date: string;
    description: string;
    created_at: string;
    updated_at: string;
    technologies: string[];
}

export interface Certification {
    id: number;
    name: string;
    issuer: string;
    date: string;
    description: string;
    created_at: string;
    updated_at: string;
    issue_date: string;
    credential_url?: string;
    credential_id?: string;
}

export interface Portfolio {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    portfolio_title?: string;
    portfolio_description?: string;
    portfolio_education?: string[];
    portfolio_certifications?: string[];
    portfolio_awards?: string[];
    title?: string;
}

export interface Message {
    id: string;
    senderName: string;
    senderEmail: string;
    messageSubject: string;
    messageContent: string;
    created_at: string;
    read: boolean;
    senderUserId?: string;
    recipientUserId?: string;
}

export interface Award {
    id: number;
    name: string;
    issuer: string;
    issue_date: string;
    description: string;
    category: string;
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: string;
    senderName: string;
    senderEmail: string;
    messageSubject: string;
    messageContent: string;
    created_at: string;
    read: boolean;
    senderUserId?: string;
    recipientUserId?: string;
}

export interface MessageCount {
    read: number;
    unread: number;
    total: number;
}