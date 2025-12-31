import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { usePortfolio } from "../../context/PortfolioContext";
import { Edit2, Trash2, X, Briefcase } from "lucide-react";
import { Experience } from "../../services/modal";
import { ModalOverlay } from "../forms/ModalOverlay";
import { ExperienceAddEditForm } from "../forms/ExperienceForms";
import DeleteConfirmationModal from "../forms/DeleteConfirmationModal";

const calculateExperiencePeriod = (startDate: string, endDate?: string): string => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    const startYear = start.getFullYear();
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });

    if (!endDate) {
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

const ExperienceSection: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { experiences } = usePortfolio();
    const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
    
    return (
        <section id='experience' className='gradient-pink-orange py-20'>
            {showAddForm && (
                <ModalOverlay onClose={() => setShowAddForm(false)}>
                    <ExperienceAddEditForm
                        isAdd={true}
                        setShowForm={setShowAddForm}
                        selectedExperience={null}
                    />
                </ModalOverlay>
            )}

            {showEditForm && (
                <ModalOverlay onClose={() => setShowEditForm(false)}>
                    <ExperienceAddEditForm
                        isAdd={false}
                        setShowForm={setShowEditForm}
                        selectedExperience={selectedExperience}
                    />
                </ModalOverlay>
            )}

            {showDeleteConfirmationModal && (
                <ModalOverlay onClose={() => setShowDeleteConfirmationModal(false)}>
                    <DeleteConfirmationModal
                        setShowDeleteModal={setShowDeleteConfirmationModal}
                        data={selectedExperience}
                        dataType="experience"
                        setSelectedData={setSelectedExperience}
                    />
                </ModalOverlay>
            )}

            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-white mb-12 text-center">Experience</h2>
                <div className="w-full">
                    {isAuthenticated && experiences.length > 0 && (
                        <div className="mb-8 text-center">
                            <button 
                                className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-colors mb-4 border border-white/30"
                                onClick={() => setShowAddForm(true)}
                            >
                                Add Experience
                            </button>
                        </div>
                    )}
                </div>
                {experiences.length === 0 ? (
                    <div className="bg-white/20 rounded-3xl p-10 backdrop-blur-sm border border-white/30 text-center max-w-3xl mx-auto relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-50"></div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-white/30 to-white/10 rounded-full mb-6 shadow-lg border-2 border-white/40">
                                <Briefcase className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">No Experience Added Yet</h3>
                            <p className="text-white/90 text-base mb-6 leading-relaxed max-w-xl mx-auto">
                                {isAuthenticated 
                                    ? "Share your professional journey! Add your work experience and career highlights to tell your story."
                                    : "Work experience will be displayed here once it is added to the portfolio."
                                }
                            </p>
                            {isAuthenticated && (
                                <button
                                    className="px-8 py-3 bg-gradient-to-r from-white/30 to-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:from-white/40 hover:to-white/30 transition-all duration-300 border border-white/40 shadow-lg hover:shadow-xl hover:scale-105 text-base"
                                    onClick={() => setShowAddForm(true)}
                                >
                                    Add Your First Experience
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="w-full space-y-8">
                        {experiences.map((exp, index) => (
                        <div key={exp._id || `exp-${index}`} className="bg-white/20 rounded-2xl p-8 backdrop-blur-sm border border-white/30 relative group">
                            {isAuthenticated && (
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button 
                                        className="p-2 text-white/60 hover:text-white/90 hover:bg-white/20 rounded-full transition-colors opacity-0 group-hover:opacity-100" aria-label="Edit experience"
                                        onClick={() => {
                                            setSelectedExperience(exp);
                                            setShowEditForm(true);
                                        }}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        className="p-2 text-white/60 hover:text-white/90 hover:bg-white/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        onClick={() => {
                                            setSelectedExperience(exp);
                                            setShowDeleteConfirmationModal(true);
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{exp.title}</h3>
                                    <p className="text-xl text-white/90 mb-2">{exp.company}</p>
                                </div>

                                <span className="text-lg text-white/80 bg-white/20 px-4 py-2 rounded-full border border-white/30">
                                    {calculateExperiencePeriod(exp.start_date, exp.end_date)}
                                </span>
                            </div>

                            <ul className="list-disc list-outside space-y-2 text-white/90 mb-4 ml-6">
                                {exp.description
                                    .split('\n')
                                    .filter(line => line.trim() !== '')
                                    .map((desc, index) => (
                                        <li key={index} className="leading-relaxed pl-2">
                                            {desc}
                                        </li>
                                    ))
                                }
                            </ul>
                            

                            <div className="flex flex-wrap gap-2">
                                {(exp.technologies as string[]).map((tech: string, techIndex: number) => (
                                    <span 
                                        key={`${exp._id}-tech-${techIndex}`} 
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
        </section>
    );
};

export default ExperienceSection;