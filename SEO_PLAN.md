# SEO Strategy & Implementation Plan
## Aziz Ayachi - Professional Photographer

---

## SEO Goals

1. **Rank #1** for "Aziz Ayachi photographer" and related terms
2. **Local SEO** - Rank for "photographer in [city]" searches
3. **Service-based SEO** - Rank for "wedding photographer", "portrait photographer", etc.
4. **Image SEO** - Optimize images for Google Images search
5. **Fast page speed** - Core Web Vitals optimization

---

## Target Keywords

### Primary Keywords
- `Aziz Ayachi`
- `Aziz Ayachi photographer`
- `professional photographer [city]`
- `wedding photographer [city]`
- `portrait photographer [city]`
- `event photographer [city]`
- `fashion photographer [city]`

### Secondary Keywords
- `photography services [city]`
- `wedding photography [city]`
- `corporate photography [city]`
- `commercial photography [city]`
- `photo gallery [city]`
- `professional photoshoot [city]`

### Long-tail Keywords
- `best wedding photographer in [city]`
- `professional portrait photographer near me`
- `hire photographer for event [city]`
- `professional photography services [city]`

---

## On-Page SEO Checklist

### 1. Meta Tags & Headers

#### Title Tags
```html
<!-- Homepage -->
<title>Aziz Ayachi - Professional Photographer | Wedding, Portrait & Event Photography</title>

<!-- Gallery Pages -->
<title>[Gallery Name] - Aziz Ayachi Photography Portfolio</title>

<!-- Admin (noindex) -->
<meta name="robots" content="noindex, nofollow">
```

#### Meta Descriptions
```html
<!-- Homepage -->
<meta name="description" content="Aziz Ayachi is a professional photographer specializing in weddings, portraits, fashion, and commercial photography. View portfolio and book your session.">

<!-- Gallery Pages -->
<meta name="description" content="View [Gallery Name] photography collection by Aziz Ayachi. Professional [wedding/portrait/event] photography services.">
```

#### Open Graph Tags (Social Media)
```html
<meta property="og:title" content="Aziz Ayachi - Professional Photographer">
<meta property="og:description" content="Professional photography services for weddings, portraits, and events.">
<meta property="og:image" content="https://azizayachi.com/og-image.jpg">
<meta property="og:url" content="https://azizayachi.com">
<meta property="og:type" content="website">
```

#### Twitter Cards
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Aziz Ayachi - Professional Photographer">
<meta name="twitter:description" content="Professional photography services">
<meta name="twitter:image" content="https://azizayachi.com/twitter-image.jpg">
```

### 2. Structured Data (Schema.org)

#### Organization Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Photographer",
  "name": "Aziz Ayachi",
  "description": "Professional photographer specializing in weddings, portraits, fashion, and commercial photography",
  "url": "https://azizayachi.com",
  "logo": "https://azizayachi.com/logo.png",
  "image": "https://azizayachi.com/hero-image.jpg",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "[City]",
    "addressCountry": "[Country]"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-XXX-XXX-XXXX",
    "contactType": "customer service",
    "email": "hello@azizayachi.com"
  },
  "sameAs": [
    "https://www.instagram.com/azizayachi",
    "https://www.linkedin.com/in/azizayachi"
  ],
  "priceRange": "$$",
  "areaServed": {
    "@type": "City",
    "name": "[City]"
  }
}
```

#### Service Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Photography Services",
  "provider": {
    "@type": "Photographer",
    "name": "Aziz Ayachi"
  },
  "areaServed": {
    "@type": "City",
    "name": "[City]"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Photography Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Wedding Photography"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Portrait Photography"
        }
      }
    ]
  }
}
```

#### ImageGallery Schema
```json
{
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "name": "Wedding Collection",
  "description": "Professional wedding photography collection",
  "image": [
    "https://cdn.azizayachi.com/galleries/uuid/image1.jpg",
    "https://cdn.azizayachi.com/galleries/uuid/image2.jpg"
  ]
}
```

#### Breadcrumb Schema
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://azizayachi.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Portfolio",
      "item": "https://azizayachi.com/portfolio"
    }
  ]
}
```

### 3. Header Tags (H1, H2, H3)

```html
<!-- Homepage -->
<h1>Aziz Ayachi - Professional Photographer</h1>
<h2>Wedding Photography</h2>
<h2>Portrait Photography</h2>
<h2>Event Photography</h2>

<!-- Gallery Pages -->
<h1>[Gallery Name] - Professional Photography Collection</h1>
<h2>About This Collection</h2>
```

### 4. Alt Text for Images

**Best Practices:**
- Descriptive and specific
- Include keywords naturally
- Don't keyword stuff
- Describe what's in the image

**Examples:**
```html
<!-- Good -->
<img alt="Wedding ceremony photography by Aziz Ayachi - bride and groom exchanging vows" />

<!-- Bad -->
<img alt="photographer wedding photo" />
```

### 5. URL Structure

```
✅ Good URLs:
https://azizayachi.com/
https://azizayachi.com/portfolio
https://azizayachi.com/portfolio/wedding-photography
https://azizayachi.com/portfolio/portrait-photography
https://azizayachi.com/about
https://azizayachi.com/contact

❌ Bad URLs:
https://azizayachi.com/page?id=123
https://azizayachi.com/gallery/abc123xyz
```

### 6. Internal Linking

- Link from homepage to portfolio sections
- Link between related galleries
- Use descriptive anchor text
- Create a sitemap

---

## Technical SEO

### 1. Site Speed Optimization

**Target Metrics:**
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

**Optimizations:**
- ✅ Image optimization (WebP format, lazy loading)
- ✅ Code splitting (React lazy loading)
- ✅ CDN for all assets
- ✅ Minify CSS/JS
- ✅ Enable compression (Gzip/Brotli)
- ✅ Optimize fonts (preload, subset)

### 2. Mobile Optimization

- ✅ Responsive design (already done)
- ✅ Mobile-first approach
- ✅ Touch-friendly buttons
- ✅ Fast mobile load times

### 3. Core Web Vitals

**LCP Optimization:**
```jsx
// Lazy load images below the fold
import { LazyLoadImage } from 'react-lazy-load-image-component';

<LazyLoadImage
  src={imageUrl}
  alt="Description"
  effect="blur"
  placeholder={<Skeleton />}
/>
```

**CLS Prevention:**
```css
/* Reserve space for images */
.image-container {
  aspect-ratio: 4/3;
  background-color: #f0f0f0;
}
```

### 4. Robots.txt

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /gallery/*/  # Private client galleries

Sitemap: https://azizayachi.com/sitemap.xml
```

### 5. XML Sitemap

**Structure:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://azizayachi.com/</loc>
    <lastmod>2026-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://azizayachi.com/portfolio</loc>
    <lastmod>2026-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Add more URLs -->
</urlset>
```

**Dynamic Sitemap Generation:**
- Generate sitemap from database (public galleries only)
- Update when new galleries are published
- Submit to Google Search Console

---

## Content SEO

### 1. Homepage Content

**Sections to Include:**
- Hero with clear value proposition
- Services overview
- Portfolio showcase
- About section
- Testimonials
- Contact information
- Location information

### 2. Portfolio Pages

**Each gallery should have:**
- Descriptive title
- Meta description
- Alt text for all images
- Gallery description
- Related galleries links

### 3. Blog/Content Strategy (Optional but Recommended)

**Blog Topics:**
- "10 Tips for Your Wedding Photography"
- "How to Prepare for a Portrait Session"
- "Best Locations for Photography in [City]"
- "Behind the Scenes: [Event Name]"

**Benefits:**
- Fresh content for SEO
- Long-tail keyword targeting
- Shareable content
- Authority building

---

## Local SEO

### 1. Google Business Profile

- Create/claim Google Business Profile
- Add business information
- Upload photos
- Collect reviews
- Regular posts/updates

### 2. Local Citations

**Listings to Create:**
- Google Business Profile
- Bing Places
- Yelp
- Facebook Business Page
- Instagram Business Account
- LinkedIn Company Page
- Local directories

### 3. NAP Consistency

**NAP = Name, Address, Phone**

Ensure consistent NAP across:
- Website
- Google Business Profile
- Social media profiles
- Directory listings

---

## Image SEO

### 1. Image Optimization

**File Naming:**
```
✅ Good: aziz-ayachi-wedding-photography-bride-groom.jpg
❌ Bad: IMG_1234.jpg
```

**Image Properties:**
- Descriptive filenames
- Alt text (required)
- Title attributes
- Proper dimensions
- WebP format (with fallback)
- Lazy loading

### 2. Image Sitemap

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://azizayachi.com/portfolio/wedding-collection</loc>
    <image:image>
      <image:loc>https://cdn.azizayachi.com/galleries/uuid/image1.jpg</image:loc>
      <image:title>Wedding Photography by Aziz Ayachi</image:title>
      <image:caption>Professional wedding ceremony photography</image:caption>
    </image:image>
  </url>
</urlset>
```

---

## Link Building Strategy

### 1. Internal Links
- Link between related galleries
- Navigation menu
- Footer links
- Related content links

### 2. External Links
- Social media profiles
- Photography directories
- Wedding vendor directories
- Local business directories
- Photography blogs/forums

### 3. Backlinks
- Guest posts on photography blogs
- Local business partnerships
- Wedding vendor networks
- Photography associations

---

## Analytics & Monitoring

### 1. Google Analytics 4 (GA4)

**Track:**
- Page views
- User behavior
- Conversion events (contact form, gallery views)
- Traffic sources
- Search queries

### 2. Google Search Console

**Monitor:**
- Search performance
- Indexing status
- Core Web Vitals
- Mobile usability
- Sitemap status

### 3. SEO Tools

**Recommended:**
- Google Search Console (free)
- Google Analytics 4 (free)
- Ahrefs or SEMrush (paid, optional)
- Screaming Frog (free, technical SEO)

---

## Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Set up Google Analytics 4
- [ ] Set up Google Search Console
- [ ] Create Google Business Profile
- [ ] Implement meta tags
- [ ] Add structured data
- [ ] Create robots.txt
- [ ] Generate XML sitemap

### Phase 2: Content (Week 2)
- [ ] Optimize homepage content
- [ ] Add alt text to all images
- [ ] Create portfolio descriptions
- [ ] Optimize URL structure
- [ ] Add internal linking

### Phase 3: Technical (Week 3)
- [ ] Optimize images (WebP, compression)
- [ ] Implement lazy loading
- [ ] Minify CSS/JS
- [ ] Enable compression
- [ ] Fix Core Web Vitals issues

### Phase 4: Local SEO (Week 4)
- [ ] Complete Google Business Profile
- [ ] Create local citations
- [ ] Ensure NAP consistency
- [ ] Add location schema

### Phase 5: Ongoing
- [ ] Monitor analytics weekly
- [ ] Update content monthly
- [ ] Build backlinks
- [ ] Track keyword rankings
- [ ] Update sitemap regularly

---

## SEO Performance Metrics

### Track These KPIs:

1. **Organic Traffic**
   - Sessions from organic search
   - New vs returning visitors
   - Traffic by landing page

2. **Keyword Rankings**
   - Target keyword positions
   - Ranking improvements
   - New keyword rankings

3. **Core Web Vitals**
   - LCP, FID, CLS scores
   - Mobile vs desktop
   - Page speed scores

4. **Conversions**
   - Contact form submissions
   - Gallery views
   - Phone calls (if trackable)

5. **Backlinks**
   - Number of referring domains
   - Domain authority of backlinks
   - New backlinks acquired

---

## Quick Wins

1. ✅ **Add meta descriptions** to all pages (1 hour)
2. ✅ **Optimize images** (alt text, compression) (2 hours)
3. ✅ **Submit sitemap** to Google Search Console (15 min)
4. ✅ **Create Google Business Profile** (30 min)
5. ✅ **Add structured data** (2 hours)
6. ✅ **Fix broken links** (1 hour)
7. ✅ **Improve page speed** (3 hours)

---

## React SEO Implementation

### Using React Helmet (for meta tags)

```jsx
import { Helmet } from 'react-helmet-async';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Aziz Ayachi - Professional Photographer | Wedding, Portrait & Event Photography</title>
        <meta name="description" content="Aziz Ayachi is a professional photographer specializing in weddings, portraits, fashion, and commercial photography." />
        <meta property="og:title" content="Aziz Ayachi - Professional Photographer" />
        <meta property="og:description" content="Professional photography services" />
        <meta property="og:image" content="https://azizayachi.com/og-image.jpg" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Photographer",
            "name": "Aziz Ayachi",
            // ... schema data
          })}
        </script>
      </Helmet>
      {/* Page content */}
    </>
  );
};
```

---

## Expected Results Timeline

- **Month 1-2:** Technical SEO implemented, indexing improved
- **Month 3-4:** Rankings start improving for long-tail keywords
- **Month 5-6:** Ranking for primary keywords, increased traffic
- **Month 6+:** Established authority, consistent rankings

---

**Last Updated:** 2026  
**Version:** 1.0
