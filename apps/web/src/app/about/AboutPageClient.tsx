'use client';

import {
    ArrowRight,
    Building2,
    Globe,
    Heart,
    MapPin,
    MessageCircle,
    Star,
    Users,
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPageClient() {
  const stats = [
    { label: 'Local Businesses', value: '2,500+', icon: Building2 },
    { label: 'Happy Customers', value: '50,000+', icon: Users },
    { label: 'Cities Covered', value: '100+', icon: Globe },
    { label: 'Reviews Written', value: '125,000+', icon: Star },
  ];

  const values = [
    {
      icon: MapPin,
      title: 'Local First',
      description:
        "We believe in the power of local businesses. They're the heart of every community, and we're here to help them thrive.",
    },
    {
      icon: Heart,
      title: 'Built with Care',
      description:
        'Every feature we build is designed with both business owners and customers in mind. Simple, intuitive, and effective.',
    },
    {
      icon: MessageCircle,
      title: 'Real Connections',
      description:
        'We facilitate genuine connections between businesses and their customers, not just transactions.',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-neutral-950 to-indigo-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15),transparent_50%)]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Connecting Communities
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                One Business at a Time
              </span>
            </h1>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
              Tarsit is more than a platform—it&apos;s a movement to empower local businesses and
              help communities thrive in the digital age.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-neutral-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-neutral-800 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <stat.icon className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-neutral-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
              Our Story
            </h2>
            <div className="space-y-6 text-lg text-neutral-300 leading-relaxed">
              <p>
                Tarsit was born from a simple observation: small businesses are the backbone of our
                communities, yet they often struggle to compete in an increasingly digital world.
              </p>
              <p>
                We set out to build something different—not just another directory, but a platform
                that truly understands and serves the needs of local businesses and their customers.
              </p>
              <p>
                With AI-powered discovery, seamless booking, and instant messaging, we&apos;re
                making it easier than ever for customers to find and connect with the businesses
                that make their neighborhoods special.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-neutral-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            What We Believe
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value) => (
              <div
                key={value.title}
                className="p-6 rounded-2xl bg-neutral-800/50 border border-neutral-700/50 hover:border-purple-500/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-neutral-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-neutral-400 mb-8">
              Join thousands of businesses and customers already using Tarsit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/business/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-colors"
              >
                List Your Business
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 transition-colors"
              >
                Explore Businesses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 border-t border-neutral-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-neutral-500 text-sm">
              © {new Date().getFullYear()} Tarsit. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-neutral-400 hover:text-white transition-colors">
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
