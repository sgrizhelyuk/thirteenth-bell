import json
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(r"C:\thirteenth-bell")
ASSETS = ROOT / "assets"
VER = ASSETS / "_versions"
RAW = VER / "generated_raw"
SOURCES = VER / "new_sources"
MANUAL = VER / "manual"
PRE_MANUAL = VER / "pre_manual"
MANIFEST = ROOT / "tools" / "art_manifest.json"
TEMP = Path(r"C:\Users\73B5~1\AppData\Local\Temp\opencode")

_sessions = {}


def rembg_session(model):
    if model not in _sessions:
        from rembg import new_session
        _sessions[model] = new_session(model)
    return _sessions[model]


def cut_background(img):
    from rembg import remove
    for model in ("isnet-general-use", "u2net"):
        try:
            out = remove(img, session=rembg_session(model))
            return out
        except Exception as e:
            print("  rembg {0} failed: {1}".format(model, e))
    return img


def clean_alpha(img):
    from scipy import ndimage
    rgba = np.array(img).copy()
    alpha = rgba[:, :, 3]
    alpha[alpha < 60] = 0
    mask = alpha > 0
    lab, n = ndimage.label(mask, structure=np.ones((3, 3), int))
    if n > 1:
        sizes = ndimage.sum(mask, lab, range(1, n + 1))
        keep = (np.argmax(sizes) + 1)
        mask = lab == keep
        alpha = np.where(mask, alpha, 0).astype(np.uint8)
    mask2 = ndimage.binary_fill_holes(alpha > 0)
    alpha = np.where(mask2, alpha, 0).astype(np.uint8)
    rgba[:, :, 3] = alpha
    return Image.fromarray(rgba)


def checker_preview(img, name):
    h = 760
    scaled = img.resize((max(1, int(img.width * h / img.height)), h), Image.LANCZOS)
    comp = Image.new("RGBA", scaled.size, (30, 32, 38, 255))
    for y in range(0, scaled.height, 24):
        for x in range(0, scaled.width, 24):
            if (x // 24 + y // 24) % 2 == 0:
                d = ImageDraw.Draw(comp)
                d.rectangle([x, y, x + 23, y + 23], fill=(44, 47, 55, 255))
    comp.alpha_composite(scaled)
    comp.convert("RGB").save(TEMP / (name + ".png"))


def finalize_one(asset_id, kind, src):
    img = Image.open(src).convert("RGBA")
    if kind in ("char", "obj"):
        img = cut_background(img)
        img = clean_alpha(img)
    elif kind in ("bg", "title"):
        img = img.convert("RGB").resize((1920, 1080), Image.LANCZOS).convert("RGBA")
    alpha = img.getchannel("A")
    bbox = alpha.getbbox()
    if bbox and kind in ("char", "obj"):
        img = img.crop(bbox)
    dst = ASSETS / (asset_id + ".png")
    if dst.exists():
        PRE_MANUAL.mkdir(parents=True, exist_ok=True)
        shutil.copy2(dst, PRE_MANUAL / dst.name)
    img.save(dst)
    checker_preview(img, "fin_" + asset_id)
    print("  ->", dst.name, img.size)
    return img


def cmd_finalize(only=None):
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    for a in manifest["assets"]:
        if only and a["id"] not in only:
            continue
        src = RAW / (a["id"] + ".png")
        if not src.exists():
            print(a["id"], "no raw file, skip")
            continue
        print(a["id"], a["kind"])
        finalize_one(a["id"], a["kind"], src)


def kind_of(name):
    if name.startswith("CH_"):
        return "char"
    if name.startswith("OBJ_"):
        return "obj"
    if name.startswith("BG_") or name.startswith("SC_"):
        return "bg"
    return "copy"


def cmd_sources():
    files = [p for p in SOURCES.iterdir() if p.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")]
    if not files:
        print("new_sources is empty")
        return
    for src in sorted(files):
        asset_id = src.stem
        kind = kind_of(asset_id)
        print(src.name, "->", asset_id, kind)
        img = Image.open(src).convert("RGBA")
        if kind in ("char", "obj"):
            img = cut_background(img)
            img = clean_alpha(img)
            bbox = img.getchannel("A").getbbox()
            if bbox:
                img = img.crop(bbox)
        elif kind == "bg":
            img = img.convert("RGB").resize((1920, 1080), Image.LANCZOS).convert("RGBA")
        dst = ASSETS / (asset_id + ".png")
        if dst.exists():
            PRE_MANUAL.mkdir(parents=True, exist_ok=True)
            shutil.copy2(dst, PRE_MANUAL / dst.name)
        img.save(dst)
        checker_preview(img, "src_" + asset_id)
        print("  ->", dst.name, img.size)


def cmd_manual():
    files = [p for p in MANUAL.iterdir() if p.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp")]
    if not files:
        print("manual is empty")
        return
    for src in sorted(files):
        asset_id = src.stem
        dst = ASSETS / (asset_id + ".png")
        img = Image.open(src).convert("RGBA")
        if dst.exists():
            PRE_MANUAL.mkdir(parents=True, exist_ok=True)
            shutil.copy2(dst, PRE_MANUAL / dst.name)
        img.save(dst)
        checker_preview(img, "man_" + asset_id)
        print(src.name, "->", dst.name, img.size)


def cmd_sheet():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    groups = {"bg": [], "char": [], "obj": []}
    for a in manifest["assets"]:
        p = ASSETS / (a["id"] + ".png")
        if p.exists():
            groups.setdefault(a["kind"], []).append((a["id"], p))
    for kind, items in groups.items():
        if not items:
            continue
        cols = 4 if kind != "obj" else 4
        tw = 340 if kind != "obj" else 220
        rows = (len(items) + cols - 1) // cols
        th = tw * 9 // 16
        sheet = Image.new("RGB", (cols * (tw + 12) + 12, rows * (th + 34) + 12), (24, 26, 32))
        d = ImageDraw.Draw(sheet)
        for idx, (aid, p) in enumerate(items):
            im = Image.open(p).convert("RGBA")
            bg = Image.new("RGBA", im.size, (40, 42, 50, 255))
            bg.alpha_composite(im)
            bg = bg.convert("RGB")
            bg.thumbnail((tw, th), Image.LANCZOS)
            x = 12 + (idx % cols) * (tw + 12)
            y = 12 + (idx // cols) * (th + 34)
            sheet.paste(bg, (x, y))
            d.text((x + 4, y + bg.height + 6), aid, fill=(230, 220, 190))
        out = TEMP / ("sheet_" + kind + ".png")
        sheet.save(out)
        print("sheet:", out)


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "finalize"
    only = None
    if "--only" in sys.argv:
        only = set(sys.argv[sys.argv.index("--only") + 1].split(","))
    if mode == "finalize":
        cmd_finalize(only)
    elif mode == "sources":
        cmd_sources()
    elif mode == "manual":
        cmd_manual()
    elif mode == "sheet":
        cmd_sheet()
    else:
        print("modes: finalize | sources | manual | sheet")
