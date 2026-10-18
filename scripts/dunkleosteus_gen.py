"""
Generate static/models/dunkleosteus.glb — procedural Dunkleosteus for Three.js GLTFLoader.

Run: python scripts/dunkleosteus_gen.py
Requires: numpy, Pillow (stdlib struct/json only otherwise).
"""
from __future__ import annotations

import json
import struct
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "static" / "models" / "dunkleosteus.glb"


def radius_profile(t: float) -> float:
    """t in [0,1] nose -> tail."""
    if t < 0.12:
        return 0.55 + 0.45 * (t / 0.12)
    if t < 0.28:
        return 1.0 - 0.15 * ((t - 0.12) / 0.16)
    if t < 0.55:
        return 0.85 - 0.35 * ((t - 0.28) / 0.27)
    if t < 0.82:
        return 0.5 - 0.35 * ((t - 0.55) / 0.27)
    return max(0.02, 0.15 - 0.13 * ((t - 0.82) / 0.18))


def spine_z(t: float) -> float:
    return 1.85 - t * 4.35


def build_body_mesh(n_rings: int = 36, n_sides: int = 28):
    verts = []
    uvs = []
    for ri in range(n_rings):
        t = ri / (n_rings - 1)
        z = spine_z(t)
        r = radius_profile(t)
        y_scale = 0.78 if t < 0.3 else 0.88
        x_scale = 1.15 if t < 0.32 else 1.0
        for si in range(n_sides):
            ang = 2 * math.pi * si / n_sides
            x = r * math.cos(ang) * x_scale
            y = r * math.sin(ang) * y_scale
            if t < 0.22 and y > 0:
                x *= 1.08
            verts.append((x, y, z))
            u = si / n_sides
            v = t
            uvs.append((u, 1.0 - v))

    indices = []
    for ri in range(n_rings - 1):
        for si in range(n_sides):
            si2 = (si + 1) % n_sides
            a = ri * n_sides + si
            b = ri * n_sides + si2
            c = (ri + 1) * n_sides + si
            d = (ri + 1) * n_sides + si2
            indices.extend([a, c, b, b, c, d])

    return np.array(verts, dtype=np.float32), np.array(uvs, dtype=np.float32), np.array(indices, dtype=np.uint32)


def build_jaw_mesh():
    """Lower gnathal plate — hinged under the armored snout."""
    rings = 10
    sides = 16
    verts = []
    uvs = []
    for ri in range(rings):
        t = ri / (rings - 1)
        z = 1.55 - t * 0.95
        r = 0.35 + 0.25 * math.sin(t * math.pi) * (1 - t * 0.4)
        y_base = -0.22 - t * 0.35
        for si in range(sides):
            ang = math.pi * 0.15 + (math.pi * 0.7) * si / (sides - 1)
            x = r * math.cos(ang) * 1.1
            y = y_base + r * math.sin(ang) * 0.55
            verts.append((x, y, z))
            uvs.append((si / sides, t * 0.35))
    indices = []
    n = sides
    for ri in range(rings - 1):
        for si in range(sides - 1):
            a = ri * sides + si
            b = ri * sides + si + 1
            c = (ri + 1) * sides + si
            d = (ri + 1) * sides + si + 1
            indices.extend([a, c, b, b, c, d])
    return np.array(verts, dtype=np.float32), np.array(uvs, dtype=np.float32), np.array(indices, dtype=np.uint32)


def add_fin(verts_list, uvs_list, idx_list, base_offset, side: float, z0: float):
    """Simple pectoral fin (side = -1 left, +1 right)."""
    w, h = 0.55, 0.35
    z1 = z0 - 0.15
    quad = [
        (0.05 * side, -0.05, z0),
        (w * side, -0.12, z1),
        (0.85 * w * side, -0.28, z1 - 0.08),
        (0.1 * side, -0.18, z0 - 0.05),
    ]
    start = base_offset
    for i, (x, y, z) in enumerate(quad):
        verts_list.append((x, y, z))
        uvs_list.append((0.2 + 0.15 * i, 0.55 + 0.1 * side))
    idx_list.extend(
        [start, start + 1, start + 2, start, start + 2, start + 3]
    )


def compute_normals(verts: np.ndarray, indices: np.ndarray) -> np.ndarray:
    normals = np.zeros_like(verts)
    for i in range(0, len(indices), 3):
        ia, ib, ic = indices[i : i + 3]
        v0, v1, v2 = verts[ia], verts[ib], verts[ic]
        n = np.cross(v1 - v0, v2 - v0)
        ln = np.linalg.norm(n)
        if ln > 1e-8:
            n /= ln
        normals[ia] += n
        normals[ib] += n
        normals[ic] += n
    lens = np.linalg.norm(normals, axis=1, keepdims=True)
    lens = np.maximum(lens, 1e-8)
    return (normals / lens).astype(np.float32)


def swim_morph_delta(verts: np.ndarray, amount: float) -> np.ndarray:
    """Subtle lateral wave for morph target."""
    out = np.zeros_like(verts)
    for i, (x, y, z) in enumerate(verts):
        t = (1.85 - z) / 4.35
        if t < 0.15:
            continue
        wave = math.sin(t * math.pi * 3) * 0.06 * amount
        out[i] = (wave, 0.0, 0.0)
    return out.astype(np.float32)


def make_skin_texture(size: int = 512) -> bytes:
    img = Image.new("RGB", (size, size), (42, 28, 38))
    draw = ImageDraw.Draw(img)
    for _ in range(800):
        x = np.random.randint(0, size)
        y = np.random.randint(int(size * 0.35), size)
        r = np.random.randint(4, 28)
        color = (
            int(np.random.randint(55, 95)),
            int(np.random.randint(30, 55)),
            int(np.random.randint(45, 75)),
        )
        draw.ellipse((x - r, y - r, x + r, y + r), fill=color)
    for _ in range(400):
        x = np.random.randint(0, size)
        y = np.random.randint(int(size * 0.35), size)
        r = np.random.randint(2, 12)
        draw.ellipse(
            (x - r, y - r, x + r, y + r),
            fill=(int(np.random.randint(120, 170)), int(np.random.randint(90, 130)), int(np.random.randint(100, 140))),
        )
    armor = Image.new("RGB", (size, int(size * 0.38)), (28, 30, 34))
    ad = ImageDraw.Draw(armor)
    for row in range(8):
        for col in range(12):
            x0 = col * (size // 12) + (row % 2) * 8
            y0 = row * (int(size * 0.38) // 8)
            ad.polygon(
                [
                    (x0, y0),
                    (x0 + size // 12, y0 + 6),
                    (x0 + size // 12 - 4, y0 + int(size * 0.38) // 8),
                    (x0 - 4, y0 + int(size * 0.38) // 8 - 6),
                ],
                fill=(45 + row * 2, 42 + row, 38 + row),
            )
    armor = armor.filter(ImageFilter.GaussianBlur(radius=0.6))
    img.paste(armor, (0, 0))
    img = img.filter(ImageFilter.GaussianBlur(radius=0.4))
    import io

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def pack_glb(gltf: dict, bin_blob: bytes) -> bytes:
    json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    json_pad = (4 - len(json_bytes) % 4) % 4
    json_bytes += b" " * json_pad
    bin_pad = (4 - len(bin_blob) % 4) % 4
    bin_blob_padded = bin_blob + b"\x00" * bin_pad
    total = 12 + 8 + len(json_bytes) + 8 + len(bin_blob_padded)
    out = bytearray()
    out += struct.pack("<4sII", b"glTF", 2, total)
    out += struct.pack("<I4s", len(json_bytes), b"JSON")
    out += json_bytes
    out += struct.pack("<I4s", len(bin_blob_padded), b"BIN\x00")
    out += bin_blob_padded
    return bytes(out)


def append_buffer(bin_parts: list, data: bytes, target: int | None = 34962) -> dict:
    offset = sum(len(p) for p in bin_parts)
    bin_parts.append(data)
    bv: dict = {"buffer": 0, "byteOffset": offset, "byteLength": len(data)}
    if target is not None:
        bv["target"] = target
    return bv


def append_accessor(bin_parts, arr, accessor_type, component_type, count, target=34962, dims=1, bv_target=34962):
    if arr.dtype == np.float32:
        comp = 5126
        raw = arr.tobytes()
    elif arr.dtype == np.uint32:
        comp = 5125
        raw = arr.tobytes()
    elif arr.dtype == np.uint16:
        comp = 5123
        raw = arr.tobytes()
    else:
        raise ValueError(arr.dtype)
    bv = append_buffer(bin_parts, raw, bv_target)
    acc = {
        "bufferView": len(bin_parts) - 1,
        "componentType": comp,
        "count": count,
        "type": accessor_type,
    }
    if accessor_type != "SCALAR":
        acc["max"] = arr.reshape(-1, dims).max(axis=0).tolist()
        acc["min"] = arr.reshape(-1, dims).min(axis=0).tolist()
    return acc


def build_gltf() -> bytes:
    body_v, body_uv, body_idx = build_body_mesh()
    jaw_v, jaw_uv, jaw_idx = build_jaw_mesh()

    body_fin_verts = list(body_v)
    body_fin_uvs = list(body_uv)
    body_fin_idx = list(body_idx)
    add_fin(body_fin_verts, body_fin_uvs, body_fin_idx, len(body_v), -1.0, 0.55)
    add_fin(body_fin_verts, body_fin_uvs, body_fin_idx, len(body_fin_verts), 1.0, 0.55)
    body_v = np.array(body_fin_verts, dtype=np.float32)
    body_uv = np.array(body_fin_uvs, dtype=np.float32)
    body_idx = np.array(body_fin_idx, dtype=np.uint32)

    body_n = compute_normals(body_v, body_idx)
    jaw_n = compute_normals(jaw_v, jaw_idx)
    morph_pos = swim_morph_delta(body_v, 1.0)

    png_bytes = make_skin_texture()

    bin_parts: list[bytes] = []

    body_pos_acc = append_accessor(bin_parts, body_v, "VEC3", None, len(body_v), dims=3)
    body_n_acc = append_accessor(bin_parts, body_n, "VEC3", None, len(body_n), dims=3)
    body_uv_acc = append_accessor(bin_parts, body_uv, "VEC2", None, len(body_uv), dims=2)
    body_idx_acc = append_accessor(bin_parts, body_idx, "SCALAR", None, len(body_idx), bv_target=34963)
    morph_acc = append_accessor(bin_parts, morph_pos, "VEC3", None, len(morph_pos), dims=3)
    jaw_pos_acc = append_accessor(bin_parts, jaw_v, "VEC3", None, len(jaw_v), dims=3)
    jaw_n_acc = append_accessor(bin_parts, jaw_n, "VEC3", None, len(jaw_n), dims=3)
    jaw_uv_acc = append_accessor(bin_parts, jaw_uv, "VEC2", None, len(jaw_uv), dims=2)
    jaw_idx_acc = append_accessor(bin_parts, jaw_idx, "SCALAR", None, len(jaw_idx), bv_target=34963)

    # Animation keyframes — 3s loop
    times = np.array([0.0, 0.75, 1.5, 2.25, 3.0], dtype=np.float32)
    jaw_rot = []
    for t in times:
        phase = (t / 3.0) * 2 * math.pi
        angle = 0.22 + 0.18 * (0.5 + 0.5 * math.sin(phase * 2))
        # quaternion for rotation around X
        jaw_rot.extend([math.sin(angle / 2), 0.0, 0.0, math.cos(angle / 2)])
    jaw_rot = np.array(jaw_rot, dtype=np.float32)

    root_rot = []
    for t in times:
        phase = (t / 3.0) * 2 * math.pi
        angle = 0.06 * math.sin(phase)
        root_rot.extend([0.0, math.sin(angle / 2), 0.0, math.cos(angle / 2)])
    root_rot = np.array(root_rot, dtype=np.float32)

    morph_w = []
    for t in times:
        phase = (t / 3.0) * 2 * math.pi
        morph_w.append(0.35 + 0.35 * (0.5 + 0.5 * math.sin(phase)))
    morph_w = np.array(morph_w, dtype=np.float32)

    time_acc = append_accessor(bin_parts, times, "SCALAR", None, len(times))
    jaw_rot_acc = append_accessor(bin_parts, jaw_rot, "VEC4", None, len(times), dims=4)
    root_rot_acc = append_accessor(bin_parts, root_rot, "VEC4", None, len(times), dims=4)
    morph_w_acc = append_accessor(bin_parts, morph_w, "SCALAR", None, len(morph_w))

    append_buffer(bin_parts, png_bytes, target=None)

    bin_blob = b"".join(bin_parts)
    buffer_views = []
    offset = 0
    for i, part in enumerate(bin_parts):
        bv = {"buffer": 0, "byteOffset": offset, "byteLength": len(part)}
        if part is not png_bytes:
            bv["target"] = 34963 if i in (3, 8) else 34962
        buffer_views.append(bv)
        offset += len(part)

    gltf = {
        "asset": {"version": "2.0", "generator": "dunkleosteus_gen.py"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [
            {"name": "Dunkleosteus", "children": [1, 2], "rotation": [0, 0, 0, 1]},
            {
                "name": "Body",
                "mesh": 0,
                "rotation": [0, 0, 0, 1],
                "translation": [0, 0, 0],
            },
            {
                "name": "Jaw",
                "mesh": 1,
                "translation": [0.0, -0.18, 1.35],
                "rotation": [0, 0, 0, 1],
            },
        ],
        "meshes": [
            {
                "name": "Body",
                "primitives": [
                    {
                        "attributes": {"POSITION": 0, "NORMAL": 1, "TEXCOORD_0": 2},
                        "indices": 3,
                        "material": 0,
                        "targets": [{"POSITION": 4}],
                    }
                ],
                "weights": [0.0],
            },
            {
                "name": "Jaw",
                "primitives": [
                    {
                        "attributes": {"POSITION": 5, "NORMAL": 6, "TEXCOORD_0": 7},
                        "indices": 8,
                        "material": 0,
                    }
                ],
            },
        ],
        "materials": [
            {
                "name": "DunkSkin",
                "pbrMetallicRoughness": {
                    "baseColorTexture": {"index": 0},
                    "metallicFactor": 0.05,
                    "roughnessFactor": 0.82,
                },
            }
        ],
        "textures": [{"source": 0, "sampler": 0}],
        "images": [{"bufferView": len(buffer_views) - 1, "mimeType": "image/png"}],
        "samplers": [{"magFilter": 9729, "minFilter": 9987, "wrapS": 10497, "wrapT": 10497}],
        "accessors": [
            body_pos_acc,
            body_n_acc,
            body_uv_acc,
            body_idx_acc,
            morph_acc,
            jaw_pos_acc,
            jaw_n_acc,
            jaw_uv_acc,
            jaw_idx_acc,
            time_acc,
            jaw_rot_acc,
            root_rot_acc,
            morph_w_acc,
        ],
        "bufferViews": buffer_views,
        "buffers": [{"byteLength": len(bin_blob)}],
        "animations": [
            {
                "name": "Swim",
                "samplers": [
                    {"input": 9, "output": 10, "interpolation": "LINEAR"},
                    {"input": 9, "output": 11, "interpolation": "LINEAR"},
                    {"input": 9, "output": 12, "interpolation": "LINEAR"},
                ],
                "channels": [
                    {"sampler": 0, "target": {"node": 2, "path": "rotation"}},
                    {"sampler": 1, "target": {"node": 0, "path": "rotation"}},
                    {"sampler": 2, "target": {"node": 1, "path": "weights"}},
                ],
            }
        ],
    }

    for i in range(len(gltf["accessors"])):
        gltf["accessors"][i]["bufferView"] = i
    gltf["images"][0]["bufferView"] = len(bin_parts) - 1

    return pack_glb(gltf, bin_blob)


def main():
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    glb = build_gltf()
    OUT_PATH.write_bytes(glb)
    if b"\xef\xbf\xbd" in glb:
        raise SystemExit("Generated GLB contains UTF-8 corruption — aborting")
    magic, version, length = struct.unpack("<4sII", glb[:12])
    assert magic == b"glTF" and version == 2 and length == len(glb)
    print(f"Wrote {OUT_PATH} ({len(glb)} bytes)")


if __name__ == "__main__":
    main()
