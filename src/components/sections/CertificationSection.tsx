import { useEffect, useState } from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { useAuth } from "../../context/AuthContext";
import { Edit2, Eye, Trash2 } from "lucide-react";
import { Certification } from "../../services/modal";
import { ModalOverlay } from "../forms/ModalOverlay";
import { CertificateAddEditForm, DeleteConfirmationModal } from "../forms/CertificateForm";

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate().toString().padStart(2, '0');
    return `${day} ${month} ${year}`;
};

const CertificationSection = () => {
    const { isAuthenticated } = useAuth();
    const { certifications } = usePortfolio();
    const [selectedCertificate, setSelectedCertificate] = useState<Certification | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);

    return (
        <section id="certifications" className="bg-blue-500 py-20">
            {showAddForm && (
                <ModalOverlay onClose={() => setShowAddForm(false)}>
                    <CertificateAddEditForm 
                        isAdd={true} 
                        setShowForm={setShowAddForm}
                        selectedCertificate={null}
                    />
                </ModalOverlay>
            )}

            {showEditForm && (
                <ModalOverlay onClose={() => setShowEditForm(false)}>
                    <CertificateAddEditForm 
                        isAdd={false} 
                        setShowForm={setShowEditForm} 
                        selectedCertificate={selectedCertificate} 
                    />
                </ModalOverlay>
            )}

            {showDeleteConfirmationModal && (
                <ModalOverlay onClose={() => setShowDeleteConfirmationModal(false)}>
                    <DeleteConfirmationModal 
                        certificate={selectedCertificate} 
                        setShowDeleteConfirmationModal={setShowDeleteConfirmationModal} 
                    />
                </ModalOverlay>
            )}

            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-white mb-12 text-center">Certifications</h2>
                <div className="w-full">
                    {isAuthenticated && (
                        <div className="mb-8 text-center">
                            <button 
                                className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-colors mb-4 border border-white/30"
                                onClick={() => setShowAddForm(true)}
                            >
                                Add Certification
                            </button>
                        </div>
                    )}

                    <div className="w-full space-y-8">
                        {certifications.map((certification) => (
                            <div 
                                key={certification._id}
                                className="bg-white/20 rounded-2xl p-8 backdrop-blur-sm border border-white/30 relative group"
                            >
                                {isAuthenticated && (
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button 
                                            className="p-2 text-white/60 hover:text-white/90 hover:bg-white/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                            onClick={() => {
                                                setSelectedCertificate(certification);
                                                setShowEditForm(true);
                                            }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            className="p-2 text-white/60 hover:text-white/90 hover:bg-white/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                            onClick={() => {
                                                setSelectedCertificate(certification);
                                                setShowDeleteConfirmationModal(true);
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}

                                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">{certification.name}</h3>
                                        <p className="text-xl text-white/90 mb-2">{certification.issuer}</p>
                                    </div>
                                    <span className="text-lg text-white/80 bg-white/20 px-4 py-2 rounded-full border border-white/30">
                                        {formatDate(certification.issue_date)}
                                    </span>
                                </div>

                                {certification.description && (
                                    <p className="text-white/90 mb-4 leading-relaxed">
                                        {certification.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    {certification.credential_id && (
                                        <span className="px-3 py-1 bg-white/30 text-white rounded-full text-sm font-medium border border-white/30">
                                            ID: {certification.credential_id}
                                        </span>
                                    )}

                                    {certification.credential_url && (
                                        <a 
                                            href={certification.credential_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="px-3 py-1 bg-white/30 text-white rounded-full text-sm font-medium border border-white/30 hover:bg-white/50 transition-colors flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View Credential
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CertificationSection;