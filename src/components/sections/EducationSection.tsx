import { Edit2, Trash } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePortfolio } from "../../context/PortfolioContext";

const getEducationDuration = (startDate: string, endDate: string) => {
    if (startDate && endDate) {
        return `${new Date(startDate).getFullYear()} - ${new Date(endDate).getFullYear()}`;
    } else if (startDate) {
        return `${new Date(startDate).getFullYear()}`;
    } else {
        return 'Present';
    }
};

const EducationSection = () => {
    const { isAuthenticated } = useAuth();
    const { educations, getEducations, isEducationLoaded } = usePortfolio();
    
    return (
        <section id='education' className='gradient-blue-purple py-20'>
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-white mb-12 text-center">Education</h2>
                <div className="w-full">
                    {isAuthenticated && (
                        <div className="mb-8 text-center">
                            <button className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-colors mb-4 border border-white/30">
                                Add Education
                            </button>
                        </div>
                    )}
                    {educations && educations.length > 0 ? (
                        <div className="w-full space-y-8">
                            {educations.map((education: any) => (
                                <div 
                                    key={education.id}
                                    className="bg-white/20 rounded-2xl p-8 backdrop-blur-sm border border-white/30 relative group"
                                >
                                    {isAuthenticated && (
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <button className="p-2 text-white/60 hover:text-white/90 hover:bg-white/20 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/30 rounded-full transition-colors opacity-0 group-hover:opacity-100 border border-red-500/30 hover:border-red-400/50">
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-2">{education.degree}</h3>
                                            <p className="text-xl text-white/90 mb-2">{education.institution}</p>
                                        </div>
                                        
                                        <span className="text-lg text-white/80 bg-white/20 px-4 py-2 rounded-full border border-white/30">
                                            {getEducationDuration(education.start_date, education.end_date)}
                                        </span>
                                    </div>

                                    {education.description && (
                                        <p className="text-white/90 mt-4 leading-relaxed">
                                            {education.description}
                                        </p>
                                    )}

                                    {education.technologies && education.technologies.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {education.technologies.map((technology: any) => (
                                                <span key={technology} className="text-white/80 bg-white/20 px-3 py-1 rounded-full border border-white/30">{technology}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        ) : (
                            <div className="text-white/90 text-center">
                                No education found
                            </div>
                        )}
                </div>
            </div>
        </section>
    );
};

export default EducationSection;