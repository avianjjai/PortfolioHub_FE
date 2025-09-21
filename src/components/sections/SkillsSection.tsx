import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { addSkill, getSkillsByUserId } from "../../services/api";
import { usePortfolio } from "../../context/PortfolioContext";
import { Edit2, Trash2, X } from "lucide-react";
import { AddEditSkillForm, DeleteConfirmationModal } from "../forms/SkillForms";
import { ModalOverlaySkills } from "../forms/ModalOverlay";
import { Skill } from "../../services/modal";

const SkillsSection: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { skills } = usePortfolio();
    const [categoryVisibleSkills, setCategoryVisibleSkills] = useState<Record<string, number>>({});
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);

    const MAX_SKILLS_PER_CATEGORY = 10;
    const INCREMENT_SKILLS_PER_CATEGORY_AT_A_TIME = 5;

    const handleShowMoreSkills = (category: string, maxSkills: number) => {
        const currentVisibleCount = categoryVisibleSkills[category] || MAX_SKILLS_PER_CATEGORY;
        const newVisibleCount = Math.min(currentVisibleCount + INCREMENT_SKILLS_PER_CATEGORY_AT_A_TIME, maxSkills);
        setCategoryVisibleSkills(prev => ({
            ...prev,
            [category]: newVisibleCount
        }));

        console.log(categoryVisibleSkills, 'categoryVisibleSkills');
    }

    const handleHideSkills = (category: string, maxSkills: number) => {
        const currentVisibleCount = categoryVisibleSkills[category] || MAX_SKILLS_PER_CATEGORY;
        const newVisibleCount = Math.max(MAX_SKILLS_PER_CATEGORY, currentVisibleCount - INCREMENT_SKILLS_PER_CATEGORY_AT_A_TIME);
        setCategoryVisibleSkills(prev => ({
            ...prev,
            [category]: newVisibleCount
        }));

        console.log(categoryVisibleSkills);
    }
    

    return (
        <section id='skills' className='gradient-orange-yellow py-20'>
            {showAddForm && (
                <ModalOverlaySkills onClose={() => setShowAddForm(false)}>
                    <AddEditSkillForm
                        isAdd={true}
                        selectedSkill={null}
                        setShowForm={setShowAddForm}
                    />
                </ModalOverlaySkills>
            )}

            {showEditForm && (
                <ModalOverlaySkills onClose={() => setShowEditForm(false)}>
                    <AddEditSkillForm
                        isAdd={false}
                        selectedSkill={selectedSkill}
                        setShowForm={setShowEditForm}
                    />
                </ModalOverlaySkills>
            )}

            {showDeleteConfirmationModal && (
                <ModalOverlaySkills onClose={() => setShowDeleteConfirmationModal(false)}>
                    <DeleteConfirmationModal
                        skill={selectedSkill}
                        setShowDeleteConfirmationModal={setShowDeleteConfirmationModal}
                    />
                </ModalOverlaySkills>
            )}

            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-white mb-12 text-center">Skills</h2>

                <div className="w-full">
                    {isAuthenticated && (
                        <div className="mb-8 text-center">
                            <button 
                                className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-colors mb-4 border border-white/30"
                                onClick={() => setShowAddForm(true)}
                            >
                                Add Skill
                            </button>
                        </div>
                    )}

                    {(() => {
                        const skillsByCategory = skills.reduce((acc, skill) => {
                            if (!acc[skill.category]) {
                                acc[skill.category] = [];
                            }
                            acc[skill.category].push(skill);
                            return acc;
                        }, {} as Record<string, any[]>);

                        return (
                            <div className="space-y-6">
                                {Object.entries(skillsByCategory).map(([category, categorySkills]) => {
                                    const skillsArray = categorySkills as any[];
                                    const skillCountPerCategory = skillsArray.length;
                                    const visibleSkillsCountPerCategory = categoryVisibleSkills[category] || Math.min(MAX_SKILLS_PER_CATEGORY, skillCountPerCategory);
                                    const visibleSkillsPerCategory = skillsArray.slice(0, visibleSkillsCountPerCategory);

                                    return (
                                        <div key={category} className="bg-white/20 rounded-xl p-6 backdrop-blur-sm border border-white/30">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-xl font-bold text-white">{category}</h3>
                                                <span className="text-white/70 text-sm font-medium">
                                                    {skillCountPerCategory} skill{skillCountPerCategory !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                                {visibleSkillsPerCategory.map((skill: any) => (
                                                    <div key={ skill._id} className="bg-white/10 rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 group relative hover:scale-105">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <h4 className="text-base font-semibold text-white truncate">{skill.name}</h4>
                                                            <div className="flex items-center gap-2">
                                                                {isAuthenticated && (
                                                                    <div className="flex gap-1">
                                                                        <button
                                                                            className="p-2 text-white/60 hover:text-white/90 hover:bg-white/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                                            title="Edit skill"
                                                                            onClick={() => {
                                                                                setSelectedSkill(skill);
                                                                                setShowEditForm(true);
                                                                            }}
                                                                        >
                                                                            <Edit2 size={14} />
                                                                        </button>
                                                                        <button
                                                                            className="p-2 text-white/60 hover:text-white/90 hover:bg-white/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                                            title="Delete skill"
                                                                            onClick={() => {
                                                                                setSelectedSkill(skill);
                                                                                setShowDeleteConfirmationModal(true);
                                                                            }}
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                                <span className="text-sm text-white/80 font-medium">{skill.proficiency}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="w-full bg-white/30 rounded-full h-2">
                                                            <div 
                                                                className="bg-white h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${skill.proficiency}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-6 text-center">
                                                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                                                    {skillCountPerCategory > visibleSkillsCountPerCategory && (
                                                        <button
                                                            className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-colors border border-white/30"
                                                            onClick={() => handleShowMoreSkills(category, skillCountPerCategory)}
                                                        >
                                                            Show More ({skillCountPerCategory - visibleSkillsCountPerCategory} remaining)
                                                        </button>
                                                    )}

                                                    {visibleSkillsCountPerCategory > MAX_SKILLS_PER_CATEGORY && (
                                                        <button
                                                            className="px-6 py-2 bg-white/10 backdrop-blur-sm text-white/80 rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/20"
                                                            onClick={() => handleHideSkills(category, skillCountPerCategory)}
                                                        >
                                                            Hide ({visibleSkillsCountPerCategory - MAX_SKILLS_PER_CATEGORY} remaining)
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>
            </div>
        </section>
    );
};

export default SkillsSection;