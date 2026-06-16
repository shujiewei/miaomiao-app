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
function CatAvatar({ breed, size = 'lg', dim = false }) {
  // 共用：圆形头像 + 装饰 emoji
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

function FishCoinBadge({ n, onClick }) {
  return (
    <button onClick={() => { AudioFX.click(); onClick && onClick(); }}
      className="paw-press no-tap-highlight bg-ginger-100 hover:bg-ginger-200 rounded-full pl-1.5 pr-3 py-1 flex items-center gap-1 shadow-soft">
      <span className="text-lg">🐟</span>
      <span className="font-bold text-ginger-700 text-sm">{n}</span>
    </button>
  );
}

function Home({ user, setUser, go, activeCat }) {
  const [ripples, setRipples] = useState([]);
  const breed = activeCat ? DATA.breeds.find(b => b.id === activeCat.breedId) : null;

  const pet = () => {
    if (!activeCat) return;
    AudioFX.purr();
    setUser(u => {
      const totalCuddles = (u.totalCuddles || 0) + 1;
      const myCats = u.myCats.map(c => c.id === activeCat.id ? { ...c, intimacy: Math.min(100, c.intimacy + 4) } : c);
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
              <button onClick={pet}
                className="paw-press no-tap-highlight floaty rounded-full shadow-pop">
                <CatAvatar breed={breed} size="lg" />
              </button>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: breed.color }}>{activeCat.name}</div>
              <div className="text-xs text-stone-500 mt-0.5">{breed.name} · {breed.temper.slice(0, 2).join(' · ')}</div>
            </div>

            {/* 亲密度 */}
            <div className="max-w-sm mx-auto mt-3 mb-5">
              <div className="flex items-center text-xs text-stone-500 mb-1">
                <span>亲密度</span><span className="ml-auto">{activeCat.intimacy}/100</span>
              </div>
              <div className="h-3 bg-cream-100 rounded-full overflow-hidden">
                <div className="h-full transition-all" style={{ width: activeCat.intimacy + '%', background: breed.color }} />
              </div>
              <div className="text-center text-[11px] text-stone-400 mt-1">摸摸 {activeCat.name} 上升亲密度</div>
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
              return (
                <button key={c.id} onClick={() => { AudioFX.click(); setUser(u => ({ ...u, activeCatId: c.id })); }}
                  className={`paw-press no-tap-highlight flex-shrink-0 rounded-2xl p-2 text-center transition-all ${active ? 'bg-white shadow-pop ring-2 ring-ginger-400' : 'bg-white/60'}`}
                  style={{ width: 72 }}>
                  <div className="mx-auto"><CatAvatar breed={b} size="sm" /></div>
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

        {/* 4 大模块卡 */}
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          <ModuleCard color="ginger" emoji="🏡" title="去猫舍" sub="领养新猫咪" onClick={() => go('shelter')} />
          <ModuleCard color="mint"   emoji="❓" title="喵星大竞猜" sub="答题赚 🐟" onClick={() => go('quiz')} />
          <ModuleCard color="paw"    emoji="🕒" title="猫的一天"   sub="陪伴时光" onClick={() => go('catday')} />
          <ModuleCard color="ginger" emoji="📖" title="猫咪知多少" sub="猫科动物图鉴" onClick={() => go('encyclopedia')} />
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

function ModuleCard({ color, emoji, title, sub, onClick }) {
  const bg = { ginger: 'bg-ginger-100', mint: 'bg-mint-400/20', paw: 'bg-paw-400/20' }[color] || 'bg-cream-100';
  const accent = { ginger: 'text-ginger-700', mint: 'text-mint-600', paw: 'text-paw-500' }[color];
  return (
    <button onClick={() => { AudioFX.click(); onClick(); }}
      className={`paw-press no-tap-highlight rounded-xl2 ${bg} p-4 text-left shadow-soft`}>
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
function Quiz({ user, setUser, go }) {
  const [level, setLevel] = useState(null);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [reward, setReward] = useState(null); // { species, fish }
  const [shake, setShake] = useState(false);

  if (level == null) {
    return (
      <div className="min-h-full">
        <Header title="喵星大竞猜" onBack={() => go('home')}
          right={<FishCoinBadge n={user.fishCoins} onClick={() => go('shelter')} />} />
        <div className="p-5 pb-32 max-w-md mx-auto">
          <p className="text-sm text-stone-500 mb-1">答对一题得 <b className="text-ginger-600">3 🐟</b>，用提示得 <b>2 🐟</b>。</p>
          <p className="text-sm text-stone-500 mb-4">攒够小鱼干就能去 <button onClick={() => { AudioFX.click(); go('shelter'); }} className="underline text-ginger-600">猫舍</button> 领养新猫咪！</p>
          {[1, 2, 3].map(L => {
            const all = DATA.quizzes.filter(q => q.level === L);
            const done = all.filter(q => user.answered[q.id]).length;
            return (
              <Card key={L} onClick={() => { setLevel(L); setIdx(0); setPicked(null); }} className="mb-3 flex items-center gap-3">
                <div className="text-4xl">{['🐱','🐯','🌍'][L-1]}</div>
                <div className="flex-1">
                  <div className="font-bold text-stone-700">{['家猫篇','猫科篇','动物百科'][L-1]}</div>
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

  const list = DATA.quizzes.filter(q => q.level === level);
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
      const stars = showHint ? 4 : 5;
      const fishEarned = showHint ? 2 : 3;
      const willUnlock = q.unlocks && !user.unlocked.includes(q.unlocks);
      const unlockedSpecies = willUnlock ? DATA.species.find(s => s.id === q.unlocks) : null;
      setUser(u => {
        const nextUnlocked = [...u.unlocked];
        if (q.unlocks && !nextUnlocked.includes(q.unlocks)) nextUnlocked.push(q.unlocks);
        const nextAnswered = { ...u.answered, [q.id]: { stars } };
        const correctCount = Object.keys(nextAnswered).length;
        const totalFishEarned = (u.totalFishEarned || 0) + fishEarned;
        const nextBadges = [...u.badges];
        if (nextUnlocked.length >= 1 && !nextBadges.includes('first_unlock')) nextBadges.push('first_unlock');
        if (nextUnlocked.length >= 3 && !nextBadges.includes('three_unlock')) nextBadges.push('three_unlock');
        if (nextUnlocked.length >= 10 && !nextBadges.includes('all_unlock')) nextBadges.push('all_unlock');
        if (correctCount >= 10 && !nextBadges.includes('quiz_10')) nextBadges.push('quiz_10');
        if (totalFishEarned >= 50 && !nextBadges.includes('fishcoins_50')) nextBadges.push('fishcoins_50');
        return {
          ...u,
          unlocked: nextUnlocked,
          answered: nextAnswered,
          correctCount,
          fishCoins: u.fishCoins + fishEarned,
          totalFishEarned,
          badges: nextBadges
        };
      });
      setReward({ species: unlockedSpecies, fish: fishEarned });
    } else {
      AudioFX.wrong();
      setShake(true);
      setTimeout(() => setShake(false), 350);
    }
  };

  const next = () => {
    setPicked(null);
    setShowHint(false);
    setReward(null);
    setIdx(i => i + 1);
  };

  return (
    <div className="min-h-full">
      <Header title={`${['家猫篇','猫科篇','动物百科'][level-1]} · ${idx + 1}/${list.length}`} onBack={() => setLevel(null)}
        right={<FishCoinBadge n={user.fishCoins} onClick={() => go('shelter')} />} />
      <div className="p-5 pb-32 max-w-md mx-auto">
        <div className={`bg-white rounded-xl3 p-5 shadow-soft ${shake ? 'shake' : ''}`}>
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
                <Stars n={showHint ? 4 : 5} />
              </div>
            ) : (
              <div className="text-rose-500 font-bold">差一点点～<br/><span className="text-sm text-stone-500 font-normal">正确答案是 {String.fromCharCode(65 + q.a)}. {q.opts[q.a]}</span></div>
            )}
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
  return (
    <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center px-6" onClick={onClose}>
      <div className="bg-white rounded-xl3 p-6 max-w-xs w-full text-center yq-modal-enter" onClick={e => e.stopPropagation()}>
        {/* 小鱼干奖励 */}
        <div className="text-sm text-stone-500">答对啦，奖励：</div>
        <div className="star-pop my-2 inline-flex items-center gap-1 bg-ginger-100 px-4 py-2 rounded-full">
          <span className="text-3xl">🐟</span>
          <span className="text-2xl font-bold text-ginger-700">+{reward.fish}</span>
        </div>
        <div className="text-xs text-stone-400">现在你有 {fishCoins} 个小鱼干</div>

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

  const tap = () => {
    if (!activeCat) return;
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
              {breed ? <CatAvatar breed={breed} size="md" /> : <div className="w-20 h-20 bg-white rounded-full grid place-items-center text-5xl">🐱</div>}
            </button>
          </div>
          <div className="mt-2 text-xs text-stone-500">点我看看</div>
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
            return (
              <Card key={c.id} className={`!p-3 ${active ? 'ring-2 ring-ginger-400' : ''}`}>
                <div className="flex items-center gap-3">
                  <button onClick={() => setActive(c)} className="paw-press no-tap-highlight">
                    <CatAvatar breed={b} size="md" />
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
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-800 truncate">{c.name}</span>
                          {active && <span className="text-[10px] bg-ginger-100 text-ginger-700 px-1.5 py-0.5 rounded-full">陪伴中</span>}
                        </div>
                        <div className="text-xs text-stone-500">{b.name} · 亲密度 {c.intimacy}</div>
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
  const save = () => {
    setUser(u => ({ ...u, kidName: name.trim() || '小喵管理员' }));
    AudioFX.chime();
    alert('已保存');
  };
  const reset = () => {
    if (!confirm('重置所有进度和作品？这一步不可恢复！')) return;
    localStorage.removeItem('miao.user.v2');
    location.reload();
  };
  const cheatFish = () => {
    if (!confirm('家长测试：补发 30 个小鱼干？')) return;
    setUser(u => ({ ...u, fishCoins: u.fishCoins + 30 }));
    AudioFX.chime();
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
          <div className="font-bold text-stone-700 mb-2">关于这个 App</div>
          <p className="text-sm text-stone-600 leading-relaxed">
            《喵喵小百科》给爱猫的小朋友：10 种猫科动物图鉴、30 道题、15 个家猫品种可领养、"猫的一天"、画板与小诗。
          </p>
          <p className="text-xs text-stone-400 mt-3">v0.2 · 原型版 · 数据保存在浏览器本地</p>
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
  const [step, setStep] = useState('browse'); // browse | detail | naming
  const [newName, setNewName] = useState('');

  const breedsByRarity = {
    common: DATA.breeds.filter(b => b.rarity === 'common'),
    rare:   DATA.breeds.filter(b => b.rarity === 'rare'),
    epic:   DATA.breeds.filter(b => b.rarity === 'epic')
  };

  const ownedCount = (breedId) => user.myCats.filter(c => c.breedId === breedId).length;
  const uniqueOwned = new Set(user.myCats.map(c => c.breedId)).size;

  const startAdopt = (breed) => {
    if (user.fishCoins < breed.price) {
      AudioFX.wrong();
      alert(`小鱼干不够呀！\n领养 ${breed.name} 需要 ${breed.price} 🐟，你现在有 ${user.fishCoins} 🐟。\n去答题攒一些吧！`);
      return;
    }
    setPick(breed);
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
    setUser(u => {
      const myCats = [...u.myCats, { id, breedId: pick.id, name: nm, adoptedAt: Date.now(), intimacy: 60 }];
      const uniq = new Set(myCats.map(c => c.breedId)).size;
      const badges = [...u.badges];
      if (myCats.length >= 2 && !badges.includes('first_adopt')) badges.push('first_adopt');
      if (myCats.length >= 5 && !badges.includes('cats_5')) badges.push('cats_5');
      if (uniq >= DATA.breeds.length && !badges.includes('all_breeds')) badges.push('all_breeds');
      return { ...u, myCats, activeCatId: id, fishCoins: u.fishCoins - pick.price, badges };
    });
    AudioFX.chime();
    setStep('browse');
    setPick(null);
    setNewName('');
    setTimeout(() => alert(`${nm} 加入你家啦，回首页摸摸它吧！`), 200);
  };

  // ===== 起名页 =====
  if (step === 'naming' && pick) {
    return (
      <div className="min-h-full">
        <Header title={`领养 ${pick.name}`} onBack={() => { setStep('browse'); setPick(null); }} />
        <div className="px-5 pt-4 pb-32 max-w-md mx-auto text-center">
          <div className="mx-auto floaty"><CatAvatar breed={pick} size="lg" /></div>
          <div className="mt-3 text-xs text-stone-500">你的新朋友是</div>
          <div className="text-xl font-bold" style={{ color: pick.color }}>{pick.name}</div>
          <div className="text-xs text-stone-500 mt-1">{pick.temper.join(' · ')}</div>

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
            <div className="mt-1 text-[10px] text-stone-400">已收集品种 {uniqueOwned} / {DATA.breeds.length}</div>
          </Card>

          {[
            ['common', '🥚 中华田园猫', '常见品种'],
            ['rare',   '💎 短毛贵族',   '中级品种'],
            ['epic',   '👑 长毛 & 特别', '稀有品种']
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
                      className="!p-3 text-center relative">
                      {owned > 0 && (
                        <div className="absolute top-1 right-1 bg-mint-500 text-white text-[10px] rounded-full px-1.5 py-0.5">已养 {owned}</div>
                      )}
                      <div className="mx-auto"><CatAvatar breed={b} size="md" /></div>
                      <div className="mt-2 font-bold text-sm" style={{ color: b.color }}>{b.name}</div>
                      <div className="text-[10px] text-stone-500 leading-tight mt-0.5 min-h-[28px]">
                        {b.temper.join(' · ')}
                      </div>
                      <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${affordable ? 'bg-ginger-100 text-ginger-700' : 'bg-stone-100 text-stone-400'}`}>
                        🐟 {b.price}
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
// 🚀 主 App
// ============================================================
function App() {
  const [user, setUser] = useLocalStorage('miao.user.v2', {
    kidName: '',
    fishCoins: 0,                 // 当前持有的小鱼干
    totalFishEarned: 0,           // 累计获得（徽章用）
    myCats: [                     // 已领养的猫（送一只橘猫"布丁"开场）
      { id: 'c0', breedId: 'orange', name: '布丁', adoptedAt: Date.now(), intimacy: 60 }
    ],
    activeCatId: 'c0',            // 首页正在陪伴的猫
    totalCuddles: 0,              // 累计陪伴次数（徽章用）
    correctCount: 0,
    answered: {},
    unlocked: ['house_cat'],      // 猫科动物图鉴解锁
    badges: [],
    artworks: [],
    poems: []
  });
  const [route, setRoute] = useState('home');

  const activeCat = user.myCats.find(c => c.id === user.activeCatId) || user.myCats[0];

  useEffect(() => {
    const s = document.getElementById('yq-splash');
    if (s) {
      setTimeout(() => s.setAttribute('data-hide', '1'), 350);
      setTimeout(() => s.remove(), 800);
    }
  }, []);

  const props = { user, setUser, go: setRoute, activeCat };

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
      <BottomNav route={route} go={setRoute} />
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
