'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, MapPin, Phone, Send, MessageCircle, Clock, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'support@tarsit.com',
      href: 'mailto:support@tarsit.com',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+1 (555) 123-4567',
      href: 'tel:+15551234567',
    },
    {
      icon: MapPin,
      label: 'Address',
      value: '123 Main Street, San Francisco, CA 94102',
      href: null,
    },
    {
      icon: Clock,
      label: 'Hours',
      value: 'Mon-Fri: 9am - 6pm PST',
      href: null,
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-neutral-950 to-indigo-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15),transparent_50%)]" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <MessageCircle className="h-16 w-16 text-purple-400 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Have a question, feedback, or need help? We'd love to hear from you. 
            Our team is here to help.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">Send us a Message</h2>
              
              {isSubmitted ? (
                <div className="p-8 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                  <p className="text-neutral-400 mb-6">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-purple-400 hover:text-purple-300 font-medium"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-neutral-300 mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    >
                      <option value="" className="bg-neutral-900">Select a subject</option>
                      <option value="general" className="bg-neutral-900">General Inquiry</option>
                      <option value="support" className="bg-neutral-900">Technical Support</option>
                      <option value="business" className="bg-neutral-900">Business Listing Help</option>
                      <option value="feedback" className="bg-neutral-900">Feedback / Suggestions</option>
                      <option value="partnership" className="bg-neutral-900">Partnership Opportunities</option>
                      <option value="press" className="bg-neutral-900">Press / Media</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-neutral-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">Contact Information</h2>
              
              <div className="space-y-4 mb-12">
                {contactInfo.map((item) => (
                  <div
                    key={item.label}
                    className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500 mb-1">{item.label}</p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-white hover:text-purple-400 transition-colors"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-white">{item.value}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQ Teaser */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Looking for Quick Answers?
                </h3>
                <p className="text-neutral-400 text-sm mb-4">
                  Check out our help center for answers to common questions about 
                  using Tarsit as a customer or business owner.
                </p>
                <Link
                  href="/search"
                  className="inline-flex items-center text-purple-400 hover:text-purple-300 font-medium text-sm transition-colors"
                >
                  Browse Help Articles →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-neutral-400 text-sm">
              © {new Date().getFullYear()} tarsit. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/about" className="text-neutral-400 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/privacy" className="text-neutral-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-neutral-400 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-purple-400 hover:text-purple-300 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
