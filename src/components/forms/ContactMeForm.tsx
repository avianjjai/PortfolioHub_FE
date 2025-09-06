import { useState } from "react";

export const ContactMeForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });


    return (
        <form
            className="space-y-6"
        >
            <div>
                <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/30 transition-all"
                />
            </div>
            <div>
                <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/30 transition-all"
                />
            </div>
            <div>
                <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/30 transition-all"
                />
            </div>
            <div>
                <textarea
                    name="message"
                    placeholder="Your Message"
                    value={formData.message}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/30 transition-all resize-none"
                    rows={5}
                />
            </div>
            <div>
                <button
                    type="submit"
                    className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/30 transition-all"
                >
                    Send Message
                </button>
            </div>
        </form>
    )
}