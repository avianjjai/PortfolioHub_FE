import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePortfolio } from '../../context/PortfolioContext';
import { Edit2, Trash2 } from 'lucide-react';
import { Project } from '../../services/modal';
import { ModalOverlay } from '../forms/ModalOverlay';
import { DeleteConfirmationModal, ProjectAddEditForm } from '../forms/ProjectsForms';

const calculateProjectPeriod = (startDate: string | null, endDate?: string | null): string => {
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();

    const startYear = start.getFullYear();
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });

    if (!endDate || endDate === null) {
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
                        project={selectedProject}
                        setShowDeleteConfirmationModal={setShowDeleteConfirmationModal}
                    />
                </ModalOverlay>
            )}

            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-white mb-12 text-center">Projects</h2>

                <div className="w-full text-center">
                    {isAuthenticated && (
                        <>
                            <button
                                className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-colors mb-4 border border-white/30"
                                onClick={() => setShowAddForm(true)}
                            >
                                Add Project
                            </button>
                        </>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {projects.map((project) => (
                            <div key={project._id} className="bg-white/20 rounded-2xl p-6 backdrop-blur-sm border border-white/30 group relative">
                                <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                                    <span className="text-4xl font-bold text-white">{project.title.charAt(0)}</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{project.title}</h3>
                                <p className="text-white/90 mb-4 line-clamp-3">{project.description}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {(project.technologies as string[]).map((tech: string, techIndex: number) => (
                                        <span key={techIndex} className="px-3 py-1 bg-white/30 text-white rounded-full text-sm font-medium border border-white/30">
                                            {tech}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-white/80">
                                        {calculateProjectPeriod(project.start_date, project.end_date)}
                                    </span>

                                    <div className="flex gap-2">
                                        {isAuthenticated && (
                                            <>
                                                <button 
                                                    className="p-2 text-white/60 hover:text-white/90 hover:bg-white/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Edit project"
                                                    onClick={() => {
                                                        setSelectedProject(project);
                                                        setShowEditForm(true);
                                                    }}
                                                >
                                                    <Edit2 size={14} />
                                                </button>

                                                <button 
                                                    className="p-2 text-white/60 hover:text-white/90 hover:bg-white/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Delete project"
                                                    onClick={() => {
                                                        setSelectedProject(project);
                                                        setShowDeleteConfirmationModal(true);
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}

                                        {project.live_url && (
                                            <a 
                                                href={project.live_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="px-3 py-1 bg-white/20 text-white rounded-lg text-sm hover:bg-white/30 transition-colors border border-white/30"
                                            >
                                                Live
                                            </a>
                                        )}

                                        {project.code_url && (
                                            <a 
                                                href={project.code_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="px-3 py-1 bg-white/20 text-white rounded-lg text-sm hover:bg-white/30 transition-colors border border-white/30"
                                            >
                                                Code
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProjectSection;  