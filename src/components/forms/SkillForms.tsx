import { useEffect, useState } from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { Skill } from "../../services/modal";
import { addSkill, deleteSkill, updateSkill } from "../../services/api";
import { Trash2, X } from "lucide-react";

interface AddSkillFormProps {
    setShowAddForm?: (show: boolean) => void;
}

interface EditSkillFormProps {
    skill: Skill | null;
    setShowEditForm?: (show: boolean) => void;
}

interface DeleteConfirmationModalProps {
    skill: Skill | null;
    setShowDeleteConfirmationModal?: (show: boolean) => void;
}

const AddSkillForm: React.FC<AddSkillFormProps> = ({ setShowAddForm }) => {
    const [skill, setSkill] = useState({
        name: '',
        category: '',
        proficiency: 0
    });

    const [loading, setLoading] = useState(false);
    const [isSubmitActive, setIsSubmitActive] = useState(false);
    const [error, setError] = useState('');
    const { setIsSkillLoading } = usePortfolio();

    useEffect(() => {
        if (skill.name && skill.category) {
            setIsSubmitActive(false);
        } else {
            setIsSubmitActive(true);
        }
    }, [skill.name, skill.category]);

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            setLoading(true);
            e.preventDefault();

            const newSkill = await addSkill(skill);
            if (newSkill.status_code === 400) {
                throw new Error(newSkill.message ?? 'Failed to add skill');
            }
            
            setShowAddForm?.(false);
            setIsSkillLoading(true);
        } catch (error: any) {
            setError(error.message ?? '');
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <form 
            className="space-y-4 max-w-md"
            onSubmit={handleSubmit}
        >
            <input 
                type="text"
                name="skillName"
                placeholder="Skill Name"
                className="w-full px-4 py-2 rounded border"
                value={skill.name}
                onChange={e => setSkill(s => ({ ...s, name: e.target.value }))}
                required
            />
            <input 
                type="text"
                name="category"
                placeholder="Category"
                className="w-full px-4 py-2 rounded border"
                value={skill.category}
                onChange={e => setSkill(s => ({ ...s, category: e.target.value }))}
                required
            />
            <div>
                <label className="block mb-1">Proficiency: {skill.proficiency}%</label>
                <input 
                    type="range"
                    min={0}
                    max={100}
                    value={skill.proficiency}
                    onChange={e => setSkill(s => ({ ...s, proficiency: Number(e.target.value) }))}
                    className="w-full"
                />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex gap-2">
                <button 
                    type="submit" 
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                    disabled={isSubmitActive}
                >
                    {loading ? 'Adding...' : 'Add Skill'}
                </button>
                <button 
                    type="button"
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    disabled={loading}
                    onClick={() => setShowAddForm?.(false)}
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}

const EditSkillForm: React.FC<EditSkillFormProps> = ({ skill, setShowEditForm }) => {
    const [selectedSkill, setSelectedSkill] = useState({
        name: skill?.name ?? '',
        category: skill?.category ?? '',
        proficiency: skill?.proficiency ?? 0
    });

    const [loading, setLoading] = useState(false);
    const [isSubmitActive, setIsSubmitActive] = useState(false);
    const [error, setError] = useState('');
    const { setIsSkillLoading } = usePortfolio();

    useEffect(() => {
        if (selectedSkill.name === skill?.name && selectedSkill.category === skill?.category && selectedSkill.proficiency === skill?.proficiency) {
            setIsSubmitActive(true);
        } else {
            setIsSubmitActive(false);
        }
    }, [selectedSkill.name, selectedSkill.category, selectedSkill.proficiency]);

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            setLoading(true);
            e.preventDefault();
            const updatedSkill = await updateSkill(skill?._id ?? '', selectedSkill);
            if (updatedSkill.status_code === 400) {
                throw new Error(updatedSkill.message ?? 'Failed to update skill');
            }   
            setShowEditForm?.(false);
            setIsSkillLoading(true);
        } catch (error: any) {
            setError(error.message ?? '');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form 
            className="space-y-4 max-w-md"
            onSubmit={handleSubmit}
        >
            <input 
                type="text"
                name="skillName"
                placeholder="Skill Name"
                className="w-full px-4 py-2 rounded border"
                value={selectedSkill.name}
                onChange={e => setSelectedSkill(s => ({ ...s, name: e.target.value }))}
                required
            />
            <input 
                type="text"
                name="category"
                placeholder="Category"
                className="w-full px-4 py-2 rounded border"
                value={selectedSkill.category}
                onChange={e => setSelectedSkill(s => ({ ...s, category: e.target.value }))}
                required
            />
            <div>
                <label className="block mb-1">Proficiency: {selectedSkill.proficiency}%</label>
                <input 
                    type="range"
                    min={0}
                    max={100}
                    value={selectedSkill.proficiency}
                    onChange={e => setSelectedSkill(s => ({ ...s, proficiency: Number(e.target.value) }))}
                    className="w-full"
                />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex gap-2">
                <button 
                    type="submit" 
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                    disabled={isSubmitActive}
                >
                    {loading ? 'Updating...' : 'Update Skill'}
                </button>
                <button 
                    type="button"
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    disabled={loading}
                    onClick={() => setShowEditForm?.(false)}
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ skill, setShowDeleteConfirmationModal }) => {
    const [loading, setLoading] = useState(false);
    const { setIsSkillLoading } = usePortfolio();
    const [error, setError] = useState('');

    const handleDeleteSkill = async () => {
        try {
            setLoading(true);
            const deletedSkill = await deleteSkill(skill?._id ?? '');
            if (deletedSkill.status_code === 400) {
                throw new Error(deletedSkill.message ?? 'Failed to delete skill');
            }
            setShowDeleteConfirmationModal?.(false);
            setIsSkillLoading(true);
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
                        <h3 className="text-xl font-bold text-gray-900">Delete Skill</h3>
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
                        Are you sure you want to delete <span className="font-semibold text-gray-900">{skill?.name}</span> skill?
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        This action cannot be undone.
                    </p>

                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    <div className="flex gap-2">
                        <button 
                            type="submit" 
                            onClick={handleDeleteSkill}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                        >
                            {loading ? 'Deleting...' : 'Delete Skill'}
                        </button>
                        <button 
                            type="button"
                            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            onClick={() => setShowDeleteConfirmationModal?.(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { AddSkillForm, EditSkillForm, DeleteConfirmationModal };