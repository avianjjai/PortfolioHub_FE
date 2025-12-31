import { useEffect, useState } from 'react';
import { Project } from '../../services/modal';
import { usePortfolio } from '../../context/PortfolioContext';
import { FileText, FolderOpen, Code, Calendar, Globe, Github, Trash2, X } from 'lucide-react';
import MonthYearPicker from './MonthYearPicker';
import { addProject, deleteProject, updateProject } from '../../services/api';

// Helper function to format date to YYYY-MM-DD string
const formatDateString = (date: any): string => {
    if (!date) return '';
    if (typeof date === 'string') {
        // If it's already a string, try to parse and format it
        const d = new Date(date);
        if (!isNaN(d.getTime())) {
            return d.toISOString().split('T')[0];
        }
        // If it's already in YYYY-MM-DD format, return as-is
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
        }
    }
    // If it's a number (epoch), convert it
    if (typeof date === 'number') {
        return new Date(date).toISOString().split('T')[0];
    }
    return '';
};

interface ProjectAddEditFormProps {
    isAdd: boolean;
    selectedProject?: Project | null;
    setShowForm: (show: boolean) => void;
}



const ProjectAddEditForm: React.FC<ProjectAddEditFormProps> = ({ isAdd, selectedProject, setShowForm }) => {
    const [project, setProject] = useState({
        title: selectedProject?.title ?? '',
        description: selectedProject?.description ?? '',
        technologies: selectedProject?.technologies ?? '',
        start_date: '',
        end_date: '',
        live_url: selectedProject?.live_url ?? '',
        code_url: selectedProject?.code_url ?? '',
        image_url: selectedProject?.image_url ?? '',
    });

    // Initialize dates from selectedProject (handle both date strings and epoch timestamps for backward compatibility)
    useEffect(() => {
        if (selectedProject?.start_date) {
            const startDate = formatDateString(selectedProject.start_date);
            setProject(prev => ({ ...prev, start_date: startDate }));
        }
        if (selectedProject?.end_date) {
            const endDate = formatDateString(selectedProject.end_date);
            setProject(prev => ({ ...prev, end_date: endDate }));
        }
    }, [selectedProject]);

    const [loading, setLoading] = useState(false);
    const [isSubmitActive, setIsSubmitActive] = useState(false);
    const [error, setError] = useState('');
    const { setIsProjectLoading } = usePortfolio();
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProject(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    useEffect(() => {
        const setIsSubmitActiveFunction = () => {
            const startDateFormatted = selectedProject?.start_date ? formatDateString(selectedProject.start_date) : '';
            const endDateFormatted = selectedProject?.end_date ? formatDateString(selectedProject.end_date) : '';
            
            if (
                (isAdd && project.title && project.description && project.technologies && project.start_date) ||
                (!isAdd && (project.title !== selectedProject?.title || 
                           project.description !== selectedProject?.description || 
                           project.technologies !== selectedProject?.technologies || 
                           project.start_date !== startDateFormatted || 
                           project.end_date !== endDateFormatted || 
                           project.live_url !== selectedProject?.live_url || 
                           project.code_url !== selectedProject?.code_url || 
                           project.image_url !== selectedProject?.image_url))
            ) {
                setIsSubmitActive(true);
            } else {
                setIsSubmitActive(false);
            }
        }
        setIsSubmitActiveFunction();
    }, [project.title, project.description, project.technologies, project.start_date, project.end_date, project.live_url, project.code_url, project.image_url, selectedProject, isAdd]);


    const handleSubmit = async (e: React.FormEvent) => {
        try {
            setLoading(true);
            e.preventDefault();
            
            const projectData = {
                ...project,
                technologies: project.technologies.toString().split(',').map((t: string) => t.trim()).filter(Boolean),
                start_date: project.start_date || undefined,
                end_date: project.end_date || undefined,
            };

            const response = isAdd ? await addProject(projectData) : await updateProject(selectedProject?._id ?? '', projectData);
            if (response.status_code === 400) {
                throw new Error(response.message ?? 'Failed to add project');
            }

            setShowForm(false);
            setIsProjectLoading(true);
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
                    <FolderOpen className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                    {isAdd ? 'Add Project' : 'Edit Project'}
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
                            <FolderOpen className="w-3.5 h-3.5 text-white" />
                        </div>
                        Basic Information
                    </h3>
                    
                    <div className="space-y-4">
                        {/* Project Title */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <FolderOpen className="w-4 h-4 text-orange-600" />
                                Project Title
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                placeholder="e.g., E-commerce Platform, Task Manager App"
                                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400"
                                value={project.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <FileText className="w-4 h-4 text-purple-600" />
                                Description
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                placeholder="Describe your project in detail - features, technologies used, challenges solved, etc."
                                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400 resize-y min-h-[100px]"
                                value={project.description}
                                onChange={handleChange}
                                required
                                rows={4}
                            />
                        </div>

                        {/* Technologies */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Code className="w-4 h-4 text-blue-600" />
                                Technologies & Skills
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="technologies"
                                placeholder="e.g., React, Node.js, MongoDB, AWS (comma separated)"
                                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400"
                                value={project.technologies}
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
                        Project Timeline
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Calendar className="w-4 h-4 text-indigo-600" />
                                Start Date
                                <span className="text-red-500">*</span>
                            </label>
                            <MonthYearPicker
                                label="Start Date"
                                value={project.start_date ?? ''}
                                onChange={(value: string) => setProject(prev => ({ ...prev, start_date: value }))}
                                placeholder="Select start date"
                                startDate={project.end_date ?? ''}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Calendar className="w-4 h-4 text-indigo-600" />
                                End Date
                                <span className="text-xs font-normal text-gray-500 ml-1">(Optional)</span>
                            </label>
                            <MonthYearPicker
                                label="End Date (Optional)"
                                value={project.end_date ?? ''}
                                onChange={(value: string) => setProject(prev => ({ ...prev, end_date: value }))}
                                placeholder="Select end date"
                                startDate={project.start_date ?? ''}
                                disabled={!project.start_date}
                            />
                        </div>
                    </div>
                </div>

                {/* Links & Resources Section */}
                <div className="bg-gradient-to-br from-emerald-50/50 to-white rounded-xl p-4 border border-emerald-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                            <Globe className="w-3.5 h-3.5 text-white" />
                        </div>
                        Links & Resources
                        <span className="text-xs font-normal text-gray-500 ml-2">(All Optional)</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Globe className="w-4 h-4 text-emerald-600" />
                                Live URL
                            </label>
                            <input
                                type="url"
                                name="live_url"
                                placeholder="https://your-project.com"
                                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400"
                                value={project.live_url}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Github className="w-4 h-4 text-gray-800" />
                                Code URL
                            </label>
                            <input
                                type="url"
                                name="code_url"
                                placeholder="https://github.com/username/repo"
                                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400"
                                value={project.code_url}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <FileText className="w-4 h-4 text-pink-600" />
                                Image URL
                            </label>
                            <input
                                type="url"
                                name="image_url"
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400"
                                value={project.image_url}
                                onChange={handleChange}
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
                        className="flex-1 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white py-3 px-6 rounded-lg font-bold text-sm hover:from-emerald-600 hover:via-teal-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>{isAdd ? 'Adding Project...' : 'Updating Project...'}</span>
                            </>
                        ) : (
                            <>
                                <FolderOpen className="w-4 h-4" />
                                <span>{isAdd ? 'Add Project' : 'Update Project'}</span>
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

export { ProjectAddEditForm };