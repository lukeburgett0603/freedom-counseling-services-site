// Psychology Today profile guide (Get found → Psychology Today). Approved
// by Luke 2026-11-07: Self-Guided gets this guide and template; Done for
// You rewrites the counselor's profile at the start and twice a year;
// Group Practice, the owner's profile only. The same five steps appear in
// CMC's instant audit (counselor-marketing-co-site src/lib/audit/guide.ts).
// Keep them in step.

export const PT_STEPS: { title: string; body: string }[] = [
  {
    title: 'Match your website exactly.',
    body: 'Use the same practice name, address, and phone number as your website. A different number on a directory is a common mistake, and it confuses both clients and Google.',
  },
  {
    title: 'Open with the client, not your credentials.',
    body: "Two or three sentences, in their words, about what they're struggling with, then how you help. Credentials and training come later in the profile.",
  },
  {
    title: 'Say who you see and how.',
    body: 'Name your top specialties, who you see (ages, couples, families), your fees or insurance, and whether you offer telehealth.',
  },
  {
    title: 'Add a recent, warm photo.',
    body: 'A clear, friendly headshot taken in the last few years. Add a short video too if your plan allows it.',
  },
  {
    title: 'Link to your website.',
    body: 'People who want to know more land on your pages, where your appointment request form is.',
  },
];

// Fill-in template for the profile's opening. Brackets are for the
// counselor to replace; never a real client's details.
export function openingTemplate(practiceName: string): string {
  return [
    "[Name the struggle in your client's words, e.g. \"You lie awake replaying the day, and the worry follows you into every conversation.\"] [One more sentence about how it's affecting their life.]",
    '',
    "You don't have to figure this out alone. [How you help, in plain words, e.g. \"Together we'll find what's driving the anxiety and practice tools that work in real life.\"]",
    '',
    `I work with [who you see: ages, individuals, couples, families] dealing with [your top 2-3 specialties]. Sessions are [in person in your city / by telehealth / both]. [Your fee, or the insurance you take.]`,
    '',
    `If you're ready to take the next step, request an appointment through the ${practiceName} website or call [phone].`,
  ].join('\n');
}

export const PT_DONTS = [
  'Never describe a real client, even with details changed.',
  "Don't promise results (\"You'll feel better in six sessions\").",
  "Don't open with a list of degrees and certifications.",
];
