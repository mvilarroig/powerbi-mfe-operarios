import ReactECharts from 'echarts-for-react';

const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const label = (ym) => { const [y,m] = ym.split('-'); return `${MONTHS[+m-1]} ${y.slice(2)}`; };
const fmt = (n) => n.toLocaleString('es-ES', { maximumFractionDigits: 0 });

export default function TrendChart({ data, dark }) {
  const ink = dark ? '#cbd5e1' : '#374151';
  const gridLine = dark ? '#334155' : '#eceff3';
  const cats = data.map(d => label(d.ym));

  const grad = (c1, c2) => ({
    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [{ offset: 0, color: c1 }, { offset: 1, color: c2 }],
  });

  const option = {
    color: ['#4f7cff','#f59e0b'],
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const header = `<b>${params[0].axisValue}</b><br/>`;
        return header + params.map(p => `${p.marker} ${p.seriesName}: <b>${fmt(p.value)} h</b>`).join('<br/>');
      },
    },
    legend: { top: 0, right: 0, textStyle: { color: ink }, icon: 'roundRect', itemGap: 14 },
    grid: { left: 10, right: 20, top: 36, bottom: 6, containLabel: true },
    xAxis: {
      type: 'category', data: cats, boundaryGap: false,
      axisLabel: { color: ink, fontSize: 11 },
      axisLine: { lineStyle: { color: gridLine } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: ink, fontSize: 11, formatter: v => fmt(v) },
      splitLine: { lineStyle: { color: gridLine } },
    },
    series: [
      {
        name: 'Directas', type: 'line', smooth: 0.4,
        symbol: 'circle', symbolSize: 5,
        lineStyle: { width: 2.5 },
        areaStyle: { opacity: 1, color: grad('rgba(79,124,255,0.40)','rgba(79,124,255,0.03)') },
        data: data.map(d => Math.round(d.directas)),
      },
      {
        name: 'Indirectas', type: 'line', smooth: 0.4,
        symbol: 'circle', symbolSize: 5,
        lineStyle: { width: 2.5 },
        areaStyle: { opacity: 1, color: grad('rgba(245,158,11,0.40)','rgba(245,158,11,0.03)') },
        data: data.map(d => Math.round(d.indirectas)),
      },
    ],
  };

  return (
    <div className="panel">
      <div className="panel-head"><h3>Evolución mensual de Horas (Directa vs Indirecta)</h3></div>
      <ReactECharts option={option} style={{ height: 260, width: '100%' }} notMerge />
    </div>
  );
}
