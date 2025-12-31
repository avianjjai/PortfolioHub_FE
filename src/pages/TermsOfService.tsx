import { Link } from "react-router-dom";

const TermsOfService: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
                    <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using Portfolio Hub ("the Platform"), you accept and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
                            <p>
                                Portfolio Hub is a platform that allows users to create, manage, and share their professional portfolios. The Platform provides tools for displaying professional information, generating resumes, and connecting with potential employers or clients.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
                            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.1 Account Creation</h3>
                            <p>To use certain features of the Platform, you must create an account. You agree to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Provide accurate, current, and complete information</li>
                                <li>Maintain and update your information to keep it accurate</li>
                                <li>Maintain the security of your account credentials</li>
                                <li>Accept responsibility for all activities under your account</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.2 Account Termination</h3>
                            <p>
                                You may delete your account at any time. We reserve the right to suspend or terminate accounts that violate these Terms or engage in harmful activities.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. User Content and Conduct</h2>
                            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.1 Content Ownership</h3>
                            <p>
                                You retain ownership of all content you upload to the Platform. By uploading content, you grant us a license to display, store, and process your content for the purpose of providing our services.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.2 Prohibited Content</h3>
                            <p>You agree not to upload, post, or transmit content that:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Is illegal, harmful, or violates any laws</li>
                                <li>Infringes on intellectual property rights of others</li>
                                <li>Contains viruses, malware, or malicious code</li>
                                <li>Is defamatory, harassing, or abusive</li>
                                <li>Contains spam or unsolicited commercial content</li>
                                <li>Violates privacy rights of others</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.3 Content Responsibility</h3>
                            <p>
                                You are solely responsible for the content you post on the Platform. We do not endorse or verify user content and are not liable for any content posted by users.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Platform Usage</h2>
                            <p>You agree to use the Platform only for lawful purposes and in accordance with these Terms. You agree not to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Attempt to gain unauthorized access to the Platform or other accounts</li>
                                <li>Interfere with or disrupt the Platform's operation</li>
                                <li>Use automated systems to access the Platform without permission</li>
                                <li>Reverse engineer or attempt to extract source code</li>
                                <li>Use the Platform to transmit harmful or malicious code</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Intellectual Property</h2>
                            <p>
                                The Platform, including its design, features, and functionality, is owned by Avinash Gupta and is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or create derivative works of the Platform without permission.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Service Availability</h2>
                            <p>
                                We strive to provide reliable service but do not guarantee that the Platform will be available at all times. We may perform maintenance, updates, or modifications that may temporarily interrupt service. We are not liable for any downtime or service interruptions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Disclaimer of Warranties</h2>
                            <p>
                                THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Limitation of Liability</h2>
                            <p>
                                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Indemnification</h2>
                            <p>
                                You agree to indemnify and hold harmless Avinash Gupta and Portfolio Hub from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Platform, your content, or your violation of these Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Changes to Terms</h2>
                            <p>
                                We reserve the right to modify these Terms at any time. We will notify users of significant changes by posting the updated Terms on the Platform. Your continued use of the Platform after changes constitutes acceptance of the new Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Governing Law</h2>
                            <p>
                                These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Contact Information</h2>
                            <p>
                                If you have any questions about these Terms of Service, please contact us at:
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

export default TermsOfService;
