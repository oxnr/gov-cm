'use client';

import Link from 'next/link';
import { FileText, Coins, ChartBar, ArrowRight, Buildings, Users, TrendUp, MapPin, Timer, Sparkle, Check } from '@phosphor-icons/react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Premium Gradient and Animations */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 gradient-animate bg-gradient-to-br from-indigo-100/30 via-purple-100/20 to-pink-100/30 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20" />
          <div className="absolute inset-0 bg-[var(--bg-gradient-subtle)]" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-purple-100/20 to-transparent dark:from-purple-900/10" />
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-indigo-400/30 dark:bg-indigo-400/20 rounded-full particle"
              style={{
                left: `${[65.72, 27.19, 99.58, 21.73, 32.89, 51.34, 70.05, 26.14][i]}%`,
                animationDelay: `${i * 2.5}s`,
                animationDuration: `${[23.60, 21.15, 21.90, 22.34, 17.75, 16.58, 20.61, 21.45][i]}s`
              }}
            />
          ))}
        </div>

        {/* Data flow visualization */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute inset-0 w-full h-full opacity-20 dark:opacity-10">
            <defs>
              <linearGradient id="dataGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Network paths */}
            <path
              d="M100,100 Q300,200 500,100 T900,100"
              stroke="url(#dataGradient)"
              strokeWidth="1"
              fill="none"
              strokeDasharray="5,5"
              className="animate-[dash_20s_linear_infinite]"
            />
            <path
              d="M50,300 Q250,200 450,300 T850,300"
              stroke="url(#dataGradient)"
              strokeWidth="1"
              fill="none"
              strokeDasharray="5,5"
              className="animate-[dash_25s_linear_infinite]"
            />
            
            {/* Data nodes */}
            {[
              { x: 100, y: 100 },
              { x: 500, y: 100 },
              { x: 900, y: 100 },
              { x: 50, y: 300 },
              { x: 450, y: 300 },
              { x: 850, y: 300 }
            ].map((node, i) => (
              <g key={i}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="4"
                  fill="#6366f1"
                  className="animate-[data-pulse_3s_ease-in-out_infinite]"
                  style={{ animationDelay: `${i * 0.5}s` }}
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="8"
                  fill="#6366f1"
                  fillOpacity="0.2"
                  className="animate-[data-pulse_3s_ease-in-out_infinite]"
                  style={{ animationDelay: `${i * 0.5}s` }}
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl float-animation" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl float-animation" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl float-animation" style={{ animationDelay: '6s' }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-full border border-indigo-500/20 text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-8 animate-[fade-in_1s_ease-out]">
              <Sparkle className="h-4 w-4 animate-pulse" weight="fill" />
              Powered by Real Government Data
            </div>
            
            <h1 className="text-6xl font-bold mb-6">
              <span className="gradient-text animate-[fade-in_1s_ease-out_0.2s_both]">Government Contract</span>
              <span className="block text-gray-900 dark:text-white mt-2 animate-[fade-in_1s_ease-out_0.4s_both]">Intelligence Platform</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Discover, analyze, and track government contracts and grants with powerful AI-driven insights and real-time market intelligence.
            </p>
            
            {/* Premium Stats Cards with Animations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="card-premium p-8 text-center group hover:scale-105 transition-all duration-300">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 blur-2xl group-hover:blur-3xl transition-all duration-300" />
                  <div className="relative text-4xl font-bold gradient-text mb-2">107K+</div>
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Contract Records</div>
              </div>
              <div className="card-premium p-8 text-center group hover:scale-105 transition-all duration-300">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 blur-2xl group-hover:blur-3xl transition-all duration-300" />
                  <div className="relative text-4xl font-bold gradient-text mb-2">$6.96M</div>
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Total Awards</div>
              </div>
              <div className="card-premium p-8 text-center group hover:scale-105 transition-all duration-300">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-2xl group-hover:blur-3xl transition-all duration-300" />
                  <div className="relative text-4xl font-bold gradient-text mb-2">71</div>
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Federal Agencies</div>
              </div>
            </div>

            {/* Premium CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contracts/federal"
                className="btn-premium inline-flex items-center gap-2 px-8 py-4 text-lg"
              >
                Explore Contracts
                <ArrowRight className="h-5 w-5" weight="bold" />
              </Link>
              <Link
                href="/analytics/spend"
                className="inline-flex items-center gap-2 px-8 py-4 text-lg font-medium rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <ChartBar className="h-5 w-5" weight="duotone" />
                View Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Feature Cards */}
      <div className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for <span className="gradient-text">Smart Decisions</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Access comprehensive government contract data with advanced analytics and real-time insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contracts Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity" />
              <div className="relative card-premium p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl">
                    <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" weight="duotone" />
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">Live Data</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Active Contracts</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Federal and state procurement opportunities updated in real-time</p>
                <div className="space-y-3">
                  <Link
                    href="/contracts/federal"
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">Federal Contracts</span>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" weight="bold" />
                  </Link>
                  <Link
                    href="/contracts/state"
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">State Contracts</span>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" weight="bold" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Grants Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity" />
              <div className="relative card-premium p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-xl">
                    <Coins className="h-8 w-8 text-green-600 dark:text-green-400" weight="duotone" />
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">Coming Soon</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Grant Intelligence</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Comprehensive analysis of awarded and cancelled federal grants</p>
                <div className="space-y-3">
                  <Link
                    href="/grants/awarded"
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">Awarded Grants</span>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" weight="bold" />
                  </Link>
                  <Link
                    href="/grants/cancelled"
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">Cancelled Grants</span>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" weight="bold" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Analytics Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity" />
              <div className="relative card-premium p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl">
                    <ChartBar className="h-8 w-8 text-purple-600 dark:text-purple-400" weight="duotone" />
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">AI Insights</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Market Analytics</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Deep insights into spending patterns and market trends</p>
                <div className="space-y-3">
                  <Link
                    href="/analytics/spend"
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">Spend Analysis</span>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" weight="bold" />
                  </Link>
                  <Link
                    href="/analytics/contractors"
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">Contractor Analysis</span>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" weight="bold" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Features Grid - Sophisticated Design */}
      <div className="py-24 bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-full border border-indigo-500/20 text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-6">
              <Sparkle className="h-4 w-4" weight="fill" />
              Complete Feature Suite
            </div>
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything You Need to <span className="gradient-text">Win More Contracts</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our comprehensive platform combines cutting-edge technology with deep market insights to give you an unfair advantage in government contracting
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Agency Intelligence Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500" />
              <div className="relative h-full bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                      <Buildings className="h-8 w-8 text-white" weight="fill" />
                    </div>
                    <span className="text-4xl font-bold text-indigo-500/20 dark:text-indigo-400/20">01</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Agency Intelligence</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    Track spending patterns across federal agencies and identify procurement trends with our advanced analytics engine
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-indigo-500" weight="bold" />
                      <span>Historical spend analysis</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-indigo-500" weight="bold" />
                      <span>Budget forecasting</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-indigo-500" weight="bold" />
                      <span>Procurement cycles</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Competitor Analysis Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500" />
              <div className="relative h-full bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg">
                      <Users className="h-8 w-8 text-white" weight="fill" />
                    </div>
                    <span className="text-4xl font-bold text-green-500/20 dark:text-green-400/20">02</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Competitor Analysis</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    Gain strategic insights into competitor performance, win rates, and contract portfolios
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-green-500" weight="bold" />
                      <span>Win rate tracking</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-green-500" weight="bold" />
                      <span>Contract history</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-green-500" weight="bold" />
                      <span>Performance metrics</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Market Insights Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500" />
              <div className="relative h-full bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                      <TrendUp className="h-8 w-8 text-white" weight="fill" />
                    </div>
                    <span className="text-4xl font-bold text-purple-500/20 dark:text-purple-400/20">03</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Market Insights</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    Identify emerging opportunities and predict future procurement needs with AI-driven analysis
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-purple-500" weight="bold" />
                      <span>Trend predictions</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-purple-500" weight="bold" />
                      <span>Market forecasts</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-purple-500" weight="bold" />
                      <span>Opportunity scoring</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Location Intelligence Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500" />
              <div className="relative h-full bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                      <MapPin className="h-8 w-8 text-white" weight="fill" />
                    </div>
                    <span className="text-4xl font-bold text-blue-500/20 dark:text-blue-400/20">04</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Location Intelligence</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    Find opportunities within your service area using advanced geographic filtering and mapping
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-blue-500" weight="bold" />
                      <span>Radius-based search</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-blue-500" weight="bold" />
                      <span>Interactive maps</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-blue-500" weight="bold" />
                      <span>Multi-state coverage</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Real-Time Updates Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500" />
              <div className="relative h-full bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                      <Timer className="h-8 w-8 text-white" weight="fill" />
                    </div>
                    <span className="text-4xl font-bold text-amber-500/20 dark:text-amber-400/20">05</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Real-Time Updates</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    Stay ahead with instant notifications and real-time opportunity tracking across all agencies
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-amber-500" weight="bold" />
                      <span>Instant alerts</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-amber-500" weight="bold" />
                      <span>Daily digests</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-amber-500" weight="bold" />
                      <span>Custom notifications</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* AI-Powered Insights Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500" />
              <div className="relative h-full bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-lg">
                      <Sparkle className="h-8 w-8 text-white" weight="fill" />
                    </div>
                    <span className="text-4xl font-bold text-rose-500/20 dark:text-rose-400/20">06</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI-Powered Insights</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    Leverage advanced machine learning to discover hidden patterns and winning strategies
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-rose-500" weight="bold" />
                      <span>Pattern recognition</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-rose-500" weight="bold" />
                      <span>Success predictions</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-rose-500" weight="bold" />
                      <span>Smart recommendations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 text-center">
            <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl border border-indigo-100 dark:border-gray-700">
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Ready to transform your contracting success?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Join thousands of contractors winning more with our platform</p>
              </div>
              <Link
                href="/contracts/federal"
                className="btn-premium inline-flex items-center gap-2 px-6 py-3"
              >
                Get Started
                <ArrowRight className="h-5 w-5" weight="bold" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}