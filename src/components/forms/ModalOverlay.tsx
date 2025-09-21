import { useEffect } from "react";

const ModalOverlaySkills: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => {
    useEffect(() => {
        document.body.classList.add('overflow-hidden');
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, []);
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 pointer-events-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 pt-20 relative w-full max-w-md mx-auto">
                <button
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full text-xl font-bold transition-colors"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ×
                </button>
                {children}
            </div>
        </div>
    )
}


const ModalOverlay: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => {
    useEffect(() => {
        document.body.classList.add('overflow-hidden');
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, []);
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm pointer-events-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <button
                    className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full text-2xl font-bold transition-colors z-10"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ×
                </button>
                {children}
            </div>
        </div>
    )
}

export { ModalOverlay, ModalOverlaySkills };