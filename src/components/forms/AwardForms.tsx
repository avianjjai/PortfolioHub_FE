import { useEffect, useState } from "react";
import { Award } from "../../services/modal";
import { converEpochToDate, convertDateToEpoch } from "../../utils/utility";
import { usePortfolio } from "../../context/PortfolioContext";
import { addAward, deleteAward, updateAward } from "../../services/api";
import { AwardIcon, Building2, Calendar, FileText, Star, Trash2 } from "lucide-react";
import MonthYearPicker from "./MonthYearPicker";
import { X } from "lucide-react";

interface AwardAddEditFormProps {
    isAdd: boolean;
    selectedAward?: Award | null;
    setShowForm: (show: boolean) => void;
}

interface DeleteConfirmationModalProps {
    award: Award | null;
    setShowDeleteConfirmationModal?: (show: boolean) => void;
}

const AwardAddEditForm: React.FC<AwardAddEditFormProps> = ({ isAdd, selectedAward, setShowForm }) => {
    const [award, setAward] = useState({
        name: selectedAward?.name ?? '',
        description: selectedAward?.description ?? '',
        issuer: selectedAward?.issuer ?? '',
        issue_date: selectedAward?.issue_date ?? '',
        category: selectedAward?.category ?? '',
    });

    useEffect(() => {
        const initializeDates = async () => {
            if (selectedAward?.issue_date) {
                const issueDate = await converEpochToDate(selectedAward.issue_date);
                setAward(prev => ({ ...prev, issue_date: issueDate ?? '' }));
            }
        };
        initializeDates();
    }, [selectedAward]);
    
    const [loading, setLoading] = useState(false);
    const [isSubmitActive, setIsSubmitActive] = useState(false);
    const [error, setError] = useState('');
    const { setIsAwardLoading } = usePortfolio();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setAward(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDateSelect = (date: string) => {
        setAward(prev => ({ ...prev, issue_date: date }));
    };

    useEffect(() => {
        const setIsSubmitActiveFunction = async () => {
            if (
                (isAdd && award.name && award.description && award.issuer && award.issue_date && award.category) ||
                (!isAdd && (award.name !== selectedAward?.name || award.description !== selectedAward?.description || award.issuer !== selectedAward?.issuer || award.issue_date !== await converEpochToDate(selectedAward.issue_date) || award.category !== selectedAward?.category))
            ) {
                setIsSubmitActive(true);
            } else {
                setIsSubmitActive(false);
            }
        };
        setIsSubmitActiveFunction();
    }, [award.name, award.description, award.issuer, award.issue_date, award.category]);

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            setLoading(true);
            e.preventDefault();

            const issueDateEpoch = await convertDateToEpoch(award.issue_date ?? '');
            const awardData = {
                ...award,
                issue_date: issueDateEpoch,
            };

            const response = isAdd ? await addAward(awardData) : await updateAward(selectedAward?._id ?? '', awardData);
            if (response.status_code === 400) {
                throw new Error(response.message ?? 'Failed to add award');
            }

            setShowForm(false);
            setIsAwardLoading(true);
        }
        catch (error: any) {
            setError(error.message ?? '');
        }
        finally {
            setLoading(false);
        }
    }
    
    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-orange-600 rounded-full mb-4">
                    <AwardIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {isAdd ? 'Add Award' : 'Edit Award'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <AwardIcon className="w-4 h-4 text-purple-600" />
                            Award Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={award.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Building2 className="w-4 h-4 text-purple-600" />
                            Issuing Organization
                        </label>
                        <input
                            type="text"
                            name="issuer"
                            value={award.issuer}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            Award Date
                        </label>
                        <MonthYearPicker
                            label=""
                            value={award.issue_date}
                            onChange={handleDateSelect}
                            placeholder="Select award date"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Star className="w-4 h-4 text-purple-600" />
                            Category
                        </label>
                        <select
                            value={award.category}
                            onChange={(e) => setAward(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">Select Category</option>
                            <option value="Excellence">Excellence</option>
                            <option value="Innovation">Innovation</option>
                            <option value="Leadership">Leadership</option>
                            <option value="Service">Service</option>
                            <option value="Achievement">Achievement</option>
                            <option value="Recognition">Recognition</option>
                            <option value="Competition">Competition</option>
                            <option value="Academic">Academic</option>
                            <option value="Professional">Professional</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FileText className="w-4 h-4 text-purple-600" />
                        Description
                    </label>
                    <textarea
                        value={award.description}
                        onChange={(e) => setAward(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={4}
                        placeholder="Describe the award, criteria, and its significance..."
                    />
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
                        className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isAdd ?  loading ? 'Adding...' : 'Add Award' : loading ? 'Updating...' : 'Update Award'}
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

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ award, setShowDeleteConfirmationModal }) => {
    const [loading, setLoading] = useState(false);
    const { setIsAwardLoading } = usePortfolio();
    const [error, setError] = useState('');

    const handleDeleteAward = async () => {
        try {
            setLoading(true);
            const deletedAward = await deleteAward(award?._id ?? '');
            if (deletedAward.status_code === 400) {
                throw new Error(deletedAward.message ?? 'Failed to delete award');
            }
            setShowDeleteConfirmationModal?.(false);
            setIsAwardLoading(true);
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
                        <h3 className="text-xl font-bold text-gray-900">Delete Award</h3>
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
                        Are you sure you want to delete this award?
                        <span className="font-semibold text-gray-900"> "{award?.name}"</span>
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
                            onClick={handleDeleteAward}
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

export { AwardAddEditForm, DeleteConfirmationModal };