import { useEffect, useState } from "react";
import { Experience } from "../../services/modal";
import { converEpochToDate, convertDateToEpoch } from "../../utils/utility";
import { usePortfolio } from "../../context/PortfolioContext";
import { Briefcase, Building2, Calendar, Code, FileText, Trash2, X } from "lucide-react";
import MonthYearPicker from "./MonthYearPicker";
import { addExperience, deleteExperience, updateExperience } from "../../services/api";

interface ExperienceAddEditFormProps {
    isAdd: boolean;
    selectedExperience?: Experience | null;
    setShowForm: (show: boolean) => void;
}

interface DeleteConfirmationModalProps {
    experience: Experience | null;
    setShowDeleteConfirmationModal?: (show: boolean) => void;
}

const ExperienceAddEditForm: React.FC<ExperienceAddEditFormProps> = ({ isAdd, selectedExperience, setShowForm }) => {
    const [experience, setExperience] = useState({
        title: selectedExperience?.title ?? '',
        company: selectedExperience?.company ?? '',
        description: selectedExperience?.description ?? '',
        technologies: selectedExperience?.technologies ?? '',
        start_date: '',
        end_date: '',
    });

    useEffect(() => {
        const initializeDates = async () => {
            if (selectedExperience?.start_date) {
                const startDate = await converEpochToDate(selectedExperience.start_date);
                setExperience(prev => ({ ...prev, start_date: startDate ?? '' }));
            }
            if (selectedExperience?.end_date) {
                const endDate = await converEpochToDate(selectedExperience.end_date);
                setExperience(prev => ({ ...prev, end_date: endDate ?? '' }));
            }
        }
        initializeDates();
    }, [selectedExperience]);

    const [loading, setLoading] = useState(false);
    const [isSubmitActive, setIsSubmitActive] = useState(false);
    const [error, setError] = useState('');
    const { setIsExperienceLoading } = usePortfolio();

    useEffect(() => {
        const setIsSubmitActiveFunction = async () => {
            if (
                (isAdd && experience.title && experience.company && experience.description && experience.technologies && experience.start_date) ||
                (!isAdd && (experience.title !== selectedExperience?.title || experience.company !== selectedExperience?.company || experience.description !== selectedExperience?.description || experience.technologies !== selectedExperience?.technologies || experience.start_date !== await converEpochToDate(selectedExperience.start_date) || experience.end_date !== await converEpochToDate(selectedExperience.end_date)))
            ) {
                setIsSubmitActive(true);
            } else {
                setIsSubmitActive(false);
            }
        }
        setIsSubmitActiveFunction();
    }, [experience.title, experience.company, experience.description, experience.technologies, experience.start_date, experience.end_date]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setExperience(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            setLoading(true);
            e.preventDefault();


            const startDateEpoch = await convertDateToEpoch(experience.start_date ?? '');
            const endDateEpoch = await convertDateToEpoch(experience.end_date ?? '');

            const experienceData = {
                ...experience,
                technologies: experience.technologies.toString().split(',').map((t: string) => t.trim()).filter(Boolean),
                start_date: startDateEpoch,
                end_date: endDateEpoch,
            };

            const response = isAdd ? await addExperience(experienceData) : await updateExperience(selectedExperience?._id ?? '', experienceData);
            if (response.status_code === 400) {
                throw new Error(response.message ?? 'Failed to add experience');
            }

            setShowForm(false);
            setIsExperienceLoading(true);
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
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full mb-4">
                    <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {isAdd ? 'Add Experience' : 'Edit Experience'}
                </h2>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Job Title */}
                <div className="space-y-2">
                    <label 
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                    >
                        <Briefcase className="w-4 h-4 text-blue-600" />
                        Job Title
                    </label>
                    <input
                        type="text"
                        name="title"
                        placeholder="e.g., Senior Software Engineer"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                        value={experience.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Company */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Building2 className="w-4 h-4 text-green-600" />
                        Company
                    </label>
                    <input
                        type="text"
                        name="company"
                        placeholder="e.g., Google, Microsoft, Apple"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                        value={experience.company}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FileText className="w-4 h-4 text-yellow-600" />
                        Description
                    </label>
                    <textarea
                        name="description"
                        placeholder="e.g., I worked on the project..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                        value={experience.description}
                        onChange={handleChange}
                        required
                        rows={4}
                    />
                </div>

                {/* Technologies */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Code className="w-4 h-4 text-red-600" />
                        Technologies
                    </label>
                    <input
                        type="text"
                        name="technologies"
                        placeholder="e.g., React, Node.js, Python, AWS (comma separated)"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                        value={experience.technologies}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Calendar className="w-4 h-4 text-indigo-600" />
                            Start Date
                        </label>
                        <MonthYearPicker
                            placeholder="Start Date"
                            label="Start Date"
                            value={experience.start_date}
                            onChange={(value) => setExperience({ ...experience, start_date: value })}
                            startDate={experience.end_date}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Calendar className="w-4 h-4 text-indigo-600" />
                            End Date
                            <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                        </label>
                        <MonthYearPicker
                            placeholder="End Date"
                            label="End Date"
                            value={experience.end_date}
                            onChange={(value) => setExperience({ ...experience, end_date: value })}
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
                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={!isSubmitActive}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                {isAdd ? 'Adding Experience...' : 'Updating Experience...'}
                            </div>
                            ) : (
                                isAdd ? 'Add Experience' : 'Update Experience'
                            )}
                    </button>
                    <button
                        type="button"
                        className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 border border-gray-200"
                        onClick={() => setShowForm(false)}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ experience, setShowDeleteConfirmationModal }) => {
    const [loading, setLoading] = useState(false);
    const { setIsExperienceLoading } = usePortfolio();
    const [error, setError] = useState('');

    const handleDeleteExperience = async () => {
        try {
            setLoading(true);
            const deletedExperience = await deleteExperience(experience?._id ?? '');
            if (deletedExperience.status_code === 400) {
                throw new Error(deletedExperience.message ?? 'Failed to delete experience');
            }
            setShowDeleteConfirmationModal?.(false);
            setIsExperienceLoading(true);
        }
        catch (error: any) {
            setError(error.message ?? '');
        }
        finally {
            setLoading(false);
        }
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-auto p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl relative w-full max-w-md border border-white/20">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                            <Trash2 className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Delete Experience</h3>
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
                    <p className="text-gray-700">
                        Are you sure you want to delete this experience?
                        <span className="font-semibold text-gray-900"> "{experience?.title}"</span>
                        ?
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        This action cannot be undone.
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <div className="flex items-center gap-2 text-red-700">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        </div>
                    )}

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
                            onClick={handleDeleteExperience}
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

export { ExperienceAddEditForm, DeleteConfirmationModal };