import React from 'react';
import { Satellite, ShieldCheck, AlertTriangle, Layers, Droplet, Clock, Maximize2 } from 'lucide-react';
import { getSatelliteMetadata } from '../engine/sarSegmentation';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function SlickDetailsCard({ slickData, scenarioName }) {
  const satMeta = getSatelliteMetadata(scenarioName);

  // Generate dissipation data for the chart
  const dissipationData = React.useMemo(() => {
    const data = [];
    let vol = slickData.volumeM3 * 1.5; // Start with more volume 24 hours ago
    for(let i = -24; i <= 0; i += 4) {
      data.push({ time: i, volume: Math.round(vol) });
      vol = vol * 0.92; // 8% decay every 4 hours (weathering/evaporation)
    }
    return data;
  }, [slickData.volumeM3]);

  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-200 text-xs shadow-md bg-white text-slate-800 flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <div className="flex items-center space-x-2">
          <Satellite className="w-4 h-4 text-sky-600" />
          <h3 className="font-bold text-slate-900 uppercase tracking-wider font-mono">
            Satellite SAR Detection
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-50 text-sky-800 border border-sky-200 font-bold">
          CONFIDENCE: {Math.round(slickData.mineralOilConfidence * 100)}%
        </span>
      </div>

      {/* Satellite Pass Metadata */}
      <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 space-y-1 font-mono text-[11px]">
        <div className="flex justify-between text-slate-600">
          <span>Sensor Platform:</span>
          <span className="text-slate-900 font-semibold">{satMeta.satellite}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Acquisition Mode:</span>
          <span className="text-slate-900">{satMeta.mode}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Polarization:</span>
          <span className="text-slate-900">{satMeta.polarization}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>SAR Damping (dB):</span>
          <span className="text-sky-700 font-bold">{slickData.sarBackscatterDampingDb} dB</span>
        </div>
      </div>

      {/* Geometric Properties Grid */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 font-mono">
          Geometric & Physical Characterization
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 flex items-center space-x-1">
              <Maximize2 className="w-3 h-3 text-sky-600" />
              <span>Slick Area</span>
            </div>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              {(slickData.areaKm2 * 0.291553).toFixed(3)} <span className="text-xs font-normal text-slate-500">nm²</span>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 flex items-center space-x-1">
              <Droplet className="w-3 h-3 text-amber-600" />
              <span>Est. Oil Volume</span>
            </div>
            <div className="text-base font-bold text-amber-700 font-mono mt-0.5">
              {slickData.volumeM3} <span className="text-xs font-normal text-slate-500">m³</span>
            </div>
            <div className="text-[10px] text-slate-500">({slickData.volumeBarrels} Barrels)</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 flex items-center space-x-1">
              <Layers className="w-3 h-3 text-emerald-600" />
              <span>Thickness (BAOAC)</span>
            </div>
            <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
              {slickData.thicknessMicrons} <span className="text-xs font-normal text-slate-500">μm</span>
            </div>
            <div className="text-[10px] text-emerald-700 tracking-tight truncate font-medium">{slickData.oilType}</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 flex items-center space-x-1">
              <Clock className="w-3 h-3 text-rose-600" />
              <span>Est. Slick Age</span>
            </div>
            <div className="text-sm font-bold text-rose-700 font-mono mt-0.5">
              {slickData.estimatedAgeHours} <span className="text-xs font-normal text-slate-500">Hours</span>
            </div>
            <div className="text-[10px] text-slate-500">Lagrangian Decay</div>
          </div>
        </div>
      </div>

      {/* Look-alike Classification Bar */}
      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
        <div className="flex justify-between items-center text-[10px]">
          <span className="font-semibold text-slate-700">Look-alike Discrimination:</span>
          <span className="text-emerald-700 font-mono font-bold">Mineral Petroleum Crude</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex border border-slate-300">
          <div
            className="bg-gradient-to-r from-sky-600 to-emerald-500 h-full"
            style={{ width: `${Math.round(slickData.mineralOilConfidence * 100)}%` }}
            title="Mineral Petroleum Crude Oil"
          />
          <div
            className="bg-amber-500 h-full"
            style={{ width: `${Math.round((1 - slickData.mineralOilConfidence) * 100)}%` }}
            title="Biogenic Plant Sheen / Algae"
          />
        </div>
        <div className="flex justify-between text-[9px] text-slate-600 font-mono">
          <span>Petroleum Crude ({Math.round(slickData.mineralOilConfidence * 100)}%)</span>
          <span>Biogenic Sheen ({Math.round((1 - slickData.mineralOilConfidence) * 100)}%)</span>
        </div>
      </div>

      {/* Dissipation Chart */}
      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5 h-40 flex flex-col">
        <div className="text-[10px] font-semibold text-slate-700 font-mono">Estimated Weathering & Evaporation (Last 24h)</div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dissipationData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b45309" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#b45309" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{fontSize: 9, fill: '#64748b'}} tickFormatter={(v) => v === 0 ? 'Now' : `${v}h`} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 9, fill: '#64748b'}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{fontSize: '10px', borderRadius: '6px', padding: '4px'}} labelFormatter={(l) => l === 0 ? 'Now' : `${l}h`} formatter={(val) => [`${val} m³`, 'Est. Volume']} />
              <Area type="monotone" dataKey="volume" stroke="#b45309" strokeWidth={2} fillOpacity={1} fill="url(#colorVol)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
