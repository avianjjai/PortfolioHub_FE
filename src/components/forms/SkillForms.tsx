import { useEffect, useState } from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { Skill } from "../../services/modal";
import { addSkill, deleteSkill, updateSkill } from "../../services/api";
import { Trash2, X } from "lucide-react";

interface AddEditSkillFormProps {
    isAdd: boolean;
    selectedSkill?: Skill | null;
    setShowForm: (show: boolean) => void;
}

const AddEditSkillForm: React.FC<AddEditSkillFormProps> = ({ isAdd, selectedSkill, setShowForm }) => {
    const [skill, setSkill] = useState({
        name: selectedSkill?.name ?? '',
        category: selectedSkill?.category ?? '',
        proficiency: selectedSkill?.proficiency ?? 0
    });

    const [loading, setLoading] = useState(false);
    const [isSubmitActive, setIsSubmitActive] = useState(false);
    const [error, setError] = useState('');
    const { setIsSkillLoading } = usePortfolio();

    useEffect(() => {
        if (
            (isAdd && skill.name && skill.category) ||
            (!isAdd && (skill.name !== selectedSkill?.name || skill.category !== selectedSkill?.category || skill.proficiency !== selectedSkill?.proficiency))
        ) {
            setIsSubmitActive(true);
        } else {
            setIsSubmitActive(false);
        }
    }, [skill.name, skill.category, skill.proficiency]);

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            setLoading(true);
            e.preventDefault();

            const response = isAdd ? await addSkill(skill) : await updateSkill(selectedSkill?._id ?? '', skill);
            if (response.status_code === 400) {
                throw new Error(response.message ?? 'Failed to add skill');
            }
            
            setShowForm(false);
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
                    disabled={!isSubmitActive}
                >
                    {isAdd ? 
                        (loading ? 'Adding...' : 'Add Skill') 
                        : 
                        (loading ? 'Updating...' : 'Update Skill')
                    }
                </button>
                <button 
                    type="button"
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    disabled={loading}
                    onClick={() => setShowForm(false)}
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}

export { AddEditSkillForm };