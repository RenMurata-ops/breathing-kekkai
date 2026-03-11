/* ========================================
   結界呼吸® 呼吸波動タイプ診断 v3
   CVR最適化ロジック
   ======================================== */

// ========== パーティクル背景 ==========

(function initParticles() {
  const canvas = document.getElementById('particle-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.min(40, Math.floor(w * h / 25000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        o: Math.random() * 0.5 + 0.1,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p) => {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,169,110,${p.o})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener('resize', () => { resize(); createParticles(); });
})();

// ========== スクロールアニメーション ==========

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('vis');
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);

function initRevealObservers() {
  document.querySelectorAll('.rv').forEach((el) => revealObserver.observe(el));
}
initRevealObservers();

// ========== 診断データ ==========

const questions = [
  {
    id: 1,
    text: '目を閉じて、今この瞬間の自分の呼吸を感じてみてください。',
    context: 'どんな呼吸が自然に出てきますか？',
    choices: [
      { text: 'ゆっくりと深い呼吸。身体全体が緩んでいくような感覚がある', scores: { alpha: 3, delta: 2 } },
      { text: '短く力強い呼吸。胸が広がり、エネルギーが湧くような感覚', scores: { beta: 3, gamma: 1 } },
      { text: '浅く静かな呼吸。意識がどこか遠くへ広がっていくような感覚', scores: { theta: 3, alpha: 1 } },
      { text: '安定した一定のリズム。大地に根を張っているような安定感', scores: { delta: 3, beta: 1 } },
    ],
  },
  {
    id: 2,
    text: '人の多い場所に長時間いた後、あなたはどうなりますか？',
    context: '',
    choices: [
      { text: '他人の感情や疲れを吸い取ったような、重だるさを感じる', scores: { alpha: 3, theta: 1 } },
      { text: '特に影響を受けない。むしろ人のエネルギーで活性化される', scores: { beta: 3, gamma: 2 } },
      { text: '頭の中に雑音が溜まった感覚になり、一人の時間が必要になる', scores: { theta: 3, delta: 1 } },
      { text: '足元がふわふわする感覚。地に足がつかない不安定さを覚える', scores: { delta: 3, alpha: 1 } },
    ],
  },
  {
    id: 3,
    text: '直感が最も冴えるのは、どんなときですか？',
    context: '',
    choices: [
      { text: '誰かと静かに向き合っているとき。相手の本心が言葉より先に伝わる', scores: { alpha: 3, theta: 2 } },
      { text: '決断を迫られた瞬間。プレッシャーの中で、正解が閃く', scores: { beta: 3, gamma: 2 } },
      { text: '夢の中や、うとうとしている半覚醒の状態のとき', scores: { theta: 3, gamma: 1 } },
      { text: '自然の中にいるとき。木や風や水の気配から何かを受け取る', scores: { delta: 3, alpha: 2 } },
    ],
  },
  {
    id: 4,
    text: '朝、目が覚めた直後の状態として最も近いものは？',
    context: '',
    choices: [
      { text: '夢の余韻が残り、しばらくぼんやりとした心地よさの中にいる', scores: { alpha: 2, theta: 3 } },
      { text: 'すぐに今日やるべきことが頭に浮かび、身体が動き出す', scores: { beta: 3, gamma: 1 } },
      { text: '目が覚めているのに意識だけがまだ別の場所にいるような感覚', scores: { theta: 3, delta: 1 } },
      { text: '身体の重さを心地よく感じる。布団の温かさに包まれている安心感', scores: { delta: 3, alpha: 1 } },
    ],
  },
  {
    id: 5,
    text: 'あなたが無意識に惹かれる「音」はどれですか？',
    context: 'これは脳波との親和性に深く関わる質問です。',
    choices: [
      { text: '川のせせらぎ、雨音、波の音。水に関わる自然音', scores: { alpha: 3, delta: 2 } },
      { text: '太鼓やドラムのビート。身体の芯を揺さぶるリズム', scores: { beta: 3, gamma: 2 } },
      { text: 'シンギングボウル、チベタンベル。倍音を含む響き', scores: { theta: 3, alpha: 2 } },
      { text: '風の音、木々のざわめき。大地の呼吸のような音', scores: { delta: 3, theta: 1 } },
    ],
  },
  {
    id: 6,
    text: '以下のうち、最も共感する言葉はどれですか？',
    context: '',
    choices: [
      { text: '「人の痛みがわかること、それが本当の強さだ」', scores: { alpha: 3, delta: 1 } },
      { text: '「迷う暇があるなら、動け。道は歩いた先にしか見えない」', scores: { beta: 3, gamma: 1 } },
      { text: '「見えないものを見ようとする力が、世界を変える」', scores: { theta: 3, gamma: 2 } },
      { text: '「静かに根を張るものだけが、嵐に耐えられる」', scores: { delta: 3, beta: 1 } },
    ],
  },
  {
    id: 7,
    text: '他人から「不思議だ」と言われることがあるとしたら、それはどんな場面ですか？',
    context: '',
    choices: [
      { text: '会っただけで相手が落ち着く、安心すると言われる', scores: { alpha: 3, delta: 2 } },
      { text: '周囲の空気を一瞬で変える力がある、と言われる', scores: { beta: 2, gamma: 3 } },
      { text: '言葉にしていないことを見透かされた、と驚かれる', scores: { theta: 3, alpha: 1 } },
      { text: 'その場にいるだけで場が安定する、と言われる', scores: { delta: 3, beta: 1 } },
    ],
  },
  {
    id: 8,
    text: 'エネルギーが最も充実するのは、一日のうちいつですか？',
    context: '',
    choices: [
      { text: '夕暮れ時。日が沈みかける頃に、不思議と力が湧いてくる', scores: { alpha: 3, theta: 1 } },
      { text: '午前中。太陽が昇るとともに、自分も活性化する', scores: { beta: 3, delta: 1 } },
      { text: '深夜。世界が静まった後、意識が最も研ぎ澄まされる', scores: { theta: 3, gamma: 2 } },
      { text: '早朝。夜明け前の静寂の中に、最も深い集中がある', scores: { delta: 3, alpha: 2 } },
    ],
  },
  {
    id: 9,
    text: 'もしあなたの呼吸に「色」があるとしたら？',
    context: '直感で選んでください。',
    choices: [
      { text: '淡い水色、または銀色。透き通るような柔らかな光', scores: { alpha: 3, theta: 1 } },
      { text: '赤、またはオレンジ。力強く脈打つ炎の色', scores: { beta: 3, gamma: 1 } },
      { text: '紫、または藍色。深く神秘的な闇の中の光', scores: { theta: 3, gamma: 2 } },
      { text: '緑、または茶。大地と森の生命力の色', scores: { delta: 3, alpha: 1 } },
    ],
  },
  {
    id: 10,
    text: '最後に。あなたが「結界」という言葉から連想するものは？',
    context: 'この回答が、あなたの波動タイプを最終的に決定づけます。',
    choices: [
      { text: '大切な人を守るための、優しい光の膜', scores: { alpha: 3, delta: 2 } },
      { text: '外敵を寄せつけない、強固な意志の壁', scores: { beta: 3, gamma: 1 } },
      { text: '次元と次元の境界線。この世とあの世の狭間', scores: { theta: 3, gamma: 2 } },
      { text: '大地から湧き上がる、揺るがない守護の力', scores: { delta: 3, beta: 1 } },
    ],
  },
];

// ========== 結果データ ==========

const typeData = {
  alpha: {
    id: 'alpha', cssClass: 'type-alpha', icon: 'α',
    name: 'α共鳴型', subtitle: '― ヒーラーの息吹 ―',
    rarity: '全体の約18%',
    brief: 'あなたの呼吸は、周囲の波動と「共鳴」する力を持っています。\n\n人の感情や場のエネルギーを敏感に受け取り、自分の呼吸を通じてそれを浄化・調和させることができる、極めて稀有な波動体質です。\n\nα波（8〜13Hz）は「癒しの周波数」と呼ばれ、心身のリラックスと直感力の源泉とされています。\n\nあなたの呼吸は、このα波を自然に増幅させる力を持っています。',
    radarScores: [90, 40, 65, 70, 35],
    sameTypeCount: '2,847',
  },
  beta: {
    id: 'beta', cssClass: 'type-beta', icon: 'β',
    name: 'β覚醒型', subtitle: '― 戦士の息吹 ―',
    rarity: '全体の約22%',
    brief: 'あなたの呼吸は、現実を動かす「覚醒」の力を宿しています。\n\n決断の瞬間に研ぎ澄まされ、行動と意志の力で周囲の流れを変えることができる、非常に強い波動体質です。\n\nβ波（14〜30Hz）は「覚醒の周波数」と呼ばれ、集中力と実行力の源泉とされています。\n\nあなたの呼吸は、このβ波を意識的に高め、現実を切り拓く力場を生み出します。',
    radarScores: [35, 90, 30, 45, 70],
    sameTypeCount: '3,512',
  },
  theta: {
    id: 'theta', cssClass: 'type-theta', icon: 'θ',
    name: 'θ深層型', subtitle: '― 巫女の息吹 ―',
    rarity: '全体のわずか約12%',
    brief: 'あなたの呼吸は、見えない世界と繋がる「深層」の力を持っています。\n\n意識の奥深くにアクセスし、通常では知覚できない情報やビジョンを受け取ることができる、極めて希少な波動体質です。\n\nθ波（4〜8Hz）は「超感覚の周波数」と呼ばれ、深い瞑想状態や霊的知覚の源泉とされています。\n\nあなたの呼吸は、このθ波を自在に引き出し、次元を超えた結界を張ることができます。',
    radarScores: [60, 25, 90, 50, 80],
    sameTypeCount: '1,623',
  },
  delta: {
    id: 'delta', cssClass: 'type-delta', icon: 'δ',
    name: 'δ根源型', subtitle: '― 大地の息吹 ―',
    rarity: '全体の約20%',
    brief: 'あなたの呼吸は、大地と繋がる「根源」の力を宿しています。\n\n揺るがない安定感と深い守護の力を持ち、存在するだけで周囲に安心感と秩序をもたらすことができる、大器の波動体質です。\n\nδ波（0.5〜4Hz）は「根源の周波数」と呼ばれ、最も深い意識状態と生命力の回復に関わる周波数帯です。\n\nあなたの呼吸は、このδ波を安定的に生み出し、大地に根ざした強固な結界を形成します。',
    radarScores: [65, 50, 45, 90, 30],
    sameTypeCount: '2,234',
  },
  gamma: {
    id: 'gamma', cssClass: 'type-gamma', icon: 'γ',
    name: 'γ超越型', subtitle: '― 覚者の息吹 ―',
    rarity: '全体のわずか約8%（最も希少）',
    brief: 'あなたの呼吸は、意識を一段上の次元に引き上げる「超越」の力を持っています。\n\n瞬間的に場の空気を変え、人の意識に直接働きかけることができる、極めて特異な波動体質です。\n\nγ波（30Hz以上）は「超越の周波数」と呼ばれ、高次の気づきと意識変容に関わる最も高い周波数帯です。\n\nあなたの呼吸は、このγ波を爆発的に増幅させ、時空を超えた結界を展開する力を秘めています。',
    radarScores: [45, 60, 75, 35, 90],
    sameTypeCount: '1,087',
  },
};

// ========== 状態管理 ==========

let currentQuestion = 0;
const scores = { alpha: 0, beta: 0, theta: 0, delta: 0, gamma: 0 };
let resultShown = false;

// ========== セクション切り替え ==========

function showSection(id) {
  document.querySelectorAll('.section').forEach((s) => s.classList.remove('active'));
  const section = document.getElementById(id);
  section.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });

  // 結果セクションのrevealを初期化
  if (id === 'result') {
    setTimeout(() => {
      section.querySelectorAll('.rv').forEach((el) => revealObserver.observe(el));
    }, 100);
  }
}

// ========== 診断開始 ==========

function startDiagnosis() {
  showSection('diagnosis');
  currentQuestion = 0;
  Object.keys(scores).forEach((k) => (scores[k] = 0));
  renderQuestion();
}

// ========== 質問描画 ==========

const encouragements = [
  '', '', '',
  'いい調子です',
  '',
  '半分を超えました',
  '',
  'あと少しです',
  '',
  '最後の質問です',
];

function renderQuestion() {
  const q = questions[currentQuestion];
  const area = document.getElementById('question-area');
  const fill = document.getElementById('progress-fill');
  const stepEl = document.getElementById('current-q');
  const encEl = document.getElementById('dx-encouragement');

  fill.style.width = ((currentQuestion + 1) / questions.length) * 100 + '%';
  stepEl.textContent = currentQuestion + 1;

  const enc = encouragements[currentQuestion];
  if (enc) {
    encEl.textContent = enc;
    encEl.classList.add('show');
  } else {
    encEl.classList.remove('show');
  }

  let html = `
    <div class="question-block">
      <p class="q-num">QUESTION ${String(q.id).padStart(2, '0')}</p>
      <h2 class="q-text">${q.text}</h2>
      ${q.context ? `<p class="q-context">${q.context}</p>` : '<div style="margin-bottom:24px"></div>'}
      <div class="choices">
  `;

  q.choices.forEach((choice, idx) => {
    html += `<button class="choice-btn" data-idx="${idx}">${choice.text}</button>`;
  });

  html += '</div></div>';
  area.innerHTML = html;

  // 選択ハンドラ（リップル + ディレイ）
  area.querySelectorAll('.choice-btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      // リップルエフェクト
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      btn.appendChild(ripple);

      // 選択状態表示
      btn.classList.add('sel');
      area.querySelectorAll('.choice-btn').forEach((b) => {
        if (b !== btn) b.style.opacity = '0.4';
        b.style.pointerEvents = 'none';
      });

      // スコア加算 + 次の質問へ
      setTimeout(() => {
        selectChoice(parseInt(btn.dataset.idx));
      }, 400);
    });
  });
}

function selectChoice(idx) {
  const q = questions[currentQuestion];
  const chosen = q.choices[idx];

  Object.entries(chosen.scores).forEach(([type, score]) => {
    scores[type] += score;
  });

  currentQuestion++;

  if (currentQuestion < questions.length) {
    renderQuestion();
  } else {
    startAnalyzing();
  }
}

// ========== 分析演出（高度化） ==========

function startAnalyzing() {
  showSection('analyzing');

  const steps = ['az-1', 'az-2', 'az-3', 'az-4'];
  const pctEl = document.getElementById('az-pct');
  let pct = 0;
  const totalDuration = 6500;
  const stepInterval = totalDuration / steps.length;

  // パーセンテージアニメーション
  const pctAnim = setInterval(() => {
    pct += Math.random() * 3 + 0.5;
    if (pct > 99) pct = 99;
    pctEl.innerHTML = Math.floor(pct) + '<span>%</span>';
  }, 80);

  // ステップアニメーション
  steps.forEach((stepId, i) => {
    setTimeout(() => {
      document.getElementById(stepId).classList.add('on');
    }, i * stepInterval);

    setTimeout(() => {
      document.getElementById(stepId).classList.add('ok');
    }, i * stepInterval + stepInterval * 0.7);
  });

  // 完了
  setTimeout(() => {
    clearInterval(pctAnim);
    pctEl.innerHTML = '100<span>%</span>';
    setTimeout(() => showResult(), 500);
  }, totalDuration);
}

// ========== 結果表示 ==========

function showResult() {
  const resultType = getResultType();
  const data = typeData[resultType];
  resultShown = true;

  showSection('result');

  // カード
  const card = document.getElementById('result-card');
  card.className = 'rs-card ' + data.cssClass;
  document.getElementById('result-icon').textContent = data.icon;
  document.getElementById('result-type-name').textContent = data.name;
  document.getElementById('result-type-subtitle').textContent = data.subtitle;
  document.getElementById('result-rarity').textContent = data.rarity;

  // 本文
  document.getElementById('result-brief').innerHTML = data.brief.replace(/\n/g, '<br>');

  // 同タイプカウント
  document.getElementById('same-type-count').textContent = data.sameTypeCount;

  // LINE URL
  const lineUrl = 'https://lin.ee/XXXXXXXXX?type=' + resultType;
  document.getElementById('line-link').href = lineUrl;
  document.getElementById('float-line-link').href = lineUrl;

  // レーダーチャート
  setTimeout(() => drawRadarChart(data.radarScores), 600);

  // ローカルストレージ
  localStorage.setItem('kekkai_result', JSON.stringify({
    type: resultType, scores: scores, timestamp: new Date().toISOString(),
  }));

  // フローティングCTA制御
  initFloatCTA();
}

function getResultType() {
  let maxScore = 0;
  let maxType = 'alpha';
  Object.entries(scores).forEach(([type, score]) => {
    if (score > maxScore) { maxScore = score; maxType = type; }
  });
  return maxType;
}

// ========== フローティングCTA ==========

function initFloatCTA() {
  const floatCta = document.getElementById('float-cta');
  const lineSection = document.querySelector('.line-block');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        // LINE CTAセクションが見えていないときだけ表示
        floatCta.classList.toggle('show', !e.isIntersecting);
      });
    },
    { threshold: 0.1 }
  );

  if (lineSection) observer.observe(lineSection);

  // 初期表示（少し遅延させて）
  setTimeout(() => {
    if (lineSection) {
      const rect = lineSection.getBoundingClientRect();
      if (rect.top > window.innerHeight) {
        floatCta.classList.add('show');
      }
    }
  }, 2000);
}

// ========== レーダーチャート（アニメーション付き） ==========

function drawRadarChart(targetValues) {
  const canvas = document.getElementById('radar-chart');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  canvas.width = 300 * dpr;
  canvas.height = 300 * dpr;
  canvas.style.width = '300px';
  canvas.style.height = '300px';
  ctx.scale(dpr, dpr);

  const cx = 150, cy = 150, maxR = 105;
  const labels = ['共鳴力', '覚醒力', '深層力', '根源力', '超越力'];
  const angles = labels.map((_, i) => (Math.PI * 2 * i) / labels.length - Math.PI / 2);
  const currentValues = [0, 0, 0, 0, 0];
  const startTime = performance.now();
  const duration = 1200;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function frame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(progress);

    for (let i = 0; i < 5; i++) {
      currentValues[i] = targetValues[i] * eased;
    }

    ctx.clearRect(0, 0, 300, 300);

    // グリッド
    [0.25, 0.5, 0.75, 1].forEach((ratio) => {
      ctx.beginPath();
      angles.forEach((a, i) => {
        const x = cx + Math.cos(a) * maxR * ratio;
        const y = cy + Math.sin(a) * maxR * ratio;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,.06)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // 軸
    angles.forEach((a) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
      ctx.strokeStyle = 'rgba(255,255,255,.04)';
      ctx.stroke();
    });

    // データ
    ctx.beginPath();
    angles.forEach((a, i) => {
      const r = (currentValues[i] / 100) * maxR;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(201,169,110,.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(201,169,110,.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ドット
    angles.forEach((a, i) => {
      const r = (currentValues[i] / 100) * maxR;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(201,169,110,.85)';
      ctx.fill();
    });

    // ラベル
    ctx.fillStyle = 'rgba(232,230,225,.6)';
    ctx.font = '11px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    angles.forEach((a, i) => {
      const lr = maxR + 22;
      ctx.fillText(labels[i], cx + Math.cos(a) * lr, cy + Math.sin(a) * lr);
    });

    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

// ========== LINE遷移トラッキング ==========

function trackLineClick() {
  const result = JSON.parse(localStorage.getItem('kekkai_result') || '{}');
  if (typeof gtag === 'function') {
    gtag('event', 'line_click', { event_category: 'conversion', event_label: result.type || 'unknown' });
  }
  if (typeof fbq === 'function') {
    fbq('track', 'Lead', { content_name: result.type || 'unknown' });
  }
}

// ========== カウンター ==========

(function initCounters() {
  // 今日の診断数（リアルタイム風）
  const todayEl = document.getElementById('today-count');
  if (todayEl) {
    const hour = new Date().getHours();
    const base = Math.floor(hour * 16 + Math.random() * 20 + 80);
    todayEl.textContent = base;
    setInterval(() => {
      const current = parseInt(todayEl.textContent);
      if (Math.random() > 0.6) {
        todayEl.textContent = current + 1;
      }
    }, 8000 + Math.random() * 12000);
  }

  // 累計
  const totalEl = document.getElementById('total-count');
  if (totalEl) {
    const stored = localStorage.getItem('kekkai_base_count');
    const now = Date.now();
    let base;
    if (stored) {
      const data = JSON.parse(stored);
      base = Math.floor(data.count + (now - data.timestamp) / 1000 / 60 / 60 * 3.2);
    } else {
      base = 12849;
      localStorage.setItem('kekkai_base_count', JSON.stringify({ count: base, timestamp: now }));
    }
    totalEl.textContent = base.toLocaleString();
  }
})();
