import React, { useState, useEffect } from 'react';
import { User, GraduationCap, Award, FileText, Briefcase, Edit3 } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { updatePortfolio } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface EditPortfolioFormProps {
  portfolioData: any;
  setShowForm: (show: boolean) => void;
}

const EditPortfolioModal: React.FC<EditPortfolioFormProps> = ({ portfolioData, setShowForm}) => {
  const { educations, experiences, certifications, awards } = usePortfolio();

  const [formData, setFormData] = useState({
    first_name: portfolioData?.first_name || '',
    middle_name: portfolioData?.middle_name || '',
    last_name: portfolioData?.last_name || '',
    portfolio_title: portfolioData?.portfolio_title || '',
    portfolio_description: portfolioData?.portfolio_description || '',
    portfolio_education: Array.isArray(portfolioData?.portfolio_education) ? portfolioData.portfolio_education[0] || '' : (portfolioData?.portfolio_education || ''),
    portfolio_certifications: Array.isArray(portfolioData?.portfolio_certifications) ? portfolioData.portfolio_certifications : (portfolioData?.portfolio_certifications ? [portfolioData.portfolio_certifications] : []),
    portfolio_awards: Array.isArray(portfolioData?.portfolio_awards) ? portfolioData.portfolio_awards : (portfolioData?.portfolio_awards ? [portfolioData.portfolio_awards] : []),
    github_url: portfolioData?.github_url || '',
    twitter_url: portfolioData?.twitter_url || '',
    instagram_url: portfolioData?.instagram_url || '',
    linkedin_url: portfolioData?.linkedin_url || '',
    leetcode_url: portfolioData?.leetcode_url || '',
    website_url: portfolioData?.website_url || '',
    phone: portfolioData?.phone || portfolioData?.phone_number || ''
  });

  // Track if custom title mode is active
  const [isCustomTitle, setIsCustomTitle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setIsCurrentUserLoading } = useAuth();
  const [isSubmitActive, setIsSubmitActive] = useState(false);

  // Fetch options for dropdowns
  const [educationOptions, setEducationOptions] = useState<string[]>([]);
  const [jobTitleOptions, setJobTitleOptions] = useState<string[]>([]);
  const [certificationOptions, setCertificationOptions] = useState<string[]>([]);
  const [awardOptions, setAwardOptions] = useState<string[]>([]);

  useEffect(() => {
    try {
      // Use educations from PortfolioContext
      const eduOptions = educations.map((edu: any) => `${edu.degree} - ${edu.institution}`);
      setEducationOptions(eduOptions);

      // Use experiences from PortfolioContext
      const uniqueTitles = Array.from(new Set(experiences.map((exp: any) => exp.title))) as string[];
      setJobTitleOptions(uniqueTitles);

      // Use certifications from PortfolioContext
      const certOptions = certifications.map((cert: any) => `${cert.name} - ${cert.issuer}`);
      setCertificationOptions(certOptions);

      // Use awards from PortfolioContext
      const awardOpts = awards.map((award: any) => `${award.name} - ${award.issuer}`);
      setAwardOptions(awardOpts);
    } catch (error) {
      // Failed to process portfolio data
    }
  }, [educations, experiences, certifications, awards]);

  const addListItem = (field: 'portfolio_certifications' | 'portfolio_awards') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeListItem = (field: 'portfolio_certifications' | 'portfolio_awards', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_: string, i: number) => i !== index)
    }));
  };

  const updateListItem = (field: 'portfolio_certifications' | 'portfolio_awards', index: number, value: string) => {
    const currentValues = formData[field];
    const isDuplicate = currentValues.some((item: string, i: number) => i !== index && item === value);
    
    if (isDuplicate) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => i === index ? value : item)
    }));
  };

  const getAvailableOptions = (field: 'portfolio_certifications' | 'portfolio_awards', options: string[]) => {
    const selectedValues = formData[field].filter((value: string) => value !== '');
    return options.filter(option => !selectedValues.includes(option));
  };

  const getDropdownOptions = (field: 'portfolio_certifications' | 'portfolio_awards', options: string[], currentValue: string) => {
    if (currentValue) {
      const availableOptions = options.filter(option => option !== currentValue && !formData[field].includes(option));
      return [currentValue, ...availableOptions];
    } else {
      const selectedValues = formData[field].filter((value: string) => value !== '');
      return options.filter(option => !selectedValues.includes(option));
    }
  };

  useEffect(() => {
    if (
      formData.first_name !== portfolioData?.first_name ||
      formData.last_name !== portfolioData?.last_name ||
      formData.portfolio_title !== portfolioData?.portfolio_title ||
      formData.portfolio_description !== portfolioData?.portfolio_description ||
      formData.portfolio_education !== (Array.isArray(portfolioData?.portfolio_education) ? portfolioData.portfolio_education[0] || '' : (portfolioData?.portfolio_education || '') ) ||
      formData.portfolio_certifications !== (Array.isArray(portfolioData?.portfolio_certifications) ? portfolioData.portfolio_certifications : (portfolioData?.portfolio_certifications ? [portfolioData.portfolio_certifications] : [])) ||
      formData.portfolio_awards !== (Array.isArray(portfolioData?.portfolio_awards) ? portfolioData.portfolio_awards : (portfolioData?.portfolio_awards ? [portfolioData.portfolio_awards] : [])) ||
      formData.github_url !== portfolioData?.github_url ||
      formData.twitter_url !== portfolioData?.twitter_url ||
      formData.instagram_url !== portfolioData?.instagram_url ||
      formData.linkedin_url !== portfolioData?.linkedin_url ||
      formData.leetcode_url !== portfolioData?.leetcode_url ||
      formData.website_url !== portfolioData?.website_url ||
      formData.phone !== (portfolioData?.phone || portfolioData?.phone_number || '')
    ) {
      setIsSubmitActive(true);
    } else {
      setIsSubmitActive(false);
    }
  }, [formData, portfolioData]);

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      setLoading(true);
      e.preventDefault();

      const portfolioUpdateData = {
        ...formData,
        portfolio_education: formData.portfolio_education ? [formData.portfolio_education] : [],
        portfolio_certifications: formData.portfolio_certifications,
        portfolio_awards: formData.portfolio_awards,
        phone: formData.phone?.trim() || null
      };

      const response = await updatePortfolio(portfolioUpdateData);
      if (response.status_code === 400) {
        throw new Error(response.message ?? 'Failed to update portfolio');
      }

      setShowForm(false);
      setIsCurrentUserLoading(true);
    } catch (error: any) {
      setError(error.message ?? 'Failed to update portfolio');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full mb-4">
          <Edit3 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Edit Portfolio</h2>
        <p className="text-gray-600">Update your portfolio information and highlights</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Middle Name</label>
              <input
                type="text"
                value={formData.middle_name}
                onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="Enter middle name (optional)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="Enter last name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>

        {/* Professional Information Section */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-green-600" />
            Professional Information
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Professional Title</label>
              <select
                value={isCustomTitle ? '__custom__' : formData.portfolio_title}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setIsCustomTitle(true);
                    setFormData({ ...formData, portfolio_title: '' });
                  } else {
                    setIsCustomTitle(false);
                    setFormData({ ...formData, portfolio_title: e.target.value });
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              >
                <option value="">Select your professional title</option>
                {jobTitleOptions.length > 0 ? (
                  <>
                    {jobTitleOptions.map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                    <option value="__custom__">+ Add Custom Title</option>
                  </>
                ) : (
                  <option value="__custom__">+ Add Custom Title</option>
                )}
              </select>

              {isCustomTitle && (
                <input
                  type="text"
                  placeholder="Enter your custom professional title"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white/50 backdrop-blur-sm mt-2"
                  onChange={(e) => setFormData({ ...formData, portfolio_title: e.target.value })}
                  value={formData.portfolio_title}
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.portfolio_description}
                onChange={(e) => setFormData({ ...formData, portfolio_description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                rows={4}
                placeholder="Enter a brief description about yourself"
              />
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            Education
          </h3>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Primary Education</label>
            <select
              value={formData.portfolio_education || ''}
              onChange={(e) => setFormData({ ...formData, portfolio_education: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
            >
              <option value="">Select your primary education</option>
              {educationOptions.length > 0 ? (
                educationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))
              ) : (
                <option disabled>No education entries found</option>
              )}
            </select>
          </div>
        </div>

        {/* Certifications Section */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Certifications
          </h3>
          <div className="space-y-3">
            {formData.portfolio_certifications.map((item: string, index: number) => (
              <div key={index} className="flex gap-2">
                <select
                  value={item}
                  onChange={(e) => updateListItem('portfolio_certifications', index, e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                >
                  <option value="">Select certification</option>
                  {getDropdownOptions('portfolio_certifications', certificationOptions, item).length > 0 ? (
                    getDropdownOptions('portfolio_certifications', certificationOptions, item).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))
                  ) : (
                    <option disabled>No more certifications available</option>
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => removeListItem('portfolio_certifications', index)}
                  className="px-4 py-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-colors border border-red-200 hover:border-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem('portfolio_certifications')}
              disabled={getAvailableOptions('portfolio_certifications', certificationOptions).length === 0}
              className="px-4 py-3 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl border border-indigo-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              + Add Certification
            </button>
          </div>
        </div>

        {/* Awards Section */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Awards
          </h3>
          <div className="space-y-3">
            {formData.portfolio_awards.map((item: string, index: number) => (
              <div key={index} className="flex gap-2">
                <select
                  value={item}
                  onChange={(e) => updateListItem('portfolio_awards', index, e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                >
                  <option value="">Select award</option>
                  {getDropdownOptions('portfolio_awards', awardOptions, item).length > 0 ? (
                    getDropdownOptions('portfolio_awards', awardOptions, item).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))
                  ) : (
                    <option disabled>No more awards available</option>
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => removeListItem('portfolio_awards', index)}
                  className="px-4 py-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-colors border border-red-200 hover:border-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem('portfolio_awards')}
              disabled={getAvailableOptions('portfolio_awards', awardOptions).length === 0}
              className="px-4 py-3 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-xl border border-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              + Add Award
            </button>
          </div>
        </div>

        {/* Social Media Links Section */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
            </svg>
            Social Media Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">GitHub Profile</label>
              <input
                type="url"
                value={formData.github_url || ''}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="https://github.com/username"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">LinkedIn Profile</label>
              <input
                type="url"
                value={formData.linkedin_url || ''}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Twitter Profile</label>
              <input
                type="url"
                value={formData.twitter_url || ''}
                onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="https://twitter.com/username"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Instagram Profile</label>
              <input
                type="url"
                value={formData.instagram_url || ''}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="https://instagram.com/username"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">LeetCode Profile</label>
              <input
                type="url"
                value={formData.leetcode_url || ''}
                onChange={(e) => setFormData({ ...formData, leetcode_url: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="https://leetcode.com/username"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Personal Website</label>
              <input
                type="url"
                value={formData.website_url || ''}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={!isSubmitActive || loading}
            className="flex-1 bg-gradient-to-r from-orange-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Updating Portfolio...</span>
              </>
            ) : (
              <>
                <span>Update Portfolio</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPortfolioModal;
