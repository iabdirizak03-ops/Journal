interface Trade {
  date: string;
  pair: string;
  setup: string;
  result: 'Win' | 'Loss';
  rMultiple: number;
}

const trades: Trade[] = [
  { date: '2026-05-18', pair: 'EUR/USD', setup: 'NY Breakout', result: 'Win', rMultiple: 2.4 },
  { date: '2026-05-18', pair: 'NQ', setup: 'VWAP Reclaim', result: 'Loss', rMultiple: -1.0 },
  { date: '2026-05-17', pair: 'XAU/USD', setup: 'Liquidity Sweep', result: 'Win', rMultiple: 3.1 },
  { date: '2026-05-16', pair: 'BTC/USD', setup: 'Range Expansion', result: 'Win', rMultiple: 1.8 },
];

const premiumFeatures = [
  'AI-powered post-trade coaching with pattern detection',
  'Screenshot timeline with before/after execution markup',
  'Setup expectancy and confidence scoring by market session',
  'Advanced risk limits: daily loss lockout and max correlation guard',
  'Performance decomposition by symbol, strategy, and time-of-day',
  'Export-ready investor report cards and equity curve snapshots',
];

const totalR = trades.reduce((acc, t) => acc + t.rMultiple, 0);
const winRate = (trades.filter((t) => t.result === 'Win').length / trades.length) * 100;
const avgR = totalR / trades.length;

const metrics = [
  { label: 'Net R', value: `${totalR.toFixed(1)}R` },
  { label: 'Win Rate', value: `${winRate.toFixed(0)}%` },
  { label: 'Avg R / Trade', value: `${avgR.toFixed(2)}R` },
  { label: 'Journal Streak', value: '42 days' },
];

const metricsRoot = document.querySelector('#metrics');
const rowsRoot = document.querySelector('#tradeRows');
const featureRoot = document.querySelector('#features');
const tradeCount = document.querySelector('#tradeCount');

if (metricsRoot && rowsRoot && featureRoot && tradeCount) {
  metricsRoot.innerHTML = metrics
    .map((m) => `<article class="card metric"><h4>${m.label}</h4><p>${m.value}</p></article>`)
    .join('');

  rowsRoot.innerHTML = trades
    .map(
      (trade) => `<tr>
        <td>${trade.date}</td>
        <td>${trade.pair}</td>
        <td>${trade.setup}</td>
        <td class="${trade.result === 'Win' ? 'result-win' : 'result-loss'}">${trade.result}</td>
        <td>${trade.rMultiple > 0 ? '+' : ''}${trade.rMultiple.toFixed(1)}R</td>
      </tr>`,
    )
    .join('');

  featureRoot.innerHTML = premiumFeatures.map((feature) => `<li>${feature}</li>`).join('');
  tradeCount.textContent = `${trades.length} tracked`;
}

const newTradeBtn = document.querySelector<HTMLButtonElement>('#newTradeBtn');
if (newTradeBtn) {
  newTradeBtn.addEventListener('click', () => {
    newTradeBtn.textContent = 'Feature unlocked ✓';
  });
}
