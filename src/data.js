/* 喵喵小百科 - 内容数据
 * 全部使用普通脚本（非模块），挂载到 window.MIAO 命名空间。
 * 数据来源参考：IUCN、National Geographic Kids、维基百科。冷知识均为常识性事实，避免猎奇。
 */
(function (global) {
  // -------------------- 10 种猫科动物 --------------------
  // emoji 是占位插画，后期可替换成 SVG / 图片
  const species = [
    {
      id: 'house_cat',
      name: '家猫',
      latin: 'Felis catus',
      emoji: '🐱',
      color: '#f9852a',
      weightKg: '3 – 6',
      lengthCm: '46 – 50',
      speedKmh: 48,
      lifespanY: '12 – 18',
      habitat: '人类身边',
      intro: '家猫是被人类驯化了大约 9000 年的小型猫科动物，它是世界上养得最多的宠物之一。',
      facts: [
        '猫一天大约睡 12 到 16 小时，相当于人类一辈子三分之一的时间都在睡觉！',
        '猫的呼噜声频率（25–150 Hz）有助于伤口愈合，连骨头都能加速恢复。',
        '猫每只耳朵有 32 块肌肉，可以旋转 180°。',
        '猫的胡须和它身体的最宽处一样宽，是天生的"测量尺"。'
      ],
      starter: true
    },
    {
      id: 'tiger',
      name: '老虎',
      latin: 'Panthera tigris',
      emoji: '🐯',
      color: '#e96a16',
      weightKg: '90 – 310',
      lengthCm: '200 – 390',
      speedKmh: 65,
      lifespanY: '10 – 15',
      habitat: '亚洲森林',
      intro: '老虎是体型最大的猫科动物，每只老虎身上的条纹都不一样，就像我们的指纹。',
      facts: [
        '老虎的皮肤上也有条纹，不是只有毛上有哦！',
        '老虎会游泳，而且很喜欢泡在水里凉快。',
        '老虎一次跳跃能跳 6 米远，比一辆小汽车还长。',
        '一只老虎一晚上可以吃下 35 公斤的肉。'
      ]
    },
    {
      id: 'lion',
      name: '狮子',
      latin: 'Panthera leo',
      emoji: '🦁',
      color: '#bf5113',
      weightKg: '120 – 250',
      lengthCm: '170 – 250',
      speedKmh: 80,
      lifespanY: '10 – 14',
      habitat: '非洲草原',
      intro: '狮子是唯一群居生活的大猫，一群狮子叫做"狮群"，大多由母狮和小狮组成。',
      facts: [
        '只有公狮才有鬃毛，鬃毛越深说明它越健康。',
        '母狮才是真正的"猎手"，狩猎主要靠她们。',
        '狮子的吼声 8 公里外都能听到。',
        '狮子一天可以睡 20 小时，比家猫还懒！'
      ]
    },
    {
      id: 'cheetah',
      name: '猎豹',
      latin: 'Acinonyx jubatus',
      emoji: '🐆',
      color: '#d28a3e',
      weightKg: '40 – 65',
      lengthCm: '110 – 150',
      speedKmh: 112,
      lifespanY: '8 – 12',
      habitat: '非洲草原',
      intro: '猎豹是陆地上跑得最快的动物，从 0 加速到 100 公里/小时只需要 3 秒！',
      facts: [
        '猎豹的爪子收不回去，像跑鞋的钉子，跑得更快更稳。',
        '它眼角下面的"黑泪痕"能挡阳光，方便白天打猎。',
        '猎豹只能短距离冲刺，跑 30 秒就要休息半小时。',
        '猎豹不会"吼"，它的叫声更像鸟叫和呼噜。'
      ]
    },
    {
      id: 'leopard',
      name: '花豹',
      latin: 'Panthera pardus',
      emoji: '🐈‍⬛',
      color: '#7a3717',
      weightKg: '30 – 80',
      lengthCm: '90 – 190',
      speedKmh: 58,
      lifespanY: '12 – 17',
      habitat: '亚洲/非洲森林',
      intro: '花豹是非常会爬树的大猫，它经常把猎物拖到树上慢慢吃，免得被鬣狗抢走。',
      facts: [
        '花豹身上的圆斑叫做"玫瑰花斑"，因为像一朵朵小花。',
        '花豹是夜行动物，眼睛能在黑暗中看东西。',
        '花豹可以叼起比自己重 3 倍的猎物上树。',
        '黑豹其实就是黑色的花豹，仔细看还是有斑纹的。'
      ]
    },
    {
      id: 'snow_leopard',
      name: '雪豹',
      latin: 'Panthera uncia',
      emoji: '❄️',
      color: '#7aa9c9',
      weightKg: '22 – 55',
      lengthCm: '100 – 130',
      speedKmh: 65,
      lifespanY: '15 – 18',
      habitat: '亚洲高山雪原',
      intro: '雪豹生活在 3000 米以上的高山雪原，因为非常稀有又难见到，被称为"雪山幽灵"。',
      facts: [
        '雪豹的尾巴和身体差不多长，跑步时帮它保持平衡，睡觉时还能当围巾。',
        '雪豹的脚掌像雪靴一样毛茸茸，能在雪地里防滑保暖。',
        '雪豹一次能跳 15 米远，是猫科里跳得最远的。',
        '中国是世界上雪豹最多的国家。'
      ]
    },
    {
      id: 'jaguar',
      name: '美洲豹',
      latin: 'Panthera onca',
      emoji: '🟡',
      color: '#b08442',
      weightKg: '56 – 96',
      lengthCm: '110 – 190',
      speedKmh: 80,
      lifespanY: '12 – 15',
      habitat: '美洲雨林',
      intro: '美洲豹是美洲最大的猫科动物，比花豹更壮实，咬合力是所有大猫里最强的。',
      facts: [
        '美洲豹会潜水捕鱼，水里的鱼、乌龟、鳄鱼它都吃。',
        '它能一口咬穿鳄鱼的头骨，是丛林里的小坦克。',
        '美洲豹的花斑中间有小黑点，花豹则没有。',
        '玛雅人崇拜美洲豹，把它叫做"森林之王"。'
      ]
    },
    {
      id: 'cougar',
      name: '美洲狮',
      latin: 'Puma concolor',
      emoji: '🦌',
      color: '#a06c3a',
      weightKg: '29 – 80',
      lengthCm: '100 – 180',
      speedKmh: 80,
      lifespanY: '8 – 13',
      habitat: '美洲山地',
      intro: '美洲狮也叫山狮、彪马，全身一种颜色没有花纹，是分布范围最广的大型猫科动物。',
      facts: [
        '美洲狮不会"吼"，它咕咕叫的声音很像家猫。',
        '它一次能从地面垂直跳到 5 米高的树上。',
        '美洲狮的别名超过 40 个，是动物里小名最多的。',
        '美洲狮属于小型猫科，是"大号的家猫"。'
      ]
    },
    {
      id: 'lynx',
      name: '猞猁',
      latin: 'Lynx lynx',
      emoji: '👂',
      color: '#9e8055',
      weightKg: '8 – 30',
      lengthCm: '80 – 130',
      speedKmh: 50,
      lifespanY: '7 – 12',
      habitat: '北方森林',
      intro: '猞猁耳朵尖上有一撮黑毛，看起来很像两根天线，那其实是它的"听力增强器"。',
      facts: [
        '猞猁的脚特别大，像穿了雪鞋一样，在雪里走不容易陷下去。',
        '它最爱吃野兔，一天能吃掉半只大野兔。',
        '猞猁是独行侠，平时不和别的猞猁玩。',
        '猞猁的眼神冷酷，但其实是非常害羞的猫。'
      ]
    },
    {
      id: 'serval',
      name: '薮猫',
      latin: 'Leptailurus serval',
      emoji: '🌿',
      color: '#c79b54',
      weightKg: '9 – 18',
      lengthCm: '60 – 100',
      speedKmh: 80,
      lifespanY: '10 – 20',
      habitat: '非洲草原',
      intro: '薮猫腿长身瘦，是猫里"腿最长的模特"，靠超强的耳朵听老鼠的脚步声捕食。',
      facts: [
        '薮猫的耳朵相对身体来说，是所有猫里最大的。',
        '它能垂直跳 3 米高，凌空抓住飞过的小鸟。',
        '薮猫捕猎成功率超过 50%，比老虎和狮子还高。',
        '薮猫会发出像鸟一样的"咕咕"叫声。'
      ]
    }
  ];

  // -------------------- 15 个可领养家猫品种 --------------------
  // rarity: common (5 🐟) / rare (12 🐟) / epic (25 🐟)
  const breeds = [
    // ===== 中华田园猫 (common) =====
    { id: 'orange',        name: '橘猫',         emoji: '🐱', deco: '🌞', color: '#f9852a', rarity: 'common', price: 5,
      temper: ['贪吃','慵懒','黏人'],
      desc: '又叫"橘座"，是中国最常见的家猫之一。十只橘猫九只胖，剩下一只在去吃饭的路上。' },
    { id: 'cow',           name: '奶牛猫',       emoji: '🐱', deco: '🐮', color: '#3a3a3a', rarity: 'common', price: 5,
      temper: ['活泼','爱闯祸','智商高'],
      desc: '黑白花的家猫，江湖人称"奶牛刺客"。看着憨厚，其实可能是猫圈最调皮的一种。' },
    { id: 'calico',        name: '三花猫',       emoji: '🐱', deco: '🌸', color: '#d97757', rarity: 'common', price: 5,
      temper: ['独立','温柔','聪明'],
      desc: '黑、白、橘三种颜色的猫，几乎全部都是女孩子，因为颜色基因长在 X 染色体上。' },
    { id: 'tortoise',      name: '玳瑁猫',       emoji: '🐱', deco: '🍂', color: '#6f4423', rarity: 'common', price: 5,
      temper: ['有个性','聪明','认主'],
      desc: '黑色、橘色像玳瑁壳那样交织在一起的猫，每一只的花纹都独一无二。' },
    { id: 'tabby',         name: '狸花猫',       emoji: '🐱', deco: '🐅', color: '#a08055', rarity: 'common', price: 5,
      temper: ['勇敢','会抓老鼠','身体棒'],
      desc: '中国土生土长的小老虎，是世界上最古老的猫之一，被列为中国本土纯种猫。' },

    // ===== 短毛系列 (rare) =====
    { id: 'british_blue',  name: '英短蓝猫',     emoji: '🐱', deco: '💙', color: '#7e8d9e', rarity: 'rare', price: 12,
      temper: ['绅士','安静','圆滚滚'],
      desc: '英国的国宝猫，蓝灰色短毛，圆脸圆眼圆爪子，是"包子脸"代表选手。' },
    { id: 'british_silver',name: '银渐层',       emoji: '🐱', deco: '⚪', color: '#c8ced4', rarity: 'rare', price: 12,
      temper: ['优雅','冷静','爱干净'],
      desc: '英短家族的"银发贵族"，毛尖银白、毛根稍深，被叫做"会走路的绒毛玩具"。' },
    { id: 'american',      name: '美短虎斑',     emoji: '🐱', deco: '🌀', color: '#b5a98a', rarity: 'rare', price: 12,
      temper: ['运动健将','机灵','友好'],
      desc: '美国短毛猫，身上有像漩涡一样的银黑色虎斑，是天生的运动员。' },
    { id: 'ragdoll',       name: '布偶猫',       emoji: '🐱', deco: '😇', color: '#e6d5c2', rarity: 'rare', price: 12,
      temper: ['黏人','像狗一样','蓝眼睛'],
      desc: '抱起来软得像布娃娃，所以叫"布偶"。蓝眼睛、长毛，性格超级温柔。' },
    { id: 'exotic',        name: '加菲猫',       emoji: '🐱', deco: '😾', color: '#e0b78a', rarity: 'rare', price: 12,
      temper: ['扁脸','懒','可爱嘟嘴'],
      desc: '正式名字叫"异国短毛猫"，是波斯猫和美短的孩子，自带"不开心"扁脸。' },
    { id: 'scottish',      name: '苏格兰折耳',   emoji: '🐱', deco: '📎', color: '#98826b', rarity: 'rare', price: 12,
      temper: ['乖巧','喜欢躺平','耳朵折'],
      desc: '耳朵向前折下来的小猫，喜欢用"佛祖坐"的姿势躺着，软糯糯的。' },

    // ===== 长毛/特别 (epic) =====
    { id: 'maine_coon',    name: '缅因猫',       emoji: '🐱', deco: '🦁', color: '#735b3e', rarity: 'epic', price: 25,
      temper: ['巨型','温柔','像狗'],
      desc: '家猫里的"巨人"，最大能长到 11 公斤！性格特别温和，被叫做"温柔的巨人"。' },
    { id: 'persian',       name: '波斯猫',       emoji: '🐱', deco: '👑', color: '#d7c6b5', rarity: 'epic', price: 25,
      temper: ['高贵','优雅','要梳毛'],
      desc: '一身长长的丝绸毛，脸圆圆扁扁，是猫界的"古典美人"。' },
    { id: 'siamese',       name: '暹罗猫',       emoji: '🐱', deco: '🗣️', color: '#c7a989', rarity: 'epic', price: 25,
      temper: ['话痨','聪明','认主'],
      desc: '泰国的国宝猫，蓝眼睛，鼻子、耳朵、爪子是深色的。它会一直跟你"聊天"。' },
    { id: 'sphynx',        name: '斯芬克斯无毛猫',emoji: '🐱', deco: '👽', color: '#f4d4b8', rarity: 'epic', price: 25,
      temper: ['爱抱抱','怕冷','长得像 ET'],
      desc: '没有毛的猫，皮肤摸起来像桃子。因为没毛所以怕冷，特别喜欢钻被窝。' }
  ];

  // -------------------- 题库（30 题）--------------------
  // 关卡：1 家猫篇 / 2 猫科篇 / 3 动物百科
  const quizzes = [
    // ===== Level 1: 家猫篇 =====
    { id: 'q1',  level: 1, q: '家猫一天大约睡多少小时？', opts: ['4 小时', '8 小时', '12-16 小时', '24 小时'], a: 2, hint: '猫是"睡觉冠军"哦', unlocks: 'tiger' },
    { id: 'q2',  level: 1, q: '猫的胡须有什么作用？', opts: ['只是装饰', '量身体能不能钻过去', '当鼻毛', '吓唬老鼠'], a: 1, hint: '猫钻洞前会先伸胡须探一探' },
    { id: 'q3',  level: 1, q: '猫慢慢地对你眨眼睛是什么意思？', opts: ['想睡觉了', '"我喜欢你"', '生气了', '看不清你'], a: 1, hint: '猫的"亲吻"就藏在眼睛里' },
    { id: 'q4',  level: 1, q: '为什么猫从高处掉下来总能四脚着地？', opts: ['脚上有粘性', '尾巴是降落伞', '身体能在空中翻转', '会魔法'], a: 2, hint: '猫的耳朵里有个"平衡器"' },
    { id: 'q5',  level: 1, q: '猫的"踩奶"行为是什么意思？', opts: ['饿了', '感到放松、像小时候在妈妈身边', '生气', '想运动'], a: 1, hint: '小猫吃奶时也是这个动作' },
    { id: 'q6',  level: 1, q: '猫的呼噜声大约多少赫兹？', opts: ['1 Hz', '25-150 Hz', '500 Hz', '2000 Hz'], a: 1, hint: '这个频率还能帮助伤口恢复' },
    { id: 'q7',  level: 1, q: '猫为什么喜欢钻箱子？', opts: ['里面有零食', '狭窄的地方让它有安全感', '想睡觉', '想看你着急'], a: 1, hint: '小空间 = 小避风港' },
    { id: 'q8',  level: 1, q: '猫的舌头上有什么？', opts: ['小钩子（倒刺）', '小吸盘', '甜味感受器', '什么都没有'], a: 0, hint: '所以猫舔起来糙糙的' },
    { id: 'q9',  level: 1, q: '猫尾巴竖得高高的代表？', opts: ['生气', '心情很好、打招呼', '害怕', '想拉屎'], a: 1, hint: '小猫见妈妈时也会竖尾巴' },
    { id: 'q10', level: 1, q: '猫一只耳朵里有几块肌肉？', opts: ['2', '8', '32', '100'], a: 2, hint: '所以耳朵能 180° 旋转' },

    // ===== Level 2: 猫科篇 =====
    { id: 'q11', level: 2, q: '陆地上跑得最快的动物是？', opts: ['老虎', '猎豹', '狮子', '袋鼠'], a: 1, hint: '它 3 秒就能跑到 100 公里/小时', unlocks: 'cheetah' },
    { id: 'q12', level: 2, q: '哪一种猫科动物的尾巴和身体一样长，能当围巾？', opts: ['老虎', '雪豹', '狮子', '猞猁'], a: 1, hint: '它生活在高山雪原', unlocks: 'snow_leopard' },
    { id: 'q13', level: 2, q: '哪只大猫最爱泡水、还会游泳？', opts: ['狮子', '老虎', '猎豹', '猞猁'], a: 1, hint: '它喜欢在水里凉快' },
    { id: 'q14', level: 2, q: '咬合力最强的大猫是？', opts: ['老虎', '狮子', '美洲豹', '雪豹'], a: 2, hint: '它能咬穿鳄鱼的头骨', unlocks: 'jaguar' },
    { id: 'q15', level: 2, q: '哪一种是唯一群居的大猫？', opts: ['老虎', '狮子', '花豹', '雪豹'], a: 1, hint: '一群叫做"狮群"' },
    { id: 'q16', level: 2, q: '花豹和美洲豹的花纹有什么区别？', opts: ['完全一样', '美洲豹的花斑中间多了小黑点', '花豹是条纹', '美洲豹没有花纹'], a: 1, hint: '看花斑中间的小点点' },
    { id: 'q17', level: 2, q: '哪一种猫的耳朵相对身体最大？', opts: ['薮猫', '老虎', '家猫', '猞猁'], a: 0, hint: '它靠耳朵听老鼠的脚步声', unlocks: 'serval' },
    { id: 'q18', level: 2, q: '老虎身上的条纹是？', opts: ['只长在毛上', '皮肤上也有', '画上去的', '只有母虎才有'], a: 1, hint: '剃了毛也看得见' },
    { id: 'q19', level: 2, q: '哪种猫不会"吼"，叫声像家猫？', opts: ['美洲狮', '老虎', '狮子', '花豹'], a: 0, hint: '它是大号的家猫', unlocks: 'cougar' },
    { id: 'q20', level: 2, q: '猞猁耳朵尖上的黑毛是？', opts: ['装饰', '听力增强器', '保暖', '没用'], a: 1, hint: '它能听到很微弱的声音', unlocks: 'lynx' },

    // ===== Level 3: 动物百科 =====
    { id: 'q21', level: 3, q: '猫科动物属于哪一大类动物？', opts: ['鱼类', '鸟类', '哺乳动物', '爬行动物'], a: 2, hint: '它们都喝奶长大' },
    { id: 'q22', level: 3, q: '世界上现存的猫科动物大约有多少种？', opts: ['约 10 种', '约 40 种', '约 100 种', '约 500 种'], a: 1, hint: '比想象的多哦' },
    { id: 'q23', level: 3, q: '猫科动物大都是？', opts: ['吃草', '吃肉', '杂食', '吃水果'], a: 1, hint: '它们是天生的猎手' },
    { id: 'q24', level: 3, q: '下面哪一种不是猫科动物？', opts: ['老虎', '狮子', '鬣狗', '猎豹'], a: 2, hint: '它看着像狗，其实是另一个家族' },
    { id: 'q25', level: 3, q: '濒危的大猫如雪豹和老虎，主要威胁是？', opts: ['天气太热', '没有玩具', '栖息地被破坏 + 被偷猎', '没人喂'], a: 2, hint: '保护森林就是保护它们' },
    { id: 'q26', level: 3, q: '"宠物医生"在医学里叫什么职业？', opts: ['护士', '兽医', '理发师', '快递员'], a: 1, hint: '专门看动物病的医生' },
    { id: 'q27', level: 3, q: '研究动物为什么会有那些行为的科学家叫？', opts: ['动物行为学家', '工程师', '飞行员', '画家'], a: 0, hint: '比如研究猫为什么会踩奶' },
    { id: 'q28', level: 3, q: '想保护一只受伤的流浪猫，最好先做什么？', opts: ['抱回家随便养', '立刻给它洗澡', '联系正规救助站或兽医', '放在原地不管'], a: 2, hint: '专业的人能帮它更好' },
    { id: 'q29', level: 3, q: '"TNR" 是流浪猫救助里常用的方法，它的意思是？', opts: ['抓住-绝育-放回', '抓住-杀掉-埋葬', '抓住-训练-表演', '抓住-涂色-放回'], a: 0, hint: '这样能温柔地控制流浪猫数量' },
    { id: 'q30', level: 3, q: '下面哪一句话是对的？', opts: ['所有大猫都怕水', '猫只能看见黑白', '猫科动物是一个家族，家猫是其中一员', '猫和狗是亲戚'], a: 2, hint: '想想家猫和老虎的关系' }
  ];

  // -------------------- 猫的一天 时间表 --------------------
  const dayTimeline = [
    { id: 'morning',  time: '6:00',  title: '伸懒腰',   emoji: '🌅', color: '#ffbd75',
      desc: '太阳刚刚出来，小猫从沙发上坐起来，弓起背伸了个超长的懒腰。',
      did: '猫早上要先做"全身拉伸"，把昨晚睡软的关节都活动开。',
      action: 'stretch' },
    { id: 'breakfast', time: '8:00',  title: '吃早饭', emoji: '🍱', color: '#ffa047',
      desc: '咔嚓咔嚓，是它最爱的猫粮。它吃得很专心，尾巴竖得高高的。',
      did: '猫一天会吃 10–20 顿小餐，所以你看它好像一直在啃。',
      action: 'feed' },
    { id: 'play',     time: '10:00', title: '玩耍时光', emoji: '🎾', color: '#7bd1b4',
      desc: '逗猫棒一晃，它的瞳孔变成两颗大圆球，准备扑！',
      did: '玩耍其实是猫练习"狩猎"的小课程。',
      action: 'play' },
    { id: 'patrol',   time: '12:00', title: '巡逻',     emoji: '🚶', color: '#a665b3',
      desc: '它要把家里每个角落都走一遍：窗台、书架、桌底、洗手间。',
      did: '猫每天巡逻是为了确认"我的地盘还安全"。',
      action: 'walk' },
    { id: 'nap',      time: '14:00', title: '午睡',     emoji: '😴', color: '#c98ed4',
      desc: '阳光斜斜的，它在窗边卷成一个面包，开始呼噜呼噜睡。',
      did: '猫呼噜的频率能帮自己（和你）放松、甚至愈合伤口。',
      action: 'purr' },
    { id: 'cuddle',   time: '16:00', title: '撒娇',     emoji: '🥺', color: '#ff9b91',
      desc: '它跳到你腿上，蹭蹭你的下巴，开始踩奶。',
      did: '踩奶是小奶猫吃奶时的动作，长大了再做表示它非常安心。',
      action: 'cuddle' },
    { id: 'dinner',   time: '18:00', title: '晚饭',     emoji: '🍣', color: '#f9852a',
      desc: '它已经守在饭碗前等你了，咪呜咪呜地催。',
      did: '猫的视力在弱光下比人类好 6 倍，黄昏正是它的黄金时段。',
      action: 'feed' },
    { id: 'night',    time: '22:00', title: '夜行模式', emoji: '🌙', color: '#4dbe9a',
      desc: '你睡了，它的眼睛却像两颗发光的弹珠，开始在屋里跑酷。',
      did: '猫属于"晨昏型"动物，黄昏和清晨最活跃。',
      action: 'zoom' }
  ];

  // -------------------- 小诗模板 --------------------
  const poemTemplates = [
    {
      id: 'poem1',
      title: '我的猫',
      lines: [
        '我的猫叫【name】，',
        '它最喜欢【like】。',
        '当它【action】的时候，',
        '我觉得【feel】。'
      ],
      slots: [
        { key: 'name',   label: '名字',   sample: '布丁' },
        { key: 'like',   label: '它喜欢…', sample: '在窗边晒太阳' },
        { key: 'action', label: '做什么', sample: '踩奶' },
        { key: 'feel',   label: '我觉得…', sample: '世界都软软的' }
      ]
    },
    {
      id: 'poem2',
      title: '小小猫的一天',
      lines: [
        '清晨它【morning】，',
        '中午它【noon】。',
        '傍晚趴在【place】，',
        '安静像一团【shape】。'
      ],
      slots: [
        { key: 'morning', label: '清晨它做…', sample: '伸了个大懒腰' },
        { key: 'noon',    label: '中午它做…', sample: '在地毯上打滚' },
        { key: 'place',   label: '趴在哪里',  sample: '窗台上' },
        { key: 'shape',   label: '像一团什么', sample: '小面包' }
      ]
    },
    {
      id: 'poem3',
      title: '如果我是一只猫',
      lines: [
        '如果我是一只猫，',
        '我要【wish1】，',
        '我要【wish2】，',
        '然后【ending】。'
      ],
      slots: [
        { key: 'wish1',  label: '我要…',  sample: '跳到最高的树梢' },
        { key: 'wish2',  label: '我还要…', sample: '尝尝月亮的味道' },
        { key: 'ending', label: '然后…',  sample: '回家睡到太阳出来' }
      ]
    }
  ];

  // -------------------- 简笔画 - 起步贴纸 --------------------
  // 小朋友可以用这些 emoji 作为"贴纸"，配合画板
  const stickers = ['🐱','🐾','🐟','🥛','🧶','🌸','🌟','❤️','🎀','☁️','🌙','🌳','🦋','🍡','🧸'];

  // -------------------- 爱猫人职业 --------------------
  const careers = [
    { id: 'vet',           name: '兽医',         emoji: '🩺', desc: '专门给小动物看病，让它们重新蹦蹦跳跳。', daily: '检查身体、做手术、和宠物爸妈聊天。' },
    { id: 'groomer',       name: '宠物美容师', emoji: '✂️', desc: '帮猫狗剪毛、洗澡、剪指甲，让它们变好看。', daily: '修剪、按摩、安抚紧张的小动物。' },
    { id: 'ethologist',    name: '动物行为学家', emoji: '🔬', desc: '研究动物为什么会做那些动作，比如猫为什么踩奶。', daily: '观察、记录、写论文、在野外蹲点。' },
    { id: 'photographer',  name: '野生动物摄影师', emoji: '📷', desc: '在野外拍下大自然里的动物瞬间。', daily: '背相机、躲帐篷、等几小时只为按一下快门。' },
    { id: 'documentary',   name: '纪录片导演', emoji: '🎬', desc: '把动物的故事拍成电影，给全世界的小朋友看。', daily: '出差、剪片、写解说词、和摄影师配合。' }
  ];

  // -------------------- 徽章 --------------------
  const badges = [
    { id: 'first_unlock',  name: '第一次见面',   emoji: '👋', cond: '解锁第 1 只猫科动物' },
    { id: 'three_unlock',  name: '猫科小侦探',   emoji: '🔍', cond: '解锁 3 只猫科动物' },
    { id: 'all_unlock',    name: '猫科收藏家',   emoji: '🏆', cond: '解锁全部 10 只猫科动物' },
    { id: 'quiz_10',       name: '答题小能手',   emoji: '⭐', cond: '答对 10 道题' },
    { id: 'first_poem',    name: '小小诗人',     emoji: '✍️', cond: '完成第 1 首诗' },
    { id: 'first_paint',   name: '小小画家',     emoji: '🎨', cond: '完成第 1 幅画' },
    { id: 'cuddle_5',      name: '撸猫达人',     emoji: '🥰', cond: '陪猫互动 5 次' },
    { id: 'first_adopt',   name: '第 1 只小猫',  emoji: '🏠', cond: '领养第 1 只猫' },
    { id: 'cats_5',        name: '小猫管家',     emoji: '🐾', cond: '领养 5 只猫' },
    { id: 'all_breeds',    name: '猫舍主理人',   emoji: '🎖️', cond: '集齐全部 15 个品种' },
    { id: 'fishcoins_50',  name: '小鱼干富翁',   emoji: '🐟', cond: '累计获得 50 个小鱼干' }
  ];

  // -------------------- 起名建议（小朋友可参考） --------------------
  const nameIdeas = ['布丁','奶糖','花卷','汤圆','馒头','麻薯','可乐','椰子','西米','小米',
                     '雪糕','棉花','土豆','番茄','栗子','咖啡','拿铁','摩卡','糖糖','豆沙'];

  global.MIAO = { species, breeds, quizzes, dayTimeline, poemTemplates, stickers, careers, badges, nameIdeas };
})(window);
