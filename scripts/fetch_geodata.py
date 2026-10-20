"""Collect landmark footprints (OpenStreetMap) and walking/driving routes
(FOSSGIS OSRM) for the seven stops. Writes data/sites.geojson and
data/routes.geojson. Run: python scripts/fetch_geodata.py"""
import json
import pathlib
import time
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
UA = {"User-Agent": "hanoi-xua-research/1.0"}

# Stop order follows the walking tour. osm = footprint used to place the 3D model.
STOPS = [
    {"id": "bat-trang", "name": "Bảo tàng gốm Bát Tràng", "osm": ("way", 1206576120)},
    {"id": "pho-co", "name": "Phố Tạ Hiện · Phố Cổ", "lonlat": [105.85218, 21.03462], "osm": None, "approx": True},
    {"id": "ma-may", "name": "Nhà cổ 87 Mã Mây", "osm": ("way", 323366879)},
    {"id": "ho-guom", "name": "Tháp Rùa · Hồ Gươm", "osm": ("way", 178995269)},
    {"id": "van-mieu", "name": "Khuê Văn Các · Văn Miếu", "osm": ("way", 702185155)},
    {"id": "hoang-thanh", "name": "Đoan Môn · Hoàng thành Thăng Long", "osm": ("way", 696389268)},
    {"id": "lang-bac", "name": "Lăng Chủ tịch Hồ Chí Minh", "osm": ("way", 37625751)},
]


def get(url, data=None):
    req = urllib.request.Request(url, data=data, headers=UA)
    return json.load(urllib.request.urlopen(req, timeout=120))


def overpass(query):
    data = urllib.parse.urlencode({"data": query}).encode()
    for attempt in range(4):
        for host in ("https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"):
            try:
                return get(host, data)
            except Exception as error:  # 429/502/504 from busy public instances
                print("overpass retry:", host, error)
        time.sleep(3 * (attempt + 1))
    raise RuntimeError("Overpass unavailable")


def main():
    ways = [s["osm"][1] for s in STOPS if s["osm"] and s["osm"][0] == "way"]
    res = overpass(f"[out:json][timeout:90];way(id:{','.join(map(str, ways))});out geom tags;")
    by_id = {e["id"]: e for e in res["elements"]}
    features = []
    for order, stop in enumerate(STOPS):
        props = {"id": stop["id"], "name": stop["name"], "order": order + 1, "approx": bool(stop.get("approx"))}
        if stop["osm"] and stop["osm"][0] == "way":
            el = by_id[stop["osm"][1]]
            ring = [[p["lon"], p["lat"]] for p in el["geometry"]]
            lon = sum(p[0] for p in ring[:-1]) / (len(ring) - 1)
            lat = sum(p[1] for p in ring[:-1]) / (len(ring) - 1)
            stop["lonlat"] = [round(lon, 6), round(lat, 6)]
            props.update({"osm": f"way/{el['id']}", "tags": el.get("tags", {})})
            features.append({"type": "Feature", "properties": {**props, "kind": "footprint"}, "geometry": {"type": "Polygon", "coordinates": [ring]}})
        elif stop["osm"]:
            props["osm"] = f"{stop['osm'][0]}/{stop['osm'][1]}"
        features.append({"type": "Feature", "properties": {**props, "kind": "anchor"}, "geometry": {"type": "Point", "coordinates": stop["lonlat"]}})
    # The old climbing kiln sits in the pottery market, west of the museum (approximate).
    features.append({"type": "Feature", "properties": {"id": "bat-trang-kiln", "name": "Lò bầu cổ · chợ gốm Bát Tràng", "order": 1, "approx": True, "osm": "node/4712969789", "kind": "anchor"}, "geometry": {"type": "Point", "coordinates": [105.91178, 20.97502]}})
    (ROOT / "data" / "sites.geojson").write_text(json.dumps({"type": "FeatureCollection", "attribution": "© OpenStreetMap contributors, ODbL", "features": features}, ensure_ascii=False), encoding="utf-8")

    legs = []
    for a, b in zip(STOPS, STOPS[1:]):
        profile = "driving"  # the tour is illustrated by car on every leg
        host = "routed-car/route/v1/driving" if profile == "driving" else "routed-foot/route/v1/foot"
        coords = f"{a['lonlat'][0]},{a['lonlat'][1]};{b['lonlat'][0]},{b['lonlat'][1]}"
        r = get(f"https://routing.openstreetmap.de/{host}/{coords}?overview=full&geometries=geojson&steps=true")
        route = r["routes"][0]
        steps = [
            {"type": s["maneuver"]["type"], "modifier": s["maneuver"].get("modifier"), "name": s.get("name", ""), "distance": round(s["distance"])}
            for s in route["legs"][0]["steps"]
        ]
        legs.append({
            "type": "Feature",
            "properties": {"from": a["id"], "to": b["id"], "mode": profile, "distance_m": round(route["distance"]), "duration_s": round(route["duration"]), "steps": steps},
            "geometry": route["geometry"],
        })
        time.sleep(1.1)
    (ROOT / "data" / "routes.geojson").write_text(json.dumps({"type": "FeatureCollection", "attribution": "Routing: FOSSGIS OSRM (routing.openstreetmap.de), data © OpenStreetMap contributors", "features": legs}, ensure_ascii=False), encoding="utf-8")
    for leg in legs:
        p = leg["properties"]
        print(p["from"], "->", p["to"], p["mode"], p["distance_m"], "m", p["duration_s"] // 60, "min", len(p["steps"]), "steps")

    # Old Quarter guild streets ("Hàng ...") for the Phố Cổ chapter overlay.
    res = overpass('[out:json][timeout:90];way["highway"]["name"~"^(Phố )?(Hàng [^ ]+|Tạ Hiện|Mã Mây|Lương Văn Can|Lãn Ông|Chả Cá)$"](21.0300,105.8455,21.0395,105.8560);out geom tags;')
    streets = [
        {"type": "Feature", "properties": {"name": e["tags"]["name"]}, "geometry": {"type": "LineString", "coordinates": [[p["lon"], p["lat"]] for p in e["geometry"]]}}
        for e in res["elements"]
    ]
    (ROOT / "data" / "old-quarter.geojson").write_text(json.dumps({"type": "FeatureCollection", "attribution": "© OpenStreetMap contributors, ODbL", "features": streets}, ensure_ascii=False), encoding="utf-8")
    print(len(streets), "old quarter street segments")

    # Hồ Hoàn Kiếm outline (relation 198437) for the animated water around Tháp Rùa.
    res = overpass("[out:json][timeout:90];relation(198437);out geom;")
    rel = res["elements"][0]

    def stitch(ways):
        ways = [list(w) for w in ways]
        rings = []
        while ways:
            ring = ways.pop(0)
            while ring[0] != ring[-1] and ways:
                for i, w in enumerate(ways):
                    if w[0] == ring[-1]: ring += w[1:]
                    elif w[-1] == ring[-1]: ring += w[::-1][1:]
                    elif w[-1] == ring[0]: ring = w[:-1] + ring
                    elif w[0] == ring[0]: ring = w[::-1][:-1] + ring
                    else: continue
                    ways.pop(i)
                    break
                else:
                    break
            rings.append(ring)
        return rings

    pts = lambda m: [[p["lon"], p["lat"]] for p in m["geometry"]]
    outer = stitch([pts(m) for m in rel["members"] if m["type"] == "way" and m.get("role") == "outer"])
    inner = stitch([pts(m) for m in rel["members"] if m["type"] == "way" and m.get("role") == "inner"])
    outer.sort(key=len, reverse=True)
    lake = {"type": "Feature", "properties": {"name": "Hồ Hoàn Kiếm", "osm": "relation/198437"}, "geometry": {"type": "Polygon", "coordinates": [outer[0], *inner]}}
    (ROOT / "data" / "lake.geojson").write_text(json.dumps({"type": "FeatureCollection", "attribution": "© OpenStreetMap contributors, ODbL", "features": [lake]}, ensure_ascii=False), encoding="utf-8")
    print("lake ring points:", len(outer[0]), "islands:", len(inner))


if __name__ == "__main__":
    main()
