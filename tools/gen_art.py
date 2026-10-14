import json
import sys
import time
from pathlib import Path

import torch
from diffusers import StableDiffusionXLPipeline, EulerAncestralDiscreteScheduler

ROOT = Path(r"C:\thirteenth-bell")
MANIFEST = ROOT / "tools" / "art_manifest.json"
RAW = ROOT / "assets" / "_versions" / "generated_raw"

MODEL = "cagliostrolab/animagine-xl-3.1"


def load_pipe():
    pipe = StableDiffusionXLPipeline.from_pretrained(
        MODEL, torch_dtype=torch.float16, use_safetensors=True
    )
    pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
    pipe.to("cuda")
    pipe.set_progress_bar_config(disable=True)
    return pipe


def main():
    only = None
    seed_bump = 0
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--only" and i + 1 < len(args):
            only = set(args[i + 1].split(","))
            i += 2
        elif args[i] == "--seed-bump" and i + 1 < len(args):
            seed_bump = int(args[i + 1])
            i += 2
        else:
            i += 1

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    suffix = manifest["style_suffix"]
    suffix_obj = manifest.get("style_suffix_obj", suffix)
    negative = manifest["negative"]
    RAW.mkdir(parents=True, exist_ok=True)

    pipe = load_pipe()
    print("model loaded:", MODEL, flush=True)

    for a in manifest["assets"]:
        if only and a["id"] not in only:
            continue
        t0 = time.time()
        seed = a["seed"] + seed_bump
        generator = torch.Generator("cuda").manual_seed(seed)
        image = pipe(
            prompt=a["prompt"] + (suffix_obj if a["kind"] == "obj" else suffix),
            negative_prompt=negative,
            width=a["w"],
            height=a["h"],
            num_inference_steps=a.get("steps", 28),
            guidance_scale=a.get("cfg", 5.5),
            generator=generator,
        ).images[0]
        out = RAW / (a["id"] + ".png")
        image.save(out)
        print("{0} seed={1} {2}x{3} {4:.1f}s".format(a["id"], seed, a["w"], a["h"], time.time() - t0), flush=True)

    print("done", flush=True)


if __name__ == "__main__":
    main()
