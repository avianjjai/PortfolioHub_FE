import { useEffect, useState } from 'react';
import { Project } from '../../services/modal';
import { usePortfolio } from '../../context/PortfolioContext';
import { FileText, FolderOpen, Code, Calendar, Globe, Github, Trash2, X } from 'lucide-react';
import MonthYearPicker from './MonthYearPicker';
import { addProject, deleteProject, updateProject } from '../../services/api';
import { converEpochToDate, convertDateToEpoch } from '../../utils/utility';

interface ProjectAddEditFormProps {
    isAdd: boolean;
    selectedProject?: Project | null;
    setShowForm: (show: boolean) => void;
}

interface DeleteConfirmationModalProps {
    project: Project | null;
    setShowDeleteConfirmationModal?: (show: boolean) => void;
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

    // Convert epoch dates to ISO strings on component mount
    useEffect(() => {
        const initializeDates = async () => {
            if (selectedProject?.start_date) {
                const startDate = await converEpochToDate(selectedProject.start_date);
                setProject(prev => ({ ...prev, start_date: startDate ?? '' }));
            }
            if (selectedProject?.end_date) {
                const endDate = await converEpochToDate(selectedProject.end_date);
                setProject(prev => ({ ...prev, end_date: endDate ?? '' }));
            }
        };
        initializeDates();
    }, [selectedProject]);

    const [loading, setLoading] = useState(false);
    const [isSubmitActive, setIsSubmitActive] = useState(false);
    const [error, setError] = useState('');
    const { setIsProjectLoading } = usePortfolio();
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProject(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    useEffect(() => {
        const setIsSubmitActiveFunction = async () => {
            if (
                (isAdd && project.title && project.description && project.technologies && project.start_date) ||
                (!isAdd && (project.title !== selectedProject?.title || project.description !== selectedProject?.description || project.technologies !== selectedProject?.technologies || project.start_date !== await converEpochToDate(selectedProject.start_date) || project.end_date !== await converEpochToDate(selectedProject.end_date) || project.live_url !== selectedProject?.live_url || project.code_url !== selectedProject?.code_url || project.image_url !== selectedProject?.image_url))
            ) {
                setIsSubmitActive(true);
            } else {
                setIsSubmitActive(false);
            }
        }
        setIsSubmitActiveFunction();
    }, [project.title, project.description, project.technologies, project.start_date, project.end_date, project.live_url, project.code_url, project.image_url]);


    const handleSubmit = async (e: React.FormEvent) => {
        try {
            setLoading(true);
            e.preventDefault();
            
            const startDateEpoch = await convertDateToEpoch(project.start_date ?? '');
            const endDateEpoch = await convertDateToEpoch(project.end_date ?? '');
            
            const projectData = {
                ...project,
                technologies: project.technologies.toString().split(',').map((t: string) => t.trim()).filter(Boolean),
                start_date: startDateEpoch,
                end_date: endDateEpoch,
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
        <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full mb-4">
                    <FolderOpen className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {isAdd ? 'Add Project' : 'Edit Project'}
                </h2>
            </div>

            <form  
                className="space-y-6"
                onSubmit={handleSubmit}
            >
                {/* Project Title */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FolderOpen className="w-4 h-4 text-orange-600" />
                        Project Title
                    </label>
                    <input
                        type="text"
                        name="title"
                        placeholder="e.g., E-commerce Platform, Task Manager App"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                        value={project.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FileText className="w-4 h-4 text-purple-600" />
                        Description
                    </label>
                    <textarea
                        name="description"
                        placeholder="Describe your project in detail"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                        value={project.description}
                        onChange={handleChange}
                        required
                        rows={4}
                    />
                </div>

                {/* Technologies */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Code className="w-4 h-4 text-blue-600" />
                        Technologies & Skills
                    </label>
                    <input
                        type="text"
                        name="technologies"
                        placeholder="e.g., React, Node.js, MongoDB, AWS (comma separated)"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                        value={project.technologies}
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
                            <span className="text-xs text-gray-500 font-normal">(Optional)</span>
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

                {/* URLs */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Globe className="w-4 h-4 text-green-600" />
                            Live URL
                            <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                        </label>
                        <input
                            type="url"
                            name="live_url"
                            placeholder="https://your-project.com"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                            value={project.live_url}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Github className="w-4 h-4 text-gray-800" />
                            Code URL
                            <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                        </label>
                        <input
                            type="url"
                            name="code_url"
                            placeholder="https://github.com/username/repo"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                            value={project.code_url}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FileText className="w-4 h-4 text-red-600" />
                        Image URL
                        <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                        value={project.image_url}
                        onChange={handleChange}
                    />
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
                        className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                {isAdd ? 'Adding Project...' : 'Updating Project...'}
                            </div>
                        ) : (
                            isAdd ? 'Add Project' : 'Update Project'
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

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ project, setShowDeleteConfirmationModal }) => {
    const [loading, setLoading] = useState(false);
    const { setIsProjectLoading } = usePortfolio();
    const [error, setError] = useState('');

    const handleDeleteProject = async () => {
        try {
            setLoading(true);
            const deletedProject = await deleteProject(project?._id ?? '');
            if (deletedProject.status_code === 400) {
                throw new Error(deletedProject.message ?? 'Failed to delete project');
            }
            setShowDeleteConfirmationModal?.(false);
            setIsProjectLoading(true);
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
                        <h3 className="text-xl font-bold text-gray-900">Delete Project</h3>
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
                        Are you sure you want to delete this project?
                        <span className="font-semibold text-gray-900"> "{project?.title}"</span>
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
                            onClick={handleDeleteProject}
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
};

export { ProjectAddEditForm, DeleteConfirmationModal };