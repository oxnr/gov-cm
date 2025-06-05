'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, MagnifyingGlass, X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

// Fix for default markers in production
delete (L.Icon.Default.prototype as L.Icon.Default & {_getIconUrl?: unknown})._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface MapRadiusSearchProps {
  onLocationSelect: (lat: number, lng: number, radius: number, address: string) => void;
  initialLocation?: { lat: number; lng: number };
  initialRadius?: number;
  contractLocation?: { lat: number; lng: number; title: string; city?: string; state?: string } | null;
}

interface LocationResult {
  lat: number;
  lng: number;
  display_name: string;
  address: {
    city?: string;
    state?: string;
    postcode?: string;
  };
}

function ChangeView({ center, zoom, bounds }: { center: [number, number]; zoom: number; bounds?: L.LatLngBoundsExpression }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView(center, zoom);
    }
  }, [map, center, zoom, bounds]);
  
  return null;
}

export default function MapRadiusSearch({ 
  onLocationSelect, 
  initialLocation = { lat: 38.8951, lng: -77.0364 }, // Default to Washington DC
  initialRadius = 50,
  contractLocation 
}: MapRadiusSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [radius, setRadius] = useState(initialRadius);
  const [mapCenter, setMapCenter] = useState<[number, number]>([initialLocation.lat, initialLocation.lng]);
  const [address, setAddress] = useState('Washington, DC');
  const [, setIsSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  // Convert miles to meters for the circle
  const radiusInMeters = radius * 1609.34;

  // Search for locations using Nominatim API
  const searchLocation = async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=us&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSearchResults(data.map((item: {lat: string; lon: string; display_name: string; address?: Record<string, string>}) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        display_name: item.display_name,
        address: item.address || {}
      })));
    } catch (error) {
      console.error('Error searching location:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      searchLocation(searchQuery);
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const handleLocationSelect = (result: LocationResult) => {
    setSelectedLocation({ lat: result.lat, lng: result.lng });
    setMapCenter([result.lat, result.lng]);
    setAddress(result.display_name);
    setSearchResults([]);
    setSearchQuery('');
    onLocationSelect(result.lat, result.lng, radius, result.display_name);
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    onLocationSelect(selectedLocation.lat, selectedLocation.lng, newRadius, address);
  };

  // Calculate bounds when we have both locations
  const [mapBounds, setMapBounds] = useState<L.LatLngBoundsExpression | undefined>(undefined);
  
  useEffect(() => {
    if (contractLocation && selectedLocation) {
      // Create bounds that include both locations
      const bounds: L.LatLngBoundsExpression = [
        [Math.min(selectedLocation.lat, contractLocation.lat), Math.min(selectedLocation.lng, contractLocation.lng)],
        [Math.max(selectedLocation.lat, contractLocation.lat), Math.max(selectedLocation.lng, contractLocation.lng)]
      ];
      setMapBounds(bounds);
    } else {
      setMapBounds(undefined);
    }
  }, [contractLocation, selectedLocation]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleLocationSelect(result)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" weight="duotone" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {result.address.city || result.address.state || 'Unknown Location'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {result.display_name}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Radius Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Search Radius: {radius} miles
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="10"
            max="500"
            value={radius}
            onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
            className="flex-1"
          />
          <div className="flex gap-2">
            {[25, 50, 100, 200].map(r => (
              <button
                key={r}
                onClick={() => handleRadiusChange(r)}
                className={cn(
                  "px-3 py-1 text-sm rounded-lg transition-all",
                  radius === r
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                {r}mi
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map - Full Screen */}
      <div className="h-[600px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <MapContainer
          center={mapCenter}
          zoom={8}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <ChangeView center={mapCenter} zoom={8} bounds={mapBounds} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Circle
            center={[selectedLocation.lat, selectedLocation.lng]}
            radius={radiusInMeters}
            pathOptions={{
              fillColor: '#6366f1',
              fillOpacity: 0.1,
              color: '#6366f1',
              weight: 2,
            }}
          />
          <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
            <Popup>
              <div className="text-sm">
                <div className="font-medium mb-1">Selected Location</div>
                <div className="text-gray-600">{address}</div>
                <div className="text-gray-500 mt-1">Radius: {radius} miles</div>
              </div>
            </Popup>
          </Marker>
          
          {/* Contract Marker */}
          {contractLocation && (
            <Marker 
              position={[contractLocation.lat, contractLocation.lng]}
              icon={L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #dc2626; color: white; padding: 8px; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">C</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
              })}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-bold mb-1">{contractLocation.title}</div>
                  {contractLocation.city && contractLocation.state && (
                    <div className="text-gray-600">{contractLocation.city}, {contractLocation.state}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">Contract Opportunity</div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Selected Location Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <MapPin className="h-5 w-5" weight="duotone" />
          <span className="font-medium">Current Selection:</span>
        </div>
        <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
          {address} • {radius} mile radius
        </div>
      </div>
    </div>
  );
}