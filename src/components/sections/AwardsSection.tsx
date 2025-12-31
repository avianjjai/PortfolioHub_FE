import { Edit2, Trash2, Trophy } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePortfolio } from "../../context/PortfolioContext";
import { ModalOverlay } from "../forms/ModalOverlay";
import { AwardAddEditForm } from "../forms/AwardForms";
import DeleteConfirmationModal from "../forms/DeleteConfirmationModal";
import { useState } from "react";
import { Award } from "../../services/modal";

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const AwardsSection = () => {
    const { isAuthenticated } = useAuth();
    const { awards } = usePortfolio();
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
    const [selectedAward, setSelectedAward] = useState<Award | null>(null);
    
    return (
        <section id='awards' className='gradient-purple-pink py-20'>
            
            {showAddForm && (
                <ModalOverlay onClose={() => setShowAddForm(false)}>
                    <AwardAddEditForm isAdd={true} setShowForm={setShowAddForm} selectedAward={null} />
                </ModalOverlay>
            )}
            
            {showEditForm && (
                <ModalOverlay onClose={() => setShowEditForm(false)}>
                    <AwardAddEditForm isAdd={false} setShowForm={setShowEditForm} selectedAward={selectedAward} />
                </ModalOverlay>
            )}
            

            {showDeleteConfirmationModal && (
                <ModalOverlay onClose={() => setShowDeleteConfirmationModal(false)}>
                    <DeleteConfirmationModal
                        setShowDeleteModal={setShowDeleteConfirmationModal}
                        data={selectedAward}
                        dataType="award"
                        setSelectedData={setSelectedAward}
                    />
                </ModalOverlay>
            )}

            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-white mb-12 text-center">Awards & Recognition</h2>
                <div className="w-full text-center">
                    {isAuthenticated && awards.length > 0 && (
                        <button 
                            className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-colors mb-4 border border-white/30"
                            onClick={() => setShowAddForm(true)}
                        >
                            Add Award
                        </button>
                    )}

                    {awards.length === 0 ? (
                        <div className="bg-white/20 rounded-3xl p-10 backdrop-blur-sm border border-white/30 text-center max-w-3xl mx-auto relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-50"></div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-white/30 to-white/10 rounded-full mb-6 shadow-lg border-2 border-white/40">
                                    <Trophy className="w-12 h-12 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">No Awards Added Yet</h3>
                                <p className="text-white/90 text-base mb-6 leading-relaxed max-w-xl mx-auto">
                                    {isAuthenticated 
                                        ? "Celebrate your achievements! Add your awards and recognitions to showcase your outstanding accomplishments."
                                        : "Awards will be displayed here once they are added to the portfolio."
                                    }
                                </p>
                                {isAuthenticated && (
                                    <button
                                        className="px-8 py-3 bg-gradient-to-r from-white/30 to-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:from-white/40 hover:to-white/30 transition-all duration-300 border border-white/40 shadow-lg hover:shadow-xl hover:scale-105 text-base"
                                        onClick={() => setShowAddForm(true)}
                                    >
                                        Add Your First Award
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="w-full space-y-8">
                            {awards.map((award) => (
                            <div 
                                key={award._id} 
                                className="bg-white/20 rounded-2xl p-8 backdrop-blur-sm border border-white/30 relative group"
                            >
                                {isAuthenticated && (
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button 
                                            className="p-2 text-white/60 hover:text-white/90 hover:bg-white/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                            aria-label="Edit award"
                                            onClick={() => {
                                                setSelectedAward(award);
                                                setShowEditForm(true);
                                            }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            className="p-2 text-white/60 hover:text-white/90 hover:bg-white/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                            aria-label="Delete award"
                                            onClick={() => {
                                                setSelectedAward(award);
                                                setShowDeleteConfirmationModal(true);
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}

                                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">{award.name}</h3>
                                        <p className="text-xl text-white/90 mb-2">{award.issuer}</p>
                                    </div>
                                    <span className="text-lg text-white/80 bg-white/20 px-4 py-2 rounded-full border border-white/30">
                                        {formatDate(award.issue_date)}
                                    </span>
                                </div>

                                {award.description && (
                                    <p className="text-white/90 mb-4 text-left">
                                        {award.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-white/30 text-white rounded-full text-sm font-medium border border-white/30">
                                        {award.category}
                                    </span>
                                </div>
                            </div>
                        ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export default AwardsSection;