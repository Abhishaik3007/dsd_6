import React, { useState, useEffect } from 'react';
import { useHub } from '../../context/HubContext';
import { useAuth } from '../../context/AuthContext';
import { useInstitute } from '../../context/InstituteContext';
import { sortByPriceLowToHigh, DEFAULT_CONTRACT_TIERS, INDIVIDUAL_PLANS } from '../../utils/tierConfig';
import { SignalSchoolLogo } from '../common/SignalSchoolLogo';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  ArrowUp
} from 'lucide-react';

export const PricingPage = () => {
  const { setActiveTab } = useHub();
  const { isAuthenticated } = useAuth();
  const { contractTiers: ctxContractTiers, individualPlans: ctxIndividualPlans } = useInstitute();

  const [audienceTab, setAudienceTab] = useState('institutional'); // 'institutional' | 'individual'
  const [billingCycle, setBillingCycle] = useState('annual'); // 'annual' | 'monthly'

  // Synchronize browser document title with selected tab
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = audienceTab === 'institutional'
        ? 'University & Campus Licensing — SignalSchool'
        : 'Individual Learner Passes — SignalSchool';
    }
  }, [audienceTab]);

  const handleScrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Tab-specific hero title & kicker content
  const headerContent = audienceTab === 'institutional' ? {
    kicker: 'campus licensing & student access',
    titleMain: 'Scaled for universities.',
    titleAccent: 'Built for your students.'
  } : {
    kicker: 'personal passes & lab sandboxes',
    titleMain: 'Built for curious minds.',
    titleAccent: 'Priced for everyone.'
  };

  // Match live subscription tiers from Firestore contract_tiers, ordered low to high
  const rawContractTiers = ctxContractTiers && ctxContractTiers.length > 0
    ? ctxContractTiers
    : DEFAULT_CONTRACT_TIERS;
  const contractTiers = sortByPriceLowToHigh(rawContractTiers);

  // Match live individual tiers from Firestore individual_tiers
  const individualPlans = ctxIndividualPlans && ctxIndividualPlans.length > 0
    ? ctxIndividualPlans
    : INDIVIDUAL_PLANS;

  // Dynamic pricing calculations based 100% on live Firestore data with 20% annual contract discount
  const getInstitutionalPrice = (tier) => {
    // In Firestore, priceEstimate is stored directly as configured by SuperAdmin (e.g. '₹4,10,000 / yr' or '₹35,000 / mo')
    const rawPrice = tier.priceEstimate || '';
    const rawDigits = rawPrice.replace(/[^\d]/g, '');
    const amount = rawDigits ? parseInt(rawDigits, 10) : 0;
    const seats = tier.defaultSeats || 100;
    const isMonthlyInput = rawPrice.toLowerCase().includes('/ mo') || rawPrice.toLowerCase().includes('/mo');

    // Base annual total derived from Firestore
    const annualTotal = isMonthlyInput ? amount * 12 : amount;
    const monthlyRate = Math.round(annualTotal / 12);

    if (billingCycle === 'annual') {
      // 20% discount on yearly contract
      const discountedAnnual = Math.round(annualTotal * 0.8);
      const discountedMonthly = Math.round(discountedAnnual / 12);
      const savings = annualTotal - discountedAnnual;

      return {
        mainAmount: discountedMonthly > 0 ? `₹${discountedMonthly.toLocaleString('en-IN')}` : (rawPrice || 'Custom'),
        originalAmount: monthlyRate > 0 && discountedMonthly !== monthlyRate ? `₹${monthlyRate.toLocaleString('en-IN')}` : null,
        period: '/ mo',
        subtext: discountedAnnual > 0
          ? `₹${discountedAnnual.toLocaleString('en-IN')} / yr billed annually (Save ₹${savings.toLocaleString('en-IN')})`
          : (tier.billingCycle || 'Annual License'),
        saveBadge: '20% OFF',
        seats: `${seats} concurrent seats`
      };
    }

    // Monthly breakdown of the contract
    return {
      mainAmount: monthlyRate > 0 ? `₹${monthlyRate.toLocaleString('en-IN')}` : (rawPrice || 'Custom'),
      originalAmount: null,
      period: '/ mo',
      subtext: `Standard monthly rate (${rawPrice || `₹${annualTotal.toLocaleString('en-IN')} / yr`})`,
      saveBadge: null,
      seats: `${seats} concurrent seats`
    };
  };

  const getIndividualPrice = (plan) => {
    // In Firestore, price is stored directly as configured by SuperAdmin (e.g. 'Open', '₹2,400 / mo', '₹4,100 / mo')
    const rawPrice = plan.price || '';
    if (rawPrice === 'Open' || rawPrice === 'Free' || !rawPrice.includes('₹')) {
      return {
        mainAmount: rawPrice || 'Free',
        originalAmount: null,
        period: 'forever',
        subtext: 'Open community curriculum',
        saveBadge: null
      };
    }

    const rawDigits = rawPrice.replace(/[^\d]/g, '');
    const amount = rawDigits ? parseInt(rawDigits, 10) : 0;
    const isYearlyInput = rawPrice.toLowerCase().includes('/ yr') || rawPrice.toLowerCase().includes('/yr');
    const baseMonthly = isYearlyInput ? Math.round(amount / 12) : amount;

    if (billingCycle === 'annual') {
      // 20% discount on yearly commitment
      const discountedMonthly = Math.round(baseMonthly * 0.8);
      const totalYearly = discountedMonthly * 12;
      const totalSavings = (baseMonthly * 12) - totalYearly;

      return {
        mainAmount: `₹${discountedMonthly.toLocaleString('en-IN')}`,
        originalAmount: `₹${baseMonthly.toLocaleString('en-IN')}`,
        period: '/ mo',
        subtext: `₹${totalYearly.toLocaleString('en-IN')} billed annually (Save ₹${totalSavings.toLocaleString('en-IN')})`,
        saveBadge: '20% OFF'
      };
    }

    // Monthly plan without annual contract commitment
    return {
      mainAmount: `₹${baseMonthly.toLocaleString('en-IN')}`,
      originalAmount: null,
      period: '/ mo',
      subtext: 'Billed monthly, cancel anytime',
      saveBadge: null
    };
  };

  return (
    <div className="min-h-screen bg-[#f6f3eb] text-[#203247] font-space-grotesk selection:bg-[#347f7a] selection:text-[#f6f3eb]">
      {/* MINIMAL NAVBAR */}
      <nav className="border-b border-[#203247]/10 bg-[#f6f3eb]/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1240px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('hub')}
              className="font-space-grotesk text-lg font-bold tracking-tight text-[#203247] bg-transparent border-none cursor-pointer p-0 flex items-center group"
            >
              <SignalSchoolLogo size={26} animated idPrefix="pricing-nav-logo" className="mr-1.5 transition-transform group-hover:scale-105" />
              <span>signal<span className="text-[#347f7a] font-normal">school</span></span>
            </button>

            <span className="hidden sm:inline-block w-px h-4 bg-[#203247]/15" />

            <button
              onClick={() => setActiveTab('hub')}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-[#647895] hover:text-[#203247] transition-colors bg-transparent border-none cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back to overview</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => setActiveTab('hub')}
                className="bg-[#203247] hover:bg-[#347f7a] text-[#f6f3eb] rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer border-none"
              >
                Open Workspace
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="border border-[#203247]/20 hover:border-[#203247] text-[#203247] rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer bg-transparent"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* EDITORIAL HERO HEADER (NO SUBTITLE) */}
      <header className="pt-16 pb-8 px-6 text-center max-w-3xl mx-auto">
        <p className="flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#347f7a] font-semibold mb-4 transition-all duration-300">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f09a7d]" />
          <span>{headerContent.kicker}</span>
        </p>

        <h1
          key={audienceTab + '-title'}
          className="font-display text-4xl sm:text-6xl lg:text-[4.25rem] font-bold tracking-[-0.04em] leading-[0.98] text-[#203247] mb-7 animate-in fade-in duration-200"
        >
          {headerContent.titleMain}<br />
          <em className="italic font-normal text-[#347f7a]">{headerContent.titleAccent}</em>
        </h1>

        {/* AUDIENCE SELECTOR PILL */}
        <div className="inline-flex p-1 bg-[#e8e4d8] rounded-full border border-[#203247]/10">
          <button
            onClick={() => setAudienceTab('institutional')}
            className={`px-5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border-none ${
              audienceTab === 'institutional'
                ? 'bg-[#203247] text-[#f6f3eb] shadow-xs'
                : 'text-[#647895] hover:text-[#203247] bg-transparent'
            }`}
          >
            Institutions & Campuses
          </button>

          <button
            onClick={() => setAudienceTab('individual')}
            className={`px-5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border-none ${
              audienceTab === 'individual'
                ? 'bg-[#203247] text-[#f6f3eb] shadow-xs'
                : 'text-[#647895] hover:text-[#203247] bg-transparent'
            }`}
          >
            Individual Learners
          </button>
        </div>

        {/* BILLING TOGGLE */}
        <div className="mt-5 flex items-center justify-center gap-3 text-xs text-[#647895]">
          <span
            onClick={() => setBillingCycle('monthly')}
            className={`cursor-pointer transition-colors ${
              billingCycle === 'monthly' ? 'text-[#203247] font-semibold' : 'hover:text-[#203247]'
            }`}
          >
            Monthly billing
          </span>

          <button
            type="button"
            role="switch"
            aria-checked={billingCycle === 'annual'}
            onClick={() => setBillingCycle(prev => prev === 'annual' ? 'monthly' : 'annual')}
            className="w-10 h-5 bg-[#203247] rounded-full p-0.5 transition-colors cursor-pointer border-none relative flex items-center"
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                billingCycle === 'annual' ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>

          <span
            onClick={() => setBillingCycle('annual')}
            className={`cursor-pointer transition-colors flex items-center gap-1.5 ${
              billingCycle === 'annual' ? 'text-[#203247] font-semibold' : 'hover:text-[#203247]'
            }`}
          >
            <span>Annual billing</span>
            <span className="text-[10px] font-mono text-[#347f7a] font-semibold">
              — save 20%
            </span>
          </span>
        </div>
      </header>

      {/* MINIMAL CARDS GRID MATCHING FIRESTORE DATA */}
      <main className="max-w-[1160px] mx-auto px-6 pb-20">
        {audienceTab === 'institutional' ? (
          /* INSTITUTIONAL TIERS FROM FIRESTORE */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contractTiers.map((tier, idx) => {
              const pricing = getInstitutionalPrice(tier);
              const isFeatured = tier.badge === 'Flagship Campus' || idx === 1;

              return (
                <div
                  key={tier.id || tier.name}
                  className={`rounded-2xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 border ${
                    isFeatured
                      ? 'bg-[#203247] text-[#f6f3eb] border-[#203247] shadow-xl md:-translate-y-1.5 ring-1 ring-[#347f7a]/40'
                      : 'bg-white text-[#203247] border-[#203247]/10 shadow-xs hover:border-[#203247]/25 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                    <div>
                    {/* Badge & Title */}
                    <div className="mb-3">
                      {tier.badge && (
                        <div className="mb-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold ${
                              isFeatured
                                ? 'bg-white/10 text-[#f7bd65] border border-[#f7bd65]/30'
                                : 'bg-[#203247]/5 text-[#347f7a] border border-[#347f7a]/20'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isFeatured ? 'bg-[#f7bd65]' : 'bg-[#347f7a]'}`} />
                            <span>{tier.badge}</span>
                          </span>
                        </div>
                      )}
                      <h3 className="font-display text-2xl font-bold tracking-tight">
                        {tier.name}
                      </h3>
                    </div>

                    <p className={`text-xs leading-relaxed mb-4 min-h-[36px] ${
                      isFeatured ? 'text-[#f6f3eb]/75' : 'text-[#526b88]'
                    }`}>
                      {tier.description}
                    </p>

                    {/* Seat capsule */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-mono font-medium mb-5 ${
                      isFeatured
                        ? 'bg-white/10 text-[#f6f3eb]'
                        : 'bg-[#203247]/5 text-[#203247]'
                    }`}>
                      <span className="font-semibold">{tier.defaultSeats} concurrent seats</span>
                      <span className="opacity-30">•</span>
                      <span className="opacity-75">pooled quota</span>
                    </div>

                    {/* Price from Firestore */}
                    <div className="mb-6 pb-6 border-b border-current/10">
                      <div className="flex items-baseline gap-2">
                        {pricing.originalAmount && (
                          <span className={`text-sm line-through font-medium ${
                            isFeatured ? 'text-[#f6f3eb]/40' : 'text-[#647895]/50'
                          }`}>
                            {pricing.originalAmount}
                          </span>
                        )}
                        <span className="font-display text-3xl font-bold tracking-tight">
                          {pricing.mainAmount}
                        </span>
                        <span className={`text-xs ${isFeatured ? 'text-[#f6f3eb]/70' : 'text-[#647895]'}`}>
                          {pricing.period}
                        </span>
                        {pricing.saveBadge && (
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            isFeatured ? 'bg-amber-400/20 text-[#f7bd65]' : 'bg-[#d9e8df] text-[#347f7a]'
                          }`}>
                            {pricing.saveBadge}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] font-mono mt-1 ${
                        isFeatured ? 'text-[#f7bd65]' : 'text-[#347f7a]'
                      }`}>
                        {pricing.subtext}
                      </p>
                    </div>

                    {/* Features from Firestore */}
                    <div className="space-y-2.5 mb-8">
                      <p className={`text-[10px] font-mono tracking-wider uppercase font-semibold ${
                        isFeatured ? 'text-[#f6f3eb]/60' : 'text-[#647895]'
                      }`}>
                        {pricing.seats}:
                      </p>
                      {(tier.features || []).map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-xs">
                          <Check
                            size={14}
                            strokeWidth={2.5}
                            className={`shrink-0 mt-0.5 ${
                              isFeatured ? 'text-[#f7bd65]' : 'text-[#347f7a]'
                            }`}
                          />
                          <span className={isFeatured ? 'text-[#f6f3eb]/90' : 'text-[#203247]'}>
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Button */}
                  <div>
                    <a
                      href={`mailto:admissions@signalschool.io?subject=Inquiry:%20${encodeURIComponent(tier.name)}&body=Hello%20SignalSchool%20Team,%0D%0A%0D%0AWe%20are%20inquiring%20about%20the%20${encodeURIComponent(tier.name)}%20(${tier.defaultSeats}%20seats)%20for%20our%20institution.%0D%0A%0D%0AInstitution%20Name:%20%0D%0AContact%20Name:%20%0D%0ADepartment:%20`}
                      className={`w-full py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors no-underline cursor-pointer ${
                        isFeatured
                          ? 'bg-[#f7bd65] hover:bg-[#f5aa42] text-[#203247]'
                          : 'bg-[#203247] hover:bg-[#347f7a] text-[#f6f3eb]'
                      }`}
                    >
                      <span>Inquire about {tier.name.split(' ')[0]}</span>
                      <ArrowRight size={13} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* INDIVIDUAL TIERS FROM FIRESTORE */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {individualPlans.map((plan, idx) => {
              const pricing = getIndividualPrice(plan);
              const isFeatured = plan.id === 'Individual Pro Plan' || idx === 1;

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 border ${
                    isFeatured
                      ? 'bg-[#203247] text-[#f6f3eb] border-[#203247] shadow-xl md:-translate-y-1.5 ring-1 ring-[#347f7a]/40'
                      : 'bg-white text-[#203247] border-[#203247]/10 shadow-xs hover:border-[#203247]/25 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  <div>
                    {/* Badge & Title */}
                    <div className="mb-3">
                      {isFeatured ? (
                        <div className="mb-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold bg-white/10 text-[#f7bd65] border border-[#f7bd65]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f7bd65]" />
                            <span>Recommended</span>
                          </span>
                        </div>
                      ) : (
                        <div className="mb-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold bg-[#203247]/5 text-[#647895] border border-[#203247]/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#647895]" />
                            <span>1 Learner Pass</span>
                          </span>
                        </div>
                      )}
                      <h3 className="font-display text-2xl font-bold tracking-tight">
                        {plan.name}
                      </h3>
                    </div>

                    <p className={`text-xs leading-relaxed mb-4 min-h-[36px] ${
                      isFeatured ? 'text-[#f6f3eb]/75' : 'text-[#526b88]'
                    }`}>
                      {plan.description}
                    </p>

                    {/* Learner capsule */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-mono font-medium mb-5 ${
                      isFeatured
                        ? 'bg-white/10 text-[#f6f3eb]'
                        : 'bg-[#203247]/5 text-[#203247]'
                    }`}>
                      <span className="font-semibold">{plan.seats || 1} learner pass</span>
                      <span className="opacity-30">•</span>
                      <span className="opacity-75">personal sandbox</span>
                    </div>

                    {/* Price */}
                    <div className="mb-6 pb-6 border-b border-current/10">
                      <div className="flex items-baseline gap-2">
                        {pricing.originalAmount && (
                          <span className={`text-sm line-through font-medium ${
                            isFeatured ? 'text-[#f6f3eb]/40' : 'text-[#647895]/50'
                          }`}>
                            {pricing.originalAmount}
                          </span>
                        )}
                        <span className="font-display text-3xl font-bold tracking-tight">
                          {pricing.mainAmount}
                        </span>
                        <span className={`text-xs ${isFeatured ? 'text-[#f6f3eb]/70' : 'text-[#647895]'}`}>
                          {pricing.period}
                        </span>
                        {pricing.saveBadge && (
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            isFeatured ? 'bg-amber-400/20 text-[#f7bd65]' : 'bg-[#d9e8df] text-[#347f7a]'
                          }`}>
                            {pricing.saveBadge}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] font-mono mt-1 ${
                        isFeatured ? 'text-[#f7bd65]' : 'text-[#347f7a]'
                      }`}>
                        {pricing.subtext}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-2.5 mb-8">
                      <p className={`text-[10px] font-mono tracking-wider uppercase font-semibold ${
                        isFeatured ? 'text-[#f6f3eb]/60' : 'text-[#647895]'
                      }`}>
                        Includes:
                      </p>
                      {(plan.features || []).map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-xs">
                          <Check
                            size={14}
                            strokeWidth={2.5}
                            className={`shrink-0 mt-0.5 ${
                              isFeatured ? 'text-[#f7bd65]' : 'text-[#347f7a]'
                            }`}
                          />
                          <span className={isFeatured ? 'text-[#f6f3eb]/90' : 'text-[#203247]'}>
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Button */}
                  <div>
                    <button
                      onClick={() => setActiveTab('login')}
                      className={`w-full py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-none ${
                        isFeatured
                          ? 'bg-[#f7bd65] hover:bg-[#f5aa42] text-[#203247]'
                          : 'bg-[#203247] hover:bg-[#347f7a] text-[#f6f3eb]'
                      }`}
                    >
                      <span>{plan.price === 'Open' ? 'Get Started Free' : 'Choose Plan'}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MINIMAL CAPABILITIES STRIP */}
        <div className="mt-14 py-5 border-y border-[#203247]/10 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono tracking-wider uppercase text-[#647895]">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#347f7a]" />
            Real-time FPGA & logic simulation
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#347f7a]" />
            Verilog & Netlist synthesis export
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#347f7a]" />
            Zero client installation required
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#347f7a]" />
            Instant seat recycling & restoration
          </span>
        </div>
      </main>

      {/* LIGHT THEME FOOTER MATCHING OTHER PAGES */}
      <footer className="bg-[#f6f3eb] border-t border-[#203247]/10 py-7 sm:py-9 px-5 sm:px-8 text-[#526b88] text-xs">
        <div className="max-w-[1160px] mx-auto space-y-4">
          {/* Top row: Logo on left, Top button on right */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveTab('hub')}
              className="font-space-grotesk text-lg font-bold tracking-tight text-[#203247] bg-transparent border-none cursor-pointer p-0 flex items-center gap-1.5 group"
            >
              <SignalSchoolLogo size={22} idPrefix="pricing-footer-logo" />
              <span>signal<span className="text-[#347f7a] font-normal">school</span></span>
            </button>

            <button
              onClick={handleScrollToTop}
              className="hover:text-[#203247] text-[#526b88] transition-colors bg-transparent border-none cursor-pointer p-0 text-xs font-medium inline-flex items-center gap-1"
            >
              <span>Top</span>
              <ArrowUp size={12} />
            </button>
          </div>

          {/* Bottom row: Description on left, links on right */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs leading-relaxed text-[#526b88] max-w-xs m-0">
              A small, curious corner of the internet for understanding how computers think.
            </p>

            <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs text-[#526b88]">
              <button
                onClick={() => setActiveTab('hub')}
                className="hover:text-[#203247] transition-colors bg-transparent border-none cursor-pointer p-0 text-xs font-medium"
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('labs')}
                className="hover:text-[#203247] transition-colors bg-transparent border-none cursor-pointer p-0 text-xs font-medium"
              >
                Labs
              </button>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#526b88]/70 font-medium">
                MADE FOR CURIOUS MINDS
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
