import { Edit2, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePortfolio } from "../../context/PortfolioContext";
import { useState } from "react";
import { Education } from "../../services/modal";
import { ModalOverlay } from "../forms/ModalOverlay";
import { DeleteConfirmationModal, EducationAddEditForm } from "../forms/EducationForms";

const getEducationDuration = (startDate: string, endDate: string) => {
    if (startDate && endDate) {
        return `${new Date(startDate).getFullYear()} - ${new Date(endDate).getFullYear()}`;
    } else if (startDate) {
        return `${new Date(startDate).getFullYear()}`;
    } else {
        return 'Present';
    }
};

const EducationSection = () => {
    const { isAuthenticated } = useAuth();
    const { educations } = usePortfolio();
    const [selectedEducation, setSelectedEducation] = useState<Education | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
    
    return (
        <section id='education' className='gradient-blue-purple py-20'>
            {showAddForm && (
                <ModalOverlay onClose={() => setShowAddForm(false)}>
                    <EducationAddEditForm isAdd={true} setShowForm={setShowAddForm} />
                </ModalOverlay>
            )}
            
            {showEditForm && (
                <ModalOverlay onClose={() => setShowEditForm(false)}>
                    <EducationAddEditForm isAdd={false} setShowForm={setShowEditForm} selectedEducation={selectedEducation} />
                </ModalOverlay>
            )}
            
            {showDeleteConfirmationModal && (
                <ModalOverlay onClose={() => setShowDeleteConfirmationModal(false)}>
                    <DeleteConfirmationModal education={selectedEducation} setShowDeleteConfirmationModal={setShowDeleteConfirmationModal} />
                </ModalOverlay>
            )}
            
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-white mb-12 text-center">Education</h2>
                <div className="w-full">
                    {isAuthenticated && (
                        <div className="mb-8 text-center">
                            <button 
                                className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-colors mb-4 border border-white/30"
                                onClick={() => setShowAddForm(true)}
                            >
                                Add Education
                            </button>
                        </div>
                    )}
                    {educations && educations.length > 0 ? (
                        <div className="w-full space-y-8">
                            {educations.map((education: any) => (
                                <div 
                                    key={education.id}
                                    className="bg-white/20 rounded-2xl p-8 backdrop-blur-sm border border-white/30 relative group"
                                >
                                    {isAuthenticated && (
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <button 
                                                className="p-2 text-white/60 hover:text-white/90 hover:bg-white/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                onClick={() => {
                                                    setSelectedEducation(education);
                                                    setShowEditForm(true);
                                                }}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                className="p-2 text-white/60 hover:text-white/90 hover:bg-white/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                onClick={() => {
                                                    setSelectedEducation(education);
                                                    setShowDeleteConfirmationModal(true);
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-2">{education.degree}</h3>
                                            <p className="text-xl text-white/90 mb-2">{education.institution}</p>
                                        </div>
                                        
                                        <span className="text-lg text-white/80 bg-white/20 px-4 py-2 rounded-full border border-white/30">
                                            {getEducationDuration(education.start_date, education.end_date)}
                                        </span>
                                    </div>

                                    {education.description && (
                                        <p className="text-white/90 mt-4 leading-relaxed">
                                            {education.description}
                                        </p>
                                    )}

                                    {education.technologies && education.technologies.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {education.technologies.map((technology: any) => (
                                                <span key={technology} className="text-white/80 bg-white/20 px-3 py-1 rounded-full border border-white/30">{technology}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        ) : (
                            <div className="text-white/90 text-center">
                                No education found
                            </div>
                        )}
                </div>
            </div>
        </section>
    );
};

export default EducationSection;