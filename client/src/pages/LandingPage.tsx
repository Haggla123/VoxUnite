import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle,
  Clock3,
  Eye,
  FileCheck2,
  KeyRound,
  LockKeyhole,
  Radio,
  Shield,
  Users,
  Vote,
} from 'lucide-react';

const liveStats = [
  { label: 'Eligible voters', value: '12,840' },
  { label: 'Verified sessions', value: '8,116' },
  { label: 'Ballots cast', value: '7,904' },
];

const turnout = [
  { faculty: 'Engineering', percent: 84, votes: '2,184' },
  { faculty: 'Science', percent: 72, votes: '1,947' },
  { faculty: 'Business', percent: 68, votes: '1,633' },
  { faculty: 'Humanities', percent: 61, votes: '1,218' },
];

const electionCards = [
  { title: 'Student Union President', status: 'Live', meta: '4 candidates', icon: Vote },
  { title: 'Faculty Representatives', status: 'Scheduled', meta: '12 seats', icon: Building2 },
  { title: 'Constitution Referendum', status: 'Audit ready', meta: '1 proposal', icon: FileCheck2 },
];

const platformSteps = [
  {
    icon: KeyRound,
    title: 'Verify every voter',
    text: 'Students use their institutional email, student ID, and a time-limited OTP before receiving a ballot.',
  },
  {
    icon: LockKeyhole,
    title: 'Protect each ballot',
    text: 'The voting flow binds sessions, blocks duplicate submissions, and keeps voter identity separate from vote choice.',
  },
  {
    icon: Eye,
    title: 'Observe without exposing',
    text: 'Election teams see turnout, audit events, and final results without leaking individual voting behavior.',
  },
];

const LandingPage: React.FC = () => {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white font-sans text-surface-900">
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden border-b border-surface-200 bg-[#f7f9fc]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-primary-100 bg-white px-3 py-2 text-xs font-semibold uppercase text-primary-700 shadow-sm">
              <Radio className="h-4 w-4" />
              Live university election infrastructure
            </div>

            <h1 className="text-5xl font-bold leading-[1.04] tracking-normal text-surface-950 sm:text-6xl lg:text-7xl">
              VoxUnite
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg font-medium leading-8 text-surface-700 sm:text-xl">
              Run student elections with verified access, resilient ballot handling, live turnout visibility, and audit trails your election committee can defend.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/login" className="btn-primary px-6 py-3 text-base">
                Enter voting portal
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/admin/login" className="btn-secondary px-6 py-3 text-base">
                Admin console
                <Shield className="h-4 w-4" />
              </Link>
            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
            className="mx-auto mt-10 max-w-5xl"
          >
            <div className="overflow-hidden rounded-lg border border-surface-200 bg-white shadow-xl shadow-surface-200/70">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-200 px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-surface-950">Election command center</p>
                  <p className="text-xs text-surface-500">September 2026 student union cycle</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg bg-success-50 px-3 py-1.5 text-xs font-semibold text-success-600">
                  <span className="h-2 w-2 rounded-full bg-success-500" />
                  Receiving ballots
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-surface-200 border-b border-surface-200 bg-surface-50">
                {liveStats.map((stat) => (
                  <div key={stat.label} className="px-3 py-3 sm:px-5 sm:py-4">
                    <p className="text-[0.68rem] font-medium leading-4 text-surface-500 sm:text-xs">{stat.label}</p>
                    <p className="mt-1 text-lg font-bold text-surface-950 sm:text-2xl">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-0 lg:grid-cols-[1fr_0.9fr]">
                <div className="border-b border-surface-200 p-5 lg:border-b-0 lg:border-r">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-surface-500">Active ballot</p>
                      <h2 className="mt-1 text-2xl font-bold tracking-normal text-surface-950">Student Union President</h2>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-100 text-surface-500">
                      <Clock3 className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {['Amina Mensah', 'David Okoro', 'Sarah Chen'].map((name, index) => (
                      <div
                        key={name}
                        className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border p-3 ${
                          index === 0 ? 'border-primary-200 bg-primary-50' : 'border-surface-200 bg-white'
                        }`}
                      >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${index === 0 ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-500'}`}>
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-surface-900">{name}</p>
                          <p className="text-xs text-surface-500">Manifesto reviewed</p>
                        </div>
                        <span className={`text-sm font-bold ${index === 0 ? 'text-primary-700' : 'text-surface-500'}`}>
                          {index === 0 ? '41%' : index === 1 ? '34%' : '25%'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-surface-200 p-3">
                      <p className="text-xs text-surface-500">Close time</p>
                      <p className="mt-1 text-sm font-bold text-surface-950">18:00 GMT</p>
                    </div>
                    <div className="rounded-lg border border-surface-200 p-3">
                      <p className="text-xs text-surface-500">Integrity checks</p>
                      <p className="mt-1 text-sm font-bold text-success-600">Passing</p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase text-surface-500">Turnout</p>
                      <p className="mt-1 text-lg font-bold text-surface-950">Faculty view</p>
                    </div>
                    <BarChart3 className="h-5 w-5 text-primary-600" />
                  </div>

                  <div className="space-y-4">
                    {turnout.map((item) => (
                      <div key={item.faculty}>
                        <div className="mb-1.5 flex items-end justify-between gap-3">
                          <span className="text-sm font-semibold text-surface-800">{item.faculty}</span>
                          <span className="text-xs font-medium text-surface-500">{item.votes} votes</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-lg bg-surface-100">
                          <div className="h-full rounded-lg bg-primary-600" style={{ width: `${item.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-lg border border-surface-200 bg-surface-50 p-3">
                    <p className="text-xs font-semibold uppercase text-surface-500">Latest audit event</p>
                    <p className="mt-1 text-sm font-medium text-surface-800">OTP verified, ballot issued, duplicate vote check passed.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="elections" className="border-b border-surface-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-primary-700">Election operations</p>
              <h2 className="mt-2 text-3xl font-bold tracking-normal text-surface-950">One place for every election state</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-surface-600">
              VoxUnite keeps live ballots, scheduled elections, and published results in the same controlled workflow.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {electionCards.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-lg border border-surface-200 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-900 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-lg border border-surface-200 px-2.5 py-1 text-xs font-semibold text-surface-600">{item.status}</span>
                  </div>
                  <h3 className="text-lg font-bold text-surface-950">{item.title}</h3>
                  <p className="mt-2 text-sm text-surface-500">{item.meta}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="platform" className="bg-surface-50 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase text-primary-700">Platform</p>
              <h2 className="mt-2 text-3xl font-bold tracking-normal text-surface-950">Built for election committees, not generic surveys</h2>
              <p className="mt-4 text-base leading-7 text-surface-600">
                The system is shaped around the real campus election loop: voter eligibility, secure access, voting, observation, results, and audit review.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {platformSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <article key={step.title} className="rounded-lg border border-surface-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-surface-950">{step.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-surface-600">{step.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-surface-200 bg-surface-950 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-surface-950">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold">VoxUnite</span>
            </div>
            <p className="mt-3 max-w-xl text-sm leading-6 text-surface-300">
              Verified digital voting for academic institutions.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-surface-950 transition-colors hover:bg-surface-100">
              Student access
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#platform" className="inline-flex items-center justify-center gap-2 rounded-lg border border-surface-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-surface-900">
              <CheckCircle className="h-4 w-4" />
              Review platform
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
