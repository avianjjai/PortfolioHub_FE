import { useState } from "react";
import { ModalOverlay } from "./ModalOverlay";
import { deleteEducation, deleteExperience, deleteMessage, deleteProject, deleteSkill, deleteAward, deleteCertification, deleteConversation } from "../../services/api";
import { usePortfolio } from "../../context/PortfolioContext";
import { Education, Skill, Experience, Message, Project, Award, Certification } from "../../services/modal";
import { Trash2, X } from "lucide-react";

interface DeleteModalProps {
    setShowDeleteModal: (show: boolean) => void;
    setSelectedData: (data: any | null) => void;
    data: Education | Experience | Skill | Project | Message | Message[] | Award | Certification | null;
    dataType: 'education' | 'experience' | 'skill' | 'project' | 'message' | 'conversation' | 'award' | 'certification';
}

const deleteRespectiveData = async(dataType: string, data: any) => {
    switch (dataType) {
        case 'education':
            return deleteEducation(data?._id ?? '');
        case 'experience':
            return deleteExperience(data?._id ?? '');
        case 'skill':
            return deleteSkill(data?._id ?? '');
        case 'project':
            return deleteProject(data?._id ?? '');
        case 'message':
            return deleteMessage(data?.id ?? '');
        case 'award':
            return deleteAward(data?._id ?? '');
        case 'certification':
            return deleteCertification(data?._id ?? '');
        case 'conversation':
            // data is an array of messages, get conversationId from the first message
            if (Array.isArray(data) && data.length > 0 && data[0]?.conversationId) {
                return deleteConversation(data[0].conversationId);
            }
            throw new Error('Invalid conversation data');
    }
}

const getRespectiveTitle = (dataType: string) => {
    switch (dataType) {
        case 'education':
            return 'Education';
        case 'experience':
            return 'Experience';
        case 'skill':
            return 'Skill';
        case 'project':
            return 'Project';
        case 'message':
            return 'Message';
        case 'conversation':
            return 'Conversation';
        default:
            return 'Data';
    }
}

const getSetDataLoadingFunction = (dataType: string, portfolioHooks: any) => {
    const { setIsEducationLoading, setIsExperienceLoading, setIsSkillLoading, setIsProjectLoading, setIsMessageLoading, setIsAwardLoading, setIsCertificationLoading, setIsMessageCountLoading } = portfolioHooks;
    switch (dataType) {
        case 'education':
            return [setIsEducationLoading];
        case 'experience':
            return [setIsExperienceLoading];
        case 'skill':
            return [setIsSkillLoading];
        case 'project':
            return [setIsProjectLoading];
        case 'message':
            return [setIsMessageLoading, setIsMessageCountLoading];
        case 'award':
            return [setIsAwardLoading];
        case 'certification':
            return [setIsCertificationLoading];
        case 'conversation':
            return [setIsMessageLoading, setIsMessageCountLoading];
    }
}

const getRespectiveMessage = (dataType: DeleteModalProps['dataType'], data: any) => {
    switch(dataType) {
        case 'skill':
            return (
                <>Are you sure you want to delete skill "<span className="font-semibold text-gray-900">{data?.name}</span>"?</>
            );
        case 'project':
            return (
                <>Are you sure you want to delete project "<span className="font-semibold text-gray-900">{data?.title}</span>"?</>
            );
        case 'experience':
            return (
                <>Are you sure you want to delete experience at "<span className="font-semibold text-gray-900">{data?.company}</span>"?</>
            );
        case 'education':
            return (
                <>Are you sure you want to delete education "<span className="font-semibold text-gray-900">{data?.degree}</span>"?</>
            );
        case 'award':
            return (
                <>Are you sure you want to delete award "<span className="font-semibold text-gray-900">{data?.title}</span>"?</>
            );
        case 'certification':
            return (
                <>Are you sure you want to delete certification "<span className="font-semibold text-gray-900">{data?.name}</span>"?</>
            );

        case 'message':
            return (
                <>Are you sure you want to delete message "<span className="font-semibold text-gray-900">{data?.messageSubject}</span>"?</>
            );
        case 'conversation':
            const conversationLabel = data?.[0]?.senderName || data?.[0]?.senderEmail || 'this contact';
            return (
                <>Are you sure you want to delete the conversation with <span className="font-semibold text-gray-900">{conversationLabel}</span>?</>
            );
    }
}

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({ setSelectedData, setShowDeleteModal, data, dataType }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const portfolioHooks = usePortfolio();

    const deleteData = async() => {
        try {
            setLoading(true);
            const deletedData = await deleteRespectiveData(dataType, data);
            
            // Check for error status_code (conversation returns different type, so skip this check)
            if (dataType !== 'conversation') {
                const dataWithStatus = deletedData as any;
                if (dataWithStatus?.status_code === 400) {
                    throw new Error(dataWithStatus.message ?? 'Failed to delete data');
                }
            }

            setShowDeleteModal(false);
            getSetDataLoadingFunction(dataType, portfolioHooks)?.forEach((setIsDataLoading) => {
                setIsDataLoading(true);
            });
            setSelectedData(null);
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
                        <h3 className="text-xl font-bold text-gray-900">Delete {getRespectiveTitle(dataType)}</h3>
                    </div>
                    <button
                        onClick={() => setShowDeleteModal(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-700 mb-4">
                        {getRespectiveMessage(dataType, data)}
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        This action cannot be undone.
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={deleteData}
                            className="flex-1 px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Deleting {getRespectiveTitle(dataType)}...
                                </div>
                            ) : (
                                `Delete ${getRespectiveTitle(dataType)}`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;