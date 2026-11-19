# Basant Awasthi: Portfolio

Personal portfolio website. I'm a Ph.D. student in Geography at Louisiana State University working on coastal remote sensing, UAV mapping, and explainable AI for wetland resilience.

**Live site:** https://bawasthi.github.io (published by GitHub Pages from the `master` branch)

## Features
- Animated coastal hero section and count-up stats
- Interactive satellite map of study sites (Leaflet + Esri imagery)
- Project cards with method filters, image sliders, and click-to-zoom
- Searchable, filterable publication list with one-click citation copy
- Mobile menu and layout that works on phones

## Files

| File | What it is |
|---|---|
| `index.html` | Page text: about, research themes, projects, experience, skills |
| `js/data.js` | **Publications, talks, and map study sites** (easiest place to edit) |
| `js/main.js` | Interactive behavior (no need to edit) |
| `css/style.css` | Colors and layout |
| `assets/` | CV, photo, project images |
| `vendor/leaflet/` | Map library (BSD-2 license) |

## How to edit

**Add a publication:** open `js/data.js` on GitHub, click the pencil ✏️, copy one `{ ... }` block, change the text, and click **Commit changes**. The site updates in about a minute.

**Add project photos:** upload images to `assets/projects/` (Add file → Upload files). In `index.html`, find the project and add one line per image inside its `project-media` block:

```html
<img class="project-slide" src="assets/projects/my-photo.jpg" alt="Short description">
```

Two or more images turn into an automatic slideshow.

**Replace the CV:** upload a new PDF named `assets/Basant_Awasthi_CV.pdf`.
