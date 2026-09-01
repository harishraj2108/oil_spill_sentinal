import React from 'react';
import { Waves, Radar, Play, FileText, Sliders, ShieldAlert, Radio, Route, ArrowLeft } from 'lucide-react';

export default function Navbar({
  onBackToLanding,
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  isSimulationMode,
  onToggleSimulationMode,
  onOpenReport,
  onOpenSimulationPanel,
  onOpenLiveAis,
  onOpenTrajectoryRecorder,
  onUploadSarImage
}) {
  const activeScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  return (
    <header className="h-16 bg-white/90 border-b border-slate-200 px-4 md:px-6 flex items-center justify-between z-30 relative backdrop-blur-md shadow-sm font-sans">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onBackToLanding}
          className="mr-1 p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center"
          title="Back to Landing Page"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-teal-500 to-emerald-500 p-0.5 shadow-md flex-shrink-0">
          <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
            <Waves className="w-5 h-5 text-sky-600 animate-pulse" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-wider text-slate-900 uppercase font-mono">
            Aqua<span className="text-sky-600">Sentinel</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-mono tracking-tight hidden sm:block">
            SAR OIL DETECTION • DRIFT HINDCASTING • AIS ATTRIBUTION
          </p>
        </div>
      </div>

      {/* Scenario Selector & Mode Switcher */}
      <div className="flex items-center space-x-3">
        <div className="hidden lg:flex items-center bg-slate-100 border border-slate-200 rounded-lg p-1">
          <button
            onClick={() => isSimulationMode && onToggleSimulationMode()}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center space-x-1.5 ${
              !isSimulationMode
                ? 'bg-white text-sky-700 border border-sky-300 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            <span>Satellite Scenarios</span>
          </button>
          <button
            onClick={() => !isSimulationMode && onToggleSimulationMode()}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center space-x-1.5 ${
              isSimulationMode
                ? 'bg-white text-amber-700 border border-amber-300 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Custom Physics Lab</span>
          </button>
        </div>

        {/* Upload SAR ML Inference Button */}
        <div className="relative">
          <input
            type="file"
            id="sar-upload"
            className="hidden"
            accept=".tif,.tiff,.jpg,.png"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onUploadSarImage && onUploadSarImage(e.target.files[0]);
              }
            }}
          />
          <label
            htmlFor="sar-upload"
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-lg border border-indigo-300 transition-colors flex items-center space-x-1.5 shadow-sm cursor-pointer"
            title="Upload SAR Image for ML Spill Detection"
          >
            <Radar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Scan New SAR Image</span>
          </label>
        </div>

        {/* Live AIS API Input Button */}
        <button
          onClick={onOpenLiveAis}
          className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold rounded-lg border border-sky-300 transition-colors flex items-center space-x-1.5 shadow-sm"
          title="Parse & Map Ships from Live AIS API Response"
        >
          <Radio className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
          <span>Live AIS Stream / API</span>
        </button>

        {/* Live Trajectories Recorder Button */}
        <button
          onClick={onOpenTrajectoryRecorder}
          className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-300 transition-colors flex items-center space-x-1.5 shadow-sm"
          title="View & Export Chronological Trajectory Sequence Log"
        >
          <Route className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Trajectory Sequence Log</span>
        </button>

        {/* Preset Selector */}
        {!isSimulationMode && (
          <select
            value={selectedScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-sky-500 cursor-pointer shadow-sm"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        )}

        {/* Action Controls */}
        <button
          onClick={onOpenSimulationPanel}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition-colors flex items-center space-x-1.5 shadow-sm"
          title="Adjust Ocean Currents & Wind Vectors"
        >
          <Sliders className="w-3.5 h-3.5 text-sky-600" />
          <span className="hidden sm:inline">Physics Forcing</span>
        </button>

        <button
          onClick={onOpenReport}
          className="px-3.5 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-semibold text-xs rounded-lg shadow-md transition-all flex items-center space-x-1.5"
        >
          <FileText className="w-4 h-4" />
          <span>Export Audit Report</span>
        </button>
      </div>
    </header>
  );
}
