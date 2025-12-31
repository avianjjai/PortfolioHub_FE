import { useEffect, useState } from "react";
import { Education } from "../../services/modal";
import { converEpochToDate, convertDateToEpoch } from "../../utils/utility";
import { usePortfolio } from "../../context/PortfolioContext";
import { Calendar, GraduationCap, FileText, Trash2, X } from "lucide-react";
import MonthYearPicker from "./MonthYearPicker";
import { addEducation, deleteEducation, deleteProject, updateEducation } from "../../services/api";

interface EducationAddEditFormProps {
    isAdd: boolean;
    selectedEducation?: Education | null;
    setShowForm: (show: boolean) => void;
}

const EducationAddEditForm: React.FC<EducationAddEditFormProps> = ({ isAdd, selectedEducation, setShowForm }) => {
    const [education, setEducation] = useState({
        institution: selectedEducation?.institution ?? '',
        degree: selectedEducation?.degree ?? '',
        start_date: '',
        end_date: '',
        description: selectedEducation?.description ?? '',
    });

    useEffect(() => {
        const initializeDates = async () => {
            if (selectedEducation?.start_date) {
                const startDate = await converEpochToDate(selectedEducation.start_date);
                setEducation(prev => ({ ...prev, start_date: startDate ?? '' }));
            }
            if (selectedEducation?.end_date) {
                const endDate = await converEpochToDate(selectedEducation.end_date);
                setEducation(prev => ({ ...prev, end_date: endDate ?? '' }));
            }
        };
        initializeDates();
    }, [selectedEducation]);

    const [loading, setLoading] = useState(false);
    const [isSubmitActive, setIsSubmitActive] = useState(false);
    const [error, setError] = useState('');
    const { setIsEducationLoading } = usePortfolio();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEducation(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    useEffect(() => {
        const setIsSubmitActiveFunction = async () => {
            if (
                (isAdd && education.institution && education.degree && education.start_date) ||
                (!isAdd && (education.institution !== selectedEducation?.institution || education.degree !== selectedEducation?.degree || education.start_date !== await converEpochToDate(selectedEducation.start_date) || education.end_date !== await converEpochToDate(selectedEducation.end_date) || education.description !== selectedEducation?.description))
            ) {
                setIsSubmitActive(true);
            } else {
                setIsSubmitActive(false);
            }
        }
        setIsSubmitActiveFunction();
    }, [education.institution, education.degree, education.start_date, education.end_date, education.description]);

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            setLoading(true);
            e.preventDefault();

            const startDateEpoch = await convertDateToEpoch(education.start_date ?? '');
            const endDateEpoch = await convertDateToEpoch(education.end_date ?? '');

            const educationData = {
                ...education,
                start_date: startDateEpoch,
                end_date: endDateEpoch,
            };

            const response = isAdd ? await addEducation(educationData) : await updateEducation(selectedEducation?._id ?? '', educationData);
            if (response.status_code === 400) {
                throw new Error(response.message ?? 'Failed to' + (isAdd ? 'add' : 'update') + ' education');
            }

            setShowForm(false);
            setIsEducationLoading(true);
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
                    <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                    {isAdd ? 'Add Education' : 'Edit Education'}
                </h2>
            </div>

            <form 
                className="space-y-5"
                onSubmit={handleSubmit}
            >
                {/* Basic Information Section */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-orange-500 to-purple-600 rounded-lg">
                            <GraduationCap className="w-3.5 h-3.5 text-white" />
                        </div>
                        Academic Information
                    </h3>
                    
                    <div className="space-y-4">
                        {/* Institution */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <GraduationCap className="w-4 h-4 text-orange-600" />
                                Institution
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="institution"
                                placeholder="e.g., University of California, Los Angeles"
                                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400"
                                value={education.institution}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Degree */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <GraduationCap className="w-4 h-4 text-purple-600" />
                                Degree
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="degree"
                                placeholder="e.g., Bachelor of Science in Computer Science"
                                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400"
                                value={education.degree}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <FileText className="w-4 h-4 text-blue-600" />
                                Description
                            </label>
                            <textarea
                                value={education.description}
                                onChange={(e) => setEducation({ ...education, description: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400 resize-y min-h-[100px]"
                                rows={4}
                                placeholder="Describe your academic achievements, specializations, and notable projects..."
                            />
                        </div>
                    </div>
                </div>

                {/* Timeline Section */}
                <div className="bg-gradient-to-br from-indigo-50/50 to-white rounded-xl p-4 border border-indigo-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                            <Calendar className="w-3.5 h-3.5 text-white" />
                        </div>
                        Academic Timeline
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Calendar className="w-4 h-4 text-indigo-600" />
                                Start Date
                                <span className="text-red-500">*</span>
                            </label>
                            <MonthYearPicker
                                label="Start Date"
                                value={education.start_date}
                                onChange={(value) => setEducation({ ...education, start_date: value })}
                                placeholder="Select start date"
                                startDate={education.end_date}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Calendar className="w-4 h-4 text-indigo-600" />
                                End Date
                                <span className="text-xs font-normal text-gray-500 ml-1">(Optional)</span>
                            </label>
                            <MonthYearPicker
                                label="End Date (Optional)"
                                value={education.end_date}
                                onChange={(value) => setEducation({ ...education, end_date: value })}
                                placeholder="Select end date"
                                startDate={education.start_date}
                                disabled={!education.start_date}
                            />
                        </div>
                    </div>
                </div>  

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2 text-red-700">
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-semibold">{error}</span>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={!isSubmitActive || loading}
                        className="flex-1 bg-gradient-to-r from-orange-500 via-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-bold text-sm hover:from-orange-600 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg hover:shadow-purple-500/30 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>{isAdd ? 'Adding Education...' : 'Updating Education...'}</span>
                            </>
                        ) : (
                            <>
                                <GraduationCap className="w-4 h-4" />
                                <span>{isAdd ? 'Add Education' : 'Update Education'}</span>
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
    );
};

export { EducationAddEditForm };