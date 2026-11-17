// The exemptions the word net reads before its lists, and the allowed set of each (fix-r13; safety audit of 9dd1b13, B1): this test's own
// copy, written apart from the engine (src/v5/core.js and src/v6/engine.js), read by test/safety/carve.js (the generated grid) and by
// test/safety/recorded.js (an exemption phrase in a shown recorded name is honest only when its neighbours are in its set).
// A token is the run of characters with no space next to the phrase; the start or end of the text, a comma, semicolon, colon, full stop,
// question or exclamation mark or bracket is nothing; any other mark is a token no set holds.
const set = w => new RegExp('^(?:' + w + ')$');
// each phrase holds a listed word (bhakri, rotla and thalipeeth are not on the wheat list, so they are no exemption)
const MILLETS = ['bajra roti', 'jowar roti', 'jowar rotis', 'makki ki roti', 'ragi roti', 'nachni chapati', 'rajgira paratha', 'kuttu puri', 'singhara puri', 'bajre ki roti', 'jowar atta roti', 'ragi flour roti'];
const RICEBREADS = ['rice roti', 'chawal ki roti', 'akki roti', 'rice paratha'];
const PLANTMILK = ['coconut milk', 'almond milk', 'oat milk', 'soy milk', 'soya milk', 'rice milk', 'cashew milk', 'soy curd', 'soya curd', 'coconut yogurt', 'coconut yoghurt', 'soy yogurt', 'soya yogurt'];
const PLANTFAT = ['coconut cream', 'cashew cream', 'peanut butter', 'almond butter'];
const NEGPRE = 'with|and|but|served|cooked|made|prepared|plain|warm|small|rotis?|phulkas?|chapatis?|parathas?|flatbread|curry|dal|sabzi|chutney|salad|raita|greens|ghugni|bhaja|paste|chana|milk|tea|coffee|dish|dry';
const D = { health: 'diabetes' }, DV = { diet: 'veg', health: 'diabetes' }, VEGAN = { diet: 'vegan' }, NODAIRY = { leave: ['dairy'] }, NOWHEAT = { leave: ['wheat'] }, VEG = { diet: 'veg' };
const FOOD = [
  { id: 'lemon or lime juice (S4)', cls: 'sweet', rx: /\b(?:lemon|lime|nimbu|amla)\s+juice\b/g, word: /juice/, phrases: ['lemon juice', 'lime juice', 'nimbu juice', 'amla juice'], profiles: [D, DV],
    pre: set('fresh|tangy|with|tsps?|tbsps?|teaspoons?|tablespoons?|spoons?|spoonfuls?'), post: set('and|with|squeeze|squeezed|dressing') },
  { id: 'rice cakes (S4)', cls: 'sweet', rx: /\brice\s+cakes?\b/g, word: /cakes?/, phrases: ['rice cakes', 'rice cake'], profiles: [D], pre: set('plain|puffed|brown'), post: set('and|with') },
  { id: 'sugar snap peas (S4)', cls: 'sweet', rx: /\bsugar\s+snap\b/g, word: /sugar/, phrases: ['sugar snap'], tail: ' peas', profiles: [D], pre: set('with|fresh|steamed|sauteed|blanched|fried|stir'), post: set('peas?') },
  { id: 'plant milk, curd, yogurt (S1, S2)', cls: 'dairy', rx: /\b(?:coconut|almond|oat|soya?|rice|cashew)\s+(?:milk|curd|yogh?urt)\b/g, word: /milk|curd|yogh?urt/, phrases: PLANTMILK, profiles: [VEGAN, NODAIRY], pre: set('with|in|of|on|plus|or|using|a|an|the|plain|light|thin|fresh|unsweetened'),
    post: set('with|and|plain|strained|curry|rice|korma|gravy|masala|porridge|stew') },
  { id: 'plant cream, nut butter (S1, S2)', cls: 'dairy', rx: /\b(?:coconut\s+cream|cashew\s+cream|peanut\s+butter|almond\s+butter)\b/g, word: /cream|butter/, phrases: PLANTFAT, profiles: [VEGAN, NODAIRY], pre: set('with|in|of|on|plus|or|using|a|an|the|plain|light|thin|fresh|unsweetened'), post: set('with|and|toast') },
  { id: 'millet flatbread, not wheat (S1)', cls: 'wheat', rx: /\b(?:bajra|bajre|bajri|jowar|jwari|makki|makai|maize|ragi|nachni|rajgira|kuttu|singhara|singhare)(?:\s+(?:ki|di|ka|ke|da|de|atta|flour))*\s+(?:rotis?|rotti|rotlas?|rotlis?|bhakris?|chapatis?|parathas?|puris?|thalipeeth)\b/g, word: /\w+$/, phrases: MILLETS, profiles: [NOWHEAT],
    pre: set('with|on|alongside|a|an|the|one|two|\\d+|millet|warm|hot|small|soft|crisp|toasted|roasted|fresh|rustic|plain|cooked|ready|handmade|hand-patted|thin|downsize|reduce'),
    post: set('and|with|without|alongside|crackers?|to|weight') },
  { id: 'rice flatbread, not wheat (S1)', cls: 'wheat', rx: /\b(?:rice|chawal|akki)(?:\s+(?:ki|di|ka|ke|da|de|atta|flour))*\s+(?:rotis?|rotti|rotlas?|rotlis?|bhakris?|chapatis?|parathas?|puris?|thalipeeth)\b/g, word: /\w+$/, phrases: RICEBREADS, profiles: [NOWHEAT], pre: set('with|on|alongside|a|an|the|one|two|\\d+'), post: set('and|with|without|alongside|crackers?|to|weight') },
  { id: 'rice and millet noodles, not wheat (S1)', cls: 'wheat', rx: /\b(?:rice|ragi|millet|glass|jowar|konjac|shirataki)\s+(?:noodles?|vermicelli|pasta|sevai)\b/g, word: /\w+$/, phrases: ['rice noodles', 'ragi noodles', 'millet pasta', 'glass noodles', 'jowar vermicelli', 'rice sevai', 'konjac noodles', 'shirataki noodles', 'rice noodle'],
    profiles: [NOWHEAT], pre: set('with|in|plain|thin|flat'), post: set('with|and|salad|soup|bowl|stir') },
  { id: 'millet and rice bread, not wheat (S1)', cls: 'wheat', rx: /\b(?:jowar|bajra|ragi|millet|rice|gluten[\s-]free)\s+(?:bread|breads|toast)\b/g, word: /\w+$/, phrases: ['jowar bread', 'bajra bread', 'ragi toast', 'millet bread', 'rice bread', 'gluten-free bread'], profiles: [NOWHEAT], pre: set('with|plain|soft'), post: set('with|and') },
  { id: 'plant keema, not meat (S2)', cls: 'meat', rx: /\b(?:soya|soy|mushroom|kathal|jackfruit|veg|vegetable|paneer|tofu|nutrela)\s+(?:keema|kheema)\b/g, word: /\w+$/, phrases: ['soya keema', 'mushroom keema', 'paneer keema', 'kathal keema', 'jackfruit keema', 'tofu kheema', 'veg keema', 'nutrela keema'], profiles: [VEG],
    pre: set('with'), post: set('matar|mutter|peas|masala|curry|with|and') },
  { id: 'sol kadhi, not dairy (S1, S2)', cls: 'dairy', rx: /\bsol\s+kadhi\b/g, word: /kadhi/, phrases: ['sol kadhi'], profiles: [VEGAN, NODAIRY], pre: set('with'), post: set('with|and|rice') },
  { id: 'butter beans, not dairy (S1, S2)', cls: 'dairy', rx: /\bbutter\s+beans?\b/g, word: /butter/, phrases: ['butter beans', 'butter bean'], profiles: [VEGAN, NODAIRY], pre: set('with|in|a|the'), post: set('with|and|curry|salad|sabzi|masala') },
  { id: 'negation, one word (S1)', phrases: ['no ghee', 'without ghee', 'skip ghee', 'skip the ghee', 'hold the ghee', 'minus ghee', 'instead of ghee', 'swap out ghee', 'leave out ghee', 'without butter', 'no paneer', 'without curd'],
    profiles: [NODAIRY], pre: set(NEGPRE), post: set('and|with|but') },
  { id: 'negation, one word (S2, S4)', phrases: ['no sugar', 'without sugar', 'without jaggery', 'no egg', 'without eggs'], profiles: [DV], pre: set(NEGPRE), post: set('and|with|but') },
  { id: '-free (S1)', phrases: ['ghee-free', 'butter-free'], profiles: [NODAIRY], pre: set(NEGPRE), post: set('and|with|but|cakes?|biscuits?|cookies?|bread|mayo|mayonnaise|omelettes?|chutney|version') },
  { id: '-free (S2, S4)', phrases: ['sugar-free', 'egg-free'], profiles: [DV], pre: set(NEGPRE), post: set('and|with|but|cakes?|biscuits?|cookies?|bread|mayo|mayonnaise|omelettes?|chutney|version') }];
// S7: an exemption that keeps typed text from being referred. "shown" = not referred.
const TYPED = [
  { id: 'kidney beans (S7)', phrases: ['kidney beans', 'kidney bean', 'kidney-beans', 'kidneybeans', 'kydney beans', 'kednee beans'], plain: 'rajma',
    pre: set('red|white|rajma|with|of|in|a|the|some|had|have|eat|ate|cooked|boiled|soaked|sprouted|canned'), post: set('curry|salad|masala|rice|chawal|soup|sabzi|chaat|sundal|and|with|for|in|ok|today|tonight') },
  { id: 'prego the sauce (S7)', phrases: ['prego sauce', 'prego pasta', 'prego tomato sauce'], plain: 'tomato sauce',
    // a sauce or pasta word right before "prego" makes it the sauce too ("Pasta with Prego sauce", "Penne prego")
    pre: set('with|in|of|and|or|a|the|some|use|using|buy|bought|add|sauces?|pasta|spaghetti|penne|macaroni|fusilli|lasagn\\w*|marinara|alfredo|arrabbiata|pizza|ravioli|noodles'), post: set('with|and|or|in|on|for|ok|today|tonight|traditional|italian|tomato|basil|garlic|mushroom|white|red|creamy|sauces?|pasta|spaghetti|penne|macaroni|fusilli|lasagn\\w*|marinara|alfredo|arrabbiata|pizza|ravioli|noodles') }];
// S7 exemptions written as "the word right after must be one of these" (space or hyphen between): only the post side
const NEXT = [
  { id: 'baby corn and the like (S7)', head: 'delivered a baby', plain: 'we ate', refer: true, ok: set('corn|potato\\w*|spinach|carrots?|onions?|tomato\\w*|brinjals?|eggplants?|food|marrows?|lettuce|greens|leaf|leaves') },
  { id: 'tri-colour (S7)', head: 'third tri', plain: 'third plate', refer: true, ok: set('colou?r(?:ed|s)?') },
  { id: 'low sugar food (S7 urgent)', head: 'low sugar', plain: 'low salt', refer: true, ok: set('free|desserts?|sweets?|biscuits?|cookies?|cakes?|chai|tea|coffee|version|recipes?|snacks?|juices?|drinks?') },
  { id: 'expecting guests (S7)', head: 'expecting', plain: 'having', refer: true, ok: set('guests?|company|visitors?|friends?|people|family|relatives|someone|somebody|some|my|our|his|her|their|the|to|that|this|it|food|delivery') }];

const STOP = /[,;:.?!()\[\]]/;
const preTok = (s, i) => { const h = s.slice(0, i).replace(/\s+$/, ''); if (!h) return ''; const m = /\S+$/.exec(h)[0]; return STOP.test(m.charAt(m.length - 1)) ? '' : m.replace(/^[,;:.?!()\[\]]+/, ''); };
const postTok = (s, j) => { const h = s.slice(j).replace(/^\s+/, ''); if (!h) return ''; const m = /^\S+/.exec(h)[0]; return STOP.test(m.charAt(0)) ? '' : m.replace(/[,;:.?!()\[\]]+$/, ''); };
// the name with each exemption phrase of class cls blanked where its neighbours are in its set (the listed word only), lower case
const honest = (s, cls) => { let t = String(s).toLowerCase();
  for (const e of FOOD) if (e.cls === cls && e.rx) t = t.replace(e.rx, (m, i, str) => { const b = preTok(str, i), a = postTok(str, i + m.length);
    return (!b || e.pre.test(b)) && (!a || e.post.test(a)) ? m.replace(e.word, w => ' '.repeat(w.length)) : m; });
  return t; };
module.exports = { FOOD, TYPED, NEXT, D, DV, VEGAN, NODAIRY, NOWHEAT, VEG, preTok, postTok, honest };
