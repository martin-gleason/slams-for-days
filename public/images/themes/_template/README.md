# Bring Your Own Images (BYOI)

Add your own theme by creating a new directory here alongside the existing themes.

## Steps

1. Create a new directory with your theme key (e.g., `mytheme/`)
2. Add 2-3 images (JPEG or PNG) to the directory
3. Add a matching theme entry to your `slams.json`:

```json
"mytheme": {
  "label": "My Theme",
  "images": ["image1.jpg", "image2.png"],
  "accent": "#FF6B35"
}
```

4. Reference the theme key in your slams:

```json
{ "day": 1, "roast": "Your roast here", "theme": "mytheme", "accent": "#FF6B35", "tags": [] }
```

## Guidelines

- Keep images under 50KB each for fast loading
- Use 2-3 images per theme (corners + bottom decoration)
- Filenames in the JSON must exactly match the files in the directory
- Supported formats: `.jpg`, `.jpeg`, `.png`

See [CONTRIBUTING.md](../../../../CONTRIBUTING.md) for full instructions on submitting themes via PR.
