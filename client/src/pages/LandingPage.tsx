import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Vote, Lock, Eye, Users, BarChart3, CheckCircle, ChevronRight, Zap, Globe, Sparkles, ArrowRight } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
};

const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 25 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-950 text-white overflow-hidden">
      {/* ══════ HERO ══════ */}
      <section className="relative min-h-screen flex items-center animated-gradient">
        {/* Ambient glows */}
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="hero-glow hero-glow-3" />

        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern" />

        {/* Floating particles */}
        <div className="particles">
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <motion.div {...fadeUp}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/8 border border-primary-500/15 text-primary-300 text-sm mb-8 backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">Secure Campus Democracy</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-[1.05] mb-6 tracking-tight">
                <span className="gradient-text">Your Vote,</span>
                <br />
                <span className="text-white">Your Future</span>
              </h1>

              <p className="text-lg text-surface-400 mb-10 max-w-lg leading-relaxed">
                VoxUnite is the secure, transparent digital voting platform built for
                university elections. Every vote counts, every voice matters.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/login"
                  className="btn-primary text-base px-8 py-4 rounded-2xl group"
                >
                  Vote Now
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/live"
                  className="btn-secondary px-8 py-4 rounded-2xl"
                >
                  <span className="live-dot" /> Live Monitor
                </Link>
              </div>
            </motion.div>

            {/* Right: Hero card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Glow behind card */}
                <div className="absolute -inset-6 bg-gradient-to-br from-primary-500/15 via-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl" />

                <div className="relative glass rounded-3xl p-8">
                  {/* Card header */}
                  <div className="flex items-center gap-3 mb-7">
                    <div className="w-11 h-11 rounded-xl bg-accent-500/15 flex items-center justify-center">
                      <Vote className="w-5 h-5 text-accent-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-base">Student Union Election</p>
                      <p className="text-sm text-surface-500">2024/2025 Session</p>
                    </div>
                    <span className="ml-auto px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold border border-green-500/15">
                      Active
                    </span>
                  </div>

                  {/* Position rows */}
                  <div className="space-y-3">
                    {['President', 'Vice President', 'General Secretary', 'Treasurer'].map((pos, i) => (
                      <div
                        key={pos}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg ${
                              ['bg-gradient-to-br from-primary-500 to-primary-700',
                               'bg-gradient-to-br from-purple-500 to-purple-700',
                               'bg-gradient-to-br from-pink-500 to-pink-700',
                               'bg-gradient-to-br from-amber-500 to-amber-700'][i]
                            }`}
                          >
                            {i + 1}
                          </div>
                          <span className="text-sm text-surface-200 font-medium">{pos}</span>
                        </div>
                        <span className="text-xs text-surface-500 group-hover:text-surface-400 transition-colors">
                          {4 - i} candidates
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Turnout */}
                  <div className="pt-5 mt-5 border-t border-white/5">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-surface-500">Turnout</span>
                      <span className="text-accent-400 font-semibold">67.3%</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '67%' }}
                        transition={{ duration: 1.5, delay: 0.8, ease: 'easeOut' as const }}
                        className="progress-fill"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-950 to-transparent pointer-events-none" />
      </section>

      {/* ══════ STATS ══════ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-950 via-surface-900/50 to-surface-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { label: 'Elections Conducted', value: '24+', icon: Vote },
              { label: 'Votes Recorded', value: '12,847', icon: BarChart3 },
              { label: 'Registered Voters', value: '5,200+', icon: Users },
              { label: 'Uptime', value: '99.9%', icon: Globe },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={staggerItem}
                className="stat-card text-center p-6 rounded-2xl card"
              >
                <stat.icon className="w-7 h-7 text-primary-400 mx-auto mb-4" />
                <p className="text-3xl font-display font-bold text-white mb-1">{stat.value}</p>
                <p className="text-xs text-surface-500 font-medium uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════ FEATURES ══════ */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-5 tracking-tight">
              Built for <span className="gradient-text">Trust</span>
            </h2>
            <p className="text-surface-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Enterprise-grade security meets elegant simplicity. Every feature is designed
              to ensure fair, transparent elections.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: Lock, title: 'End-to-End Security', desc: 'OTP verification, JWT authentication, and immutable vote records ensure complete election integrity.' },
              { icon: Shield, title: 'Double-Vote Prevention', desc: 'Triple-layer protection at session, backend, and database levels prevents any duplicate voting attempts.' },
              { icon: Eye, title: 'Full Transparency', desc: 'Comprehensive audit logs, real-time monitoring, and verifiable results you can trust.' },
              { icon: Users, title: 'Institutional Integration', desc: 'CSV/XLSX voter import from your university registry. No student registration required.' },
              { icon: BarChart3, title: 'Live Analytics', desc: 'Real-time turnout tracking, faculty participation, and broadcast-quality result dashboards.' },
              { icon: CheckCircle, title: 'Vote Anonymity', desc: 'Votes are permanently anonymous. No one can trace a ballot back to a student.' },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                className="group p-7 rounded-2xl card card-interactive"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-500/8 flex items-center justify-center mb-5 group-hover:bg-primary-500/15 transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-surface-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-900/40 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-5 tracking-tight">
              How <span className="gradient-text">Voting</span> Works
            </h2>
            <p className="text-surface-400 text-lg">Simple, secure, and completed in under 2 minutes.</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
            className="grid md:grid-cols-4 gap-8"
          >
            {[
              { step: '01', title: 'Verify Identity', desc: 'Enter your Student ID and institutional email.' },
              { step: '02', title: 'Receive OTP', desc: 'A one-time password is sent to your email for verification.' },
              { step: '03', title: 'Cast Your Vote', desc: 'Browse candidates, read manifestos, and make your selections.' },
              { step: '04', title: 'Confirmed', desc: 'Your vote is securely recorded. View your confirmation receipt.' },
            ].map((s) => (
              <motion.div key={s.step} variants={staggerItem} className="relative text-center group">
                <div className="text-7xl font-display font-bold text-primary-500/[0.07] mb-3 group-hover:text-primary-500/[0.12] transition-colors duration-500">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-surface-400 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════ CTA ══════ */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-r from-primary-600/15 via-purple-600/15 to-pink-600/10 rounded-3xl blur-3xl" />
              <div className="relative glass rounded-3xl p-12 md:p-16">
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 tracking-tight">
                  Ready to <span className="gradient-text">Vote?</span>
                </h2>
                <p className="text-surface-300 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                  Your voice shapes the future of your university. Make it count with
                  VoxUnite's secure voting platform.
                </p>
                <Link
                  to="/login"
                  className="btn-primary text-lg px-10 py-4 rounded-2xl"
                >
                  Start Voting <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/15">
                <Vote className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-white">VoxUnite</span>
            </div>
            <p className="text-surface-500 text-sm">© 2024 VoxUnite. Secure Campus Democracy Platform.</p>
            <div className="flex items-center gap-2 text-surface-500 text-sm">
              <Lock className="w-4 h-4" /> 256-bit Encrypted
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
