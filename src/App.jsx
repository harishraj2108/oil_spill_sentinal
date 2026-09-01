import React, { useState, useMemo, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import InteractiveMap from './components/InteractiveMap';
import TimelineControl from './components/TimelineControl';
import SlickDetailsCard from './components/SlickDetailsCard';
import MarineWeatherCard from './components/MarineWeatherCard';
import SuspectVesselsList from './components/SuspectVesselsList';
import VesselDetailsModal from './components/VesselDetailsModal';
import SimulationPanel from './components/SimulationPanel';
import ReportModal from './components/ReportModal';
import LiveAisModal from './components/LiveAisModal';
import TrajectoryRecorderModal from './components/TrajectoryRecorderModal';
import LandingPage from './components/LandingPage';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { PRESET_SCENARIOS } from './data/presetScenarios';
import { characterizeOilSlick } from './engine/sarSegmentation';
import { runBackwardHindcast, runForwardForecast } from './engine/driftPhysics';
import { rankSuspectVessels } from './engine/vesselAttribution';
import { runFastApiSarPrediction } from './services/apiClient';
import { RealtimeAisStream, MAX_TRACKED_VESSELS } from './services/liveAisService';

export default function App() {
  // Scenario Selection
  const [selectedScenarioId, setSelectedScenarioId] = useState(PRESET_SCENARIOS[0].id);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [customAisVessels, setCustomAisVessels] = useState([]);
  const [mlPredictedPolygon, setMlPredictedPolygon] = useState(null);

  // State: Landing Page
  const [showLanding, setShowLanding] = useState(true);

  // Real-Time AISStream WebSocket State
  const [isAisStreaming, setIsAisStreaming] = useState(false);
  const [liveStreamingVessels, setLiveStreamingVessels] = useState([]);
  const [liveMsgCount, setLiveMsgCount] = useState(0);
  const [isPostSpillRecording, setIsPostSpillRecording] = useState(true);
  const aisStreamRef = useRef(null);

  // Active Scenario object merged with imported & real-time streaming AIS vessels
  const activeScenario = useMemo(() => {
    const base = PRESET_SCENARIOS.find((s) => s.id === selectedScenarioId) || PRESET_SCENARIOS[0];
    const combinedVessels = [...liveStreamingVessels, ...customAisVessels, ...base.vessels];
    
    // Deduplicate vessels by MMSI
    const uniqueMap = new Map();
    combinedVessels.forEach((v) => uniqueMap.set(v.mmsi, v));

    // Limit active vessels array to 200 prototype vessels
    const limitedArray = Array.from(uniqueMap.values()).slice(0, MAX_TRACKED_VESSELS);

    return {
      ...base,
      vessels: limitedArray,
      slickPolygon: mlPredictedPolygon || base.slickPolygon,
      title: mlPredictedPolygon ? `ML Extracted Slick (${base.title})` : base.title
    };
  }, [selectedScenarioId, customAisVessels, liveStreamingVessels, mlPredictedPolygon]);

  // Dynamic Physics Forcing States
  const [windSpeed, setWindSpeed] = useState(activeScenario.satelliteMetadata.windSpeedKnots);
  const [windDir, setWindDir] = useState(activeScenario.satelliteMetadata.windDirDeg);
  const [currentSpeed, setCurrentSpeed] = useState(activeScenario.satelliteMetadata.currentSpeedKnots);
  const [currentDir, setCurrentDir] = useState(activeScenario.satelliteMetadata.currentDirDeg);
  const [oilOpticCode, setOilOpticCode] = useState(activeScenario.opticCode || 4);

  // Synchronize physics vectors when scenario changes
  React.useEffect(() => {
    setWindSpeed(activeScenario.satelliteMetadata.windSpeedKnots);
    setWindDir(activeScenario.satelliteMetadata.windDirDeg);
    setCurrentSpeed(activeScenario.satelliteMetadata.currentSpeedKnots);
    setCurrentDir(activeScenario.satelliteMetadata.currentDirDeg);
    setOilOpticCode(activeScenario.opticCode || 4);
  }, [selectedScenarioId, activeScenario]);

  // Mock live incoming satellite alerts for hackathon WOW factor
  useEffect(() => {
    if (showLanding) return; // Don't show toast on landing page
    
    // Initial welcome toast
    setTimeout(() => {
      toast.success((t) => (
        <div className="flex justify-between items-center w-full">
          <span>Command Center Initialized</span>
          <button 
            onClick={() => toast.dismiss(t.id)} 
            className="ml-3 text-emerald-600 hover:text-emerald-400 text-lg leading-none"
          >
            &times;
          </button>
        </div>
      ), {
        style: { background: '#1f2937', color: '#10b981', border: '1px solid #047857' }
      });
    }, 1000);

    const interval = setInterval(() => {
      const messages = [
        "🛰️ Sentinel-1B overhead pass scheduled in 14 mins.",
        "🚨 High Confidence Oil Spill Detected near region.",
        "⚠️ AIS Anomaly: Suspicious tanker speed drop.",
        "📡 Ocean current telemetry updated from local buoy.",
        "🔍 ML Pipeline completed SAR segmentation."
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      toast((t) => (
        <div className="flex justify-between items-center w-full">
          <span>{randomMsg}</span>
          <button 
            onClick={() => toast.dismiss(t.id)} 
            className="ml-3 text-slate-400 hover:text-white text-lg leading-none"
          >
            &times;
          </button>
        </div>
      ), {
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#f9fafb',
          border: '1px solid #374151',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }
      });
    }, 20000); // every 20 seconds
    return () => clearInterval(interval);
  }, [showLanding]);

  // Toggle Real-Time AIS WebSocket Streaming
  const handleToggleAisStream = () => {
    if (isAisStreaming) {
      if (aisStreamRef.current) {
        aisStreamRef.current.disconnect();
      }
      setIsAisStreaming(false);
    } else {
      const apiKey = '46c21d2214962a440af47a06e6e0205040552897';
      const stream = new RealtimeAisStream(
        apiKey,
        (vesselsArray, count) => {
          setLiveStreamingVessels(vesselsArray);
          setLiveMsgCount(count);
        },
        (err) => console.error('Live AIS Stream Error:', err)
      );

      // Connect with bounding box based on current scenario coordinates (+/- 5 degrees)
      const centerLat = activeScenario.slickPolygon[0][0];
      const centerLng = activeScenario.slickPolygon[0][1];
      const boundingBox = [[
        [centerLat - 5.0, centerLng - 5.0],
        [centerLat + 5.0, centerLng + 5.0]
      ]];
      
      stream.connect(boundingBox);
      aisStreamRef.current = stream;
      setIsAisStreaming(true);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (aisStreamRef.current) {
        aisStreamRef.current.disconnect();
      }
    };
  }, []);

  // Timeline Slider State (Hours relative to satellite pass acquisition time)
  const [currentTimeOffsetHours, setCurrentTimeOffsetHours] = useState(0);

  // Selected Vessel for Detail View
  const [selectedVesselId, setSelectedVesselId] = useState(null);
  const [vesselForModal, setVesselForModal] = useState(null);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSimulationPanelOpen, setIsSimulationPanelOpen] = useState(false);
  const [isLiveAisModalOpen, setIsLiveAisModalOpen] = useState(false);
  const [isTrajectoryModalOpen, setIsTrajectoryModalOpen] = useState(false);

  // GIS Layer Toggles
  const [slickMaskToggle, setSlickMaskToggle] = useState(true);
  const [hindcastToggle, setHindcastToggle] = useState(true);
  const [forecastToggle, setForecastToggle] = useState(true);
  const [vesselsToggle, setVesselsToggle] = useState(true);

  // 1. Characterize Oil Slick
  const slickData = useMemo(() => {
    return characterizeOilSlick(
      activeScenario.slickPolygon,
      oilOpticCode,
      activeScenario.satelliteMetadata.acquisitionTime
    );
  }, [activeScenario, oilOpticCode]);

  // 2. Compute Oceanographic Hindcast Physics
  const hindcastData = useMemo(() => {
    return runBackwardHindcast({
      slickCentroid: slickData.centroid,
      estimatedAgeHours: slickData.estimatedAgeHours,
      currentSpeedKnots: currentSpeed,
      currentDirDeg: currentDir,
      windSpeedKnots: windSpeed,
      windDirDeg: windDir
    });
  }, [slickData, currentSpeed, currentDir, windSpeed, windDir]);

  // 3. Compute Oceanographic Forecast Physics
  const forecastData = useMemo(() => {
    return runForwardForecast({
      slickCentroid: slickData.centroid,
      forecastHours: 48,
      currentSpeedKnots: currentSpeed,
      currentDirDeg: currentDir,
      windSpeedKnots: windSpeed,
      windDirDeg: windDir,
      initialVolumeM3: slickData.volumeM3
    });
  }, [slickData, currentSpeed, currentDir, windSpeed, windDir]);

  // 4. AIS Vessel Attribution Anomaly Scoring & Ranking
  const rankedVessels = useMemo(() => {
    return rankSuspectVessels(
      activeScenario.vessels,
      hindcastData.originCentroid,
      slickData.estimatedReleaseTime,
      hindcastData.driftVector
    );
  }, [activeScenario, hindcastData, slickData]);

  // Handle Default Physics Reset
  const handleResetSimulation = () => {
    setWindSpeed(activeScenario.satelliteMetadata.windSpeedKnots);
    setWindDir(activeScenario.satelliteMetadata.windDirDeg);
    setCurrentSpeed(activeScenario.satelliteMetadata.currentSpeedKnots);
    setCurrentDir(activeScenario.satelliteMetadata.currentDirDeg);
    setOilOpticCode(activeScenario.opticCode || 4);
  };

  // Sync Live Marine Weather to Drift Model
  const handleSyncWeatherToPhysics = (weather) => {
    if (weather.windSpeed !== undefined) setWindSpeed(weather.windSpeed);
    if (weather.windDir !== undefined) setWindDir(weather.windDir);
    if (weather.currentSpeed !== undefined) setCurrentSpeed(weather.currentSpeed);
    if (weather.currentDir !== undefined) setCurrentDir(weather.currentDir);
  };

  // Handle ML Image Upload
  const handleUploadSarImage = async (file) => {
    alert(`Uploading ${file.name} to PyTorch ML Engine...`);
    const mlData = await runFastApiSarPrediction(file);
    if (mlData && mlData.polygonCoords && mlData.polygonCoords.length > 2) {
      setMlPredictedPolygon(mlData.polygonCoords);
      alert(`ML Extraction Complete! Extracted polygon with ${mlData.polygonCoords.length} vertices.`);
    } else {
      alert('ML prediction failed or no oil spill detected in the image.');
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  const isAisDataPage = urlParams.get('page') === 'ais-data';

  if (isAisDataPage) {
    return (
      <div className="w-screen h-screen bg-slate-900">
        <TrajectoryRecorderModal
          isOpen={true}
          onClose={() => window.close()}
          vessels={activeScenario.vessels}
          isRecording={isPostSpillRecording}
          onToggleRecording={() => setIsPostSpillRecording(!isPostSpillRecording)}
          onSelectVesselForSimulation={() => {}}
        />
      </div>
    );
  }

  if (showLanding) {
    return <LandingPage onLaunch={() => setShowLanding(false)} />;
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-[#F3F4F6] text-slate-800 overflow-hidden font-sans">
      <Toaster position="top-right" toastOptions={{ className: 'font-mono text-sm shadow-xl border' }} />
      {/* Navbar */}
      <Navbar
        onBackToLanding={() => setShowLanding(true)}
        scenarios={PRESET_SCENARIOS}
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={(id) => {
          setSelectedScenarioId(id);
          setSelectedVesselId(null);
          setCurrentTimeOffsetHours(0);
          setMlPredictedPolygon(null);
        }}
        isSimulationMode={isSimulationMode}
        onToggleSimulationMode={() => setIsSimulationMode(!isSimulationMode)}
        onOpenReport={() => setIsReportModalOpen(true)}
        onOpenSimulationPanel={() => setIsSimulationPanelOpen(!isSimulationPanelOpen)}
        onOpenLiveAis={() => setIsLiveAisModalOpen(true)}
        onOpenTrajectoryRecorder={() => setIsTrajectoryModalOpen(true)}
        onUploadSarImage={handleUploadSarImage}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Map View */}
        <div className="flex-1 h-full relative">
          <InteractiveMap
            scenario={activeScenario}
            slickData={slickData}
            hindcastData={hindcastData}
            forecastData={forecastData}
            rankedVessels={rankedVessels}
            selectedVesselId={selectedVesselId}
            onSelectVessel={setSelectedVesselId}
            currentTimeOffsetHours={currentTimeOffsetHours}
            layerToggles={{
              slickMask: slickMaskToggle,
              setSlickMask: setSlickMaskToggle,
              hindcast: hindcastToggle,
              setHindcast: setHindcastToggle,
              forecast: forecastToggle,
              setForecast: setForecastToggle,
              vessels: vesselsToggle,
              setVessels: setVesselsToggle
            }}
          />

          {/* Floating Live Stream Status Badge on Map */}
          {isAisStreaming && (
            <div className="absolute top-4 right-16 z-20 px-3 py-1.5 bg-emerald-600 text-white font-mono text-xs font-bold rounded-xl shadow-lg flex items-center space-x-2 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span>LIVE AIS STREAM: {liveStreamingVessels.length} / {MAX_TRACKED_VESSELS} SHIPS ({liveMsgCount} MSGS)</span>
            </div>
          )}

          {/* Floating Timeline Control at Bottom of Map */}
          <div className="absolute bottom-6 left-6 right-6 lg:right-96 z-20">
            <TimelineControl
              slickAcquisitionTime={slickData.acquisitionTime}
              currentTimeOffsetHours={currentTimeOffsetHours}
              onChangeTimeOffset={setCurrentTimeOffsetHours}
              minOffsetHours={-Math.max(24, slickData.estimatedAgeHours + 6)}
              maxOffsetHours={48}
            />
          </div>
        </div>

        {/* Right Sidebar Control Panels */}
        <aside className="w-full lg:w-96 bg-white/90 backdrop-blur-md border-l border-slate-200 p-4 space-y-4 overflow-y-auto z-20 hidden md:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedScenarioId}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
                hidden: { transition: { staggerChildren: 0.05 } }
              }}
              className="space-y-4"
            >
              <motion.div variants={{ hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
                <MarineWeatherCard
                  slickCentroid={slickData.centroid}
                  onSyncToPhysics={handleSyncWeatherToPhysics}
                />
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
                <SlickDetailsCard slickData={slickData} scenarioName={activeScenario.title} />
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
                <SuspectVesselsList
                  rankedVessels={rankedVessels}
                  selectedVesselId={selectedVesselId}
                  onSelectVessel={setSelectedVesselId}
                  onInspectVessel={(vessel) => setVesselForModal(vessel)}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </aside>
      </div>

      {/* Live AIS API Stream Modal */}
      <LiveAisModal
        isOpen={isLiveAisModalOpen}
        onClose={() => setIsLiveAisModalOpen(false)}
        onImportVessels={(vessels) => setCustomAisVessels(vessels)}
        isStreaming={isAisStreaming}
        onToggleStreaming={handleToggleAisStream}
        liveVesselCount={liveStreamingVessels.length}
      />

      {/* Trajectory Sequence Log & Recorder Modal */}
      <TrajectoryRecorderModal
        isOpen={isTrajectoryModalOpen}
        onClose={() => setIsTrajectoryModalOpen(false)}
        vessels={activeScenario.vessels}
        isRecording={isPostSpillRecording}
        onToggleRecording={() => setIsPostSpillRecording(!isPostSpillRecording)}
        onSelectVesselForSimulation={(vesselId) => {
          setSelectedVesselId(vesselId);
        }}
      />

      {/* Slide-out Simulation Physics Panel */}
      <SimulationPanel
        isOpen={isSimulationPanelOpen}
        onClose={() => setIsSimulationPanelOpen(false)}
        windSpeed={windSpeed}
        setWindSpeed={setWindSpeed}
        windDir={windDir}
        setWindDir={setWindDir}
        currentSpeed={currentSpeed}
        setCurrentSpeed={setCurrentSpeed}
        currentDir={currentDir}
        setCurrentDir={setCurrentDir}
        oilOpticCode={oilOpticCode}
        setOilOpticCode={setOilOpticCode}
        onResetSimulation={handleResetSimulation}
      />

      {/* Vessel Forensic Details Modal */}
      {vesselForModal && (
        <VesselDetailsModal
          vesselInfo={vesselForModal}
          onClose={() => setVesselForModal(null)}
          originTimestamp={slickData.estimatedReleaseTime}
        />
      )}

      {/* Printable Investigation Audit Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        scenario={activeScenario}
        slickData={slickData}
        hindcastData={hindcastData}
        rankedVessels={rankedVessels}
      />
    </div>
  );
}
