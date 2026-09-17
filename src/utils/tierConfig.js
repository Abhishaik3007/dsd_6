export const STORAGE_KEY_CONTRACT_TIERS = 'signalschool_contract_tiers';

export const DEFAULT_CONTRACT_TIERS = [
  {
    id: 'Department Lab Pack',
    name: 'Department Lab Pack',
    badge: 'Departmental Lab',
    defaultSeats: 100,
    priceEstimate: '₹4,10,000 / yr',
    billingCycle: 'Annual License',
    description: 'Targeted deployment for specialized hardware laboratories, introductory logic courses, and dedicated faculty research pods.',
    features: [
      '100 Concurrent Student Seats',
      'Real-Time Digital Simulator & Waveforms',
      'Faculty Lab Assignment Designer',
      'Domain Verification & QR Onboarding Pass',
      'Standard Campus Support'
    ],
    iconName: 'Users'
  },
  {
    id: 'Campus Enterprise Pack',
    name: 'Campus Enterprise Pack',
    badge: 'Flagship Campus',
    defaultSeats: 300,
    priceEstimate: '₹10,40,000 / yr',
    billingCycle: 'Annual License',
    description: 'Full campus-wide deployment across electrical engineering, computer science, and robotics faculties with central administrator controls.',
    features: [
      '300 Concurrent Student Seats',
      'Campus Domain SSO & Instant Pass Portal',
      'Unlimited Digital Lab Quotas & Sandboxes',
      'Automated Roster Provisioning & Export',
      'Priority Academic Support & Telemetry'
    ],
    iconName: 'Layers'
  },
  {
    id: 'University Network Pack',
    name: 'University Network Pack',
    badge: 'Consortium License',
    defaultSeats: 1000,
    priceEstimate: '₹23,30,000 / yr',
    billingCycle: 'Multi-Year Consortium',
    description: 'Multi-campus university system and state educational network license with custom cluster routing and dedicated solutions architect.',
    features: [
      '1,000 Concurrent Student Seats',
      'Multi-Campus Cross-Enrollment Sandboxes',
      'Custom Domain Whitelisting & Admin Roster',
      'Sub-Department Quota Partitioning',
      'Dedicated Solutions Architect & 99.9% SLA'
    ],
    iconName: 'Sparkles'
  }
];

export const INDIVIDUAL_PLANS = [
  {
    id: 'Community Pass',
    name: 'Community Pass',
    price: 'Open',
    seats: 1,
    description: 'Open-access educational curriculum pass for self-paced digital learners.',
    features: ['Interactive Logic Tutorials', 'Community Schematics Browser']
  },
  {
    id: 'Individual Pro Plan',
    name: 'Individual Pro Plan',
    price: '₹2,400 / mo',
    seats: 1,
    description: 'Advanced digital simulation for independent engineers, students, and hobbyists.',
    features: ['Full Simulator Sandbox', 'Netlist & Verilog Export', 'Cloud Workspace Sync']
  },
  {
    id: 'Researcher Pro Pass',
    name: 'Researcher Pro Pass',
    price: '₹4,100 / mo',
    seats: 1,
    description: 'High-precision simulation telemetry and raw waveform analysis for academic researchers.',
    features: ['Raw Telemetry Stream', 'High-Frequency Trace Analyzer', 'Unlimited Cloud Projects']
  }
];

export const parsePriceValue = (item) => {
  if (!item) return 0;
  const priceStr = typeof item === 'object' ? (item.priceEstimate || item.price || '') : String(item);
  const str = String(priceStr).toLowerCase().trim();
  if (str === 'open' || str === 'free' || str.includes('₹0')) return 0;
  const digits = str.replace(/[^\d]/g, '');
  return digits ? parseInt(digits, 10) : 0;
};

export const sortByPriceLowToHigh = (list) => {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => parsePriceValue(a) - parsePriceValue(b));
};

export const getStoredContractTiers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONTRACT_TIERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read contract tiers from localStorage:', err);
  }
  return DEFAULT_CONTRACT_TIERS;
};

export const saveStoredContractTiers = (tiers) => {
  try {
    localStorage.setItem(STORAGE_KEY_CONTRACT_TIERS, JSON.stringify(tiers));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('signalschool_tiers_updated', { detail: tiers }));
    }
  } catch (err) {
    console.warn('Could not save contract tiers to localStorage:', err);
  }
};
