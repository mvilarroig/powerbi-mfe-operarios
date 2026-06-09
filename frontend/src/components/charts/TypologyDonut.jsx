import ReactECharts from 'echarts-for-react';

const PALETTE = [
  '#E6194B', '#3CB44B', '#FFD500', '#4363D8', '#F58231', '#911EB4', '#42D4F4',
  '#F032E6', '#9A6324', '#469990', '#BFEF45', '#FF6F91', '#808000', '#FF8C00',
  '#1FB5AD', '#A9A9A9', '#7CFC00', '#C71585', '#2F4F4F', '#D2691E', '#6A5ACD',
];

const fmt = (n) => n.toLocaleString('es-ES', { maximumFractionDigits: 0 });

export default function TypologyDonut({ data, dark }) {
  const ink = dark ? '#cbd5e1' : '#374151';
  const muted = dark ? '#64748b' : '#9ca3af';

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (p) => `<b>${p.name}</b><br/>${fmt(p.value)} h &nbsp; <b>${p.percent}%</b>`,
    },
    legend: {
      type: 'scroll', orient: 'vertical', right: 4, top: 'middle', bottom: 0,
      textStyle: { fontSize: 12, color: ink }, itemWidth: 12, itemHeight: 12, itemGap: 7,
      pageTextStyle: { color: ink },
    },
    series: [{
      name: 'Horas',
      type: 'pie',
      roseType: 'radius',           // Gráfico Nightingale — radios proporcionales al valor
      radius: ['12%', '70%'],
      center: ['36%', '50%'],
      avoidLabelOverlap: true,
      data: data.map((d, i) => ({
        name: d.label,
        value: d.horas,
        itemStyle: { color: PALETTE[i % PALETTE.length], opacity: 0.88 },
      })),
      label: {
        show: true,
        formatter: '{d}%',
        fontSize: 10,
        color: ink,
      },
      labelLine: { length: 6, length2: 5, lineStyle: { color: muted, opacity: 0.7 } },
      emphasis: {
        scale: true, scaleSize: 6,
        itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,0.25)', opacity: 1 },
      },
    }],
  };

  return (
    <div className="panel panel-tall">
      <div className="panel-head"><h3>Tipología de Mano de Obra Indirecta</h3></div>
      <ReactECharts option={option} style={{ height: 420, width: '100%' }} notMerge />
    </div>
  );
}
