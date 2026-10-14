/**
 * Single source of truth for the site: identity, links, the home-page bio,
 * the work and papers lists, and the CV. The home page, the /cv/ page and the
 * CV PDF (public/cv.pdf) all read from this file, so they never disagree.
 *
 * Career and education dates are years only.
 */

export const site: {
  name: string;
  url: string;
  headline: string;
  metaDescription: string;
  location: string;
  copyrightYear: number;
  photo: string;
} = {
  name: 'Daniel Liu',
  url: 'https://danielliu33.github.io',
  /** First line of the bio; also the alt text of the social image. */
  headline: 'I build AI agents, and the evaluations that decide whether they ship.',
  metaDescription:
    'Daniel Liu builds AI agents, and the evaluations that decide whether they ship. Previously a founding AI researcher on Meta AI for Business.',
  location: 'San Francisco Bay Area',
  copyrightYear: 2026,
  /**
   * Home-page photo. Empty: the home page is a single column. To show one, put
   * the file at public/photo.jpg and set photo: '/photo.jpg' (JPEG, PNG or
   * WebP; its size is read at build time). It is shown about 180px wide to the
   * left of the bio (above it on phones).
   */
  photo: '/photo.jpg',
};

/** Email is split so the address never appears whole in the HTML source. */
export const email = {
  user: 'liuchen9494',
  domain: 'gmail.com',
  /** Shown when JavaScript is off. */
  fallback: 'liuchen9494 [at] gmail [dot] com',
} as const;

export const links: Record<'linkedin' | 'linkedinLabel' | 'twitter' | 'cvPdf' | 'cvFileName', string> = {
  linkedin: 'https://www.linkedin.com/in/danielliu88',
  linkedinLabel: 'linkedin.com/in/danielliu88',
  /**
   * Full profile URL, e.g. 'https://x.com/yourhandle'. Empty hides every
   * Twitter link (home page, CV, JSON-LD, social meta).
   */
  twitter: 'https://x.com/_danielliu_',
  /** The CV PDF, written by `npm run pdf`. */
  cvPdf: '/cv.pdf',
  cvFileName: 'Daniel-Liu-CV.pdf',
};

const twitterPattern = /^https:\/\/(?:x|twitter)\.com\/([A-Za-z0-9_]{1,15})$/;

/**
 * Accepts the forms a share sheet or address bar produces
 * ('https://www.x.com/handle/', 'https://x.com/handle?s=21', 'x.com/handle')
 * and reduces them to 'https://x.com/handle'.
 */
function normalizeTwitter(raw: string): string {
  let url = raw.trim().replace(/[?#].*$/, '').replace(/\/$/, '');
  if (!/^https?:\/\//.test(url)) url = `https://${url}`;
  return url.replace(/^http:/, 'https:').replace(/^https:\/\/www\./, 'https://');
}

/** Twitter/X profile, or null when links.twitter is empty. */
export const twitter = (() => {
  if (!links.twitter.trim()) return null;
  const m = normalizeTwitter(links.twitter).match(twitterPattern);
  if (!m) {
    throw new Error(`profile.ts: links.twitter must look like https://x.com/handle (got "${links.twitter}")`);
  }
  return { url: `https://x.com/${m[1]}`, handle: `@${m[1]}`, label: `x.com/${m[1]}` };
})();

/**
 * Home-page bio: one short paragraph each. Inline links use Markdown syntax,
 * [text](https://…) or [text](/path/).
 */
export const bio: string[] = [
  'I build AI agents, and the evaluations that decide whether they ship.',
  'In 2026, I founded an AI-native marketing startup and built its [multi-agent platform](/work/multi-agent-marketing-platform/) from zero.',
  'Before that, from 2020 to 2026, I was at Meta, most recently as a founding AI researcher on [Meta AI for Business](/work/meta-ai-for-business/), where I worked on post-training, evaluation, and agents.',
  'I led product direction and core agent-system design for Meta’s AI assistant for advertisers, which grew into a 100+ person initiative spanning four Meta organizations.',
  'Earlier at Meta, I led ranking and recommendation work for small-business advertisers, including Meta’s first ML-powered personalized [budget recommendations](/work/smb-ads-budget-recommendations/). That work drove $100M+ in ad platform revenue.',
  'I studied electrical and computer engineering at UIUC, where I did ML research with [David Forsyth](https://siebelschool.illinois.edu/about/people/all-faculty/daf) on [controllable outfit generation](https://arxiv.org/abs/1906.07273).',
];

/**
 * "Work" on the home page and /work/, in this order. `slug` is a file in
 * src/content/work/ (its years come from that file's front matter).
 */
export const selectedWork: { slug: string; text: string }[] = [
  { slug: 'multi-agent-marketing-platform', text: 'Built a multi-agent marketing platform from zero.' },
  { slug: 'meta-ai-for-business', text: 'Defined “good” for an AI assistant that advises advertisers.' },
  { slug: 'smb-ads-budget-recommendations', text: 'Helped small advertisers decide how much to spend.' },
];

/** "Papers & patents" on the home page and /work/. Years only. */
export const papers: { year: string; title: string; url: string; note: string }[] = [
  {
    year: '2025',
    title: 'Methods and systems to improve post opportunities',
    url: 'https://patents.google.com/patent/US20250148501A1/en',
    note: 'U.S. patent application, co-inventor (as Chen Liu)',
  },
  {
    year: '2019',
    title: 'Coherent and controllable outfit generation',
    url: 'https://arxiv.org/abs/1906.07273',
    note: 'arXiv preprint, with Kedan Li and David Forsyth',
  },
];

/* ------------------------------------------------------------------------ */
/* CV (HTML print source at /cv/, PDF at /cv.pdf via `npm run pdf`)          */
/* ------------------------------------------------------------------------ */

export interface CvEntry {
  heading: string;
  /** Link for the heading (publications, patents). */
  url?: string;
  subheading?: string;
  years?: string;
  bullets?: string[];
  /** Roles nested under one employer (shown indented, without repeating it). */
  chapters?: CvEntry[];
}

export interface CvSection {
  title: string;
  /** 'inline' renders each entry as one line: "Heading: subheading". */
  layout?: 'inline';
  entries: CvEntry[];
}

export const cv: { summary: string; sections: CvSection[] } = {
  summary:
    'AI researcher and engineer working on post-training, evaluation, and agent systems, from research to production.',
  sections: [
    {
      title: 'Experience',
      entries: [
        {
          heading: 'AI-native marketing startup',
          subheading: 'Founder',
          years: '2026',
          bullets: [
            'Built a multi-agent marketing platform from zero. Owned engineering and go-to-market, and won multiple paid client engagements.',
            'Designed two modes: read-only analysis, and execution that waited for a person’s approval before changing anything in an ad account.',
            'Connected Meta, Google, LinkedIn, TikTok, and Amazon ad accounts through OAuth.',
          ],
        },
        {
          heading: 'Meta',
          subheading: 'Staff Software Engineer, ML/AI (promoted from Software Engineer to Senior to Staff)',
          years: '2020–2026',
          bullets: [
            'More than five years building ML and AI systems, from Messenger Kids ML to ads ranking and recommendation, and then to LLM agents for advertisers.',
          ],
          chapters: [
            {
              heading: 'Meta AI for Business — Founding AI Researcher',
              years: '2024–2026',
              bullets: [
                'Founding AI researcher on Meta’s AI assistant for advertisers.',
                'Led product direction and core agent-system design for a 100+ person initiative spanning four Meta organizations.',
                'Built the post-training and evaluation loop end to end: SFT, DPO and GRPO, human and LLM-judge evals, and launch gates.',
              ],
            },
            {
              heading: 'SMB Ads ML — Tech Lead',
              years: '2023–2024',
              bullets: [
                'Tech lead on ad delivery optimization and recommendation systems for small and mid-sized advertisers.',
                'Shipped Meta’s first ML-powered personalized budget recommendation system for SMB advertisers.',
                'Led SMB ads work that drove $100M+ in ad platform revenue.',
              ],
            },
            {
              heading: 'Instagram Ads Ranking & Messenger Kids ML — ML Engineer',
              years: '2020–2023',
              bullets: ['Shipped ML into Instagram ads ranking and delivery.', 'Started at Meta on Messenger Kids ML.'],
            },
          ],
        },
        {
          heading: 'Meta',
          subheading: 'Software Engineer Intern, Speech',
          years: '2020',
          bullets: ['Contributed to the open-source Fairseq toolkit.'],
        },
        {
          heading: 'Google',
          subheading: 'Software Engineer Intern, Ads Quality',
          years: '2019',
          bullets: ['Worked on ML for ads spam detection.'],
        },
      ],
    },
    {
      title: 'Education',
      entries: [
        {
          heading: 'University of Illinois Urbana-Champaign',
          years: '2020',
          bullets: [
            'M.S., Computer Engineering · GPA 3.87/4.0',
            'B.S., Electrical Engineering · Highest Honors · James Scholar · Dean’s List',
          ],
        },
      ],
    },
    {
      title: 'Research Experience',
      entries: [
        {
          heading: 'UIUC',
          subheading: 'Research Assistant, advised by Prof. David Forsyth',
          years: '2018–2020',
          bullets: [
            'Deep learning for fashion compatibility and controllable outfit generation, which led to an arXiv preprint.',
          ],
        },
        {
          heading: 'UIUC',
          subheading: 'Research Assistant, DEPEND Group (Prof. R.K. Iyer), in collaboration with Mayo Clinic',
          years: '2017–2019',
          bullets: ['Deep learning for clinical outcome prediction from longitudinal patient data.'],
        },
      ],
    },
    {
      title: 'Publications & patents',
      entries: [
        {
          heading: 'Methods and Systems to Improve Post Opportunities',
          url: 'https://patents.google.com/patent/US20250148501A1/en',
          subheading: 'U.S. Patent Application Publication US 2025/0148501 A1 · co-inventor (as Chen Liu)',
          years: '2025',
          bullets: ['Uses large language models to help small businesses create and improve ads.'],
        },
        {
          heading: 'Coherent and Controllable Outfit Generation',
          url: 'https://arxiv.org/abs/1906.07273',
          subheading: 'Kedan Li, Chen Liu, David Forsyth · arXiv preprint arXiv:1906.07273',
          years: '2019',
        },
      ],
    },
    {
      title: 'Skills',
      layout: 'inline',
      entries: [
        { heading: 'Languages', subheading: 'Python, C++, SQL, TypeScript' },
        {
          heading: 'Machine learning',
          subheading:
            'PyTorch · post-training (SFT, DPO, GRPO) · evaluation design (human and LLM-judge evals) · LLM agents and multi-agent orchestration · ranking and recommender systems · reinforcement learning · computer vision',
        },
        { heading: 'Infrastructure', subheading: 'Spark, Docker, Kubernetes, FastAPI, AWS' },
      ],
    },
  ],
};
