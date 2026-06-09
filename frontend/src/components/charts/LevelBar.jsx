import ReactECharts from 'echarts-for-react';

const LEVEL_NAMES = ['Región', 'País', 'Ciudad', 'Área', 'Máquina', 'Producto'];

const fmt = (n) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function LevelBar({ levelIndex, data, path = [], onDrill, onJump, dark }) {
  const rows = [...data].reverse();
  const ink = dark ? '#cbd5e1' : '#374151';
  const trackColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const canDrill = levelIndex < LEVEL_NAMES.length - 1;
  const maxVal = rows.length ? Math.max(...rows.map(r => r.horas)) : 1;

  const barColor = dark
    ? { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [
        { offset: 0, color: 'rgba(129,140,252,0.45)' },
        { offset: 1, color: 'rgba(129,140,252,0.95)' }] }
    : { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [
        { offset: 0, color: 'rgba(79,124,255,0.45)' },
        { offset: 1, color: 'rgba(79,124,255,0.95)' }] };

  // Barras gordas si hay pocas, afinándose a medida que hay más (mín. 10px, máx. 44px).
  const bw = Math.max(10, Math.min(44, Math.round(180 / Math.max(1, rows.length))));

  const option = {
    animation: true,
    animationDuration: 400,
    grid: { left: 10, right: 95, top: 8, bottom: 6, containLabel: true },
    tooltip: {
      trigger: 'item',
      formatter: (p) => p.seriesIndex === 1 ? `<b>${p.name}</b><br/>${fmt(p.value)} h` : null,
    },
    xAxis: {
      type: 'value', axisLabel: { show: false }, splitLine: { show: false },
      axisTick: { show: false }, axisLine: { show: false }, max: maxVal * 1.02,
    },
    yAxis: {
      type: 'category', data: rows.map(r => r.label),
      axisLabel: { color: ink, fontSize: 12 },
      axisTick: { show: false }, axisLine: { show: false },
    },
    series: [
      {
        // Pista de fondo (100% ancho)
        type: 'bar', barWidth: bw, silent: true, z: 0, animation: false,
        data: rows.map(() => ({ value: maxVal, itemStyle: { color: trackColor, borderRadius: [0,4,4,0] } })),
      },
      {
        // Barras con gradiente
        type: 'bar', barWidth: bw, barGap: '-100%', z: 1,
        data: rows.map(r => r.horas),
        itemStyle: { color: barColor, borderRadius: [0,4,4,0] },
        label: { show: true, position: 'right', color: ink, fontSize: 11, formatter: p => fmt(p.value) },
        cursor: canDrill ? 'pointer' : 'default',
      },
    ],
  };

  // rows[p.dataIndex] es la barra clicada — rows ya está invertido igual que ECharts
  const onEvents = {
    click: (p) => { if (canDrill && p.seriesIndex === 1) onDrill(rows[p.dataIndex].label); },
  };

  return (
    <div className="panel">
      <div className="panel-head"><h3>Horas Directas por Niveles</h3></div>

      <div className="breadcrumb">
        <button className="crumb" onClick={() => onJump(0)} disabled={path.length === 0}>Todas</button>
        {path.map((v, i) => (
          <span key={i} className="crumb-wrap">
            <span className="crumb-sep">›</span>
            <button className="crumb" onClick={() => onJump(i + 1)} disabled={i + 1 === path.length}>{v}</button>
          </span>
        ))}
        <span className="crumb-sep">›</span>
        <span className="crumb-current">{LEVEL_NAMES[levelIndex]}</span>
      </div>

      {canDrill && <div className="hint">Haz click en una barra para desglosar</div>}
      <ReactECharts option={option} onEvents={onEvents} style={{ height: 270, width: '100%' }} notMerge />
    </div>
  );
}
