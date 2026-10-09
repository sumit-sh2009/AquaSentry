import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet"

type Line = { id: string; material: "lead" | "copper" | "unknown"; lat: number; lon: number }

const colors: Record<Line["material"], string> = {
  lead: "#9c2f2f",
  copper: "#2f6b4f",
  unknown: "#a15c07",
}

export function WatershedMap({ lines }: { lines: Line[] }) {
  return (
    <MapContainer
      center={[40.735, -74.172]}
      zoom={13}
      scrollWheelZoom={false}
      className="h-[420px] w-full rounded-sm border border-border"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {lines.map((line) => (
        <CircleMarker
          key={line.id}
          center={[line.lat, line.lon]}
          radius={line.material === "lead" ? 10 : 7}
          pathOptions={{ color: colors[line.material], fillColor: colors[line.material], fillOpacity: 0.85 }}
        >
          <Popup>
            {line.id} · {line.material}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
