# PowerBI MFE Operarios — Mano de Obra Directa / Indirecta

Réplica web de la página **"Mano de Obra"** del Power BI `qplantsecureplatform`, alimentada desde la misma base de datos PostgreSQL (`qplantreports`).

## Stack

- **Frontend:** React 19 + Vite + [ECharts](https://echarts.apache.org/) (`echarts-for-react`) — puerto `5173`
- **Backend:** Node + Express + `pg` — puerto `4000`, traduce las medidas DAX del PBI a SQL
- **Base de datos:** PostgreSQL (`qplantreports`)

## Funcionalidad

- **KPIs:** Horas Directas / Indirectas / Totales
- **Horas Directas por Niveles:** gráfico de barras con drill-down jerárquico (Región → País → Ciudad → Área → Máquina → Producto) y breadcrumb navegable
- **Tipología de Mano de Obra Indirecta:** gráfico Nightingale por actividad
- **Eficiencia por Persona:** ranking con línea de objetivo al 100 %
- **Evolución mensual:** área apilada Directas vs Indirectas
- **Filtros:** rango de fechas (calendario), planta/región, área, producto, tipología, turnos (con botón *Aplicar*)
- **Sector (tenant):** selector global en la barra superior
- **Tema claro / oscuro** persistente

## Puesta en marcha

### Backend

```bash
cd backend
npm install
cp .env.example .env   # y rellena las credenciales de PostgreSQL
npm run dev            # node --watch server.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La app queda en `http://localhost:5173` (Vite hace proxy de `/api` → `http://localhost:4000`).

## Notas

- La base de datos solo es accesible por VPN/Tailscale. Un *timeout* TCP significa que la VPN está caída.
- Los 3 tenants (ALIM / AUTO / FARMA) se muestran **sumados** por defecto, igual que el PBI.
- `echarts-for-react` requiere `tslib` instalado.
