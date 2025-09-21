import React, { useEffect, useState } from 'react'
import { Certification } from '../../services/modal';
import { converEpochToDate, convertDateToEpoch } from '../../utils/utility';
import { usePortfolio } from '../../context/PortfolioContext';
import { addCertification, deleteCertification, updateCertification } from '../../services/api';
import { Building2, Calendar, FileText, Link, Trash2, X } from 'lucide-react';
import MonthYearPicker from './MonthYearPicker';


interface CertificateFormProps {
    isAdd: boolean;
    selectedCertificate?: Certification | null;
    setShowForm: (show: boolean) => void;
}

interface DeleteConfirmationModalProps {
    certificate: Certification | null;
    setShowDeleteConfirmationModal?: (show: boolean) => void;
}

const CertificateAddEditForm: React.FC<CertificateFormProps> = ({ isAdd, selectedCertificate, setShowForm }) => {
    const [certificate, setCertificate] = useState({
        name: selectedCertificate?.name ?? '',
        issuer: selectedCertificate?.issuer ?? '',
        issue_date: selectedCertificate?.issue_date ?? '',
        description: selectedCertificate?.description ?? '',
        credential_id: selectedCertificate?.credential_id ?? '',
        credential_url: selectedCertificate?.credential_url ?? '',
    });


    useEffect(() => {
        const initializeDates = async () => {
            if (selectedCertificate?.issue_date) {
                const issueDate = await converEpochToDate(selectedCertificate.issue_date);
                setCertificate(prev => ({ ...prev, issue_date: issueDate ?? '' }));
            }
        };
        initializeDates();
    }, [selectedCertificate]);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitActive, setIsSubmitActive] = useState(false);
    const { setIsCertificationLoading } = usePortfolio();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCertificate(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDateSelect = (date: string) => {
        setCertificate(prev => ({ ...prev, issue_date: date }));
    };

    useEffect(() => {
        const setIsSubmitActiveFunction = async () => {
            if (
                (isAdd && certificate.name && certificate.issuer && certificate.issue_date && certificate.description && certificate.credential_id && certificate.credential_url) ||
                (!isAdd && (certificate.name !== selectedCertificate?.name || certificate.issuer !== selectedCertificate?.issuer || certificate.issue_date !== await converEpochToDate(selectedCertificate.issue_date) || certificate.description !== selectedCertificate?.description || certificate.credential_id !== selectedCertificate?.credential_id || certificate.credential_url !== selectedCertificate?.credential_url))
            ) {
                setIsSubmitActive(true);
            } else {
                setIsSubmitActive(false);
            }
        };
        setIsSubmitActiveFunction();
    }, [certificate.name, certificate.issuer, certificate.issue_date, certificate.description, certificate.credential_id, certificate.credential_url]);
    
    
    const handleSubmit = async (e: React.FormEvent) => {
        try {
            setLoading(true);
            e.preventDefault();

            const issueDateEpoch = await convertDateToEpoch(certificate.issue_date ?? '');
            const certificateData = {
                ...certificate,
                issue_date: issueDateEpoch,
            };
            
            const response = isAdd ? await addCertification(certificateData) : await updateCertification(selectedCertificate?._id ?? '', certificateData);
            if (response.status_code === 400) {
                throw new Error(response.message ?? 'Failed to add certification');
            }
            setShowForm(false);
            setIsCertificationLoading(true);
        } catch (error: any) {
            setError(error.message ?? '');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full mb-4">
                    <FileText className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{isAdd ? 'Add New Certification' : 'Edit Certification'}</h2>
                <p className="text-gray-600">Showcase your professional credentials</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText className="w-4 h-4 inline mr-2" />
                            Certification Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={certificate.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Building2 className="w-4 h-4 inline mr-2" />
                            Issuing Organization
                        </label>
                        <input
                            type="text"
                            name="issuer"
                            value={certificate.issuer}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={certificate.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Issue Date
                        </label>
                        <MonthYearPicker
                            label=""
                            value={certificate.issue_date}
                            onChange={handleDateSelect}
                            placeholder="Select issue date"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText className="w-4 h-4 inline mr-2" />
                            Credential ID
                        </label>
                        <input
                            type="text"
                            name="credential_id"
                            value={certificate.credential_id}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Link className="w-4 h-4 inline mr-2" />
                            Credential URL
                        </label>
                        <input
                            type="text"
                            name="credential_url"
                            value={certificate.credential_url}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                <div className="flex gap-4 pt-6">
                    <button
                        type="submit"
                        disabled={!isSubmitActive}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Adding...' : isAdd ? 'Add Certification' : 'Update Certification'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ certificate, setShowDeleteConfirmationModal }) => {
    const [loading, setLoading] = useState(false);
    const { setIsCertificationLoading } = usePortfolio();
    const [error, setError] = useState('');

    const handleDeleteCertification = async () => {
        try {
            setLoading(true);
            const deletedCertification = await deleteCertification(certificate?._id ?? '');
            if (deletedCertification.status_code === 400) {
                throw new Error(deletedCertification.message ?? 'Failed to delete certification');
            }
            setShowDeleteConfirmationModal?.(false);
            setIsCertificationLoading(true);
        } catch (error: any) {
            setError(error.message ?? '');
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-auto p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl relative w-full max-w-md border border-white/20">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                            <Trash2 size={16} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Delete Certification</h3>
                    </div>
                    <button
                        onClick={() => setShowDeleteConfirmationModal?.(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-700 mb-4">
                        Are you sure you want to delete this certification?
                        <span className="font-semibold text-gray-900"> "{certificate?.name}"</span>
                        ?
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        This action cannot be undone.
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowDeleteConfirmationModal?.(false)}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteCertification}
                            className="flex-1 px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { CertificateAddEditForm, DeleteConfirmationModal };