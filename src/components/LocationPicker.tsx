/**
 * LocationPicker — interactive Leaflet map for choosing / confirming a location.
 *
 * Usage:
 *   <LocationPicker
 *     value="Bengaluru, Karnataka, India"
 *     onChange={(address, lat, lng) => setLocation(address)}
 *   />
 *
 * The component:
 *   1. Shows a "Use my location" button that calls navigator.geolocation.
 *   2. Centres the map on the obtained coordinates and drops a draggable pin.
 *   3. Reverse-geocodes via OpenStreetMap Nominatim (free, no API key).
 *   4. Updates the text input whenever the pin is dragged to a new position.
 */

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, LocateFixed, MapPin } from "lucide-react";

// Fix Leaflet's default marker icon URLs when bundled with Vite
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";
import markerIcon2xPng from "leaflet/dist/images/marker-icon-2x.png";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIcon2xPng,
  shadowUrl: markerShadowPng,
});

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]; // Centre of India
const DEFAULT_ZOOM = 5;
const PIN_ZOOM = 14;

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json() as {
    address?: {
      village?: string; town?: string; suburb?: string;
      city?: string; state?: string; country?: string;
    };
    display_name?: string;
  };
  const a = data.address ?? {};
  const locality = a.suburb ?? a.village ?? a.town ?? a.city ?? "";
  const state = a.state ?? "";
  const country = a.country ?? "";
  return [locality, state, country].filter(Boolean).join(", ") || (data.display_name ?? `${lat.toFixed(5)}, ${lon.toFixed(5)}`);
}

interface LocationPickerProps {
  value: string;
  onChange: (address: string, lat: number, lng: number) => void;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState("");

  // Initialise Leaflet map once on mount
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Click on map to place/move pin
    map.on("click", async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      placeMarker(map, lat, lng);
      setGeocoding(true);
      setError("");
      try {
        const address = await reverseGeocode(lat, lng);
        onChange(address, lat, lng);
      } catch {
        setError("Could not fetch address for this location.");
      } finally {
        setGeocoding(false);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const placeMarker = (map: L.Map, lat: number, lng: number) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);

      marker.on("dragend", async () => {
        const pos = marker.getLatLng();
        setGeocoding(true);
        setError("");
        try {
          const address = await reverseGeocode(pos.lat, pos.lng);
          onChange(address, pos.lat, pos.lng);
        } catch {
          setError("Could not fetch address for this position.");
        } finally {
          setGeocoding(false);
        }
      });

      markerRef.current = marker;
    }
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const map = mapRef.current;
        if (!map) return;

        map.setView([lat, lng], PIN_ZOOM, { animate: true });
        placeMarker(map, lat, lng);

        setGeocoding(true);
        try {
          const address = await reverseGeocode(lat, lng);
          onChange(address, lat, lng);
        } catch {
          setError("Could not fetch address. Location set by coordinates.");
          onChange(`${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng);
        } finally {
          setGeocoding(false);
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location permission denied. Click on the map to set your location manually.");
        } else {
          setError("Unable to retrieve your location. Click on the map instead.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  return (
    <div className="space-y-2">
      {/* Current value display */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
        <MapPin className="h-4 w-4 text-primary shrink-0" />
        <span className="flex-1 text-sm text-foreground truncate">
          {geocoding
            ? <span className="text-muted-foreground italic flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin inline" /> Fetching address…</span>
            : value || <span className="text-muted-foreground italic">No location selected yet</span>}
        </span>
      </div>

      {/* Map container */}
      <div className="relative rounded-xl overflow-hidden border border-border" style={{ height: 260 }}>
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Locate me button overlay */}
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating || geocoding}
          className="absolute top-2 right-2 z-[1000] flex items-center gap-1.5 rounded-lg bg-background border border-border px-3 py-1.5 text-xs font-semibold shadow-md hover:bg-muted transition-colors disabled:opacity-60"
        >
          {locating
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Locating…</>
            : <><LocateFixed className="h-3.5 w-3.5 text-primary" /> Use my location</>}
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Tap <strong>Use my location</strong> or click anywhere on the map to place a pin. Drag the pin to fine-tune.
      </p>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
