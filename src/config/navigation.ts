export interface NavItem {
    path: string;
    label: string;
    isRoute: boolean;
}

export const getNavigationItems = (isMe: boolean, isValidUser: boolean): NavItem[] => {
    const messageItem = isMe ? [{ path: '#contact-management', label: 'Messages', isRoute: false }] : [];
    const contactItem = !isMe && isValidUser ? [{ path: '#contact', label: 'Contact', isRoute: false }] : [];
    const items: NavItem[] = [
        { path: '/', label: 'Home', isRoute: true },
        { path: '#about', label: 'About', isRoute: false },
        { path: '#skills', label: 'Skills', isRoute: false },
        { path: '#projects', label: 'Projects', isRoute: false },
        { path: '#experience', label: 'Experience', isRoute: false },
        { path: '#education', label: 'Education', isRoute: false },
        { path: '#certifications', label: 'Certifications', isRoute: false },
        { path: '#awards', label: 'Awards', isRoute: false },
        ...contactItem,
        ...messageItem,
    ];

    return items;
}