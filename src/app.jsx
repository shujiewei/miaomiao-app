/* 喵喵小百科 - 主应用 (React + Babel standalone)
 * 4 个模块：图鉴 / 答题 / 猫的一天 / 我的喵日记
 */
const { useState, useEffect, useRef, useMemo, useCallback } = React;
const DATA = window.MIAO;

// ============================================================
// 🎵 Web Audio 简易合成 - 不依赖任何外部音频文件
// ============================================================
const AudioFX = (() => {
  let ctx = null;
  const ensure = () => {
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
      } catch (e) { /* iOS / older */ }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  };

  const env = (osc, gain, t0, attack, hold, release, peak = 0.3) => {
    gain.gain.cancelScheduledValues(t0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + attack);
    gain.gain.setValueAtTime(peak, t0 + attack + hold);
    gain.gain.linearRampToValueAtTime(0, t0 + attack + hold + release);
    osc.start(t0);
    osc.stop(t0 + attack + hold + release + 0.02);
  };

  return {
    meow() {
      const c = ensure(); if (!c) return;
      const t = c.currentTime;
      const o = c.createOscillator(); const g = c.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(380, t);
      o.frequency.exponentialRampToValueAtTime(720, t + 0.12);
      o.frequency.exponentialRampToValueAtTime(280, t + 0.45);
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1600;
      o.connect(f); f.connect(g); g.connect(c.destination);
      env(o, g, t, 0.04, 0.30, 0.18, 0.25);
    },
    purr() {
      const c = ensure(); if (!c) return;
      const t = c.currentTime;
      const o = c.createOscillator(); const g = c.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(46, t);
      const lfo = c.createOscillator(); const lfoGain = c.createGain();
      lfo.frequency.value = 24; lfoGain.gain.value = 0.18;
      lfo.connect(lfoGain); lfoGain.connect(g.gain);
      o.connect(g); g.connect(c.destination);
      g.gain.setValueAtTime(0.22, t);
      g.gain.setValueAtTime(0.22, t + 1.0);
      g.gain.linearRampToValueAtTime(0, t + 1.4);
      o.start(t); lfo.start(t);
      o.stop(t + 1.4); lfo.stop(t + 1.4);
    },
    click() {
      const c = ensure(); if (!c) return;
      const t = c.currentTime;
      const o = c.createOscillator(); const g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(880, t);
      o.frequency.exponentialRampToValueAtTime(440, t + 0.07);
      o.connect(g); g.connect(c.destination);
      env(o, g, t, 0.005, 0.02, 0.05, 0.15);
    },
    correct() {
      const c = ensure(); if (!c) return;
      const t = c.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const o = c.createOscillator(); const g = c.createGain();
        o.type = 'triangle'; o.frequency.value = freq;
        o.connect(g); g.connect(c.destination);
        env(o, g, t + i * 0.07, 0.01, 0.05, 0.18, 0.22);
      });
    },
    wrong() {
      const c = ensure(); if (!c) return;
      const t = c.currentTime;
      const o = c.createOscillator(); const g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(330, t);
      o.frequency.linearRampToValueAtTime(220, t + 0.25);
      o.connect(g); g.connect(c.destination);
      env(o, g, t, 0.01, 0.12, 0.20, 0.18);
    },
    pop() {
      const c = ensure(); if (!c) return;
      const t = c.currentTime;
      const o = c.createOscillator(); const g = c.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(900, t);
      o.frequency.exponentialRampToValueAtTime(600, t + 0.06);
      o.connect(g); g.connect(c.destination);
      env(o, g, t, 0.005, 0.01, 0.05, 0.12);
    },
    chime() {
      const c = ensure(); if (!c) return;
      const t = c.currentTime;
      [659.25, 987.77, 1318.51].forEach((freq, i) => {
        const o = c.createOscillator(); const g = c.createGain();
        o.type = 'sine'; o.frequency.value = freq;
        o.connect(g); g.connect(c.destination);
        env(o, g, t + i * 0.05, 0.005, 0.08, 0.25, 0.18);
      });
    }
  };
})();

// ============================================================
// 💾 useLocalStorage hook
// ============================================================
function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? initial : JSON.parse(raw);
    } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key, val]);
  return [val, setVal];
}

// ============================================================
// 🐟 每日小鱼干上限 - 防止刷题囤鱼
// ============================================================
const DAILY_FISH_CAP = 20;
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function fishTodayOf(u) {
  return u.lastFishDate === todayStr() ? (u.fishToday || 0) : 0;
}
function remainingFishToday(u) {
  return Math.max(0, DAILY_FISH_CAP - fishTodayOf(u));
}
// 把请求的鱼干数限制在今日剩余上限内，返回 { grant, capped, patch }
function applyFishCap(u, requested) {
  const today = todayStr();
  const fishToday = u.lastFishDate === today ? (u.fishToday || 0) : 0;
  const grant = Math.max(0, Math.min(requested, DAILY_FISH_CAP - fishToday));
  return {
    grant,
    capped: grant < requested,
    patch: {
      fishCoins: u.fishCoins + grant,
      totalFishEarned: (u.totalFishEarned || 0) + grant,
      fishToday: fishToday + grant,
      lastFishDate: today
    }
  };
}

// ============================================================
// 🍱 喂养 / 休眠 / 性别 / 繁殖 - 共享常量与小工具 (v0.11)
// ============================================================
const HUNGER_HOURS_PECKISH = 24;   // 24h 后开始有点饿
const HUNGER_HOURS_HUNGRY  = 48;   // 48h 好饿
const HUNGER_HOURS_DORMANT = 72;   // 72h 进入休眠
const WILD_HUNGER_MULT     = 1.5;  // 野生猫科：饿/休眠都慢 1.5 倍
const DORMANT_RECYCLE_DAYS = 10;   // 睡满 10 天 → 自动回猫舍
const PAIR_BOND_DAYS       = 20;   // 一对配偶共度 20 天 → 一窝小猫
const FEED_WAKE_COST       = 2;    // 喂醒休眠猫要 2 🐟（普通喂食 1 🐟）

function getBreed(breedId) {
  return DATA.breeds.find(b => b.id === breedId);
}
function isWildCat(cat, breed) {
  return !!((breed || getBreed(cat.breedId))?.wild);
}
function hashStrToBool(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return (h & 1) === 0;
}
function deterministicGender(cat, breed) {
  return hashStrToBool(cat.id || '') ? 'F' : 'M';
}
function randomGender() {
  return Math.random() < 0.5 ? 'M' : 'F';
}
function genderLabel(g) {
  return g === 'F' ? '♀ 母' : '♂ 公';
}
function genderColor(g) {
  return g === 'F' ? '#e57399' : '#4f86d6';
}

// 计算饱腹/休眠状态。lazy — 只读，不写入 state。
// stage: 'full' | 'peckish' | 'hungry' | 'dormant' | 'should_dormant'
function hungerStateOf(cat, breed) {
  if (!cat) return null;
  const isWild = isWildCat(cat, breed);
  const mul = isWild ? WILD_HUNGER_MULT : 1;
  const since = cat.lastFedAt || cat.adoptedAt || Date.now();
  const hours = (Date.now() - since) / (1000 * 3600);
  if (cat.dormant) {
    return { stage: 'dormant', emoji: '😴', label: '已睡着', hours, mul, isWild };
  }
  if (hours < HUNGER_HOURS_PECKISH * mul)
    return { stage: 'full',     emoji: '😺', label: '饱饱的',   hours, mul, isWild };
  if (hours < HUNGER_HOURS_HUNGRY  * mul)
    return { stage: 'peckish',  emoji: '😼', label: '有点饿了', hours, mul, isWild };
  if (hours < HUNGER_HOURS_DORMANT * mul)
    return { stage: 'hungry',   emoji: '😿', label: '好饿好饿', hours, mul, isWild };
  return { stage: 'should_dormant', emoji: '😴', label: '快睡着了', hours, mul, isWild };
}

// 把"应该休眠"的猫标记为休眠，并把"睡满 10 天"的猫送回猫舍。
// 返回新的 user 对象（如果什么都没变就返回 null）。
function applyDormancyCleanup(user) {
  const now = Date.now();
  let changed = false;
  let myCats = user.myCats.map(c => c);
  let activeCatId = user.activeCatId;
  let returnedCats = [];

  // 1) 应该休眠的猫
  myCats = myCats.map(c => {
    if (c.dormant) return c;
    const breed = getBreed(c.breedId);
    const mul = (breed && breed.wild) ? WILD_HUNGER_MULT : 1;
    const since = c.lastFedAt || c.adoptedAt || now;
    const hours = (now - since) / (1000 * 3600);
    if (hours >= HUNGER_HOURS_DORMANT * mul) {
      changed = true;
      return { ...c, dormant: true, dormantSince: now - (hours - HUNGER_HOURS_DORMANT * mul) * 3600 * 1000 };
    }
    return c;
  });

  // 2) 睡满 10 天的猫送回猫舍
  myCats = myCats.filter(c => {
    if (c.dormant && c.dormantSince) {
      const days = (now - c.dormantSince) / (1000 * 3600 * 24);
      if (days >= DORMANT_RECYCLE_DAYS) {
        changed = true;
        returnedCats.push(c);
        return false;
      }
    }
    return true;
  });

  if (myCats.length === 0 && returnedCats.length > 0) {
    // 至少留一只——如果全被回收，把回收时间最短的那只"留"在家，其他真送走
    const all = [...returnedCats].sort((a, b) => (b.dormantSince || 0) - (a.dormantSince || 0));
    const keep = all[0];
    myCats.push({ ...keep, dormant: false, dormantSince: null, lastFedAt: now, intimacy: Math.max(40, keep.intimacy || 60) });
    returnedCats = all.slice(1);
  }

  if (myCats.length > 0 && !myCats.find(c => c.id === activeCatId)) {
    activeCatId = myCats[0].id;
  }
  if (!changed) return { user, returnedCats: [] };
  return {
    user: { ...user, myCats, activeCatId },
    returnedCats
  };
}

// 一次性数据迁移 - 把缺字段的旧 cat / user 升级到 v0.11 schema
function migrateUserToV011(user) {
  const now = Date.now();
  let changed = false;
  const myCats = user.myCats.map(c => {
    const out = { ...c };
    if (!out.gender) {
      const breed = getBreed(out.breedId);
      out.gender = deterministicGender(out, breed);
      changed = true;
    }
    if (!out.lastFedAt) {
      out.lastFedAt = out.adoptedAt || now;
      changed = true;
    }
    if (typeof out.dormant === 'undefined') {
      out.dormant = false;
      out.dormantSince = null;
      changed = true;
    }
    if (!out.generation) {
      out.generation = 1;
      changed = true;
    }
    return out;
  });
  const out = { ...user, myCats };
  if (typeof out.totalKittens !== 'number') { out.totalKittens = 0; changed = true; }
  if (!out.pairBonds || typeof out.pairBonds !== 'object') { out.pairBonds = {}; changed = true; }
  return changed ? out : user;
}

// 找出当前所有合格的繁殖对。返回 [{ key, m, f }]
function findEligiblePairs(cats) {
  const out = [];
  for (let i = 0; i < cats.length; i++) {
    for (let j = i + 1; j < cats.length; j++) {
      const a = cats[i], b = cats[j];
      if (a.gender === b.gender) continue;
      const ba = getBreed(a.breedId);
      const bb = getBreed(b.breedId);
      if (!ba || !bb) continue;
      if (ba.wild || bb.wild) continue;
      if (a.dormant || b.dormant) continue;
      if ((a.intimacy || 0) < 60 || (b.intimacy || 0) < 60) continue;
      const m = a.gender === 'M' ? a : b;
      const f = a.gender === 'F' ? a : b;
      const key = [a.id, b.id].sort().join('|');
      out.push({ key, m, f });
    }
  }
  return out;
}

// 选一个非野生品种作为小猫崽的品种（60% common / 30% rare / 10% epic）
function pickKittenBreed() {
  const pool = DATA.breeds.filter(b => !b.wild);
  const r = Math.random();
  let tier = 'common';
  if (r >= 0.6 && r < 0.9) tier = 'rare';
  else if (r >= 0.9)       tier = 'epic';
  let cands = pool.filter(b => b.rarity === tier);
  if (cands.length === 0) cands = pool;
  return cands[Math.floor(Math.random() * cands.length)];
}

// ============================================================
// 共用小组件
// ============================================================
function Stars({ n }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) =>
        <span key={i} className={i < n ? 'text-yellow-400' : 'text-stone-200'}>★</span>
      )}
    </div>
  );
}

function BigButton({ children, onClick, color = 'ginger', className = '', disabled }) {
  const map = {
    ginger:  'bg-ginger-500 hover:bg-ginger-600 active:bg-ginger-700',
    mint:    'bg-mint-500  hover:bg-mint-600  active:bg-mint-600',
    paw:     'bg-paw-500   hover:bg-paw-500   active:bg-paw-500',
    cream:   'bg-cream-100 text-stone-800 hover:bg-cream-200 active:bg-cream-200',
    stone:   'bg-stone-200 text-stone-800 hover:bg-stone-300 active:bg-stone-300'
  };
  return (
    <button
      onClick={() => { if (disabled) return; AudioFX.click(); onClick && onClick(); }}
      disabled={disabled}
      className={`paw-press no-tap-highlight text-white font-semibold rounded-2xl px-5 py-3 shadow-soft disabled:opacity-50 ${map[color]} ${className}`}
    >
      {children}
    </button>
  );
}

function Card({ children, className = '', onClick }) {
  return (
    <div onClick={onClick}
      className={`bg-white rounded-xl2 shadow-soft p-4 ${onClick ? 'cursor-pointer paw-press no-tap-highlight' : ''} ${className}`}>
      {children}
    </div>
  );
}

function Header({ title, onBack, right }) {
  return (
    <div className="sticky top-0 z-10 bg-white/85 backdrop-blur border-b border-cream-200">
      <div className="flex items-center px-3 py-2.5">
        {onBack
          ? <button onClick={() => { AudioFX.click(); onBack(); }} className="paw-press no-tap-highlight w-9 h-9 rounded-full bg-cream-100 text-ginger-700 flex items-center justify-center text-lg font-bold">‹</button>
          : <div className="w-9 h-9"></div>}
        <div className="flex-1 text-center font-bold text-stone-800">{title}</div>
        <div className="w-9 h-9 flex items-center justify-center">{right}</div>
      </div>
    </div>
  );
}

// ============================================================
// 🏠 首页 - 显示当前活跃猫，可切换 / 领养
// ============================================================
function breedPhoto(breedId) {
  return `images/breeds/${breedId}.jpg`;
}

function CatAvatar({ breed, size = 'lg', dim = false }) {
  const sizes = {
    lg:  { box: 'w-44 h-44', emoji: 'text-[100px]', deco: 'text-4xl bottom-3 right-3' },
    md:  { box: 'w-20 h-20', emoji: 'text-5xl',     deco: 'text-base bottom-1 right-1' },
    sm:  { box: 'w-14 h-14', emoji: 'text-3xl',     deco: 'text-xs bottom-0.5 right-0.5' }
  };
  const s = sizes[size];
  return (
    <div className={`relative ${s.box} rounded-full grid place-items-center`}
      style={{ background: breed.color + (dim ? '22' : '33'), filter: dim ? 'grayscale(.4)' : 'none' }}>
      <span className={s.emoji} style={{ filter: `drop-shadow(0 2px 0 ${breed.color}55)` }}>{breed.emoji}</span>
      <span className={`absolute ${s.deco}`}>{breed.deco}</span>
    </div>
  );
}

// 真实猫照片头像（圆形）
function RealCatPhoto({ breed, size = 'md', className = '' }) {
  const sizes = {
    lg:  'w-44 h-44',
    md:  'w-20 h-20',
    sm:  'w-14 h-14',
    xs:  'w-10 h-10'
  };
  return (
    <div className={`relative ${sizes[size]} rounded-full overflow-hidden shadow-soft ${className}`}
      style={{ border: `3px solid ${breed.color}66` }}>
      <img src={breedPhoto(breed.id)} alt={breed.name}
        className="w-full h-full object-cover"
        onError={(e) => { e.target.style.display='none'; }} />
    </div>
  );
}

// 卡通 ↔ 真实 切换头像（点击翻面）
function FlipAvatar({ breed, size = 'lg' }) {
  const [real, setReal] = useState(false);
  return (
    <button onClick={(e) => { e.stopPropagation(); AudioFX.click(); setReal(r => !r); }}
      className="paw-press no-tap-highlight relative inline-block">
      {real ? <RealCatPhoto breed={breed} size={size} /> : <CatAvatar breed={breed} size={size} />}
      <span className="absolute -bottom-1 -right-1 bg-white rounded-full px-1.5 py-0.5 text-[9px] font-bold text-stone-500 shadow-soft">
        {real ? '🎨 卡通' : '📸 真实'}
      </span>
    </button>
  );
}

function FishCoinBadge({ n, onClick }) {
  return (
    <button onClick={() => { AudioFX.click(); onClick && onClick(); }}
      className="paw-press no-tap-highlight bg-ginger-100 hover:bg-ginger-200 rounded-full pl-1.5 pr-3 py-1 flex items-center gap-1 shadow-soft">
      <span className="text-lg">🐟</span>
      <span className="font-bold text-ginger-700 text-sm">{n}</span>
    </button>
  );
}

// 每日鱼干进度条：在答题/故事页面顶部提示
function DailyFishBar({ user }) {
  const got = fishTodayOf(user);
  const cap = DAILY_FISH_CAP;
  const pct = Math.min(100, Math.round((got / cap) * 100));
  const full = got >= cap;
  return (
    <div className={`rounded-xl2 px-3 py-2 mb-3 ${full ? 'bg-cream-100' : 'bg-ginger-50'}`}>
      <div className="flex items-center text-xs">
        <span className={`font-semibold ${full ? 'text-stone-500' : 'text-ginger-700'}`}>
          {full ? '🌙 今天的小鱼干满啦' : '今日小鱼干进度'}
        </span>
        <span className="ml-auto text-stone-500">{got} / {cap} 🐟</span>
      </div>
      <div className="h-1.5 bg-white/70 rounded-full overflow-hidden mt-1.5">
        <div className="h-full transition-all"
          style={{ width: pct + '%', background: full ? '#a8a29e' : '#f59e0b' }} />
      </div>
      {full && (
        <div className="text-[11px] text-stone-500 mt-1">星星和徽章照拿，明天再来领鱼干～</div>
      )}
    </div>
  );
}

function Home({ user, setUser, go, activeCat, kittenDraft, setKittenDraft }) {
  const [ripples, setRipples] = useState([]);
  const [sparkles, setSparkles] = useState([]);
  const [showRealPhoto, setShowRealPhoto] = useState(false);
  const breed = activeCat ? DATA.breeds.find(b => b.id === activeCat.breedId) : null;
  const hunger = activeCat ? hungerStateOf(activeCat, breed) : null;
  const dormant = !!(activeCat && activeCat.dormant);
  const wild = !!(breed && breed.wild);

  const flipAvatar = () => {
    AudioFX.click();
    setShowRealPhoto(v => !v);
  };

  const pet = () => {
    if (!activeCat) return;
    if (dormant) { AudioFX.pop(); return; }
    AudioFX.purr();
    setUser(u => {
      const totalCuddles = (u.totalCuddles || 0) + 1;
      const myCats = u.myCats.map(c => c.id === activeCat.id ? { ...c, intimacy: Math.min(100, c.intimacy + 4) } : c);
      const badges = [...u.badges];
      if (totalCuddles >= 5 && !badges.includes('cuddle_5')) badges.push('cuddle_5');
      if (myCats.some(c => c.intimacy >= 100) && !badges.includes('intimacy_full')) badges.push('intimacy_full');
      return { ...u, myCats, totalCuddles, badges };
    });
    const id = Date.now() + Math.random();
    setRipples(r => [...r, id]);
    setTimeout(() => setRipples(r => r.filter(x => x !== id)), 1200);
  };

  const feed = () => {
    if (!activeCat) return;
    const cost = dormant ? FEED_WAKE_COST : 1;
    if (user.fishCoins < cost) { AudioFX.wrong(); return; }
    AudioFX.chime();
    AudioFX.meow();
    const wakingFromDormancy = dormant;
    setUser(u => {
      const totalFeeds = (u.totalFeeds || 0) + 1;
      const myCats = u.myCats.map(c => c.id === activeCat.id ? {
        ...c,
        intimacy: Math.min(100, (c.intimacy || 0) + 10),
        lastFedAt: Date.now(),
        dormant: false,
        dormantSince: null
      } : c);
      const badges = [...u.badges];
      if (!badges.includes('feed_first')) badges.push('feed_first');
      if (totalFeeds >= 10 && !badges.includes('feed_10')) badges.push('feed_10');
      if (wakingFromDormancy && !badges.includes('wake_dormant')) badges.push('wake_dormant');
      if (myCats.some(c => c.intimacy >= 100) && !badges.includes('intimacy_full')) badges.push('intimacy_full');
      return { ...u, fishCoins: u.fishCoins - cost, totalFeeds, myCats, badges };
    });
    const burst = Array.from({ length: 6 }).map(() => ({
      id: Date.now() + Math.random(),
      emoji: ['✨','🐟','💞','⭐','🎉','✨'][Math.floor(Math.random() * 6)],
      fx: (Math.random() * 220 - 110).toFixed(0) + '%',
      fy: (-90 - Math.random() * 80).toFixed(0) + '%'
    }));
    setSparkles(s => [...s, ...burst]);
    setTimeout(() => setSparkles(s => s.filter(x => !burst.find(b => b.id === x.id))), 1200);
  };

  const feedCost = dormant ? FEED_WAKE_COST : 1;
  const canFeed = !!activeCat && user.fishCoins >= feedCost;
  const fullIntimacy = activeCat && activeCat.intimacy >= 100 && !dormant;

  // 配对中 - 计算合格的对，并展示进度
  const pairs = findEligiblePairs(user.myCats);
  const now = Date.now();
  const pairView = pairs.map(p => {
    const bond = (user.pairBonds || {})[p.key];
    const startAt = bond ? bond.startAt : now;
    const days = Math.max(0, (now - startAt) / (1000 * 3600 * 24));
    const ready = days >= PAIR_BOND_DAYS;
    return { ...p, days, ready, startAt };
  });
  const readyPair = pairView.find(p => p.ready);
  const startMintFor = (p) => {
    AudioFX.chime();
    const breed = pickKittenBreed();
    const gender = randomGender();
    setKittenDraft({ breed, gender, parentIds: [p.m.id, p.f.id], pairKey: p.key });
    go('kitten');
  };

  return (
    <div className="min-h-full">
      <Header
        title={`你好，${user.kidName || '小喵管理员'}`}
        right={<FishCoinBadge n={user.fishCoins} onClick={() => go('shelter')} />}
      />

      <div className="px-5 pt-3 pb-32">
        {/* 活跃的猫咪头像 */}
        {activeCat && breed ? (
          <>
            <div className="relative mx-auto w-56 h-56 flex items-center justify-center mb-2 select-none">
              {ripples.map(id => <span key={id} className="purr-ring"></span>)}
              {sparkles.map(s => (
                <span key={s.id} className="feed-sparkle"
                  style={{ '--fx': s.fx, '--fy': s.fy }}>{s.emoji}</span>
              ))}
              <button onClick={flipAvatar}
                className="paw-press no-tap-highlight floaty rounded-full shadow-pop relative"
                style={{ filter: dormant ? 'grayscale(0.85) brightness(0.9)' : 'none' }}>
                {showRealPhoto
                  ? <RealCatPhoto breed={breed} size="lg" />
                  : <CatAvatar breed={breed} size="lg" dim={dormant} />}
                <span className="absolute -bottom-1 right-1 bg-white/95 rounded-full px-2 py-0.5 text-[10px] font-bold text-stone-500 shadow-soft">
                  {showRealPhoto ? '📸 真实' : '🎨 卡通'}
                </span>
              </button>
              {dormant && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/90 rounded-full px-4 py-2 shadow-pop text-center">
                    <div className="text-3xl">😴</div>
                    <div className="text-xs font-bold text-stone-600 mt-0.5">睡着了…</div>
                  </div>
                </div>
              )}
            </div>
            <div className="text-center -mt-2 mb-1">
              <button onClick={() => { AudioFX.click(); go('gallery', { breedId: breed.id }); }}
                className="paw-press no-tap-highlight text-[11px] text-ginger-600 underline">
                📸 看看 {breed.name} 的真实照片
              </button>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold flex items-center justify-center gap-2" style={{ color: breed.color }}>
                <span>{activeCat.name}</span>
                <span className="text-base px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: genderColor(activeCat.gender) }}>
                  {genderLabel(activeCat.gender)}
                </span>
                {wild && <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full">🌿 野生</span>}
              </div>
              <div className="text-xs text-stone-500 mt-0.5">{breed.name} · {breed.temper.slice(0, 2).join(' · ')}</div>
            </div>

            {/* 互动按钮：摸摸 / 喂猫 */}
            <div className="max-w-sm mx-auto mt-4 flex justify-center gap-4">
              {!dormant && (
                <button onClick={pet}
                  className="paw-press no-tap-highlight flex flex-col items-center justify-center w-20 h-20 rounded-full bg-ginger-100 text-ginger-700 shadow-soft active:bg-ginger-200">
                  <span className="text-2xl">🫱</span>
                  <span className="text-xs font-bold mt-0.5">摸摸</span>
                </button>
              )}
              <button onClick={feed} disabled={!canFeed || (fullIntimacy && !dormant)}
                className={`paw-press no-tap-highlight flex flex-col items-center justify-center w-24 h-20 rounded-full shadow-soft transition-all ${dormant ? 'bg-amber-100 text-amber-700 active:bg-amber-200' : (canFeed ? 'bg-mint-400/30 text-mint-600 active:bg-mint-400/50' : 'bg-stone-100 text-stone-400')}`}>
                <span className="text-2xl">{dormant ? '⏰' : '🐟'}</span>
                <span className="text-[11px] font-bold mt-0.5 leading-tight text-center px-1">
                  {dormant
                    ? (user.fishCoins < FEED_WAKE_COST ? `🐟 ${FEED_WAKE_COST} 不够` : `喂醒 -${FEED_WAKE_COST}🐟`)
                    : (fullIntimacy ? '已经很饱了' : (user.fishCoins < 1 ? '🐟 不够' : '喂猫 -1🐟'))}
                </span>
              </button>
            </div>
            <div className="text-center text-[11px] text-stone-400 mt-2">
              {dormant ? '它睡得有点久了，用小鱼干轻轻喂醒它～' : '用 🐟 喂猫咪，亲密度涨得更快～'}
            </div>

            {/* 饱腹度 / 亲密度 */}
            <div className="max-w-sm mx-auto mt-3 mb-5 space-y-2">
              <div>
                <div className="flex items-center text-xs text-stone-500 mb-1">
                  <span>{hunger?.emoji} 饱腹度</span>
                  <span className="ml-auto">{hunger?.label}{wild && <span className="ml-1 text-amber-600">·野生 1.5×</span>}</span>
                </div>
                <div className="h-2.5 bg-cream-100 rounded-full overflow-hidden">
                  {(() => {
                    const pct = hunger ? Math.max(0, Math.min(100, 100 - (hunger.hours / (HUNGER_HOURS_DORMANT * (hunger.mul || 1))) * 100)) : 0;
                    const color = hunger?.stage === 'full' ? '#7bd1b4' : hunger?.stage === 'peckish' ? '#f5b53a' : hunger?.stage === 'hungry' ? '#ed7c5c' : '#a8a29e';
                    return <div className="h-full transition-all" style={{ width: pct + '%', background: color }} />;
                  })()}
                </div>
              </div>
              <div>
                <div className="flex items-center text-xs text-stone-500 mb-1">
                  <span>💞 亲密度</span><span className="ml-auto">{activeCat.intimacy}/100</span>
                </div>
                <div className="h-3 bg-cream-100 rounded-full overflow-hidden">
                  <div className="h-full transition-all" style={{ width: activeCat.intimacy + '%', background: breed.color }} />
                </div>
              </div>
              <div className="text-center text-[11px] text-stone-400">点头像可在卡通 ↔ 真实照片之间切换</div>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="text-6xl">🏠</div>
            <div className="mt-2 text-stone-600">还没有领养任何猫</div>
            <BigButton className="mt-3" onClick={() => go('shelter')}>去猫舍领养 →</BigButton>
          </div>
        )}

        {/* 我家的猫 - 横向切换 */}
        <div className="max-w-md mx-auto mb-5">
          <div className="flex items-center text-xs text-stone-500 mb-2">
            <span className="font-semibold text-stone-600">🏠 我家的猫（{user.myCats.length}）</span>
            <button onClick={() => { AudioFX.click(); go('mycats'); }} className="ml-auto text-ginger-600 underline">管理</button>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-thin -mx-1 px-1 pb-1">
            {user.myCats.map(c => {
              const b = DATA.breeds.find(x => x.id === c.breedId);
              if (!b) return null;
              const active = c.id === user.activeCatId;
              const h = hungerStateOf(c, b);
              return (
                <button key={c.id} onClick={() => { AudioFX.click(); setUser(u => ({ ...u, activeCatId: c.id })); }}
                  className={`paw-press no-tap-highlight flex-shrink-0 rounded-2xl p-2 text-center transition-all relative ${active ? 'bg-white shadow-pop ring-2 ring-ginger-400' : 'bg-white/60'}`}
                  style={{ width: 72 }}>
                  <div className="mx-auto"><CatAvatar breed={b} size="sm" dim={c.dormant} /></div>
                  <span className="absolute -top-1 -left-1 text-[11px] bg-white rounded-full px-1 shadow-soft"
                    style={{ color: genderColor(c.gender) }}>{c.gender === 'F' ? '♀' : '♂'}</span>
                  <span className="absolute -top-1 -right-1 text-sm">{h?.emoji}</span>
                  <div className="text-[11px] mt-1 font-semibold text-stone-700 truncate">{c.name}</div>
                </button>
              );
            })}
            <button onClick={() => { AudioFX.click(); go('shelter'); }}
              className="paw-press no-tap-highlight flex-shrink-0 w-[72px] rounded-2xl bg-cream-100 grid place-items-center text-stone-500 hover:text-ginger-600">
              <div>
                <div className="text-3xl">＋</div>
                <div className="text-[11px] mt-0.5">领养</div>
              </div>
            </button>
          </div>
        </div>

        {/* 配对中 / 即将出生 */}
        {pairView.length > 0 && (
          <div className="max-w-md mx-auto mb-5">
            <div className="flex items-center text-xs text-stone-500 mb-2">
              <span className="font-semibold text-stone-600">🍼 配对中（{pairView.length}）</span>
              <span className="ml-auto text-[10px] text-stone-400">共度 {PAIR_BOND_DAYS} 天 → 一窝小猫</span>
            </div>
            <div className="space-y-2">
              {pairView.map(p => {
                const ba = getBreed(p.f.breedId);
                const bb = getBreed(p.m.breedId);
                const pct = Math.min(100, Math.round(p.days / PAIR_BOND_DAYS * 100));
                return (
                  <div key={p.key} className={`rounded-xl2 p-2.5 shadow-soft ${p.ready ? 'bg-pink-50 ring-2 ring-pink-300' : 'bg-white'}`}>
                    <div className="flex items-center gap-2">
                      <CatAvatar breed={ba} size="sm" />
                      <div className="text-pink-400 text-xl">💕</div>
                      <CatAvatar breed={bb} size="sm" />
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="font-semibold text-stone-700 truncate">{p.f.name} ♀ × {p.m.name} ♂</div>
                        <div className="text-stone-500">{p.ready ? '🎉 一窝小猫等你接！' : `共度 ${p.days.toFixed(1)} / ${PAIR_BOND_DAYS} 天`}</div>
                        <div className="h-1.5 bg-cream-100 rounded-full overflow-hidden mt-1">
                          <div className="h-full transition-all" style={{ width: pct + '%', background: p.ready ? '#ec4899' : '#f9a8d4' }} />
                        </div>
                      </div>
                    </div>
                    {p.ready && (
                      <button onClick={() => startMintFor(p)}
                        className="paw-press no-tap-highlight w-full mt-2 bg-pink-500 text-white font-semibold rounded-xl2 py-2 text-sm">
                        🍼 去领小宝宝
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 模块卡 */}
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          <ModuleCard color="ginger" emoji="🏡" title="去猫舍" sub="领养新猫咪" onClick={() => go('shelter')} />
          <ModuleCard color="mint"   emoji="❓" title="喵星大竞猜" sub="答题赚 🐟" onClick={() => go('quiz')} />
          <ModuleCard color="paw"    emoji="🕒" title="猫的一天"   sub="陪伴时光" onClick={() => go('catday')} />
          <ModuleCard color="ginger" emoji="📖" title="猫咪知多少" sub="猫科动物图鉴" onClick={() => go('encyclopedia')} />
          <ModuleCard color="mint"   emoji="📚" title="猫咪小故事"
            sub={`30 个奇闻 · 已读 ${(user.readStories || []).length}/${DATA.stories.length}`}
            onClick={() => go('stories')} />
          <ModuleCard color="paw"    emoji="📸" title="真实猫图鉴"
            sub="15 个品种 · 高清大图"
            onClick={() => go('gallery')} isNew />
        </div>

        {/* 数据卡 */}
        <div className="grid grid-cols-3 gap-3 mt-5 max-w-md mx-auto">
          <Card className="text-center !p-3">
            <div className="text-2xl font-bold text-ginger-600">{user.myCats.length}<span className="text-sm text-stone-400">/15</span></div>
            <div className="text-xs text-stone-500 mt-0.5">已领养</div>
          </Card>
          <Card className="text-center !p-3">
            <div className="text-2xl font-bold text-mint-600">{user.unlocked.length}<span className="text-sm text-stone-400">/10</span></div>
            <div className="text-xs text-stone-500 mt-0.5">猫科图鉴</div>
          </Card>
          <Card className="text-center !p-3">
            <div className="text-2xl font-bold text-paw-500">{(user.poems?.length || 0) + (user.artworks?.length || 0)}</div>
            <div className="text-xs text-stone-500 mt-0.5">我的作品</div>
          </Card>
        </div>

        {/* 徽章 */}
        {user.badges.length > 0 && (
          <div className="max-w-md mx-auto mt-6">
            <div className="text-sm font-semibold text-stone-600 mb-2">🏅 我的徽章（{user.badges.length}/{DATA.badges.length}）</div>
            <div className="flex flex-wrap gap-2">
              {user.badges.map(bid => {
                const b = DATA.badges.find(x => x.id === bid);
                if (!b) return null;
                return (
                  <div key={bid} className="bg-white rounded-full pl-1 pr-3 py-1 flex items-center gap-1 shadow-soft text-sm">
                    <span className="text-lg">{b.emoji}</span>
                    <span className="text-stone-700">{b.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-center text-[11px] text-stone-400 mt-6">
          <button onClick={() => { AudioFX.click(); go('about'); }} className="underline">关于 · 家长设置</button>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ color, emoji, title, sub, onClick, isNew, className = '' }) {
  const bg = { ginger: 'bg-ginger-100', mint: 'bg-mint-400/20', paw: 'bg-paw-400/20' }[color] || 'bg-cream-100';
  const accent = { ginger: 'text-ginger-700', mint: 'text-mint-600', paw: 'text-paw-500' }[color];
  return (
    <button onClick={() => { AudioFX.click(); onClick(); }}
      className={`relative paw-press no-tap-highlight rounded-xl2 ${bg} p-4 text-left shadow-soft ${className}`}>
      {isNew && (
        <span className="absolute top-2 right-2 text-[10px] bg-ginger-500 text-white px-2 py-0.5 rounded-full">NEW</span>
      )}
      <div className="text-4xl">{emoji}</div>
      <div className={`mt-2 font-bold ${accent}`}>{title}</div>
      <div className="text-xs text-stone-500">{sub}</div>
    </button>
  );
}

// ============================================================
// 📖 模块 1: 猫咪知多少（图鉴）
// ============================================================
function Encyclopedia({ user, setUser, go }) {
  const [openId, setOpenId] = useState(null);
  const open = DATA.species.find(s => s.id === openId);

  if (open) {
    const unlocked = user.unlocked.includes(open.id);
    return <SpeciesDetail s={open} unlocked={unlocked} onBack={() => setOpenId(null)} go={go} />;
  }

  return (
    <div className="min-h-full">
      <Header title="猫咪知多少" onBack={() => go('home')}
        right={<span className="text-xs text-stone-500">{user.unlocked.length}/10</span>} />
      <div className="px-4 py-4 pb-32">
        <p className="text-sm text-stone-500 mb-3">点开看详情。锁住的猫咪先去答题解锁哦 🔓</p>
        <div className="grid grid-cols-2 gap-3">
          {DATA.species.map(s => {
            const unlocked = user.unlocked.includes(s.id);
            return (
              <Card key={s.id} onClick={() => setOpenId(s.id)}
                className={`text-center ${unlocked ? '' : 'opacity-60'}`}>
                <div className="text-5xl mb-1" style={{ filter: unlocked ? 'none' : 'grayscale(.7)' }}>
                  {unlocked ? s.emoji : '❔'}
                </div>
                <div className="font-bold" style={{ color: unlocked ? s.color : '#a8a29e' }}>
                  {unlocked ? s.name : '？？？'}
                </div>
                <div className="text-[10px] text-stone-400 italic">{unlocked ? s.latin : '------'}</div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SpeciesDetail({ s, unlocked, onBack, go }) {
  useEffect(() => { if (unlocked) AudioFX.chime(); }, []);
  if (!unlocked) {
    return (
      <div className="min-h-full">
        <Header title="？？？" onBack={onBack} />
        <div className="p-6 text-center">
          <div className="text-7xl mb-3">🔒</div>
          <p className="text-stone-600 mb-4">这只猫咪还没解锁<br/>去答题闯关解锁它吧！</p>
          <BigButton onClick={() => go('quiz')}>去答题 →</BigButton>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-full">
      <Header title={s.name} onBack={onBack} />
      <div className="px-4 py-5 pb-32">
        <div className="text-center">
          <div className="text-[110px]" style={{ filter: `drop-shadow(0 6px 6px ${s.color}44)` }}>{s.emoji}</div>
          <div className="text-2xl font-bold" style={{ color: s.color }}>{s.name}</div>
          <div className="text-xs text-stone-400 italic">{s.latin}</div>
          <p className="text-sm text-stone-600 mt-3 leading-relaxed max-w-md mx-auto">{s.intro}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-5 max-w-md mx-auto">
          <DataPill label="体重" val={s.weightKg + ' kg'} />
          <DataPill label="体长" val={s.lengthCm + ' cm'} />
          <DataPill label="最快" val={s.speedKmh + ' km/h'} />
          <DataPill label="寿命" val={s.lifespanY + ' 岁'} />
          <DataPill label="栖息" val={s.habitat} full />
        </div>

        <div className="mt-6 max-w-md mx-auto">
          <div className="font-bold text-stone-700 mb-2">🌟 你知道吗</div>
          <div className="space-y-2">
            {s.facts.map((f, i) => (
              <div key={i} className="bg-cream-100 rounded-xl2 p-3 text-sm text-stone-700 leading-relaxed">
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <BigButton onClick={() => go('quiz')} color="mint">继续答题解锁更多 →</BigButton>
        </div>
      </div>
    </div>
  );
}

function DataPill({ label, val, full }) {
  return (
    <div className={`bg-white rounded-xl2 px-3 py-2 shadow-soft ${full ? 'col-span-2' : ''}`}>
      <div className="text-[10px] text-stone-400">{label}</div>
      <div className="text-sm font-semibold text-stone-700">{val}</div>
    </div>
  );
}

// ============================================================
// ❓ 模块 2: 喵星大竞猜
// ============================================================
// Shuffle helpers - 每次进入关卡时打乱题目顺序和选项顺序
function shuffleInPlace(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function shuffleOptions(q) {
  const correct = q.opts[q.a];
  const opts = shuffleInPlace(q.opts);
  return { ...q, opts, a: opts.indexOf(correct) };
}

const QUIZ_LEVELS = [
  { emoji: '🐱', title: '家猫篇' },
  { emoji: '🐯', title: '猫科篇' },
  { emoji: '🌍', title: '动物百科' },
  { emoji: '📸', title: '看图识猫' },
  { emoji: '📚', title: '故事大挑战' }
];

function Quiz({ user, setUser, go }) {
  const [level, setLevel] = useState(null);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [revealFull, setRevealFull] = useState(false); // 看图题 - 是否已点"看清楚"
  const [reward, setReward] = useState(null); // { species, fish }
  const [shake, setShake] = useState(false);

  // 每次进入关卡都重新洗牌
  const list = useMemo(() => {
    if (level == null) return [];
    const raw = DATA.quizzes.filter(q => q.level === level);
    return shuffleInPlace(raw).map(shuffleOptions);
  }, [level]);

  if (level == null) {
    return (
      <div className="min-h-full">
        <Header title="喵星大竞猜" onBack={() => go('home')}
          right={<FishCoinBadge n={user.fishCoins} onClick={() => go('shelter')} />} />
        <div className="p-5 pb-32 max-w-md mx-auto">
          <DailyFishBar user={user} />
          <p className="text-sm text-stone-500 mb-1">答对一题最多得 <b className="text-ginger-600">3 🐟</b>。用提示或看清楚图片各 <b>-1 🐟</b>，最少也有 <b>1 🐟</b>。</p>
          <p className="text-sm text-stone-500 mb-4">攒够小鱼干就能去 <button onClick={() => { AudioFX.click(); go('shelter'); }} className="underline text-ginger-600">猫舍</button> 领养新猫咪！<span className="text-stone-400">题目顺序每次都会重新打乱～</span></p>
          {[1, 2, 3, 4, 5].map(L => {
            const all = DATA.quizzes.filter(q => q.level === L);
            const done = all.filter(q => user.answered[q.id]).length;
            const { emoji, title } = QUIZ_LEVELS[L - 1];
            const subMap = {
              4: '先看模糊轮廓猜，挑战一眼识猫',
              5: '题目都来自"猫咪小故事"，读过更容易答对'
            };
            const sub = subMap[L];
            const showNew = (L === 4 || L === 5);
            return (
              <Card key={L} onClick={() => { setLevel(L); setIdx(0); setPicked(null); setShowHint(false); setRevealFull(false); }} className="mb-3 flex items-center gap-3">
                <div className="text-4xl">{emoji}</div>
                <div className="flex-1">
                  <div className="font-bold text-stone-700">{title}{showNew && <span className="ml-2 text-xs bg-ginger-500 text-white px-2 py-0.5 rounded-full align-middle">NEW</span>}</div>
                  {sub && <div className="text-[11px] text-stone-400">{sub}</div>}
                  <div className="text-xs text-stone-500">已完成 {done} / {all.length}</div>
                </div>
                <div className="text-ginger-500 text-lg">›</div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  const q = list[idx];

  if (!q) {
    return (
      <div className="min-h-full">
        <Header title="完成啦" onBack={() => setLevel(null)} />
        <div className="p-8 text-center">
          <div className="text-7xl">🎉</div>
          <div className="text-xl font-bold text-ginger-700 mt-3">这一关全部答完啦！</div>
          <div className="text-stone-500 text-sm mt-1">回去图鉴看看解锁了哪些新猫咪～</div>
          <div className="mt-6 flex gap-3 justify-center">
            <BigButton color="cream" onClick={() => setLevel(null)}>选其它关卡</BigButton>
            <BigButton onClick={() => go('encyclopedia')}>看图鉴 →</BigButton>
          </div>
        </div>
      </div>
    );
  }

  const submit = (i) => {
    if (picked != null) return;
    setPicked(i);
    if (i === q.a) {
      AudioFX.correct();
      const isPhoto = !!q.img;
      const penalty = (showHint ? 1 : 0) + ((isPhoto && revealFull) ? 1 : 0);
      const stars = Math.max(3, 5 - penalty);
      const fishRequested = Math.max(1, 3 - penalty);
      const willUnlock = q.unlocks && !user.unlocked.includes(q.unlocks);
      const unlockedSpecies = willUnlock ? DATA.species.find(s => s.id === q.unlocks) : null;
      let grantedFish = 0;
      let wasCapped = false;
      setUser(u => {
        const nextUnlocked = [...u.unlocked];
        if (q.unlocks && !nextUnlocked.includes(q.unlocks)) nextUnlocked.push(q.unlocks);
        const nextAnswered = { ...u.answered, [q.id]: { stars } };
        const correctCount = Object.keys(nextAnswered).length;
        const cap = applyFishCap(u, fishRequested);
        grantedFish = cap.grant;
        wasCapped = cap.capped;
        const nextBadges = [...u.badges];
        if (nextUnlocked.length >= 1 && !nextBadges.includes('first_unlock')) nextBadges.push('first_unlock');
        if (nextUnlocked.length >= 3 && !nextBadges.includes('three_unlock')) nextBadges.push('three_unlock');
        if (nextUnlocked.length >= 10 && !nextBadges.includes('all_unlock')) nextBadges.push('all_unlock');
        if (correctCount >= 10 && !nextBadges.includes('quiz_10')) nextBadges.push('quiz_10');
        if (cap.patch.totalFishEarned >= 50 && !nextBadges.includes('fishcoins_50')) nextBadges.push('fishcoins_50');
        const photoQs = DATA.quizzes.filter(qz => qz.level === 4);
        if (photoQs.length > 0 && photoQs.every(qz => nextAnswered[qz.id]) && !nextBadges.includes('photo_quiz_all')) nextBadges.push('photo_quiz_all');
        const storyQs = DATA.quizzes.filter(qz => qz.level === 5);
        if (storyQs.length > 0 && storyQs.every(qz => nextAnswered[qz.id]) && !nextBadges.includes('story_quiz_all')) nextBadges.push('story_quiz_all');
        return {
          ...u,
          ...cap.patch,
          unlocked: nextUnlocked,
          answered: nextAnswered,
          correctCount,
          badges: nextBadges
        };
      });
      setReward({ species: unlockedSpecies, fish: grantedFish, requested: fishRequested, capped: wasCapped });
    } else {
      AudioFX.wrong();
      setShake(true);
      setTimeout(() => setShake(false), 350);
    }
  };

  const next = () => {
    setPicked(null);
    setShowHint(false);
    setRevealFull(false);
    setReward(null);
    setIdx(i => i + 1);
  };

  return (
    <div className="min-h-full">
      <Header title={`${QUIZ_LEVELS[level - 1].title} · ${idx + 1}/${list.length}`} onBack={() => setLevel(null)}
        right={<FishCoinBadge n={user.fishCoins} onClick={() => go('shelter')} />} />
      <div className="p-5 pb-32 max-w-md mx-auto">
        <div className={`bg-white rounded-xl3 p-5 shadow-soft ${shake ? 'shake' : ''}`}>
          {q.img && (
            <div className="relative -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-xl3 bg-stone-200 h-60">
              <img src={q.img} alt="猫咪图片"
                className="w-full h-full object-cover transition-all duration-500"
                style={{ filter: (picked != null || revealFull) ? 'none' : 'blur(10px) brightness(0.95)', transform: (picked != null || revealFull) ? 'scale(1)' : 'scale(1.08)' }}
                loading="lazy"
                onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              {picked == null && !revealFull && (
                <button onClick={() => { AudioFX.pop(); setRevealFull(true); }}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/95 text-stone-700 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow paw-press no-tap-highlight">
                  👁️ 看清楚（少 1 颗 ⭐）
                </button>
              )}
              {(picked != null || revealFull) && (
                <div className="absolute bottom-1 right-2 text-[10px] text-white/80 drop-shadow">cat photo</div>
              )}
              {picked == null && !revealFull && (
                <div className="absolute top-2 left-2 bg-ginger-500/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  先看轮廓猜猜看～
                </div>
              )}
            </div>
          )}
          <div className="text-stone-700 font-bold text-lg leading-relaxed">{q.q}</div>
          <div className="mt-4 space-y-2">
            {q.opts.map((opt, i) => {
              const isPicked = picked === i;
              const isAnswer = picked != null && i === q.a;
              const isWrong = isPicked && i !== q.a;
              let cls = 'bg-cream-100 text-stone-700';
              if (isAnswer) cls = 'bg-mint-400/30 text-mint-600 border-2 border-mint-500';
              else if (isWrong) cls = 'bg-rose-100 text-rose-700 border-2 border-rose-400';
              return (
                <button key={i} onClick={() => submit(i)}
                  className={`paw-press no-tap-highlight w-full text-left rounded-xl2 px-4 py-3 font-medium ${cls}`}>
                  <span className="inline-block w-6 mr-1 font-bold opacity-70">{'ABCD'[i]}.</span>{opt}
                  {isAnswer && <span className="float-right">✓</span>}
                  {isWrong && <span className="float-right">✗</span>}
                </button>
              );
            })}
          </div>

          {picked == null && q.hint && (
            <button onClick={() => { AudioFX.pop(); setShowHint(true); }}
              className="mt-4 text-sm text-ginger-600 underline">
              💡 看一眼小提示（减一颗星）
            </button>
          )}
          {showHint && q.hint && (
            <div className="mt-2 text-sm text-stone-500 bg-yellow-50 rounded-xl2 p-3">{q.hint}</div>
          )}
        </div>

        {picked != null && (
          <div className="mt-5 text-center">
            {picked === q.a ? (
              <div>
                <div className="text-2xl text-mint-600 font-bold">答对了！</div>
                <Stars n={Math.max(3, 5 - ((showHint ? 1 : 0) + ((q.img && revealFull) ? 1 : 0)))} />
              </div>
            ) : (
              <div className="text-rose-500 font-bold">差一点点～<br/><span className="text-sm text-stone-500 font-normal">正确答案是 {String.fromCharCode(65 + q.a)}. {q.opts[q.a]}</span></div>
            )}
            {q.storyId && (() => {
              const story = DATA.stories.find(s => s.id === q.storyId);
              if (!story) return null;
              return (
                <button onClick={() => { AudioFX.click(); go('stories', { openStoryId: q.storyId }); }}
                  className="paw-press no-tap-highlight mt-3 inline-flex items-center gap-1.5 bg-cream-100 hover:bg-ginger-100 rounded-full px-3 py-1.5 text-xs">
                  <span>💡 来自故事《<b className="text-ginger-700">{story.title}</b>》</span>
                  <span className="text-ginger-600">→</span>
                </button>
              );
            })()}
            <div className="mt-4">
              <BigButton onClick={next}>下一题 →</BigButton>
            </div>
          </div>
        )}
      </div>

      {reward && (
        <RewardModal reward={reward} fishCoins={user.fishCoins}
          onClose={() => setReward(null)}
          onShelter={() => go('shelter')}
          onEncyclopedia={() => go('encyclopedia')} />
      )}
    </div>
  );
}

function RewardModal({ reward, fishCoins, onClose, onShelter, onEncyclopedia }) {
  useEffect(() => { AudioFX.chime(); }, []);
  const enoughForCommon = fishCoins >= 5;
  const fullyCapped = reward.capped && reward.fish === 0;
  return (
    <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center px-6" onClick={onClose}>
      <div className="bg-white rounded-xl3 p-6 max-w-xs w-full text-center yq-modal-enter" onClick={e => e.stopPropagation()}>
        {/* 小鱼干奖励 */}
        <div className="text-sm text-stone-500">答对啦{!fullyCapped && '，奖励：'}</div>
        {fullyCapped ? (
          <div className="my-3 bg-cream-100 rounded-xl2 p-3">
            <div className="text-3xl">🌙</div>
            <div className="text-sm text-stone-600 mt-1">今天 20 🐟 上限到啦</div>
            <div className="text-[11px] text-stone-400 mt-0.5">星星照拿，明天再领鱼干～</div>
          </div>
        ) : (
          <>
            <div className="star-pop my-2 inline-flex items-center gap-1 bg-ginger-100 px-4 py-2 rounded-full">
              <span className="text-3xl">🐟</span>
              <span className="text-2xl font-bold text-ginger-700">+{reward.fish}</span>
            </div>
            <div className="text-xs text-stone-400">现在你有 {fishCoins} 个小鱼干</div>
            {reward.capped && (
              <div className="text-[11px] text-ginger-600 mt-1">已到达每日 20 🐟 上限</div>
            )}
          </>
        )}

        {/* 同时解锁了猫科动物 */}
        {reward.species && (
          <div className="mt-4 pt-4 border-t border-cream-200">
            <div className="text-xs text-stone-500">🎁 还新解锁了猫科动物</div>
            <div className="text-[68px] my-1">{reward.species.emoji}</div>
            <div className="text-lg font-bold" style={{ color: reward.species.color }}>{reward.species.name}</div>
            <div className="text-xs text-stone-500 mt-1">去图鉴看看它吧</div>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2">
          {reward.species && (
            <BigButton color="mint" onClick={() => { onClose(); onEncyclopedia && onEncyclopedia(); }}>📖 去图鉴看新动物</BigButton>
          )}
          {!reward.species && enoughForCommon && (
            <BigButton onClick={() => { onClose(); onShelter(); }}>🏡 攒够了！去猫舍领养</BigButton>
          )}
          <BigButton color="cream" onClick={onClose}>继续答题</BigButton>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 🕒 模块 3: 猫的一天
// ============================================================
function CatDay({ user, setUser, go, activeCat }) {
  const [active, setActive] = useState(DATA.dayTimeline[0]);
  const [ripples, setRipples] = useState([]);
  const breed = activeCat ? DATA.breeds.find(b => b.id === activeCat.breedId) : null;

  const dormant = !!(activeCat && activeCat.dormant);
  const tap = () => {
    if (!activeCat) return;
    if (dormant) { AudioFX.pop(); return; }
    if (active.action === 'purr' || active.action === 'cuddle') AudioFX.purr();
    else if (active.action === 'feed' || active.action === 'play') AudioFX.meow();
    else AudioFX.pop();
    setUser(u => {
      const totalCuddles = (u.totalCuddles || 0) + 1;
      const myCats = u.myCats.map(c => c.id === activeCat.id ? { ...c, intimacy: Math.min(100, c.intimacy + 3) } : c);
      const badges = [...u.badges];
      if (totalCuddles >= 5 && !badges.includes('cuddle_5')) badges.push('cuddle_5');
      return { ...u, myCats, totalCuddles, badges };
    });
    const id = Date.now() + Math.random();
    setRipples(r => [...r, id]);
    setTimeout(() => setRipples(r => r.filter(x => x !== id)), 1200);
  };

  return (
    <div className="min-h-full">
      <Header title="猫的一天" onBack={() => go('home')} />
      <div className="px-4 pt-3 pb-32">
        {activeCat && breed && (
          <div className="text-center text-xs text-stone-500 mb-2">
            和 <span className="font-semibold text-ginger-600">{activeCat.name}</span>（{breed.name}）一起度过
          </div>
        )}

        {/* 时间轴 */}
        <div className="overflow-x-auto scrollbar-thin -mx-4 px-4">
          <div className="flex gap-2 pb-2">
            {DATA.dayTimeline.map(t => (
              <button key={t.id} onClick={() => { AudioFX.click(); setActive(t); }}
                className={`time-bubble paw-press no-tap-highlight flex-shrink-0 rounded-2xl p-3 w-20 text-center ${active.id === t.id ? 'active shadow-pop' : 'shadow-soft'}`}
                style={{ background: active.id === t.id ? t.color : '#fff', color: active.id === t.id ? '#fff' : '#57534e' }}>
                <div className="text-2xl">{t.emoji}</div>
                <div className="text-[10px] mt-0.5 font-semibold">{t.time}</div>
                <div className="text-xs mt-0.5">{t.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 当前时段 */}
        <Card className="mt-4 max-w-md mx-auto text-center !p-6" style={{ background: active.color + '22' }}>
          <div className="relative inline-block">
            {ripples.map(id => <span key={id} className="purr-ring"></span>)}
            <button onClick={tap}
              className="paw-press no-tap-highlight floaty grid place-items-center rounded-full shadow-pop">
              {breed ? <CatAvatar breed={breed} size="md" dim={dormant} /> : <div className="w-20 h-20 bg-white rounded-full grid place-items-center text-5xl">🐱</div>}
            </button>
          </div>
          <div className="mt-2 text-xs text-stone-500">{dormant ? '😴 它睡着了，先去首页喂醒它～' : '点我看看'}</div>
          <div className="mt-3 font-bold text-xl" style={{ color: active.color }}>{active.time} · {active.title}</div>
          <p className="text-stone-700 mt-2 leading-relaxed">{active.desc}</p>
          <div className="mt-4 bg-white rounded-xl2 p-3 text-sm text-stone-600 leading-relaxed">
            <span className="font-bold text-ginger-600">你知道吗：</span>{active.did}
          </div>
        </Card>

        <div className="text-center text-xs text-stone-400 mt-4">
          {activeCat ? <>{activeCat.name} 的亲密度 <span className="font-bold text-ginger-600">{activeCat.intimacy}/100</span></> : '还没有领养猫咪'}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 🎨 模块 4: 我的喵日记（画板 + 小诗 + 作品集）
// ============================================================
function Diary({ user, setUser, go }) {
  const [tab, setTab] = useState('paint'); // paint | poem | gallery

  return (
    <div className="min-h-full">
      <Header title="我的喵日记" onBack={() => go('home')} />
      <div className="px-3 pt-2">
        <div className="flex gap-2 bg-cream-100 rounded-full p-1 text-sm font-semibold max-w-md mx-auto">
          {[['paint','🎨 画画'],['poem','✍️ 写诗'],['gallery','📂 作品集']].map(([k, label]) => (
            <button key={k} onClick={() => { AudioFX.click(); setTab(k); }}
              className={`paw-press no-tap-highlight flex-1 py-2 rounded-full ${tab === k ? 'bg-white shadow-soft text-ginger-700' : 'text-stone-500'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'paint'   && <PaintBoard user={user} setUser={setUser} />}
      {tab === 'poem'    && <PoemBook   user={user} setUser={setUser} />}
      {tab === 'gallery' && <Gallery    user={user} setUser={setUser} />}
    </div>
  );
}

// -- 画板 --
function PaintBoard({ user, setUser }) {
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#f9852a');
  const [size, setSize] = useState(6);
  const [tool, setTool] = useState('pen'); // pen | eraser | sticker
  const [sticker, setSticker] = useState('🐱');
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const palette = ['#f9852a','#e96a16','#7a3717','#4dbe9a','#7aa9c9','#a665b3','#ff9b91','#ffbd75','#bbb','#222','#fff'];

  const initCanvas = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    const w = c.clientWidth;
    const h = c.clientHeight;
    c.width = w * ratio;
    c.height = h * ratio;
    const ctx = c.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.fillStyle = '#fffdf8';
    ctx.fillRect(0, 0, w, h);
    drawGuide(ctx, w, h);
  }, []);

  useEffect(() => { initCanvas(); window.addEventListener('resize', initCanvas); return () => window.removeEventListener('resize', initCanvas); }, [initCanvas]);

  const drawGuide = (ctx, w, h) => {
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.font = `${Math.min(w, h) * 0.6}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐱', w / 2, h / 2);
    ctx.restore();
  };

  const getPos = (e) => {
    const c = canvasRef.current;
    const rect = c.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: p.clientX - rect.left, y: p.clientY - rect.top };
  };

  const start = (e) => {
    e.preventDefault();
    if (tool === 'sticker') {
      const { x, y } = getPos(e);
      const ctx = canvasRef.current.getContext('2d');
      ctx.font = `${size * 6}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sticker, x, y);
      AudioFX.pop();
      return;
    }
    drawing.current = true;
    last.current = getPos(e);
  };

  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (tool === 'eraser') {
      ctx.strokeStyle = '#fffdf8';
      ctx.lineWidth = size * 4;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
    }
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    last.current = { x, y };
  };
  const end = () => { drawing.current = false; };

  const clear = () => {
    if (!confirm('确定要清空画板吗？')) return;
    const c = canvasRef.current; const ctx = c.getContext('2d');
    ctx.fillStyle = '#fffdf8';
    ctx.fillRect(0, 0, c.clientWidth, c.clientHeight);
    drawGuide(ctx, c.clientWidth, c.clientHeight);
  };

  const save = () => {
    const url = canvasRef.current.toDataURL('image/png');
    const artwork = { id: 'a' + Date.now(), data: url, time: Date.now() };
    setUser(u => ({
      ...u,
      artworks: [...(u.artworks || []), artwork],
      badges: u.badges.includes('first_paint') ? u.badges : [...u.badges, 'first_paint']
    }));
    AudioFX.chime();
    alert('画作已保存到"作品集"');
  };

  const stickerList = DATA.stickers;

  return (
    <div className="px-3 pb-32 pt-3">
      {/* 画布 */}
      <div className="bg-white rounded-xl3 shadow-soft p-2 max-w-md mx-auto">
        <canvas ref={canvasRef}
          className="drawing-canvas w-full rounded-xl2 border border-cream-200"
          style={{ height: 360, touchAction: 'none' }}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
      </div>

      {/* 工具 */}
      <div className="max-w-md mx-auto mt-3">
        <div className="flex gap-2 mb-2">
          {[['pen','🖍️','画笔'],['eraser','🧽','橡皮'],['sticker','🐾','贴纸']].map(([k, e, label]) => (
            <button key={k} onClick={() => { AudioFX.click(); setTool(k); }}
              className={`paw-press no-tap-highlight flex-1 rounded-xl2 py-2 text-sm font-semibold ${tool === k ? 'bg-ginger-500 text-white shadow-soft' : 'bg-white text-stone-600'}`}>
              <span className="mr-1">{e}</span>{label}
            </button>
          ))}
        </div>

        {tool === 'sticker' ? (
          <div className="bg-white rounded-xl2 p-2">
            <div className="text-xs text-stone-500 mb-1">点贴纸选择，然后点画板放置</div>
            <div className="flex flex-wrap gap-1">
              {stickerList.map(s => (
                <button key={s} onClick={() => { AudioFX.pop(); setSticker(s); }}
                  className={`paw-press no-tap-highlight w-10 h-10 text-2xl rounded-xl ${sticker === s ? 'bg-ginger-200' : 'bg-cream-100'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl2 p-2">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {palette.map(c => (
                <button key={c} onClick={() => { AudioFX.pop(); setColor(c); }}
                  className={`paw-press no-tap-highlight w-8 h-8 rounded-full border-2 ${color === c ? 'border-stone-700 scale-110' : 'border-white'}`}
                  style={{ background: c }} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 w-12">粗细</span>
              <input type="range" min="2" max="20" value={size} onChange={e => setSize(+e.target.value)} className="flex-1" />
              <span className="text-xs text-stone-500 w-6 text-right">{size}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <button onClick={clear}
            className="paw-press no-tap-highlight flex-1 bg-stone-100 text-stone-600 font-semibold rounded-xl2 py-3">清空</button>
          <button onClick={save}
            className="paw-press no-tap-highlight flex-1 bg-ginger-500 text-white font-semibold rounded-xl2 py-3 shadow-soft">保存到作品集</button>
        </div>
      </div>
    </div>
  );
}

// -- 写诗 --
function PoemBook({ user, setUser }) {
  const [tpl, setTpl] = useState(DATA.poemTemplates[0]);
  const [vals, setVals] = useState({});

  const filled = tpl.lines.map(l => l.replace(/【(\w+)】/g, (_, k) => vals[k] || `__${tpl.slots.find(s => s.key === k).label}__`));
  const allFilled = tpl.slots.every(s => vals[s.key] && vals[s.key].trim());

  const save = () => {
    if (!allFilled) { alert('每一空都填上呀！'); return; }
    const poem = { id: 'p' + Date.now(), title: tpl.title, lines: filled, time: Date.now() };
    setUser(u => ({
      ...u,
      poems: [...(u.poems || []), poem],
      badges: u.badges.includes('first_poem') ? u.badges : [...u.badges, 'first_poem']
    }));
    AudioFX.chime();
    setVals({});
    alert('小诗已保存到"作品集"');
  };

  return (
    <div className="px-4 pt-4 pb-32 max-w-md mx-auto">
      <div className="flex gap-2 mb-3">
        {DATA.poemTemplates.map(t => (
          <button key={t.id} onClick={() => { AudioFX.click(); setTpl(t); setVals({}); }}
            className={`paw-press no-tap-highlight px-3 py-1.5 rounded-full text-xs font-semibold ${tpl.id === t.id ? 'bg-paw-500 text-white' : 'bg-white text-stone-600'}`}>
            {t.title}
          </button>
        ))}
      </div>

      <Card className="!p-5">
        <div className="text-xs text-stone-400 mb-1">题目</div>
        <div className="text-xl font-bold text-stone-700 mb-3">《{tpl.title}》</div>
        <div className="space-y-2 text-stone-700 leading-loose">
          {filled.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </Card>

      <div className="mt-4 space-y-2">
        {tpl.slots.map(s => (
          <div key={s.key}>
            <div className="text-xs text-stone-500 mb-1">{s.label}（例：{s.sample}）</div>
            <input type="text" maxLength={20}
              value={vals[s.key] || ''}
              onChange={e => setVals(v => ({ ...v, [s.key]: e.target.value }))}
              placeholder={s.sample}
              className="w-full px-3 py-2 rounded-xl2 bg-white border border-cream-200 focus:border-ginger-400 outline-none" />
          </div>
        ))}
      </div>

      <button onClick={save}
        className="paw-press no-tap-highlight w-full mt-4 bg-ginger-500 text-white font-semibold rounded-xl2 py-3 shadow-soft">
        ✨ 保存这首诗
      </button>
    </div>
  );
}

// -- 作品集 --
function Gallery({ user, setUser }) {
  const items = [
    ...(user.poems || []).map(p => ({ kind: 'poem', ...p })),
    ...(user.artworks || []).map(a => ({ kind: 'art', ...a }))
  ].sort((a, b) => b.time - a.time);

  const remove = (item) => {
    if (!confirm('确定删除这个作品吗？')) return;
    setUser(u => ({
      ...u,
      poems: item.kind === 'poem' ? u.poems.filter(x => x.id !== item.id) : u.poems,
      artworks: item.kind === 'art' ? u.artworks.filter(x => x.id !== item.id) : u.artworks
    }));
  };

  if (items.length === 0) {
    return (
      <div className="p-10 text-center text-stone-500">
        <div className="text-6xl mb-2">📭</div>
        还没有作品哦，去画一幅画或写一首诗吧！
      </div>
    );
  }

  return (
    <div className="px-3 pt-4 pb-32">
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        {items.map(it => (
          <Card key={it.id} className="!p-2 relative">
            <button onClick={() => remove(it)}
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-stone-200 text-stone-600 text-xs">×</button>
            {it.kind === 'art' ? (
              <img src={it.data} alt="作品" className="w-full rounded-xl2 bg-cream-100" />
            ) : (
              <div className="p-2 text-xs text-stone-700 leading-relaxed">
                <div className="font-bold text-paw-500 mb-1">《{it.title}》</div>
                {it.lines.map((l, i) => <div key={i}>{l}</div>)}
              </div>
            )}
            <div className="text-[10px] text-stone-400 text-center mt-1">
              {new Date(it.time).toLocaleDateString('zh-CN')}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 🐾 我的猫管理（重命名 / 设为活跃 / 弃养）
// ============================================================
function MyCats({ user, setUser, go }) {
  const [editing, setEditing] = useState(null); // catId
  const [newName, setNewName] = useState('');

  const startEdit = (cat) => { setEditing(cat.id); setNewName(cat.name); };
  const saveName = () => {
    const nm = newName.trim();
    if (!nm) { alert('名字不能空着哦'); return; }
    setUser(u => ({ ...u, myCats: u.myCats.map(c => c.id === editing ? { ...c, name: nm } : c) }));
    AudioFX.chime();
    setEditing(null);
  };
  const setActive = (cat) => {
    setUser(u => ({ ...u, activeCatId: cat.id }));
    AudioFX.click();
  };
  const abandon = (cat) => {
    if (user.myCats.length === 1) { alert('至少要留一只猫陪你呀～'); return; }
    if (!confirm(`真的要把 ${cat.name} 送走吗？这一步不可恢复。`)) return;
    setUser(u => {
      const myCats = u.myCats.filter(c => c.id !== cat.id);
      const activeCatId = u.activeCatId === cat.id ? myCats[0].id : u.activeCatId;
      return { ...u, myCats, activeCatId };
    });
  };

  return (
    <div className="min-h-full">
      <Header title="我家的猫" onBack={() => go('home')}
        right={<FishCoinBadge n={user.fishCoins} onClick={() => go('shelter')} />} />
      <div className="p-4 pb-32 max-w-md mx-auto">
        <div className="text-xs text-stone-500 mb-3">点猫切换首页陪伴的那一只 · 长按图标可以改名</div>
        <div className="space-y-3">
          {user.myCats.map(c => {
            const b = DATA.breeds.find(x => x.id === c.breedId);
            if (!b) return null;
            const active = c.id === user.activeCatId;
            const h = hungerStateOf(c, b);
            return (
              <Card key={c.id} className={`!p-3 ${active ? 'ring-2 ring-ginger-400' : ''}`}>
                <div className="flex items-center gap-3">
                  <button onClick={() => setActive(c)} className="paw-press no-tap-highlight relative">
                    <CatAvatar breed={b} size="md" dim={c.dormant} />
                    <span className="absolute -bottom-1 -right-1 text-lg">{h?.emoji}</span>
                  </button>
                  <div className="flex-1 min-w-0">
                    {editing === c.id ? (
                      <div className="flex gap-1">
                        <input value={newName} onChange={e => setNewName(e.target.value)} maxLength={10}
                          className="flex-1 min-w-0 px-2 py-1 rounded-xl bg-cream-100 outline-none text-sm" />
                        <button onClick={saveName} className="paw-press no-tap-highlight px-3 bg-ginger-500 text-white rounded-xl text-xs font-semibold">存</button>
                        <button onClick={() => setEditing(null)} className="paw-press no-tap-highlight px-2 bg-stone-200 text-stone-600 rounded-xl text-xs">×</button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-stone-800 truncate">{c.name}</span>
                          <span className="text-[10px] px-1 rounded-full text-white"
                            style={{ background: genderColor(c.gender) }}>{c.gender === 'F' ? '♀' : '♂'}</span>
                          {b.wild && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">🌿 野生</span>}
                          {c.generation === 2 && <span className="text-[10px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full">🐣 第 2 代</span>}
                          {active && <span className="text-[10px] bg-ginger-100 text-ginger-700 px-1.5 py-0.5 rounded-full">陪伴中</span>}
                        </div>
                        <div className="text-xs text-stone-500">{b.name} · {h?.label} · 亲密度 {c.intimacy}</div>
                        <div className="mt-1 h-1.5 bg-cream-100 rounded-full overflow-hidden">
                          <div className="h-full" style={{ width: c.intimacy + '%', background: b.color }} />
                        </div>
                      </>
                    )}
                  </div>
                  {editing !== c.id && (
                    <div className="flex flex-col gap-1">
                      <button onClick={() => startEdit(c)} className="paw-press no-tap-highlight text-xs text-stone-500 underline">改名</button>
                      <button onClick={() => abandon(c)} className="paw-press no-tap-highlight text-xs text-rose-400 underline">送走</button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-5 text-center">
          <BigButton onClick={() => go('shelter')}>🏡 去猫舍领养新猫咪</BigButton>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ℹ️ 关于页（家长信息 + 重置）
// ============================================================
function About({ user, setUser, go }) {
  const [name, setName] = useState(user.kidName || '');
  const [exportText, setExportText] = useState('');
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  const save = () => {
    setUser(u => ({ ...u, kidName: name.trim() || '小喵管理员' }));
    AudioFX.chime();
    alert('已保存');
  };
  const reset = () => {
    if (!confirm('重置所有进度和作品？\n建议先到上面"数据备份"导出一份。\n这一步不可恢复！')) return;
    localStorage.removeItem('miao.user.v2');
    location.reload();
  };
  const cheatFish = () => {
    if (!confirm('家长测试：补发 30 个小鱼干？')) return;
    setUser(u => ({ ...u, fishCoins: u.fishCoins + 30 }));
    AudioFX.chime();
  };

  const doExport = () => {
    try {
      const json = JSON.stringify(user);
      const b64 = btoa(unescape(encodeURIComponent(json)));
      setExportText(`MIAO1:${b64}`);
      AudioFX.chime();
    } catch (e) {
      alert('导出失败：' + e.message);
    }
  };
  const copyExport = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(exportText);
        alert('已复制到剪贴板，找个安全的地方贴一下吧～');
      } else {
        alert('当前环境不支持自动复制，请长按下面的文字手动选中复制');
      }
    } catch (e) {
      alert('复制失败，请手动选中文字复制：' + e.message);
    }
  };
  const doImport = () => {
    const raw = importText.trim();
    if (!raw) { alert('请先粘贴备份字符串'); return; }
    if (!raw.startsWith('MIAO1:')) { alert('这看起来不是喵喵备份字符串（应以 MIAO1: 开头）'); return; }
    let data;
    try {
      const json = decodeURIComponent(escape(atob(raw.slice(6))));
      data = JSON.parse(json);
    } catch (e) {
      alert('解析失败，备份字符串可能不完整：' + e.message);
      return;
    }
    if (typeof data.fishCoins !== 'number' || !Array.isArray(data.myCats)) {
      alert('备份内容不像是喵喵的数据格式');
      return;
    }
    if (!confirm(`导入会覆盖当前所有数据，包括 ${user.myCats.length} 只猫、${user.fishCoins} 🐟。\n备份里有 ${data.myCats.length} 只猫、${data.fishCoins} 🐟。\n确定继续？`)) return;
    setUser(data);
    AudioFX.chime();
    alert('✅ 数据已导入！');
    setShowImport(false);
    setImportText('');
  };

  return (
    <div className="min-h-full">
      <Header title="关于 · 家长" onBack={() => go('home')} />
      <div className="px-5 pt-4 pb-32 max-w-md mx-auto space-y-4">
        <Card>
          <div className="font-bold text-stone-700 mb-2">小朋友信息</div>
          <div className="text-xs text-stone-500 mb-1">你的名字</div>
          <input value={name} onChange={e => setName(e.target.value)} maxLength={10}
            placeholder="比如：依琪呀" className="w-full px-3 py-2 rounded-xl2 bg-cream-100 outline-none mb-3" />
          <BigButton onClick={save}>保存</BigButton>
        </Card>

        <Card>
          <div className="font-bold text-stone-700 mb-2">📦 数据备份 / 恢复</div>
          <p className="text-xs text-stone-500 leading-relaxed mb-3">
            把所有进度（领养的猫、答题、画作、小诗、徽章）打包成一段字符串。
            <b>换手机或重装前先导出</b>，新设备上粘贴导入即可。
          </p>
          <BigButton color="cream" onClick={doExport}>📤 导出我的数据</BigButton>
          {exportText && (
            <div className="mt-3">
              <textarea readOnly value={exportText}
                className="w-full text-[11px] font-mono p-2 rounded-xl2 bg-stone-100 outline-none break-all"
                rows={5}
                onClick={(e) => e.currentTarget.select()} />
              <button onClick={copyExport}
                className="mt-2 text-sm text-ginger-600 underline font-semibold paw-press">
                📋 复制到剪贴板
              </button>
              <p className="text-[11px] text-stone-400 mt-1">截图保存 / 发到自己邮箱 / 微信传给自己 都行</p>
            </div>
          )}

          <button onClick={() => { setShowImport(s => !s); AudioFX.click(); }}
            className="mt-3 paw-press no-tap-highlight w-full bg-cream-100 text-stone-700 font-semibold rounded-xl2 py-3">
            📥 {showImport ? '收起' : '导入数据'}
          </button>
          {showImport && (
            <div className="mt-2">
              <textarea value={importText} onChange={e => setImportText(e.target.value)}
                placeholder="把之前导出的 MIAO1:... 字符串粘贴在这里"
                className="w-full text-[11px] font-mono p-2 rounded-xl2 bg-stone-100 outline-none"
                rows={5} />
              <BigButton onClick={doImport}>✓ 应用导入</BigButton>
            </div>
          )}
        </Card>

        <Card>
          <div className="font-bold text-stone-700 mb-2">关于这个 App</div>
          <p className="text-sm text-stone-600 leading-relaxed">
            《喵喵小百科》给爱猫的小朋友：10 种猫科动物图鉴、45 道题（含 15 道看图识猫）、25 个品种可领养（含 5 只野生猫科观察对象）、🍱 喂养系统、💕 配对繁殖、"猫的一天"、画板与小诗。
          </p>
          <p className="text-xs text-stone-400 mt-3">v0.11.1 · 数据保存在本地，可导出备份 · 每日 🐟 上限 20</p>
        </Card>

        <Card>
          <div className="font-bold text-stone-700 mb-2">家长测试入口</div>
          <button onClick={cheatFish}
            className="paw-press no-tap-highlight w-full bg-ginger-100 text-ginger-700 font-semibold rounded-xl2 py-3 mb-2">
            🐟 +30 小鱼干（试玩领养系统用）
          </button>
        </Card>

        <Card>
          <div className="font-bold text-rose-500 mb-2">危险操作</div>
          <button onClick={reset}
            className="paw-press no-tap-highlight w-full bg-rose-100 text-rose-600 font-semibold rounded-xl2 py-3">
            重置所有进度（不可恢复）
          </button>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// 🏡 猫舍 - 领养新品种
// ============================================================
function Shelter({ user, setUser, go }) {
  const [pick, setPick] = useState(null);  // 当前选中的品种
  const [pickGender, setPickGender] = useState('M');
  const [step, setStep] = useState('browse'); // browse | detail | naming
  const [newName, setNewName] = useState('');

  const breedsByRarity = {
    common: DATA.breeds.filter(b => b.rarity === 'common' && !b.wild),
    rare:   DATA.breeds.filter(b => b.rarity === 'rare'   && !b.wild),
    epic:   DATA.breeds.filter(b => b.rarity === 'epic'   && !b.wild),
    wild:   DATA.breeds.filter(b => b.wild)
  };
  const totalDomestic = DATA.breeds.filter(b => !b.wild).length;

  const ownedCount = (breedId) => user.myCats.filter(c => c.breedId === breedId).length;
  const uniqueOwned = new Set(user.myCats.map(c => c.breedId).filter(id => {
    const b = DATA.breeds.find(x => x.id === id);
    return b && !b.wild;
  })).size;

  const startAdopt = (breed) => {
    if (user.fishCoins < breed.price) {
      AudioFX.wrong();
      alert(`小鱼干不够呀！\n领养 ${breed.name} 需要 ${breed.price} 🐟，你现在有 ${user.fishCoins} 🐟。\n去答题攒一些吧！`);
      return;
    }
    setPick(breed);
    setPickGender(randomGender());
    setNewName('');
    setStep('naming');
  };

  const suggestName = () => {
    const idx = Math.floor(Math.random() * DATA.nameIdeas.length);
    setNewName(DATA.nameIdeas[idx]);
    AudioFX.pop();
  };

  const finalize = () => {
    const nm = newName.trim() || DATA.nameIdeas[Math.floor(Math.random() * DATA.nameIdeas.length)];
    const id = 'c' + Date.now();
    const adoptedAt = Date.now();
    const wild = !!pick.wild;
    setUser(u => {
      const myCats = [...u.myCats, {
        id,
        breedId: pick.id,
        name: nm,
        adoptedAt,
        intimacy: 60,
        gender: pickGender,
        lastFedAt: adoptedAt,
        dormant: false,
        dormantSince: null,
        generation: 1
      }];
      const uniq = new Set(myCats.map(c => c.breedId).filter(id => {
        const b = DATA.breeds.find(x => x.id === id);
        return b && !b.wild;
      })).size;
      const badges = [...u.badges];
      if (myCats.length >= 2 && !badges.includes('first_adopt')) badges.push('first_adopt');
      if (myCats.length >= 5 && !badges.includes('cats_5')) badges.push('cats_5');
      if (uniq >= totalDomestic && !badges.includes('all_breeds')) badges.push('all_breeds');
      if (wild && !badges.includes('wild_first')) badges.push('wild_first');
      return { ...u, myCats, activeCatId: id, fishCoins: u.fishCoins - pick.price, badges };
    });
    AudioFX.chime();
    setStep('browse');
    setPick(null);
    setNewName('');
    setTimeout(() => alert(`${nm}（${genderLabel(pickGender)}）加入你家啦，回首页摸摸它吧！`), 200);
  };

  // ===== 起名页 =====
  if (step === 'naming' && pick) {
    const wild = !!pick.wild;
    return (
      <div className="min-h-full">
        <Header title={`${wild ? '观察' : '领养'} ${pick.name}`} onBack={() => { setStep('browse'); setPick(null); }} />
        <div className="px-5 pt-4 pb-32 max-w-md mx-auto text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="floaty"><CatAvatar breed={pick} size="md" /></div>
            <div className="text-stone-300 text-2xl">↔</div>
            <RealCatPhoto breed={pick} size="md" />
          </div>
          <div className="text-[10px] text-stone-400 mt-1">卡通 ↔ 真实样子</div>
          <div className="mt-3 text-xs text-stone-500">你的新朋友是一只</div>
          <div className="mt-1 inline-flex items-center gap-2">
            <span className="text-base px-2 py-0.5 rounded-full text-white font-bold"
              style={{ background: genderColor(pickGender) }}>
              {genderLabel(pickGender)}{pickGender === 'F' ? '猫' : '猫'}
            </span>
            <button onClick={() => { AudioFX.pop(); setPickGender(g => g === 'F' ? 'M' : 'F'); }}
              className="paw-press no-tap-highlight text-[11px] text-ginger-600 underline">🎲 重新随机</button>
          </div>
          <div className="text-xl font-bold mt-2" style={{ color: pick.color }}>{pick.name}</div>
          <div className="text-xs text-stone-500 mt-1">{pick.temper.join(' · ')}</div>
          {wild && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl2 p-3 text-xs text-amber-800 leading-relaxed">
              🌿 <b>野生猫科观察提醒</b>：野生大猫不是宠物。在这里我们只是"科学观察"，要按时投喂关心它，但它不能繁殖，需要的食物也比家猫多哦。
            </div>
          )}

          <div className="mt-6 text-left">
            <label className="text-sm font-semibold text-stone-700">给它起个名字吧</label>
            <div className="mt-2 flex gap-2">
              <input value={newName} onChange={e => setNewName(e.target.value)} maxLength={10}
                placeholder="比如：布丁、奶糖、汤圆…"
                className="flex-1 min-w-0 px-3 py-3 rounded-xl2 bg-cream-100 outline-none text-lg" />
              <button onClick={suggestName}
                className="paw-press no-tap-highlight bg-white border border-cream-200 px-3 rounded-xl2 text-sm text-stone-600">
                🎲 随机
              </button>
            </div>
            <div className="text-[11px] text-stone-400 mt-2">名字最多 10 个字</div>
          </div>

          <div className="mt-4 bg-cream-100 rounded-xl2 p-3 text-xs text-stone-600 text-left">
            <div className="font-semibold mb-1">起名小灵感：</div>
            <div className="flex flex-wrap gap-1">
              {DATA.nameIdeas.slice(0, 12).map(n => (
                <button key={n} onClick={() => { AudioFX.pop(); setNewName(n); }}
                  className="paw-press no-tap-highlight bg-white px-2 py-0.5 rounded-full text-stone-700 text-xs">
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <BigButton onClick={finalize}>🏠 把它带回家！</BigButton>
            <div className="text-xs text-stone-400 mt-2">花费 {pick.price} 🐟（剩余 {user.fishCoins - pick.price}）</div>
          </div>
        </div>
      </div>
    );
  }

  // ===== 浏览页 =====
  return (
    <div className="min-h-full">
      <Header title="猫舍" onBack={() => go('home')}
        right={<FishCoinBadge n={user.fishCoins} />} />
      <div className="px-4 pt-3 pb-32">
        <div className="max-w-md mx-auto">
          <Card className="!p-3 mb-4 bg-cream-100/60 text-xs text-stone-600 leading-relaxed">
            <div className="font-bold text-stone-700 mb-1">🐟 怎么领养？</div>
            <div>1. 去答题攒 <b className="text-ginger-600">小鱼干</b>（每答对一题 +2~3 🐟）</div>
            <div>2. 在猫舍里选一只喜欢的猫，给它起个名字</div>
            <div>3. 它就会出现在首页陪你啦！</div>
            <div className="mt-1 text-[10px] text-stone-400">家猫已收集 {uniqueOwned} / {totalDomestic}（野生猫科另算 🌿）</div>
          </Card>

          {[
            ['common', '🥚 中华田园猫', '常见品种 · 5 🐟'],
            ['rare',   '💎 短毛贵族',   '中级品种 · 12 🐟'],
            ['epic',   '👑 长毛 & 特别', '稀有品种 · 25-40 🐟'],
            ['wild',   '🌿 野生猫科',   '只供观察 · 60-80 🐟']
          ].map(([key, title, sub]) => (
            <div key={key} className="mb-5">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-bold text-stone-700">{title}</span>
                <span className="text-xs text-stone-400">{sub}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {breedsByRarity[key].map(b => {
                  const owned = ownedCount(b.id);
                  const affordable = user.fishCoins >= b.price;
                  return (
                    <Card key={b.id} onClick={() => startAdopt(b)}
                      className="!p-0 text-center relative overflow-hidden">
                      {b.wild && (
                        <div className="absolute top-1.5 left-1.5 z-10 bg-amber-500 text-white text-[10px] rounded-full px-1.5 py-0.5 shadow-soft">🌿 野生</div>
                      )}
                      {owned > 0 && (
                        <div className="absolute top-1.5 right-1.5 z-10 bg-mint-500 text-white text-[10px] rounded-full px-1.5 py-0.5 shadow-soft">已养 {owned}</div>
                      )}
                      {/* 顶部真实照片 */}
                      <div className="w-full h-28 overflow-hidden" style={{ background: b.color + '22' }}>
                        <img src={breedPhoto(b.id)} alt={b.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display='none'; }} />
                      </div>
                      {/* 底部信息 */}
                      <div className="p-2.5 pt-3 relative">
                        {/* 卡通头像盖在照片底部 */}
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2">
                          <div className="rounded-full bg-white p-0.5 shadow-soft">
                            <CatAvatar breed={b} size="sm" />
                          </div>
                        </div>
                        <div className="mt-4 font-bold text-sm" style={{ color: b.color }}>{b.name}</div>
                        <div className="text-[10px] text-stone-500 leading-tight mt-0.5 min-h-[28px]">
                          {b.temper.join(' · ')}
                        </div>
                        <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${affordable ? 'bg-ginger-100 text-ginger-700' : 'bg-stone-100 text-stone-400'}`}>
                          🐟 {b.price}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 📚 模块: 猫咪小故事（拓展版"你知道吗"）
// ============================================================
function Stories({ user, setUser, go, routeParam }) {
  const [openId, setOpenId] = useState(routeParam?.openStoryId || null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (routeParam?.openStoryId) setOpenId(routeParam.openStoryId);
  }, [routeParam]);

  const cats = DATA.storyCategories;
  const allCats = [{ id: 'all', label: '全部', emoji: '✨', color: '#f59e0b' }, ...cats];
  const list = filter === 'all' ? DATA.stories : DATA.stories.filter(s => s.cat === filter);
  const readSet = new Set(user.readStories || []);

  const story = openId ? DATA.stories.find(s => s.id === openId) : null;

  // 打开故事 1.5 秒后算"读完"，给 +1 🐟（受每日上限约束）
  useEffect(() => {
    if (!story) return;
    AudioFX.pop();
    if (readSet.has(story.id)) return;
    const t = setTimeout(() => {
      setUser(u => {
        const already = (u.readStories || []).includes(story.id);
        if (already) return u;
        const cap = applyFishCap(u, 1);
        const readStories = [...(u.readStories || []), story.id];
        const nextBadges = [...u.badges];
        if (readStories.length >= 5  && !nextBadges.includes('story_5'))   nextBadges.push('story_5');
        if (readStories.length >= 15 && !nextBadges.includes('story_15'))  nextBadges.push('story_15');
        if (readStories.length >= DATA.stories.length && !nextBadges.includes('story_all')) nextBadges.push('story_all');
        return { ...u, ...cap.patch, readStories, badges: nextBadges };
      });
      AudioFX.chime();
    }, 1500);
    return () => clearTimeout(t);
  }, [story]);

  // 详情页
  if (story) {
    const sc = cats.find(c => c.id === story.cat);
    const alreadyRead = readSet.has(story.id);
    return (
      <div className="min-h-full">
        <Header title="猫咪小故事" onBack={() => setOpenId(null)}
          right={<FishCoinBadge n={user.fishCoins} onClick={() => go('shelter')} />} />
        <div className="p-5 pb-32 max-w-md mx-auto">
          <div className="text-center mb-4">
            <div className="text-7xl mb-2">{story.emoji}</div>
            <div className="inline-block text-[11px] px-2 py-0.5 rounded-full"
              style={{ background: (sc?.color || '#aaa') + '22', color: sc?.color || '#666' }}>
              {sc?.emoji} {sc?.label}
            </div>
            <h2 className="text-xl font-bold text-stone-700 mt-2">{story.title}</h2>
            {story.sub && <div className="text-sm text-stone-500 mt-1">{story.sub}</div>}
          </div>

          <Card className="!p-5">
            <p className="text-[15px] leading-relaxed text-stone-700 whitespace-pre-wrap">{story.text}</p>
          </Card>

          <div className="text-center mt-4">
            {alreadyRead ? (
              <div className="text-xs text-stone-400">✓ 这篇你已经读过啦</div>
            ) : (
              <div className="text-xs text-ginger-600">读完会获得 +1 🐟 哦～</div>
            )}
          </div>

          {/* 下一篇 */}
          <div className="mt-5 flex gap-2">
            <BigButton color="cream" className="flex-1" onClick={() => setOpenId(null)}>← 返回列表</BigButton>
            <BigButton className="flex-1" onClick={() => {
              const idx = DATA.stories.findIndex(s => s.id === story.id);
              const next = DATA.stories[(idx + 1) % DATA.stories.length];
              setOpenId(next.id);
            }}>下一篇 →</BigButton>
          </div>
        </div>
      </div>
    );
  }

  // 列表页
  const readCount = (user.readStories || []).length;
  const total = DATA.stories.length;
  return (
    <div className="min-h-full">
      <Header title="猫咪小故事" onBack={() => go('home')}
        right={<FishCoinBadge n={user.fishCoins} onClick={() => go('shelter')} />} />
      <div className="p-5 pb-32 max-w-md mx-auto">
        <DailyFishBar user={user} />

        <div className="mb-4 bg-white rounded-xl2 p-3 shadow-soft text-sm text-stone-600">
          <div className="flex items-center">
            <span>📚 共 <b className="text-ginger-700">{total}</b> 个有趣的喵咪故事</span>
            <span className="ml-auto text-stone-400">已读 {readCount} / {total}</span>
          </div>
          <div className="h-2 bg-cream-100 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-ginger-400 transition-all" style={{ width: (readCount/total*100) + '%' }} />
          </div>
          <div className="text-[11px] text-stone-400 mt-1.5">每读一篇 +1 🐟（每天上限 20 🐟）</div>
        </div>

        {/* 分类筛选 */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-thin -mx-1 px-1 pb-2 mb-3">
          {allCats.map(c => {
            const active = filter === c.id;
            return (
              <button key={c.id} onClick={() => { AudioFX.click(); setFilter(c.id); }}
                className={`paw-press no-tap-highlight flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${active ? 'text-white shadow-pop' : 'bg-white text-stone-600 shadow-soft'}`}
                style={active ? { background: c.color } : {}}>
                {c.emoji} {c.label}
              </button>
            );
          })}
        </div>

        {/* 故事卡片网格 */}
        <div className="grid grid-cols-2 gap-2.5">
          {list.map(s => {
            const sc = cats.find(c => c.id === s.cat);
            const read = readSet.has(s.id);
            return (
              <button key={s.id} onClick={() => { AudioFX.click(); setOpenId(s.id); }}
                className={`paw-press no-tap-highlight text-left rounded-xl2 p-3 shadow-soft transition-all ${read ? 'bg-cream-50 opacity-80' : 'bg-white'}`}>
                <div className="flex items-start gap-2">
                  <div className="text-3xl">{s.emoji}</div>
                  {read && <span className="ml-auto text-[10px] bg-mint-400/40 text-mint-700 px-1.5 py-0.5 rounded-full">已读</span>}
                </div>
                <div className="mt-2 font-bold text-stone-700 text-sm leading-tight line-clamp-2">{s.title}</div>
                <div className="text-[11px] text-stone-400 mt-1 line-clamp-2">{s.sub}</div>
                <div className="text-[10px] mt-1.5" style={{ color: sc?.color }}>{sc?.emoji} {sc?.label}</div>
              </button>
            );
          })}
        </div>

        {list.length === 0 && (
          <div className="text-center text-stone-400 py-10">这个分类暂时还没有故事～</div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 📸 模块: 真实猫图鉴 - 25 个品种的高清照片库
// ============================================================
function BreedGallery({ user, go, routeParam }) {
  const [openId, setOpenId] = useState(routeParam?.breedId || null);

  useEffect(() => {
    if (routeParam?.breedId) setOpenId(routeParam.breedId);
  }, [routeParam]);

  const commonCount = DATA.breeds.filter(b => b.rarity === 'common' && !b.wild).length;
  const rareCount   = DATA.breeds.filter(b => b.rarity === 'rare'   && !b.wild).length;
  const epicCount   = DATA.breeds.filter(b => b.rarity === 'epic'   && !b.wild).length;
  const wildCount   = DATA.breeds.filter(b => b.wild).length;

  const groups = [
    { key: 'common', title: '🥚 中华田园猫', sub: `常见品种 · ${commonCount} 种` },
    { key: 'rare',   title: '💎 短毛贵族',   sub: `中级品种 · ${rareCount} 种` },
    { key: 'epic',   title: '👑 长毛 & 特别', sub: `稀有品种 · ${epicCount} 种` },
    { key: 'wild',   title: '🌿 野生猫科',   sub: `观察对象 · ${wildCount} 种` }
  ];

  const opened = openId ? DATA.breeds.find(b => b.id === openId) : null;

  // 详情查看：放大照片 + breed 信息
  if (opened) {
    const owned = user.myCats.filter(c => c.breedId === opened.id);
    return (
      <div className="min-h-full">
        <Header title={opened.name} onBack={() => setOpenId(null)}
          right={<FishCoinBadge n={user.fishCoins} onClick={() => go('shelter')} />} />
        <div className="p-5 pb-32 max-w-md mx-auto">
          <div className="w-full rounded-xl3 overflow-hidden shadow-pop"
            style={{ aspectRatio: '1/1', background: opened.color + '22' }}>
            <img src={breedPhoto(opened.id)} alt={opened.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display='none'; }} />
          </div>

          <div className="text-center mt-4">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow-soft">
              <CatAvatar breed={opened} size="sm" />
              <div className="text-left">
                <div className="font-bold" style={{ color: opened.color }}>{opened.name}</div>
                <div className="text-[10px] text-stone-500">{opened.temper.join(' · ')}</div>
              </div>
            </div>
          </div>

          <Card className="mt-4 !p-4">
            <div className="text-xs text-stone-500 mb-1">关于这种猫</div>
            <div className="text-sm text-stone-700 leading-relaxed">{opened.desc || `${opened.name}是一种${opened.temper.join('、')}的可爱品种。`}</div>
          </Card>

          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <Card className="!p-2.5">
              <div className="text-[10px] text-stone-400">稀有度</div>
              <div className="text-sm font-bold mt-0.5" style={{ color: opened.color }}>
                {({common:'常见',rare:'稀有',epic:'珍贵'})[opened.rarity] || '?'}
              </div>
            </Card>
            <Card className="!p-2.5">
              <div className="text-[10px] text-stone-400">领养价</div>
              <div className="text-sm font-bold text-ginger-600 mt-0.5">🐟 {opened.price}</div>
            </Card>
            <Card className="!p-2.5">
              <div className="text-[10px] text-stone-400">家里有</div>
              <div className="text-sm font-bold text-mint-600 mt-0.5">{owned.length} 只</div>
            </Card>
          </div>

          {owned.length > 0 && (
            <div className="mt-3 bg-mint-400/20 rounded-xl2 p-3 text-sm">
              <div className="text-stone-500 text-xs mb-1">你家的 {opened.name}：</div>
              <div className="flex flex-wrap gap-1.5">
                {owned.map(c => (
                  <span key={c.id} className="bg-white rounded-full px-2 py-0.5 text-mint-700 font-semibold">{c.name}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex gap-2">
            <BigButton color="cream" className="flex-1" onClick={() => setOpenId(null)}>← 返回</BigButton>
            <BigButton className="flex-1" onClick={() => go('shelter')}>🏡 去猫舍领养</BigButton>
          </div>
        </div>
      </div>
    );
  }

  // 列表
  return (
    <div className="min-h-full">
      <Header title="真实猫图鉴" onBack={() => go('home')}
        right={<FishCoinBadge n={user.fishCoins} onClick={() => go('shelter')} />} />
      <div className="p-5 pb-32 max-w-md mx-auto">
        <Card className="!p-3 mb-4 bg-cream-100/60 text-xs text-stone-600">
          <div className="font-semibold text-stone-700 mb-0.5">📸 {DATA.breeds.length} 个品种的真实照片</div>
          <div className="text-[11px] text-stone-500">点开任意一张看高清大图、品种介绍和家里养的同款猫～</div>
        </Card>

        {groups.map(g => {
          const list = g.key === 'wild'
            ? DATA.breeds.filter(b => b.wild)
            : DATA.breeds.filter(b => b.rarity === g.key && !b.wild);
          return (
            <div key={g.key} className="mb-5">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-bold text-stone-700">{g.title}</span>
                <span className="text-xs text-stone-400">{g.sub}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {list.map(b => {
                  const owned = user.myCats.filter(c => c.breedId === b.id).length;
                  return (
                    <button key={b.id} onClick={() => { AudioFX.click(); setOpenId(b.id); }}
                      className="paw-press no-tap-highlight relative rounded-xl2 overflow-hidden shadow-soft bg-white">
                      <div className="w-full" style={{ aspectRatio: '1/1', background: b.color + '22' }}>
                        <img src={breedPhoto(b.id)} alt={b.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display='none'; }} />
                      </div>
                      {owned > 0 && (
                        <div className="absolute top-1 right-1 bg-mint-500 text-white text-[9px] rounded-full px-1.5 py-0.5">×{owned}</div>
                      )}
                      <div className="px-1 py-1.5 text-[11px] font-semibold leading-tight" style={{ color: b.color }}>
                        {b.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// 🍼 模块: 小猫宝宝起名（繁殖完成后）
// ============================================================
function KittenNaming({ user, setUser, go, kittenDraft, setKittenDraft }) {
  const [name, setName] = useState('');
  if (!kittenDraft) {
    return (
      <div className="min-h-full">
        <Header title="小宝宝" onBack={() => go('home')} />
        <div className="p-10 text-center text-stone-500">没有等领的小宝宝哦～</div>
      </div>
    );
  }
  const { breed, gender, parentIds, pairKey } = kittenDraft;
  const f = user.myCats.find(c => c.id === parentIds[1]);
  const m = user.myCats.find(c => c.id === parentIds[0]);

  const finalize = () => {
    const nm = name.trim() || DATA.nameIdeas[Math.floor(Math.random() * DATA.nameIdeas.length)];
    const id = 'k' + Date.now();
    const adoptedAt = Date.now();
    setUser(u => {
      const myCats = [...u.myCats, {
        id,
        breedId: breed.id,
        name: nm,
        adoptedAt,
        intimacy: 70,
        gender,
        lastFedAt: adoptedAt,
        dormant: false,
        dormantSince: null,
        generation: 2,
        parentIds: [...parentIds]
      }];
      const totalKittens = (u.totalKittens || 0) + 1;
      const pairBonds = { ...(u.pairBonds || {}) };
      delete pairBonds[pairKey];
      const badges = [...u.badges];
      if (!badges.includes('bred_first')) badges.push('bred_first');
      if (totalKittens >= 5 && !badges.includes('bred_5')) badges.push('bred_5');
      if (myCats.length >= 5 && !badges.includes('cats_5')) badges.push('cats_5');
      return { ...u, myCats, activeCatId: id, totalKittens, pairBonds, badges };
    });
    AudioFX.chime();
    setKittenDraft(null);
    setTimeout(() => alert(`🎉 ${nm} 出生啦！\n爸爸：${m?.name || '?'}  妈妈：${f?.name || '?'}\n回首页摸摸 TA 吧～`), 200);
    go('home');
  };

  return (
    <div className="min-h-full">
      <Header title="🐣 小宝宝出生啦！" onBack={() => { setKittenDraft(null); go('home'); }} />
      <div className="px-5 pt-4 pb-32 max-w-md mx-auto text-center">
        <div className="bg-pink-50 rounded-xl3 p-5 shadow-soft">
          <div className="text-xs text-pink-500 font-semibold mb-1">💕 一窝小猫诞生</div>
          <div className="flex items-center justify-center gap-2 text-xs text-stone-600 mb-3">
            <span>{f?.name || '妈妈'} ♀</span>
            <span>×</span>
            <span>{m?.name || '爸爸'} ♂</span>
          </div>
          <div className="floaty inline-block"><CatAvatar breed={breed} size="lg" /></div>
          <div className="mt-3 text-xs text-stone-500">这只小宝宝是</div>
          <div className="mt-1 inline-flex items-center gap-2">
            <span className="text-base px-2 py-0.5 rounded-full text-white font-bold"
              style={{ background: genderColor(gender) }}>{genderLabel(gender)}</span>
            <span className="text-base font-bold" style={{ color: breed.color }}>{breed.name}</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-1">{breed.temper.join(' · ')}</div>
        </div>

        <div className="mt-5 text-left">
          <label className="text-sm font-semibold text-stone-700">给宝宝起个名字吧</label>
          <div className="mt-2 flex gap-2">
            <input value={name} onChange={e => setName(e.target.value)} maxLength={10}
              placeholder="例：小布丁、奶豆、麻薯…"
              className="flex-1 min-w-0 px-3 py-3 rounded-xl2 bg-cream-100 outline-none text-lg" />
            <button onClick={() => { AudioFX.pop(); setName(DATA.nameIdeas[Math.floor(Math.random() * DATA.nameIdeas.length)]); }}
              className="paw-press no-tap-highlight bg-white border border-cream-200 px-3 rounded-xl2 text-sm text-stone-600">
              🎲 随机
            </button>
          </div>
          <div className="text-[11px] text-stone-400 mt-2">名字最多 10 个字</div>
        </div>

        <div className="mt-5">
          <BigButton onClick={finalize}>🍼 接小宝宝回家！</BigButton>
          <div className="text-xs text-stone-400 mt-2">小宝宝是免费的，初始亲密度 70</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 🚀 主 App
// ============================================================
function App() {
  const [user, setUser] = useLocalStorage('miao.user.v2', {
    kidName: '',
    fishCoins: 0,                 // 当前持有的小鱼干
    totalFishEarned: 0,           // 累计获得（徽章用）
    fishToday: 0,                 // 今天已得（每日上限）
    lastFishDate: '',             // 上次获得鱼干的日期 YYYY-MM-DD
    myCats: [                     // 已领养的猫（送一只橘猫"布丁"开场）
      { id: 'c0', breedId: 'orange', name: '布丁', adoptedAt: Date.now(), intimacy: 60,
        gender: 'F', lastFedAt: Date.now(), dormant: false, dormantSince: null, generation: 1 }
    ],
    activeCatId: 'c0',            // 首页正在陪伴的猫
    totalCuddles: 0,              // 累计陪伴次数（徽章用）
    totalFeeds: 0,                // 累计喂猫次数（徽章用）
    totalKittens: 0,              // 累计出生小猫数（徽章用）
    pairBonds: {},                // { 'idA|idB': { startAt: ms } } - 配对中
    correctCount: 0,
    answered: {},
    unlocked: ['house_cat'],      // 猫科动物图鉴解锁
    badges: [],
    artworks: [],
    poems: [],
    readStories: []               // 读过的小故事 id
  });
  const [route, setRoute] = useState('home');
  const [routeParam, setRouteParam] = useState(null);
  const [kittenDraft, setKittenDraft] = useState(null);
  const [returnedNotice, setReturnedNotice] = useState([]);
  const go = (r, param = null) => { setRoute(r); setRouteParam(param); };

  // 一次性：迁移 + 休眠清理 + 配对状态同步（启动时跑一次）
  const ranInitRef = useRef(false);
  useEffect(() => {
    if (ranInitRef.current) return;
    ranInitRef.current = true;
    setUser(u => {
      let next = migrateUserToV011(u);
      const cleaned = applyDormancyCleanup(next);
      next = cleaned.user;
      if (cleaned.returnedCats.length > 0) {
        setReturnedNotice(cleaned.returnedCats.map(c => c.name));
      }
      // 配对状态：合格但没记录的 → 现在记录；不合格的 → 删除
      const eligible = findEligiblePairs(next.myCats);
      const eligibleKeys = new Set(eligible.map(p => p.key));
      const nowMs = Date.now();
      const pairBonds = { ...(next.pairBonds || {}) };
      for (const p of eligible) {
        if (!pairBonds[p.key]) pairBonds[p.key] = { startAt: nowMs };
      }
      for (const k of Object.keys(pairBonds)) {
        if (!eligibleKeys.has(k)) delete pairBonds[k];
      }
      return { ...next, pairBonds };
    });
  }, []);

  // 每次 myCats / 亲密度等变化时同步配对状态（不重置已开始的计时）
  useEffect(() => {
    setUser(u => {
      const eligible = findEligiblePairs(u.myCats);
      const eligibleKeys = new Set(eligible.map(p => p.key));
      const pairBonds = { ...(u.pairBonds || {}) };
      let changed = false;
      const nowMs = Date.now();
      for (const p of eligible) {
        if (!pairBonds[p.key]) { pairBonds[p.key] = { startAt: nowMs }; changed = true; }
      }
      for (const k of Object.keys(pairBonds)) {
        if (!eligibleKeys.has(k)) { delete pairBonds[k]; changed = true; }
      }
      return changed ? { ...u, pairBonds } : u;
    });
  }, [user.myCats]);

  const activeCat = user.myCats.find(c => c.id === user.activeCatId) || user.myCats[0];

  useEffect(() => {
    const s = document.getElementById('yq-splash');
    if (s) {
      setTimeout(() => s.setAttribute('data-hide', '1'), 350);
      setTimeout(() => s.remove(), 800);
    }
  }, []);

  const props = { user, setUser, go, activeCat, routeParam, kittenDraft, setKittenDraft };

  return (
    <div className="min-h-full">
      {route === 'home'         && <Home {...props} />}
      {route === 'shelter'      && <Shelter {...props} />}
      {route === 'encyclopedia' && <Encyclopedia {...props} />}
      {route === 'quiz'         && <Quiz {...props} />}
      {route === 'catday'       && <CatDay {...props} />}
      {route === 'diary'        && <Diary {...props} />}
      {route === 'mycats'       && <MyCats {...props} />}
      {route === 'about'        && <About {...props} />}
      {route === 'stories'      && <Stories {...props} />}
      {route === 'gallery'      && <BreedGallery {...props} />}
      {route === 'kitten'       && <KittenNaming {...props} />}
      {returnedNotice.length > 0 && (
        <ReturnedToShelterModal names={returnedNotice} onClose={() => setReturnedNotice([])} />
      )}
      <BottomNav route={route} go={go} />
    </div>
  );
}

function ReturnedToShelterModal({ names, onClose }) {
  useEffect(() => { AudioFX.pop(); }, []);
  return (
    <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center px-6" onClick={onClose}>
      <div className="bg-white rounded-xl3 p-6 max-w-xs w-full text-center yq-modal-enter" onClick={e => e.stopPropagation()}>
        <div className="text-5xl">😴</div>
        <div className="text-lg font-bold text-stone-700 mt-2">小猫睡得太久回猫舍啦</div>
        <div className="text-sm text-stone-500 mt-2 leading-relaxed">
          {names.map(n => <span key={n} className="inline-block bg-cream-100 px-2 py-0.5 rounded-full mx-0.5 text-stone-700">{n}</span>)}
          <br/>下次记得按时给小猫喂小鱼干哦 🐟
        </div>
        <BigButton className="mt-5" onClick={onClose}>我知道啦</BigButton>
      </div>
    </div>
  );
}

function BottomNav({ route, go }) {
  const items = [
    ['home',         '🏠', '首页'],
    ['shelter',      '🏡', '猫舍'],
    ['quiz',         '❓', '答题'],
    ['encyclopedia', '📖', '图鉴'],
    ['diary',        '🎨', '日记']
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-cream-200 z-20">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {items.map(([key, emoji, label]) => {
          const active = route === key;
          return (
            <button key={key} onClick={() => { AudioFX.click(); go(key); }}
              className={`paw-press no-tap-highlight py-2 text-center ${active ? 'text-ginger-700' : 'text-stone-400'}`}>
              <div className="text-xl">{emoji}</div>
              <div className="text-[10px] mt-0.5 font-semibold">{label}</div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
