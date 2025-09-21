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

export interface Project {
    _id?: string | null;
    title: string;
    description: string;
    technologies: string[];
    live_url?: string;
    code_url?: string;
    image_url?: string;
    start_date: any;
    end_date?: any;
    created_at?: string;
    updated_at?: string;

    status_code?: number;
    message?: string;
}

export interface Experience {
    _id?: string | null;
    title: string;
    company: string;
    description: string;
    technologies: string[];
    created_at?: string;
    updated_at?: string;
    start_date: any;
    end_date?: any;

    status_code?: number;
    message?: string;
}

export interface Education {
    _id?: string | null;
    degree: string;
    institution: string;
    start_date: any;
    end_date?: any;
    description: string;
    created_at?: string;
    updated_at?: string;
    
    status_code?: number;
    message?: string;
}

export interface Certification {
    _id?: string | null;
    name: string;
    issuer: string;
    description: string;
    created_at?: string;
    updated_at?: string;
    issue_date: any;
    credential_url?: string;
    credential_id?: string;

    status_code?: number;
    message?: string;
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

    status_code?: number;
    message?: string;
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

    status_code?: number;
    message?: string;
}

export interface Award {
    _id?: string | null;
    name: string;
    issuer: string;
    issue_date: any;
    description: string;
    category: string;
    created_at?: string;
    updated_at?: string;

    status_code?: number;
    message?: string;
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

    status_code?: number;
    message?: string;
}

export interface MessageCount {
    read: number;
    unread: number;
    total: number;
}