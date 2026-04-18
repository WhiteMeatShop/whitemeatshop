# Page: Dashboard (Home)

The Dashboard is the hero experience of the app. It features a full-screen interactive 3D CSS scene with a realistic whole roasted chicken at center stage. The chicken's eye tracks the user's mouse cursor with smooth damped movement, creating a living, characterful feel. Behind the chicken, a rotating starburst of product cards orbits continuously. The entire scene has tilt-based parallax responding to mouse movement. Below the 3D scene, summary stat cards provide at-a-glance business metrics. A glassmorphism navigation bar sits at the bottom.

## Page Layout

```
- Section: 3D Hero Scene (100vh, fixed position)
  - Container: 3D-scene (centered, perspective: 1000px)
    - Layer: Starburst Ring (rotating cards in 3D space)
      - 8 Product Cards arranged radially
    - Layer: Chicken (centered, z-index above starburst)
      - Body (base shape)
      - Head (rounded top extension)
      - Wing-left, Wing-right (side shapes)
      - Leg-left, Leg-right (bottom drumsticks)
      - Eye (with tracking pupil)
      - Beak (orange triangle)
      - Comb (red wavy top)
      - Tail feathers (layered fans)
      - Hot air wisp (animated SVG)
- Section: Stats Bar (below 3D scene)
  - 4 Summary Stat Cards in a row
- Section: Quick Actions (below stats)
  - 3 Quick action buttons
- Navigation: Glassmorphism Nav Bar (fixed bottom)
```

## Section: 3D Hero Scene

### Overview
The entire viewport is dedicated to the 3D interactive scene on a dark navy background (#001233). The chicken sits at the center, rendered entirely with CSS 3D transforms and HTML elements. Behind it, 8 product cards orbit in a starburst pattern. The scene responds to mouse movement with both eye-tracking and parallax tilt.

### 3D Scene Container
- Width: 800px (desktop) / 320px (mobile)
- Height: 800px (desktop) / 320px (mobile)
- Margin: auto (centered)
- Perspective: 1000px (enables 3D depth)
- Position: relative
- Contains all 3D elements as absolutely positioned children

### Mouse-Tracking Eye (JavaScript)
- The chicken's eye follows the user's mouse cursor.
- **Mechanism**: A JavaScript mousemove listener calculates the cursor's position relative to the eye element. An angle (0-360deg) and distance are computed. The pupil is translated within the eye socket using these values, with a maximum radius constraint to keep it within the eye.
- **Smoothing**: Movement is damped via lerp (linear interpolation at ~0.15 factor per frame) for organic, fluid motion rather than jerky instant tracking.
- **Gaze Algorithm**:
  ```
  angle = Math.atan2(mouseY - eyeCenterY, mouseX - eyeCenterX) * 180 / Math.PI
  distance = Math.min(maxRadius, Math.hypot(mouseX - eyeCenterX, mouseY - eyeCenterY) / 10)
  pupilX = Math.cos(angle) * distance
  pupilY = Math.sin(angle) * distance
  ```

### Parallax Tilt (CSS :hover)
- On hovering the 3D container, the entire scene tilts subtly toward the cursor.
- Transform: `rotateX(tiltX) rotateY(tiltY)` where tilt values are calculated from mouse position.
- Transition: 0.1s ease-out for smooth return on mouse leave.
- Maximum tilt angles: +/- 5 degrees.

### Chicken Body Parts (All CSS 3D)

#### Body
- Width: 260px (desktop) / 130px (mobile)
- Height: 160px (desktop) / 80px (mobile)
- Background: linear-gradient(180deg, #FF5A00 0%, #FF9E00 100%)
- Border-radius: 60% 60% 50% 50% / 70% 70% 40% 40%
- Position: absolute, centered
- Box-shadow: 0 10px 30px rgba(0,0,0,0.2), inset 0 -10px 20px rgba(0,0,0,0.1), inset 0 10px 20px rgba(255,255,255,0.2)

#### Head
- Width: 100px / 50px
- Height: 100px / 50px
- Background: linear-gradient(180deg, #FF5A00 0%, #FF9E00 100%)
- Border-radius: 50% 50% 45% 45%
- Position: top of body, slightly protruding upward

#### Wings (Left & Right)
- Width: 90px / 45px
- Height: 130px / 65px
- Background: linear-gradient(180deg, #FF5A00 0%, #E65000 100%)
- Border-radius: 50% 20% 50% 20% (left), 20% 50% 20% 50% (right)
- Position: left and right sides of body, angled outward 15 degrees

#### Legs (Left & Right)
- Drumstick shape: oval at top, narrowing to bone at bottom
- Width: 50px / 25px
- Height: 110px / 55px
- Background: linear-gradient(180deg, #FF9E00 0%, #FF5A00 100%)
- Border-radius: 40% 40% 30% 30% / 60% 60% 40% 40%
- Bone knob at bottom: 16px circle, #F0EAD6 color
- Position: bottom of body, angled outward 10 degrees

#### Eye (with tracking pupil)
- Socket: 24px circle, white background
- Position: upper-front of head
- Pupil: 10px circle, black (#000000), centered by default
- Pupil follows mouse via JS translation (see Mouse-Tracking Eye above)
- Glint: 4px white circle positioned top-right of pupil

#### Beak
- Triangle shape: 0 0, 20px 0, 10px 16px
- Background: #FF5A00
- Position: front of head, below eye

#### Comb (on top of head)
- Three connected rounded lobes
- Background: #FF5A00
- Border-radius: 50% 50% 30% 30%
- Width: 60px / 30px
- Height: 30px / 15px
- Position: top of head

#### Tail Feathers
- Three layered fan shapes
- Background: linear-gradient(180deg, #FF9E00 0%, #FF5A00 100%)
- Border-radius: 50% 50% 0 0
- Each feather: 40px wide, 60px tall, fanned at 120deg angles
- Position: back of body

#### Hot Air Wisp (SVG Animation)
- Animated path using stroke-dasharray and stroke-dashoffset
- Creates a rising steam/wisp effect above the chicken
- Stroke: #FF9E00 at 60% opacity
- Animation: 3s linear infinite, wisping upward and fading

### Chicken Animations

#### Idle Bounce
- Animation: translateY oscillation
- Duration: 2s
- Easing: cubic-bezier(0.34, 1.56, 0.64, 1) - slight overshoot for organic bounce
- Loop: infinite alternate
- Movement: 0px to -10px (desktop), 0px to -5px (mobile)

#### Wink (on click)
- Trigger: Click anywhere on the chicken body
- Animation: Eye scaleY squishes to 0.1 then back to 1
- Duration: 200ms
- Easing: ease-in-out
- Plays once per click

### Rotating Starburst Ring

#### Ring Container
- Width: 640px / 320px
- Height: 640px / 320px
- Position: absolute, centered behind chicken
- Transform-style: preserve-3d
- Animation: continuous 360deg rotation over 30s, linear, infinite

#### Product Cards (8 total)
Each card represents a product category. They are arranged radially around the chicken, tilted outward at 45 degrees to create a 3D starburst effect.

- Card dimensions: 150px x 180px / 75px x 90px
- Background: #FF5A00
- Border-radius: 8px
- Transform-style: preserve-3d
- Each card is positioned at: `rotateY(N * 45deg) translateZ(300px)` where N = 0-7
- Counter-rotation: Each card has `rotateY(-N * 45deg)` to face outward
- Content per card:
  - Product image/icon (centered)
  - Product name label at bottom (e.g., "Whole Chicken", "Boneless", "Kaleji", "Karahi Cut", "Wings", "Legs", "Breast", "Mince")
  - Label: White text, 12px, uppercase

#### Card Rotation Animation
- The entire ring rotates continuously
- Cards maintain their outward-facing orientation via counter-rotation
- Cards have a subtle float: translateZ oscillation, 3s ease-in-out infinite alternate

### Responsive Behavior
- Desktop: Full 800px scene, all 8 cards visible
- Mobile: Scaled to 320px scene, 4 cards visible (alternating), chicken and eye scale proportionally
- Touch: On mobile, eye tracks touch position instead of mouse

## Section: Stats Bar

### Overview
Below the 3D scene, a horizontal row of 4 summary stat cards provides key business metrics at a glance. Background transitions to white (#FFFFFF) from this point downward.

### Layout
- Background: #FFFFFF
- Padding: 40px horizontal, 32px vertical
- 4 cards in a row on desktop (1 column x 4 rows on mobile)
- Gap: 24px

### Stat Cards

#### Card: Daily Sales
- **Icon**: "point_of_sale" in orange circle background
- **Label**: "Daily Sales"
- **Value**: Dynamic (e.g., "$1,250.00")
- **Change indicator**: Green arrow up + percentage vs yesterday
- **Style**: Data Card component with orange accent left border

#### Card: Total Credit Outstanding
- **Icon**: "credit_card" in gold circle background
- **Label**: "Credit Outstanding"
- **Value**: Dynamic (e.g., "$3,450.00")
- **Change indicator**: Red arrow up if increasing
- **Style**: Data Card component with gold accent left border

#### Card: Low Stock Items
- **Icon**: "warning" in red circle background
- **Label**: "Low Stock Alert"
- **Value**: Dynamic count (e.g., "3 items")
- **Subtitle**: "Needs restocking"
- **Style**: Data Card component with red accent left border

#### Card: Total Products
- **Icon**: "inventory_2" in green circle background
- **Label**: "Total Products"
- **Value**: Dynamic count (e.g., "12 items")
- **Subtitle**: "In inventory"
- **Style**: Data Card component with green accent left border

### Card Entrance Animation
- Each card fades in + slides up from 20px below
- Stagger: 0.1s between cards
- Duration: 0.4s
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Trigger: On page load / when scrolled into view

## Section: Quick Actions

### Overview
A row of 3 prominent action buttons for the most common tasks, positioned below the stats bar.

### Layout
- Background: #FFFFFF
- Padding: 0 40px 40px
- 3 buttons in a row on desktop (stacked on mobile)
- Gap: 16px

### Quick Action Buttons

#### Button: Record Sale
- **Icon**: "point_of_sale"
- **Label**: "Record Sale"
- **Style**: Action Button (Orange)
- **Action**: Navigate to Sales page with new sale form open

#### Button: Add Product
- **Icon**: "add_circle"
- **Label**: "Add Product"
- **Style**: Action Button (Orange)
- **Action**: Navigate to Inventory page with add product modal open

#### Button: View Credit
- **Icon**: "credit_card"
- **Label**: "View Credit"
- **Style**: Glassmorphism Button (secondary)
- **Action**: Navigate to Credit page

## Entrance Animations

### 3D Scene Entrance
- **Chicken**: Scales from 0 to 1 with bounce easing (0.6s), fades in (0.4s)
- **Starburst Ring**: Fades in (0.5s), begins rotation immediately
- **Cards**: Scale from 0.5 to 1 with 0.1s stagger (0.3s each)
- **Sequence**: Chicken appears first (0.3s delay), then starburst fades in (0.5s delay), cards scale in with stagger (0.8s delay)

## Continuous Animations
- Starburst ring: 30s full rotation, linear, infinite
- Chicken idle bounce: 2s oscillation, bounce easing, infinite alternate
- Hot air wisp: 3s stroke animation, linear, infinite
- Eye tracking: Continuous via requestAnimationFrame

## Interactions

### Chicken Click (Wink)
- Trigger: Click on any chicken body part
- Effect: Eye squishes (scaleY 0.1) then returns, 200ms
- Additional: Optional - plays a soft cluck sound effect (if audio is added)

### Product Card Hover
- Trigger: Hover on a starburst card
- Effect: Card scales to 1.1x, translateZ increases by 20px (pops forward)
- Transition: 0.3s ease

### Nav Item Click
- Trigger: Click nav item
- Effect: Active state updates, page content transitions
- The 3D chicken scene is only visible on Dashboard; other pages show standard content layouts

## Assets

### Chicken Product Card Images (8 cards)
[ASSET: Image "product-whole-chicken"]
A whole raw chicken on a white background. Clean product photography style, top-down view. The chicken is uncooked, natural pale pink color. Simple studio lighting with soft shadows. Square crop, centered.

[ASSET: Image "product-boneless"]
Boneless chicken breast fillets on a white background. Clean product photography, 2-3 pieces arranged neatly. Pale pink color. Studio lighting, soft shadows. Square crop.

[ASSET: Image "product-kaleji"]
Chicken liver (kaleji) on a white background. Dark reddish-brown color, 4-5 pieces. Clean product photography. Studio lighting. Square crop.

[ASSET: Image "product-karahi-cut"]
Karahi cut chicken pieces on a white background. Small curry-cut pieces with bone. Raw, pink color. Clean product photography. Square crop.

[ASSET: Image "product-wings"]
Chicken wings on a white background. 4-5 whole raw wings with skin. Pink color. Clean product photography. Square crop.

[ASSET: Image "product-legs"]
Chicken drumsticks on a white background. 3-4 raw drumsticks with skin. Pink color. Clean product photography. Square crop.

[ASSET: Image "product-breast"]
Chicken breast pieces on a white background. 2 large raw breast pieces. Pale pink. Clean product photography. Square crop.

[ASSET: Image "product-mince"]
Ground chicken mince on a white background. Pile of light pink minced meat. Clean product photography. Square crop.

## Transitions

**→ Inventory**
- Trigger: Click "Inventory" in nav
- Dashboard 3D scene fades out (opacity 0, 0.3s), Inventory page fades in

**→ Sales**
- Trigger: Click "Sales" in nav or "Record Sale" quick action
- Dashboard fades out, Sales page fades in

**→ Credit**
- Trigger: Click "Credit" in nav or "View Credit" quick action
- Dashboard fades out, Credit page fades in

**→ Ledger**
- Trigger: Click "Ledger" in nav
- Dashboard fades out, Ledger page fades in

**→ Settings**
- Trigger: Click "Settings" in nav
- Dashboard fades out, Settings page fades in
