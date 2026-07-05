/**
 * Development seed: demo content matching the design mockups.
 * Run with: pnpm seed
 * Idempotent — skips if content already exists.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const p = (text: string) => ({
  type: 'paragraph',
  version: 1,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  children: [{ type: 'text', version: 1, detail: 0, format: 0, mode: 'normal', style: '', text }],
})

const rt = (...paragraphs: string[]) => ({
  root: {
    type: 'root' as const,
    version: 1,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    children: paragraphs.map(p),
  },
})

async function seed() {
  const payload = await getPayload({ config })

  const existing = await payload.find({ collection: 'exhibitions', limit: 1 })
  if (existing.totalDocs > 0) {
    payload.logger.info('Seed skipped — content already exists.')
    process.exit(0)
  }

  payload.logger.info('Seeding demo content…')

  // ---------- Admin user ----------
  const users = await payload.find({ collection: 'users', limit: 1 })
  if (users.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { email: 'admin@curatone.art', password: 'curatone2026', name: 'Owner', role: 'admin' },
    })
    payload.logger.info('Admin user: admin@curatone.art / curatone2026')
  }

  // ---------- Participants ----------
  const participant = async (data: Record<string, unknown>) =>
    payload.create({ collection: 'participants', data: data as never })

  const ivelina = await participant({
    name: 'Ivelina Dagsvold',
    slug: 'ivelina-dagsvold',
    country: 'Bulgaria',
    email: 'ivelina@example.com',
    aboutArtist: rt(
      'Ivelina Dagsvold is a Bulgarian painter working primarily in acrylic. Her work has been shown in group exhibitions across Eastern Europe and is held in private collections in Sofia and Oslo.',
    ),
    links: [{ label: 'Portfolio', url: 'https://example.com/ivelina' }],
  })
  const huiyuan = await participant({
    name: 'Huiyuan Zhang',
    slug: 'huiyuan-zhang',
    country: 'United Kingdom',
    email: 'huiyuan@example.com',
    aboutArtist: rt(
      'Huiyuan Zhang is a ceramic artist based in the United Kingdom. Her practice explores the memory of material and the trace of the hand in fired clay.',
    ),
  })
  const viktorika = await participant({
    name: 'Viktorika',
    slug: 'viktorika',
    country: 'France',
    email: 'viktorika@example.com',
    aboutArtist: rt('Viktorika is a French painter working in oil and acrylic, exploring interior landscapes and light.'),
  })
  const elena = await participant({
    name: 'Elena Marchetti',
    slug: 'elena-marchetti',
    country: 'Italy',
    email: 'elena@example.com',
    aboutArtist: rt('Elena Marchetti is an Italian mixed-media artist. Her layered works combine photography, pigment, and found paper.'),
  })
  const meryem = await participant({
    name: 'Meryem Berrada',
    slug: 'meryem-berrada',
    country: 'Morocco',
    email: 'meryem@example.com',
    aboutArtist: rt(
      'Meryem Berrada is a painter whose work draws on North African textile traditions and contemporary abstraction.',
    ),
  })
  const amanda = await participant({
    name: 'Amanda Flores',
    slug: 'amanda-flores',
    country: 'Mexico',
    email: 'amanda@example.com',
    aboutArtist: rt('Amanda Flores is a Mexican painter working with color-saturated figurative scenes.'),
  })
  const keller = await participant({ name: 'M. Keller', slug: 'm-keller', country: 'Germany' })
  const fontaine = await participant({ name: 'L. Fontaine', slug: 'l-fontaine', country: 'France' })
  const andrade = await participant({ name: 'S. Andrade', slug: 's-andrade', country: 'Portugal' })

  // ---------- Competitions ----------
  const colors = await payload.create({
    collection: 'exhibitions',
    draft: false,
    data: {
      _status: 'published',
      title: 'Open Call: Colors',
      slug: 'open-call-colors',
      type: 'competition',
      status: 'open',
      theme: rt(
        'Color is never neutral: it carries memory, place, and feeling. This call invites works in which color itself does the structural work — painting, drawing, and modern art in any technique.',
        'Entries are scored by the full jury on a ten-point scale; Platinum, Gold, and Silver awards are issued with numbered certificates and a permanent archive entry.',
      ),
      dates: {
        start: '2026-06-01T00:00:00.000Z',
        earlyDeadline: '2026-07-26T23:59:59.000Z',
        regularDeadline: '2026-08-23T23:59:59.000Z',
        deadline: '2026-09-06T23:59:59.000Z',
        resultsDate: '2026-09-27T00:00:00.000Z',
      },
      categories: ['painting', 'drawing', 'modern-art'],
      feeNote: '$15 – $25 per work',
      awardsNote: 'Platinum · Gold · Silver + $100 prize',
      payments: { entryFee: 15, finalistFee: 0, currency: 'usd' },
      hideAuthorsUntilResults: true,
      seo: {
        seoTitle: 'Open Call: Colors — International Art Competition 2026',
        seoDescription:
          'Enter the juried international art competition Colors 2026. Painting, drawing and modern art. Numbered certificates, jury of credentialed professionals. Deadline September 6, 2026.',
      },
    },
  })

  await payload.create({
    collection: 'exhibitions',
    draft: false,
    data: {
      _status: 'published',
      title: 'Open Call: Structures',
      slug: 'open-call-structures',
      type: 'competition',
      status: 'open',
      theme: rt(
        'From load-bearing walls to social scaffolding: Structures invites photography, digital art, and mixed media that examine how things hold together — or fall apart.',
      ),
      dates: {
        start: '2026-08-01T00:00:00.000Z',
        deadline: '2026-10-18T23:59:59.000Z',
        resultsDate: '2026-11-08T00:00:00.000Z',
      },
      categories: ['photography', 'digital-art', 'mixed-media'],
      feeNote: '$15 per work',
      awardsNote: 'Platinum · Gold · Silver',
      payments: { entryFee: 15, finalistFee: 0, currency: 'usd' },
      hideAuthorsUntilResults: true,
      seo: {
        seoTitle: 'Open Call: Structures — Photography & Digital Art Competition',
        seoDescription:
          'Juried international competition for photography, digital art and mixed media. Closes October 18, 2026.',
      },
    },
  })

  const connections = await payload.create({
    collection: 'exhibitions',
    draft: false,
    data: {
      _status: 'published',
      title: 'Connections 2026',
      slug: 'connections-2026',
      type: 'competition',
      status: 'closed',
      theme: rt(
        'Connections asked artists to trace the visible and invisible threads between people, places, and times. The jury reviewed 214 works from 16 countries.',
      ),
      dates: {
        start: '2025-12-01T00:00:00.000Z',
        deadline: '2026-01-25T23:59:59.000Z',
        resultsDate: '2026-02-15T00:00:00.000Z',
      },
      categories: ['painting', 'photography', 'mixed-media'],
      awardsNote: 'Platinum · Gold · Silver',
      resultStats: { worksCount: 214, countriesCount: 16 },
      hideAuthorsUntilResults: true,
      seo: {
        seoTitle: 'Connections 2026 — Competition Results & Finalists',
        seoDescription: 'Results of the juried international competition Connections 2026: 214 works from 16 countries.',
      },
    },
  })

  const colors2025 = await payload.create({
    collection: 'exhibitions',
    draft: false,
    data: {
      _status: 'published',
      title: 'Colors 2025',
      slug: 'colors-2025',
      type: 'competition',
      status: 'closed',
      theme: rt('The first edition of the Colors call: 187 works in painting and drawing from 14 countries.'),
      dates: {
        start: '2025-07-01T00:00:00.000Z',
        deadline: '2025-08-31T23:59:59.000Z',
        resultsDate: '2025-09-20T00:00:00.000Z',
      },
      categories: ['painting', 'drawing'],
      resultStats: { worksCount: 187, countriesCount: 14 },
      hideAuthorsUntilResults: true,
    },
  })

  const moments = await payload.create({
    collection: 'exhibitions',
    draft: false,
    data: {
      _status: 'published',
      title: 'Moments of Life 2025',
      slug: 'moments-of-life-2025',
      type: 'competition',
      status: 'closed',
      theme: rt('Moments of Life gathered 162 works about the small, unrepeatable instants that make a biography.'),
      dates: {
        start: '2025-03-01T00:00:00.000Z',
        deadline: '2025-04-27T23:59:59.000Z',
        resultsDate: '2025-05-18T00:00:00.000Z',
      },
      categories: ['painting', 'ceramics', 'photography'],
      resultStats: { worksCount: 162, countriesCount: 12 },
      hideAuthorsUntilResults: true,
    },
  })

  // ---------- Finalist submissions ----------
  const submission = async (data: Record<string, unknown>) =>
    payload.create({ collection: 'submissions', data: data as never, context: { skipPublishHook: true } })

  await submission({
    competition: connections.id,
    author: elena.id,
    title: 'Thread Count',
    category: 'mixed-media',
    medium: 'Photography, pigment, found paper',
    year: '2025',
    isFinalist: true,
    awardTier: 'platinum',
    score: 9.4,
    juryCitation:
      'A work of rare structural intelligence: the layered surfaces read simultaneously as textile, archive, and map. The jury noted its complete command of material.',
    certificateNumber: 'CTA-2026-0139',
    slug: 'elena-marchetti-thread-count',
    submittedAt: '2026-01-20T10:00:00.000Z',
  })
  await submission({
    competition: connections.id,
    author: ivelina.id,
    title: 'Signal Fires',
    category: 'painting',
    medium: 'Acrylic',
    year: '2025',
    isFinalist: true,
    awardTier: 'gold',
    score: 8.7,
    juryCitation:
      'Confident, economical painting. Color relationships carry the entire narrative weight, and the restraint pays off.',
    certificateNumber: 'CTA-2026-0147',
    slug: 'ivelina-dagsvold-signal-fires',
    submittedAt: '2026-01-18T10:00:00.000Z',
  })
  await submission({
    competition: connections.id,
    author: amanda.id,
    title: 'Distance Between Two Hands',
    category: 'photography',
    medium: 'Archival pigment print',
    year: '2025',
    isFinalist: true,
    awardTier: 'silver',
    score: 6.9,
    juryCitation: 'A quiet photograph with a precise emotional register.',
    certificateNumber: 'CTA-2026-0152',
    slug: 'amanda-flores-distance-between-two-hands',
    submittedAt: '2026-01-15T10:00:00.000Z',
  })
  await submission({
    competition: colors2025.id,
    author: amanda.id,
    title: 'Mercado',
    category: 'painting',
    medium: 'Oil',
    year: '2025',
    isFinalist: true,
    awardTier: 'gold',
    score: 8.2,
    juryCitation: 'Saturated, generous, alive — a painting that earns its color.',
    certificateNumber: 'CTA-2025-0098',
    slug: 'amanda-flores-mercado',
    submittedAt: '2025-08-10T10:00:00.000Z',
  })
  await submission({
    competition: colors2025.id,
    author: viktorika.id,
    title: 'Studio, Morning',
    category: 'drawing',
    medium: 'Charcoal, pastel',
    year: '2025',
    isFinalist: true,
    awardTier: 'silver',
    score: 6.5,
    juryCitation: 'Disciplined drawing with an unusually warm tonal range.',
    certificateNumber: 'CTA-2025-0104',
    slug: 'viktorika-studio-morning',
    submittedAt: '2025-08-05T10:00:00.000Z',
  })
  await submission({
    competition: moments.id,
    author: huiyuan.id,
    title: 'What the Kiln Keeps',
    category: 'ceramics',
    medium: 'Ceramic',
    year: '2024',
    isFinalist: true,
    awardTier: 'gold',
    score: 8.9,
    juryCitation:
      'The vessel remembers every decision of the maker. A ceramic work whose surface holds an entire biography of touch.',
    certificateNumber: 'CTA-2025-0061',
    slug: 'huiyuan-zhang-what-the-kiln-keeps',
    submittedAt: '2025-04-12T10:00:00.000Z',
  })
  await submission({
    competition: moments.id,
    author: viktorika.id,
    title: 'Inner Weather',
    category: 'painting',
    medium: 'Oil, acrylic',
    year: '2024',
    isFinalist: true,
    awardTier: 'silver',
    score: 6.8,
    juryCitation: 'An interior landscape rendered with honesty and control.',
    certificateNumber: 'CTA-2025-0067',
    slug: 'viktorika-inner-weather',
    submittedAt: '2025-04-08T10:00:00.000Z',
  })

  // ---------- Non-competition exhibitions ----------
  await payload.create({
    collection: 'exhibitions',
    draft: false,
    data: {
      _status: 'published',
      title: 'Meryem Berrada: Selected Works',
      slug: 'meryem-berrada-selected-works',
      type: 'personal',
      status: 'closed',
      artist: meryem.id,
      theme: rt(
        'A solo online exhibition of twelve paintings made between 2023 and 2026. Berrada’s recent work translates the geometry of North African textiles into large, slow fields of color.',
        'The exhibition is accompanied by a published interview in which the artist discusses studio ritual, inheritance, and the discipline of repetition.',
      ),
      interviewExcerpt: rt(
        '“I paint the same square for months. People ask if I get bored — but the square is never the same twice. Repetition is how I listen.”',
      ),
      works: [
        { title: 'Loom I', medium: 'Acrylic on canvas', year: '2024' },
        { title: 'Loom II', medium: 'Acrylic on canvas', year: '2024' },
        { title: 'Threshold', medium: 'Oil on linen', year: '2025' },
        { title: 'Inheritance', medium: 'Oil on linen', year: '2026' },
      ],
      seo: {
        seoTitle: 'Meryem Berrada: Selected Works — Online Exhibition',
        seoDescription: 'Solo online exhibition with a published interview. Paintings 2023–2026.',
      },
    },
  })

  await payload.create({
    collection: 'exhibitions',
    draft: false,
    data: {
      _status: 'published',
      title: 'Featured Artist: Huiyuan Zhang',
      slug: 'featured-huiyuan-zhang',
      type: 'featured',
      status: 'closed',
      artist: huiyuan.id,
      relatedCompetition: moments.id,
      theme: rt(
        'Recognised in Moments of Life 2025, Huiyuan Zhang works in fired clay. This featured showcase presents five vessels from her recent kiln cycles.',
      ),
      works: [
        { title: 'Vessel 31', medium: 'Stoneware', year: '2025' },
        { title: 'Vessel 34', medium: 'Stoneware', year: '2025' },
        { title: 'Night Firing', medium: 'Raku', year: '2024' },
      ],
    },
  })

  // ---------- Jury ----------
  const juryData = [
    {
      name: 'Qichao An',
      role: 'Creative director',
      country: 'China',
      shortCredential: 'Fifteen years in visual design; recipient of nearly 100 international design awards.',
      showOnHomepage: true,
      onEditorialBoard: true,
      affiliation: 'Independent studio, Shanghai',
      order: 1,
    },
    {
      name: 'Mosaz (Zijun Zhao)',
      slug: 'mosaz-zijun-zhao',
      role: 'Artist',
      country: 'New York, USA',
      shortCredential: 'Leonardo da Vinci and Premio Firenze awards; juror for the Genoa Biennale.',
      showOnHomepage: true,
      order: 2,
    },
    {
      name: 'Irina Naumycheva',
      role: 'Designer',
      country: 'Miami, USA',
      shortCredential: 'Creator of the AI-Art & Design Flow methodology; juror for international art platforms.',
      showOnHomepage: true,
      order: 3,
    },
    {
      name: 'Josephine Florens',
      role: 'Oil painter',
      country: 'Germany',
      shortCredential: 'Member of the College Art Association (USA) and the Union of Marine Painters of Odesa.',
      showOnHomepage: true,
      order: 4,
    },
    {
      name: 'Elif Demir',
      role: 'Curator',
      country: 'Türkiye',
      shortCredential: 'Independent curator; previously programme curator at an Istanbul contemporary art space.',
      onEditorialBoard: true,
      affiliation: 'Istanbul Bilgi University',
      order: 5,
    },
    {
      name: 'Marco Bellini',
      role: 'Art historian',
      country: 'Italy',
      shortCredential: 'Lecturer in modern art history; contributor to European exhibition catalogues.',
      onEditorialBoard: true,
      affiliation: 'Università di Bologna',
      order: 6,
    },
    {
      name: 'Sofia Lindqvist',
      role: 'Gallerist',
      country: 'Sweden',
      shortCredential: 'Founder of a Stockholm project space representing early-career Nordic painters.',
      order: 7,
    },
    {
      name: 'David Okafor',
      role: 'Photographer',
      country: 'Nigeria',
      shortCredential: 'Documentary photographer; work published by international news organisations.',
      onEditorialBoard: true,
      affiliation: 'University of Lagos',
      order: 8,
    },
    // Jurors who served on earlier competitions and are not on the current
    // panel. They appear in the full roster with no downgrade marker.
    {
      name: 'Hana Kobayashi',
      role: 'Printmaker',
      country: 'Japan',
      shortCredential: 'Woodblock printmaker; served on the Moments of Life 2025 jury.',
      active: false,
      order: 9,
    },
    {
      name: 'Lucas Moreau',
      role: 'Sculptor',
      country: 'France',
      shortCredential: 'Sculptor working in bronze and cast glass; served on the Colors 2025 jury.',
      active: false,
      order: 10,
    },
  ]
  for (const j of juryData) {
    const { active, ...rest } = j as typeof j & { active?: boolean }
    await payload.create({
      collection: 'jury-members',
      data: {
        ...rest,
        active: active ?? true,
        membership: { tier: 'jury', start: '2025-01-01T00:00:00.000Z' },
        bio: rt(`${j.name} — ${j.shortCredential}`),
        judgingRecord: [connections.id, colors2025.id],
        memberSince: '2025-01-01T00:00:00.000Z',
      } as never,
    })
  }

  // ---------- Journal articles ----------
  await payload.create({
    collection: 'journal-articles',
    data: {
      title: 'Color as archive: pigment choice and cultural memory in contemporary painting',
      slug: 'color-as-archive',
      status: 'published',
      author: keller.id,
      authorsDisplay: 'M. Keller, A. Osei',
      affiliation: 'Berlin University of the Arts',
      articleType: 'research',
      abstract:
        'This article examines how contemporary painters use pigment choice as a form of cultural memory. Drawing on interviews with twelve artists and material analysis of recent works, we argue that pigment sourcing functions as an archival practice that binds paintings to specific geographies and histories.',
      keywords: [{ keyword: 'pigment' }, { keyword: 'cultural memory' }, { keyword: 'contemporary painting' }, { keyword: 'materiality' }],
      fullText: rt(
        'Pigment is the least discussed and most consequential decision in contemporary painting. While composition and subject dominate critical writing, the material origin of color — where a pigment was mined, synthesised, or traded — carries meanings that artists increasingly foreground.',
        'Our study combines two methods: semi-structured interviews with twelve painters working across four continents, and X-ray fluorescence analysis of twenty-four recent works. In each case we traced the pigment supply chain as far as documentation allowed.',
        'The findings suggest that pigment choice operates as an archival gesture: artists select materials whose provenance encodes histories of trade, colonial extraction, and family memory. We propose the term "chromatic archive" for this practice and outline its implications for conservation and curatorial description.',
      ),
      references: [
        { reference: 'Ball, P. (2001). Bright Earth: Art and the Invention of Color. University of Chicago Press.' },
        { reference: 'Taussig, M. (2009). What Color Is the Sacred? University of Chicago Press.' },
        { reference: 'Lowengard, S. (2006). The Creation of Color in Eighteenth-Century Europe. Columbia University Press.' },
      ],
      doi: '10.63653/CTAR.2026.14',
      volume: '2',
      issue: '3',
      publishedDate: '2026-06-15T00:00:00.000Z',
      licenseAgreed: true,
      originalityConfirmed: true,
      seo: {
        seoTitle: 'Color as Archive: Pigment Choice and Cultural Memory in Contemporary Painting',
        seoDescription:
          'Peer-reviewed research article on pigment choice as cultural memory in contemporary painting. DOI 10.63653/CTAR.2026.14.',
      },
    },
  })
  await payload.create({
    collection: 'journal-articles',
    data: {
      title: 'The juried exhibition as professional record: documentation practices in online curation',
      slug: 'juried-exhibition-as-professional-record',
      status: 'published',
      author: fontaine.id,
      authorsDisplay: 'L. Fontaine',
      affiliation: 'Université Paris 8',
      articleType: 'research',
      abstract:
        'Online juried exhibitions produce a new class of professional documentation for artists. This article analyses how certificates, public jury rosters, and permanent archives function as verifiable career records, and compares documentation standards across twelve international platforms.',
      keywords: [{ keyword: 'juried exhibition' }, { keyword: 'documentation' }, { keyword: 'online curation' }, { keyword: 'professional record' }],
      fullText: rt(
        'For most of the twentieth century, an artist’s exhibition history was verified through printed catalogues and institutional archives. The migration of juried exhibitions online has unsettled this system: the exhibition may be ephemeral, but the artist’s need for a verifiable record remains.',
        'This article surveys documentation practices across twelve online platforms, coding each for jury transparency, certificate verifiability, and archive permanence. Platforms differ sharply: fewer than half publish jury credentials, and only three provide certificate verification by number.',
        'We argue that documentation quality — not audience size — is the variable that determines whether online exhibition participation functions as professional capital.',
      ),
      references: [
        { reference: 'Becker, H. S. (1982). Art Worlds. University of California Press.' },
        { reference: 'Velthuis, O. (2005). Talking Prices. Princeton University Press.' },
      ],
      doi: '10.63653/CTAR.2026.13',
      volume: '2',
      issue: '3',
      publishedDate: '2026-06-01T00:00:00.000Z',
      licenseAgreed: true,
      originalityConfirmed: true,
    },
  })
  await payload.create({
    collection: 'journal-articles',
    data: {
      title: 'Digital surfaces: material authenticity in post-photographic media',
      slug: 'digital-surfaces-material-authenticity',
      status: 'published',
      author: andrade.id,
      authorsDisplay: 'S. Andrade, T. Virtanen',
      affiliation: 'Universidade do Porto',
      articleType: 'expert-insight',
      abstract:
        'What does "material" mean when the surface is a screen? This essay reviews current debates on material authenticity in post-photographic media and proposes a framework for evaluating digital works on their own material terms.',
      keywords: [{ keyword: 'digital art' }, { keyword: 'materiality' }, { keyword: 'post-photography' }],
      fullText: rt(
        'The vocabulary of art criticism remains stubbornly haptic: we praise texture, facture, the trace of the hand. Digital works are routinely judged deficient by this standard — a category error this essay attempts to correct.',
        'We propose that digital media possess their own material register: compression artefacts, sensor noise, rendering signatures. Reading these as facture rather than flaw opens post-photographic work to serious material criticism.',
      ),
      references: [{ reference: 'Steyerl, H. (2012). The Wretched of the Screen. Sternberg Press.' }],
      doi: '10.63653/CTAR.2026.12',
      volume: '2',
      issue: '3',
      publishedDate: '2026-05-15T00:00:00.000Z',
      licenseAgreed: true,
      originalityConfirmed: true,
    },
  })

  // ---------- Blog ----------
  await payload.create({
    collection: 'blog-posts',
    draft: false,
    data: {
      _status: 'published',
      title: 'How to photograph your artwork for a competition entry',
      slug: 'how-to-photograph-artwork-competition',
      authorName: 'Curatone Editorial',
      excerpt:
        'Jurors see your photograph before they see your work. A practical guide to lighting, cropping, and file preparation for competition entries.',
      tags: [{ tag: 'For artists' }, { tag: 'Competitions' }],
      body: rt(
        'Jurors never see your painting — they see your photograph of it. That single fact should change how you prepare an entry.',
        'Shoot in diffused daylight or with two matched light sources at 45 degrees. Fill the frame, keep the camera parallel to the surface, and disable every automatic enhancement your phone offers.',
        'Export at the largest size the entry form allows. A 1200-pixel JPEG of an eight-foot canvas tells the jury nothing about your surface.',
      ),
      publishedDate: '2026-05-20T00:00:00.000Z',
      showOpenCallCta: true,
      seo: {
        seoTitle: 'How to Photograph Your Artwork for a Competition Entry',
        seoDescription: 'Practical guide: lighting, cropping and file preparation for juried art competition entries.',
      },
    },
  })
  await payload.create({
    collection: 'blog-posts',
    draft: false,
    data: {
      _status: 'published',
      title: 'What a numbered certificate actually documents',
      slug: 'what-a-numbered-certificate-documents',
      authorName: 'Curatone Editorial',
      excerpt:
        'Certificates are only as strong as the record behind them. What verifiable recognition means, and what to look for before you add an award to your CV.',
      tags: [{ tag: 'Recognition' }, { tag: 'Competitions' }],
      body: rt(
        'An award certificate is a claim. What makes the claim credible is the public record behind it: a named jury with verifiable credentials, published results, and a certificate number that anyone can check.',
        'Before adding an award to your CV, ask three questions: Is the jury public? Are the results permanently archived? Can the certificate be verified by a third party without contacting you?',
      ),
      publishedDate: '2026-04-12T00:00:00.000Z',
      showOpenCallCta: true,
    },
  })
  await payload.create({
    collection: 'blog-posts',
    draft: false,
    data: {
      _status: 'published',
      title: 'Preparing a journal submission: a checklist for artists and researchers',
      slug: 'journal-submission-checklist',
      authorName: 'Curatone Editorial',
      excerpt: 'Abstract, keywords, references, cover letter — everything the editorial board looks at before your article enters peer review.',
      tags: [{ tag: 'Journal' }, { tag: 'For artists' }],
      body: rt(
        'A journal submission is judged twice: once by reviewers on substance, and before that by editors on completeness. The second judgement is entirely under your control.',
        'Check that your abstract states the question, method, and finding in under 250 words; that keywords are terms a stranger would search; and that every claim in the text has a reference the reviewer can locate.',
      ),
      publishedDate: '2026-03-02T00:00:00.000Z',
      showOpenCallCta: false,
    },
  })

  // ---------- Press ----------
  const pressData = [
    { publication: 'ArtDaily', articleTitle: 'Curatone announces Colors 2026 open call', url: 'https://artdaily.com', date: '2026-06-05T00:00:00.000Z', order: 1 },
    { publication: 'artdeadline.com', articleTitle: 'International juried competition: Colors', url: 'https://artdeadline.com', date: '2026-06-10T00:00:00.000Z', order: 2 },
    { publication: 'DEARTLINE', articleTitle: 'Platform profile: Curatone.art', url: 'https://deartline.com', date: '2026-04-18T00:00:00.000Z', order: 3 },
    { publication: 'Berlin Art Link', articleTitle: 'Online curation and the verifiable record', url: 'https://berlinartlink.com', date: '2026-03-22T00:00:00.000Z', order: 4 },
    { publication: 'KUNSTFORUM', articleTitle: 'Digitale Jurierung: ein Werkstattbericht', url: 'https://kunstforum.de', date: '2026-02-14T00:00:00.000Z', order: 5 },
  ]
  for (const pm of pressData) {
    await payload.create({ collection: 'press-mentions', data: pm as never })
  }

  // ---------- Pages ----------
  const page = async (data: Record<string, unknown>) =>
    payload.create({ collection: 'pages', draft: false, data: { _status: 'published', ...data } as never })

  await page({
    title: 'About Curatone',
    slug: 'about',
    intro:
      'Curatone.art is an international curatorial platform based in Berlin: juried art competitions every seven weeks, a peer-reviewed journal, online exhibitions, and a public, verifiable record of results.',
    sections: [
      {
        heading: 'What we do',
        body: rt(
          'Curatone runs curated international art competitions, publishes the peer-reviewed Curatone Art & Research Journal (ISSN 3054-6621) with DOI-registered articles, and maintains a public jury of credentialed art professionals.',
          'Every result becomes part of a permanent public record: numbered certificates, an archived results gallery, and documented exhibition participation.',
        ),
      },
      {
        heading: 'Why documentation matters',
        body: rt(
          'Recognition only has professional value when it can be verified. Our jury roster is public, results are archived permanently, and every certificate carries a number that can be checked on this site.',
        ),
      },
    ],
    seo: { seoTitle: 'About Curatone — International Curatorial Platform, Berlin', seoDescription: 'Juried competitions, peer-reviewed journal (ISSN 3054-6621), online exhibitions and a verifiable public record. Based in Berlin.' },
  })
  await page({
    title: 'Rules and evaluation criteria',
    slug: 'rules',
    intro: 'How Curatone competitions are run, judged, and documented.',
    sections: [
      {
        heading: 'Entry',
        body: rt(
          'Each competition publishes its categories, fees, and deadline schedule on its page. Works are submitted through the entry form with an image, title, category, and artist information. Submitted works remain private during the entry period.',
        ),
      },
      {
        heading: 'Evaluation',
        body: rt(
          'The full jury scores each entry on a ten-point scale under published criteria: technical execution, originality, and coherence between concept and form. Judging is blind — author names are withheld from jurors until results are finalised.',
        ),
      },
      {
        heading: 'Awards',
        body: rt(
          'Platinum (9.0–10 points), Gold (7.0–8.9), and Silver (5.0–6.9) awards are issued with numbered certificates. Finalists appear in the permanent public results gallery.',
        ),
      },
    ],
    seo: { seoTitle: 'Competition Rules and Evaluation Criteria', seoDescription: 'Entry rules, blind judging on a ten-point scale, and award tiers of Curatone competitions.' },
  })
  await page({
    title: 'Contact',
    slug: 'contact',
    intro: 'Curatone.art · Berlin, Germany',
    sections: [
      {
        heading: 'Get in touch',
        body: rt(
          'For competition questions, personal exhibition applications, journal submissions, or press: contact@curatone.art. We reply within three working days.',
        ),
      },
    ],
    seo: { seoTitle: 'Contact Curatone', seoDescription: 'Contact the Curatone.art curatorial platform in Berlin.' },
  })
  await page({
    title: 'Certificate examples',
    slug: 'certificate-example',
    intro: 'Every award and publication at Curatone is documented with a numbered certificate. Below is what each certificate contains.',
    sections: [
      {
        heading: 'What a certificate contains',
        body: rt(
          'Award certificates carry the artist’s name, the awarded work, the competition and year, the award tier, the certificate number, and the credentials of the jury. Journal publication certificates additionally carry the article DOI.',
          'Any certificate can be verified by its number on this site. Verification is public and does not require an account.',
        ),
      },
    ],
    seo: { seoTitle: 'Certificate Examples — Documented Recognition', seoDescription: 'What Curatone award and publication certificates contain and how to verify them by number.' },
  })
  await page({
    title: 'Impressum',
    slug: 'impressum',
    sections: [
      {
        body: rt(
          'Angaben gemäß § 5 TMG. Curatone.art, Berlin, Deutschland. Kontakt: contact@curatone.art.',
          'Verantwortlich für den Inhalt: Curatone.art. [Vollständige Angaben werden vom Betreiber ergänzt.]',
        ),
      },
    ],
  })
  await page({
    title: 'Datenschutzerklärung',
    slug: 'datenschutz',
    sections: [
      {
        body: rt(
          'Diese Datenschutzerklärung informiert über Art, Umfang und Zweck der Verarbeitung personenbezogener Daten auf curatone.art. [Vollständiger Text wird vom Betreiber ergänzt.]',
        ),
      },
    ],
  })
  await page({
    title: 'AGB',
    slug: 'agb',
    sections: [
      { body: rt('Allgemeine Geschäftsbedingungen für die Teilnahme an Wettbewerben und Dienstleistungen von Curatone.art. [Vollständiger Text wird vom Betreiber ergänzt.]') },
    ],
  })
  await page({
    title: 'Widerrufsbelehrung',
    slug: 'widerruf',
    sections: [{ body: rt('Widerrufsrecht für Verbraucher. [Vollständiger Text wird vom Betreiber ergänzt.]') }],
  })

  // ---------- Homepage global ----------
  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      hero: {
        eyebrow: 'International curatorial platform · Berlin',
        title: 'Juried competitions. Peer-reviewed publication. Documented recognition.',
        lede: 'Curatone runs curated international art competitions every seven weeks, publishes a peer-reviewed journal with DOI-registered articles, and maintains a jury of credentialed art professionals. Every result becomes part of a public, verifiable record.',
        featuredCompetition: colors.id,
      },
      stats: [
        { value: '5+', label: 'Competitions concluded' },
        { value: '15+', label: 'Jury members' },
        { value: '16+', label: 'Countries represented' },
        { value: '850+', label: 'Works submitted' },
        { value: '10+', label: 'Editorial board' },
        { value: 'ISSN 3054-6621', label: 'Peer-reviewed · DOI-registered' },
      ],
      testimonials: [
        {
          quote:
            'My experience with Curatone.art was exciting and very professional. The jurying process was rigorous. I am honored to have won the Colors contest and will put it on my CV with pride.',
          name: 'Amanda Flores',
          attribution: 'Winner, Colors 2025',
        },
        {
          quote:
            'I’m honored and grateful to have been selected as a winner. Curatone.art offers a wonderful community for artists, and participating in this competition has been a very positive experience. Thank you for the recognition and for encouraging creativity.',
          name: 'Meryem Berrada',
          attribution: 'Artist · Winner, Moments of Life 2025',
        },
      ],
      faq: [
        {
          question: 'How are results documented and verified?',
          answer:
            'Every award is issued as a numbered certificate carrying the jury’s credentials and the competition regulations. Results are published in the permanent winners archive and can be verified at curatone.art by certificate number.',
        },
        {
          question: 'Who evaluates the entries?',
          answer:
            'A public jury of art professionals — curators, artists, designers, and historians — listed with full credentials on the jury page. Every entry is scored by the full jury on a ten-point scale.',
        },
        {
          question: 'Is the journal a recognized academic publication?',
          answer:
            'The Curatone Art & Research Journal is peer-reviewed, holds ISSN 3054-6621, and every published article receives a registered DOI. Review is double-blind with two reviewers per article.',
        },
        {
          question: 'Can participation be cited in a professional record?',
          answer:
            'Yes. Awards, exhibition participation, and journal publication are all documented in verifiable form — numbered certificates, a permanent public archive, and DOI-registered articles — and are regularly cited in CVs and grant applications.',
        },
        {
          question: 'How often are competitions held?',
          answer: 'A new competition opens roughly every seven weeks. Each runs an entry period of about two months, followed by jury evaluation and published results.',
        },
        {
          question: 'Is there a fee to participate?',
          answer:
            'Some competitions are free to enter; others charge an entry fee per work, stated on the competition page. Journal submission is currently free; an optional paid certificate is available for published articles.',
        },
      ],
    },
  })

  payload.logger.info('Seed complete.')
  payload.logger.info('Admin: http://localhost:3000/admin — admin@curatone.art / curatone2026')
  process.exit(0)
}

try {
  await seed()
} catch (err) {
  console.error(err)
  process.exit(1)
}
