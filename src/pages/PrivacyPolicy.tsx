import { Link } from "react-router-dom";

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
                    <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Introduction</h2>
                            <p>
                                Welcome to Portfolio Hub ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our portfolio platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
                            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.1 Personal Information</h3>
                            <p>We collect information that you provide directly to us, including:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Name, email address, and contact information</li>
                                <li>Professional information (work experience, education, skills, projects)</li>
                                <li>Portfolio content (descriptions, images, links)</li>
                                <li>Account credentials (username, password)</li>
                                <li>Social media links and profile information</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.2 Automatically Collected Information</h3>
                            <p>We may automatically collect certain information when you use our platform:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>IP address and device information</li>
                                <li>Browser type and version</li>
                                <li>Usage data and interaction patterns</li>
                                <li>Cookies and similar tracking technologies</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
                            <p>We use the information we collect to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Create and manage your portfolio account</li>
                                <li>Display your portfolio content to visitors</li>
                                <li>Generate and provide resume downloads</li>
                                <li>Communicate with you about your account and our services</li>
                                <li>Improve our platform and user experience</li>
                                <li>Ensure platform security and prevent fraud</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Information Sharing and Disclosure</h2>
                            <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Public Portfolio Content:</strong> Information you choose to include in your public portfolio is visible to anyone who visits your portfolio URL</li>
                                <li><strong>Service Providers:</strong> We may share information with third-party service providers who assist us in operating our platform</li>
                                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
                                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale, your information may be transferred</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Data Security</h2>
                            <p>
                                We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Your Rights and Choices</h2>
                            <p>You have the right to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Access, update, or delete your personal information</li>
                                <li>Modify or remove content from your portfolio</li>
                                <li>Delete your account at any time</li>
                                <li>Opt-out of certain communications</li>
                                <li>Request a copy of your data</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Cookies and Tracking Technologies</h2>
                            <p>
                                We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and improve our services. You can control cookie preferences through your browser settings.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Children's Privacy</h2>
                            <p>
                                Our platform is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Changes to This Privacy Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at:
                            </p>
                            <p className="mt-2">
                                <strong>Email:</strong> <a href="mailto:cse.avinash.gupta@gmail.com" className="text-blue-600 hover:underline">cse.avinash.gupta@gmail.com</a>
                            </p>
                            <p className="mt-2">
                                <strong>Platform Owner:</strong> Avinash Gupta
                            </p>
                        </section>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <Link to="/" className="text-blue-600 hover:underline">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
