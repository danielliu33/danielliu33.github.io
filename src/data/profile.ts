/**
 * Single source of truth for the site: identity, links, experience, education,
 * research, publications, patents and the résumé. The home page, About page,
 * HTML résumé and résumé PDF all read from this file, so they never disagree.
 *
 * Career and education dates are years only.
 */

export const site = {
  name: 'Daniel Liu',
  url: 'https://danielliu33.github.io',
  headline: 'I build AI agents, and the evaluations that decide whether they ship.',
  subhead:
    'Founding AI researcher on Meta AI for Business. I work on post-training, evaluation, and agent systems, from research to production.',
  shortBio:
    "I’m Daniel Liu. I spent more than five years at Meta building AI for advertisers: ads ranking, recommendations for small businesses, and finally agents, as a founding AI researcher on Meta AI for Business. In 2026 I founded an AI-native marketing startup and built its multi-agent platform from zero. I work on post-training, evaluation, and agent systems.",
  metaDescription:
    'Daniel Liu, founding AI researcher on Meta AI for Business. Post-training, evaluation, and agent systems, from research to production.',
  focusLine: 'Focused on post-training, evaluation, and agent systems.',
  location: 'San Francisco Bay Area',
  copyrightYear: 2026,
} as const;

/** Email is split so the address never appears whole in the HTML source. */
export const email = {
  user: 'liuchen9494',
  domain: 'gmail.com',
  /** Shown when JavaScript is off. */
  fallback: 'liuchen9494 [at] gmail [dot] com',
} as const;

export const links = {
  linkedin: 'https://www.linkedin.com/in/danielliu88',
  linkedinLabel: 'linkedin.com/in/danielliu88',
  resumePdf: '/resume.pdf',
} as const;

/** About page paragraphs. Inline links use Markdown syntax: [text](https://…). */
export const about: string[] = [
  'I build AI systems that make real decisions for real businesses, and the evaluations that tell you whether to trust them.',
  'I spent more than five years at Meta (2020–2026) and went from Software Engineer to Staff. I started on Messenger Kids ML, moved to Instagram ads ranking, and then led ranking and recommendation work for small-business advertisers. That SMB ads work drove $100M+ in ad platform revenue. My last role at Meta was as a founding AI researcher on Meta AI for Business, Meta’s AI assistant for advertisers. I led its product direction and core agent-system design as it grew into a 100+ person initiative spanning four Meta organizations.',
  'That work left me with one conviction. Models are very good at the intelligence work: plausible recommendations, scenarios, answers. What they can’t do on their own is judgment: knowing which answer fits this business, with this history, chasing these goals. [Sequoia frames this as intelligence versus judgment](https://www.sequoiacap.com/article/services-the-new-software/), and I saw the split from the inside. As models get better, judgment becomes the scarce input. The systems worth building know when to hand a decision back to a person.',
  'In 2026 I founded an AI-native marketing startup to test that idea: a multi-agent platform I built from zero, with human strategists making the calls. As founder I owned engineering and go-to-market, and won multiple paid client engagements.',
  'Before Meta, I did ML research at UIUC: controllable outfit generation with Prof. David Forsyth, and clinical prediction with the DEPEND group in collaboration with Mayo Clinic.',
  'My focus is post-training, evaluation, and agent systems.',
];

export const focusAreas: string[] = [
  'AI agents in production: planning, tool use, memory, and multi-agent orchestration',
  'Post-training and evaluation: deciding what “good” means when there’s no benchmark',
  'Human-in-the-loop design: when an agent should act and when a person should decide',
  'Ranking and recommendation systems',
  'AI for advertisers and small businesses',
];

export interface Chapter {
  title: string;
  years: string;
  bullets: string[];
  /** Indexes of `bullets` shown on the home page timeline (the résumé shows them all). */
  featured?: number[];
}

export interface Role {
  org: string;
  role: string;
  years: string;
  location: string;
  summary?: string;
  bullets: string[];
  /** Indexes of `bullets` shown on the home page timeline (the résumé shows them all). */
  featured?: number[];
  chapters?: Chapter[];
}

export const experience: Role[] = [
  {
    org: 'AI-native marketing startup',
    role: 'Founder',
    years: '2026',
    location: 'San Francisco, CA',
    summary:
      'Founded a startup that paired human strategists with AI-agent workflows for campaign analysis, execution, and reporting.',
    bullets: [
      'Owned engineering and go-to-market as founder, and won multiple paid client engagements.',
      'Built the multi-agent platform from zero: a main agent that delegated to sub-agents, long-running tool use, persistent memory, and a sandboxed execution service.',
      'Split the agent into two modes. Analysis could only read. Execution showed a plan and waited for a person’s approval before changing anything in an ad account.',
      'Connected Meta, Google, LinkedIn, TikTok, and Amazon ad accounts through OAuth. How far the agent could act on each depended on that platform’s ads API.',
      'Shipped scheduled proactive automations, cross-platform reporting on live data, and an in-agent Python analytics sandbox.',
    ],
    featured: [0],
  },
  {
    org: 'Meta',
    role: 'Staff Software Engineer, ML/AI (Software Engineer → Senior → Staff)',
    years: '2020–2026',
    location: 'Menlo Park, CA',
    summary:
      'More than five years building ML and AI systems, from Messenger Kids ML to ads ranking and recommendation, and then to LLM agents for advertisers.',
    bullets: [
      'Led SMB ads work that drove $100M+ in ad platform revenue.',
      'Co-inventor on a published U.S. patent application for LLM-assisted ad creation for small businesses.',
    ],
    featured: [0, 1],
    chapters: [
      {
        title: 'Meta AI for Business — Founding AI Researcher',
        years: '2024–2026',
        bullets: [
          'Founding AI researcher on Meta AI for Business, Meta’s AI assistant that helps advertisers diagnose campaign issues, optimize performance, and create campaigns through natural conversation.',
          'Led product direction and core agent-system design for a 100+ person initiative spanning four Meta organizations, working closely with domain experts.',
          'Built the post-training and evaluation loop end to end: SFT, DPO and GRPO, human and LLM-judge evals, and launch gates.',
          'Designed production agent infrastructure for multi-step planning, tool use, context management, and multi-agent orchestration.',
        ],
        featured: [1, 2],
      },
      {
        title: 'SMB Ads ML — Tech Lead',
        years: '2023–2024',
        bullets: [
          'Tech lead on Meta’s SMB ads ML team, working on ad delivery optimization, recommendation systems, and budget automation for small and mid-sized advertisers.',
          'Shipped Meta’s first ML-powered personalized budget recommendation system for SMB advertisers.',
          'Built feed ranking for small-business surfaces end to end.',
          'Led a workstream of about 10 engineers and 20+ cross-functional partners.',
        ],
        featured: [1],
      },
      {
        title: 'Instagram Ads Ranking & Messenger Kids ML — ML Engineer',
        years: '2020–2023',
        bullets: [
          'Built computer-vision super-resolution for ad images and video, aimed at helping small businesses get better creative without expensive production.',
          'Shipped ML into ads delivery and ranking, including video-template generation, ranking-signal work, and reinforcement-learning-based ad-format personalization.',
          'Built the first ML integrity model for real-time age detection on Messenger Kids, and redesigned the connection-ranking models that help kids connect with friends.',
        ],
      },
    ],
  },
  {
    org: 'Meta',
    role: 'Software Engineer Intern, Speech',
    years: '2020',
    location: 'Menlo Park, CA',
    bullets: [
      'Contributed PyTorch scripting modules (Python and C++) to the open-source Fairseq toolkit.',
      'Built sequence-generation workflows and new text-diversity metrics.',
    ],
  },
  {
    org: 'Google',
    role: 'Software Engineer Intern, Ads Quality',
    years: '2019',
    location: 'Mountain View, CA',
    bullets: [
      'Applied autoencoders and adversarial autoencoders to ads spam detection.',
      'Built pipelines to filter fraudulent URL domains out of ad traffic.',
    ],
  },
];

/** One row in the home-page timeline for the research years before Meta. */
export const researchTimeline = {
  org: 'UIUC',
  role: 'Research Assistant (Prof. David Forsyth; DEPEND group, with Mayo Clinic)',
  years: '2017–2020',
};

export interface Publication {
  authors: string;
  title: string;
  venue: string;
  year: string;
  url: string;
}

export const publications: Publication[] = [
  {
    authors: 'Kedan Li, Chen Liu, David Forsyth',
    title: 'Coherent and Controllable Outfit Generation',
    venue: 'arXiv preprint arXiv:1906.07273',
    year: '2019',
    url: 'https://arxiv.org/abs/1906.07273',
  },
];

export interface Patent {
  title: string;
  detail: string;
  url: string;
}

export const patents: Patent[] = [
  {
    title: 'Methods and Systems to Improve Post Opportunities',
    detail:
      'Co-inventor (as Chen Liu). U.S. Patent Application No. 18/890,540, published as US 2025/0148501 A1. Uses large language models to help small businesses create and improve ads: scoring and revising a post, drafting copy, and suggesting budget and audience. Claims priority to a provisional application titled “Automation to Generate and Proactively Propose Advertising Opportunities.”',
    url: 'https://patents.google.com/patent/US20250148501A1/en',
  },
];

export interface Education {
  school: string;
  degree: string;
  years?: string;
  notes: string;
}

export const education: Education[] = [
  {
    school: 'University of Illinois Urbana-Champaign',
    degree: 'M.S., Computer Engineering',
    years: '2020',
    notes: 'GPA 3.87/4.0',
  },
  {
    school: 'University of Illinois Urbana-Champaign',
    degree: 'B.S., Electrical Engineering',
    notes: 'Graduated with Highest Honors; James Scholar; Dean’s List',
  },
];

export interface Research {
  title: string;
  years: string;
  text: string;
}

export const research: Research[] = [
  {
    title: 'Research Assistant, UIUC — advised by Prof. David Forsyth',
    years: '2018–2020',
    text: 'Built deep CNNs in PyTorch for fashion compatibility and controllable outfit generation. Assembled a 360K-outfit dataset, shipped an iOS app for style-based search, and used DeepLab for image segmentation. The work led to an arXiv preprint.',
  },
  {
    title: 'Research Assistant, UIUC DEPEND Group (Prof. R.K. Iyer), in collaboration with Mayo Clinic',
    years: '2017–2019',
    text: 'Built deep learning models to predict early breast-cancer recurrence and Alzheimer’s progression from longitudinal clinical data, and ran unsupervised analysis of metabolomics data.',
  },
  {
    title: 'ML Research Intern, Mayo Clinic',
    years: '2018',
    text: 'Built reinforcement-learning models for clinical decision-making, validated in simulation.',
  },
];

/* ------------------------------------------------------------------------ */
/* Résumé (HTML at /resume/ and the one-page PDF at /resume.pdf)             */
/* ------------------------------------------------------------------------ */

/** A line with an optional bold lead, e.g. "**Founder** — AI-native …". */
export interface LeadLine {
  lead: string;
  rest: string;
}

export interface ResumeGroup {
  title: string;
  bullets: string[];
}

export interface ResumeEntry {
  heading: LeadLine;
  bullets?: string[];
  groups?: ResumeGroup[];
}

export const resume = {
  summary:
    'AI researcher and engineer working on post-training, evaluation, and agent systems, from research to production.',
  experience: [
    {
      heading: { lead: 'Founder', rest: 'AI-native marketing startup · San Francisco, CA · 2026' },
      bullets: [
        'Founded a startup that paired human strategists with AI-agent workflows for campaign analysis, execution, and reporting. Owned engineering and go-to-market; won multiple paid client engagements.',
        'Built the multi-agent platform from zero: main-agent / sub-agent orchestration, long-running tool use, persistent memory, a sandboxed execution service, and an in-agent Python analytics sandbox.',
        'Designed a read-only analysis mode and an approval-gated execution mode that showed a plan before changing any ad account. Connected Meta, Google, LinkedIn, TikTok, and Amazon through OAuth.',
      ],
    },
    {
      heading: {
        lead: 'Meta',
        rest: 'Staff Software Engineer, ML/AI (Software Engineer → Senior → Staff) · Menlo Park, CA · 2020–2026',
      },
      groups: [
        {
          title: 'Meta AI for Business — Founding AI Researcher · 2024–2026',
          bullets: [
            'Led product direction and core agent-system design for Meta’s AI assistant for advertisers, a 100+ person initiative spanning four Meta organizations.',
            'Built the post-training and evaluation loop end to end: SFT, DPO and GRPO, human and LLM-judge evals, and launch gates.',
            'Designed production agent infrastructure for multi-step planning, tool use, context management, and multi-agent orchestration.',
          ],
        },
        {
          title: 'SMB Ads ML — Tech Lead · 2023–2024',
          bullets: [
            'Tech lead for ad delivery, recommendation, and budget-automation systems for small and mid-sized advertisers. Led SMB ads work that drove $100M+ in ad platform revenue.',
            'Shipped Meta’s first ML-powered personalized budget recommendation system for SMB advertisers. Built feed ranking for small-business surfaces end to end.',
            'Led a workstream of about 10 engineers and 20+ cross-functional partners.',
          ],
        },
        {
          title: 'Instagram Ads Ranking & Messenger Kids ML — ML Engineer · 2020–2023',
          bullets: [
            'Built computer-vision super-resolution for ad images and video, and reinforcement-learning-based ad-format personalization in ads ranking.',
            'Built the first ML integrity model for real-time age detection on Messenger Kids, and redesigned the app’s connection-ranking models.',
          ],
        },
      ],
    },
  ] as ResumeEntry[],
  internships: {
    lead: 'Internships',
    rest: 'Meta, Speech (2020): PyTorch scripting modules for the open-source Fairseq toolkit. Google, Ads Quality (2019): autoencoder-based ads spam detection.',
  } as LeadLine,
  education: {
    heading: {
      lead: 'University of Illinois Urbana-Champaign',
      rest: 'M.S. Computer Engineering (GPA 3.87/4.0), 2020 · B.S. Electrical Engineering, Highest Honors, James Scholar, Dean’s List',
    } as LeadLine,
    bullets: [
      'Research: controllable outfit generation with Prof. David Forsyth (2018–2020); clinical prediction with the DEPEND group and Mayo Clinic (2017–2019).',
    ],
  },
  publications: [
    {
      before: 'Kedan Li, Chen Liu, David Forsyth. “Coherent and Controllable Outfit Generation.” ',
      linkText: 'arXiv:1906.07273',
      url: 'https://arxiv.org/abs/1906.07273',
      after: ', 2019.',
    },
    {
      before:
        '“Methods and Systems to Improve Post Opportunities.” U.S. Patent Application No. 18/890,540, published as ',
      linkText: 'US 2025/0148501 A1',
      url: 'https://patents.google.com/patent/US20250148501A1/en',
      after: '. Co-inventor (as Chen Liu).',
    },
  ],
  skills:
    'Python, C++, SQL, TypeScript · PyTorch · Post-training (SFT, DPO, GRPO) · Evaluation design (human and LLM-judge) · LLM agents and multi-agent orchestration · Ranking and recommender systems · Reinforcement learning · Computer vision · Spark, Docker, Kubernetes, FastAPI, AWS',
};
