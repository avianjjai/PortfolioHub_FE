import { useEffect, useState } from "react";
import { Education } from "../../services/modal";
import { converEpochToDate, convertDateToEpoch } from "../../utils/utility";
import { usePortfolio } from "../../context/PortfolioContext";
import { Calendar, GraduationCap, Trash2, X } from "lucide-react";
import MonthYearPicker from "./MonthYearPicker";
import { addEducation, deleteEducation, deleteProject, updateEducation } from "../../services/api";

interface EducationAddEditFormProps {
    isAdd: boolean;
    selectedEducation?: Education | null;
    setShowForm: (show: boolean) => void;
}

interface DeleteConfirmationModalProps {
    education: Education | null;
    setShowDeleteConfirmationModal?: (show: boolean) => void;
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
        <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full mb-4">
                    <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {isAdd ? 'Add Education' : 'Edit Education'}
                </h2>
            </div>

            <form 
                className="space-y-6"
                onSubmit={handleSubmit}
            >
                {/* Institution */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <GraduationCap className="w-4 h-4 text-orange-600" />
                        Institution
                    </label>
                    <input
                        type="text"
                        name="institution"
                        placeholder="e.g., University of California, Los Angeles"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                        value={education.institution}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Degree */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <GraduationCap className="w-4 h-4 text-orange-600" />
                        Degree
                    </label>
                    <input
                        type="text"
                        name="degree"
                        placeholder="e.g., Bachelor of Science in Computer Science"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                        value={education.degree}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        Description
                    </label>
                    <textarea
                        value={education.description}
                        onChange={(e) => setEducation({ ...education, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400 resize-none"
                        rows={4}
                        placeholder="Describe your academic achievements, specializations, and notable projects..."
                        required
                    />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Calendar className="w-4 h-4 text-orange-600" />
                            Start Date
                        </label>
                        <MonthYearPicker
                            label="Start Date"
                            value={education.start_date}
                            onChange={(value) => setEducation({ ...education, start_date: value })}
                            placeholder="Select start date"
                            startDate={education.end_date}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Calendar className="w-4 h-4 text-orange-600" />
                            End Date (Optional)
                        </label>
                        <MonthYearPicker
                            label="End Date (Optional)"
                            value={education.end_date}
                            onChange={(value) => setEducation({ ...education, end_date: value })}
                            placeholder="Select end date"
                            startDate={education.start_date}
                        />
                    </div>
                </div>  

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center gap-2 text-red-700">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                    <button
                        type="submit"
                        disabled={!isSubmitActive}
                        className="flex-1 bg-gradient-to-r from-orange-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                {isAdd ? 'Adding Education...' : 'Updating Education...'}
                            </div>
                        ) : (
                            isAdd ? 'Add Education' : 'Update Education'
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 border border-gray-200"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ education, setShowDeleteConfirmationModal }) => {
    const [loading, setLoading] = useState(false);
    const { setIsEducationLoading } = usePortfolio();
    const [error, setError] = useState('');

    const handleDeleteEducation = async () => {
        try {
            setLoading(true);
            const deletedEducation = await deleteEducation(education?._id ?? '');
            if (deletedEducation.status_code === 400) {
                throw new Error(deletedEducation.message ?? 'Failed to delete education');
            }
            setShowDeleteConfirmationModal?.(false);
            setIsEducationLoading(true);
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
                        <h3 className="text-xl font-bold text-gray-900">Delete Education</h3>
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
                        Are you sure you want to delete this education?
                        <span className="font-semibold text-gray-900"> "{education?.degree}"</span>
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
                            onClick={handleDeleteEducation}
                            className="flex-1 px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Deleting Education...
                                </div>
                            ) : (
                                'Delete Education'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};  

export { EducationAddEditForm, DeleteConfirmationModal };