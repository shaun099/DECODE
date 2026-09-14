// Pure Password Finding logic: clue definitions, fake-website content, and
// answer checking. No React — kept separate so the puzzle data and
// validation can be reused or tested, mirroring the Sudoku game's split.

export interface ClueDef {
  id: number;
  label: string;
  prompt: string;
}

export interface Section {
  heading?: string;
  body: string;
}

export interface SitePage {
  id: string;
  nav: string;
  title: string;
  sections: Section[];
}

export const CLUES: ClueDef[] = [
  {
    id: 0,
    label: "Part 1",
    prompt: "I am a month",
  },
  {
    id: 1,
    label: "Part 2",
    prompt: "I am a two-digit number.",
  },
  {
    id: 2,
    label: "Part 3",
    prompt: "I'm the project that never made it to launch.",
  },
  {
    id: 3,
    label: "Part 4",
    prompt: "I am a place. Our servers live here, even though our people don't.",
  },
];

// Correct answers, normalized (lowercase, trimmed) for comparison.
const ANSWER: string[] = ["march", "31", "atlas", "reykjavik"];

export function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/** Per-part correctness for a set of 4 guesses, in clue order. */
export function checkParts(guesses: string[]): boolean[] {
  return ANSWER.map((correct, i) => normalize(guesses[i] ?? "") === correct);
}

export function isPasswordCorrect(guesses: string[]): boolean {
  return checkParts(guesses).every(Boolean);
}

/** Display-cased version of the password, shown on the victory screen. */
export const DISPLAY_PASSWORD = "March31AtlasReykjavik";

export const FOOTER_NOTE =
  "Data hosted securely in our Reykjavik data center. © Halcyon Systems.";

export const SITE_PAGES: SitePage[] = [
  {
    id: "home",
    nav: "Home",
    title: "Halcyon Systems",
    sections: [
      {
        body: "Quietly powering the smart home. Halcyon builds sensors and assistants that fade into the background of everyday life, so your home just works without you thinking about it.",
      },
      {
        heading: "Our mission",
        body: "We believe technology should disappear into the background. Every product we ship is judged first on how little attention it demands from the people using it.",
      },
      {
        heading: "Trusted worldwide",
        body: "Halcyon devices are active in homes across more than 40 countries, supported by a growing network of regional partners and installers.",
      },
      {
        heading: "What's new",
        body: "Our latest device, Halo One, has been the centerpiece of our year — read more about its launch and the road that got us here on our Blog page.",
      },
    ],
  },
  {
    id: "about",
    nav: "About",
    title: "About Us",
    sections: [
      {
        heading: "Our story",
        body: "Halcyon Systems was officially founded in March 2016 by three university friends who bonded over a shared frustration with clunky home automation.",
      },
      {
        heading: "Timeline",
        body: "A working prototype came together in April 2015, seed funding closed in January 2016, and the company's first full-time hire started the same month the paperwork was filed. A small public launch event followed that June, once the first batch of devices was ready to demo.",
      },
      {
        heading: "By the numbers",
        body: "Today our team has grown to 47 engineers, designers, and support staff spread across two offices, with a handful of remote specialists rounding things out.",
      },
      {
        heading: "Almost a different company",
        body: "We nearly launched under the name Solace Systems, but a trademark conflict sent us back to the drawing board — Halcyon stuck, and in hindsight we're glad it did.",
      },
      {
        heading: "Our values",
        body: "We optimize for calm, not novelty. A Halcyon product that nobody notices is doing its job perfectly. We'd rather ship something quiet and reliable than loud and fragile.",
      },
      {
        heading: "Awards & recognition",
        body: "Halcyon was named Innovator of the Year at a ceremony in Las Vegas, and more recently took runner-up honors for Best Startup at Berlin's annual tech awards.",
      },
    ],
  },
  {
    id: "team",
    nav: "Team",
    title: "Meet the Team",
    sections: [
      {
        heading: "Maria Ortiz — CEO & Co-founder",
        body: "Born in October, Maria studied robotics at MIT before co-founding Halcyon in her dorm room. She still reviews every industrial design sketch personally.",
      },
      {
        heading: "Sam Rivera — Lead Engineer",
        body: "Employee #21, Sam badges into the Austin office before sunrise most days and rarely misses a stand-up. Sam led the firmware team through Halo One's entire development cycle.",
      },
      {
        heading: "Priya Nandan — Head of Design",
        body: "Born in July, Priya leads the studio behind Halo One's quiet, unobtrusive look and feel. Before Halcyon she designed medical devices, which she says taught her to obsess over small details.",
      },
      {
        heading: "Jonas Weber — Berlin Office Lead",
        body: "Jonas has run our Berlin satellite office since it opened in 2019, growing the local team from two people to a full engineering pod.",
      },
      {
        heading: "David Kim — Head of Security",
        body: "Employee #12, David joined from a background in industrial control systems and now oversees everything from building access badges to data center audits.",
      },
      {
        heading: "Elena Petrova — VP of Operations",
        body: "Born in April, Elena keeps the company's day-to-day running smoothly, including oversight of our infrastructure partners and the Reykjavik facility.",
      },
      {
        heading: "Our culture",
        body: "We're a small team that likes long lunches and short meetings. Most of the company works from Austin, with Berlin handling European operations and support.",
      },
    ],
  },
  {
    id: "products",
    nav: "Products",
    title: "Products",
    sections: [
      {
        heading: "Halo One (Model 9X)",
        body: "Our flagship device learns a household's rhythms and adjusts lighting, temperature, and air quality without being asked. It retails for $249 and ships with a two-year warranty.",
      },
      {
        heading: "Halo Mini",
        body: "A compact version of Halo One aimed at single rooms and apartments, currently scheduled to launch in November.",
      },
      {
        heading: "Under the hood",
        body: "Every Halo device runs on a low-power chipset designed to sip battery for months between charges, paired with a mesh radio for reliable in-home connectivity.",
      },
      {
        heading: "Compatibility",
        body: "Halo devices work alongside most major smart-home ecosystems, and firmware updates roll out automatically overnight so nobody has to think about it.",
      },
    ],
  },
  {
    id: "blog",
    nav: "Blog",
    title: "News & Updates",
    sections: [
      {
        heading: "Halo One Launches!",
        body: "We launched Halo One this June, and the reception from beta families has been incredible. Pre-orders sold out within the first week.",
      },
      {
        heading: "Halcyon at CES",
        body: "Our team demoed Halo One live in Las Vegas this year, and the crowds did not disappoint. We handed out more demo units than we packed.",
      },
      {
        heading: "Project Atlas Cancelled",
        body: "After two years in development, Halcyon Systems has officially cancelled Project Atlas, citing supply-chain issues that made the sensor package unviable. The team has since moved to Project Nova, which launched successfully last spring.",
      },
      {
        heading: "Employee Spotlight: Sam Rivera",
        body: "This month we're spotlighting Employee #11, Sam Rivera, who joined the firmware team back in March 2018 and has shipped every Halo release since.",
      },
      {
        heading: "Company Culture Roundup",
        body: "We celebrate Founders Day every September with a team offsite. This year's theme was, fittingly, 'quiet spaces.'",
      },
      {
        heading: "Halcyon Hits 50,000 Homes",
        body: "A small milestone worth sharing: Halo One is now active in more than 50,000 homes worldwide, just over a year after launch.",
      },
    ],
  },
  {
    id: "careers",
    nav: "Careers",
    title: "Careers",
    sections: [
      {
        heading: "Open roles",
        body: "New graduate applications close every September 15. Most interviews take place at Suite 12, Halcyon Tower.",
      },
      {
        heading: "What you'll work on",
        body: "New hires get a hands-on demo of Halo One (Model 9X) during onboarding week, followed by a rotation across firmware, design, and support.",
      },
      {
        heading: "Interview process",
        body: "Expect a recruiter call, a technical or portfolio round, and a final conversation with the team lead — usually wrapped up within two weeks.",
      },
    ],
  },
  {
    id: "security",
    nav: "Security",
    title: "Security & Infrastructure",
    sections: [
      {
        heading: "Where your data lives",
        body: "We operate our primary data center in Reykjavik, Iceland, chosen for its cool climate and access to renewable geothermal power — no engineers are stationed there full-time.",
      },
      {
        heading: "Backup & redundancy",
        body: "A secondary backup facility is maintained in Dublin, Ireland, mirroring our primary systems in case of outage.",
      },
      {
        heading: "Physical security",
        body: "Our offices in Austin and Berlin use badge-controlled access at every entrance, with visitor logs retained for compliance purposes.",
      },
      {
        heading: "Encryption",
        body: "All data in transit and at rest is encrypted, and access to production systems requires two-factor authentication for every employee.",
      },
    ],
  },
  {
    id: "contact",
    nav: "Contact",
    title: "Contact Us",
    sections: [
      {
        heading: "Headquarters",
        body: "123 Founders Way, Suite 12, Austin, TX 78701.",
      },
      {
        heading: "Satellite office",
        body: "Halcyon Berlin, Germany — open Monday through Friday.",
      },
      {
        heading: "General inquiries",
        body: "hello@halcyonsystems.example",
      },
      {
        heading: "Support hours",
        body: "Our support team is available from 8am to 8pm, Central Time, seven days a week.",
      },
    ],
  },
  {
    id: "faq",
    nav: "FAQ",
    title: "Frequently Asked Questions",
    sections: [
      {
        heading: "Where is Halcyon based?",
        body: "Our headquarters is in Austin, Texas, with a satellite office in Berlin, Germany.",
      },
      {
        heading: "When was Halcyon founded?",
        body: "Halcyon Systems was officially founded in March 2016.",
      },
      {
        heading: "What happened to Project Atlas?",
        body: "Project Atlas was cancelled after two years in development due to supply-chain issues, and never reached launch.",
      },
      {
        heading: "What's your return policy?",
        body: "Halo devices can be returned within 31 days of delivery for a full refund, no questions asked.",
      },
    ],
  },
];