import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from "react-leaflet";
import L from "leaflet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search } from "lucide-react";
import { toast } from "sonner";

//  Default marker icon fix (Leaflet ka known issue with bundlers)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LocationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLat?: number;
  initialLng?: number;
  initialRadius?: number;
  onConfirm: (lat: number, lng: number, radius: number, locationName: string) => void;
}

//  Map click handler — click karke marker move karo
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const LocationPicker = ({
  open,
  onOpenChange,
  initialLat,
  initialLng,
  initialRadius,
  onConfirm,
}: LocationPickerProps) => {
  //  Default — Delhi (India ka center jaisa point)
  const [position, setPosition] = React.useState<[number, number]>([
    initialLat ?? 28.6139,
    initialLng ?? 77.2090,
  ]);
  const [radius, setRadius] = React.useState<number>(initialRadius ?? 100);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const [locationName, setLocationName] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setPosition([initialLat ?? 28.6139, initialLng ?? 77.2090]);
      setRadius(initialRadius ?? 100);
      setLocationName("");
    }
  }, [open, initialLat, initialLng, initialRadius]);

  //  Naya — Map click pe reverse geocode karo
  const handleMapClick = async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      setLocationName(data.display_name ?? "");
    } catch (err: any) {
      const message =
        err?.message || "Failed to get location name";
      toast.error(message);
    }

    setLocationName("");

  }

  //  Search location (Nominatim — free OpenStreetMap search API)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=in`
      );

      const data = await res.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const locationName = data[0].display_name;

        setPosition([lat, lng]);
        setLocationName(locationName);

      } else {
        toast.error("Location not found — try a nearby landmark or area name");
      }
    } catch (err: any) {
      const message =
        err?.message || "Failed to search location";
      toast.error(message);
    }
    finally {
      setSearching(false);
    }
  };

  const handleConfirm = () => {
    onConfirm(position[0], position[1], radius, locationName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Set Branch Location
          </DialogTitle>
          <DialogDescription>set the location of your branch</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">

          {/* Search Bar */}
          <div className="flex gap-2">
            <Input
              placeholder="Search address or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching} size="icon" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Map */}
          <div className="h-80 w-full rounded-lg overflow-hidden border">
            <MapContainer
              center={position}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
              key={`${position[0]}-${position[1]}`} //  Re-center on search
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onLocationSelect={handleMapClick} />
              <Marker position={position} />
              <Circle
                center={position}
                radius={radius}
                pathOptions={{ color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.15 }}
              />
            </MapContainer>
          </div>

          {/* Location Name */}
          {locationName && (
            <p className="text-sm font-medium bg-muted p-2 rounded">{locationName}</p>
          )}


          <p className="text-xs text-muted-foreground">
            Click anywhere on the map to set the branch location, or search above.
          </p>

          {/* Radius Slider */}
          <div>
            <Label>Geo Fence Radius: {radius}m</Label>
            <input
              type="range"
              min={50}
              max={1000}
              step={50}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Coordinates Display */}
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>Lat: {position[0].toFixed(6)}</span>
            <span>Lng: {position[1].toFixed(6)}</span>
          </div>

          <Button onClick={handleConfirm}>Confirm Location</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPicker;