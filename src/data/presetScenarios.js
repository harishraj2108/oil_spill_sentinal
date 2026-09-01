/**
 * Preset Real-world Satellite Scenarios for AquaSentinel AI Demonstration
 * All coordinates positioned in DEEP OPEN OCEAN SEA WATER channels
 */

const NOW = Date.now();

export const PRESET_SCENARIOS = [
  {
    id: 'malacca_strait',
    title: 'Strait of Malacca - Illegal Tanker Discharge',
    subtitle: 'Dark ship event detected along major international deepwater crude transit lane',
    region: 'Strait of Malacca (30km Offshore Port Dickson - Deep Channel)',
    satelliteMetadata: {
      satellite: 'Sentinel-1B SAR C-Band',
      acquisitionTime: NOW - 12 * 3600 * 1000, // 12 hours ago
      mode: 'IW Dual-Pol (VV + VH)',
      resolution: '10m',
      orbit: 'Pass 142 Descending',
      windSpeedKnots: 14,
      windDirDeg: 210, // SSW wind
      currentSpeedKnots: 1.4,
      currentDirDeg: 320 // NW ocean current
    },
    // Slick Polygon positioned in Deep Sea Water (Lat 2.45°N, Lng 101.40°E - 30km offshore in Malacca Strait)
    slickPolygon: [
      [2.4580, 101.3820],
      [2.4650, 101.3990],
      [2.4710, 101.4250],
      [2.4680, 101.4380],
      [2.4590, 101.4160],
      [2.4520, 101.3890]
    ],
    opticCode: 4, // Discontinuous True Color (Heavy Crude Sheen)
    vessels: [
      {
        id: 'vessel_malacca_1',
        name: 'MT OCEAN TITAN',
        imo: '9845120',
        mmsi: '538009123',
        flag: '🇲🇭 Marshall Islands',
        type: 'Crude Oil Tanker',
        dwt: 305000,
        lengthM: 333,
        beamM: 60,
        yearBuilt: 2019,
        destination: 'Singapore (ETA 18:00)',
        owner: 'Titan Ocean Maritime Inc.',
        image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=80',
        // Deep Sea Track Points along Malacca Shipping Lane
        trackHistory: [
          { lat: 2.6410, lng: 101.1500, speed: 14.5, course: 125, timestamp: NOW - 18 * 3600 * 1000 },
          { lat: 2.5510, lng: 101.2500, speed: 14.1, course: 124, timestamp: NOW - 16 * 3600 * 1000 },
          { lat: 2.4840, lng: 101.3250, speed: 13.8, course: 122, timestamp: NOW - 14.5 * 3600 * 1000 },
          // SPEED DROP & AIS BLACKOUT START NEAR SEA ORIGIN
          { lat: 2.4390, lng: 101.3750, speed: 3.2, course: 120, timestamp: NOW - 13.5 * 3600 * 1000 },
          // AIS BLACKOUT GAP (No signals for 2 hours)
          { lat: 2.4160, lng: 101.4000, speed: 4.1, course: 118, timestamp: NOW - 11.5 * 3600 * 1000 },
          { lat: 2.3040, lng: 101.5250, speed: 13.9, course: 121, timestamp: NOW - 9 * 3600 * 1000 },
          { lat: 2.1240, lng: 101.7250, speed: 14.2, course: 123, timestamp: NOW - 5 * 3600 * 1000 },
          { lat: 1.8990, lng: 101.9750, speed: 14.4, course: 125, timestamp: NOW }
        ]
      },
      {
        id: 'vessel_malacca_2',
        name: 'MSC BALTIC STAR',
        imo: '9723811',
        mmsi: '211394000',
        flag: '🇩🇪 Germany',
        type: 'Container Ship',
        dwt: 140000,
        lengthM: 366,
        beamM: 51,
        yearBuilt: 2017,
        destination: 'Tanjung Pelepas',
        owner: 'Mediterranean Shipping Co.',
        image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80',
        trackHistory: [
          { lat: 2.7740, lng: 101.0400, speed: 18.2, course: 128, timestamp: NOW - 18 * 3600 * 1000 },
          { lat: 2.6120, lng: 101.2200, speed: 18.5, course: 127, timestamp: NOW - 15 * 3600 * 1000 },
          { lat: 2.4500, lng: 101.4000, speed: 18.4, course: 128, timestamp: NOW - 12 * 3600 * 1000 },
          { lat: 2.2880, lng: 101.5800, speed: 18.1, course: 126, timestamp: NOW - 9 * 3600 * 1000 },
          { lat: 2.1260, lng: 101.7600, speed: 18.3, course: 127, timestamp: NOW - 6 * 3600 * 1000 },
          { lat: 1.8020, lng: 102.1200, speed: 18.0, course: 128, timestamp: NOW }
        ]
      },
      {
        id: 'vessel_malacca_3',
        name: 'MV PACIFIC TRADER',
        imo: '9456201',
        mmsi: '371204000',
        flag: '🇵🇦 Panama',
        type: 'Bulk Carrier',
        dwt: 75000,
        lengthM: 225,
        beamM: 32,
        yearBuilt: 2012,
        destination: 'Shanghai',
        owner: 'Pacific Bulk Shipping',
        image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80',
        trackHistory: [
          { lat: 2.5380, lng: 101.3000, speed: 11.5, course: 122, timestamp: NOW - 18 * 3600 * 1000 },
          { lat: 2.4300, lng: 101.4200, speed: 11.8, course: 120, timestamp: NOW - 15 * 3600 * 1000 },
          { lat: 2.3220, lng: 101.5400, speed: 11.6, course: 121, timestamp: NOW - 12 * 3600 * 1000 },
          { lat: 2.2140, lng: 101.6600, speed: 11.4, course: 123, timestamp: NOW - 9 * 3600 * 1000 },
          { lat: 1.8900, lng: 102.0200, speed: 11.7, course: 122, timestamp: NOW }
        ]
      }
    ]
  },
  {
    id: 'north_sea',
    title: 'North Sea - Complex Offshore Flow',
    subtitle: 'Chemical sheen near energy platform corridor under strong tidal current',
    region: 'North Sea (Sector 56°N, 3°E - Deep Offshore)',
    satelliteMetadata: {
      satellite: 'Sentinel-1A SAR C-Band',
      acquisitionTime: NOW - 8 * 3600 * 1000,
      mode: 'IW Dual-Pol (VV + VH)',
      resolution: '10m',
      orbit: 'Pass 089 Ascending',
      windSpeedKnots: 22,
      windDirDeg: 270, // W wind
      currentSpeedKnots: 2.1,
      currentDirDeg: 45 // NE current
    },
    slickPolygon: [
      [56.4020, 3.2010],
      [56.4150, 3.2240],
      [56.4280, 3.2510],
      [56.4220, 3.2620],
      [56.4090, 3.2350],
      [56.3980, 3.2100]
    ],
    opticCode: 3, // Metallic Appearance
    vessels: [
      {
        id: 'vessel_ns_1',
        name: 'MT NORDIC STAR',
        imo: '9712040',
        mmsi: '257390000',
        flag: '🇳🇴 Norway (NIS)',
        type: 'Chemical / Product Tanker',
        dwt: 45000,
        lengthM: 183,
        beamM: 32,
        yearBuilt: 2018,
        destination: 'Rotterdam',
        owner: 'Nordic Tankers AS',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
        trackHistory: [
          { lat: 56.3100, lng: 3.0500, speed: 13.1, course: 52, timestamp: NOW - 14 * 3600 * 1000 },
          { lat: 56.3650, lng: 3.1400, speed: 12.8, course: 50, timestamp: NOW - 11 * 3600 * 1000 },
          { lat: 56.3990, lng: 3.1950, speed: 3.1, course: 48, timestamp: NOW - 9 * 3600 * 1000 }, // SPEED DROP
          { lat: 56.4350, lng: 3.2500, speed: 12.9, course: 51, timestamp: NOW - 6 * 3600 * 1000 },
          { lat: 56.4900, lng: 3.3400, speed: 13.2, course: 53, timestamp: NOW }
        ]
      },
      {
        id: 'vessel_ns_2',
        name: 'SEA PIONEER',
        imo: '9651092',
        mmsi: '235091200',
        flag: '🇬🇧 United Kingdom',
        type: 'Tug / Offshore Support',
        dwt: 4200,
        lengthM: 88,
        beamM: 20,
        yearBuilt: 2015,
        destination: 'Ekofisk Field',
        owner: 'North Sea Offshore Services',
        image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80',
        trackHistory: [
          { lat: 56.4200, lng: 3.1000, speed: 9.8, course: 88, timestamp: NOW - 14 * 3600 * 1000 },
          { lat: 56.4220, lng: 3.2100, speed: 10.1, course: 85, timestamp: NOW - 10 * 3600 * 1000 },
          { lat: 56.4240, lng: 3.3200, speed: 9.9, course: 87, timestamp: NOW - 6 * 3600 * 1000 },
          { lat: 56.4260, lng: 3.4300, speed: 10.0, course: 86, timestamp: NOW }
        ]
      }
    ]
  },
  {
    id: 'persian_gulf',
    title: 'Persian Gulf - Heavy Crude Discharge',
    subtitle: 'Large continuous true color crude slick drifting in deep ocean channel',
    region: 'Strait of Hormuz (Deep Sea Channel)',
    satelliteMetadata: {
      satellite: 'Sentinel-2B Optical + Sentinel-1 SAR',
      acquisitionTime: NOW - 6 * 3600 * 1000,
      mode: 'Multi-Spectral MSI + SAR IW',
      resolution: '10m Band 2,3,4,8',
      orbit: 'Pass 021 Descending',
      windSpeedKnots: 18,
      windDirDeg: 135, // SE wind
      currentSpeedKnots: 1.6,
      currentDirDeg: 300 // NW current
    },
    slickPolygon: [
      [26.2500, 55.1500],
      [26.2680, 55.1720],
      [26.2850, 55.2010],
      [26.2790, 55.2180],
      [26.2610, 55.1920],
      [26.2450, 55.1650]
    ],
    opticCode: 5, // Continuous True Color Heavy Crude
    vessels: [
      {
        id: 'vessel_pg_1',
        name: 'MT GULF SOVEREIGN',
        imo: '9918231',
        mmsi: '636019800',
        flag: '🇱🇷 Liberia',
        type: 'Crude Oil Tanker',
        dwt: 320000,
        lengthM: 339,
        beamM: 60,
        yearBuilt: 2021,
        destination: 'Fujairah Anchorage',
        owner: 'Gulf Carrier Corp.',
        image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=80',
        trackHistory: [
          { lat: 26.1200, lng: 54.9800, speed: 14.8, course: 55, timestamp: NOW - 12 * 3600 * 1000 },
          { lat: 26.1900, lng: 55.0700, speed: 14.4, course: 54, timestamp: NOW - 10 * 3600 * 1000 },
          // 110-MINUTE AIS BLACKOUT GAP
          { lat: 26.2420, lng: 55.1410, speed: 2.9, course: 52, timestamp: NOW - 8.2 * 3600 * 1000 },
          { lat: 26.3100, lng: 55.2300, speed: 14.1, course: 56, timestamp: NOW - 5 * 3600 * 1000 },
          { lat: 26.3800, lng: 55.3200, speed: 14.6, course: 55, timestamp: NOW }
        ]
      }
    ]
  },
  {
    id: 'gulf_of_mexico',
    title: 'Gulf of Mexico - Rig Blowout',
    subtitle: 'Expanding crude oil slick near deepwater drilling infrastructure',
    region: 'Mississippi Canyon (Deepwater)',
    satelliteMetadata: {
      satellite: 'Sentinel-1B SAR C-Band',
      acquisitionTime: NOW - 12 * 3600 * 1000,
      mode: 'Interferometric Wide (IW)',
      resolution: '10m',
      orbit: 'Pass 122 Descending',
      windSpeedKnots: 15,
      windDirDeg: 180,
      currentSpeedKnots: 1.2,
      currentDirDeg: 90
    },
    slickPolygon: [
      [28.7300, -88.3500],
      [28.7500, -88.3100],
      [28.7800, -88.2800],
      [28.7700, -88.2500],
      [28.7400, -88.2900],
      [28.7200, -88.3300]
    ],
    opticCode: 4,
    vessels: [
      {
        id: 'vessel_gom_1',
        name: 'OCEAN VALOR',
        imo: '9604471',
        mmsi: '369542000',
        flag: '🇺🇸 USA',
        type: 'Offshore Supply Vessel',
        dwt: 5200,
        lengthM: 85,
        beamM: 18,
        yearBuilt: 2013,
        destination: 'Port Fourchon',
        owner: 'Gulf Offshore LLC',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
        trackHistory: [
          { lat: 28.7100, lng: -88.3200, speed: 10.5, course: 320, timestamp: NOW - 12 * 3600 * 1000 },
          { lat: 28.8000, lng: -88.4500, speed: 10.2, course: 318, timestamp: NOW - 8 * 3600 * 1000 },
          { lat: 28.9100, lng: -88.6000, speed: 10.6, course: 319, timestamp: NOW - 4 * 3600 * 1000 },
          { lat: 29.0200, lng: -88.7500, speed: 10.4, course: 320, timestamp: NOW }
        ]
      },
      {
        id: 'vessel_gom_2',
        name: 'SEACOR BRAVE',
        imo: '9424261',
        mmsi: '367412345',
        flag: '🇺🇸 USA',
        type: 'Anchor Handling Tug Supply',
        dwt: 3100,
        lengthM: 70,
        beamM: 15,
        yearBuilt: 2008,
        destination: 'MC-252',
        owner: 'Seacor Marine',
        image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80',
        trackHistory: [
          { lat: 28.8500, lng: -88.2000, speed: 11.0, course: 210, timestamp: NOW - 12 * 3600 * 1000 },
          { lat: 28.8000, lng: -88.2500, speed: 10.8, course: 212, timestamp: NOW - 8 * 3600 * 1000 },
          { lat: 28.7600, lng: -88.3100, speed: 3.5, course: 220, timestamp: NOW - 4 * 3600 * 1000 },
          { lat: 28.7400, lng: -88.3600, speed: 2.1, course: 225, timestamp: NOW }
        ]
      }
    ]
  },
  {
    id: 'south_china_sea',
    title: 'South China Sea - Ship-to-Ship Transfer Leak',
    subtitle: 'Elongated bunker fuel trail near international maritime boundary',
    region: 'South China Sea (Spratly Islands Sector)',
    satelliteMetadata: {
      satellite: 'Sentinel-1A SAR C-Band',
      acquisitionTime: NOW - 4 * 3600 * 1000,
      mode: 'IW Dual-Pol (VV + VH)',
      resolution: '10m',
      orbit: 'Pass 044 Ascending',
      windSpeedKnots: 12,
      windDirDeg: 45,
      currentSpeedKnots: 0.8,
      currentDirDeg: 225
    },
    slickPolygon: [
      [10.5000, 114.2000],
      [10.4800, 114.1800],
      [10.4500, 114.1600],
      [10.4600, 114.1500],
      [10.4900, 114.1700],
      [10.5100, 114.1900]
    ],
    opticCode: 2,
    vessels: [
      {
        id: 'vessel_scs_1',
        name: 'PACIFIC HORIZON',
        imo: '9312345',
        mmsi: '563000111',
        flag: '🇸🇬 Singapore',
        type: 'Oil Products Tanker',
        dwt: 110000,
        lengthM: 250,
        beamM: 44,
        yearBuilt: 2012,
        destination: 'Zhoushan',
        owner: 'Pacific Carriers Ltd',
        image: 'https://images.unsplash.com/photo-1605634567439-ceceeb0c6536?auto=format&fit=crop&w=600&q=80',
        trackHistory: [
          { lat: 10.3500, lng: 114.0500, speed: 13.5, course: 45, timestamp: NOW - 12 * 3600 * 1000 },
          { lat: 10.4200, lng: 114.1200, speed: 13.8, course: 46, timestamp: NOW - 8 * 3600 * 1000 },
          { lat: 10.4800, lng: 114.1800, speed: 4.2, course: 45, timestamp: NOW - 4 * 3600 * 1000 },
          { lat: 10.5500, lng: 114.2500, speed: 13.6, course: 44, timestamp: NOW }
        ]
      },
      {
        id: 'vessel_scs_2',
        name: 'LU RONG YU 543',
        imo: '8877665',
        mmsi: '412000000',
        flag: '🇨🇳 China',
        type: 'Fishing Vessel',
        dwt: 600,
        lengthM: 55,
        beamM: 9,
        yearBuilt: 2005,
        destination: 'High Seas',
        owner: 'Rongcheng Fisheries',
        image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80',
        trackHistory: [
          { lat: 10.6000, lng: 114.1000, speed: 6.5, course: 135, timestamp: NOW - 12 * 3600 * 1000 },
          { lat: 10.5500, lng: 114.1500, speed: 6.2, course: 130, timestamp: NOW - 8 * 3600 * 1000 },
          { lat: 10.5000, lng: 114.2000, speed: 2.1, course: 90, timestamp: NOW - 4 * 3600 * 1000 },
          { lat: 10.5000, lng: 114.2500, speed: 6.8, course: 90, timestamp: NOW }
        ]
      }
    ]
  }
];
