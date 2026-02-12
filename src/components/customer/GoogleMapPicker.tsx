/// <reference types="google.maps" />
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, X } from "lucide-react";

const GOOGLE_MAPS_API_KEY = "AIzaSyCgswl7nY8Xpj0ijQLb8ib-PlG0OMKoT0Q";

interface GoogleMapPickerProps {
  onSelectLocation: (address: string, lat: number, lng: number) => void;
  onClose: () => void;
}

const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.maps) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
};

const GoogleMapPicker = ({ onSelectLocation, onClose }: GoogleMapPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const latLngRef = useRef<{ lat: number; lng: number }>({ lat: 22.7242, lng: 88.4782 }); // Barasat default

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });
      if (result.results[0]) {
        setAddress(result.results[0].formatted_address);
      }
    } catch {
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  }, []);

  useEffect(() => {
    let autocomplete: google.maps.places.Autocomplete | null = null;

    const initMap = async () => {
      try {
        await loadGoogleMapsScript();
        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: latLngRef.current,
          zoom: 16,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        mapInstance.current = map;

        const marker = new google.maps.Marker({
          position: latLngRef.current,
          map,
          draggable: true,
          animation: google.maps.Animation.DROP,
        });
        markerRef.current = marker;

        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          if (pos) {
            latLngRef.current = { lat: pos.lat(), lng: pos.lng() };
            reverseGeocode(pos.lat(), pos.lng());
          }
        });

        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            marker.setPosition(e.latLng);
            latLngRef.current = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            reverseGeocode(e.latLng.lat(), e.latLng.lng());
          }
        });

        // Search autocomplete
        if (searchInputRef.current) {
          autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
            componentRestrictions: { country: "in" },
            fields: ["formatted_address", "geometry"],
          });
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete?.getPlace();
            if (place?.geometry?.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              map.setCenter({ lat, lng });
              map.setZoom(17);
              marker.setPosition({ lat, lng });
              latLngRef.current = { lat, lng };
              setAddress(place.formatted_address || "");
            }
          });
        }

        // Try getting current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              map.setCenter({ lat: latitude, lng: longitude });
              marker.setPosition({ lat: latitude, lng: longitude });
              latLngRef.current = { lat: latitude, lng: longitude };
              reverseGeocode(latitude, longitude);
            },
            () => {
              reverseGeocode(latLngRef.current.lat, latLngRef.current.lng);
            }
          );
        }

        setLoading(false);
      } catch (err) {
        console.error("Map init error:", err);
        setLoading(false);
      }
    };

    initMap();
  }, [reverseGeocode]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapInstance.current?.setCenter({ lat: latitude, lng: longitude });
        mapInstance.current?.setZoom(18);
        markerRef.current?.setPosition({ lat: latitude, lng: longitude });
        latLngRef.current = { lat: latitude, lng: longitude };
        reverseGeocode(latitude, longitude);
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleConfirm = () => {
    if (address) {
      onSelectLocation(address, latLngRef.current.lat, latLngRef.current.lng);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-heading font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" /> SET YOUR LOCATION
        </p>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <Input
        ref={searchInputRef}
        placeholder="Search for your area, building..."
        className="h-9 text-sm"
      />

      <div className="relative rounded-xl overflow-hidden border border-border" style={{ height: 250 }}>
        {loading && (
          <div className="absolute inset-0 bg-secondary flex items-center justify-center z-10">
            <p className="text-xs text-muted-foreground animate-pulse">Loading map...</p>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>

      <Button
        variant="outline"
        onClick={handleDetectLocation}
        disabled={locating}
        className="w-full rounded-xl text-xs uppercase tracking-wider font-heading font-bold"
      >
        <Navigation className="w-3 h-3 mr-1" />
        {locating ? "DETECTING..." : "DETECT MY LOCATION"}
      </Button>

      {address && (
        <div className="bg-secondary/50 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-heading font-bold">SELECTED ADDRESS</p>
          <p className="text-sm text-foreground">{address}</p>
        </div>
      )}

      <Button
        onClick={handleConfirm}
        disabled={!address}
        className="w-full rounded-xl font-heading font-bold text-xs uppercase tracking-wider"
      >
        CONFIRM LOCATION
      </Button>
    </div>
  );
};

export default GoogleMapPicker;
export { GOOGLE_MAPS_API_KEY };
