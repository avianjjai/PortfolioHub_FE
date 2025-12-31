import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Award, GraduationCap, FileText, Edit2, Globe, Mail, Phone, Code2, Briefcase, Bird, Camera, Binary } from 'lucide-react';
import { ModalOverlay } from '../forms/ModalOverlay';
import EditPortfolioForm from '../forms/EditPortfolioForm';

const AboutSection: React.FC = () => {
  const { currentUser, isMe } = useAuth();
  const [showEditForm, setShowEditForm] = useState(false);

  const socialLinkConfigs = useMemo(() => [
    { key: 'github_url', label: 'GitHub', icon: Code2, prefix: '', showValue: false },
    { key: 'linkedin_url', label: 'LinkedIn', icon: Briefcase, prefix: '', showValue: false },
    { key: 'twitter_url', label: 'Twitter / X', icon: Bird, prefix: '', showValue: false },
    { key: 'instagram_url', label: 'Instagram', icon: Camera, prefix: '', showValue: false },
    { key: 'leetcode_url', label: 'LeetCode', icon: Binary, prefix: '', showValue: false },
    { key: 'website_url', label: 'Website', icon: Globe, prefix: '', showValue: false },
    { key: 'email', label: 'Email', icon: Mail, prefix: 'mailto:', showValue: false },
    { key: 'phone', label: 'Phone', icon: Phone, prefix: 'tel:', showValue: true },
  ] as const, []);

  const [availableSocialLinks, setAvailableSocialLinks] = useState<
    Array<{ label: string; icon: typeof User; href: string; key: string; value: string; showValue: boolean }>
  >(() => {
    if (!currentUser) {
      return [];
    }

    return socialLinkConfigs
      .map(({ key, label, icon, prefix, showValue }) => {
        const rawValue = currentUser[key as keyof typeof currentUser];
        if (!rawValue) {
          return null;
        }
        const value = String(rawValue).trim();
        if (!value) {
          return null;
        }
        const href = prefix ? `${prefix}${value}` : value;
        return { label, icon, href, key, value, showValue: !!showValue };
      })
      .filter(Boolean) as Array<{ label: string; icon: typeof User; href: string; key: string; value: string; showValue: boolean }>;
  });

  useEffect(() => {
    if (!currentUser) {
      setAvailableSocialLinks([]);
      return;
    }

    const links = socialLinkConfigs
      .map(({ key, label, icon, prefix, showValue }) => {
        const rawValue = currentUser[key as keyof typeof currentUser];
        if (!rawValue) {
          return null;
        }
        const value = String(rawValue).trim();
        if (!value) {
          return null;
        }
        const href = prefix ? `${prefix}${value}` : value;
        return { label, icon, href, key, value, showValue: !!showValue };
      })
      .filter(Boolean) as Array<{ label: string; icon: typeof User; href: string; key: string; value: string; showValue: boolean }>;

    setAvailableSocialLinks(links);
  }, [currentUser, socialLinkConfigs]);

  return (
    <>
      <section id="about" className="gradient-orange-pink py-20">
        {showEditForm && (
          <ModalOverlay onClose={() => setShowEditForm(false)}>
            <EditPortfolioForm
              portfolioData={currentUser || {}}
              setShowForm={setShowEditForm}
            />
          </ModalOverlay>
        )}

        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">About</h2>
          {currentUser ? (
            <div className="bg-white/20 rounded-3xl p-8 backdrop-blur-sm border border-white/30 relative group shadow-2xl">
              {isMe && (
                <button
                  onClick={() => setShowEditForm(true)}
                  className="absolute top-6 right-6 p-3 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                  aria-label="Edit portfolio"
                >
                  <Edit2 size={20} />
                </button>
              )}

              {/* Brief Overview */}
              <div className="text-center mb-12">
                {(currentUser.first_name || currentUser.last_name) ? (
                  <>
                    <h3 className="text-4xl font-bold text-white mb-3">
                      {`${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim()}
                    </h3>

                    {currentUser.portfolio_title && (
                      <p className="text-2xl text-white/90 mb-3">{currentUser.portfolio_title}</p>
                    )}

                    {currentUser.portfolio_description && (
                      <p className="text-white/80 text-xl leading-relaxed max-w-4xl mx-auto">{currentUser.portfolio_description}</p>
                    )}
                  </>
                ) : (
                  <div className="bg-white/20 rounded-3xl p-10 backdrop-blur-sm border border-white/30 max-w-2xl mx-auto relative overflow-hidden mt-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-50"></div>
                    <div className="relative z-10">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-white/30 to-white/10 rounded-full mb-6 shadow-lg border-2 border-white/40">
                        <User className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {isMe ? 'Complete Your Portfolio Section' : 'Profile Coming Soon'}
                    </h3>
                    <p className="text-white/90 text-base mb-6 leading-relaxed max-w-xl mx-auto">
                      {isMe
                        ? 'Add your name, professional title, and description to introduce yourself to visitors.'
                        : 'This portfolio does not have any highlights yet. Check back later for updates.'}
                    </p>
                    {isMe && (
                      <button
                        onClick={() => setShowEditForm(true)}
                        className="px-8 py-3 bg-gradient-to-r from-white/30 to-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:from-white/40 hover:to-white/30 transition-all duration-300 border border-white/40 shadow-lg hover:shadow-xl hover:scale-105 text-base inline-flex items-center gap-2"
                      >
                        <Edit2 size={18} />
                        Add Your Information
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Key Highlights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Education */}
                <div className="bg-white/15 rounded-2xl p-8 backdrop-blur-sm border border-white/25 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-white/20 rounded-full">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-white">Education</h4>
                  </div>
                  {currentUser.portfolio_education && currentUser.portfolio_education.length > 0 ? (
                    <p className="text-white text-lg leading-relaxed">{currentUser.portfolio_education[0]}</p>
                  ) : (
                    <div className="text-center py-6 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-30 rounded-xl"></div>
                      <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-3 border border-white/20">
                          <GraduationCap className="w-6 h-6 text-white/70" />
                        </div>
                        <p className="text-white/70 text-sm mb-1 font-medium">No education added</p>
                        <p className="text-white/50 text-xs">Add in <span className="font-bold">Edit Portfolio</span></p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Top Achievement */}
                <div className="bg-white/15 rounded-2xl p-8 backdrop-blur-sm border border-white/25 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-white/20 rounded-full">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold text-white">Top Achievement</h4>
                  {currentUser.portfolio_awards && currentUser.portfolio_awards.length > 0 ? (
                    <p className="text-white text-lg leading-relaxed">{currentUser.portfolio_awards[0]}</p>
                  ) : (
                    <div className="text-center py-6 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-30 rounded-xl"></div>
                      <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-3 border border-white/20">
                          <Award className="w-6 h-6 text-white/70" />
                        </div>
                        <p className="text-white/70 text-sm mb-1 font-medium">No awards added</p>
                        <p className="text-white/50 text-xs">Add in <span className="font-bold">Edit Portfolio</span></p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="bg-white/15 rounded-2xl p-8 backdrop-blur-sm border border-white/25 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-white/20 rounded-full">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-white">Connect</h4>
                  </div>
                  
                  {availableSocialLinks.length === 0 ? (
                    <div className="text-center py-6 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-30 rounded-xl"></div>
                      <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-3 border border-white/20">
                          <User className="w-6 h-6 text-white/70" />
                        </div>
                        <p className="text-white/70 text-sm mb-1 font-medium">No social links added</p>
                        <p className="text-white/50 text-xs">Add in <span className="font-bold">Edit Portfolio</span></p>
                      </div>
                    </div>
                  ): (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mt-2">
                      {availableSocialLinks.map((link) => {
                        const IconComponent = link.icon;
                        const isExternal = !link.href.startsWith('mailto:') && !link.href.startsWith('tel:');
                        return (
                          <a
                            key={link.key}
                            href={link.href}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noopener noreferrer" : undefined}
                            className="flex items-start gap-3 text-white/80 hover:text-white transition-all duration-300 hover:bg-white/10 rounded-lg p-2.5 group w-full"
                          >
                            <IconComponent className="w-5 h-5 text-white shrink-0 mt-0.5" />
                            <div className="flex flex-col gap-0.5 leading-tight min-w-0">
                              <span className="text-base font-medium break-words">
                                {link.showValue ? link.value : link.label}
                              </span>
                              {link.showValue && (
                                <span className="text-xs text-white/60">{link.label}</span>
                              )}
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>  
              </div>

              {currentUser.portfolio_certifications && currentUser.portfolio_certifications.length > 0 && (
                <div className="mt-8 bg-white/10 rounded-2xl p-8 backdrop-blur-sm border border-white/20">
                  <h4 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                    <FileText className='w-6 h-6' />
                    Certifications
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {currentUser.portfolio_certifications.map((cert: string, index: number) => (
                      <div 
                        key={index} 
                        className="bg-white/20 rounded-xl p-4 text-center hover:bg-white/25 transition-all duration-300 border border-white/30 backdrop-blur-sm"
                      >
                        <span className="text-white font-medium text-lg">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full text-center">
              <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto">
                Discover how to showcase your professional journey
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl mb-6">
                    <User className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4">Personal Branding</h3>
                  <p className="text-white/80 leading-relaxed mb-6">
                    Create a compelling personal brand that showcases your unique skills, experiences, and achievements
                  </p>
                  <div className="bg-white/20 rounded-xl p-4">
                    <p className="text-white/90 text-sm font-medium">Perfect for:</p>
                    <p className="text-white/70 text-sm">Professionals, freelancers, students, and career changers</p>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl mb-6">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Professional Showcase</h3>
                  <p className="text-white/80 leading-relaxed mb-6">
                    Build a comprehensive portfolio that highlights your projects, certifications, and professional growth
                  </p>
                  <div className="bg-white/20 rounded-xl p-4">
                    <p className="text-white/90 text-sm font-medium">Includes:</p>
                    <p className="text-white/70 text-sm">Skills, projects, experience, education, and achievements</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/30 shadow-2xl">
                <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
                <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                  Join thousands of professionals who have already created stunning portfolios
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="/register" className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
                    Create Your Portfolio
                  </a>
                </div>
                <p className="text-white/60 text-sm mt-6">
                  It only takes a few minutes to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default AboutSection;