import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePortfolio } from '../../context/PortfolioContext';
import { Edit2, Trash2, FolderKanban } from 'lucide-react';
import { Project } from '../../services/modal';
import { ModalOverlay } from '../forms/ModalOverlay';
import { ProjectAddEditForm } from '../forms/ProjectsForms';
import DeleteConfirmationModal from '../forms/DeleteConfirmationModal';

// Helper function to format date to YYYY-MM-DD string for date objects
const formatDateForDisplay = (date: any): string | null => {
    if (!date) return null;
    if (typeof date === 'string') {
        // If it's already a string, check if it's in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
        }
        // Try to parse and format it
        const d = new Date(date);
        if (!isNaN(d.getTime())) {
            return d.toISOString().split('T')[0];
        }
    }
    // If it's a number (epoch), convert it
    if (typeof date === 'number') {
        return new Date(date).toISOString().split('T')[0];
    }
    return null;
};

const calculateProjectPeriod = (startDate: any, endDate?: any): string => {
    const startDateStr = formatDateForDisplay(startDate);
    const endDateStr = formatDateForDisplay(endDate);
    
    const start = startDateStr ? new Date(startDateStr) : new Date();
    const end = endDateStr ? new Date(endDateStr) : new Date();

    const startYear = start.getFullYear();
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });

    if (!endDateStr || endDateStr === null) {
        return `${startMonth} ${startYear} - Present`;
    }

    const endYear = end.getFullYear();
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });

    if (startYear === endYear) {
        return `${startMonth} - ${endMonth} ${startYear}`;
    } else {
        return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
    }
}

const ProjectSection: React.FC = () => {
    const { isAuthenticated } = useAuth();  
    const { projects } = usePortfolio();
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);

    return (
        <section id='projects' className='gradient-pink-orange py-20'>           
            {showAddForm && (
                <ModalOverlay onClose={() => setShowAddForm(false)}>
                    <ProjectAddEditForm 
                        isAdd={true} 
                        setShowForm={setShowAddForm} 
                        selectedProject={null} 
                    />
                </ModalOverlay>
            )}

            {showEditForm && (
                <ModalOverlay onClose={() => setShowEditForm(false)}>
                    <ProjectAddEditForm 
                        isAdd={false} 
                        setShowForm={setShowEditForm} 
                        selectedProject={selectedProject} 
                    />
                </ModalOverlay>
            )}

            {showDeleteConfirmationModal && (
                <ModalOverlay onClose={() => setShowDeleteConfirmationModal(false)}>
                    <DeleteConfirmationModal
                        data={selectedProject}
                        dataType="project"
                        setShowDeleteModal={setShowDeleteConfirmationModal}
                        setSelectedData={setSelectedProject}
                    />
                </ModalOverlay>
            )}

            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-white mb-12 text-center">Projects</h2>
                <div className="w-full">
                    {isAuthenticated && projects.length > 0 && (
                        <div className="mb-8 text-center">
                            <button
                                className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-colors mb-4 border border-white/30"
                                onClick={() => setShowAddForm(true)}
                            >
                                Add Project
                            </button>
                        </div>
                    )}

                    {projects.length === 0 ? (
                        <div className="bg-white/20 rounded-3xl p-10 backdrop-blur-sm border border-white/30 text-center max-w-3xl mx-auto relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-50"></div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-white/30 to-white/10 rounded-full mb-6 shadow-lg border-2 border-white/40">
                                    <FolderKanban className="w-12 h-12 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">No Projects Added Yet</h3>
                                <p className="text-white/90 text-base mb-6 leading-relaxed max-w-xl mx-auto">
                                    {isAuthenticated 
                                        ? "Showcase your work! Add your projects and highlight your accomplishments to demonstrate your expertise."
                                        : "Projects will be displayed here once they are added to the portfolio."
                                    }
                                </p>
                                {isAuthenticated && (
                                    <button
                                        className="px-8 py-3 bg-gradient-to-r from-white/30 to-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:from-white/40 hover:to-white/30 transition-all duration-300 border border-white/40 shadow-lg hover:shadow-xl hover:scale-105 text-base"
                                        onClick={() => setShowAddForm(true)}
                                    >
                                        Add Your First Project
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="w-full space-y-8">
                            {projects.map((project, index) => (
                            <div key={project._id || `proj-${index}`} className="bg-white/20 rounded-2xl p-8 backdrop-blur-sm border border-white/30 relative group">
                                {isAuthenticated && (
                                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                                        <button 
                                            className="p-2 text-white/60 hover:text-white/90 hover:bg-white/20 rounded-full transition-colors opacity-0 group-hover:opacity-100" aria-label="Edit project"
                                            onClick={() => {
                                                setSelectedProject(project);
                                                setShowEditForm(true);
                                            }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            className="p-2 text-white/60 hover:text-white/90 hover:bg-white/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                            onClick={() => {
                                                setSelectedProject(project);
                                                setShowDeleteConfirmationModal(true);
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}

                                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                                        {(project.live_url?.trim() || project.code_url?.trim()) && (
                                            <div className="flex gap-4 mt-1">
                                                {project.live_url?.trim() && (
                                                    <a 
                                                        href={project.live_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="text-white/90 hover:text-white text-base font-medium underline decoration-white/60 hover:decoration-white transition-colors"
                                                    >
                                                        Live Demo
                                                    </a>
                                                )}
                                                {project.code_url?.trim() && (
                                                    <a 
                                                        href={project.code_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="text-white/90 hover:text-white text-base font-medium underline decoration-white/60 hover:decoration-white transition-colors"
                                                    >
                                                        Source Code
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <span className="text-lg text-white/80 bg-white/20 px-4 py-2 rounded-full border border-white/30">
                                        {calculateProjectPeriod(project.start_date, project.end_date)}
                                    </span>
                                </div>

                                <ul className="list-disc list-outside space-y-2 text-white/90 mb-4 ml-6 text-left">
                                    {project.description
                                        .split('\n')
                                        .filter(line => line.trim() !== '')
                                        .map((desc, index) => (
                                            <li key={index} className="leading-relaxed pl-2 text-left">
                                                {desc}
                                            </li>
                                        ))
                                    }
                                </ul>

                                <div className="flex flex-wrap gap-2">
                                    {(project.technologies as string[]).map((tech: string, techIndex: number) => (
                                        <span 
                                            key={`${project._id}-tech-${techIndex}`} 
                                            className="px-3 py-1 bg-white/30 text-white rounded-full text-sm font-medium border border-white/30"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProjectSection;  