'use client';

import Link from 'next/link';

export default function TermsOfServicePage() {
  const lastUpdated = 'December 13, 2024';

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <section className="relative py-16 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-neutral-950 to-indigo-900/10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-neutral-400">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-neutral-300 leading-relaxed mb-8">
              Welcome to Tarsit. By accessing or using our platform, you agree to be bound by these 
              Terms of Service. Please read them carefully.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">1. Acceptance of Terms</h2>
            <p className="text-neutral-300 leading-relaxed mb-6">
              By creating an account or using Tarsit, you agree to these Terms of Service and our 
              Privacy Policy. If you do not agree to these terms, please do not use our platform.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">2. Description of Service</h2>
            <p className="text-neutral-300 leading-relaxed mb-6">
              Tarsit is a platform that connects customers with local service businesses. We provide 
              tools for businesses to create online storefronts, manage appointments, communicate 
              with customers, and receive reviews. We do not provide the services offered by businesses 
              on our platform.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">3. User Accounts</h2>
            
            <h3 className="text-xl font-medium text-white mt-8 mb-3">Account Creation</h3>
            <p className="text-neutral-300 leading-relaxed mb-4">
              To use certain features of Tarsit, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-neutral-300 space-y-2 mb-6">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information as needed</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>

            <h3 className="text-xl font-medium text-white mt-8 mb-3">Account Types</h3>
            <ul className="list-disc pl-6 text-neutral-300 space-y-2 mb-6">
              <li><strong className="text-white">Customer Accounts:</strong> For individuals seeking local services</li>
              <li><strong className="text-white">Business Accounts:</strong> For businesses offering services on the platform</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">4. Business Listings</h2>
            <p className="text-neutral-300 leading-relaxed mb-4">
              If you register a business on Tarsit, you agree that:
            </p>
            <ul className="list-disc pl-6 text-neutral-300 space-y-2 mb-6">
              <li>You have the authority to represent the business</li>
              <li>All information provided is accurate and up-to-date</li>
              <li>You will respond to customer inquiries in a timely manner</li>
              <li>You will honor appointments and bookings made through the platform</li>
              <li>You will comply with all applicable laws and regulations</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">5. User Conduct</h2>
            <p className="text-neutral-300 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-neutral-300 space-y-2 mb-6">
              <li>Violate any applicable laws or regulations</li>
              <li>Post false, misleading, or fraudulent content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Spam or send unsolicited communications</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated tools to access or scrape the platform</li>
              <li>Interfere with the proper functioning of the platform</li>
              <li>Impersonate another person or entity</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">6. Reviews and Content</h2>
            <p className="text-neutral-300 leading-relaxed mb-4">
              When posting reviews or other content:
            </p>
            <ul className="list-disc pl-6 text-neutral-300 space-y-2 mb-6">
              <li>Reviews must be honest and based on genuine experiences</li>
              <li>You may not post reviews for businesses you own or work for</li>
              <li>Content must not be defamatory, obscene, or illegal</li>
              <li>You grant us a license to use, display, and distribute your content</li>
              <li>We may remove content that violates these terms</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">7. Intellectual Property</h2>
            <p className="text-neutral-300 leading-relaxed mb-6">
              The Tarsit platform, including its design, features, and content (excluding user content), 
              is owned by Tarsit and protected by intellectual property laws. You may not copy, modify, 
              or distribute our platform without permission.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-neutral-300 leading-relaxed mb-6">
              TARSIT IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THE 
              ACCURACY OF BUSINESS INFORMATION, THE QUALITY OF SERVICES PROVIDED BY BUSINESSES, 
              OR UNINTERRUPTED ACCESS TO THE PLATFORM.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">9. Limitation of Liability</h2>
            <p className="text-neutral-300 leading-relaxed mb-6">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, TARSIT SHALL NOT BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE 
              PLATFORM OR SERVICES PROVIDED BY BUSINESSES ON THE PLATFORM.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">10. Indemnification</h2>
            <p className="text-neutral-300 leading-relaxed mb-6">
              You agree to indemnify and hold harmless Tarsit and its affiliates from any claims, 
              damages, or expenses arising from your violation of these terms or your use of the platform.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">11. Termination</h2>
            <p className="text-neutral-300 leading-relaxed mb-6">
              We may terminate or suspend your account at any time for violation of these terms 
              or for any other reason at our discretion. You may also delete your account at any time 
              through your account settings.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">12. Changes to Terms</h2>
            <p className="text-neutral-300 leading-relaxed mb-6">
              We may modify these terms at any time. We will notify you of significant changes 
              by posting a notice on our platform or sending you an email. Continued use of the 
              platform after changes constitutes acceptance of the new terms.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">13. Governing Law</h2>
            <p className="text-neutral-300 leading-relaxed mb-6">
              These terms shall be governed by the laws of the State of California, without regard 
              to its conflict of law provisions.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">14. Contact Us</h2>
            <p className="text-neutral-300 leading-relaxed mb-6">
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white font-medium">Tarsit Legal</p>
              <p className="text-neutral-400">Email: legal@tarsit.com</p>
              <p className="text-neutral-400">Address: 123 Main Street, San Francisco, CA 94102</p>
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
              <Link href="/terms" className="text-purple-400 hover:text-purple-300 transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-neutral-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
