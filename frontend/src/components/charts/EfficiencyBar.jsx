import ReactECharts from 'echarts-for-react';

const RED_COUNT = 4;

function colorFor(index, n, dark) {
  const green  = dark ? ['rgba(16,185,129,0.5)','rgba(16,185,129,0.95)']  : ['rgba(18,170,34,0.4)','rgba(18,170,34,0.9)'];
  const orange = dark ? ['rgba(251,191,36,0.5)','rgba(251,191,36,0.95)']  : ['rgba(239,165,16,0.4)','rgba(239,165,16,0.9)'];
  const red    = dark ? ['rgba(248,113,113,0.5)','rgba(248,113,113,0.95)'] : ['rgba(242,38,53,0.4)','rgba(242,38,53,0.9)'];
  const stops = index === 0 ? green : index >= n - RED_COUNT ? red : orange;
  return { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [
    { offset: 0, color: stops[0] }, { offset: 1, color: stops[1] },
  ]};
}

const pct = (v) => `${(v * 100).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;

export default function EfficiencyBar({ data, dark }) {
  const ink = dark ? '#cbd5e1' : '#374151';
  const gridLine = dark ? '#334155' : '#f1f5f9';
  const targetColor = dark ? '#818cf8' : '#4f7cff';
  const n = data.length;
  const ranked = data.map((d, i) => ({ ...d, grad: colorFor(i, n, dark) }));
  const rows = [...ranked].reverse();

  const option = {
    animation: true, animationDuration: 450,
    grid: { left: 10, right: 64, top: 22, bottom: 8, containLabel: true },
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const p = params[0];
        return `<b>${p.name}</b><br/>Eficiencia: <b>${pct(p.value)}</b>`;
      },
    },
    xAxis: {
      type: 'value', max: Math.max(1.15, Math.max(...data.map(d => d.ef)) * 1.1),
      axisLabel: { show: false }, splitLine: { show: true, lineStyle: { color: gridLine, type: 'dashed' } },
      axisTick: { show: false }, axisLine: { show: false },
    },
    yAxis: {
      type: 'category', data: rows.map(r => r.label),
      axisLabel: { color: ink, fontSize: 12 }, axisTick: { show: false }, axisLine: { show: false },
    },
    series: [{
      type: 'bar', barWidth: 18,
      data: rows.map(r => ({ value: r.ef, itemStyle: { color: r.grad, borderRadius: [0,4,4,0] } })),
      label: { show: true, position: 'right', color: ink, fontSize: 11, fontWeight: 600, formatter: p => pct(p.value) },
      markLine: {
        silent: true, symbol: 'none',
        lineStyle: { color: targetColor, type: 'dashed', width: 1.5 },
        label: {
          show: true, position: 'insideEndTop', formatter: 'Objetivo 100%',
          color: targetColor, fontSize: 10, fontWeight: 700, align: 'right',
        },
        data: [{ xAxis: 1 }],
      },
    }],
  };

  return (
    <div className="panel panel-tall">
      <div className="panel-head"><h3>Eficiencia por Persona</h3></div>
      <div className="scroll-chart">
        <ReactECharts option={option} style={{ height: Math.max(400, rows.length * 26), width: '100%' }} notMerge />
      </div>
    </div>
  );
}
