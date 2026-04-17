import { useEffect, useMemo, useState, memo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons not loading in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function createIcon(color: string) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: ${color};
      border: 2.5px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

const visitedIcon = createIcon("#22c55e");
const toVisitIcon = createIcon("#eab308");

type Restaurant = {
  id: string;
  name: string;
  location: string;
  cuisine: string;
  visited: boolean;
  rating: number;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
};

interface MapViewProps {
  restaurants: Restaurant[];
}

function FitToUser({ markers }: { markers: { lat: number; lng: number }[] }) {
  const map = useMap();
  const [located, setLocated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!navigator.geolocation) {
      if (markers.length > 0) {
        const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        map.setView([pos.coords.latitude, pos.coords.longitude], 14);
        setLocated(true);
      },
      () => {
        if (cancelled) return;
        if (markers.length > 0) {
          const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        }
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );

    return () => {
      cancelled = true;
    };
  }, [map, markers]);

  return null;
}

type MarkerData = {
  id: string;
  name: string;
  location: string;
  cuisine: string;
  visited: boolean;
  rating: number;
  address?: string | null;
  lat: number;
  lng: number;
};

const MarkersLayer = memo(function MarkersLayer({ markers }: { markers: MarkerData[] }) {
  return (
    <>
      {markers.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lng]} icon={m.visited ? visitedIcon : toVisitIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold text-foreground">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.cuisine} • {m.location}</p>
              {m.address && <p className="mt-1 text-[11px] text-muted-foreground italic">{m.address}</p>}
              {m.visited && m.rating > 0 && (
                <p className="mt-1 text-xs font-medium" style={{ color: "#22c55e" }}>
                  ⭐ {m.rating}/10
                </p>
              )}
              <span
                className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  background: m.visited ? "#dcfce7" : "#fef9c3",
                  color: m.visited ? "#166534" : "#854d0e",
                }}
              >
                {m.visited ? "Visitado" : "Para visitar"}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
});

function MapViewImpl({ restaurants }: MapViewProps) {
  const markersData = useMemo<MarkerData[]>(() => {
    return restaurants
      .filter((r) => r.latitude != null && r.longitude != null)
      .map((r) => ({ ...r, lat: r.latitude as number, lng: r.longitude as number }));
  }, [restaurants]);

  const unresolvedCount = restaurants.length - markersData.length;

  const fitMarkers = useMemo(
    () => markersData.map((m) => ({ lat: m.lat, lng: m.lng })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [markersData.length]
  );

  if (markersData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
        <p>Nenhum restaurante com localização precisa para mostrar no mapa.</p>
        {restaurants.length > 0 && <p className="text-xs">Estou corrigindo os endereços automaticamente em segundo plano.</p>}
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height: "calc(100vh - 280px)", minHeight: "400px" }}>
      <MapContainer
        center={[-23.5505, -46.6333]}
        zoom={13}
        className="h-full w-full rounded-lg"
        style={{ zIndex: 0 }}
        preferCanvas={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToUser markers={fitMarkers} />
        <MarkersLayer markers={markersData} />
      </MapContainer>

      <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border border-border bg-card/95 px-3 py-2 shadow-md backdrop-blur-sm">
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: "#22c55e", border: "2px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
            Visitado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: "#eab308", border: "2px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
            Para visitar
          </span>
        </div>
        {unresolvedCount > 0 && <p className="mt-2 text-[11px] text-muted-foreground">{unresolvedCount} ainda sem localização precisa.</p>}
      </div>
    </div>
  );
}

export const MapView = memo(MapViewImpl);
