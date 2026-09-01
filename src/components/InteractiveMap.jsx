import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { interpolateVesselPosition } from '../utils/geoUtils';

// Free Open Source Tile Layers (100% Free, NO API Key Required)
const TILE_SERVERS = {
  osm: {
    name: 'OpenStreetMap (Standard)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc'
  },
  esriOcean: {
    name: 'Esri World Ocean',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, CEOS, UHO, and DeLorme',
    subdomains: []
  },
  cartoPositron: {
    name: 'Carto Positron Light',
    url: 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abc'
  }
};

export default function InteractiveMap({
  scenario,
  slickData,
  hindcastData,
  forecastData,
  rankedVessels,
  selectedVesselId,
  onSelectVessel,
  currentTimeOffsetHours, // Slider time relative to acquisition
  layerToggles
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layersGroupRef = useRef(null);
  const prevScenarioIdRef = useRef(null);

  const [activeTileServer, setActiveTileServer] = useState('osm');

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      // Clamped bounds to prevent world repeating / looping on zoom out
      const worldBounds = L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180));

      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        worldCopyJump: false,
        minZoom: 3,
        maxZoom: 18,
        maxBounds: worldBounds,
        maxBoundsViscosity: 1.0 // Strictly locks viewport inside single world boundary
      }).setView([2.45, 101.40], 11);

      // Add Open-Source Tile Layer (noWrap prevents tile repetition)
      const initialServer = TILE_SERVERS.osm;
      const tileLayer = L.tileLayer(initialServer.url, {
        maxZoom: 18,
        minZoom: 3,
        noWrap: true,
        bounds: worldBounds,
        subdomains: initialServer.subdomains,
        attribution: initialServer.attribution
      }).addTo(map);

      // Zoom Control on Top Right
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
      tileLayerRef.current = tileLayer;
      layersGroupRef.current = L.layerGroup().addTo(map);
    }
  }, []);

  // Handle Tile Server Switch
  const handleSwitchTileServer = (serverKey) => {
    setActiveTileServer(serverKey);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const server = TILE_SERVERS[serverKey] || TILE_SERVERS.osm;
    const worldBounds = L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180));

    const newLayer = L.tileLayer(server.url, {
      maxZoom: 18,
      minZoom: 3,
      noWrap: true,
      bounds: worldBounds,
      subdomains: server.subdomains,
      attribution: server.attribution
    }).addTo(map);

    tileLayerRef.current = newLayer;
  };

  // Pan Map ONLY when Scenario changes OR when a Vessel is selected
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. If scenario changed, pan to slick centroid ONCE
    if (scenario && scenario.id !== prevScenarioIdRef.current) {
      prevScenarioIdRef.current = scenario.id;
      if (slickData && slickData.centroid) {
        map.panTo(slickData.centroid, { animate: true });
      }
    }

    // 2. If user selected a vessel, pan smoothly to THAT VESSEL's current position!
    if (selectedVesselId && scenario.vessels) {
      const selectedVessel = scenario.vessels.find((v) => v.id === selectedVesselId);
      if (selectedVessel && selectedVessel.trackHistory.length > 0) {
        const currentSimulatedTime = slickData.acquisitionTime + currentTimeOffsetHours * 3600 * 1000;
        const currentPos = interpolateVesselPosition(selectedVessel.trackHistory, currentSimulatedTime);
        if (currentPos) {
          map.panTo([currentPos.lat, currentPos.lng], { animate: true });
        }
      }
    }
  }, [scenario, selectedVesselId]);

  // Update Layers whenever scenario, time, or toggles change (WITHOUT resetting map view)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layersGroup = layersGroupRef.current;
    if (!map || !layersGroup) return;

    layersGroup.clearLayers();

    // Calculate current time epoch for timeline playback
    const currentSimulatedTime = slickData.acquisitionTime + currentTimeOffsetHours * 3600 * 1000;

    // 1. Render Oil Slick Polygon
    if (layerToggles.slickMask && scenario.slickPolygon) {
      const slickPoly = L.polygon(scenario.slickPolygon, {
        color: '#0284C7',
        weight: 2.5,
        fillColor: '#0284C7',
        fillOpacity: 0.45,
        dashArray: '4, 4'
      }).addTo(layersGroup);

      slickPoly.bindPopup(`
        <div class="p-2 font-sans text-xs">
          <div class="font-bold text-sky-700 uppercase tracking-wide">Sentinel-1 SAR Slick Detection</div>
          <div class="mt-1 text-slate-800"><b>Area:</b> ${(slickData.areaKm2 * 0.291553).toFixed(3)} nm²</div>
          <div class="text-slate-800"><b>Volume:</b> ${slickData.volumeM3} m³ (${slickData.volumeBarrels} bbls)</div>
          <div class="text-slate-800"><b>Class:</b> ${slickData.oilType}</div>
          <div class="text-slate-800"><b>Damping:</b> ${slickData.sarBackscatterDampingDb} dB</div>
        </div>
      `);
    }

    // 2. Render Hindcast Origin & Reverse Drift Trail
    if (layerToggles.hindcast && hindcastData) {
      const trailPoints = hindcastData.particleTrail.map((pt) => [pt.lat, pt.lng]);
      L.polyline(trailPoints, {
        color: '#DC2626',
        weight: 3,
        dashArray: '5, 8',
        opacity: 0.9
      }).addTo(layersGroup);

      hindcastData.originHotspotParticles.forEach((p) => {
        L.circleMarker([p.lat, p.lng], {
          radius: 3.5,
          color: '#DC2626',
          fillColor: '#EF4444',
          fillOpacity: 0.7,
          weight: 0
        }).addTo(layersGroup);
      });

      const originIcon = L.divIcon({
        className: 'custom-origin-icon',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <span class="absolute inline-flex w-full h-full rounded-full bg-rose-400/40 animate-ping"></span>
            <span class="relative inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-600 border-2 border-white text-[10px] font-bold text-white shadow-md">
              🎯
            </span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const originMarker = L.marker(hindcastData.originCentroid, { icon: originIcon }).addTo(layersGroup);
      originMarker.bindPopup(`
        <div class="p-2 font-sans text-xs">
          <div class="font-bold text-rose-700 uppercase tracking-wide">Target Spill Origin Hotspot</div>
          <div class="mt-1 text-slate-800"><b>Est. Release Time:</b> ${new Date(slickData.estimatedReleaseTime).toUTCString()}</div>
          <div class="text-slate-800"><b>Drift Age:</b> ${slickData.estimatedAgeHours} hours</div>
          <div class="text-slate-800"><b>Spatial Radius:</b> ±${hindcastData.spatialUncertaintyRadiusKm} km</div>
        </div>
      `);
    }

    // 3. Render Forward Forecast Tube
    if (layerToggles.forecast && forecastData) {
      const forecastPoints = forecastData.forecastPath.map((pt) => [pt.lat, pt.lng]);
      L.polyline(forecastPoints, {
        color: '#059669',
        weight: 2.5,
        dashArray: '6, 6',
        opacity: 0.9
      }).addTo(layersGroup);

      const endPt = forecastPoints[forecastPoints.length - 1];
      if (endPt) {
        L.circleMarker(endPt, {
          radius: 8,
          color: '#059669',
          fillColor: '#10B981',
          fillOpacity: 0.4,
          weight: 2
        }).addTo(layersGroup);
      }
    }

    // 4. Render Vessels Tracks & Timeline Positions
    if (layerToggles.vessels && scenario.vessels) {
      scenario.vessels.forEach((vessel) => {
        const attributionInfo = rankedVessels.find((rv) => rv.vesselId === vessel.id) || {};
        const isTopSuspect = attributionInfo.masterScore >= 80;
        const isMediumSuspect = attributionInfo.masterScore >= 55 && attributionInfo.masterScore < 80;
        const isSelected = vessel.id === selectedVesselId;

        const trackPoints = vessel.trackHistory.map((pt) => [pt.lat, pt.lng]);

        // Draw connected track line
        const trackLineColor = isTopSuspect ? '#DC2626' : isMediumSuspect ? '#D97706' : '#0284C7';
        L.polyline(trackPoints, {
          color: trackLineColor,
          weight: isSelected ? 4 : isTopSuspect ? 3 : 2,
          opacity: isSelected ? 1 : 0.8
        }).addTo(layersGroup);

        // Highlight AIS Dark Gap if found
        if (attributionInfo.darkShipGapFound && attributionInfo.gapNearOrigin) {
          const sorted = [...vessel.trackHistory].sort((a, b) => a.timestamp - b.timestamp);
          for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i + 1].timestamp - sorted[i].timestamp > 30 * 60 * 1000) {
              L.polyline(
                [
                  [sorted[i].lat, sorted[i].lng],
                  [sorted[i + 1].lat, sorted[i + 1].lng]
                ],
                {
                  color: '#D97706',
                  weight: 4,
                  dashArray: '4, 8',
                  opacity: 1
                }
              ).addTo(layersGroup).bindTooltip(`⚠️ AIS Transponder Blackout (${attributionInfo.gapDurationMinutes} mins)`, { permanent: false });
            }
          }
        }

        // Interpolate vessel position at current timeline time
        const currentPos = interpolateVesselPosition(vessel.trackHistory, currentSimulatedTime);
        if (currentPos) {
          const markerColor = isTopSuspect ? '#DC2626' : isMediumSuspect ? '#D97706' : '#0284C7';

          const vesselIcon = L.divIcon({
            className: 'vessel-marker-icon',
            html: `
              <div class="relative flex items-center justify-center cursor-pointer transform hover:scale-125 transition-transform z-10">
                ${isTopSuspect ? '<span class="absolute inline-flex h-12 w-12 rounded-full bg-rose-500 opacity-50 animate-ping"></span>' : ''}
                <div class="w-8 h-8 rounded-full flex items-center justify-center relative ${
                  isSelected ? 'ring-4 ring-sky-500 bg-white shadow-xl' : 'bg-white border border-slate-300 shadow-md'
                }" style="transform: rotate(${currentPos.course}deg)">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="${markerColor}" stroke="currentColor" stroke-width="1.5">
                    <polygon points="12 2 19 21 12 17 5 21 12 2"/>
                  </svg>
                </div>
                ${
                  isTopSuspect
                    ? `<span class="absolute -top-3 -right-3 px-1.5 py-0.5 bg-rose-600 text-[9px] font-bold text-white rounded-full shadow z-20 whitespace-nowrap">🚨 ${attributionInfo.masterScore}%</span>`
                    : ''
                }
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          const marker = L.marker([currentPos.lat, currentPos.lng], { icon: vesselIcon }).addTo(layersGroup);

          marker.on('click', () => {
            onSelectVessel(vessel.id);
          });

          marker.bindPopup(`
            <div class="p-2 font-sans text-xs">
              <div class="font-bold text-slate-900 uppercase tracking-wide flex items-center justify-between">
                <span>${vessel.name}</span>
                <span class="ml-2 px-1.5 py-0.5 rounded text-[10px] ${
                  isTopSuspect ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-sky-100 text-sky-800 border border-sky-300'
                }">${attributionInfo.masterScore}% Score</span>
              </div>
              <div class="mt-1 text-slate-700"><b>Type:</b> ${vessel.type} (${vessel.flag})</div>
              <div class="text-slate-700"><b>Speed:</b> ${currentPos.speed} knots | <b>Heading:</b> ${currentPos.course}°</div>
              <div class="text-slate-700"><b>CPA to Origin:</b> ${attributionInfo.cpaNm} nm</div>
              ${attributionInfo.darkShipGapFound ? `<div class="mt-1 text-amber-700 font-semibold">⚠️ AIS Blackout Detected (${attributionInfo.gapDurationMinutes}m)</div>` : ''}
            </div>
          `);
        }
      });
    }
  }, [scenario, slickData, hindcastData, forecastData, rankedVessels, selectedVesselId, currentTimeOffsetHours, layerToggles]);

  return (
    <div className="relative w-full h-full bg-[#EBF1F5] overflow-hidden">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full z-10" />

      {/* Layer Toggles & Map Legend Overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-col space-y-2">
        <div className="glass-panel p-3 rounded-xl border border-slate-200 text-xs w-60 shadow-lg bg-white/95 text-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between font-mono">
            <span>GIS Map Layers</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>

          <div className="space-y-1.5 font-medium mb-3">
            <label className="flex items-center space-x-2 text-slate-700 cursor-pointer hover:text-sky-700">
              <input
                type="checkbox"
                checked={layerToggles.slickMask}
                onChange={(e) => layerToggles.setSlickMask(e.target.checked)}
                className="rounded bg-white border-slate-300 text-sky-600 focus:ring-0"
              />
              <span className="w-2.5 h-2.5 rounded bg-sky-500 inline-block"></span>
              <span>SAR Slick Polygon</span>
            </label>

            <label className="flex items-center space-x-2 text-slate-700 cursor-pointer hover:text-rose-700">
              <input
                type="checkbox"
                checked={layerToggles.hindcast}
                onChange={(e) => layerToggles.setHindcast(e.target.checked)}
                className="rounded bg-white border-slate-300 text-rose-600 focus:ring-0"
              />
              <span className="w-2.5 h-2.5 rounded bg-rose-600 inline-block"></span>
              <span>Hindcast Origin Trail</span>
            </label>

            <label className="flex items-center space-x-2 text-slate-700 cursor-pointer hover:text-emerald-700">
              <input
                type="checkbox"
                checked={layerToggles.forecast}
                onChange={(e) => layerToggles.setForecast(e.target.checked)}
                className="rounded bg-white border-slate-300 text-emerald-600 focus:ring-0"
              />
              <span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block"></span>
              <span>Forecast Path (+72h)</span>
            </label>

            <label className="flex items-center space-x-2 text-slate-700 cursor-pointer hover:text-amber-700">
              <input
                type="checkbox"
                checked={layerToggles.vessels}
                onChange={(e) => layerToggles.setVessels(e.target.checked)}
                className="rounded bg-white border-slate-300 text-amber-600 focus:ring-0"
              />
              <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span>
              <span>AIS Vessel Traffic</span>
            </label>
          </div>

          {/* Open-Source Basemap Switcher */}
          <div className="border-t border-slate-200 pt-2 font-mono">
            <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
              Open-Source Basemap (Free)
            </label>
            <select
              value={activeTileServer}
              onChange={(e) => handleSwitchTileServer(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-[11px] rounded p-1 font-sans cursor-pointer"
            >
              {Object.entries(TILE_SERVERS).map(([key, s]) => (
                <option key={key} value={key}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
