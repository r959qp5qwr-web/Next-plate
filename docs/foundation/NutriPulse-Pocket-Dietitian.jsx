import React, { useState, useEffect, useMemo } from 'react';
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
  Info, 
  Clock, 
  Zap, 
  Heart, 
  ShieldCheck, 
  Send, 
  Camera, 
  Compass, 
  Award,
  ArrowRight,
  Plus,
  Minus,
  Smartphone,
  Layout,
  Sun,
  Moon,
  Leaf,
  Dumbbell,
  Mountain,
  CheckCircle2,
  ChefHat,
  Store
} from 'lucide-react';

// --- RICH SAMPLE DATA ---
const GOALS = [
  { id: 'recovery', label: 'Muscle Recovery & Gut Health', icon: Dumbbell, color: 'text-emerald-700', bg: 'bg-emerald-100/80', targetKcal: 2350, proteinTarget: 155 },
  { id: 'trek', label: 'High-Output Trek Day', icon: Mountain, color: 'text-amber-700', bg: 'bg-amber-100/80', targetKcal: 2900, proteinTarget: 140 },
  { id: 'lean', label: 'Lean Maintenance & Focus', icon: Leaf, color: 'text-teal-700', bg: 'bg-teal-100/80', targetKcal: 1950, proteinTarget: 135 }
];

const MOOD_FILTERS = [
  { id: 'all', label: 'AI Optimal', icon: Sparkles },
  { id: 'quick', label: 'Quick 15-min', icon: Clock },
  { id: 'protein', label: 'High Protein', icon: Zap },
  { id: 'comfort', label: 'Comforting', icon: Heart },
  { id: 'light', label: 'Light & Digestible', icon: Leaf }
];

const CUISINES = [
  { id: 'indian', label: 'Indian Regional' },
  { id: 'mediterranean', label: 'Mediterranean' },
  { id: 'express', label: 'High-Protein Express' }
];

const MEALS_DB = {
  indian: [
    {
      id: 'ind-1',
      title: 'Charred Paneer Tikka & Foxtail Millet Khichdi',
      subtitle: 'With probiotic mint-walnut chutney & sautéed garlic spinach',
      prepTime: '18 mins',
      kcal: 540,
      matchScore: 98,
      tags: ['protein', 'comfort', 'all'],
      macros: { protein: 36, fiber: 12, carbs: 48, fats: 21 },
      glycemicLoad: 'Low (GL 11)',
      satietyIndex: '9.4/10',
      palette: ['#E07A5F', '#3D5A45', '#F2CC8F'],
      insight: 'Replenishes muscle glycogen after your afternoon session while pairing prebiotic foxtail millet with magnesium-rich palak to enhance deep-sleep architecture tonight.',
      swaps: {
        protein: [
          { name: 'Artisanal Malai Paneer (150g)', pro: '+0g', kcal: 0 },
          { name: 'Tandoori Chicken Tikka (160g)', pro: '+12g', kcal: -35 },
          { name: 'Sprouted Moong & Tofu Bhurji', pro: '-4g', kcal: -60 }
        ],
        base: [
          { name: 'Foxtail Millet (1 cup)', fiber: '8g' },
          { name: 'Hand-pounded Brown Basmati', fiber: '4g' },
          { name: 'Cauliflower & Green Pea Mash', fiber: '9g' }
        ]
      }
    },
    {
      id: 'ind-2',
      title: 'Malabar Spiced Salmon & Red Rice Bowl',
      subtitle: 'Simmered in light kokum-coconut broth with steamed moringa',
      prepTime: '15 mins',
      kcal: 580,
      matchScore: 96,
      tags: ['quick', 'protein', 'light', 'all'],
      macros: { protein: 42, fiber: 9, carbs: 44, fats: 24 },
      glycemicLoad: 'Low (GL 9)',
      satietyIndex: '9.2/10',
      palette: ['#D95D39', '#2E5A44', '#E6B89C'],
      insight: 'High bioavailable Omega-3s (2.4g EPA/DHA) actively lower post-exercise systemic inflammation, while kokum aids gastric emptying before bedtime.',
      swaps: {
        protein: [
          { name: 'Wild Indian Salmon / Rawas (160g)', pro: '+0g', kcal: 0 },
          { name: 'Grilled Surmai (Kingfish) Steak', pro: '+2g', kcal: -20 },
          { name: 'Roasted Edamame & Tempeh Cubes', pro: '-9g', kcal: -45 }
        ],
        base: [
          { name: 'Kerala Matta Red Rice', fiber: '6g' },
          { name: 'Steamed Ragi Balls (Mudde)', fiber: '8g' }
        ]
      }
    },
    {
      id: 'ind-3',
      title: 'Smoky Kala Chana & Sweet Potato Chaat Bowl',
      subtitle: 'Topped with hung-curd tahini drizzle, pomegranate & pumpkin seeds',
      prepTime: '12 mins',
      kcal: 490,
      matchScore: 94,
      tags: ['quick', 'light', 'comfort'],
      macros: { protein: 28, fiber: 16, carbs: 56, fats: 14 },
      glycemicLoad: 'Low-Med (GL 13)',
      satietyIndex: '9.6/10',
      palette: ['#8C4A32', '#4F772D', '#F4A261'],
      insight: 'Resistant starch from cooled sweet potatoes feeds butyrate-producing gut microbes, paired with zinc-dense pumpkin seeds for overnight hormone synthesis.',
      swaps: {
        protein: [
          { name: 'Sprouted Kala Chana + Greek Dahi', pro: '+0g', kcal: 0 },
          { name: 'Add 2 Jammy Pasture-Raised Eggs', pro: '+12g', kcal: +140 },
          { name: 'Add Grilled Halloumi / Paneer', pro: '+14g', kcal: +160 }
        ],
        base: [
          { name: 'Roasted Sweet Potato Cubes', fiber: '7g' },
          { name: 'Jowar Puffs & Cucumber Crunch', fiber: '8g' }
        ]
      }
    }
  ],
  mediterranean: [
    {
      id: 'med-1',
      title: 'Herb-Crusted Sea Bass & Warm Farro Tabbouleh',
      subtitle: 'With charred lemon, Kalamata olives, baby arugula & pistachio dukkah',
      prepTime: '15 mins',
      kcal: 530,
      matchScore: 99,
      tags: ['quick', 'protein', 'light', 'all'],
      macros: { protein: 44, fiber: 11, carbs: 42, fats: 19 },
      glycemicLoad: 'Very Low (GL 8)',
      satietyIndex: '9.5/10',
      palette: ['#2A6F4E', '#E9C46A', '#E76F51'],
      insight: 'Polyphenol-rich extra virgin olive oil and pistachio dukkah blunt glucose spikes by 34% while delivering 44g of rapid-digesting marine protein.',
      swaps: {
        protein: [
          { name: 'Line-Caught Sea Bass (175g)', pro: '+0g', kcal: 0 },
          { name: 'Lemon-Oregano Chicken Breast', pro: '+4g', kcal: -15 },
          { name: 'Crispy Lupini Beans & Halloumi', pro: '-8g', kcal: +40 }
        ],
        base: [
          { name: 'Ancient Grain Farro & Parsley', fiber: '8g' },
          { name: 'Tri-Color Quinoa Pilaf', fiber: '7g' }
        ]
      }
    },
    {
      id: 'med-2',
      title: 'Harissa Chicken & Roasted Cauliflower Shawarma Bowl',
      subtitle: 'Over whipped hummus, pickled turnips & cucumber-dill salad',
      prepTime: '20 mins',
      kcal: 595,
      matchScore: 95,
      tags: ['protein', 'comfort', 'all'],
      macros: { protein: 48, fiber: 13, carbs: 46, fats: 22 },
      glycemicLoad: 'Low (GL 10)',
      satietyIndex: '9.7/10',
      palette: ['#C85A32', '#D4A373', '#386641'],
      insight: 'Sulforaphane in roasted cauliflower supports hepatic detox pathways, while 48g complete protein maximizes overnight myofibrillar protein synthesis.',
      swaps: {
        protein: [
          { name: 'Pasture Chicken Thighs (170g)', pro: '+0g', kcal: 0 },
          { name: 'Grass-Fed Lamb Kofta', pro: '-2g', kcal: +55 },
          { name: 'Spiced Chickpea & Hemp Falafel', pro: '-16g', kcal: -30 }
        ],
        base: [
          { name: 'High-Fiber Whipped Hummus Base', fiber: '9g' },
          { name: 'Freekeh & Pomegranate Bed', fiber: '10g' }
        ]
      }
    }
  ],
  express: [
    {
      id: 'exp-1',
      title: '10-Min Miso Glazed Tofu & Edamame Buckwheat Soba',
      subtitle: 'Tossed with sesame wakame, bok choy & crispy chili crisp',
      prepTime: '10 mins',
      kcal: 510,
      matchScore: 97,
      tags: ['quick', 'protein', 'light', 'all'],
      macros: { protein: 38, fiber: 14, carbs: 51, fats: 16 },
      glycemicLoad: 'Low (GL 11)',
      satietyIndex: '9.3/10',
      palette: ['#3B6E5C', '#DDA15E', '#BC4749'],
      insight: 'Fermented red miso introduces live lactobacillus strains while rutin in 100% buckwheat soba strengthens microvascular recovery after training.',
      swaps: {
        protein: [
          { name: 'Organic Firm Tofu + Edamame', pro: '+0g', kcal: 0 },
          { name: 'Seared Ahi Tuna Tataki (150g)', pro: '+9g', kcal: -10 },
          { name: 'Sous-Vide Ginger Chicken Strips', pro: '+7g', kcal: +15 }
        ],
        base: [
          { name: '100% Buckwheat Soba Noodles', fiber: '7g' },
          { name: 'Shirataki & Shredded Cabbage', fiber: '11g' }
        ]
      }
    },
    {
      id: 'exp-2',
      title: 'Skillet Turkey-Zucchini Picadillo & Black Bean Bowl',
      subtitle: 'Topped with Hass avocado slices, pico de gallo & lime cotija',
      prepTime: '12 mins',
      kcal: 555,
      matchScore: 95,
      tags: ['quick', 'protein', 'comfort'],
      macros: { protein: 46, fiber: 15, carbs: 39, fats: 23 },
      glycemicLoad: 'Very Low (GL 7)',
      satietyIndex: '9.8/10',
      palette: ['#6A994E', '#BC4749', '#2B2D42'],
      insight: 'Combines soluble fiber from black beans with monounsaturated avocado fats to sustain stable nocturnal blood glucose and prevent 3 AM cortisol wakes.',
      swaps: {
        protein: [
          { name: 'Lean Ground Turkey (165g)', pro: '+0g', kcal: 0 },
          { name: 'Scrambled Egg Whites + Whole Eggs', pro: '-6g', kcal: -40 },
          { name: 'Crumbled Tempeh Chorizo', pro: '-8g', kcal: -15 }
        ],
        base: [
          { name: 'Seasoned Black Beans & Zucchini', fiber: '12g' },
          { name: 'Cilantro-Lime Quinoa', fiber: '8g' }
        ]
      }
    }
  ]
};

const AI_PROMPTS = [
  {
    id: 'menu',
    chip: 'Scanning a restaurant menu—what should I order?',
    userText: "I'm dining out at an Indian-fusion bistro tonight. How do I hit ~40g protein without heavy seed oils or a huge glucose spike?",
    aiResponse: {
      summary: "I analyzed typical bistro prep methods. To avoid hidden inflammatory oils and heavy cream gravies, anchor your order around dry-rubbed tandoor or grill items.",
      recommendation: "Order the Tandoori Jhinga (Prawns) or Paneer Tikka Shashlik as your main, paired with a side of Dal Tadka (ask for light ghee, no cream) and a Kachumber salad.",
      swaps: [
        { avoid: "Butter Chicken / Dal Makhani (780+ kcal, heavy cream)", pick: "Chicken Tikka + Yellow Dal Tadka (520 kcal, 44g Protein)" },
        { avoid: "Garlic Naan (Refined Maida, GL 28)", pick: "1 Tandoori Roti (Whole Wheat) or Steamed Jeera Rice eaten last" }
      ],
      proTip: "Eat the cucumber-onion Kachumber salad 10 minutes before your carb portion—the acetic acid (vinegar/lime) and fiber reduce your post-meal glucose peak by up to 30%."
    }
  },
  {
    id: 'postworkout',
    chip: 'Need a 40g protein post-workout meal under 600 kcal',
    userText: "Just wrapped up a heavy 60-min resistance session. Need 40g+ protein under 600 kcal that I can assemble in 10 minutes.",
    aiResponse: {
      summary: "Post-hypertrophy training, your muscles have elevated GLUT4 translocation—meaning carbs will be shuttled directly into muscle glycogen rather than fat storage.",
      recommendation: "Whipped Greek Yogurt & Smoked Salmon / Paneer Power Toast + Berry Hemp Bowl",
      swaps: [
        { avoid: "Whey Shake Alone (Digests too fast, low satiety)", pick: "200g 0% Greek Yogurt/Skyr + 1 Scoop Unflavored Whey (42g Leucine-rich Protein)" },
        { avoid: "High-fat Nut Butter Overload", pick: "2 Slices Sourdough + 100g Grilled Paneer/Tofu + 1 tbsp Hemp Seeds (545 kcal total)" }
      ],
      proTip: "This hits the 3.2g Leucine threshold required to trigger mTOR muscle synthesis while keeping fats moderate (14g) so gastric emptying stays rapid."
    }
  },
  {
    id: 'supplements',
    chip: 'What supplements pair best with dinner tonight?',
    userText: "What micronutrient or supplement stack pairs best with tonight's dinner for recovery and deep sleep?",
    aiResponse: {
      summary: "Based on your 8:00 PM dinner window and today's high physical output, we want to synergize fat-soluble absorption during the meal and down-regulate your sympathetic nervous system afterward.",
      recommendation: "Targeted Evening Clinical Stack",
      swaps: [
        { avoid: "Taking Vitamin D3/K2 or Omega-3 on an empty stomach", pick: "Take Omega-3 (2g) + CoQ10 WITH dinner (the 21g healthy fats increase absorption 3x)" },
        { avoid: "Melatonin (can disrupt endogenous production)", pick: "300mg Magnesium Bisglycinate + 200mg L-Theanine 45 mins after dinner" }
      ],
      proTip: "Avoid high-dose Zinc at the exact same minute as Magnesium if your stomach is sensitive; space Zinc to lunch and keep Magnesium Bisglycinate for your wind-down window."
    }
  }
];

export default function App() {
  // Navigation & Global State
  const [activeTab, setActiveTab] = useState('plate'); // 'plate' | 'chat' | 'builder'
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState(GOALS[0]);
  const [selectedMood, setSelectedMood] = useState('all');
  const [selectedCuisine, setSelectedCuisine] = useState('indian');
  const [mealIndex, setMealIndex] = useState(0);
  const [loggedMeals, setLoggedMeals] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Customization Drawer State
  const [showCustomize, setShowCustomize] = useState(false);
  const [prepMode, setPrepMode] = useState('home'); // 'home' | 'dineout'
  const [oilLevel, setOilLevel] = useState('minimal'); // 'minimal' | 'standard'
  const [spiceLevel, setSpiceLevel] = useState('medium');
  const [selectedProteinSwap, setSelectedProteinSwap] = useState(0);
  const [selectedBaseSwap, setSelectedBaseSwap] = useState(0);

  // AI Dietitian Chat State
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'ai',
      time: '8:01 PM',
      text: "Good evening! Your biometric sync shows 62 mins of Zone 2/3 activity today and a slightly elevated resting heart rate. I've calibrated tonight's dinner for high-leucine protein and magnesium density.",
      structured: null
    }
  ]);
  const [customInput, setCustomInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Smart Plate Builder State (Portions in %)
  const [builderPortions, setBuilderPortions] = useState({
    protein: 35,
    veggies: 35,
    carbs: 20,
    fats: 10
  });
  const [builderPreset, setBuilderPreset] = useState('balanced');

  // Filter meals based on cuisine and mood
  const availableMeals = useMemo(() => {
    const cuisineList = MEALS_DB[selectedCuisine] || MEALS_DB.indian;
    const filtered = cuisineList.filter(m => selectedMood === 'all' || m.tags.includes(selectedMood));
    return filtered.length > 0 ? filtered : cuisineList;
  }, [selectedCuisine, selectedMood]);

  const currentMeal = availableMeals[mealIndex % availableMeals.length];

  // Calculate customized macros
  const adjustedMacros = useMemo(() => {
    let kcalMod = prepMode === 'dineout' ? 85 : 0;
    let fatMod = prepMode === 'dineout' ? 7 : 0;
    if (oilLevel === 'minimal') {
      kcalMod -= 35;
      fatMod -= 4;
    }
    const proMod = selectedProteinSwap === 1 ? 8 : selectedProteinSwap === 2 ? -5 : 0;
    return {
      kcal: currentMeal.kcal + kcalMod + (proMod * 4),
      protein: currentMeal.macros.protein + proMod,
      fiber: currentMeal.macros.fiber + (selectedBaseSwap === 1 ? 2 : 0),
      carbs: currentMeal.macros.carbs,
      fats: Math.max(8, currentMeal.macros.fats + fatMod)
    };
  }, [currentMeal, prepMode, oilLevel, selectedProteinSwap, selectedBaseSwap]);

  // Trigger toast notification
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Swap meal handler
  const handleSwapMeal = () => {
    setMealIndex((prev) => (prev + 1) % availableMeals.length);
    setSelectedProteinSwap(0);
    setSelectedBaseSwap(0);
    triggerToast('Curated next best bio-matched alternative');
  };

  // Log meal handler
  const handleLogMeal = () => {
    if (!loggedMeals.includes(currentMeal.id)) {
      setLoggedMeals([...loggedMeals, currentMeal.id]);
      triggerToast(`Logged "${currentMeal.title.split('&')[0]}..." (+${adjustedMacros.protein}g Protein)`);
    } else {
      triggerToast('Meal already logged to tonight’s timeline');
    }
  };

  // AI Prompt Handler
  const handleSelectPrompt = (promptObj) => {
    const userMsg = {
      sender: 'user',
      time: 'Just now',
      text: promptObj.userText
    };
    setChatHistory(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          time: 'Just now',
          text: promptObj.aiResponse.summary,
          structured: promptObj.aiResponse
        }
      ]);
    }, 650);
  };

  const handleSendCustomChat = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const text = customInput;
    setCustomInput('');
    setChatHistory(prev => [...prev, { sender: 'user', time: 'Just now', text }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          time: 'Just now',
          text: `Great question regarding "${text}". Based on your ${selectedGoal.label} goal, aim to anchor your plate with 35g+ complete protein and soluble fiber first.`,
          structured: {
            recommendation: "Prioritize whole-food protein + fermented sides to keep postprandial glucose steady under 125 mg/dL.",
            swaps: [
              { avoid: "Ultra-processed sauces or naked carbs", pick: "Protein + Greens first, Complex Starch 10 mins later" }
            ],
            proTip: "A 10-minute gentle stroll after eating improves glucose uptake into muscle tissue by 22%."
          }
        }
      ]);
    }, 650);
  };

  // Smart Plate Builder calculations
  const builderStats = useMemo(() => {
    const pGrams = Math.round(builderPortions.protein * 1.35);
    const cGrams = Math.round(builderPortions.carbs * 1.8);
    const vGrams = Math.round(builderPortions.veggies * 0.45);
    const fGrams = Math.round(builderPortions.fats * 1.9);
    const fiberGrams = Math.round((builderPortions.veggies * 0.28) + (builderPortions.carbs * 0.15));
    const totalKcal = (pGrams * 4) + ((cGrams + vGrams) * 4) + (fGrams * 9);
    const satiety = Math.min(9.9, (6.5 + (pGrams * 0.045) + (fiberGrams * 0.09))).toFixed(1);
    return { pGrams, cGrams, vGrams, fGrams, fiberGrams, totalKcal, satiety };
  }, [builderPortions]);

  const updatePortion = (key, delta) => {
    setBuilderPortions(prev => {
      const nextVal = Math.max(5, Math.min(65, prev[key] + delta));
      const diff = nextVal - prev[key];
      if (diff === 0) return prev;
      // Balance other sliders proportionally so total stays ~100%
      const otherKeys = Object.keys(prev).filter(k => k !== key);
      const updated = { ...prev, [key]: nextVal };
      let remainingDiff = diff;
      otherKeys.forEach((k, idx) => {
        const share = idx === otherKeys.length - 1 ? remainingDiff : Math.round(diff / otherKeys.length);
        updated[k] = Math.max(5, prev[k] - share);
        remainingDiff -= share;
      });
      const sum = Object.values(updated).reduce((a, b) => a + b, 0);
      if (sum !== 100) {
        updated[otherKeys[0]] += (100 - sum);
      }
      return updated;
    });
  };

  const applyBuilderPreset = (preset) => {
    setBuilderPreset(preset);
    if (preset === 'balanced') setBuilderPortions({ protein: 35, veggies: 35, carbs: 20, fats: 10 });
    if (preset === 'athletic') setBuilderPortions({ protein: 40, veggies: 25, carbs: 25, fats: 10 });
    if (preset === 'metabolic') setBuilderPortions({ protein: 35, veggies: 45, carbs: 10, fats: 10 });
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#1C2826] font-sans selection:bg-emerald-200 flex flex-col">
      {/* TOP BAR / DESIGN STUDIO SHELL HEADER */}
      <header className="w-full bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E5E0D5] px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1F4E3D] flex items-center justify-center text-[#FAF8F5] shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-base text-[#1C2826]">NutriPulse AI</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-900/10 text-emerald-900">
                Pocket Dietitian v2.4
              </span>
            </div>
            <p className="text-xs text-[#5C6B64] hidden sm:block">
              Clinical-Wellness Meal Intelligence & Real-Time Macro Triage
            </p>
          </div>
        </div>

        {/* QUICK SCREEN JUMPERS IN TOP BAR */}
        <div className="flex items-center gap-1.5 bg-[#EAE5D9] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('plate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'plate'
                ? 'bg-[#FAF8F5] text-[#1F4E3D] shadow-sm font-semibold'
                : 'text-[#5C6B64] hover:text-[#1C2826]'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            1. Smart Plate
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-[#FAF8F5] text-[#1F4E3D] shadow-sm font-semibold'
                : 'text-[#5C6B64] hover:text-[#1C2826]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            2. AI Dietitian
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'builder'
                ? 'bg-[#FAF8F5] text-[#1F4E3D] shadow-sm font-semibold'
                : 'text-[#5C6B64] hover:text-[#1C2826]'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            3. Plate Builder
          </button>
        </div>

        {/* INSPECTOR TOGGLE */}
        <button
          onClick={() => setInspectorOpen(!inspectorOpen)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
            inspectorOpen
              ? 'bg-[#1C2826] text-[#FAF8F5] border-[#1C2826]'
              : 'bg-white/70 text-[#1C2826] border-[#D8D2C5] hover:bg-white'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{inspectorOpen ? 'Hide Flow Inspector' : 'Show Flow Inspector'}</span>
        </button>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
        
        {/* CENTER INTERACTIVE MOBILE DEVICE MOCKUP */}
        <div className="w-full max-w-[430px] bg-[#FAF8F5] rounded-[42px] shadow-[0_25px_70px_-15px_rgba(28,40,38,0.18)] border-[8px] border-[#1C2826] overflow-hidden flex flex-col relative min-h-[820px] max-h-[860px]">
          
          {/* Simulated Mobile Status Bar */}
          <div className="bg-[#FAF8F5] px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-semibold text-[#1C2826] select-none shrink-0">
            <span>8:00 PM</span>
            <div className="w-24 h-4 bg-[#1C2826] rounded-full flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              <span className="text-[8px] text-emerald-200 tracking-wider uppercase">Bio-Sync</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-emerald-700 font-bold">98%</span>
              <div className="w-5 h-2.5 border border-[#1C2826] rounded-sm p-0.5 flex items-center">
                <div className="w-full h-full bg-[#1F4E3D] rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Toast Feedback Banner */}
          {toastMessage && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 w-[88%] bg-[#1C2826] text-[#FAF8F5] px-4 py-2.5 rounded-2xl shadow-lg text-xs font-medium flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">{toastMessage}</span>
            </div>
          )}

          {/* CONTEXT-AWARE TOP HEADER (Shared across tabs for seamless context) */}
          <div className="px-5 pt-1 pb-3 border-b border-[#EAE5D9] bg-[#FAF8F5] shrink-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs text-[#5C6B64] font-medium">
                <Moon className="w-3.5 h-3.5 text-amber-600" />
                <span>Dinner Recommendation • 8:00 PM</span>
              </div>
              <span className="text-[11px] font-semibold text-[#1F4E3D] bg-emerald-900/10 px-2 py-0.5 rounded-full">
                {loggedMeals.length > 0 ? '1 Meal Logged' : '580 kcal left'}
              </span>
            </div>

            {/* Interactive Goal Selector Pill */}
            <div className="flex items-center justify-between bg-[#F0ECE1] p-1.5 rounded-2xl">
              <div className="flex items-center gap-2 pl-1.5">
                <div className={`w-7 h-7 rounded-xl ${selectedGoal.bg} ${selectedGoal.color} flex items-center justify-center`}>
                  <selectedGoal.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-[#5C6B64]">
                    Active Bio-Goal
                  </div>
                  <div className="text-xs font-bold text-[#1C2826] leading-tight">
                    {selectedGoal.label}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  const nextIdx = (GOALS.findIndex(g => g.id === selectedGoal.id) + 1) % GOALS.length;
                  setSelectedGoal(GOALS[nextIdx]);
                  triggerToast(`Goal switched: ${GOALS[nextIdx].label}`);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-white text-[11px] font-semibold text-[#1F4E3D] shadow-sm transition active:scale-95"
              >
                Switch
              </button>
            </div>
          </div>

          {/* SCROLLABLE SCREEN CONTENT AREA */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            
            {/* =========================================================
                SCREEN 1: TODAY'S SMART PLATE (HOME / ENGINE)
               ========================================================= */}
            {activeTab === 'plate' && (
              <>
                {/* Cuisine Preference Switcher */}
                <div className="flex items-center justify-between gap-1 bg-[#EAE5D9]/70 p-1 rounded-2xl">
                  {CUISINES.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCuisine(c.id);
                        setMealIndex(0);
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all ${
                        selectedCuisine === c.id
                          ? 'bg-[#1F4E3D] text-white shadow-sm'
                          : 'text-[#5C6B64] hover:text-[#1C2826]'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* One-Tap Mood / Hunger Sliders */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {MOOD_FILTERS.map(filter => {
                    const IconComponent = filter.icon;
                    const active = selectedMood === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => {
                          setSelectedMood(filter.id);
                          setMealIndex(0);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 border ${
                          active
                            ? 'bg-[#1C2826] text-[#FAF8F5] border-[#1C2826] shadow-sm'
                            : 'bg-white text-[#5C6B64] border-[#E5E0D5] hover:border-[#1C2826]/40'
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                        {filter.label}
                      </button>
                    );
                  })}
                </div>

                {/* HERO MEAL RECOMMENDATION CARD */}
                <div className="bg-white rounded-3xl p-4 shadow-[0_8px_30px_rgb(28,40,38,0.06)] border border-[#EAE5D9] space-y-4 transition-all">
                  
                  {/* Top Visual Header with Custom Artisanal SVG Plate Illustration */}
                  <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#23493B] via-[#1C3B30] to-[#142A22] p-4 text-white">
                    <div className="flex items-start justify-between gap-2 relative z-10">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-400/20 text-emerald-200 backdrop-blur-md border border-emerald-300/20">
                        <Sparkles className="w-3 h-3 text-emerald-300" />
                        {currentMeal.matchScore}% Match for Today's Activity
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/25 text-stone-200 backdrop-blur-md">
                        <Clock className="w-3 h-3" />
                        {currentMeal.prepTime}
                      </span>
                    </div>

                    {/* Tactile Plate Visual & Title */}
                    <div className="mt-4 flex items-center gap-4 relative z-10">
                      {/* Custom Dynamic SVG Plate Representation */}
                      <div className="w-20 h-20 rounded-full bg-[#FAF8F5]/10 p-1.5 shrink-0 flex items-center justify-center shadow-inner border border-white/15">
                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
                          <circle cx="50" cy="50" r="46" fill="#FAF8F5" />
                          <circle cx="50" cy="50" r="40" fill="#F2EFE9" stroke="#E5E0D5" strokeWidth="1.5" />
                          {/* Protein Quadrant */}
                          <path d="M50,50 L50,12 A38,38 0 0,1 88,50 Z" fill={currentMeal.palette[0]} opacity="0.9" />
                          {/* Greens Quadrant */}
                          <path d="M50,50 L88,50 A38,38 0 0,1 22,76 Z" fill={currentMeal.palette[1]} opacity="0.9" />
                          {/* Complex Carbs Quadrant */}
                          <path d="M50,50 L22,76 A38,38 0 0,1 50,12 Z" fill={currentMeal.palette[2]} opacity="0.9" />
                          <circle cx="50" cy="50" r="12" fill="#FAF8F5" />
                          <text x="50" y="53" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1C2826">
                            {adjustedMacros.kcal}
                          </text>
                        </svg>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold leading-snug text-white">
                          {currentMeal.title}
                        </h2>
                        <p className="text-xs text-stone-300 mt-1 line-clamp-2 leading-relaxed">
                          {currentMeal.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Micro Badges */}
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-100/90">
                      <span>Glycemic Load: <strong>{currentMeal.glycemicLoad}</strong></span>
                      <span>Satiety: <strong>{currentMeal.satietyIndex}</strong></span>
                    </div>
                  </div>

                  {/* Macro Breakdown Pills */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-[#F4F1EA] rounded-2xl p-2.5 text-center border border-[#E5E0D5]/60">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#5C6B64]">Protein</div>
                      <div className="text-sm font-extrabold text-[#1F4E3D] mt-0.5">{adjustedMacros.protein}g</div>
                      <div className="text-[9px] text-emerald-700 font-medium">High Leucine</div>
                    </div>
                    <div className="bg-[#F4F1EA] rounded-2xl p-2.5 text-center border border-[#E5E0D5]/60">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#5C6B64]">Fiber</div>
                      <div className="text-sm font-extrabold text-[#1C2826] mt-0.5">{adjustedMacros.fiber}g</div>
                      <div className="text-[9px] text-[#5C6B64] font-medium">Prebiotic</div>
                    </div>
                    <div className="bg-[#F4F1EA] rounded-2xl p-2.5 text-center border border-[#E5E0D5]/60">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#5C6B64]">Carbs</div>
                      <div className="text-sm font-extrabold text-[#1C2826] mt-0.5">{adjustedMacros.carbs}g</div>
                      <div className="text-[9px] text-[#5C6B64] font-medium">Slow-Release</div>
                    </div>
                    <div className="bg-[#F4F1EA] rounded-2xl p-2.5 text-center border border-[#E5E0D5]/60">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#5C6B64]">Fats</div>
                      <div className="text-sm font-extrabold text-[#1C2826] mt-0.5">{adjustedMacros.fats}g</div>
                      <div className="text-[9px] text-[#5C6B64] font-medium">Omega Rich</div>
                    </div>
                  </div>

                  {/* WHY YOUR DIETITIAN PICKED THIS - Micro-Insight */}
                  <div className="bg-[#EFF6F2] border border-emerald-800/15 rounded-2xl p-3.5 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-[#1F4E3D] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#1F4E3D]">
                        Why Your Dietitian Picked This
                      </div>
                      <p className="text-xs text-[#2A3B35] leading-relaxed mt-0.5">
                        {currentMeal.insight}
                      </p>
                    </div>
                  </div>

                  {/* Expandable Customize Ingredients Drawer */}
                  {showCustomize && (
                    <div className="bg-[#FAF8F5] rounded-2xl p-3.5 border border-[#E5E0D5] space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1C2826] flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-[#1F4E3D]" />
                          Customize Ingredients & Prep
                        </span>
                        <button
                          onClick={() => setShowCustomize(false)}
                          className="text-[11px] font-semibold text-[#5C6B64] hover:text-[#1C2826]"
                        >
                          Done
                        </button>
                      </div>

                      {/* Cooking at Home vs Dining Out */}
                      <div className="grid grid-cols-2 gap-1.5 bg-[#EAE5D9] p-1 rounded-xl">
                        <button
                          onClick={() => setPrepMode('home')}
                          className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                            prepMode === 'home' ? 'bg-white text-[#1C2826] shadow-sm' : 'text-[#5C6B64]'
                          }`}
                        >
                          <ChefHat className="w-3.5 h-3.5" /> Cook at Home
                        </button>
                        <button
                          onClick={() => setPrepMode('dineout')}
                          className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                            prepMode === 'dineout' ? 'bg-white text-[#1C2826] shadow-sm' : 'text-[#5C6B64]'
                          }`}
                        >
                          <Store className="w-3.5 h-3.5" /> Ordering Out (+85 kcal)
                        </button>
                      </div>

                      {/* Protein Swap Selector */}
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B64] block mb-1">
                          Swap Primary Protein
                        </label>
                        <div className="space-y-1">
                          {currentMeal.swaps.protein.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedProteinSwap(idx)}
                              className={`w-full px-3 py-1.5 rounded-xl text-xs flex items-center justify-between border transition ${
                                selectedProteinSwap === idx
                                  ? 'bg-emerald-950/5 border-[#1F4E3D] font-semibold text-[#1F4E3D]'
                                  : 'bg-white border-[#E5E0D5] text-[#5C6B64]'
                              }`}
                            >
                              <span>{item.name}</span>
                              <span className="text-[11px] font-bold">{item.pro} Protein</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Oil / Ghee Calibration */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-medium text-[#5C6B64]">Cooking Fat / Ghee Spray:</span>
                        <div className="flex gap-1.5">
                          {['minimal', 'standard'].map(lvl => (
                            <button
                              key={lvl}
                              onClick={() => setOilLevel(lvl)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize border ${
                                oilLevel === lvl
                                  ? 'bg-[#1C2826] text-white border-[#1C2826]'
                                  : 'bg-white text-[#5C6B64] border-[#E5E0D5]'
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ONE-TAP ACTIONS BAR */}
                  <div className="grid grid-cols-12 gap-2 pt-1">
                    <button
                      onClick={handleSwapMeal}
                      className="col-span-4 py-2.5 px-3 rounded-2xl bg-[#F4F1EA] hover:bg-[#EAE5D9] text-[#1C2826] font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#1F4E3D]" />
                      Swap Meal
                    </button>
                    <button
                      onClick={() => setShowCustomize(!showCustomize)}
                      className={`col-span-4 py-2.5 px-3 rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 border ${
                        showCustomize
                          ? 'bg-emerald-900/10 border-[#1F4E3D] text-[#1F4E3D]'
                          : 'bg-white border-[#D8D2C5] text-[#1C2826] hover:bg-[#F4F1EA]'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      Customize
                    </button>
                    <button
                      onClick={handleLogMeal}
                      className="col-span-4 py-2.5 px-3 rounded-2xl bg-[#1F4E3D] hover:bg-[#173D2F] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {loggedMeals.includes(currentMeal.id) ? 'Logged' : 'Log Meal'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* =========================================================
                SCREEN 2: ASK YOUR AI DIETITIAN (CONVERSATIONAL TRIAGE)
               ========================================================= */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full space-y-3">
                {/* Dietitian Status Banner */}
                <div className="bg-white rounded-2xl p-3 border border-[#EAE5D9] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-[#1F4E3D] text-white flex items-center justify-center font-bold text-xs relative">
                      RD
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white absolute -bottom-0.5 -right-0.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1C2826]">Mira • Clinical AI Dietitian</div>
                      <div className="text-[11px] text-[#5C6B64]">Synced with CGM, Activity & Blood Panel</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectPrompt(AI_PROMPTS[0])}
                    className="px-2.5 py-1.5 rounded-xl bg-[#F4F1EA] hover:bg-[#EAE5D9] text-[#1F4E3D] text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Scan Menu
                  </button>
                </div>

                {/* Smart One-Tap Prompts Drawer */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B64] px-1">
                    Instant Clinical Triage Prompts (Tap to Test)
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {AI_PROMPTS.map(prompt => (
                      <button
                        key={prompt.id}
                        onClick={() => handleSelectPrompt(prompt)}
                        className="text-left px-3.5 py-2.5 rounded-2xl bg-white hover:bg-[#EFF6F2] border border-[#E5E0D5] hover:border-[#1F4E3D]/40 transition flex items-center justify-between group"
                      >
                        <span className="text-xs font-semibold text-[#1C2826] group-hover:text-[#1F4E3D]">
                          “{prompt.chip}”
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#5C6B64] group-hover:text-[#1F4E3D] shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Messages Stream */}
                <div className="space-y-3 pt-1">
                  {chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[92%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-[#1C2826] text-white rounded-br-sm'
                            : 'bg-white border border-[#EAE5D9] text-[#1C2826] rounded-bl-sm shadow-sm'
                        }`}
                      >
                        <p>{msg.text}</p>

                        {/* Structured Clinical Card inside AI Response */}
                        {msg.structured && (
                          <div className="mt-3 pt-3 border-t border-[#EAE5D9] space-y-2.5">
                            <div className="bg-[#EFF6F2] p-2.5 rounded-xl border border-emerald-900/10">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-[#1F4E3D]">
                                Top Dietitian Pick
                              </div>
                              <div className="text-xs font-bold text-[#1C2826] mt-0.5">
                                {msg.structured.recommendation}
                              </div>
                            </div>

                            {/* Smart Trade-off Swaps */}
                            <div className="space-y-1.5">
                              {msg.structured.swaps.map((s, idx) => (
                                <div key={idx} className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E5E0D5] text-[11px] space-y-1">
                                  <div className="text-rose-700 line-through opacity-80">
                                    Skip: {s.avoid}
                                  </div>
                                  <div className="text-[#1F4E3D] font-bold flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5 shrink-0" />
                                    Order: {s.pick}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Glucose / Bio Tip */}
                            <div className="text-[11px] text-[#5C6B64] italic bg-[#F4F1EA] px-2.5 py-2 rounded-xl">
                              💡 <strong>Clinical Hack:</strong> {msg.structured.proTip}
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-[#5C6B64] mt-1 px-1">{msg.time}</span>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="bg-white border border-[#EAE5D9] rounded-2xl px-4 py-3 inline-flex items-center gap-2 text-xs text-[#5C6B64]">
                      <Sparkles className="w-3.5 h-3.5 text-[#1F4E3D] animate-spin" />
                      Analyzing amino acid profile & glycemic load...
                    </div>
                  )}
                </div>

                {/* Chat Input Bar */}
                <form onSubmit={handleSendCustomChat} className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Ask about cravings, macros, or menus..."
                    className="flex-1 bg-white border border-[#D8D2C5] rounded-2xl px-3.5 py-2.5 text-xs text-[#1C2826] placeholder-[#5C6B64] focus:outline-none focus:border-[#1F4E3D]"
                  />
                  <button
                    type="submit"
                    className="w-9 h-9 rounded-2xl bg-[#1F4E3D] text-white flex items-center justify-center shrink-0 hover:bg-[#173D2F] transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* =========================================================
                SCREEN 3: SMART PLATE BUILDER & LIVE MACRO RING
               ========================================================= */}
            {activeTab === 'builder' && (
              <div className="space-y-4">
                {/* Preset Ratio Pills */}
                <div className="flex items-center justify-between gap-1.5 bg-[#EAE5D9] p-1 rounded-2xl">
                  {[
                    { id: 'balanced', label: 'Longevity Plate' },
                    { id: 'athletic', label: 'Post-Training' },
                    { id: 'metabolic', label: 'Glucose Steady' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => applyBuilderPreset(p.id)}
                      className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold transition ${
                        builderPreset === p.id
                          ? 'bg-white text-[#1C2826] shadow-sm'
                          : 'text-[#5C6B64] hover:text-[#1C2826]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Interactive Visual Plate & Real-time Macro Ring */}
                <div className="bg-white rounded-3xl p-4 border border-[#EAE5D9] shadow-sm flex flex-col items-center">
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#1C2826]">Interactive Portion Calibration</span>
                    <span className="text-[11px] font-bold text-[#1F4E3D] bg-emerald-900/10 px-2.5 py-0.5 rounded-full">
                      Satiety Score: {builderStats.satiety}/10
                    </span>
                  </div>

                  {/* Dynamic SVG Partitioned Plate */}
                  <div className="relative w-48 h-48 my-2 flex items-center justify-center">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      {/* Background Ring */}
                      <circle cx="18" cy="18" r="15.915" fill="#FAF8F5" stroke="#EAE5D9" strokeWidth="3.5" />
                      {/* Protein Segment */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="transparent"
                        stroke="#1F4E3D"
                        strokeWidth="4.2"
                        strokeDasharray={`${builderPortions.protein} ${100 - builderPortions.protein}`}
                        strokeDashoffset="0"
                      />
                      {/* Veggies / Fiber Segment */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="transparent"
                        stroke="#528265"
                        strokeWidth="4.2"
                        strokeDasharray={`${builderPortions.veggies} ${100 - builderPortions.veggies}`}
                        strokeDashoffset={`-${builderPortions.protein}`}
                      />
                      {/* Complex Carbs Segment */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="transparent"
                        stroke="#D98A4E"
                        strokeWidth="4.2"
                        strokeDasharray={`${builderPortions.carbs} ${100 - builderPortions.carbs}`}
                        strokeDashoffset={`-${builderPortions.protein + builderPortions.veggies}`}
                      />
                      {/* Healthy Fats Segment */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="transparent"
                        stroke="#E2B857"
                        strokeWidth="4.2"
                        strokeDasharray={`${builderPortions.fats} ${100 - builderPortions.fats}`}
                        strokeDashoffset={`-${builderPortions.protein + builderPortions.veggies + builderPortions.carbs}`}
                      />
                    </svg>

                    {/* Center Live Readout */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B64]">Estimated</span>
                      <span className="text-2xl font-extrabold text-[#1C2826]">{builderStats.totalKcal}</span>
                      <span className="text-[11px] font-semibold text-[#1F4E3D]">kcal • {builderStats.pGrams}g Pro</span>
                    </div>
                  </div>

                  {/* Interactive Portion Adjusters */}
                  <div className="w-full space-y-2.5 mt-2">
                    {[
                      { key: 'protein', label: 'Clean Protein', sub: `${builderStats.pGrams}g (Paneer, Fish, Poultry, Tofu)`, color: 'bg-[#1F4E3D]' },
                      { key: 'veggies', label: 'Non-Starchy Greens & Fiber', sub: `${builderStats.fiberGrams}g total fiber`, color: 'bg-[#528265]' },
                      { key: 'carbs', label: 'Complex Slow Carbs', sub: `${builderStats.cGrams}g (Millets, Quinoa, Root Veg)`, color: 'bg-[#D98A4E]' },
                      { key: 'fats', label: 'Healthy Fats & Seeds', sub: `${builderStats.fGrams}g (Avocado, Ghee, Walnuts)`, color: 'bg-[#E2B857]' }
                    ].map(item => (
                      <div key={item.key} className="bg-[#FAF8F5] p-2.5 rounded-2xl border border-[#EAE5D9] flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-3 h-8 rounded-full ${item.color}`} />
                          <div>
                            <div className="text-xs font-bold text-[#1C2826]">
                              {item.label} <span className="text-[#1F4E3D]">({builderPortions[item.key]}%)</span>
                            </div>
                            <div className="text-[10px] text-[#5C6B64]">{item.sub}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updatePortion(item.key, -5)}
                            className="w-7 h-7 rounded-xl bg-white border border-[#D8D2C5] flex items-center justify-center text-[#1C2826] hover:bg-[#EAE5D9] active:scale-95"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => updatePortion(item.key, 5)}
                            className="w-7 h-7 rounded-xl bg-white border border-[#D8D2C5] flex items-center justify-center text-[#1C2826] hover:bg-[#EAE5D9] active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('plate');
                      triggerToast(`Applied ${builderStats.totalKcal} kcal custom plate template`);
                    }}
                    className="w-full mt-3 py-2.5 rounded-2xl bg-[#1F4E3D] text-white text-xs font-semibold hover:bg-[#173D2F] transition"
                  >
                    Generate Meals Matching This Ratio
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* BOTTOM CLINICAL TAB NAVIGATION BAR */}
          <nav className="bg-white border-t border-[#EAE5D9] px-6 py-2.5 flex items-center justify-around shrink-0">
            <button
              onClick={() => setActiveTab('plate')}
              className={`flex flex-col items-center gap-1 transition ${
                activeTab === 'plate' ? 'text-[#1F4E3D]' : 'text-[#5C6B64] hover:text-[#1C2826]'
              }`}
            >
              <Utensils className="w-5 h-5" />
              <span className="text-[10px] font-bold">Smart Plate</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center gap-1 transition relative ${
                activeTab === 'chat' ? 'text-[#1F4E3D]' : 'text-[#5C6B64] hover:text-[#1C2826]'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-[10px] font-bold">AI Dietitian</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-0 right-2" />
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`flex flex-col items-center gap-1 transition ${
                activeTab === 'builder' ? 'text-[#1F4E3D]' : 'text-[#5C6B64] hover:text-[#1C2826]'
              }`}
            >
              <PieChart className="w-5 h-5" />
              <span className="text-[10px] font-bold">Plate Builder</span>
            </button>
          </nav>
        </div>

        {/* COMPANION DESIGN & FLOW INSPECTOR PANEL */}
        {inspectorOpen && (
          <aside className="w-full lg:w-80 bg-[#FAF8F5] rounded-3xl p-5 border border-[#E5E0D5] shadow-sm space-y-5 shrink-0">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#1F4E3D] bg-emerald-900/10 px-2.5 py-1 rounded-full mb-2">
                <Compass className="w-3.5 h-3.5" />
                UX Architecture & Flows
              </div>
              <h3 className="text-base font-bold text-[#1C2826]">
                Interactive Prototype Guide
              </h3>
              <p className="text-xs text-[#5C6B64] mt-1 leading-relaxed">
                Designed with a calm, clinical-wellness palette inspired by Oura, Zoe, and Apple Health—replacing tedious calorie counting with actionable biometric meal matching.
              </p>
            </div>

            {/* Interactive Flow Checklist */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#5C6B64]">
                Try These Interactive Micro-Flows
              </div>

              <div
                onClick={() => setActiveTab('plate')}
                className={`p-3 rounded-2xl border cursor-pointer transition ${
                  activeTab === 'plate'
                    ? 'bg-white border-[#1F4E3D] shadow-sm'
                    : 'bg-[#F4F1EA]/60 border-[#E5E0D5] hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold text-[#1C2826] flex items-center justify-between">
                  <span>1. Today’s Smart Plate</span>
                  <ChevronRight className="w-4 h-4 text-[#1F4E3D]" />
                </div>
                <p className="text-[11px] text-[#5C6B64] mt-1">
                  Toggle between <strong>Indian Regional</strong> & <strong>Mediterranean</strong>, filter by mood, tap <strong>Customize</strong> to swap proteins or dining-out oil levels, or cycle meals via <strong>Swap Meal</strong>.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('chat')}
                className={`p-3 rounded-2xl border cursor-pointer transition ${
                  activeTab === 'chat'
                    ? 'bg-white border-[#1F4E3D] shadow-sm'
                    : 'bg-[#F4F1EA]/60 border-[#E5E0D5] hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold text-[#1C2826] flex items-center justify-between">
                  <span>2. Ask Your AI Dietitian</span>
                  <ChevronRight className="w-4 h-4 text-[#1F4E3D]" />
                </div>
                <p className="text-[11px] text-[#5C6B64] mt-1">
                  Tap any of the 3 real-world triage chips (Menu Scanner, 40g Post-Workout, Evening Supplement Stack) to see structured clinical swaps.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('builder')}
                className={`p-3 rounded-2xl border cursor-pointer transition ${
                  activeTab === 'builder'
                    ? 'bg-white border-[#1F4E3D] shadow-sm'
                    : 'bg-[#F4F1EA]/60 border-[#E5E0D5] hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold text-[#1C2826] flex items-center justify-between">
                  <span>3. Visual Plate & Macro Ring</span>
                  <ChevronRight className="w-4 h-4 text-[#1F4E3D]" />
                </div>
                <p className="text-[11px] text-[#5C6B64] mt-1">
                  Use the <strong>+ / -</strong> portion buttons to dynamically rebalance the plate and observe real-time updates to Satiety Score, Fiber, and Protein.
                </p>
              </div>
            </div>

            {/* Live Biometric Context Summary */}
            <div className="bg-[#EFF6F2] rounded-2xl p-3.5 border border-emerald-900/10 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#1F4E3D]">
                Simulated User Context
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#5C6B64]">Active Goal:</span>
                <span className="font-bold text-[#1C2826]">{selectedGoal.label.split('&')[0]}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#5C6B64]">Selected Cuisine:</span>
                <span className="font-bold text-[#1C2826] capitalize">{selectedCuisine}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#5C6B64]">Current Meal Match:</span>
                <span className="font-bold text-[#1F4E3D]">{currentMeal.matchScore}% Optimal</span>
              </div>
            </div>
          </aside>
        )}

      </div>
    </div>
  );
}