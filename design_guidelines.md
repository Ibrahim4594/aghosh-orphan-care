# Orphan Care Home Donation & Management App - Design Guidelines

## Design Approach
**Reference-Based**: Drawing inspiration from Islamic Relief, Charity: Water, and GoFundMe to create a warm, trustworthy donation platform that balances emotional storytelling with functional clarity. The design emphasizes transparency, compassion, and Islamic values through clean, respectful aesthetics.

## Core Design Principles
1. **Warmth & Trust**: Soft, approachable design that builds emotional connection
2. **Islamic Authenticity**: Respectful presentation with "Assalamu Alaikum" greeting, Arabic calligraphy accents
3. **Transparency First**: Clear donation tracking, impact visualization, honest communication
4. **Emotional Storytelling**: Photo-driven narratives highlighting real impact

## Typography System
**Primary Font**: Inter (via Google Fonts) - clean, modern, excellent readability
**Secondary Font**: Amiri or Scheherazade New (for Arabic/Islamic text accents)

**Hierarchy**:
- Hero Headlines: text-5xl md:text-6xl, font-bold
- Section Headers: text-3xl md:text-4xl, font-semibold
- Body Text: text-base md:text-lg, font-normal, leading-relaxed
- Card Titles: text-xl font-semibold
- Captions: text-sm text-gray-600

## Layout System
**Spacing Units**: Consistent use of Tailwind's 4, 8, 12, 16, 20, 24 units
- Section padding: py-16 md:py-24
- Card padding: p-6 md:p-8
- Component gaps: gap-8 md:gap-12

**Container**: max-w-7xl mx-auto px-4 for main content

## Component Library

### Navigation
Sticky header with:
- Logo with Islamic geometric pattern accent
- Horizontal menu: Home | About | Programs | Donate | Impact | Contact
- Prominent "Donate Now" CTA button (elevated, distinct)
- Mobile: Hamburger menu with slide-in drawer

### Hero Section (Home)
Full-width, 70vh hero with authentic orphan care imagery showing children in care/education
- Overlay gradient (dark bottom to transparent top) for text readability
- "Assalamu Alaikum" greeting in Arabic calligraphy above headline
- Compelling headline: "Supporting Orphaned Children with Care & Compassion"
- Subheading explaining mission
- Dual CTA: Primary "Donate Now" + Secondary "Learn Our Story" (both with backdrop-blur-sm bg-white/20 treatment)

### Donation Cards
Multi-column grid (2-3 columns desktop, stack mobile) featuring:
- Healthcare, Education, Food, Clothing, Shelter, General categories
- Each card: Icon (Heroicons), title, brief description, "Donate" button
- Hover: Subtle lift effect (shadow-lg transform -translate-y-1)

### Impact Section
**Statistics Bar**: 4-column grid with large numbers
- Children Supported, Meals Provided, Students Educated, Medical Treatments
- Counter animation feel with bold numbers (text-4xl) and labels

**Stories Grid**: Masonry-style or card grid
- Photo (placeholder with respectful children imagery)
- Name/age, brief story, impact achieved
- "Read More" links

### Donation Form
Single-column, centered form (max-w-2xl):
1. Greeting: "Your donation transforms lives"
2. Purpose selection: Large radio cards with icons
3. Amount options: Quick-select buttons ($25, $50, $100, Custom)
4. Custom amount input
5. Donor info: Name (with "Donate Anonymously" checkbox), Email, Phone (optional)
6. Payment method selection (mock cards)
7. Prominent "Complete Donation" button
8. Trust badges below: Secure payment, Tax deductible

### Admin Dashboard
Clean data dashboard:
- Card-based metrics (4 columns: Total Donations, By Category, Recent Count, Active Programs)
- Table for recent donations
- Charts: Donut for category breakdown, line for trends
- Action buttons: "Add Story", "New Program", "View All"

### Footer
Rich footer (3-4 columns):
- About column: Mission statement, trust certification badges
- Quick Links: Programs, Donation Info, Privacy Policy
- Contact: Address, Phone, Email, Prayer times note
- Newsletter signup: "Stay Updated" with email input
- Social media icons
- Copyright with Islamic foundation tagline

## Images Strategy

### Required Images
1. **Hero Image**: Large, impactful photo (1920x1080) showing orphan children in care home - studying, eating together, or playing. Should evoke warmth and hope, not sadness.
2. **Program Images**: 5 images (800x600) for Healthcare, Education, Food, Clothing, Shelter sections - authentic documentary-style photos
3. **Impact Stories**: 6-9 portrait photos (400x500) of individual children with respectful, dignified presentation
4. **Admin Dashboard**: Optional chart placeholders or use Chart.js for live data

### Image Treatment
- Slightly warm filter (increased saturation by 5-10%)
- Rounded corners (rounded-lg) for all content images
- Respectful composition avoiding overly emotional manipulation

## Interaction Patterns
- **Smooth scrolling**: Between sections
- **Form validation**: Inline, real-time feedback with gentle error states
- **Loading states**: Spinner for donation processing
- **Success modals**: Celebration overlay after donation with receipt option
- **Minimal animations**: Subtle fade-ins on scroll, no distracting motion

## Accessibility
- High contrast text (WCAG AA minimum)
- Clear focus states on all interactive elements
- Semantic HTML throughout
- Alt text for all images describing context respectfully
- Keyboard navigation support
- Arabic text properly right-aligned where used

## Mobile Optimization
- Stack all multi-column layouts to single column
- Larger touch targets (min 44x44px)
- Simplified navigation with drawer menu
- Donation form optimized for mobile keyboards
- Horizontal scroll for statistics on small screens

This design creates a trustworthy, emotionally resonant platform that honors Islamic values while providing a modern, efficient donation experience.