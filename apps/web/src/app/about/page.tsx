'use client';

import Link from 'next/link';
import { Building2, Users, Globe, Heart, ArrowRight, MapPin, Star, MessageCircle } from 'lucide-react';

export default function AboutPage() {
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
      description: 'We believe in the power of local businesses. They\'re the heart of every community, and we\'re here to help them thrive.',
    },
    {
      icon: Heart,
      title: 'Built with Care',
      description: 'Every feature we build is designed with both business owners and customers in mind. Simple, intuitive, and effective.',
    },
    {
      icon: MessageCircle,
      title: 'Real Connections',
      description: 'We facilitate genuine connections between businesses and their customers, not just transactions.',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-neutral-950 to-indigo-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15),transparent_50%)]" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Connecting Communities,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              One Business at a Time
            </span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto">
            Tarsit is a platform built to help local service businesses get discovered, 
            connect with customers, and grow their business in the digital age.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-neutral-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Story</h2>
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-neutral-300 leading-relaxed mb-6">
              Tarsit was born from a simple observation: small, local service businesses 
              are the backbone of our communities, yet they often struggle to compete 
              in an increasingly digital world.
            </p>
            <p className="text-neutral-300 leading-relaxed mb-6">
              We saw talented barbers, skilled mechanics, passionate restaurant owners, 
              and dedicated healthcare providers who were amazing at what they do but 
              had no easy way to reach new customers or manage their online presence.
            </p>
            <p className="text-neutral-300 leading-relaxed">
              That's why we built Tarsit – a platform that makes it simple for local 
              businesses to create beautiful storefronts, connect with customers through 
              instant messaging, manage appointments, and build their reputation through 
              verified reviews.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">What We Believe In</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all"
              >
                <value.icon className="h-10 w-10 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
                <p className="text-neutral-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-neutral-400 text-lg mb-10 max-w-xl mx-auto">
            Whether you're a customer looking for great local services or a business 
            owner ready to grow, we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-neutral-950 bg-white hover:bg-neutral-100 rounded-full transition-all"
            >
              Explore Businesses
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/business/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white border border-neutral-700 hover:border-purple-500/50 hover:bg-purple-500/10 rounded-full transition-all"
            >
              List Your Business
            </Link>
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
              <Link href="/about" className="text-purple-400 hover:text-purple-300 transition-colors">
                About
              </Link>
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
