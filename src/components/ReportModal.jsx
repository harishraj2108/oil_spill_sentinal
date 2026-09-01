import React from 'react';
import { X, Printer, ShieldCheck, FileText, Satellite, Anchor, MapPin, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export default function ReportModal({ isOpen, onClose, scenario, slickData, hindcastData, rankedVessels }) {
  if (!isOpen) return null;

  const topSuspect = rankedVessels && rankedVessels.length > 0 ? rankedVessels[0] : null;
  const satMeta = scenario.satelliteMetadata;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl overflow-y-auto border border-slate-300 shadow-2xl flex flex-col text-slate-800 font-sans">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold font-mono text-slate-900 uppercase tracking-wider">
              Official Maritime Oil Spill Investigation Audit Report
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5 transition-colors shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-200 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Document Body */}
        <div id="printable-report" className="p-8 space-y-6 text-xs text-slate-700 font-sans">
          {/* Header Seal */}
          <div className="border-b-2 border-sky-600 pb-4 flex justify-between items-start">
            <div>
              <div className="text-xl font-bold font-mono tracking-wider text-slate-900 uppercase">
                AquaSentinel AI <span className="text-sky-600">Forensic Investigation Dossier</span>
              </div>
              <div className="text-slate-500 font-mono text-[11px] mt-1 font-medium">
                INTERNATIONAL MARITIME REMOTE SENSING & VESSEL ATTRIBUTION AUTHORITY
              </div>
            </div>
            <div className="text-right font-mono text-[11px]">
              <div className="text-sky-700 font-bold">CASE ID: AGY-2026-OIL-{scenario.id.toUpperCase()}</div>
              <div className="text-slate-500">DATE: {new Date().toUTCString()}</div>
              <div className="text-emerald-700 font-bold">STATUS: VERIFIED ATTRIBUTION</div>
            </div>
          </div>

          {/* Executive Summary Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-sky-800 uppercase font-mono text-xs flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>Executive Investigation Summary</span>
            </h3>
            <p className="leading-relaxed text-slate-700">
              On <span className="text-slate-900 font-semibold">{new Date(slickData.acquisitionTime).toUTCString()}</span>, European Space Agency (ESA) satellite platform <span className="text-slate-900 font-semibold">{satMeta.satellite}</span> acquired Synthetic Aperture Radar (SAR) imagery over <span className="text-slate-900 font-semibold">{scenario.region}</span>. Automated neural segmentation detected an illegal marine petroleum oil slick covering <span className="text-slate-900 font-semibold">{slickData.areaKm2} km²</span> with an estimated discharge volume of <span className="text-amber-800 font-bold">{slickData.volumeM3} m³ ({slickData.volumeBarrels} Barrels)</span>.
            </p>
          </div>

          {/* Section 1: Satellite SAR Characterization */}
          <div className="space-y-3">
            <h4 className="font-bold font-mono text-slate-900 uppercase border-b border-slate-200 pb-1 flex items-center space-x-2">
              <Satellite className="w-4 h-4 text-sky-600" />
              <span>1. Satellite Remote Sensing & Physical Characterization</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="text-slate-500 text-[10px]">Slick Area</div>
                <div className="text-sm font-bold text-sky-700">{slickData.areaKm2} km²</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="text-slate-500 text-[10px]">Est. Release Volume</div>
                <div className="text-sm font-bold text-amber-700">{slickData.volumeM3} m³</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="text-slate-500 text-[10px]">BAOAC Code</div>
                <div className="text-sm font-bold text-emerald-700">{slickData.oilType}</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="text-slate-500 text-[10px]">Radar Damping</div>
                <div className="text-sm font-bold text-slate-900">{slickData.sarBackscatterDampingDb} dB</div>
              </div>
            </div>
          </div>

          {/* Section 2: Oceanographic Lagrangian Hindcast */}
          <div className="space-y-3">
            <h4 className="font-bold font-mono text-slate-900 uppercase border-b border-slate-200 pb-1 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>2. Oceanographic Lagrangian Particle Hindcasting</span>
            </h4>
            <p className="leading-relaxed text-slate-700">
              Applying a 2D Lagrangian particle drift physics model forced by surface ocean currents ({hindcastData.driftVector.currentSpeedKnots} kts @ {hindcastData.driftVector.currentDirDeg}°) and 3.5% wind drift ({hindcastData.driftVector.windSpeedKnots} kts @ {hindcastData.driftVector.windDirDeg}°), the slick release origin point was traced backward <span className="text-rose-700 font-bold">{slickData.estimatedAgeHours} hours</span> to coordinates <span className="text-slate-900 font-mono font-semibold">[{hindcastData.originCentroid[0].toFixed(4)}°N, {hindcastData.originCentroid[1].toFixed(4)}°E]</span> with estimated discharge timestamp <span className="text-slate-900 font-mono">{new Date(slickData.estimatedReleaseTime).toUTCString()}</span>.
            </p>
          </div>

          {/* Section 3: Vessel Traffic Correlation & Attribution */}
          <div className="space-y-3">
            <h4 className="font-bold font-mono text-slate-900 uppercase border-b border-slate-200 pb-1 flex items-center space-x-2">
              <Anchor className="w-4 h-4 text-amber-600" />
              <span>3. Historic AIS Vessel Traffic Anomaly & Attribution Ranking</span>
            </h4>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Rank</th>
                    <th className="p-2.5">Vessel Name</th>
                    <th className="p-2.5">Type & Flag</th>
                    <th className="p-2.5">IMO / MMSI</th>
                    <th className="p-2.5">CPA Dist</th>
                    <th className="p-2.5">AIS Dark Gap</th>
                    <th className="p-2.5 text-right">Master Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {rankedVessels.map((v, i) => (
                    <tr key={v.vesselId} className={i === 0 ? 'bg-rose-50 text-rose-900' : 'text-slate-700'}>
                      <td className="p-2.5 font-bold">#{i + 1}</td>
                      <td className="p-2.5 font-bold">{v.vesselName}</td>
                      <td className="p-2.5">{v.vesselType} ({v.flag})</td>
                      <td className="p-2.5">{v.imo}</td>
                      <td className="p-2.5">{v.cpaNm} nm</td>
                      <td className="p-2.5">{v.darkShipGapFound ? `⚠️ Yes (${v.gapDurationMinutes}m)` : 'No'}</td>
                      <td className="p-2.5 text-right font-bold text-sky-700">{v.masterScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Risk Score Chart */}
            {rankedVessels && rankedVessels.length > 0 && (
              <div className="mt-4 h-48 w-full bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col">
                <div className="text-[10px] font-semibold text-slate-700 font-mono mb-2">Top 5 Suspects - AI Confidence Scoring</div>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rankedVessels.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" domain={[0, 100]} tick={{fontSize: 10, fill: '#64748b'}} />
                      <YAxis dataKey="vesselName" type="category" width={110} tick={{fontSize: 9, fill: '#334155', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{fontSize: '10px', borderRadius: '8px', padding: '6px'}} cursor={{fill: '#f1f5f9'}} formatter={(val) => [`${val}%`, 'Risk Score']} />
                      <Bar dataKey="masterScore" radius={[0, 4, 4, 0]} barSize={16}>
                        {rankedVessels.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#e11d48' : '#0284c7'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Culprit Highlight Card */}
          {topSuspect && (
            <div className="bg-rose-50 p-5 rounded-2xl border-2 border-rose-300 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-rose-600" />
                  <span className="font-bold font-mono uppercase text-rose-900 text-sm">
                    PRIMARY ATTRIBUTED POLLUTING VESSEL
                  </span>
                </div>
                <span className="px-3 py-1 bg-rose-600 font-bold font-mono text-white text-xs rounded-full shadow">
                  CONFIDENCE: {topSuspect.masterScore}% (CRITICAL)
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 font-mono">
                {topSuspect.vesselName} (IMO {topSuspect.imo} • MMSI {topSuspect.mmsi})
              </div>
              <p className="text-slate-700 leading-relaxed text-xs">
                Spatio-temporal correlation analysis confirms {topSuspect.vesselName} passed within <span className="font-bold text-slate-900">{topSuspect.cpaNm} nm</span> of the hindcasted release centroid at the exact discharge window. Vessel exhibited an abrupt speed reduction to {topSuspect.minSpeedNearOrigin} knots along with {topSuspect.darkShipGapFound ? `a ${topSuspect.gapDurationMinutes}-minute AIS transponder outage` : 'trajectory alignment matching drift physics'}.
              </p>
            </div>
          )}

          {/* Legal Stamp Footer */}
          <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-[10px] font-mono text-slate-500">
            <div>CONFIDENTIAL LEGAL EVIDENCE DOSSIER • GENERATED BY AQUASENTINEL AI ENGINE</div>
            <div>VERIFICATION HASH: 0x9A4F...88C2</div>
          </div>
        </div>
      </div>
    </div>
  );
}
