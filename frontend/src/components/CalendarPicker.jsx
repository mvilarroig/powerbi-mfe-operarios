import { useState } from 'react';

const DOW = ['L','M','X','J','V','S','D'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const pad = (n) => String(n).padStart(2,'0');
const toISO = (y, m, d) => `${y}-${pad(m+1)}-${pad(d)}`;
const toDMY = (s) => s ? `${s.slice(8)}/${s.slice(5,7)}/${s.slice(0,4)}` : '';

export default function CalendarPicker({ dateFrom, dateTo, onDateFromChange, onDateToChange }) {
  const today = new Date();
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate());

  const initRef = dateTo || dateFrom || todayISO;
  const [vy, setVy] = useState(() => parseInt(initRef.slice(0,4)));
  const [vm, setVm] = useState(() => parseInt(initRef.slice(5,7)) - 1);

  const prev = () => { if (vm === 0) { setVy(y => y-1); setVm(11); } else setVm(m => m-1); };
  const next = () => { if (vm === 11) { setVy(y => y+1); setVm(0); } else setVm(m => m+1); };

  const daysInMonth = new Date(vy, vm+1, 0).getDate();
  const firstDow = (new Date(vy, vm, 1).getDay() + 6) % 7; // Lunes = 0

  const handleClick = (d) => {
    const clicked = toISO(vy, vm, d);
    if (!dateFrom || (dateFrom && dateTo)) {
      onDateFromChange(clicked); onDateToChange(null);
    } else {
      if (clicked < dateFrom) { onDateFromChange(clicked); onDateToChange(null); }
      else { onDateToChange(clicked); }
    }
  };

  const dayClass = (d) => {
    const cur = toISO(vy, vm, d);
    let c = 'cal-day';
    if (cur === dateFrom || cur === dateTo) c += ' active';
    else if (dateFrom && dateTo && cur > dateFrom && cur < dateTo) c += ' in-range';
    if (cur === todayISO) c += ' today';
    return c;
  };

  const cells = [...Array(firstDow).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i+1)];

  return (
    <div className="cal-picker">
      <div className="cal-nav-row">
        <button className="cal-nav-btn" onClick={prev}>‹</button>
        <span className="cal-month-title">{MONTHS[vm]} {vy}</span>
        <button className="cal-nav-btn" onClick={next}>›</button>
      </div>

      <div className="cal-grid">
        {DOW.map(d => <span key={d} className="cal-dow">{d}</span>)}
        {cells.map((d, i) =>
          d === null
            ? <span key={`e${i}`} />
            : <button key={d} className={dayClass(d)} onClick={() => handleClick(d)}>{d}</button>
        )}
      </div>

      <div className="cal-footer">
        <span className="cal-date-chip">{dateFrom ? toDMY(dateFrom) : '—'}</span>
        <span className="cal-footer-arrow">→</span>
        <span className="cal-date-chip">{dateTo ? toDMY(dateTo) : '—'}</span>
        {(dateFrom || dateTo) && (
          <button className="cal-clear-btn" onClick={() => { onDateFromChange(null); onDateToChange(null); }}>✕</button>
        )}
      </div>
    </div>
  );
}
