'use client';

import { TarsChat } from '@/components/tars/TarsChat';
import { useTars } from '@/contexts/TarsContext';
import {
  AlertCircle,
  BarChart3,
  Book,
  Bot,
  Calendar,
  Camera,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Settings,
  Sparkles,
  Star,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface HelpTabProps {
  businessId: string;
  businessName: string;
  ownerEmail: string;
}

// Quick help topics for TARS
const QUICK_TOPICS = [
  { icon: Settings, label: 'Settings help', query: 'How do I update my business settings?' },
  { icon: Calendar, label: 'Appointments', query: 'How do I manage appointments?' },
  { icon: Camera, label: 'Photos', query: 'How do I upload and manage photos?' },
  { icon: Users, label: 'Team', query: 'How do I add team members?' },
  { icon: Star, label: 'Reviews', query: 'How do I respond to reviews?' },
  { icon: BarChart3, label: 'Analytics', query: 'Explain my analytics dashboard' },
  { icon: Clock, label: 'Hours', query: 'How do I set business hours?' },
  { icon: CheckCircle, label: 'Verification', query: 'How do I get verified?' },
];

// FAQ Data
const faqs = [
  {
    question: 'How do I update my business hours?',
    answer:
      'Go to the "Hours" tab in your dashboard. You can set your operating hours for each day of the week, including lunch breaks and closed days. Click "Save Hours" when done.',
  },
  {
    question: 'How do customers book appointments?',
    answer:
      'Once you enable appointments in Settings, customers can see a "Book Now" button on your profile. They can select a service, date, and time slot based on your availability.',
  },
  {
    question: 'How do I respond to reviews?',
    answer:
      'Go to the "Reviews" tab, find the review you want to respond to, and click "Reply". Your response will be visible publicly below the review.',
  },
  {
    question: 'Can I hide certain features from my profile?',
    answer:
      "Yes! Go to Settings > Profile Visibility. You can toggle off features like phone number, reviews, services, and more. Disabled features won't appear on your public profile.",
  },
  {
    question: 'How do I upload photos?',
    answer:
      'Go to the "Photos" tab. You can upload your logo, cover image, and gallery photos. Drag and drop or click to select files. We support JPG, PNG, and WebP formats.',
  },
  {
    question: 'How do I add team members?',
    answer:
      'Go to the "Team" tab and click "Invite Member". Enter their email and set their permissions. They\'ll receive an invitation to join your business.',
  },
  {
    question: 'What happens if I disable messaging?',
    answer:
      'When messaging is disabled, customers won\'t see a "Message" button on your profile. Existing conversations will be preserved but customers cannot start new ones.',
  },
  {
    question: 'How do I get verified?',
    answer:
      'Verified businesses show a badge on their profile. Contact our support team with business documentation (license, registration, etc.) to request verification.',
  },
];

// FAQ Accordion Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
      >
        <span className="font-medium text-white">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-white/50 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-white/50 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <p className="text-white/70 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export function HelpTab({ businessId, businessName, ownerEmail }: HelpTabProps) {
  const [activeSection, setActiveSection] = useState<'tars' | 'faq' | 'contact' | 'resources'>(
    'tars'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    category: 'general',
    message: '',
  });
  const { openTars } = useTars();

  const handleQuickTopic = (query: string) => {
    openTars({
      context: 'business',
      businessId,
      businessName,
      initialMessage: query,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call - in production, this would send to your support system
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitted(true);
      toast.success("Support request submitted! We'll respond within 24 hours.");
      setContactForm({ subject: '', category: 'general', message: '' });
    } catch (error) {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with TARS branding */}
      <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              TARS Help Center
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                AI-Powered
              </span>
            </h1>
            <p className="text-white/60">Get instant answers from TARS or browse our resources</p>
          </div>
          <Sparkles className="w-6 h-6 text-purple-400" />
        </div>
      </div>

      {/* Quick Topics Grid */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        {QUICK_TOPICS.map((topic, i) => (
          <button
            key={i}
            onClick={() => handleQuickTopic(topic.query)}
            className="flex flex-col items-center gap-1 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors group"
            title={topic.query}
          >
            <topic.icon className="w-5 h-5 text-white/50 group-hover:text-purple-400 transition-colors" />
            <span className="text-xs text-white/50 group-hover:text-white transition-colors truncate w-full text-center">
              {topic.label}
            </span>
          </button>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
        {[
          { id: 'tars', label: 'Chat with TARS', icon: Bot },
          { id: 'faq', label: 'FAQ', icon: Book },
          { id: 'contact', label: 'Contact Support', icon: MessageSquare },
          { id: 'resources', label: 'Resources', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as typeof activeSection)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
              activeSection === tab.id
                ? 'bg-purple-600 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TARS Chat Section */}
      {activeSection === 'tars' && (
        <div className="space-y-4">
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="h-[500px]">
              <TarsChat
                context="business"
                businessId={businessId}
                businessName={businessName}
                embedded={true}
              />
            </div>
          </div>

          {/* TARS Features */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl border border-white/10 p-4 text-center">
              <Zap className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-sm text-white/70">Instant Answers</p>
            </div>
            <div className="bg-white/5 rounded-xl border border-white/10 p-4 text-center">
              <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-white/70">24/7 Available</p>
            </div>
            <div className="bg-white/5 rounded-xl border border-white/10 p-4 text-center">
              <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-white/70">Learns Your Business</p>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {activeSection === 'faq' && (
        <div className="space-y-4">
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>

          <div className="text-center py-4">
            <p className="text-white/50 text-sm">
              Can't find what you're looking for?{' '}
              <button
                onClick={() => setActiveSection('tars')}
                className="text-purple-400 hover:text-purple-300"
              >
                Ask TARS
              </button>{' '}
              or{' '}
              <button
                onClick={() => setActiveSection('contact')}
                className="text-purple-400 hover:text-purple-300"
              >
                contact support
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Contact Support Section */}
      {activeSection === 'contact' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white/5 rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Send us a Message</h2>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                <p className="text-white/60 mb-6">We'll respond to your inquiry within 24 hours.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Category</label>
                  <select
                    value={contactForm.category}
                    onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="general" className="bg-neutral-900">
                      General Inquiry
                    </option>
                    <option value="technical" className="bg-neutral-900">
                      Technical Issue
                    </option>
                    <option value="billing" className="bg-neutral-900">
                      Billing Question
                    </option>
                    <option value="feature" className="bg-neutral-900">
                      Feature Request
                    </option>
                    <option value="verification" className="bg-neutral-900">
                      Business Verification
                    </option>
                    <option value="report" className="bg-neutral-900">
                      Report a Problem
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Describe your issue or question in detail..."
                    rows={6}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-blue-400" />
                  <p className="text-sm text-blue-300">
                    We'll respond to {ownerEmail} within 24 hours.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h3 className="font-semibold text-white mb-4">Other Ways to Reach Us</h3>
              <div className="space-y-4">
                <a
                  href="mailto:support@tarsit.com"
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <Mail className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white text-sm font-medium">Email</p>
                    <p className="text-white/50 text-xs">support@tarsit.com</p>
                  </div>
                </a>
                <a
                  href="tel:+1-800-TARSIT"
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <Phone className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white text-sm font-medium">Phone</p>
                    <p className="text-white/50 text-xs">1-800-TARSIT (Mon-Fri, 9am-6pm)</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-2xl border border-purple-500/20 p-6">
              <h3 className="font-semibold text-white mb-2">Business ID</h3>
              <p className="text-white/50 text-sm mb-3">Reference this when contacting support:</p>
              <code className="block p-3 bg-black/30 rounded-lg text-purple-300 text-sm font-mono break-all">
                {businessId}
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Resources Section */}
      {activeSection === 'resources' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Video className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Video Tutorials</h3>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Getting Started with Your Dashboard', duration: '5:30' },
                { title: 'Setting Up Appointments', duration: '4:15' },
                { title: 'Managing Your Photos', duration: '3:45' },
                { title: 'Responding to Reviews', duration: '2:30' },
                { title: 'Team Management Basics', duration: '6:00' },
              ].map((video, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                >
                  <span className="text-white group-hover:text-purple-300 transition-colors">
                    {video.title}
                  </span>
                  <span className="text-white/40 text-sm">{video.duration}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Book className="w-6 h-6 text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">Guides & Articles</h3>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Complete Business Owner Guide', type: 'PDF' },
                { title: 'Best Practices for Profile Photos', type: 'Article' },
                { title: 'Maximizing Customer Engagement', type: 'Article' },
                { title: 'Understanding Your Analytics', type: 'Guide' },
                { title: 'SEO Tips for Your Business', type: 'Article' },
              ].map((resource, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                >
                  <span className="text-white group-hover:text-indigo-300 transition-colors">
                    {resource.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-white/50">
                      {resource.type}
                    </span>
                    <ExternalLink className="w-4 h-4 text-white/30" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl border border-purple-500/20 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Need personalized help?</h3>
                <p className="text-white/60">
                  Book a free 15-minute onboarding call with our team.
                </p>
              </div>
              <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors whitespace-nowrap">
                Schedule a Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
