import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { ContactMeForm } from "../forms/ContactMeForm";

const ContactSection = () => {
    const { isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    
    return (
        <section id="contact" className="gradient-purple-pink py-20">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-white mb-12 text-center">Contact Me</h2>
                <div className="w-full grid gap-12">
                    <div>
                        <>
                            <ContactMeForm />
                        </>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;