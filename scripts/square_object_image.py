#!/usr/bin/env python3
"""
Make a square image for a Life on an Exoplanet Clicker object from a picture of
any shape, so the whole subject stays in view inside the square (or the circle
generators are cropped to). Nothing is cut off and nothing is stretched:

- the full picture is fitted inside the square (like CSS object-fit: contain)
- the empty bands are filled with a blurred, darkened, enlarged copy of the same
  picture, so they read as more of the scene instead of black bars
- the edges of the fitted picture are feathered into the blur, so there is no seam

Usage:
    python scripts/square_object_image.py SOURCE OUTPUT.webp
    python scripts/square_object_image.py SOURCE OUTPUT.webp --size 1024 --inset 0.85

--inset shrinks the fitted picture (0.85 = 85% of the square) to leave margin, which
helps when a wide subject has to fit in a circle's narrower corners.
"""
import argparse

from PIL import Image, ImageEnhance, ImageFilter


def make_square(source, size, inset, blur, dim, feather):
    img = Image.open(source).convert('RGB')

    # Backdrop: the picture scaled to cover the square, blurred and darkened.
    cover = max(size / img.width, size / img.height)
    backdrop = img.resize((round(img.width * cover), round(img.height * cover)), Image.LANCZOS)
    left, top = (backdrop.width - size) // 2, (backdrop.height - size) // 2
    backdrop = backdrop.crop((left, top, left + size, top + size))
    backdrop = backdrop.filter(ImageFilter.GaussianBlur(blur * size / 1024))
    backdrop = ImageEnhance.Brightness(backdrop).enhance(dim)

    # Foreground: the whole picture, fitted inside the (inset) square.
    fit = min(size * inset / img.width, size * inset / img.height)
    fg = img.resize((round(img.width * fit), round(img.height * fit)), Image.LANCZOS)

    # Feather the edges that touch the backdrop so the two blend smoothly.
    mask = Image.new('L', fg.size, 255)
    px = mask.load()
    ramp = max(1, round(min(fg.size) * feather))
    for y in range(fg.height):
        for x in range(fg.width):
            edge = min(x, y, fg.width - 1 - x, fg.height - 1 - y)
            if edge < ramp:
                px[x, y] = round(255 * edge / ramp)
    backdrop.paste(fg, ((size - fg.width) // 2, (size - fg.height) // 2), mask)
    return backdrop


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('source')
    parser.add_argument('output')
    parser.add_argument('--size', type=int, default=1024, help='side of the square in px (default 1024)')
    parser.add_argument('--inset', type=float, default=1.0, help='fraction of the square the picture fills (default 1.0)')
    parser.add_argument('--blur', type=float, default=40, help='backdrop blur radius at 1024px (default 40)')
    parser.add_argument('--dim', type=float, default=0.7, help='backdrop brightness (default 0.7)')
    parser.add_argument('--feather', type=float, default=0.08, help='edge blend as a fraction of the smaller side (default 0.08)')
    parser.add_argument('--quality', type=int, default=85)
    args = parser.parse_args()

    square = make_square(args.source, args.size, args.inset, args.blur, args.dim, args.feather)
    square.save(args.output, quality=args.quality)
    print(f'Wrote {args.output} ({args.size}x{args.size})')


if __name__ == '__main__':
    main()
