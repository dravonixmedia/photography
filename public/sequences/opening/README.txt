Frames extracted from the provided source video (filmmaker emerging from
darkness -> camera reveal -> push through the lens -> internal tunnel ->
pull back out -> camera flash). 120 frames, 8fps-equivalent sampling from a
15s/24fps/361-frame 4K source, desktop at 1920x1080 and mobile at 960x540.

Regenerate with:
  ffmpeg -i <source.mp4> -vf "fps=8,scale=1920:1080:flags=lanczos" -c:v libwebp -q:v 78 -compression_level 4 public/sequences/opening/desktop/frame_%04d.webp
  ffmpeg -i <source.mp4> -vf "fps=8,scale=960:540:flags=lanczos" -c:v libwebp -q:v 68 -compression_level 4 public/sequences/opening/mobile/frame_%04d.webp
