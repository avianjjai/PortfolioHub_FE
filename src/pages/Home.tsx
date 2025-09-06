import HeroSection from "../components/sections/HeroSection";
import SkillsSection from "../components/sections/SkillsSection";
import ProjectSection from "../components/sections/ProjectSection";
import ExperienceSection from "../components/sections/ExperienceSection";
import EducationSection from "../components/sections/EducationSection";
import CertificationSection from "../components/sections/CertificationSection";
import AwardsSection from "../components/sections/AwardsSection";
import { useAuth } from "../context/AuthContext";
import ContactManagement from "../components/sections/ContactManagement";
import ContactSection from "../components/sections/ContactSection";

const Home: React.FC = () => {
    const { isMe } = useAuth(); 
    return (
        <div className="min-h-screen">
            <HeroSection />
            <SkillsSection />
            <ProjectSection />
            <ExperienceSection />
            <EducationSection />
            <CertificationSection />
            <AwardsSection />
            <ContactSection />
            {isMe && <ContactManagement />}
        </div>
    )
}

export default Home;