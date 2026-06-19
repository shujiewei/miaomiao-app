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

  // -------------------- 25 个可领养品种 --------------------
  // rarity: common (5 🐟) / rare (12 🐟) / epic (25-40 🐟) / wild (60-80 🐟)
  // wild: true 的是野生猫科动物（科学观察），不能繁殖
  // gender 字段是品种的"代表性别"——实际领养时每只都是 50/50 随机
  const breeds = [
    // ===== 中华田园猫 (common) =====
    { id: 'orange',        name: '橘猫',         emoji: '🐱', deco: '🌞', color: '#f9852a', rarity: 'common', price: 5, gender: 'F',
      temper: ['贪吃','慵懒','黏人'],
      desc: '又叫"橘座"，是中国最常见的家猫之一。十只橘猫九只胖，剩下一只在去吃饭的路上。' },
    { id: 'cow',           name: '奶牛猫',       emoji: '🐱', deco: '🐮', color: '#3a3a3a', rarity: 'common', price: 5, gender: 'M',
      temper: ['活泼','爱闯祸','智商高'],
      desc: '黑白花的家猫，江湖人称"奶牛刺客"。看着憨厚，其实可能是猫圈最调皮的一种。' },
    { id: 'calico',        name: '三花猫',       emoji: '🐱', deco: '🌸', color: '#d97757', rarity: 'common', price: 5, gender: 'F',
      temper: ['独立','温柔','聪明'],
      desc: '黑、白、橘三种颜色的猫，几乎全部都是女孩子，因为颜色基因长在 X 染色体上。' },
    { id: 'tortoise',      name: '玳瑁猫',       emoji: '🐱', deco: '🍂', color: '#6f4423', rarity: 'common', price: 5, gender: 'F',
      temper: ['有个性','聪明','认主'],
      desc: '黑色、橘色像玳瑁壳那样交织在一起的猫，每一只的花纹都独一无二。' },
    { id: 'tabby',         name: '狸花猫',       emoji: '🐱', deco: '🐅', color: '#a08055', rarity: 'common', price: 5, gender: 'M',
      temper: ['勇敢','会抓老鼠','身体棒'],
      desc: '中国土生土长的小老虎，是世界上最古老的猫之一，被列为中国本土纯种猫。' },
    { id: 'black',         name: '黑猫',         emoji: '🐈‍⬛', deco: '🌑', color: '#222222', rarity: 'common', price: 5, gender: 'M',
      temper: ['神秘','优雅','夜行侠'],
      desc: '一身漆黑的家猫，眼睛像黄宝石一样亮。在英国和日本被认为是带来好运的猫。' },
    { id: 'white',         name: '白猫',         emoji: '🐱', deco: '☁️', color: '#e8e8e8', rarity: 'common', price: 5, gender: 'F',
      temper: ['乖巧','安静','像棉花糖'],
      desc: '一身雪白的家猫，干干净净像一团棉花糖。蓝眼睛的白猫有时听不见，要更细心地照顾它。' },

    // ===== 短毛系列 (rare) =====
    { id: 'british_blue',  name: '英短蓝猫',     emoji: '🐱', deco: '💙', color: '#7e8d9e', rarity: 'rare', price: 12, gender: 'M',
      temper: ['绅士','安静','圆滚滚'],
      desc: '英国的国宝猫，蓝灰色短毛，圆脸圆眼圆爪子，是"包子脸"代表选手。' },
    { id: 'british_silver',name: '银渐层',       emoji: '🐱', deco: '⚪', color: '#c8ced4', rarity: 'rare', price: 12, gender: 'F',
      temper: ['优雅','冷静','爱干净'],
      desc: '英短家族的"银发贵族"，毛尖银白、毛根稍深，被叫做"会走路的绒毛玩具"。' },
    { id: 'american',      name: '美短虎斑',     emoji: '🐱', deco: '🌀', color: '#b5a98a', rarity: 'rare', price: 12, gender: 'M',
      temper: ['运动健将','机灵','友好'],
      desc: '美国短毛猫，身上有像漩涡一样的银黑色虎斑，是天生的运动员。' },
    { id: 'ragdoll',       name: '布偶猫',       emoji: '🐱', deco: '😇', color: '#e6d5c2', rarity: 'rare', price: 12, gender: 'F',
      temper: ['黏人','像狗一样','蓝眼睛'],
      desc: '抱起来软得像布娃娃，所以叫"布偶"。蓝眼睛、长毛，性格超级温柔。' },
    { id: 'exotic',        name: '加菲猫',       emoji: '🐱', deco: '😾', color: '#e0b78a', rarity: 'rare', price: 12, gender: 'M',
      temper: ['扁脸','懒','可爱嘟嘴'],
      desc: '正式名字叫"异国短毛猫"，是波斯猫和美短的孩子，自带"不开心"扁脸。' },
    { id: 'scottish',      name: '苏格兰折耳',   emoji: '🐱', deco: '📎', color: '#98826b', rarity: 'rare', price: 12, gender: 'F',
      temper: ['乖巧','喜欢躺平','耳朵折'],
      desc: '耳朵向前折下来的小猫，喜欢用"佛祖坐"的姿势躺着，软糯糯的。' },

    // ===== 长毛/特别 (epic) =====
    { id: 'maine_coon',    name: '缅因猫',       emoji: '🐱', deco: '🦁', color: '#735b3e', rarity: 'epic', price: 25, gender: 'M',
      temper: ['巨型','温柔','像狗'],
      desc: '家猫里的"巨人"，最大能长到 11 公斤！性格特别温和，被叫做"温柔的巨人"。' },
    { id: 'persian',       name: '波斯猫',       emoji: '🐱', deco: '👑', color: '#d7c6b5', rarity: 'epic', price: 25, gender: 'F',
      temper: ['高贵','优雅','要梳毛'],
      desc: '一身长长的丝绸毛，脸圆圆扁扁，是猫界的"古典美人"。' },
    { id: 'siamese',       name: '暹罗猫',       emoji: '🐱', deco: '🗣️', color: '#c7a989', rarity: 'epic', price: 25, gender: 'M',
      temper: ['话痨','聪明','认主'],
      desc: '泰国的国宝猫，蓝眼睛，鼻子、耳朵、爪子是深色的。它会一直跟你"聊天"。' },
    { id: 'sphynx',        name: '斯芬克斯无毛猫',emoji: '🐱', deco: '👽', color: '#f4d4b8', rarity: 'epic', price: 25, gender: 'F',
      temper: ['爱抱抱','怕冷','长得像 ET'],
      desc: '没有毛的猫，皮肤摸起来像桃子。因为没毛所以怕冷，特别喜欢钻被窝。' },
    { id: 'bengal',        name: '豹猫',         emoji: '🐆', deco: '🌿', color: '#c98a3e', rarity: 'epic', price: 30, gender: 'M',
      temper: ['好动','聪明','爱玩水'],
      desc: '豹猫（Bengal）身上有玫瑰花斑，像缩小版的小花豹。爱跑爱跳，还喜欢玩水，是家猫里的"运动达人"。' },
    { id: 'toyger',        name: '玩具虎',       emoji: '🐯', deco: '🎯', color: '#cf8a30', rarity: 'epic', price: 30, gender: 'F',
      temper: ['活泼','有条纹','黏人'],
      desc: '玩具虎（Toyger）是按"小老虎"的样子培育出来的家猫，身上有橘黑条纹，性格却像普通家猫一样温柔。' },

    // ===== 杂交 (epic) =====
    { id: 'savannah',      name: '萨凡纳猫',     emoji: '🐱', deco: '🌾', color: '#cba365', rarity: 'epic', price: 40, gender: 'M',
      temper: ['腿长','活泼','聪明'],
      desc: '萨凡纳猫（Savannah）是家猫和薮猫杂交出来的孩子，腿很长、跳得很高，是体型最大的家猫之一。' },

    // ===== 野生猫科 (wild · 仅供观察, 不能繁殖) =====
    { id: 'tiger_wild',    name: '老虎',         emoji: '🐯', deco: '🌳', color: '#e96a16', rarity: 'wild', price: 80, gender: 'M', wild: true,
      temper: ['威猛','爱泡水','王者气质'],
      desc: '森林之王！野生大猫里体型最大，每只老虎的条纹都不一样。我们在 App 里只是科学观察哦，老虎不是宠物。' },
    { id: 'leopard_wild',  name: '花豹',         emoji: '🐆', deco: '🌿', color: '#a86a2c', rarity: 'wild', price: 80, gender: 'F', wild: true,
      temper: ['敏捷','会爬树','安静'],
      desc: '花豹身上长着像玫瑰一样的花斑，是非常会爬树的大猫，喜欢把猎物拖到树上慢慢吃。' },
    { id: 'snow_leopard',  name: '雪豹',         emoji: '❄️', deco: '🏔️', color: '#7aa9c9', rarity: 'wild', price: 80, gender: 'F', wild: true,
      temper: ['稀有','耐寒','跳得远'],
      desc: '住在 3000 米以上高山雪原的"雪山幽灵"。它的尾巴和身体一样长，可以当围巾，跑步时帮它平衡。' },
    { id: 'lynx',          name: '猞猁',         emoji: '🐈', deco: '👂', color: '#9e8055', rarity: 'wild', price: 60, gender: 'M', wild: true,
      temper: ['独行','害羞','耳朵尖'],
      desc: '猞猁耳朵尖上有一撮黑毛，是天生的"听力增强器"。脚掌大大的像穿了雪鞋，在雪地里走不会陷下去。' },
    { id: 'serval',        name: '薮猫',         emoji: '🐈', deco: '🌾', color: '#d4a45e', rarity: 'wild', price: 60, gender: 'F', wild: true,
      temper: ['长腿','耳朵大','跳得高'],
      desc: '薮猫是非洲草原的"长腿模特"，耳朵超大，能听到地下老鼠的脚步声，捕猎成功率比老虎还高。' }
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
    { id: 'q30', level: 3, q: '下面哪一句话是对的？', opts: ['所有大猫都怕水', '猫只能看见黑白', '猫科动物是一个家族，家猫是其中一员', '猫和狗是亲戚'], a: 2, hint: '想想家猫和老虎的关系' },

    // ===== Level 4: 看图识猫 (真实图片 - 看图识别品种) =====
    { id: 'q41', level: 4, img: 'images/breeds/persian.jpg',
      q: '猜猜这只可爱的猫咪是什么品种？',
      opts: ['布偶猫', '波斯猫', '加菲猫', '缅因猫'], a: 1,
      hint: '古典美人，一身长长的丝绸毛，脸圆圆扁扁。' },
    { id: 'q42', level: 4, img: 'images/breeds/british_blue.jpg',
      q: '这只圆滚滚的蓝灰色猫咪是？',
      opts: ['苏格兰折耳', '美短虎斑', '英短蓝猫', '银渐层'], a: 2,
      hint: '英国的国宝猫，"包子脸"代表选手。' },
    { id: 'q43', level: 4, img: 'images/breeds/ragdoll.jpg',
      q: '蓝眼睛、毛茸茸、抱起来软软的它是？',
      opts: ['暹罗猫', '波斯猫', '布偶猫', '缅因猫'], a: 2,
      hint: '名字里就藏着答案——抱起来软得像个布娃娃。' },
    { id: 'q44', level: 4, img: 'images/breeds/maine_coon.jpg',
      q: '这只巨大蓬松的猫是？',
      opts: ['布偶猫', '缅因猫', '波斯猫', '美短虎斑'], a: 1,
      hint: '家猫里的"巨人"，最大能长到 11 公斤。' },
    { id: 'q45', level: 4, img: 'images/breeds/siamese.jpg',
      q: '蓝眼睛、脸/耳/爪深色的它是？',
      opts: ['布偶猫', '暹罗猫', '波斯猫', '加菲猫'], a: 1,
      hint: '泰国的国宝，喜欢一直跟你"聊天"。' },
    { id: 'q46', level: 4, img: 'images/breeds/sphynx.jpg',
      q: '没有毛、长得像 ET 的它是？',
      opts: ['加菲猫', '英短蓝猫', '斯芬克斯无毛猫', '苏格兰折耳'], a: 2,
      hint: '皮肤摸起来像桃子，特别怕冷。' },
    { id: 'q47', level: 4, img: 'images/breeds/scottish.jpg',
      q: '耳朵向前折下来的可爱小猫是？',
      opts: ['英短蓝猫', '苏格兰折耳', '加菲猫', '美短虎斑'], a: 1,
      hint: '喜欢用"佛祖坐"的姿势躺着。' },
    { id: 'q48', level: 4, img: 'images/breeds/exotic.jpg',
      q: '扁扁脸、自带"不开心"表情的它是？',
      opts: ['波斯猫', '英短蓝猫', '加菲猫', '苏格兰折耳'], a: 2,
      hint: '正式名字叫"异国短毛猫"，是波斯猫和美短的孩子。' },
    { id: 'q49', level: 4, img: 'images/breeds/american.jpg',
      q: '身上有漩涡花纹的运动健将是？',
      opts: ['狸花猫', '英短蓝猫', '美短虎斑', '布偶猫'], a: 2,
      hint: '美国国民猫，天生的运动员。' },
    { id: 'q50', level: 4, img: 'images/breeds/tabby.jpg',
      q: '这只中国本土的"小老虎"是？',
      opts: ['美短虎斑', '玳瑁猫', '狸花猫', '橘猫'], a: 2,
      hint: '中国土生土长的纯种猫，是世界上最古老的猫之一。' },
    { id: 'q51', level: 4, img: 'images/breeds/orange.jpg',
      q: '这只奶橘色的小可爱是？',
      opts: ['加菲猫', '橘猫', '玳瑁猫', '美短虎斑'], a: 1,
      hint: '又叫"橘座"，十只九只胖，剩下一只在去吃饭的路上。' },
    { id: 'q52', level: 4, img: 'images/breeds/cow.jpg',
      q: '黑白两色的"小绅士"是？',
      opts: ['奶牛猫', '三花猫', '玳瑁猫', '波斯猫'], a: 0,
      hint: '江湖人称"奶牛刺客"，看着憨厚其实最调皮。' },
    { id: 'q53', level: 4, img: 'images/breeds/calico.jpg',
      q: '黑、白、橘三种颜色的小可爱是？',
      opts: ['玳瑁猫', '奶牛猫', '三花猫', '橘猫'], a: 2,
      hint: '基因长在 X 染色体上，几乎全部都是女孩子。' },
    { id: 'q54', level: 4, img: 'images/breeds/tortoise.jpg',
      q: '黑色橘色像玳瑁壳交织在一起的它是？',
      opts: ['三花猫', '玳瑁猫', '狸花猫', '美短虎斑'], a: 1,
      hint: '每一只的花纹都独一无二，没有重样。' },
    { id: 'q55', level: 4, img: 'images/breeds/british_silver.jpg',
      q: '毛尖银白、闪闪发光的"银发贵族"是？',
      opts: ['英短蓝猫', '银渐层', '波斯猫', '布偶猫'], a: 1,
      hint: '英短家族的银发选手，被叫做"会走路的绒毛玩具"。' },

    // ===== Level 5: 故事大挑战（题目都来自"猫咪小故事"）=====
    { id: 'q61', level: 5, storyId: 'st_hemingway',
      q: '美国大作家海明威家的猫有什么特别？',
      opts: ['有的有 6 个或 7 个脚趾', '会说人话', '都是橘色', '都没有尾巴'], a: 0,
      hint: '在《海明威的"六趾猫"》里能找到答案～' },
    { id: 'q62', level: 5, storyId: 'st_newton',
      q: '传说大科学家牛顿在书房门上发明了什么？',
      opts: ['猫窗', '猫门', '猫梯', '猫床'], a: 1,
      hint: '为了让心爱的猫自由进出书房～' },
    { id: 'q63', level: 5, storyId: 'st_fengzikai',
      q: '中国漫画家丰子恺最喜欢的白猫叫什么名字？',
      opts: ['白雪', '白象', '白云', '白糖'], a: 1,
      hint: '是一种鼻子很长的大动物～' },
    { id: 'q64', level: 5, storyId: 'st_marktwain',
      q: '美国大作家马克·吐温家里养了几只猫？',
      opts: ['3 只', '9 只', '19 只', '99 只'], a: 2,
      hint: '比"满 18 岁"还多 1 只哦～' },
    { id: 'q65', level: 5, storyId: 'st_larry',
      q: '英国唐宁街 10 号的猫 Larry 的官方头衔是？',
      opts: ['首席捕鼠官', '首席撒娇官', '首席睡觉官', '首席品茶官'], a: 0,
      hint: '它是非常正经的"上班族"！' },
    { id: 'q66', level: 5, storyId: 'st_tama',
      q: '日本贵志车站的猫站长叫什么名字？',
      opts: ['咪咪', '小玉（Tama）', '小花', '阿橘'], a: 1,
      hint: '日语里"玉"读作 Tama～' },
    { id: 'q67', level: 5, storyId: 'st_stubbs',
      q: '美国阿拉斯加的小镇镇长 Stubbs 是哪种猫？',
      opts: ['白猫', '黑猫', '橘猫', '三花猫'], a: 2,
      hint: '颜色像橘子/红薯～' },
    { id: 'q68', level: 5, storyId: 'st_unsinkable_sam',
      q: '"不沉的山姆"经历过几次沉船都活了下来？',
      opts: ['1 次', '2 次', '3 次', '5 次'], a: 2,
      hint: '三艘船都沉了，它却次次都获救' },
    { id: 'q69', level: 5, storyId: 'st_felicette',
      q: '历史上第一只进入太空的猫名字叫？',
      opts: ['Tama', 'Félicette（费莉切特）', 'Lucky', 'Aurora'], a: 1,
      hint: '是 1963 年法国送上太空的小母猫～' },
    { id: 'q70', level: 5, storyId: 'st_bastet',
      q: '4000 年前古埃及的猫神叫什么？',
      opts: ['Anubis（阿努比斯）', 'Bastet（巴斯特）', 'Ra（拉）', 'Isis（伊西斯）'], a: 1,
      hint: '听起来像"巴-斯-特"' },
    { id: 'q71', level: 5, storyId: 'st_maneki',
      q: '招财猫的传说里，一只猫救了武士免遭什么？',
      opts: ['暴雨', '雷劈', '猛兽', '坏人'], a: 1,
      hint: '武士刚离开原地，那个地方就被劈了' },
    { id: 'q72', level: 5, storyId: 'st_freya',
      q: '北欧女神弗蕾娅出门坐的车是用什么拉的？',
      opts: ['两匹白马', '两只大猫', '两只山羊', '两只独角兽'], a: 1,
      hint: '所以维京人觉得养猫家庭会被祝福～' },
    { id: 'q73', level: 5, storyId: 'st_blackcat',
      q: '中世纪欧洲人乱杀黑猫，间接引发了什么灾难？',
      opts: ['黑死病大流行', '大火灾', '大地震', '大海啸'], a: 0,
      hint: '没了天敌，老鼠就把病传开了' },
    { id: 'q74', level: 5, storyId: 'st_cremepuff',
      q: '世界上最长寿的猫"奶油泡芙"活了多少岁？',
      opts: ['18 岁', '28 岁', '38 岁', '48 岁'], a: 2,
      hint: '相当于人类活到 168 岁！' },
    { id: 'q75', level: 5, storyId: 'st_stewie',
      q: '世界上最长的猫 Stewie 大约有多长？',
      opts: ['0.5 米', '1.23 米', '2 米', '3 米'], a: 1,
      hint: '差不多和一年级小朋友一样高～' },
    { id: 'q76', level: 5, storyId: 'st_population',
      q: '全世界大约有多少只家猫？',
      opts: ['6 千万只', '6 亿只', '60 亿只', '6 万只'], a: 1,
      hint: '比中国的人口还多～' },
    { id: 'q77', level: 5, storyId: 'st_slowblink',
      q: '猫对你慢慢眨眼，意思是？',
      opts: ['想睡觉了', '我信任你 / 我爱你', '看不见你', '想吃饭了'], a: 1,
      hint: '猫表达爱意的最高级方式（"cat kiss"）' },
    { id: 'q78', level: 5, storyId: 'st_ears',
      q: '猫的每只耳朵大约有多少块肌肉？',
      opts: ['12 块', '20 块', '32 块', '50 块'], a: 2,
      hint: '所以猫的耳朵可以独立 180° 旋转' },
    { id: 'q79', level: 5, storyId: 'st_garfield',
      q: '加菲猫最爱吃的食物是？',
      opts: ['寿司', '汉堡', '千层面（lasagna）', '炸鸡'], a: 2,
      hint: '是一种烤起来一层一层的意大利菜' },
    { id: 'q80', level: 5, storyId: 'st_hellokitty',
      q: 'Hello Kitty 最特别的地方是？',
      opts: ['没有眼睛', '没有嘴巴', '没有尾巴', '没有耳朵'], a: 1,
      hint: '设计师说：让看的人替她说话' }
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
    { id: 'all_breeds',    name: '猫舍主理人',   emoji: '🎖️', cond: '集齐全部 20 个家猫品种' },
    { id: 'fishcoins_50',  name: '小鱼干富翁',   emoji: '🐟', cond: '累计获得 50 个小鱼干' },
    { id: 'photo_quiz_all',name: '看图识猫达人', emoji: '📸', cond: '答对全部 15 道看图识猫' },
    { id: 'story_5',       name: '听故事的小耳朵', emoji: '🎧', cond: '读完 5 个小故事' },
    { id: 'story_15',      name: '故事猎人',       emoji: '🔍', cond: '读完 15 个小故事' },
    { id: 'story_all',     name: '猫咪学者',       emoji: '🎓', cond: '读完全部 30 个小故事' },
    { id: 'story_quiz_all',name: '故事大冠军',     emoji: '🏆', cond: '答对全部 20 道故事题' },
    { id: 'feed_first',    name: '第一次喂猫',     emoji: '🍱', cond: '第一次给猫咪喂小鱼干' },
    { id: 'feed_10',       name: '投喂能手',       emoji: '🐟', cond: '累计喂猫 10 次' },
    { id: 'intimacy_full', name: '最佳伙伴',       emoji: '💞', cond: '任意一只猫亲密度达到 100' },
    { id: 'wake_dormant',  name: '叫醒小懒猫',     emoji: '⏰', cond: '把睡着的猫咪喂醒一次' },
    { id: 'wild_first',    name: '野猫科观察员',   emoji: '🌿', cond: '第一次领养野生猫科动物' },
    { id: 'bred_first',    name: '小宝宝出生',     emoji: '🐣', cond: '迎来第一只小猫宝宝' },
    { id: 'bred_5',        name: '猫舍奶爸/妈',     emoji: '🍼', cond: '一共生了 5 只小猫宝宝' }
  ];

  // -------------------- 起名建议（小朋友可参考） --------------------
  const nameIdeas = ['布丁','奶糖','花卷','汤圆','馒头','麻薯','可乐','椰子','西米','小米',
                     '雪糕','棉花','土豆','番茄','栗子','咖啡','拿铁','摩卡','糖糖','豆沙'];

  // -------------------- 猫咪小故事（30 篇 · 6 大主题）--------------------
  // 读完一篇 +1 🐟（受每日上限约束）。先点开 1.5 秒以上算"读完"。
  const storyCategories = [
    { id: 'famous',  label: '名人爱猫',  emoji: '✍️', color: '#a06c3a' },
    { id: 'history', label: '历史名猫',  emoji: '📜', color: '#bf5113' },
    { id: 'culture', label: '神话文化',  emoji: '🏛️', color: '#7aa9c9' },
    { id: 'records', label: '趣味纪录',  emoji: '🏆', color: '#d9a93e' },
    { id: 'language',label: '进阶猫语',  emoji: '💬', color: '#7bd1b4' },
    { id: 'media',   label: '文艺作品',  emoji: '🎬', color: '#c98ed4' }
  ];

  const stories = [
    // ===== 名人爱猫 =====
    { id: 'st_hemingway', cat: 'famous', emoji: '✍️', title: '海明威的"六趾猫"',
      sub: '美国大作家与他几十只猫的故事',
      text: '美国大作家海明威家里养了 30 多只猫。最特别的是，他的猫们很多都有 6 个甚至 7 个脚趾！这种"多趾基因"传给了一代又一代后代。现在他在美国佛罗里达的故居博物馆里，仍然住着大约 60 只六趾猫，每天悠闲地晒太阳。"六趾猫"还有个外号就叫"海明威猫"。' },
    { id: 'st_luxun', cat: 'famous', emoji: '✍️', title: '鲁迅家里的小狸花',
      sub: '中国大作家与他养过的猫',
      text: '中国大作家鲁迅虽然在文章里写过自己"仇猫"，但他家里其实养过狸花猫。他最喜欢看猫追老鼠时蹲在墙角的样子。鲁迅的弟弟周作人也很爱猫，写过一篇《虎吻》专门讲家里的猫。文人和猫的缘分，自古就很深。' },
    { id: 'st_newton', cat: 'famous', emoji: '🍎', title: '牛顿发明了"猫门"？',
      sub: '世界上第一个让猫自由进出的小门',
      text: '传说大科学家牛顿喜欢一边喝茶一边思考，又心疼自己的猫总是想出门。于是他在书房的门上锯了一个洞，让猫自由进出。可猫又生了小猫，他又锯了一个小洞……"猫门"这个发明就这样流传下来了。虽然现在科学家觉得这只是个传说，但它特别符合大家心目中疼猫的牛顿形象。' },
    { id: 'st_fengzikai', cat: 'famous', emoji: '🎨', title: '丰子恺画里的"白象"',
      sub: '中国漫画家与他最爱的白猫',
      text: '中国漫画家丰子恺非常爱猫，他养过一只叫"白象"的白猫，还专门画了好多漫画。他说："看着猫在脚边走来走去，整个人都安静了下来。"丰子恺笔下胖嘟嘟的猫，影响了好几代中国小朋友的童年。' },
    { id: 'st_marktwain', cat: 'famous', emoji: '🎩', title: '马克·吐温的 19 只猫',
      sub: '美国大作家家里的"猫部队"',
      text: '美国大作家马克·吐温家里养了 19 只猫，他给每一只都起了搞笑的名字：苏格兰、火药、阿婆、雪球…… 他说："家里没有猫的家，怎么能算家？"他写作的时候总让一只猫趴在自己脚边，仿佛猫在替他校对稿子一样。' },

    // ===== 历史名猫 =====
    { id: 'st_larry', cat: 'history', emoji: '🇬🇧', title: 'Larry：唐宁街首席捕鼠官',
      sub: '英国首相住处里的"长寿官员"',
      text: '英国首相住的唐宁街 10 号，从 2011 年起住着一只叫 Larry 的灰白色猫。它的官方职位是"首席捕鼠官"，每天巡逻、抓老鼠、跟来访的政客撒娇。换了好几位首相它都不走，已经是英国官员里"任职时间最长"的一位。' },
    { id: 'st_tama', cat: 'history', emoji: '🚉', title: 'Tama：日本贵志车站的猫站长',
      sub: '一只猫拯救了一个车站',
      text: '日本和歌山有一个小小的贵志车站，2007 年差点被关闭。这时一只叫小玉（Tama）的三花猫被任命为"站长"，每天戴着小帽子出来迎接乘客。游客们听说后纷纷专程来看它，车站不仅没关，还成了热门旅游景点。Tama 一生都在工作，被全世界的猫奴当成偶像。' },
    { id: 'st_stubbs', cat: 'history', emoji: '🇺🇸', title: 'Stubbs：阿拉斯加猫镇长',
      sub: '一只橘猫当了 20 年镇长',
      text: '美国阿拉斯加有一个叫 Talkeetna 的小镇。1997 年，居民们觉得参选的人类候选人都不太行，干脆把票投给了一只橘猫——Stubbs。它当了 20 年荣誉镇长，每天在小镇广场晒太阳、接受游客抚摸。它去世后，居民们又选了另一只猫 Denali 接班。' },
    { id: 'st_unsinkable_sam', cat: 'history', emoji: '🚢', title: '"不沉之猫"山姆',
      sub: '三艘战舰沉了，它都活下来了',
      text: '二战期间，一只黑白猫先后在三艘战舰上生活。三艘船都先后被击沉，而这只猫每一次都奇迹般地浮在水面的木板上被救起来。水兵们给它起了个外号叫"不沉的山姆"。战争结束后，它在英国一户人家平安度过了余生。' },
    { id: 'st_felicette', cat: 'history', emoji: '🚀', title: 'Félicette：第一只太空猫',
      sub: '1963 年法国送上太空的小母猫',
      text: '1963 年 10 月，法国把一只黑白小母猫送进了太空。她是历史上第一只也是唯一一只进入太空的猫，名字叫 Félicette。她头上戴着小小的航天员头盔，飞到了 157 公里的高空。几十年后，全世界爱猫人士为她在巴黎竖了一座雕像。' },

    // ===== 神话文化 =====
    { id: 'st_bastet', cat: 'culture', emoji: '👁️', title: '古埃及的猫神 Bastet',
      sub: '4000 年前的人崇拜猫到这种程度',
      text: '4000 年前的古埃及，猫被认为是神。猫神巴斯特（Bastet）头是猫、身是女人，掌管家庭、音乐和欢乐。家里的猫死了，全家人要剃眉毛表示悲伤。如果有人故意伤害猫，是要被判死刑的——古埃及人爱猫，是地球史上最严肃的一次。' },
    { id: 'st_maneki', cat: 'culture', emoji: '🙋', title: '招财猫的来历',
      sub: '日本豪德寺的一只救命猫',
      text: '日本有一座小庙叫豪德寺。传说很久以前，一位武士路过时，看见一只猫向他招手。他好奇地走过去，刚离开原地，一道雷就劈在了他刚才站的位置！武士为了感谢这只"救命猫"，在庙里供奉它，从此招手的猫就成了日本的招财符号——招き猫。' },
    { id: 'st_freya', cat: 'culture', emoji: '⚔️', title: '北欧女神弗蕾娅的猫车',
      sub: '维京海盗带猫上船的理由',
      text: '在北欧神话里，爱与丰收女神弗蕾娅（Freya）出门时坐的不是马车，而是两只巨大的猫拉的车！这两只猫又强壮又温柔，所以北欧人觉得"养猫的家庭会被弗蕾娅祝福"。维京海盗出海时也会带猫，既能抓老鼠又能带来好运。' },
    { id: 'st_totoro', cat: 'culture', emoji: '🌳', title: '"龙猫"为什么叫龙猫？',
      sub: '宫崎骏的森林精灵其实参考了哪些动物',
      text: '《龙猫》（Totoro）其实不是猫，是宫崎骏想象出来的森林精灵。但它毛茸茸、爱睡觉、会咕噜咕噜叫——这些都是猫的特点。再加上它身体像云朵一样大，所以中文翻译就叫它"龙猫"。它的原型其实参考了猫头鹰、狸子和狐狸。' },
    { id: 'st_blackcat', cat: 'culture', emoji: '🐈\u200d⬛', title: '黑猫真的不吉利吗？',
      sub: '中世纪欧洲一个让人后悔的传说',
      text: '中世纪欧洲人迷信黑猫是巫婆的伙伴，杀掉了很多。结果老鼠没了天敌大量繁殖，黑死病就大爆发了。所以下次再有人说黑猫不吉利，可以告诉他：黑猫帮人类救过命！现在的英国和日本反而认为黑猫是好运的象征。' },

    // ===== 趣味纪录 =====
    { id: 'st_cremepuff', cat: 'records', emoji: '🎂', title: '最长寿的猫：38 岁的奶油泡芙',
      sub: '相当于人类活到 168 岁',
      text: '美国得克萨斯州有一只叫 Creme Puff（奶油泡芙）的猫，活到了 38 岁零 3 天，相当于人类活到 168 岁！主人说它的长寿秘诀是培根、鸡蛋、芦笋、西兰花……（小提醒：这只是个例，不要给自家猫乱吃，葡萄、洋葱、巧克力对猫都有毒哦！）这只猫的吉尼斯纪录到今天都没人能破。' },
    { id: 'st_stewie', cat: 'records', emoji: '📏', title: '最长的猫：1.23 米的 Stewie',
      sub: '一只猫和小学生差不多长',
      text: '美国一只叫 Stewie 的缅因猫，从鼻子到尾巴尖竟然有 1 米 23 长！把它平放在沙发上，几乎和小学生一样高。它的主人说："每天给它梳毛要梳一个小时。"它生前还经常去医院当治疗猫，给病人带来快乐。' },
    { id: 'st_population', cat: 'records', emoji: '🌍', title: '全世界有多少只家猫？',
      sub: '答案大得吓人',
      text: '全世界大约有 6 亿只家猫！中国大约有 5800 万只家猫，是世界上养猫第二多的国家（第一是美国）。如果把这些猫排成一队头碰尾，可以绕地球 1 圈半。每天它们一起睡觉的时间加起来超过 70 亿小时。' },
    { id: 'st_ashera', cat: 'records', emoji: '💰', title: '最贵的猫：200 万一只',
      sub: '长得像豹子的家猫',
      text: '世界上最贵的猫品种叫"阿什拉"（Ashera），是非洲薮猫和家猫的杂交品种，每只售价约 200 万人民币。它有豹子的花纹，体型却像家猫。不过国际猫科协会其实并不承认这是一个独立品种，所以现在很多专家觉得这是个营销噱头。' },
    { id: 'st_munchkin', cat: 'records', emoji: '🦵', title: '最矮的猫：腿短萌神 Munchkin',
      sub: '猫界的"柯基"',
      text: '曼基康猫（Munchkin）天生四肢短短的，跑起来像装了小弹簧。它们能像普通猫一样跳上桌子，只是看起来更可爱。它们和柯基狗、腊肠狗是"短腿动物三剑客"。不过医生提醒：因为基因原因，它们容易脊柱不太好，主人要多注意。' },

    // ===== 进阶猫语 =====
    { id: 'st_slowblink', cat: 'language', emoji: '😌', title: '慢眨眼 = 猫的"亲亲"',
      sub: '猫表达爱意的最高级方式',
      text: '猫如果对你慢慢地、温柔地眨眼睛，意思是："我在你面前可以放松警惕，我信任你。"这是猫表达爱意的最高级方式。你也可以试着对自家猫慢慢眨眼回礼——它真的会眨回来哦！这个动作被科学家称为 "cat kiss"。' },
    { id: 'st_tail', cat: 'language', emoji: '〰️', title: '尾巴 8 种姿态对照',
      sub: '看尾巴就能知道猫在想什么',
      text: '竖得直直的=超开心；尾尖弯钩=很喜欢你；左右大幅摆动=烦躁/想打架；蓬松炸毛=害怕/防御；夹在屁股底下=极度害怕；轻摇尾尖=好奇；慢慢左右晃=思考中；像问号一样=想互动。看一眼你家猫现在的尾巴，是哪一种？' },
    { id: 'st_ears', cat: 'language', emoji: '👂', title: '耳朵方向告诉你什么',
      sub: '猫每只耳朵有 32 块肌肉',
      text: '耳朵朝前=好奇专注；朝侧="飞机耳"是放松/不耐烦；向后压平=生气警告；一前一后=纠结；快速旋转=听到了什么声音。猫的每只耳朵有 32 块肌肉，可以独立 180° 旋转，比人耳灵活多了。' },
    { id: 'st_pupil', cat: 'language', emoji: '👁️', title: '瞳孔大小的秘密',
      sub: '猫的眼睛会"出卖"它的情绪',
      text: '猫的瞳孔变成一条线=放松专注；圆圆大大的=兴奋/狩猎模式；半睁=昏昏欲睡。光线强弱也会影响，但情绪是更主要的原因。看见你家猫瞳孔突然放大，可能就是准备扑你的脚啦！' },
    { id: 'st_purr', cat: 'language', emoji: '🎵', title: '呼噜声不只是开心',
      sub: '猫的"自带按摩仪"',
      text: '猫呼噜大多数时候是表示"我很舒服"，但其实它们紧张、害怕、生病甚至临终前也会呼噜。科学家认为呼噜的低频震动（25-150Hz）能帮猫自己镇定，还能加快受伤组织的愈合。这是一种"自带按摩仪"。' },

    // ===== 文艺作品 =====
    { id: 'st_garfield', cat: 'media', emoji: '🍝', title: '加菲猫为什么爱吃千层面？',
      sub: '一段藏在童年里的秘密',
      text: '加菲猫（Garfield）出生于 1978 年的美国漫画，最爱的食物是 lasagna（千层面）。漫画作者吉姆·戴维斯说，他小时候家里穷，妈妈做千层面是他童年最美好的回忆，所以让加菲猫"代替他天天吃"。加菲猫现在 47 岁了，还是那么胖。' },
    { id: 'st_hellokitty', cat: 'media', emoji: '🎀', title: 'Hello Kitty 没有嘴巴的秘密',
      sub: '为什么这只猫从来不说话',
      text: '1974 年诞生的 Hello Kitty 是世界上最有名的猫，但你发现她没有嘴巴吗？设计师说："她没有嘴，是因为她让看的人替她说话。"快乐的时候你看她在笑，难过时你看她在抱你。她其实不是一只普通的猫，官方设定里她是一个住在伦敦的小女孩。' },
    { id: 'st_tomjerry', cat: 'media', emoji: '🐭', title: 'Tom & Jerry 永远抓不到的老鼠',
      sub: '85 年还没有结局的追逐',
      text: '汤姆和杰瑞从 1940 年开始，已经互相追了 85 年。这部动画拿过 7 个奥斯卡奖。其实编剧故意让 Tom 抓不住 Jerry——因为他俩抓到的那天，故事就结束了。所以爱看 Tom 偷偷帮 Jerry 的场景的人，才是真的懂这部片。' },
    { id: 'st_blackpolice', cat: 'media', emoji: '🏍️', title: '黑猫警长保卫森林',
      sub: '中国小朋友的童年回忆',
      text: '《黑猫警长》是 1984 年的中国动画，警长开着摩托车在森林里抓坏蛋。最有名的反派是"一只耳"老鼠，少了一只耳朵。剧里有一集"吃红蜘蛛"特别紧张，把好几代中国小朋友看得屏住呼吸——但也让大家从小就懂得要保护森林、保护动物。' },
    { id: 'st_meowth', cat: 'media', emoji: '💰', title: '宝可梦喵喵的来历',
      sub: '它额头的金币其实有原型',
      text: '宝可梦里的"喵喵"（Meowth）灵感来自日本的招财猫！它额头上的金币、举起来招手的爪子、可爱的笑脸，都是招财猫的元素。不过它和招财猫不一样，它是会说人话的"火箭队成员"，还会用"咬咬"和"抓抓"攻击。' }
  ];

  global.MIAO = { species, breeds, quizzes, dayTimeline, poemTemplates, stickers, careers, badges, nameIdeas, stories, storyCategories };
})(window);
