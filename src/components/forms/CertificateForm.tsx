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
        <div className="w-full max-w-6xl mx-auto">
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 via-purple-500 to-pink-600 rounded-xl mb-3 shadow-md shadow-purple-500/20">
                    <FileText className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                    {isAdd ? 'Add New Certification' : 'Edit Certification'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Basic Information Section */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-orange-500 to-purple-600 rounded-lg">
                            <FileText className="w-3.5 h-3.5 text-white" />
                        </div>
                        Certification Details
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <FileText className="w-4 h-4 text-orange-600" />
                                    Certification Name
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={certificate.name}
                                    onChange={handleChange}
                                    placeholder="e.g., AWS Certified Solutions Architect"
                                    className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Building2 className="w-4 h-4 text-purple-600" />
                                    Issuing Organization
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="issuer"
                                    value={certificate.issuer}
                                    onChange={handleChange}
                                    placeholder="e.g., Amazon Web Services"
                                    className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <FileText className="w-4 h-4 text-blue-600" />
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={certificate.description}
                                onChange={handleChange}
                                placeholder="Describe the certification, skills validated, and its significance..."
                                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400 resize-y min-h-[100px]"
                                rows={4}
                            />
                        </div>
                    </div>
                </div>

                {/* Date & Credentials Section */}
                <div className="bg-gradient-to-br from-emerald-50/50 to-white rounded-xl p-4 border border-emerald-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                            <Calendar className="w-3.5 h-3.5 text-white" />
                        </div>
                        Issue Date & Credentials
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Calendar className="w-4 h-4 text-indigo-600" />
                                Issue Date
                                <span className="text-red-500">*</span>
                            </label>
                            <MonthYearPicker
                                label=""
                                value={certificate.issue_date}
                                onChange={handleDateSelect}
                                placeholder="Select issue date"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <FileText className="w-4 h-4 text-green-600" />
                                Credential ID
                                <span className="text-xs font-normal text-gray-500 ml-1">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                name="credential_id"
                                value={certificate.credential_id}
                                onChange={handleChange}
                                placeholder="e.g., 12345678"
                                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400"
                            />
                        </div>
                    </div>

                    <div className="mt-4 space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Link className="w-4 h-4 text-teal-600" />
                            Credential URL
                            <span className="text-xs font-normal text-gray-500 ml-1">(Optional)</span>
                        </label>
                        <input
                            type="url"
                            name="credential_url"
                            value={certificate.credential_url}
                            onChange={handleChange}
                            placeholder="https://credly.com/badges/..."
                            className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2 text-red-700">
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-semibold">{error}</span>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={!isSubmitActive || loading}
                        className="flex-1 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-bold text-sm hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg hover:shadow-purple-500/30 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>{isAdd ? 'Adding Certification...' : 'Updating Certification...'}</span>
                            </>
                        ) : (
                            <>
                                <FileText className="w-4 h-4" />
                                <span>{isAdd ? 'Add Certification' : 'Update Certification'}</span>
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="flex-1 bg-white text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 border-2 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export { CertificateAddEditForm };