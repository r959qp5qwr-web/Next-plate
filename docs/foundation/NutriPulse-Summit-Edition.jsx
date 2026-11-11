import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Flame,
  Utensils,
  MessageSquare,
  PieChart,
  RefreshCw,
  Sliders,
  Check,
  ChevronRight,
  Clock,
  Zap,
  Heart,
  ShieldCheck,
  Send,
  Camera,
  Compass,
  ArrowRight,
  Plus,
  Minus,
  Smartphone,
  Layout,
  Moon,
  Leaf,
  Dumbbell,
  Mountain,
  CheckCircle2,
  ChefHat,
  Store,
  Activity,
  Brain,
  Droplets,
  AlertTriangle,
  TrendingDown,
  Award,
  Pill,
  Coffee,
  Footprints,
  Layers,
  Eye,
  Wand2,
  Scale,
  Timer
} from 'lucide-react';

// ============================================================================
// 1. LIVE BIOMETRIC & PHYSIOLOGICAL STATE PRESETS (THE "ZERO-INPUT" BRAIN)
// ============================================================================
const BIO_MODES = [
  {
    id: 'hypertrophy',
    name: 'Post-Strength & Hypertrophy',
    shortLabel: 'Strength & mTOR',
    icon: Dumbbell,
    accent: '#2A6F4E',
    badgeBg: 'bg-emerald-900/10 text-emerald-900 border-emerald-800/20',
    hrvScore: '86% Ready',
    glycogenTank: '38% (Depleted)',
    hydration: 'Optimal (+450mg Na)',
    targetKcal: 2480,
    mealKcalTarget: 640,
    proteinTarget: 48,
    leucineTarget: 3.4,
    maxGlucoseDelta: 32,
    clinicalFocus: 'Maximize myofibrillar protein synthesis via >3.2g Leucine threshold + rapid muscle glycogen resynthesis.',
    defaultPortions: { protein: 42, greens: 23, carbs: 25, fats: 10 }
  },
  {
    id: 'trek',
    name: 'High-Altitude Trek & Endurance',
    shortLabel: 'Altitude & Stamina',
    icon: Mountain,
    accent: '#D95D39',
    badgeBg: 'bg-orange-900/10 text-orange-900 border-orange-800/20',
    hrvScore: '78% Strained',
    glycogenTank: '22% (Critical)',
    hydration: 'Needs +800mg Electrolytes',
    targetKcal: 3150,
    mealKcalTarget: 780,
    proteinTarget: 42,
    leucineTarget: 3.0,
    maxGlucoseDelta: 38,
    clinicalFocus: 'Sustained dual-pathway carbohydrate oxidation, anti-inflammatory EPA/DHA omega-3s, and tendon collagen matrix support.',
    defaultPortions: { protein: 32, greens: 23, carbs: 35, fats: 10 }
  },
  {
    id: 'focus',
    name: 'Deep Focus & Flat-Glucose Workday',
    shortLabel: 'Cognitive Focus',
    icon: Brain,
    accent: '#2563EB',
    badgeBg: 'bg-blue-900/10 text-blue-900 border-blue-800/20',
    hrvScore: '91% Prime',
    glycogenTank: '74% (Steady)',
    hydration: 'Optimal',
    targetKcal: 2050,
    mealKcalTarget: 510,
    proteinTarget: 38,
    leucineTarget: 2.7,
    maxGlucoseDelta: 18,
    clinicalFocus: 'Keep post-meal glucose excursion under +18 mg/dL to prevent orexin suppression and afternoon cognitive fog.',
    defaultPortions: { protein: 36, greens: 40, carbs: 12, fats: 12 }
  },
  {
    id: 'gutrest',
    name: 'Gut Rest & Circadian Wind-Down',
    shortLabel: 'Circadian Gut Rest',
    icon: Moon,
    accent: '#6366F1',
    badgeBg: 'bg-indigo-900/10 text-indigo-900 border-indigo-800/20',
    hrvScore: '82% Recovering',
    glycogenTank: '68% (Replete)',
    hydration: 'Balanced',
    targetKcal: 1920,
    mealKcalTarget: 470,
    proteinTarget: 34,
    leucineTarget: 2.5,
    maxGlucoseDelta: 22,
    clinicalFocus: 'Early gastric emptying before melatonin onset, prebiotic butyrate synthesis, and tryptophan-magnesium sleep synergy.',
    defaultPortions: { protein: 34, greens: 42, carbs: 14, fats: 10 }
  }
];

// ============================================================================
// 2. CURATED CLINICAL MEALS WITH 1-TAP CULINARY ALCHEMY MUTATIONS
// ============================================================================
const CURATED_MEALS = [
  {
    id: 'mangalore-fish',
    title: 'Mangalorean Wild Rawas (Indian Salmon) & Red Matta Rice',
    subtitle: 'Simmered in toasted coriander-kokum broth with garlic-tossed moringa greens',
    cuisine: 'Coastal Indian Clinical',
    prepTime: '16 mins',
    baseKcal: 575,
    baseMacros: { protein: 44, fiber: 11, carbs: 46, fats: 21, leucine: 3.5 },
    baseGlucoseSpike: 21,
    satietyHours: 4.6,
    palette: ['#D95D39', '#2A6F4E', '#C89D54', '#E2B857'],
    synergies: [
      { pair: 'Kokum + Marine Omega-3 (2.4g)', effect: 'Accelerates gastric emptying while lowering post-training IL-6 inflammation.' },
      { pair: 'Moringa Iron + Lemon Vitamin C', effect: 'Increases non-heme iron absorption by 3.2x for high-altitude oxygen transport.' }
    ],
    alchemy: {
      protein: {
        label: '+15g Protein Boost',
        titleSuffix: ' + Seared Prawn & Egg-White Tadka',
        deltaKcal: 75,
        deltaProtein: 16,
        deltaFiber: 1,
        deltaCarbs: -2,
        deltaFats: 1,
        deltaSpike: -3,
        note: 'Added 75g wild tiger prawns tossed in curry-leaf tadka, pushing Leucine to 4.6g.'
      },
      glucose: {
        label: 'Flatten Glucose (-42% Spike)',
        titleSuffix: ' (Cauliflower-Matta 50/50 Blend)',
        deltaKcal: -65,
        deltaProtein: 2,
        deltaFiber: 5,
        deltaCarbs: -19,
        deltaFats: 1,
        deltaSpike: -9,
        note: 'Folded riced roasted cauliflower into Kerala Matta rice with 1 tsp apple cider vinegar starter.'
      },
      express: {
        label: '10-Min Pan-Seared Express',
        titleSuffix: ' (10-Min Skillet Sear)',
        deltaKcal: -20,
        deltaProtein: 0,
        deltaFiber: 0,
        deltaCarbs: 0,
        deltaFats: -2,
        deltaSpike: 0,
        note: 'Swapped slow-simmered gravy for dry spice-rubbed pan sear + pre-steamed red rice pouch.'
      },
      gut: {
        label: 'Gut-Soothing Fermented Swap',
        titleSuffix: ' + Probiotic Sol Kadhi Broth',
        deltaKcal: -15,
        deltaProtein: 1,
        deltaFiber: 3,
        deltaCarbs: -4,
        deltaFats: 0,
        deltaSpike: -4,
        note: 'Replaced chili-heavy masala with cooling coconut-kokum Sol Kadhi rich in digestive polyphenols.'
      }
    }
  },
  {
    id: 'pahadi-paneer',
    title: 'Charred Pahadi Paneer Tikka & Foxtail Millet Khichdi',
    subtitle: 'Infused with Himalayan jakhiya seeds, sautéed palak & walnut-mint probiotic chutney',
    cuisine: 'North Indian Mountain Recovery',
    prepTime: '18 mins',
    baseKcal: 560,
    baseMacros: { protein: 38, fiber: 14, carbs: 44, fats: 23, leucine: 3.3 },
    baseGlucoseSpike: 19,
    satietyHours: 4.8,
    palette: ['#E07A5F', '#1F4E3D', '#D4A373', '#528265'],
    synergies: [
      { pair: 'Turmeric Curcumin + Black Pepper Piperine', effect: 'Boosts curcumin bioavailability by 2000% for joint & muscle recovery.' },
      { pair: 'Foxtail Millet + Roasted Walnut ALA', effect: 'Slow-digesting resistant starch paired with brain-protective alpha-linolenic acid.' }
    ],
    alchemy: {
      protein: {
        label: '+15g Protein Boost',
        titleSuffix: ' + Whey-Hung Curd & Hemp Seed Crust',
        deltaKcal: 80,
        deltaProtein: 15,
        deltaFiber: 2,
        deltaCarbs: 1,
        deltaFats: 2,
        deltaSpike: -2,
        note: 'Marinated paneer in high-protein Greek hung curd + 2 tbsp shelled hemp hearts.'
      },
      glucose: {
        label: 'Flatten Glucose (-45% Spike)',
        titleSuffix: ' (Sprouted Moong & Millet Matrix)',
        deltaKcal: -45,
        deltaProtein: 4,
        deltaFiber: 6,
        deltaCarbs: -16,
        deltaFats: 0,
        deltaSpike: -8,
        note: 'Increased sprouted green moong ratio to 60% to blunt postprandial insulin demand.'
      },
      express: {
        label: '10-Min Air-Fryer Express',
        titleSuffix: ' (10-Min Air-Fryer Bowl)',
        deltaKcal: -30,
        deltaProtein: 0,
        deltaFiber: 0,
        deltaCarbs: 0,
        deltaFats: -3,
        deltaSpike: 0,
        note: 'Air-fried paneer cubes at 200°C for 7 mins over quick-pressure-cooked millet.'
      },
      gut: {
        label: 'Gut-Soothing Swap',
        titleSuffix: ' (A2 Chhena & Ginger-Ajwain Infusion)',
        deltaKcal: -25,
        deltaProtein: 0,
        deltaFiber: 2,
        deltaCarbs: -3,
        deltaFats: -2,
        deltaSpike: -3,
        note: 'Used fresh soft A2 cow chhena with roasted ajwain and grated ginger for zero bloating.'
      }
    }
  },
  {
    id: 'med-souvlaki',
    title: 'Rosemary Chicken Souvlaki & Warm Farro-Herb Tabbouleh',
    subtitle: 'Served over whipped sheep-feta tzatziki, charred lemon & Kalamata olive tapenade',
    cuisine: 'Mediterranean Longevity',
    prepTime: '15 mins',
    baseKcal: 545,
    baseMacros: { protein: 48, fiber: 12, carbs: 39, fats: 19, leucine: 3.9 },
    baseGlucoseSpike: 16,
    satietyHours: 4.9,
    palette: ['#2A6F4E', '#C85A32', '#E9C46A', '#386641'],
    synergies: [
      { pair: 'Rosemary Carnosic Acid + Grilled Poultry', effect: 'Neutralizes heterocyclic amines (HCAs) during high-heat grilling by up to 85%.' },
      { pair: 'Extra Virgin Olive Oil + Lycopene Greens', effect: 'Oleocanthal acts as a natural COX-2 inhibitor while increasing carotenoid uptake.' }
    ],
    alchemy: {
      protein: {
        label: '+15g Protein Boost',
        titleSuffix: ' + Double Skewer & Crispy Lupini Beans',
        deltaKcal: 70,
        deltaProtein: 16,
        deltaFiber: 3,
        deltaCarbs: 2,
        deltaFats: 1,
        deltaSpike: -2,
        note: 'Added extra pasture-raised tenderloin cubes and pickled Mediterranean lupini beans.'
      },
      glucose: {
        label: 'Flatten Glucose (-40% Spike)',
        titleSuffix: ' (Zero-Grain Arugula & Artichoke Bed)',
        deltaKcal: -70,
        deltaProtein: 1,
        deltaFiber: 4,
        deltaCarbs: -22,
        deltaFats: 2,
        deltaSpike: -7,
        note: 'Swapped half the farro for charred artichoke hearts and bitter baby arugula.'
      },
      express: {
        label: '10-Min Skillet Express',
        titleSuffix: ' (Pre-Marinated Tenderloin Strips)',
        deltaKcal: 0,
        deltaProtein: 0,
        deltaFiber: 0,
        deltaCarbs: 0,
        deltaFats: 0,
        deltaSpike: 0,
        note: 'Flash-seared thin chicken strips in 5 minutes with ready-tossed parsley tabbouleh.'
      },
      gut: {
        label: 'Gut-Soothing Swap',
        titleSuffix: ' (Garlic-Free Infused EVOO & Kefir Labneh)',
        deltaKcal: -10,
        deltaProtein: 2,
        deltaFiber: 1,
        deltaCarbs: -2,
        deltaFats: 0,
        deltaSpike: -2,
        note: 'Low-FODMAP garlic-infused olive oil + 24-hour fermented kefir tzatziki for effortless digestion.'
      }
    }
  }
];

// ============================================================================
// 3. DELIVERY & DINING OUT "MENU DECONSTRUCTOR" (REAL-WORLD RESCUE MODE)
// ============================================================================
const DELIVERY_DISHES = [
  {
    id: 'andhra-biryani',
    name: 'Andhra-Style Spicy Mutton Biryani',
    restaurantType: 'Regional Delivery / Cloud Kitchen',
    defaultPortion: 'Full Handi (650g)',
    baseKcal: 1120,
    baseProtein: 42,
    baseCarbs: 118,
    baseFats: 52,
    baseFiber: 4,
    baseSpike: 64, // High spike (+64 mg/dL)
    baseMatch: 54,
    warningTag: 'High Glycemic & Saturated Ghee Load',
    clinicalBreakdown: 'Polished aged basmati + rendered mutton fat creates a rapid dual-phase glucose and triglyceride elevation that delays nocturnal HRV recovery.',
    rescueHacks: [
      {
        id: 'raita-preload',
        title: 'Eat 1 Bowl Cucumber-Pudina Raita 10 Mins First',
        impactLabel: '-18 mg/dL Glucose • +6g Protein',
        deltaKcal: 65,
        deltaProtein: 6,
        deltaCarbs: 4,
        deltaFats: 2,
        deltaFiber: 3,
        deltaSpike: -18,
        deltaMatch: 14
      },
      {
        id: 'rice-swap',
        title: 'Partition 40% Rice Away • Keep All Mutton Pieces',
        impactLabel: '-310 kcal • -46g Refined Carbs',
        deltaKcal: -310,
        deltaProtein: 0,
        deltaCarbs: -46,
        deltaFats: -11,
        deltaFiber: 0,
        deltaSpike: -21,
        deltaMatch: 16
      },
      {
        id: 'psyllium-shield',
        title: 'Pre-Meal 5g Psyllium Husk / Chia Lemon Water',
        impactLabel: '+5g Viscous Fiber • Blunts Peak',
        deltaKcal: 15,
        deltaProtein: 0,
        deltaCarbs: 1,
        deltaFats: 0,
        deltaFiber: 5,
        deltaSpike: -11,
        deltaMatch: 8
      },
      {
        id: 'post-walk',
        title: '15-Min Brisk Post-Meal Stroll (GLUT4 Activation)',
        impactLabel: '-14 mg/dL Peak via Non-Insulin Uptake',
        deltaKcal: 0,
        deltaProtein: 0,
        deltaCarbs: 0,
        deltaFats: 0,
        deltaFiber: 0,
        deltaSpike: -14,
        deltaMatch: 8
      }
    ]
  },
  {
    id: 'mutton-rara',
    name: 'Pahadi Mutton Rara with 2 Butter Rotis',
    restaurantType: 'North Indian Bistro / Dhaba',
    defaultPortion: '350g Keema-piece Gravy + 2 Rotis',
    baseKcal: 980,
    baseProtein: 51,
    baseCarbs: 76,
    baseFats: 51,
    baseFiber: 7,
    baseSpike: 48,
    baseMatch: 64,
    warningTag: 'Heavy Rogan Oil & Sodium Load',
    clinicalBreakdown: 'Rich in bioavailable zinc, iron, and carnitine from slow-cooked goat meat, but surface rogan oil adds 240 empty lipid calories.',
    rescueHacks: [
      {
        id: 'spoon-rogan',
        title: 'Skim Top Rogan Oil Layer (2 Tbsp Saved)',
        impactLabel: '-210 kcal • -23g Oxidized Fat',
        deltaKcal: -210,
        deltaProtein: 0,
        deltaCarbs: 0,
        deltaFats: -23,
        deltaFiber: 0,
        deltaSpike: -4,
        deltaMatch: 14
      },
      {
        id: 'kachumber-first',
        title: 'Start with Vinegar-Pickled Onion & Kachumber Salad',
        impactLabel: '-14 mg/dL Spike • Acetic Acid Buffer',
        deltaKcal: 35,
        deltaProtein: 1,
        deltaCarbs: 6,
        deltaFats: 0,
        deltaFiber: 4,
        deltaSpike: -14,
        deltaMatch: 10
      },
      {
        id: 'roti-swap',
        title: 'Swap 1 Butter Roti for Roasted Papad + Extra Keema',
        impactLabel: '-115 kcal • +8g Protein',
        deltaKcal: -115,
        deltaProtein: 8,
        deltaCarbs: -24,
        deltaFats: -3,
        deltaFiber: 1,
        deltaSpike: -12,
        deltaMatch: 10
      }
    ]
  },
  {
    id: 'peri-chicken',
    name: 'Flame-Grilled Peri-Peri Half Chicken & Spicy Rice',
    restaurantType: 'High-Protein Casual Dining',
    defaultPortion: 'Half Bird + Regular Spicy Rice + Creamy Dip',
    baseKcal: 860,
    baseProtein: 64,
    baseCarbs: 68,
    baseFats: 36,
    baseFiber: 5,
    baseSpike: 39,
    baseMatch: 74,
    warningTag: 'Soybean-Oil Mayo Dip & Refined Rice',
    clinicalBreakdown: 'Phenomenal 64g complete protein base, only held back by omega-6 heavy perinaise dip and low-fiber white rice.',
    rescueHacks: [
      {
        id: 'ditch-mayo',
        title: 'Swap Perinaise Dip for Fresh Lime & Hot Chili Bastings',
        impactLabel: '-160 kcal • Zero Seed Oils',
        deltaKcal: -160,
        deltaProtein: 0,
        deltaCarbs: -2,
        deltaFats: -17,
        deltaFiber: 0,
        deltaSpike: -3,
        deltaMatch: 10
      },
      {
        id: 'charred-broc',
        title: 'Half Rice + Double Charred Broccoli & Corn Side',
        impactLabel: '+7g Fiber • -15 mg/dL Spike',
        deltaKcal: -75,
        deltaProtein: 3,
        deltaCarbs: -19,
        deltaFats: 0,
        deltaFiber: 7,
        deltaSpike: -15,
        deltaMatch: 12
      }
    ]
  },
  {
    id: 'tiramisu-cheat',
    name: 'Artisanal Mascarpone Tiramisu / Tres Leches',
    restaurantType: 'Celebration Dessert Cheat-Code',
    defaultPortion: '1 Bistro Slice (180g)',
    baseKcal: 540,
    baseProtein: 8,
    baseCarbs: 58,
    baseFats: 31,
    baseFiber: 1,
    baseSpike: 58,
    baseMatch: 48,
    warningTag: 'Naked Sucrose + Saturated Cream Spike',
    clinicalBreakdown: 'Eating dessert on an empty stomach triggers a sharp +58 mg/dL glucose excursion followed by reactive hypoglycemia.',
    rescueHacks: [
      {
        id: 'dessert-last',
        title: 'Eat Immediately After High-Protein/Fiber Main (Never Solo)',
        impactLabel: '-24 mg/dL Spike • Gastric Buffering',
        deltaKcal: 0,
        deltaProtein: 0,
        deltaCarbs: 0,
        deltaFats: 0,
        deltaFiber: 0,
        deltaSpike: -24,
        deltaMatch: 22
      },
      {
        id: 'share-half',
        title: '3-Bite Mindful Share Rule (50% Portion) + Espresso',
        impactLabel: '-270 kcal • Keeps Pleasure 100%',
        deltaKcal: -270,
        deltaProtein: -4,
        deltaCarbs: -29,
        deltaFats: -15,
        deltaFiber: 0,
        deltaSpike: -16,
        deltaMatch: 16
      },
      {
        id: 'soleus-pushups',
        title: '12-Min Walk or Seated Calf Soleus Raises Post-Meal',
        impactLabel: '-11 mg/dL Glucose Excursion',
        deltaKcal: 0,
        deltaProtein: 0,
        deltaCarbs: 0,
        deltaFats: 0,
        deltaFiber: 0,
        deltaSpike: -11,
        deltaMatch: 8
      }
    ]
  }
];

// ============================================================================
// 4. CIRCADIAN SUPPLEMENT & MICRONUTRIENT SYNERGY TIMELINE
// ============================================================================
const CIRCADIAN_STACK = [
  {
    id: 'morning-stack',
    window: '08:00 AM • Morning Primer',
    title: 'Hydrolyzed Marine Collagen (10g) + Vitamin C (250mg)',
    timingRule: '30–45 mins before morning resistance or trek loading',
    synergyNote: 'Vitamin C acts as an essential cofactor for prolyl hydroxylase, increasing tendon and cartilage collagen cross-linking by 2.4x.',
    conflictWarning: 'Avoid pairing with high-tannin black tea/coffee within 20 mins if also taking iron.'
  },
  {
    id: 'postworkout-stack',
    window: '01:30 PM • Post-Training Anabolic Window',
    title: 'Whey Isolate / Plant Peptopro + 5g Micronized Creatine + Protease Enzymes',
    timingRule: 'With carbohydrate-containing recovery meal',
    synergyNote: 'Insulin and sodium-dependent transporters co-shuttle creatine into skeletal muscle 35% more effectively alongside mixed meal carbs and protein.',
    conflictWarning: 'No conflict—digestive enzymes prevent post-shake bloat and accelerate leucine appearance in plasma.'
  },
  {
    id: 'dinner-lipid-stack',
    window: '08:00 PM • High-Bioavailability Dinner Window',
    title: 'Triglyceride Omega-3 EPA/DHA (2000mg) + Vitamin D3/K2 (MK-7)',
    timingRule: 'Take mid-meal with tonight’s 20g+ healthy fat dinner',
    synergyNote: 'Bile acid and pancreatic lipase secretion triggered by tonight’s fish/paneer/olive oil boosts fat-soluble D3/K2 and EPA/DHA absorption by 300%.',
    conflictWarning: 'Never take on an empty stomach (absorption drops by 68%).'
  },
  {
    id: 'sleep-stack',
    window: '09:30 PM • Parasympathetic Wind-Down',
    title: 'Triple Magnesium Complex (300mg Bisglycinate/Threonate/Malate)',
    timingRule: '60 mins post-dinner • 45 mins before lights out',
    synergyNote: 'Synergizes with evening dietary tryptophan from millet/seeds to upregulate GABAergic tone, lower nocturnal heart rate by ~4 bpm, and deepen Slow-Wave Sleep.',
    conflictWarning: 'Space apart from high-dose Calcium (>500mg) or Iron supplements to avoid divalent cation transporter competition.'
  }
];

// ============================================================================
// 5. INSTANT DIETITIAN TRIAGE PROMPTS
// ============================================================================
const TRIAGE_CHIPS = [
  {
    id: 'chaat',
    label: 'Craving spicy North Indian chaat at 6 PM',
    question: "I'm craving spicy North Indian chaat at 6 PM. How do I satisfy it without ruining dinner or spiking glucose?",
    answer: {
      headline: 'The High-Protein Sprouted Kala Chana & Dahi Chaat Protocol',
      rationale: 'Cravings at 6 PM are usually driven by a dip in afternoon blood glucose and dopamine. Instead of refined maida papdi, use roasted makhana and sprouted kala chana as the crunch vehicle.',
      prescription: '1 cup boiled Kala Chana + 100g thick Greek Hung Curd + Tamarind-Date Chutney (1 tsp) + Mint-Coriander Chutney + Pomegranate + Roasted Jeera & Chaat Masala.',
      metrics: '295 kcal • 19g Protein • 9g Prebiotic Fiber • +11 mg/dL Flat Glucose Curve'
    }
  },
  {
    id: 'legday',
    label: 'Post-leg-day 50g protein dinner',
    question: 'Just crushed a heavy leg session. Give me a 50g protein dinner that supports joint recovery and deep sleep.',
    answer: {
      headline: 'Double-Protein Malabar Fish/Chicken Tikka + Foxtail Millet & Bone/Miso Broth',
      rationale: 'Lower-body eccentric loading creates high structural micro-trauma. You need >3.5g Leucine to trigger mTOR plus glycine/proline for connective tissue repair.',
      prescription: '180g Tandoori Chicken Tikka (or 200g Grilled Rawas/Paneer) + 1 cup Foxtail Millet Khichdi + Warm Ginger-Turmeric Broth + 300mg Magnesium post-meal.',
      metrics: '615 kcal • 52g Protein (4.4g Leucine) • 12g Fiber • 96% Overnight HRV Recovery Match'
    }
  },
  {
    id: 'trail',
    label: 'Packable trail nutrition for a 14km mountain ascent',
    question: 'Planning a 14km high-altitude mountain ascent tomorrow. What packable trail nutrition should I carry?',
    answer: {
      headline: 'Dual-Source Altitude Fueling & Cramp-Prevention Matrix',
      rationale: 'At altitude, basal glucose oxidation increases by 30% and respiratory water loss accelerates electrolyte depletion. Avoid heavy fats mid-climb that slow gastric emptying.',
      prescription: 'Every 60 mins: 1 Salted Medjool Date stuffed with Almond Butter + Roasted Sattu-Jaggery Electrolyte Drink (500mg Sodium) + 1 Pack Roasted Edamame/Chana.',
      metrics: '45g Dual-Pathway Carbs/hr • 850mg Sodium/L • Zero GI Distress'
    }
  }
];

export default function App() {
  // Global Workspace & Bio-Context State
  const [selectedBioMode, setSelectedBioMode] = useState(BIO_MODES[0]);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('studio'); // 'studio' (Bento All-in-One) | 'mobile' (Focused Pocket View)
  const [activeMobileScreen, setActiveMobileScreen] = useState('engine'); // 'engine' | 'twin' | 'deconstructor' | 'timeline'

  // Live Biometric Hunger / Craving Slider (1 to 10)
  const [hungerLevel, setHungerLevel] = useState(7);

  // Curated Meal Engine & Alchemy State
  const [selectedMealIdx, setSelectedMealIdx] = useState(0);
  const [activeAlchemyMods, setActiveAlchemyMods] = useState([]); // ['protein', 'glucose', 'express', 'gut']
  const [expandedSynergy, setExpandedSynergy] = useState(true);
  const [loggedMealIds, setLoggedMealIds] = useState([]);

  // Interactive SVG Plate & CGM Simulator State
  const [platePortions, setPlatePortions] = useState(BIO_MODES[0].defaultPortions);
  const [eatFiberFirst, setEatFiberFirst] = useState(true);
  const [postMealWalk, setPostMealWalk] = useState(false);
  const [acvStarter, setAcvStarter] = useState(false);

  // Delivery & Dining Out Menu Deconstructor State
  const [selectedDeliveryDish, setSelectedDeliveryDish] = useState(DELIVERY_DISHES[0]);
  const [enabledRescueHacks, setEnabledRescueHacks] = useState(['raita-preload', 'rice-swap']);

  // Circadian Supplement Check State
  const [checkedSupplements, setCheckedSupplements] = useState(['morning-stack', 'postworkout-stack']);

  // Conversational AI Triage State
  const [activeTriageResponse, setActiveTriageResponse] = useState(TRIAGE_CHIPS[0]);
  const [customPromptInput, setCustomPromptInput] = useState('');
  const [toastBanner, setToastBanner] = useState(null);

  const showToast = (msg) => {
    setToastBanner(msg);
    setTimeout(() => setToastBanner(null), 3200);
  };

  // Switch Physiological Mode & Synchronize Plate Defaults
  const handleSelectBioMode = (mode) => {
    setSelectedBioMode(mode);
    setPlatePortions(mode.defaultPortions);
    showToast(`Bio-Context Synced: ${mode.name}`);
  };

  // Toggle 1-Tap Culinary Alchemy Modifiers
  const toggleAlchemyMod = (modKey) => {
    setActiveAlchemyMods((prev) =>
      prev.includes(modKey) ? prev.filter((k) => k !== modKey) : [...prev, modKey]
    );
  };

  // Compute Active Curated Meal with Alchemy Mutations Applied
  const currentCuratedMeal = useMemo(() => {
    const base = CURATED_MEALS[selectedMealIdx % CURATED_MEALS.length];
    let kcal = base.baseKcal;
    let protein = base.baseMacros.protein;
    let fiber = base.baseMacros.fiber;
    let carbs = base.baseMacros.carbs;
    let fats = base.baseMacros.fats;
    let spike = base.baseGlucoseSpike;
    let titleMod = '';
    const activeNotes = [];

    activeAlchemyMods.forEach((modKey) => {
      const mod = base.alchemy[modKey];
      if (mod) {
        kcal += mod.deltaKcal;
        protein += mod.deltaProtein;
        fiber += mod.deltaFiber;
        carbs += mod.deltaCarbs;
        fats += mod.deltaFats;
        spike += mod.deltaSpike;
        titleMod += mod.titleSuffix;
        activeNotes.push(mod.note);
      }
    });

    const leucine = +(protein * 0.082).toFixed(1);
    const matchScore = Math.min(
      99,
      Math.max(
        82,
        92 +
          (protein >= selectedBioMode.proteinTarget ? 4 : 0) +
          (spike <= selectedBioMode.maxGlucoseDelta ? 3 : -4)
      )
    );

    return {
      ...base,
      computedTitle: `${base.title}${titleMod}`,
      kcal,
      protein,
      fiber,
      carbs: Math.max(8, carbs),
      fats: Math.max(8, fats),
      leucine,
      spike: Math.max(8, spike),
      matchScore,
      activeNotes
    };
  }, [selectedMealIdx, activeAlchemyMods, selectedBioMode]);

  // Compute Real-Time Plate Simulator & 2-Hour CGM Curve
  const twinTelemetry = useMemo(() => {
    const scaleFactor = 0.85 + hungerLevel * 0.03; // Scales gently with hunger slider
    const proteinGrams = Math.round(platePortions.protein * 1.25 * scaleFactor);
    const fiberGrams = Math.round((platePortions.greens * 0.34 + platePortions.carbs * 0.14) * scaleFactor);
    const carbGrams = Math.round((platePortions.carbs * 1.9 + platePortions.greens * 0.25) * scaleFactor);
    const fatGrams = Math.round(platePortions.fats * 1.85 * scaleFactor);
    const totalKcal = proteinGrams * 4 + carbGrams * 4 + fatGrams * 9;
    const leucineGrams = +(proteinGrams * 0.083).toFixed(1);

    // Baseline glucose excursion calculation (mg/dL above 88 baseline)
    let rawDelta = Math.round(
      carbGrams * 0.58 - fiberGrams * 1.05 - proteinGrams * 0.18 - fatGrams * 0.15
    );
    rawDelta = Math.max(10, rawDelta);

    if (eatFiberFirst) rawDelta = Math.round(rawDelta * 0.72); // -28% spike via food sequencing
    if (postMealWalk) rawDelta = Math.round(rawDelta * 0.78); // -22% via GLUT4 contraction
    if (acvStarter) rawDelta = Math.round(rawDelta * 0.86); // -14% via acetic acid disaccharidase inhibition

    const glucoseDelta = Math.max(8, rawDelta);
    const peakMgDl = 88 + glucoseDelta;

    // Unmitigated curve (eating carbs first without interventions) for visual comparison
    const unmitigatedPeak = 88 + Math.max(24, Math.round(carbGrams * 0.68));

    // Satiety horizon (hours)
    const satietyHours = Math.min(
      6.0,
      +(2.6 + proteinGrams * 0.035 + fiberGrams * 0.08 + fatGrams * 0.025).toFixed(1)
    );

    // Generate SVG polyline points for 0 to 120 mins (X: 0..320, Y: 130..15)
    const mapMgToY = (mg) => Math.max(14, Math.min(132, 132 - ((mg - 75) / 95) * 115));

    const pointsMitigated = [
      [0, mapMgToY(88)],
      [40, mapMgToY(88 + glucoseDelta * 0.45)],
      [85, mapMgToY(peakMgDl)],
      [140, mapMgToY(88 + glucoseDelta * 0.72)],
      [210, mapMgToY(88 + glucoseDelta * 0.35)],
      [275, mapMgToY(91)],
      [320, mapMgToY(88)]
    ];

    const pointsUnmitigated = [
      [0, mapMgToY(88)],
      [40, mapMgToY(88 + (unmitigatedPeak - 88) * 0.65)],
      [80, mapMgToY(unmitigatedPeak)],
      [135, mapMgToY(88 + (unmitigatedPeak - 88) * 0.5)],
      [205, mapMgToY(79)], // Slight reactive dip when unbuffered
      [275, mapMgToY(85)],
      [320, mapMgToY(88)]
    ];

    const toSvgPath = (pts) =>
      pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1].toFixed(1)}`).join(' ');

    return {
      proteinGrams,
      fiberGrams,
      carbGrams,
      fatGrams,
      totalKcal,
      leucineGrams,
      glucoseDelta,
      peakMgDl,
      unmitigatedPeak,
      satietyHours,
      mitigatedPath: toSvgPath(pointsMitigated),
      unmitigatedPath: toSvgPath(pointsUnmitigated),
      peakY: mapMgToY(peakMgDl),
      mTORTriggered: leucineGrams >= 3.0
    };
  }, [platePortions, hungerLevel, eatFiberFirst, postMealWalk, acvStarter]);

  // Adjust Plate Portion Quadrant with Automatic 100% Rebalancing
  const adjustQuadrant = (key, delta) => {
    setPlatePortions((prev) => {
      const nextVal = Math.max(8, Math.min(60, prev[key] + delta));
      const actualDiff = nextVal - prev[key];
      if (actualDiff === 0) return prev;

      const others = Object.keys(prev).filter((k) => k !== key);
      const updated = { ...prev, [key]: nextVal };
      let rem = actualDiff;
      others.forEach((k, i) => {
        const share = i === others.length - 1 ? rem : Math.round(actualDiff / others.length);
        updated[k] = Math.max(6, prev[k] - share);
        rem -= share;
      });
      const sum = Object.values(updated).reduce((a, b) => a + b, 0);
      if (sum !== 100) updated[others[0]] += 100 - sum;
      return updated;
    });
  };

  // Compute Delivery & Dining Out Deconstructor Stats
  const deconstructedStats = useMemo(() => {
    let kcal = selectedDeliveryDish.baseKcal;
    let protein = selectedDeliveryDish.baseProtein;
    let carbs = selectedDeliveryDish.baseCarbs;
    let fats = selectedDeliveryDish.baseFats;
    let fiber = selectedDeliveryDish.baseFiber;
    let spike = selectedDeliveryDish.baseSpike;
    let match = selectedDeliveryDish.baseMatch;

    selectedDeliveryDish.rescueHacks.forEach((hack) => {
      if (enabledRescueHacks.includes(hack.id)) {
        kcal += hack.deltaKcal;
        protein += hack.deltaProtein;
        carbs += hack.deltaCarbs;
        fats += hack.deltaFats;
        fiber += hack.deltaFiber;
        spike += hack.deltaSpike;
        match += hack.deltaMatch;
      }
    });

    return {
      kcal: Math.max(220, kcal),
      protein: Math.max(10, protein),
      carbs: Math.max(12, carbs),
      fats: Math.max(8, fats),
      fiber: Math.max(2, fiber),
      spike: Math.max(12, spike),
      match: Math.min(98, match)
    };
  }, [selectedDeliveryDish, enabledRescueHacks]);

  const toggleRescueHack = (hackId) => {
    setEnabledRescueHacks((prev) =>
      prev.includes(hackId) ? prev.filter((id) => id !== hackId) : [...prev, hackId]
    );
  };

  const handleSelectDeliveryDish = (dish) => {
    setSelectedDeliveryDish(dish);
    // Automatically enable the first 2 high-impact hacks so user sees immediate power
    setEnabledRescueHacks(dish.rescueHacks.slice(0, 2).map((h) => h.id));
  };

  const handleCustomPromptSubmit = (e) => {
    e.preventDefault();
    if (!customPromptInput.trim()) return;
    const q = customPromptInput.trim();
    setCustomPromptInput('');
    setActiveTriageResponse({
      id: 'custom',
      label: q,
      question: q,
      answer: {
        headline: `Clinical Protocol Calibrated for "${q}"`,
        rationale: `Aligned with your active ${selectedBioMode.name} mode (${selectedBioMode.hrvScore} HRV). Prioritizing first-bite soluble fiber + ${selectedBioMode.proteinTarget}g high-leucine protein prevents postprandial glucose volatility.`,
        prescription: `Anchor plate with 160g grilled protein (Paneer/Fish/Poultry) + fermented greens starter + slow-release complex millet or red rice eaten last.`,
        metrics: `${selectedBioMode.mealKcalTarget} kcal Target • ${selectedBioMode.proteinTarget}g Protein • <+${selectedBioMode.maxGlucoseDelta} mg/dL Glucose Ceiling`
      }
    });
    showToast('AI Dietitian generated structured clinical protocol');
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#14281D] font-sans selection:bg-[#2A6F4E]/20 flex flex-col">
      {/* =====================================================================
          FLOATING TOAST NOTIFICATION
         ===================================================================== */}
      {toastBanner && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#14281D] text-[#FBF9F5] px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastBanner}</span>
        </div>
      )}

      {/* =====================================================================
          1. TOP EDITORIAL CLINICAL HEADER & LIVE BIOMETRIC CONTEXT BAR
         ===================================================================== */}
      <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#E4DEC9]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-3 flex flex-col gap-3">
          {/* Top Row: Brand Identity + Live Biometric Telemetry Pills + View Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#14281D] text-[#FBF9F5] flex items-center justify-center shadow-md border border-emerald-700/30">
                <Sparkles className="w-5 h-5 text-[#D95D39]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#14281D]">
                    NutriPulse AI
                  </h1>
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#14281D] text-[#FBF9F5] font-semibold">
                    Summit Edition
                  </span>
                </div>
                <p className="text-xs text-[#526358] hidden sm:block">
                  Autonomous Pocket Dietitian • Real-Time CGM & Metabolic Meal Twin
                </p>
              </div>
            </div>

            {/* Live Simulated Biometric Readouts (Zero-Input Context) */}
            <div className="hidden xl:flex items-center gap-2 bg-[#F3EFE6] px-3 py-1.5 rounded-2xl border border-[#E4DEC9]">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FBF9F5] text-xs">
                <span className="w-2 h-2 rounded-full bg-[#2A6F4E] animate-pulse" />
                <span className="text-[#526358] font-medium">HRV:</span>
                <span className="font-mono font-bold text-[#14281D]">{selectedBioMode.hrvScore}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FBF9F5] text-xs">
                <Flame className="w-3.5 h-3.5 text-[#D95D39]" />
                <span className="text-[#526358] font-medium">Glycogen:</span>
                <span className="font-mono font-bold text-[#14281D]">{selectedBioMode.glycogenTank}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FBF9F5] text-xs">
                <Droplets className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-[#526358] font-medium">Hydration:</span>
                <span className="font-mono font-bold text-[#14281D]">{selectedBioMode.hydration}</span>
              </div>
            </div>

            {/* Form-Factor Switcher: Bento Clinical Studio vs Pocket Mobile Frame */}
            <div className="flex items-center gap-1.5 bg-[#EAE4D6] p-1 rounded-2xl border border-[#DDD5C4]">
              <button
                onClick={() => setActiveWorkspaceTab('studio')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeWorkspaceTab === 'studio'
                    ? 'bg-[#14281D] text-[#FBF9F5] shadow-sm'
                    : 'text-[#526358] hover:text-[#14281D]'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Command Studio</span>
              </button>
              <button
                onClick={() => setActiveWorkspaceTab('mobile')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeWorkspaceTab === 'mobile'
                    ? 'bg-[#14281D] text-[#FBF9F5] shadow-sm'
                    : 'text-[#526358] hover:text-[#14281D]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Pocket App View</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: 1-Tap Physiological State Presets + Hunger Calibration */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 pt-1 border-t border-[#EAE4D6]">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#526358] font-semibold mr-1 shrink-0">
                1-Tap Bio-State:
              </span>
              {BIO_MODES.map((mode) => {
                const Icon = mode.icon;
                const isActive = selectedBioMode.id === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => handleSelectBioMode(mode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all border ${
                      isActive
                        ? 'bg-[#14281D] text-[#FBF9F5] border-[#14281D] shadow-sm'
                        : 'bg-[#F3EFE6] text-[#526358] border-[#E4DEC9] hover:border-[#14281D]/40 hover:text-[#14281D]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: isActive ? '#D95D39' : undefined }} />
                    <span>{mode.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Tactile Hunger / Appetite Drive Slider */}
            <div className="flex items-center gap-3 bg-[#F3EFE6] px-3.5 py-1.5 rounded-xl border border-[#E4DEC9] shrink-0">
              <div className="flex items-center gap-1.5 text-xs">
                <Flame className="w-3.5 h-3.5 text-[#D95D39]" />
                <span className="font-semibold text-[#14281D]">Appetite Drive:</span>
                <span className="font-mono font-bold text-[#2A6F4E]">{hungerLevel}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={hungerLevel}
                onChange={(e) => setHungerLevel(Number(e.target.value))}
                className="w-24 accent-[#2A6F4E] cursor-pointer h-1.5 bg-[#DDD5C4] rounded-lg"
              />
              <span className="text-[11px] font-mono text-[#526358] hidden sm:inline">
                Target: {Math.round(selectedBioMode.mealKcalTarget * (0.85 + hungerLevel * 0.03))} kcal
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================================
          MAIN WORKSPACE: EITHER FULL BENTO COMMAND STUDIO OR POCKET MOBILE VIEW
         ===================================================================== */}
      {activeWorkspaceTab === 'studio' ? (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
          {/* Active Clinical Directive Banner */}
          <div className="bg-gradient-to-r from-[#14281D] via-[#1C3829] to-[#234534] text-[#FBF9F5] rounded-3xl p-4 sm:p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/15">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-300 font-semibold">
                    Live Dietitian Directive • {selectedBioMode.shortLabel}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-amber-200">
                    Leucine Target: ≥{selectedBioMode.leucineTarget}g
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-emerald-200">
                    Glucose Ceiling: &lt;+{selectedBioMode.maxGlucoseDelta} mg/dL
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-200 mt-1 leading-relaxed">
                  {selectedBioMode.clinicalFocus}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
              <div className="text-right">
                <div className="text-[10px] font-mono uppercase tracking-wider text-stone-300">
                  Meal Target
                </div>
                <div className="text-lg font-mono font-bold text-white">
                  {selectedBioMode.mealKcalTarget} kcal • {selectedBioMode.proteinTarget}g Pro
                </div>
              </div>
            </div>
          </div>

          {/* =================================================================
              UPPER BENTO GRID:
              LEFT (COL-7): CURATED MEAL ENGINE & 1-TAP CULINARY ALCHEMY
              RIGHT (COL-5): INTERACTIVE SVG TACTILE PLATE & 2-HR CGM SIMULATOR
             ================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: 1-TAP CULINARY ALCHEMY & MEAL ENGINE */}
            <section className="lg:col-span-7 bg-[#F3EFE6] rounded-[32px] p-5 sm:p-6 border border-[#E4DEC9] shadow-sm space-y-5">
              {/* Section Header & Dish Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#2A6F4E] font-bold">
                    Capability 01 • Autonomous Meal Engine
                  </span>
                  <h2 className="font-serif text-xl font-bold text-[#14281D]">
                    Tonight’s Bio-Matched Culinary Prescription
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedMealIdx((prev) => (prev + 1) % CURATED_MEALS.length);
                      setActiveAlchemyMods([]);
                      showToast('Rotated to next clinical chef prescription');
                    }}
                    className="px-3.5 py-2 rounded-2xl bg-[#FBF9F5] hover:bg-white text-[#14281D] border border-[#DDD5C4] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#2A6F4E]" />
                    <span>Next Prescription ({selectedMealIdx + 1}/{CURATED_MEALS.length})</span>
                  </button>
                </div>
              </div>

              {/* Hero Dish Card */}
              <div className="bg-[#FBF9F5] rounded-3xl p-5 border border-[#E4DEC9] shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2A6F4E] text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {currentCuratedMeal.matchScore}% Metabolic Match
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#F3EFE6] text-[#526358] border border-[#E4DEC9]">
                      {currentCuratedMeal.cuisine}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-[#526358]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#D95D39]" />
                      {activeAlchemyMods.includes('express') ? '10 mins' : currentCuratedMeal.prepTime}
                    </span>
                    <span className="font-bold text-[#14281D]">{currentCuratedMeal.kcal} kcal</span>
                  </div>
                </div>

                {/* Dish Title & Dynamic Plate Emblem */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-[#14281D] p-2 shrink-0 flex items-center justify-center shadow-md">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="50" r="46" fill="#FBF9F5" />
                      <path d="M50,50 L50,8 A42,42 0 0,1 92,50 Z" fill={currentCuratedMeal.palette[0]} />
                      <path d="M50,50 L92,50 A42,42 0 0,1 20,80 Z" fill={currentCuratedMeal.palette[1]} />
                      <path d="M50,50 L20,80 A42,42 0 0,1 50,8 Z" fill={currentCuratedMeal.palette[2]} />
                      <circle cx="50" cy="50" r="15" fill="#14281D" />
                      <text x="50" y="54" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FBF9F5">
                        {currentCuratedMeal.protein}g
                      </text>
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#14281D] leading-snug">
                      {currentCuratedMeal.computedTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#526358] leading-relaxed">
                      {currentCuratedMeal.subtitle}
                    </p>
                  </div>
                </div>

                {/* Live Macro & Amino Readout Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                  <div className="bg-[#F3EFE6] rounded-2xl p-3 border border-[#E4DEC9]">
                    <div className="text-[10px] font-mono uppercase text-[#526358]">Bio-Protein</div>
                    <div className="text-base font-mono font-extrabold text-[#2A6F4E] mt-0.5">
                      {currentCuratedMeal.protein}g
                    </div>
                    <div className="text-[10px] font-semibold text-[#14281D]">
                      {currentCuratedMeal.leucine}g Leucine
                    </div>
                  </div>
                  <div className="bg-[#F3EFE6] rounded-2xl p-3 border border-[#E4DEC9]">
                    <div className="text-[10px] font-mono uppercase text-[#526358]">Prebiotic Fiber</div>
                    <div className="text-base font-mono font-extrabold text-[#14281D] mt-0.5">
                      {currentCuratedMeal.fiber}g
                    </div>
                    <div className="text-[10px] text-[#526358]">Butyrate Fuel</div>
                  </div>
                  <div className="bg-[#F3EFE6] rounded-2xl p-3 border border-[#E4DEC9]">
                    <div className="text-[10px] font-mono uppercase text-[#526358]">Slow Carbs</div>
                    <div className="text-base font-mono font-extrabold text-[#14281D] mt-0.5">
                      {currentCuratedMeal.carbs}g
                    </div>
                    <div className="text-[10px] text-[#526358]">Low Glycemic</div>
                  </div>
                  <div className="bg-[#F3EFE6] rounded-2xl p-3 border border-[#E4DEC9]">
                    <div className="text-[10px] font-mono uppercase text-[#526358]">Healthy Fats</div>
                    <div className="text-base font-mono font-extrabold text-[#14281D] mt-0.5">
                      {currentCuratedMeal.fats}g
                    </div>
                    <div className="text-[10px] text-[#526358]">Anti-Inflammatory</div>
                  </div>
                  <div className="bg-[#EFF6F2] rounded-2xl p-3 border border-[#2A6F4E]/30 col-span-2 sm:col-span-1">
                    <div className="text-[10px] font-mono uppercase text-[#2A6F4E] font-bold">CGM Delta</div>
                    <div className="text-base font-mono font-extrabold text-[#2A6F4E] mt-0.5">
                      +{currentCuratedMeal.spike} mg/dL
                    </div>
                    <div className="text-[10px] text-[#2A6F4E] font-medium">
                      Satiety: {currentCuratedMeal.satietyHours}h
                    </div>
                  </div>
                </div>

                {/* 1-TAP CULINARY ALCHEMY BAR */}
                <div className="pt-2 border-t border-[#EAE4D6] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#14281D] flex items-center gap-1.5">
                      <Wand2 className="w-3.5 h-3.5 text-[#D95D39]" />
                      1-Tap Culinary Alchemy (Macro-Locked Recipe Mutations)
                    </span>
                    {activeAlchemyMods.length > 0 && (
                      <button
                        onClick={() => setActiveAlchemyMods([])}
                        className="text-[11px] font-semibold text-[#D95D39] hover:underline"
                      >
                        Reset Alchemy
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(currentCuratedMeal.alchemy).map(([modKey, modObj]) => {
                      const isOn = activeAlchemyMods.includes(modKey);
                      return (
                        <button
                          key={modKey}
                          onClick={() => toggleAlchemyMod(modKey)}
                          className={`px-3 py-2 rounded-2xl text-xs font-semibold text-left border transition-all flex items-center justify-between gap-1 ${
                            isOn
                              ? 'bg-[#14281D] text-[#FBF9F5] border-[#14281D] shadow-sm'
                              : 'bg-[#F3EFE6] text-[#14281D] border-[#DDD5C4] hover:bg-[#EAE4D6]'
                          }`}
                        >
                          <span className="truncate">{modObj.label}</span>
                          {isOn ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-[#526358] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Alchemy Clinical Modification Log */}
                  {currentCuratedMeal.activeNotes.length > 0 && (
                    <div className="bg-[#EFF6F2] rounded-2xl p-3 border border-[#2A6F4E]/25 space-y-1">
                      {currentCuratedMeal.activeNotes.map((note, idx) => (
                        <div key={idx} className="text-xs text-[#14281D] flex items-start gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-[#2A6F4E] shrink-0 mt-0.5" />
                          <span>{note}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expandable "Why Your Dietitian Picked This" Micronutrient Synergies */}
                <div className="bg-[#F3EFE6] rounded-2xl p-3.5 border border-[#E4DEC9]">
                  <button
                    onClick={() => setExpandedSynergy(!expandedSynergy)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2A6F4E] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Why Your Dietitian Picked This (Micronutrient Synergies)
                    </span>
                    <span className="text-xs font-semibold text-[#526358]">
                      {expandedSynergy ? 'Hide' : 'Expand'}
                    </span>
                  </button>

                  {expandedSynergy && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentCuratedMeal.synergies.map((syn, i) => (
                        <div key={i} className="bg-[#FBF9F5] p-3 rounded-xl border border-[#E4DEC9]">
                          <div className="text-xs font-bold text-[#14281D]">{syn.pair}</div>
                          <p className="text-[11px] text-[#526358] mt-1 leading-relaxed">{syn.effect}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    onClick={() => {
                      setPlatePortions({
                        protein: Math.min(50, Math.round((currentCuratedMeal.protein * 400) / currentCuratedMeal.kcal)),
                        greens: 32,
                        carbs: 20,
                        fats: 12
                      });
                      showToast('Loaded dish macros into Live CGM Simulator');
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-[#F3EFE6] hover:bg-[#EAE4D6] text-[#14281D] text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Activity className="w-4 h-4 text-[#2A6F4E]" />
                    Simulate on CGM Twin
                  </button>

                  <button
                    onClick={() => {
                      if (!loggedMealIds.includes(currentCuratedMeal.id)) {
                        setLoggedMealIds([...loggedMealIds, currentCuratedMeal.id]);
                      }
                      showToast(`Logged ${currentCuratedMeal.computedTitle} (+${currentCuratedMeal.protein}g Protein)`);
                    }}
                    className="flex-1 py-2.5 px-5 rounded-2xl bg-[#14281D] hover:bg-[#1F3B2C] text-[#FBF9F5] text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    {loggedMealIds.includes(currentCuratedMeal.id)
                      ? 'Logged to Biometric Timeline'
                      : 'Commit & Log Prescription'}
                  </button>
                </div>
              </div>
            </section>

            {/* RIGHT COLUMN: INTERACTIVE SVG "TACTILE PLATE & METABOLIC TWIN" */}
            <section className="lg:col-span-5 bg-[#F3EFE6] rounded-[32px] p-5 sm:p-6 border border-[#E4DEC9] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#D95D39] font-bold">
                    Capability 02 • Metabolic Twin
                  </span>
                  <h2 className="font-serif text-xl font-bold text-[#14281D]">
                    Tactile Plate & 2-Hr CGM Simulator
                  </h2>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${
                    twinTelemetry.mTORTriggered
                      ? 'bg-emerald-900/10 text-[#2A6F4E] border border-[#2A6F4E]/30'
                      : 'bg-amber-900/10 text-amber-800 border border-amber-700/30'
                  }`}
                >
                  {twinTelemetry.mTORTriggered
                    ? `mTOR Active (${twinTelemetry.leucineGrams}g Leu)`
                    : `Sub-mTOR (${twinTelemetry.leucineGrams}g Leu)`}
                </span>
              </div>

              {/* Live 2-Hour Continuous Glucose Monitor (CGM) Curve SVG */}
              <div className="bg-[#14281D] text-[#FBF9F5] rounded-3xl p-4 shadow-inner space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-mono uppercase tracking-wider text-stone-300 text-[11px]">
                      Predicted 2-Hr Postprandial Glucose
                    </span>
                  </div>
                  <div className="font-mono font-bold text-sm text-emerald-300">
                    Peak: {twinTelemetry.peakMgDl} mg/dL (+{twinTelemetry.glucoseDelta})
                  </div>
                </div>

                {/* Dynamic SVG CGM Graph */}
                <div className="relative h-36 w-full">
                  <svg viewBox="0 0 320 140" className="w-full h-full overflow-visible">
                    {/* Optimal Zone Band (75 - 120 mg/dL) */}
                    <rect x="0" y="65" width="320" height="55" fill="#2A6F4E" opacity="0.22" rx="6" />
                    {/* Threshold Line at 140 mg/dL */}
                    <line
                      x1="0"
                      y1="38"
                      x2="320"
                      y2="38"
                      stroke="#D97706"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text x="6" y="33" fontSize="8" fill="#FCD34D" fontFamily="monospace">
                      140 mg/dL Spike Ceiling
                    </text>

                    {/* Unmitigated Curve (Dashed Amber Comparison) */}
                    <path
                      d={twinTelemetry.unmitigatedPath}
                      fill="none"
                      stroke="#D97706"
                      strokeWidth="1.75"
                      strokeDasharray="3 3"
                      opacity="0.7"
                    />

                    {/* Mitigated Active Curve (Glowing Emerald) */}
                    <path
                      d={twinTelemetry.mitigatedPath}
                      fill="none"
                      stroke="#34D399"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />

                    {/* Peak Indicator Dot */}
                    <circle cx="85" cy={twinTelemetry.peakY} r="4.5" fill="#34D399" stroke="#14281D" strokeWidth="1.5" />

                    {/* Time Axis Labels */}
                    <text x="2" y="136" fontSize="8" fill="#A7F3D0" fontFamily="monospace">
                      0m (Meal)
                    </text>
                    <text x="72" y="136" fontSize="8" fill="#A7F3D0" fontFamily="monospace">
                      +45m Peak
                    </text>
                    <text x="180" y="136" fontSize="8" fill="#A7F3D0" fontFamily="monospace">
                      +90m
                    </text>
                    <text x="282" y="136" fontSize="8" fill="#A7F3D0" fontFamily="monospace">
                      +120m
                    </text>
                  </svg>
                </div>

                {/* Meal-Sequencing & Glucose Bio-Hack Toggles */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    onClick={() => setEatFiberFirst(!eatFiberFirst)}
                    className={`p-2 rounded-xl text-[11px] font-semibold border text-left transition ${
                      eatFiberFirst
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                        : 'bg-white/5 border-white/10 text-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>1. Fiber First</span>
                      {eatFiberFirst && <Check className="w-3 h-3 text-emerald-300" />}
                    </div>
                    <div className="text-[9px] font-mono opacity-80 mt-0.5">-28% Glucose Peak</div>
                  </button>

                  <button
                    onClick={() => setPostMealWalk(!postMealWalk)}
                    className={`p-2 rounded-xl text-[11px] font-semibold border text-left transition ${
                      postMealWalk
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                        : 'bg-white/5 border-white/10 text-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>2. 15m Stroll</span>
                      {postMealWalk && <Check className="w-3 h-3 text-emerald-300" />}
                    </div>
                    <div className="text-[9px] font-mono opacity-80 mt-0.5">GLUT4 Sink (-22%)</div>
                  </button>

                  <button
                    onClick={() => setAcvStarter(!acvStarter)}
                    className={`p-2 rounded-xl text-[11px] font-semibold border text-left transition ${
                      acvStarter
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                        : 'bg-white/5 border-white/10 text-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>3. Lemon/ACV</span>
                      {acvStarter && <Check className="w-3 h-3 text-emerald-300" />}
                    </div>
                    <div className="text-[9px] font-mono opacity-80 mt-0.5">Slows Starch (-14%)</div>
                  </button>
                </div>
              </div>

              {/* Interactive SVG Plate Ring + Tactile Quadrant Sliders */}
              <div className="bg-[#FBF9F5] rounded-3xl p-4 border border-[#E4DEC9] space-y-3">
                <div className="flex items-center gap-4">
                  {/* Dynamic SVG Multi-Segment Plate */}
                  <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.915" fill="#FBF9F5" stroke="#EAE4D6" strokeWidth="3.8" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="transparent"
                        stroke="#2A6F4E"
                        strokeWidth="4.4"
                        strokeDasharray={`${platePortions.protein} ${100 - platePortions.protein}`}
                        strokeDashoffset="0"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="transparent"
                        stroke="#528265"
                        strokeWidth="4.4"
                        strokeDasharray={`${platePortions.greens} ${100 - platePortions.greens}`}
                        strokeDashoffset={`-${platePortions.protein}`}
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="transparent"
                        stroke="#D95D39"
                        strokeWidth="4.4"
                        strokeDasharray={`${platePortions.carbs} ${100 - platePortions.carbs}`}
                        strokeDashoffset={`-${platePortions.protein + platePortions.greens}`}
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="transparent"
                        stroke="#D97706"
                        strokeWidth="4.4"
                        strokeDasharray={`${platePortions.fats} ${100 - platePortions.fats}`}
                        strokeDashoffset={`-${platePortions.protein + platePortions.greens + platePortions.carbs}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-sm font-mono font-extrabold text-[#14281D]">
                        {twinTelemetry.totalKcal}
                      </span>
                      <span className="text-[9px] font-mono uppercase text-[#526358]">kcal</span>
                      <span className="text-[10px] font-bold text-[#2A6F4E]">
                        {twinTelemetry.satietyHours}h Full
                      </span>
                    </div>
                  </div>

                  {/* Quadrant Adjusters */}
                  <div className="flex-1 space-y-2">
                    {[
                      {
                        key: 'protein',
                        label: 'Bio-Protein',
                        grams: `${twinTelemetry.proteinGrams}g`,
                        color: 'bg-[#2A6F4E]'
                      },
                      {
                        key: 'greens',
                        label: 'Fibrous Greens',
                        grams: `${twinTelemetry.fiberGrams}g Fib`,
                        color: 'bg-[#528265]'
                      },
                      {
                        key: 'carbs',
                        label: 'Slow Carbs',
                        grams: `${twinTelemetry.carbGrams}g`,
                        color: 'bg-[#D95D39]'
                      },
                      {
                        key: 'fats',
                        label: 'Omega Fats',
                        grams: `${twinTelemetry.fatGrams}g`,
                        color: 'bg-[#D97706]'
                      }
                    ].map((q) => (
                      <div key={q.key} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${q.color}`} />
                          <span className="font-semibold text-[#14281D]">{q.label}</span>
                          <span className="font-mono text-[11px] text-[#526358]">
                            {platePortions[q.key]}% ({q.grams})
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => adjustQuadrant(q.key, -5)}
                            className="w-6 h-6 rounded-lg bg-[#F3EFE6] hover:bg-[#EAE4D6] flex items-center justify-center text-[#14281D]"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => adjustQuadrant(q.key, 5)}
                            className="w-6 h-6 rounded-lg bg-[#F3EFE6] hover:bg-[#EAE4D6] flex items-center justify-center text-[#14281D]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* =================================================================
              LOWER BENTO GRID:
              LEFT (COL-7): DELIVERY & DINING OUT "MENU DECONSTRUCTOR"
              RIGHT (COL-5): CIRCADIAN SUPPLEMENT SYNERGY TIMELINE
             ================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* CAPABILITY 03: REAL-WORLD DELIVERY & DINING OUT RESCUE MODE */}
            <section className="lg:col-span-7 bg-[#F3EFE6] rounded-[32px] p-5 sm:p-6 border border-[#E4DEC9] shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#D95D39] font-bold">
                    Capability 03 • Real-World Rescue Mode
                  </span>
                  <h2 className="font-serif text-xl font-bold text-[#14281D]">
                    Delivery & Dining-Out Menu Deconstructor
                  </h2>
                </div>
                <span className="text-xs text-[#526358]">
                  Turn any craving or restaurant order into a metabolic match
                </span>
              </div>

              {/* Craving / Dish Selector Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DELIVERY_DISHES.map((dish) => {
                  const active = selectedDeliveryDish.id === dish.id;
                  return (
                    <button
                      key={dish.id}
                      onClick={() => handleSelectDeliveryDish(dish)}
                      className={`p-2.5 rounded-2xl text-left border transition-all ${
                        active
                          ? 'bg-[#14281D] text-[#FBF9F5] border-[#14281D] shadow-sm'
                          : 'bg-[#FBF9F5] text-[#14281D] border-[#E4DEC9] hover:border-[#14281D]/40'
                      }`}
                    >
                      <div className="text-xs font-bold line-clamp-1">{dish.name}</div>
                      <div className={`text-[10px] mt-0.5 ${active ? 'text-stone-300' : 'text-[#526358]'}`}>
                        Base: {dish.baseKcal} kcal
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Before vs After Metabolic Transformation Card */}
              <div className="bg-[#FBF9F5] rounded-3xl p-5 border border-[#E4DEC9] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE4D6]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-[#14281D]">
                        {selectedDeliveryDish.name}
                      </h3>
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 font-semibold">
                        {selectedDeliveryDish.warningTag}
                      </span>
                    </div>
                    <p className="text-xs text-[#526358] mt-1">{selectedDeliveryDish.clinicalBreakdown}</p>
                  </div>

                  {/* Live Transformation Score */}
                  <div className="flex items-center gap-3 bg-[#F3EFE6] px-4 py-2.5 rounded-2xl border border-[#E4DEC9] shrink-0">
                    <div className="text-center">
                      <div className="text-[10px] font-mono uppercase text-[#526358]">Unmodified</div>
                      <div className="text-sm font-mono font-bold text-rose-700 line-through">
                        {selectedDeliveryDish.baseMatch}% Match
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#2A6F4E]" />
                    <div className="text-center">
                      <div className="text-[10px] font-mono uppercase text-[#2A6F4E] font-bold">Rescued</div>
                      <div className="text-lg font-mono font-extrabold text-[#2A6F4E]">
                        {deconstructedStats.match}% Match
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Rescued Telemetry Strip */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-[#F3EFE6] p-2.5 rounded-2xl">
                    <div className="text-[10px] font-mono uppercase text-[#526358]">Net Calories</div>
                    <div className="text-sm font-mono font-bold text-[#14281D]">
                      {deconstructedStats.kcal} kcal
                    </div>
                    <div className="text-[10px] text-[#2A6F4E] font-semibold">
                      {deconstructedStats.kcal - selectedDeliveryDish.baseKcal} kcal saved
                    </div>
                  </div>
                  <div className="bg-[#F3EFE6] p-2.5 rounded-2xl">
                    <div className="text-[10px] font-mono uppercase text-[#526358]">Protein Retained</div>
                    <div className="text-sm font-mono font-bold text-[#2A6F4E]">
                      {deconstructedStats.protein}g
                    </div>
                    <div className="text-[10px] text-[#526358]">Satiety Anchor</div>
                  </div>
                  <div className="bg-[#F3EFE6] p-2.5 rounded-2xl">
                    <div className="text-[10px] font-mono uppercase text-[#526358]">Net Carbs / Fib</div>
                    <div className="text-sm font-mono font-bold text-[#14281D]">
                      {deconstructedStats.carbs}g / {deconstructedStats.fiber}g
                    </div>
                    <div className="text-[10px] text-[#526358]">Buffered Load</div>
                  </div>
                  <div className="bg-[#EFF6F2] p-2.5 rounded-2xl border border-[#2A6F4E]/30">
                    <div className="text-[10px] font-mono uppercase text-[#2A6F4E] font-bold">Glucose Peak</div>
                    <div className="text-sm font-mono font-extrabold text-[#2A6F4E]">
                      +{deconstructedStats.spike} mg/dL
                    </div>
                    <div className="text-[10px] text-[#2A6F4E]">
                      Down from +{selectedDeliveryDish.baseSpike}
                    </div>
                  </div>
                </div>

                {/* Dietitian's 1-Tap Rescue Hacks Checklist */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#14281D]">
                    Toggle Dietitian’s 1-Tap Rescue Hacks:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedDeliveryDish.rescueHacks.map((hack) => {
                      const checked = enabledRescueHacks.includes(hack.id);
                      return (
                        <button
                          key={hack.id}
                          onClick={() => toggleRescueHack(hack.id)}
                          className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                            checked
                              ? 'bg-[#EFF6F2] border-[#2A6F4E] text-[#14281D] shadow-sm'
                              : 'bg-[#F3EFE6]/70 border-[#E4DEC9] text-[#526358] hover:bg-[#F3EFE6]'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              checked ? 'bg-[#2A6F4E] text-white' : 'bg-white border border-[#DDD5C4]'
                            }`}
                          >
                            {checked && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold leading-snug">{hack.title}</div>
                            <div className="text-[11px] font-mono text-[#2A6F4E] font-semibold mt-0.5">
                              {hack.impactLabel}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* CAPABILITY 04: CIRCADIAN MICRONUTRIENT & SUPPLEMENT SYNERGY TIMELINE */}
            <section className="lg:col-span-5 bg-[#F3EFE6] rounded-[32px] p-5 sm:p-6 border border-[#E4DEC9] shadow-sm space-y-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-700 font-bold">
                  Capability 04 • Bio-Availability Engine
                </span>
                <h2 className="font-serif text-xl font-bold text-[#14281D]">
                  Circadian Supplement & Meal Synergy
                </h2>
              </div>

              <div className="space-y-3">
                {CIRCADIAN_STACK.map((item) => {
                  const isDone = checkedSupplements.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() =>
                        setCheckedSupplements((prev) =>
                          prev.includes(item.id) ? prev.filter((i) => i !== item.id) : [...prev, item.id]
                        )
                      }
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isDone
                          ? 'bg-[#FBF9F5] border-[#2A6F4E]/50 shadow-sm'
                          : 'bg-[#FBF9F5]/70 border-[#E4DEC9] hover:bg-[#FBF9F5]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#2A6F4E]">
                          {item.window}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                            isDone
                              ? 'bg-emerald-900/10 text-[#2A6F4E]'
                              : 'bg-stone-200 text-[#526358]'
                          }`}
                        >
                          {isDone ? '✓ Synergized' : 'Tap to Log'}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#14281D] mt-1">{item.title}</div>
                      <p className="text-[11px] text-[#526358] mt-1 leading-relaxed">{item.synergyNote}</p>
                      <div className="mt-2 pt-1.5 border-t border-[#EAE4D6] flex items-center gap-1.5 text-[10px] text-amber-800 font-medium">
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>{item.conflictWarning}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* =================================================================
              CAPABILITY 05: BOTTOM CONVERSATIONAL DIETITIAN TRIAGE BAR
             ================================================================= */}
          <section className="bg-[#14281D] text-[#FBF9F5] rounded-[32px] p-5 sm:p-6 shadow-xl border border-emerald-800/30 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2A6F4E] text-white flex items-center justify-center font-serif font-bold text-sm shrink-0">
                  RD
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-semibold">
                    Capability 05 • Instant Clinical Triage
                  </span>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                    Ask Mira — Your 24/7 Metabolic Dietitian
                  </h2>
                </div>
              </div>

              {/* 1-Tap Scenario Chips */}
              <div className="flex flex-wrap items-center gap-2">
                {TRIAGE_CHIPS.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setActiveTriageResponse(chip)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
                      activeTriageResponse.id === chip.id
                        ? 'bg-emerald-400 text-[#14281D] border-emerald-300 font-bold'
                        : 'bg-white/10 text-stone-200 border-white/15 hover:bg-white/15'
                    }`}
                  >
                    “{chip.label}”
                  </button>
                ))}
              </div>
            </div>

            {/* Structured Clinical Response Display */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              <div className="lg:col-span-8 space-y-1.5">
                <div className="text-xs font-mono text-emerald-300 uppercase tracking-wider">
                  {activeTriageResponse.answer.headline}
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {activeTriageResponse.answer.rationale}
                </p>
                <div className="text-xs font-semibold text-white pt-1">
                  <span className="text-amber-300">Exact Order / Prep: </span>
                  {activeTriageResponse.answer.prescription}
                </div>
              </div>

              <div className="lg:col-span-4 bg-[#1F3B2C] p-3.5 rounded-xl border border-emerald-500/30 flex flex-col justify-between gap-2">
                <div className="text-[10px] font-mono uppercase text-emerald-300">
                  Predicted Metabolic Outcome
                </div>
                <div className="text-xs font-mono font-bold text-white leading-relaxed">
                  {activeTriageResponse.answer.metrics}
                </div>
              </div>
            </div>

            {/* Custom Scenario Input */}
            <form onSubmit={handleCustomPromptSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={customPromptInput}
                onChange={(e) => setCustomPromptInput(e.target.value)}
                placeholder="Ask anything (e.g., 'Eating late at an airport lounge', 'Pre-workout snack at 5 PM')..."
                className="flex-1 bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-[#D95D39] hover:bg-[#c04e2d] text-white text-xs font-bold flex items-center gap-1.5 transition shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Triage Now</span>
              </button>
            </form>
          </section>
        </main>
      ) : (
        /* ===================================================================
           POCKET MOBILE FRAME VIEW (FOR EXPERIENCING THE HANDHELD FORM FACTOR)
           =================================================================== */
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
          <div className="w-full max-w-[430px] bg-[#FBF9F5] rounded-[46px] border-[10px] border-[#14281D] shadow-2xl overflow-hidden flex flex-col min-h-[800px] max-h-[850px]">
            {/* Mobile Status Header */}
            <div className="bg-[#14281D] text-[#FBF9F5] px-6 py-3 flex items-center justify-between text-xs">
              <span className="font-mono font-bold">8:00 PM</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-300">
                {selectedBioMode.shortLabel} • {selectedBioMode.hrvScore}
              </span>
              <span className="font-mono text-[11px] text-amber-300">{currentCuratedMeal.matchScore}% Match</span>
            </div>

            {/* Scrollable Mobile Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeMobileScreen === 'engine' && (
                <div className="space-y-4">
                  <div className="bg-[#F3EFE6] p-4 rounded-3xl border border-[#E4DEC9] space-y-3">
                    <span className="text-[10px] font-mono uppercase text-[#2A6F4E] font-bold">
                      Tonight’s Smart Prescription
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#14281D]">
                      {currentCuratedMeal.computedTitle}
                    </h3>
                    <p className="text-xs text-[#526358]">{currentCuratedMeal.subtitle}</p>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="bg-[#FBF9F5] p-2 rounded-xl">
                        <div className="text-[10px] text-[#526358]">Protein</div>
                        <div className="text-sm font-mono font-bold text-[#2A6F4E]">
                          {currentCuratedMeal.protein}g
                        </div>
                      </div>
                      <div className="bg-[#FBF9F5] p-2 rounded-xl">
                        <div className="text-[10px] text-[#526358]">Calories</div>
                        <div className="text-sm font-mono font-bold text-[#14281D]">
                          {currentCuratedMeal.kcal}
                        </div>
                      </div>
                      <div className="bg-[#EFF6F2] p-2 rounded-xl">
                        <div className="text-[10px] text-[#2A6F4E]">CGM Peak</div>
                        <div className="text-sm font-mono font-bold text-[#2A6F4E]">
                          +{currentCuratedMeal.spike} mg/dL
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-2">
                      {Object.entries(currentCuratedMeal.alchemy).map(([modKey, modObj]) => (
                        <button
                          key={modKey}
                          onClick={() => toggleAlchemyMod(modKey)}
                          className={`p-2 rounded-xl text-[11px] font-semibold border text-left ${
                            activeAlchemyMods.includes(modKey)
                              ? 'bg-[#14281D] text-white border-[#14281D]'
                              : 'bg-white text-[#14281D] border-[#DDD5C4]'
                          }`}
                        >
                          {modObj.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeMobileScreen === 'twin' && (
                <div className="space-y-4">
                  <div className="bg-[#14281D] text-white p-4 rounded-3xl space-y-2">
                    <div className="text-xs font-mono text-emerald-300">
                      Live 2-Hr CGM Curve • Peak {twinTelemetry.peakMgDl} mg/dL
                    </div>
                    <svg viewBox="0 0 320 140" className="w-full h-32">
                      <path
                        d={twinTelemetry.unmitigatedPath}
                        fill="none"
                        stroke="#D97706"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                      <path
                        d={twinTelemetry.mitigatedPath}
                        fill="none"
                        stroke="#34D399"
                        strokeWidth="3"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {activeMobileScreen === 'deconstructor' && (
                <div className="space-y-3">
                  <h3 className="font-serif text-base font-bold">{selectedDeliveryDish.name}</h3>
                  {selectedDeliveryDish.rescueHacks.map((hack) => (
                    <button
                      key={hack.id}
                      onClick={() => toggleRescueHack(hack.id)}
                      className={`w-full p-3 rounded-2xl border text-left text-xs ${
                        enabledRescueHacks.includes(hack.id)
                          ? 'bg-[#EFF6F2] border-[#2A6F4E] font-bold'
                          : 'bg-white border-[#E4DEC9]'
                      }`}
                    >
                      {hack.title} ({hack.impactLabel})
                    </button>
                  ))}
                </div>
              )}

              {activeMobileScreen === 'timeline' && (
                <div className="space-y-2.5">
                  {CIRCADIAN_STACK.map((s) => (
                    <div key={s.id} className="p-3 rounded-2xl bg-[#F3EFE6] border border-[#E4DEC9] text-xs">
                      <div className="font-mono text-[10px] text-[#2A6F4E] font-bold">{s.window}</div>
                      <div className="font-bold mt-0.5">{s.title}</div>
                      <div className="text-[11px] text-[#526358] mt-1">{s.synergyNote}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Mobile Tab Navigation */}
            <nav className="bg-[#F3EFE6] border-t border-[#E4DEC9] px-4 py-2.5 flex justify-around text-[10px] font-bold">
              <button
                onClick={() => setActiveMobileScreen('engine')}
                className={activeMobileScreen === 'engine' ? 'text-[#2A6F4E]' : 'text-[#526358]'}
              >
                Smart Plate
              </button>
              <button
                onClick={() => setActiveMobileScreen('twin')}
                className={activeMobileScreen === 'twin' ? 'text-[#2A6F4E]' : 'text-[#526358]'}
              >
                CGM Twin
              </button>
              <button
                onClick={() => setActiveMobileScreen('deconstructor')}
                className={activeMobileScreen === 'deconstructor' ? 'text-[#2A6F4E]' : 'text-[#526358]'}
              >
                Menu Rescue
              </button>
              <button
                onClick={() => setActiveMobileScreen('timeline')}
                className={activeMobileScreen === 'timeline' ? 'text-[#2A6F4E]' : 'text-[#526358]'}
              >
                Supplements
              </button>
            </nav>
          </div>
        </main>
      )}
    </div>
  );
}