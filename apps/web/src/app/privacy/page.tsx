'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const lastUpdated = 'December 13, 2024';

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <section className="relative py-16 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-neutral-950 to-indigo-900/10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-neutral-400">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-neutral-300 leading-relaxed mb-8">
              At Tarsit, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our platform.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">1. Information We Collect</h2>
            
            <h3 className="text-xl font-medium text-white mt-8 mb-3">Personal Information</h3>
            <p className="text-neutral-300 leading-relaxed mb-4">
              We may collect personal information that you voluntarily provide when you:
            </p>
            <ul className="list-disc pl-6 text-neutral-300 space-y-2 mb-6">
              <li>Register for an account</li>
              <li>Create or update your profile</li>
              <li>Register a business</li>
              <li>Make an appointment or booking</li>
              <li>Contact customer support</li>
              <li>Participate in surveys or promotions</li>
            </ul>
            <p className="text-neutral-300 leading-relaxed mb-4">
              This information may include your name, email address, phone number, postal address, 
              and payment information.
            </p>

            <h3 className="text-xl font-medium text-white mt-8 mb-3">Automatically Collected Information</h3>
            <p className="text-neutral-300 leading-relaxed mb-4">
              When you access our platform, we automatically collect certain information, including:
            </p>
            <ul className="list-disc pl-6 text-neutral-300 space-y-2 mb-6">
              <li>Device information (type, operating system, unique identifiers)</li>
              <li>Log information (access times, pages viewed, IP address)</li>
              <li>Location information (with your consent)</li>
              <li>Information collected through cookies and similar technologies</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">2. How We Use Your Information</h2>
            <p className="text-neutral-300 leading-relaxed mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-neutral-300 space-y-2 mb-6">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent fraudulent or illegal activities</li>
              <li>Personalize and improve your experience</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">3. Information Sharing</h2>
            <p className="text-neutral-300 leading-relaxed mb-4">
              We may share your information in the following situations:
            </p>
            <ul className="list-disc pl-6 text-neutral-300 space-y-2 mb-6">
              <li><strong className="text-white">With Businesses:</strong> When you interact with a business, they receive relevant information to provide their services</li>
              <li><strong className="text-white">With Service Providers:</strong> Third parties that perform services on our behalf</li>
              <li><strong className="text-white">For Legal Purposes:</strong> When required by law or to protect our rights</li>
              <li><strong className="text-white">Business Transfers:</strong> In connection with a merger, acquisition, or sale</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">4. Data Security</h2>
            <p className="text-neutral-300 leading-relaxed mb-6">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. However, 
              no method of transmission over the Internet is 100% secure.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">5. Your Rights</h2>
            <p className="text-neutral-300 leading-relaxed mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc pl-6 text-neutral-300 space-y-2 mb-6">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing</li>
              <li>Data portability</li>
              <li>Withdraw consent</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">6. Cookies</h2>
            <p className="text-neutral-300 leading-relaxed mb-6">
              We use cookies and similar tracking technologies to collect information and improve our 
              services. You can control cookies through your browser settings.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">7. Children's Privacy</h2>
            <p className="text-neutral-300 leading-relaxed mb-6">
              Our services are not intended for children under 13. We do not knowingly collect 
              personal information from children under 13.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">8. Changes to This Policy</h2>
            <p className="text-neutral-300 leading-relaxed mb-6">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">9. Contact Us</h2>
            <p className="text-neutral-300 leading-relaxed mb-6">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white font-medium">Tarsit Support</p>
              <p className="text-neutral-400">Email: privacy@tarsit.com</p>
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
              <Link href="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-neutral-400 hover:text-white transition-colors">
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
