interface Trade {
  id: string;
  date: string;
  pair: string;
  setup: string;
  session: 'Asia' | 'London' | 'New York';
  result: 'Win' | 'Loss';
  rMultiple: number;
}

const STORAGE_KEY = 'apex-ledger-trades-v1';
const seedTrades: Trade[] = [
  { id: 't1', date: '2026-05-18', pair: 'EUR/USD', setup: 'NY Breakout', session: 'New York', result: 'Win', rMultiple: 2.4 },
  { id: 't2', date: '2026-05-18', pair: 'NQ', setup: 'VWAP Reclaim', session: 'New York', result: 'Loss', rMultiple: -1.0 },
  { id: 't3', date: '2026-05-17', pair: 'XAU/USD', setup: 'Liquidity Sweep', session: 'London', result: 'Win', rMultiple: 3.1 },
  { id: 't4', date: '2026-05-16', pair: 'BTC/USD', setup: 'Range Expansion', session: 'Asia', result: 'Win', rMultiple: 1.8 },
];

const premiumFeatures = [
  'Persistent journal storage in browser (real trade log behavior)',
  'Live setup filters and minimum-R quality screening',
  'Risk radar with daily loss-lock warning and drawdown monitoring',
  'Equity curve visualization based on your R-multiple sequence',
  'Session-aware performance segmentation (Asia/London/New York)',
  'Fast trade capture modal with one-click reset for backtesting demos',
];

let trades: Trade[] = loadTrades();

const metricsRoot = document.querySelector<HTMLElement>('#metrics');
const rowsRoot = document.querySelector<HTMLElement>('#tradeRows');
const featureRoot = document.querySelector<HTMLElement>('#features');
const tradeCount = document.querySelector<HTMLElement>('#tradeCount');
const setupFilter = document.querySelector<HTMLSelectElement>('#setupFilter');
const minRFilter = document.querySelector<HTMLInputElement>('#minRFilter');
const riskStatus = document.querySelector<HTMLElement>('#riskStatus');
const chart = document.querySelector<SVGSVGElement>('#equityChart');
const dialog = document.querySelector<HTMLDialogElement>('#tradeDialog');
const form = document.querySelector<HTMLFormElement>('#tradeForm');

function loadTrades(): Trade[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [...seedTrades];

  try {
    const parsed = JSON.parse(raw) as Trade[];
    return parsed.length ? parsed : [...seedTrades];
  } catch {
    return [...seedTrades];
  }
}

function persistTrades() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
}

function uniqueSetups() {
  return ['All', ...new Set(trades.map((trade) => trade.setup))];
}

function getFilteredTrades() {
  const setupValue = setupFilter?.value ?? 'All';
  const minR = Number(minRFilter?.value ?? '-99');

  return trades
    .filter((trade) => (setupValue === 'All' ? true : trade.setup === setupValue))
    .filter((trade) => trade.rMultiple >= minR)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function computeMetrics(source: Trade[]) {
  const totalR = source.reduce((acc, t) => acc + t.rMultiple, 0);
  const wins = source.filter((t) => t.result === 'Win').length;
  const avgR = source.length ? totalR / source.length : 0;

  return [
    { label: 'Net R', value: `${totalR.toFixed(1)}R` },
    { label: 'Win Rate', value: source.length ? `${((wins / source.length) * 100).toFixed(0)}%` : '0%' },
    { label: 'Avg R / Trade', value: `${avgR.toFixed(2)}R` },
    { label: 'Trades Logged', value: `${source.length}` },
  ];
}

function renderChart(source: Trade[]) {
  if (!chart) return;

  if (!source.length) {
    chart.innerHTML = '';
    return;
  }

  let running = 0;
  const equity = source.map((trade) => {
    running += trade.rMultiple;
    return running;
  });

  const min = Math.min(...equity, 0);
  const max = Math.max(...equity, 0);
  const range = max - min || 1;

  const points = equity
    .map((value, index) => {
      const x = (index / (equity.length - 1 || 1)) * 400;
      const y = 120 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  chart.innerHTML = `<polyline fill="none" stroke="#59f2d7" stroke-width="3" points="${points}" />`;
}

function renderRisk(source: Trade[]) {
  if (!riskStatus) return;

  const today = new Date().toISOString().slice(0, 10);
  const todayR = source.filter((trade) => trade.date === today).reduce((acc, trade) => acc + trade.rMultiple, 0);
  const netR = source.reduce((acc, trade) => acc + trade.rMultiple, 0);

  if (todayR <= -2) {
    riskStatus.textContent = `⚠ Daily loss lock active: ${todayR.toFixed(1)}R today. Stop trading and review execution quality.`;
    return;
  }

  riskStatus.textContent = `✅ Risk healthy. Net performance ${netR.toFixed(1)}R. No lockout triggered.`;
}

function render() {
  if (!metricsRoot || !rowsRoot || !featureRoot || !tradeCount || !setupFilter) return;

  const setups = uniqueSetups();
  const current = setupFilter.value || 'All';
  setupFilter.innerHTML = setups.map((setup) => `<option ${setup === current ? 'selected' : ''}>${setup}</option>`).join('');

  const filtered = getFilteredTrades();

  const metrics = computeMetrics(filtered);
  metricsRoot.innerHTML = metrics.map((m) => `<article class="card metric"><h4>${m.label}</h4><p>${m.value}</p></article>`).join('');

  rowsRoot.innerHTML = filtered
    .map(
      (trade) => `<tr>
        <td>${trade.date}</td>
        <td>${trade.pair}</td>
        <td>${trade.setup}</td>
        <td>${trade.session}</td>
        <td class="${trade.result === 'Win' ? 'result-win' : 'result-loss'}">${trade.result}</td>
        <td>${trade.rMultiple > 0 ? '+' : ''}${trade.rMultiple.toFixed(1)}R</td>
      </tr>`,
    )
    .join('');

  tradeCount.textContent = `${filtered.length} shown / ${trades.length} total`;
  featureRoot.innerHTML = premiumFeatures.map((feature) => `<li>${feature}</li>`).join('');

  renderRisk(trades);
  renderChart(trades);
}

document.querySelector<HTMLButtonElement>('#newTradeBtn')?.addEventListener('click', () => {
  dialog?.showModal();
});

document.querySelector<HTMLButtonElement>('#resetBtn')?.addEventListener('click', () => {
  trades = [...seedTrades];
  persistTrades();
  render();
});

setupFilter?.addEventListener('change', render);
minRFilter?.addEventListener('input', render);

form?.addEventListener('submit', (event) => {
  event.preventDefault();

  const fd = new FormData(form);
  const rValue = Number(fd.get('rMultiple'));
  const trade: Trade = {
    id: crypto.randomUUID(),
    date: String(fd.get('date')),
    pair: String(fd.get('pair')),
    setup: String(fd.get('setup')),
    session: String(fd.get('session')) as Trade['session'],
    rMultiple: rValue,
    result: rValue >= 0 ? 'Win' : 'Loss',
  };

  trades.push(trade);
  persistTrades();
  form.reset();
  dialog?.close();
  render();
});

render();
