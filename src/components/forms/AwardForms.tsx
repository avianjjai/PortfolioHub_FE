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
        <div className="w-full max-w-6xl mx-auto">
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-600 rounded-xl mb-3 shadow-md shadow-purple-500/20">
                    <AwardIcon className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
                    {isAdd ? 'Add Award' : 'Edit Award'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Basic Information Section */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-purple-500 to-orange-600 rounded-lg">
                            <AwardIcon className="w-3.5 h-3.5 text-white" />
                        </div>
                        Award Information
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <AwardIcon className="w-4 h-4 text-purple-600" />
                                    Award Name
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={award.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Employee of the Year"
                                    className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Building2 className="w-4 h-4 text-orange-600" />
                                    Issuing Organization
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="issuer"
                                    value={award.issuer}
                                    onChange={handleChange}
                                    placeholder="e.g., Tech Innovation Awards"
                                    className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <FileText className="w-4 h-4 text-blue-600" />
                                Description
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={award.description}
                                onChange={(e) => setAward(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400 resize-y min-h-[100px]"
                                rows={4}
                                placeholder="Describe the award, criteria, and its significance..."
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Date & Category Section */}
                <div className="bg-gradient-to-br from-purple-50/50 to-white rounded-xl p-4 border border-purple-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                            <Calendar className="w-3.5 h-3.5 text-white" />
                        </div>
                        Date & Category
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Calendar className="w-4 h-4 text-indigo-600" />
                                Award Date
                                <span className="text-red-500">*</span>
                            </label>
                            <MonthYearPicker
                                label=""
                                value={award.issue_date}
                                onChange={handleDateSelect}
                                placeholder="Select award date"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Star className="w-4 h-4 text-yellow-600" />
                                Category
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={award.category}
                                onChange={(e) => setAward(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300"
                                required
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
                        className="flex-1 bg-gradient-to-r from-purple-500 via-pink-600 to-orange-600 text-white py-3 px-6 rounded-lg font-bold text-sm hover:from-purple-600 hover:via-pink-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg hover:shadow-purple-500/30 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>{isAdd ? 'Adding Award...' : 'Updating Award...'}</span>
                            </>
                        ) : (
                            <>
                                <AwardIcon className="w-4 h-4" />
                                <span>{isAdd ? 'Add Award' : 'Update Award'}</span>
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

export { AwardAddEditForm };