import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet"
import type { LineMaterial, ServiceLine } from "../lib/types"

const colors: Record<LineMaterial, string> = {
  lead: "#9c2f2f",
  copper: "#2f6b4f",
  unknown: "#c9842a",
}

const legend: { material: LineMaterial; label: string }[] = [
  { material: "lead", label: "Lead" },
  { material: "copper", label: "Copper" },
  { material: "unknown", label: "Unknown" },
]

export function WatershedMap({ lines }: { lines: ServiceLine[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <MapContainer
        center={[40.735, -74.172]}
        zoom={13}
        scrollWheelZoom={false}
        aria-label="Newark service-line markers. Lead, copper, and unknown materials."
        className="h-80 w-full overflow-hidden rounded-[2.5rem] border border-border md:h-[26rem]"
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
              <span translate="no">
                {line.id} · {line.material}
              </span>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      <ul className="flex flex-wrap gap-4" aria-label="Marker colors">
        {legend.map((item) => (
          <li key={item.material} className="flex items-center gap-2">
            <span className="size-3 rounded-full" style={{ backgroundColor: colors[item.material] }} aria-hidden="true" />
            {item.label}
          </li>
        ))}
      </ul>
      <p className="text-pretty opacity-80">
        Fixture service lines on the Newark mirror. Not a live city inventory. Map tiles © OpenStreetMap.
      </p>
    </div>
  )
}
