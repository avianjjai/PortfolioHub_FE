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
        <div className="w-full max-w-6xl mx-auto">
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 via-purple-500 to-pink-600 rounded-xl mb-3 shadow-md shadow-purple-500/20">
                    <Briefcase className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                    {isAdd ? 'Add Experience' : 'Edit Experience'}
                </h2>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Basic Information Section */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                            <Briefcase className="w-3.5 h-3.5 text-white" />
                        </div>
                        Basic Information
                    </h3>
                    
                    <div className="space-y-4">
                        {/* Job Title */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Briefcase className="w-4 h-4 text-blue-600" />
                                Job Title
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                placeholder="e.g., Senior Software Engineer"
                                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400"
                                value={experience.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Company */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Building2 className="w-4 h-4 text-green-600" />
                                Company
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="company"
                                placeholder="e.g., Google, Microsoft, Apple"
                                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400"
                                value={experience.company}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <FileText className="w-4 h-4 text-yellow-600" />
                                Description
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                placeholder="Describe your role, responsibilities, and achievements..."
                                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400 resize-y min-h-[100px]"
                                value={experience.description}
                                onChange={handleChange}
                                required
                                rows={4}
                            />
                        </div>

                        {/* Technologies */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Code className="w-4 h-4 text-red-600" />
                                Technologies
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="technologies"
                                placeholder="e.g., React, Node.js, Python, AWS (comma separated)"
                                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400"
                                value={experience.technologies}
                                onChange={handleChange}
                                required
                            />
                            <p className="text-xs text-gray-500">Separate multiple technologies with commas</p>
                        </div>
                    </div>
                </div>

                {/* Timeline Section */}
                <div className="bg-gradient-to-br from-indigo-50/50 to-white rounded-xl p-4 border border-indigo-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                            <Calendar className="w-3.5 h-3.5 text-white" />
                        </div>
                        Employment Timeline
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Calendar className="w-4 h-4 text-indigo-600" />
                                Start Date
                                <span className="text-red-500">*</span>
                            </label>
                            <MonthYearPicker
                                placeholder="Start Date"
                                label="Start Date"
                                value={experience.start_date}
                                onChange={(value) => setExperience({ ...experience, start_date: value })}
                                startDate={experience.end_date}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Calendar className="w-4 h-4 text-indigo-600" />
                                End Date
                                <span className="text-xs font-normal text-gray-500 ml-1">(Optional)</span>
                            </label>
                            <MonthYearPicker
                                placeholder="End Date"
                                label="End Date"
                                value={experience.end_date}
                                onChange={(value) => setExperience({ ...experience, end_date: value })}
                                startDate={experience.start_date}
                                disabled={!experience.start_date}
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
                        className="flex-1 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-bold text-sm hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg hover:shadow-purple-500/30 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>{isAdd ? 'Adding Experience...' : 'Updating Experience...'}</span>
                            </>
                        ) : (
                            <>
                                <Briefcase className="w-4 h-4" />
                                <span>{isAdd ? 'Add Experience' : 'Update Experience'}</span>
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        className="flex-1 bg-white text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 border-2 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md"
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

export { ExperienceAddEditForm };