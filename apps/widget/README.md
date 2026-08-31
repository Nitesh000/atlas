# @thecodingant/atlas-widget

Embeddable AI Chat Widget for your Atlas RAG pipeline.

## Installation

```bash
npm install @thecodingant/atlas-widget
```

## Usage

You can use the widget in two ways: via a direct `<script>` tag, or via NPM.

### 1. Via NPM (React/Vue/Vanilla JS)

Import the package and initialize it with your configuration:

```javascript
import "@thecodingant/atlas-widget";

// Initialize the widget
window.AtlasWidget.init({
  org: "your-organization-uuid", // Required
  layout: "floating",            // 'floating', 'sidebar', or 'bottom'
  primary: "#3b82f6",            // Custom HEX color
  host: "https://atlas.thecodingant.in"
});
```

### 2. Via Script Tag (HTML)

Place this right before your closing `</body>` tag:

```html
<script 
  src="https://atlas.thecodingant.in/embed.js"
  data-org="your-organization-uuid"
  data-layout="floating"
  data-primary="#3b82f6"
></script>
```

## Configuration Options

| Option | HTML Attribute | Description | Default |
|--------|----------------|-------------|---------|
| `org` | `data-org` | **Required.** Your Organization ID | - |
| `layout` | `data-layout` | Widget style (`floating`, `sidebar`, `bottom`) | `floating` |
| `theme` | `data-theme` | `light`, `dark`, or `system` | `system` |
| `primary` | `data-primary` | Hex color code for branding | `#9333ea` |
| `radius` | `data-radius` | Border radius (e.g. `0.5rem`) | `0.5rem` |
