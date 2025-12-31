import jsPDF from 'jspdf';

interface ResumeData {
    user: {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
        address?: string;
        portfolio_title?: string;
        portfolio_description?: string;
        linkedin_url?: string;
        github_url?: string;
        website_url?: string;
    };
    experiences: Array<{
        title: string;
        company: string;
        description: string;
        technologies: string[];
        start_date: string;
        end_date?: string | null;
    }>;
    educations: Array<{
        degree: string;
        institution: string;
        description: string;
        start_date: string;
        end_date?: string | null;
    }>;
    projects: Array<{
        title: string;
        description: string;
        technologies: string[];
    }>;
    skills: Array<{
        name: string;
        category: string;
        proficiency: number;
    }>;
    certifications: Array<{
        name: string;
        issuer: string;
        issue_date: string;
        description: string;
    }>;
    awards: Array<{
        name: string;
        issuer: string;
        issue_date: string;
        description: string;
    }>;
}

export const generateResumePDF = (data: ResumeData): void => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to check if new page is needed
    const checkNewPage = (requiredSpace: number = 10) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
            return true;
        }
        return false;
    };

    // Helper function to add text with word wrap
    const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0], xPos?: number, align: 'left' | 'center' | 'right' = 'left') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(color[0], color[1], color[2]);
        
        const x = xPos !== undefined ? xPos : margin;
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach((line: string) => {
            checkNewPage(fontSize * 0.6);
            doc.text(line, x, yPosition, { align });
            yPosition += fontSize * 0.5;
        });
        yPosition += 3;
    };

    // Helper function to add section title
    const addSectionTitle = (title: string) => {
        checkNewPage(20);
        yPosition += 5;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(44, 62, 80); // Dark blue-gray
        doc.text(title, margin, yPosition);
        yPosition += 8;
        
        // Draw underline
        doc.setDrawColor(52, 152, 219); // Blue
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
    };

    // Header Section - Centered
    const firstName = data.user.first_name || '';
    const lastName = data.user.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'User';
    
    // Name - Large and centered
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(44, 62, 80); // Dark blue-gray
    const nameWidth = doc.getTextWidth(fullName);
    doc.text(fullName, (pageWidth - nameWidth) / 2, yPosition);
    yPosition += 12;
    
    // Title
    if (data.user.portfolio_title) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(127, 140, 141); // Gray
        const titleWidth = doc.getTextWidth(data.user.portfolio_title);
        doc.text(data.user.portfolio_title, (pageWidth - titleWidth) / 2, yPosition);
        yPosition += 8;
    }
    
    // Description
    if (data.user.portfolio_description) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(127, 140, 141);
        const descLines = doc.splitTextToSize(data.user.portfolio_description, maxWidth);
        descLines.forEach((line: string) => {
            const lineWidth = doc.getTextWidth(line);
            doc.text(line, (pageWidth - lineWidth) / 2, yPosition);
            yPosition += 6;
        });
        yPosition += 5;
    }
    
    // Contact Information - Centered with separators
    const contactParts: string[] = [];
    if (data.user.email) contactParts.push(data.user.email);
    if (data.user.phone) contactParts.push(data.user.phone);
    if (data.user.address) contactParts.push(data.user.address);
    if (data.user.linkedin_url) contactParts.push(data.user.linkedin_url);
    if (data.user.github_url) contactParts.push(data.user.github_url);
    if (data.user.website_url) contactParts.push(data.user.website_url);
    
    if (contactParts.length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(85, 85, 85);
        const contactText = contactParts.join(' | ');
        const contactLines = doc.splitTextToSize(contactText, maxWidth);
        contactLines.forEach((line: string) => {
            const lineWidth = doc.getTextWidth(line);
            doc.text(line, (pageWidth - lineWidth) / 2, yPosition);
            yPosition += 5;
        });
    }
    
    yPosition += 8;
    
    // Draw a horizontal line separator
    doc.setDrawColor(52, 152, 219); // Blue
    doc.setLineWidth(1);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 12;

    // Experience Section
    if (data.experiences && data.experiences.length > 0) {
        addSectionTitle('EXPERIENCE');
        
        data.experiences.forEach((exp, index) => {
            if (index > 0) yPosition += 3; // Space between experiences
            
            // Job Title - Bold
            addText(exp.title, 13, true, [44, 62, 80]);
            
            // Company and Date - Gray, on same line
            const dateRange = `${exp.start_date} - ${exp.end_date || 'Present'}`;
            const companyDate = `${exp.company} | ${dateRange}`;
            addText(companyDate, 10, false, [127, 140, 141]);
            
            // Description
            if (exp.description) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                const descLines = doc.splitTextToSize(exp.description, maxWidth);
                descLines.forEach((line: string) => {
                    checkNewPage(6);
                    doc.text(line, margin, yPosition);
                    yPosition += 5;
                });
                yPosition += 2;
            }
            
            // Technologies
            if (exp.technologies && exp.technologies.length > 0) {
                doc.setFontSize(9);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(127, 140, 141);
                const techText = `Technologies: ${exp.technologies.join(', ')}`;
                const techLines = doc.splitTextToSize(techText, maxWidth);
                techLines.forEach((line: string) => {
                    checkNewPage(5);
                    doc.text(line, margin, yPosition);
                    yPosition += 4;
                });
            }
        });
        yPosition += 5;
    }

    // Education Section
    if (data.educations && data.educations.length > 0) {
        addSectionTitle('EDUCATION');
        
        data.educations.forEach((edu, index) => {
            if (index > 0) yPosition += 3;
            
            // Degree - Bold
            addText(edu.degree, 13, true, [44, 62, 80]);
            
            // Institution and Date
            const dateRange = `${edu.start_date} - ${edu.end_date || 'Present'}`;
            const institutionDate = `${edu.institution} | ${dateRange}`;
            addText(institutionDate, 10, false, [127, 140, 141]);
            
            // Description
            if (edu.description) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                const descLines = doc.splitTextToSize(edu.description, maxWidth);
                descLines.forEach((line: string) => {
                    checkNewPage(6);
                    doc.text(line, margin, yPosition);
                    yPosition += 5;
                });
            }
        });
        yPosition += 5;
    }

    // Skills Section
    if (data.skills && data.skills.length > 0) {
        addSectionTitle('SKILLS');
        
        const skillsText = data.skills.map(skill => skill.name).join(', ');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const skillsLines = doc.splitTextToSize(skillsText, maxWidth);
        skillsLines.forEach((line: string) => {
            checkNewPage(6);
            doc.text(line, margin, yPosition);
            yPosition += 5;
        });
        yPosition += 3;
    }

    // Projects Section
    if (data.projects && data.projects.length > 0) {
        addSectionTitle('PROJECTS');
        
        data.projects.forEach((proj, index) => {
            if (index > 0) yPosition += 3;
            
            // Project Title - Bold
            addText(proj.title, 13, true, [44, 62, 80]);
            
            // Technologies
            if (proj.technologies && proj.technologies.length > 0) {
                doc.setFontSize(9);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(127, 140, 141);
                const techText = `Technologies: ${proj.technologies.join(', ')}`;
                const techLines = doc.splitTextToSize(techText, maxWidth);
                techLines.forEach((line: string) => {
                    checkNewPage(5);
                    doc.text(line, margin, yPosition);
                    yPosition += 4;
                });
                yPosition += 2;
            }
            
            // Description
            if (proj.description) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                const descLines = doc.splitTextToSize(proj.description, maxWidth);
                descLines.forEach((line: string) => {
                    checkNewPage(6);
                    doc.text(line, margin, yPosition);
                    yPosition += 5;
                });
            }
        });
        yPosition += 5;
    }

    // Certifications Section
    if (data.certifications && data.certifications.length > 0) {
        addSectionTitle('CERTIFICATIONS');
        
        data.certifications.forEach((cert, index) => {
            if (index > 0) yPosition += 3;
            
            // Certification Name - Bold
            addText(cert.name, 13, true, [44, 62, 80]);
            
            // Issuer and Date
            const issuerDate = `${cert.issuer} | ${cert.issue_date}`;
            addText(issuerDate, 10, false, [127, 140, 141]);
            
            // Description
            if (cert.description) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                const descLines = doc.splitTextToSize(cert.description, maxWidth);
                descLines.forEach((line: string) => {
                    checkNewPage(6);
                    doc.text(line, margin, yPosition);
                    yPosition += 5;
                });
            }
        });
        yPosition += 5;
    }

    // Awards Section
    if (data.awards && data.awards.length > 0) {
        addSectionTitle('AWARDS');
        
        data.awards.forEach((award, index) => {
            if (index > 0) yPosition += 3;
            
            // Award Name - Bold
            addText(award.name, 13, true, [44, 62, 80]);
            
            // Issuer and Date
            const issuerDate = `${award.issuer} | ${award.issue_date}`;
            addText(issuerDate, 10, false, [127, 140, 141]);
            
            // Description
            if (award.description) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                const descLines = doc.splitTextToSize(award.description, maxWidth);
                descLines.forEach((line: string) => {
                    checkNewPage(6);
                    doc.text(line, margin, yPosition);
                    yPosition += 5;
                });
            }
        });
    }

    // Generate filename and save
    const filename = `${firstName}_${lastName}_Resume.pdf`.trim().replace(/\s+/g, '_') || 'Resume.pdf';
    doc.save(filename);
};
