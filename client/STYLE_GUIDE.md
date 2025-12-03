# Street Art CTF - Design System

## Philosophy
**Typography-first. Motion-driven. No clutter.**

The design prioritizes bold typography and smooth animations over icons and decorative elements. Every element earns its place through function, not decoration.

---

## Colors

### Backgrounds
- **Primary**: `#FAFAFA` - Off-white, easy on the eyes
- **Team Red**: `#E53935` - Bold, energetic red
- **Team Blue**: `#1E88E5` - Strong, confident blue

### Text
- **Primary**: `#000000` - Pure black for headlines
- **Secondary**: `rgba(0,0,0,0.5)` - Body text
- **Muted**: `rgba(0,0,0,0.4)` - Labels, hints
- **Ghost**: `rgba(0,0,0,0.1)` - Large decorative numbers

### On Dark/Colored Backgrounds
- **Primary**: `#FFFFFF`
- **Secondary**: `rgba(255,255,255,0.6)`
- **Muted**: `rgba(255,255,255,0.5)`

---

## Typography

### Font Family
**Nohemi** - Variable weight (100-900)
```css
font-family: 'Nohemi', sans-serif;
```

### Scale
| Element | Size | Weight | Tracking |
|---------|------|--------|----------|
| Hero Title | 3.5rem (56px) | Bold (700) | tight (-0.02em) |
| Page Title | 2.5rem (40px) | Bold (700) | tight |
| Section Title | 1.5rem (24px) | Bold (700) | normal |
| Body Large | 1.125rem (18px) | Regular (400) | normal |
| Body | 1rem (16px) | Regular (400) | normal |
| Label | 0.875rem (14px) | Regular (400) | widest (0.1em) |
| Caption | 0.75rem (12px) | Regular (400) | normal |

### Special Styles
- **Labels/Overlines**: ALL CAPS, letter-spacing: 0.1em, color: black/40%
- **Large Numbers**: font-weight: 900 (Black), color: black/10%

---

## Spacing

Use a 4px base unit:
- `4px` - Micro gaps
- `8px` - Tight spacing
- `16px` - Default padding
- `24px` - Section padding
- `32px` - Large gaps
- `48px` - Section separation

### Page Padding
```css
padding: 24px; /* 6 in Tailwind */
padding-top: 64px; /* Account for status bar */
```

---

## Components

### Buttons
**Primary (Default)**
```css
background: #000000;
color: #FFFFFF;
padding: 20px;
font-weight: 700;
font-size: 18px;
letter-spacing: 0.05em;
/* NO border-radius - sharp edges */
```

**Primary (On Color)**
```css
background: #FFFFFF;
color: #000000;
```

**Disabled**
```css
background: rgba(0,0,0,0.1);
color: rgba(0,0,0,0.3);
```

### Inputs
```css
background: transparent;
border: none;
border-bottom: 2px solid rgba(0,0,0,0.2);
padding: 16px 0;
font-size: 1.875rem; /* 30px */
font-weight: 700;
/* Focus: border-color: #000000 */
```

### Progress Bar
```css
height: 4px;
background: rgba(0,0,0,0.05);
/* Fill: background: #000000 */
```

### Cards (if needed)
```css
background: rgba(0,0,0,0.03);
border: 1px solid rgba(0,0,0,0.08);
padding: 24px;
/* NO border-radius */
```

---

## Animation

### Principles
1. **Stagger content** - Elements appear one after another
2. **Direction matters** - Enter from right, exit to left (forward flow)
3. **Spring physics** - Use spring animations for emphasis
4. **Letter/word animations** - Break up text for dynamic reveals

### Timing
- **Fast**: 200-300ms (micro-interactions)
- **Normal**: 400ms (page transitions)
- **Slow**: 600-800ms (emphasis reveals)
- **Stagger delay**: 40-80ms between items

### Common Patterns

**Letter Animation**
```jsx
{text.split('').map((char, i) => (
  <motion.span
    initial={{ opacity: 0, y: 40, rotate: -10 }}
    animate={{ opacity: 1, y: 0, rotate: 0 }}
    transition={{ 
      delay: i * 0.04,
      type: 'spring',
      stiffness: 200
    }}
  >
    {char}
  </motion.span>
))}
```

**Word Animation**
```jsx
{text.split(' ').map((word, i) => (
  <motion.span
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.08 }}
  >
    {word}
  </motion.span>
))}
```

**Page Transition**
```jsx
initial={{ opacity: 0, x: 100 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -100 }}
transition={{ duration: 0.4 }}
```

**Staggered List**
```jsx
{items.map((item, i) => (
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.2 + i * 0.15 }}
  >
    {item}
  </motion.div>
))}
```

---

## Layout Patterns

### Full-Screen Section
```jsx
<div className="h-screen bg-[#FAFAFA] flex flex-col font-nohemi">
  {/* Content */}
</div>
```

### Centered Content
```jsx
<div className="flex-1 flex flex-col justify-center p-6">
  {/* Content */}
</div>
```

### Stats Row
```jsx
<div className="flex gap-8 text-sm text-black/40">
  <div>
    <div className="text-2xl font-bold text-black">45+</div>
    <div>locations</div>
  </div>
  {/* More stats */}
</div>
```

### Numbered List
```jsx
<div className="flex gap-5">
  <div className="text-5xl font-black text-black/10">1</div>
  <div>
    <h3 className="text-xl font-bold text-black mb-1">Title</h3>
    <p className="text-black/50">Description</p>
  </div>
</div>
```

---

## Do's and Don'ts

### Do
- Use bold typography as the main visual element
- Animate text reveals for impact
- Keep backgrounds clean and minimal
- Use color for team identity only
- Let whitespace breathe

### Don't
- Add icons unless absolutely necessary
- Use rounded corners (stay sharp)
- Clutter with decorative elements
- Use more than 2-3 colors per screen
- Over-animate (purposeful motion only)

---

## Tailwind Classes Reference

```jsx
// Font
className="font-nohemi"

// Backgrounds
className="bg-[#FAFAFA]"
className="bg-black"

// Text colors
className="text-black"
className="text-black/50"
className="text-black/40"
className="text-black/10"

// Typography
className="text-[3.5rem] leading-[0.95] font-bold tracking-tight"
className="text-sm tracking-widest text-black/40" // Labels

// Spacing
className="p-6"
className="mb-8"
className="gap-5"

// Layout
className="flex flex-col justify-center"
className="flex-1"
```
