import React, { useState } from 'react';
import { X, Play, Download, Radio, Route, Compass, Clock, CheckCircle2, ShieldCheck, Database, RefreshCw, Eye } from 'lucide-react';
import { exportTrajectoriesToCSV } from '../services/liveAisService';

export default function TrajectoryRecorderModal({
  isOpen,
  onClose,
  vessels,
  isRecording,
  onToggleRecording,
  onSelectVesselForSimulation
}) {
  if (!isOpen) return null;

  const [selectedMmsi, setSelectedMmsi] = useState('ALL');

  // Filter vessels or selected single vessel
  const displayedVessels = selectedMmsi === 'ALL' ? vessels : vessels.filter((v) => v.mmsi === selectedMmsi);

  // Flatten all track points for table view
  const allTrackRows = [];
  displayedVessels.forEach((v) => {
    (v.trackHistory || []).forEach((pt) => {
      allTrackRows.push({
        mmsi: v.mmsi,
        name: v.name,
        timestamp: pt.timestamp,
        timeFormatted: new Date(pt.timestamp).toUTCString().replace('GMT', 'UTC'),
        lat: pt.lat,
        lng: pt.lng,
        speed: pt.speed,
        course: pt.course,
        heading: pt.heading || pt.course
      });
    });
  });

  // Sort table by timestamp descending (newest first)
  allTrackRows.sort((a, b) => b.timestamp - a.timestamp);

  const handleDownloadCSV = () => {
    const csvContent = exportTrajectoriesToCSV(displayedVessels);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `realtime_vessel_trajectories_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-sans text-xs">
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-2xl overflow-y-auto border border-sky-400 shadow-2xl flex flex-col text-slate-800">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center">
              <Route className="w-5 h-5 text-sky-600 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold font-mono tracking-wide text-slate-900 uppercase">
                  Real-Time Vessel Trajectory Simulation Recorder
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  isRecording ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}>
                  {isRecording ? '🔴 REAL-TIME RECORDING ACTIVE' : '⏸️ RECORDING PAUSED'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-mono">
                Records real-time vessel motion data & maps continuous trajectory paths in sea water
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 bg-slate-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Top Bar Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-3">
              <button
                onClick={onToggleRecording}
                className={`px-4 py-2 font-mono font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>{isRecording ? 'Pause Real-Time Recording' : 'Start Real-Time Recording'}</span>
              </button>

              {/* Vessel Filter Dropdown */}
              <div className="flex items-center space-x-1.5 font-mono">
                <span className="text-slate-600 font-semibold">Select Vessel:</span>
                <select
                  value={selectedMmsi}
                  onChange={(e) => {
                    const mmsi = e.target.value;
                    setSelectedMmsi(mmsi);
                    if (mmsi !== 'ALL' && onSelectVesselForSimulation) {
                      const v = vessels.find((item) => item.mmsi === mmsi);
                      if (v) onSelectVesselForSimulation(v.id);
                    }
                  }}
                  className="bg-white border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-sky-500 font-sans"
                >
                  <option value="ALL">All Tracked Vessels ({vessels.length})</option>
                  {vessels.map((v) => (
                    <option key={v.mmsi} value={v.mmsi}>
                      {v.name} (MMSI: {v.mmsi})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CSV Export Button */}
            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-sm font-mono flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Trajectory File</span>
            </button>
          </div>

          {/* Real-Time Trajectory Schema Banner */}
          <div className="bg-sky-50 p-3.5 rounded-xl border border-sky-200 text-slate-700 space-y-1 font-mono text-[11px]">
            <div className="font-bold text-sky-900 flex items-center space-x-1.5">
              <Database className="w-4 h-4 text-sky-600" />
              <span>Chronological Trajectory Sequence Log</span>
            </div>
            <p>
              Extracting time-stamped sequences for <code className="text-sky-800 font-bold">{displayedVessels.length} vessel(s)</code>. Connects live position reports into continuous trajectory vectors over sea water.
            </p>
          </div>

          {/* Sequence Table */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-bold uppercase text-slate-900">
                Live Recorded Position Sequence ({allTrackRows.length} Points)
              </span>
              <span className="text-slate-500">Sorted Ascending/Descending by UTC Timestamp</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-80 overflow-y-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] sticky top-0">
                  <tr>
                    <th className="p-2.5">MMSI</th>
                    <th className="p-2.5">Ship Name</th>
                    <th className="p-2.5">Timestamp (UTC)</th>
                    <th className="p-2.5">Latitude</th>
                    <th className="p-2.5">Longitude</th>
                    <th className="p-2.5">Speed (Sog)</th>
                    <th className="p-2.5">Course (Cog)</th>
                    <th className="p-2.5">Heading</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {allTrackRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-400">
                        No trajectory points recorded yet. Connect live AISStream API to start streaming live positions.
                      </td>
                    </tr>
                  ) : (
                    allTrackRows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-sky-700">{row.mmsi}</td>
                        <td className="p-2.5 font-bold text-slate-900">{row.name}</td>
                        <td className="p-2.5 text-slate-600">{row.timeFormatted}</td>
                        <td className="p-2.5 text-slate-800">{row.lat}° N</td>
                        <td className="p-2.5 text-slate-800">{row.lng}° E</td>
                        <td className="p-2.5 font-semibold text-emerald-700">{row.speed} kts</td>
                        <td className="p-2.5 text-slate-700">{row.course}°</td>
                        <td className="p-2.5 text-slate-700">{row.heading}°</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex justify-between items-center border-t border-slate-200 pt-3">
            <div className="text-[11px] font-mono text-slate-500 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Real-Time Trajectories Mapped over Sea Water Channels</span>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold font-mono text-xs rounded-xl shadow-md"
            >
              Close & Focus Selected Vessel On Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
