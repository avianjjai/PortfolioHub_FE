import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import HeroSection from "../components/sections/HeroSection";
import AboutSection from "../components/sections/AboutSection";
import SkillsSection from "../components/sections/SkillsSection";
import ProjectSection from "../components/sections/ProjectSection";
import ExperienceSection from "../components/sections/ExperienceSection";
import EducationSection from "../components/sections/EducationSection";
import CertificationSection from "../components/sections/CertificationSection";
import AwardsSection from "../components/sections/AwardsSection";
import { useAuth } from "../context/AuthContext";
import ContactManagement from "../components/sections/ContactManagement";
import ContactSection from "../components/sections/ContactSection";
import Footer from "../components/Footer";

const Home: React.FC = () => {
    const { isMe, isValidUser } = useAuth();
    const location = useLocation();

    useEffect(() => {
        // Handle scroll navigation when coming from other pages
        if (location.state?.scrollTo) {
            const sectionId = location.state.scrollTo;
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    }, [location.state]);
    
    return (
        <div className="min-h-screen">
            <HeroSection />
            <AboutSection />
            <SkillsSection />
            <ProjectSection />
            <ExperienceSection />
            <EducationSection />
            <CertificationSection />
            <AwardsSection />
            {!isMe && isValidUser && <ContactSection />}
            {isMe && <ContactManagement />}
            <Footer />
        </div>
    )
}

export default Home;