# Generates BorrowCircle app icons as PNGs without external dependencies.
# Draws the BorrowCircle mark: two overlapping rings on the deep-green brand
# background (icon.png) and on transparency (splash logo).
import struct, zlib, os

def write_png(path, width, height, pixels):
    # pixels: list of rows, each row list of (r,g,b,a)
    raw = b''
    for row in pixels:
        raw += b'\x00' + b''.join(struct.pack('BBBB', *px) for px in row)
    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        c += struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
        return c
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(raw, 9))
    png += chunk(b'IEND', b'')
    with open(path, 'wb') as f:
        f.write(png)
    print('wrote', path)

DEEP = (13, 59, 48, 255)      # #0D3B30
WHITE = (250, 249, 246, 255)  # off-white
CLEAR = (0, 0, 0, 0)

def draw_rings(size, background, stroke, ring_alpha=255):
    stroke = max(4, size // 24)
    r = size * 0.22
    cy = size * 0.5
    cx1, cx2 = size * 0.40, size * 0.60
    px = []
    for y in range(size):
        row = []
        for x in range(size):
            color = background
            d1 = ((x - cx1) ** 2 + (y - cy) ** 2) ** 0.5
            d2 = ((x - cx2) ** 2 + (y - cy) ** 2) ** 0.5
            on_ring = abs(d1 - r) < stroke / 2 or abs(d2 - r) < stroke / 2
            if on_ring:
                # left ring brand-green on light bg, off-white on dark bg
                c = stroke_color
                if background[3] == 0:
                    row.append((c[0], c[1], c[2], 255))
                    continue
                color = c
            row.append(color)
        px.append(row)
    return px

if __name__ == '__main__':
    out = os.path.join(os.path.dirname(__file__), '..', 'apps', 'mobile', 'assets')
    os.makedirs(out, exist_ok=True)

    # App icon: deep green bg, off-white rings
    global stroke_color
    stroke_color = (250, 249, 246, 255)
    write_png(os.path.join(out, 'icon.png'), 1024, 1024, draw_rings(1024, DEEP, WHITE))
    write_png(os.path.join(out, 'adaptive-icon.png'), 1024, 1024, draw_rings(1024, DEEP, WHITE))

    # Splash logo: transparent bg, off-white rings (shown on the deep-green splash)
    write_png(os.path.join(out, 'splash-icon.png'), 512, 512, draw_rings(512, CLEAR, WHITE))
