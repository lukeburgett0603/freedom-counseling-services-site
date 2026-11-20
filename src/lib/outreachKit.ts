// Referral partner outreach kit: the "Get Referred" step's ready-to-send
// messages, personalized from the partner record and the practice's own
// live data (admin/referral-partners.astro). Plain text, so it works in any
// email app, a printed note, or a copy-paste.
//
// Two ethics rules shape every template:
//   - ACA Code of Ethics A.10.b: no commissions, rebates, or any other
//     remuneration for referrals. Nothing here offers a partner anything
//     of value in exchange for sending clients.
//   - Confidentiality: nothing names a client or confirms someone became a
//     client. The thank-you note is deliberately general. Coordinating
//     care with a partner always needs the client's signed release.

export type OutreachTemplateKey = 'intro_email' | 'follow_up_email' | 'drop_off_note' | 'thank_you_note' | 'availability_update';

export const OUTREACH_TEMPLATES: { key: OutreachTemplateKey; label: string; activityType: string; hasSubject: boolean }[] = [
  { key: 'intro_email', label: 'Introduction email', activityType: 'email', hasSubject: true },
  { key: 'follow_up_email', label: 'Follow-up email (no reply after ~2 weeks)', activityType: 'email', hasSubject: true },
  { key: 'drop_off_note', label: 'Note to leave with the practice handout', activityType: 'visit', hasSubject: false },
  { key: 'thank_you_note', label: 'Thank-you note (after they start referring)', activityType: 'thank_you', hasSubject: false },
  // Step 6 (0087): who has openings, from live counselor availability.
  { key: 'availability_update', label: 'Availability update (who has openings)', activityType: 'email', hasSubject: true },
];

export type OutreachCounselor = {
  name: string;
  specialties: string[];
  accepting: boolean;
  telehealth: boolean;
  // Step 6: the counselor's website status, and whether they joined recently.
  availability?: 'accepting' | 'almost_full' | 'not_accepting' | null;
  isNew?: boolean;
};

export type OutreachInput = {
  partnerName: string;
  partnerCategory: string;
  contactName: string | null;
  practiceName: string;
  phone: string | null;
  website: string;
  city: string | null;
  responseNote: string | null;
  counselors: OutreachCounselor[];
  offersFaithIntegration: boolean;
  signer: string;
};

type CategoryContext = {
  // Used verbatim after "for", "among", "give": always includes its own
  // possessive ("your patients", "the people you work with").
  audience: string;
  why: string; // why their people might need counseling
  close: string; // how we'd work alongside them
};

// Grouped so the tone fits the partner: medical, legal, faith, school,
// and a general fallback for employers and other professionals.
function contextFor(category: string, input: OutreachInput): CategoryContext {
  switch (category) {
    case 'physician':
      return {
        audience: 'your patients',
        why: 'Many of the patients you see for sleep problems, stress-related symptoms, or chronic health conditions are also carrying anxiety, depression, or grief, and a short visit rarely leaves room to address it.',
        close: 'With a signed release from the patient, we are glad to coordinate care and keep you informed.',
      };
    case 'pediatrician':
      return {
        audience: 'the families you care for',
        why: 'Pediatricians are often the first to notice when a child or teen is struggling with anxiety, school stress, big family changes, or shifts in mood and behavior.',
        close: "With a signed release from the parent or guardian, we are glad to coordinate care and keep you informed.",
      };
    case 'mental_health':
      return {
        audience: 'your clients',
        why: "When your schedule is full, or a client needs a specialty or format you don't offer, it helps to know a practice you can refer to with confidence.",
        close: 'With a signed release, we are glad to coordinate care, and we are happy to refer clients your way when your services are the better fit.',
      };
    case 'attorney':
      return {
        audience: 'your clients',
        why: 'People going through divorce, custody changes, or the aftermath of an accident or injury often need emotional support alongside legal help.',
        close: 'Please note that our counselors provide therapy, not custody evaluations or expert testimony, which keeps the counseling relationship focused on the client.',
      };
    case 'church':
      return {
        audience: 'your congregation',
        why: "Pastors and church staff are often the first people someone talks to when they're struggling. When a need goes beyond what pastoral care can offer, it helps to have a counseling practice you can point people to with confidence.",
        close: input.offersFaithIntegration
          ? "We offer counseling that integrates Christian faith for anyone who wants it, and we always follow the client's lead on how much faith is part of their care."
          : 'We are glad to work alongside the pastoral care you already provide.',
      };
    case 'school':
      return {
        audience: 'your students and their families',
        why: "School counselors do important work, and some students need ongoing support outside school for anxiety, grief, family changes, or confidence and self-esteem.",
        close: 'With a signed release from a parent or guardian, we are glad to coordinate with your team.',
      };
    default:
      return {
        audience: 'the people you work with',
        why: 'Stress at work or at home, anxiety, grief, and relationship strain affect people in every setting, and many never know where to start looking for help.',
        close: 'We are glad to be a practice you can recommend with confidence.',
      };
  }
}

// "Pastor Mike Allen" -> "Hi Pastor Allen,"; "Dr. Sarah Lee" -> "Hi Dr. Lee,";
// "Mike Allen" -> "Hi Mike,". A title is never mistaken for a first name.
const TITLES = new Set(['pastor', 'dr', 'dr.', 'rev', 'rev.', 'reverend', 'father', 'fr', 'fr.', 'mr', 'mr.', 'mrs', 'mrs.', 'ms', 'ms.', 'mx', 'mx.', 'judge', 'elder', 'deacon', 'bishop', 'rabbi', 'imam']);

function greeting(input: OutreachInput): string {
  const parts = (input.contactName ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Hello,';
  if (TITLES.has(parts[0].toLowerCase())) {
    return parts.length > 1 ? `Hi ${parts[0]} ${parts.at(-1)},` : `Hi ${parts[0]},`;
  }
  return `Hi ${parts[0]},`;
}

// Emails sign off without the website: a link and a block of contact
// details make a note read like marketing (Gmail's Promotions tab).
function signature(input: OutreachInput, withWebsite = true): string {
  return [input.signer.trim() || '[Your name]', input.practiceName, input.phone, withWebsite ? input.website : null].filter(Boolean).join('\n');
}

function withPeriod(text: string): string {
  const t = text.trim();
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

function howToRefer(input: OutreachInput): string {
  const phone = input.phone ? `call us at ${input.phone} or ` : '';
  const response = input.responseNote?.trim() ? ` ${withPeriod(input.responseNote)}` : '';
  return `Referring is simple: anyone can ${phone}reach out through ${input.website}. No referral form is needed.${response}`;
}

// Specialty labels are title case ("Grief & Life Transitions"); mid-sentence
// they read better lowercased, except acronyms (EMDR, OCD) and a few proper
// words (Christian...).
const PROPER = new Set(['christian', 'biblical', 'catholic', 'jewish', 'muslim', 'spanish', 'english', 'god']);
function midSentence(label: string): string {
  return label
    .split(' ')
    .map((w) => (/^[A-Z0-9&+]{2,}[s']?$/.test(w) || /[A-Z].*[A-Z]/.test(w) || PROPER.has(w.toLowerCase().replace(/[^a-z]/g, '')) ? w : w.toLowerCase()))
    .join(' ');
}
function listOf(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`;
}

// The availability update (step 6): one line per counselor with room, from
// the status shown on the website. Full counselors are left out; if nobody
// has room, it says so plainly. Short, no links (Gmail Promotions lesson).
function availabilityLines(input: OutreachInput): string[] {
  const firstName = (name: string) => name.split(',')[0].trim();
  const open = input.counselors.filter((c) => c.availability === 'accepting' || c.availability === 'almost_full');
  return open.map((c) => {
    const focus = c.specialties.slice(0, 3).map(midSentence);
    const room = c.availability === 'almost_full' ? 'has a few openings left' : 'has openings for new clients';
    const joined = c.isNew ? ' (recently joined our team)' : '';
    return `- ${firstName(c.name)}${joined} ${room}${focus.length ? `: ${listOf(focus)}` : ''}`;
  });
}

export function buildOutreachMessage(key: OutreachTemplateKey, input: OutreachInput): { subject: string; body: string } {
  const ctx = contextFor(input.partnerCategory, input);
  const partner = input.partnerName.trim();

  switch (key) {
    // The two emails are short personal notes with one ask, no list of
    // services, no "accepting new clients", no links (2026-11-19: the fuller
    // version landed in Gmail's Promotions tab in Luke's live test; a plain
    // two-line note landed in Primary). The details travel with the handout
    // and the conversation.
    case 'intro_email':
      return {
        subject: 'Quick introduction',
        body: [
          greeting(input),
          `I'm reaching out from ${input.practiceName}, a counseling practice${input.city ? ` in ${input.city}` : ''}. ${ctx.why}`,
          `I'd love to be a resource for ${ctx.audience}. Would you be open to a short call, or to me stopping by ${partner} to drop off some information for your team?`,
          `Thank you,`,
          signature(input, false),
        ].join('\n\n'),
      };
    case 'follow_up_email':
      return {
        subject: 'Following up',
        body: [
          greeting(input),
          `I wanted to follow up on my note from a couple of weeks ago. I know how full your days are.`,
          `I'm still glad to stop by with some information for your team, or to answer any questions by phone. Would either of those work?`,
          `Thank you,`,
          signature(input, false),
        ].join('\n\n'),
      };
    case 'drop_off_note':
      return {
        subject: '',
        body: [
          greeting(input),
          `Thank you for taking a moment with this. ${input.practiceName} is a local counseling practice, and I've included a one-page overview of our counselors and what we help with.`,
          `If someone among ${ctx.audience} could use support, ${howToRefer(input).charAt(0).toLowerCase()}${howToRefer(input).slice(1)}`,
          ctx.close,
          `Please keep this sheet anywhere it's handy. I'd welcome the chance to talk about how we can support the people you serve.`,
          signature(input),
        ].join('\n\n'),
      };
    case 'availability_update': {
      const lines = availabilityLines(input);
      const reach = input.phone ? `As always, anyone can reach us at ${input.phone}.` : 'As always, anyone can reach out to us directly.';
      return {
        subject: 'Quick update on openings',
        body: [
          greeting(input),
          lines.length
            ? `A quick update in case it helps when someone among ${ctx.audience} needs support. Here's who has room right now:\n\n${lines.join('\n')}`
            : `A quick update: our counselors are full right now. If someone among ${ctx.audience} needs support, please still send them our way. We'll help them find the soonest opening or another good option.`,
          reach,
          `Thank you,`,
          signature(input, false),
        ].join('\n\n'),
      };
    }
    case 'thank_you_note':
      // Deliberately general: never names a client or confirms that anyone
      // became a client (confidentiality; a signed release would be needed).
      return {
        subject: '',
        body: [
          greeting(input),
          `Thank you for thinking of ${input.practiceName} when the people you serve need support. That trust means a great deal to our whole team.`,
          `If there's ever anything that would make referring easier, or information your team would find helpful, please let me know.`,
          `With gratitude,`,
          signature(input),
        ].join('\n\n'),
      };
  }
}

export const OUTREACH_GUIDELINES = [
  'Never offer or accept anything of value in exchange for referrals: no gift cards, fees, or referral bonuses (ACA Code of Ethics A.10.b). A thank-you note is always fine.',
  "Never name a client, or confirm that someone became a client, without the client's signed release. Thank-you notes stay general.",
  'Coordinating care (sharing updates with a doctor or school) requires a signed release of information first.',
  'Aim for a few relationships built on trust rather than a long list of names you contacted once.',
  'Follow up about two weeks after an intro with no reply, then every few months with something useful, not just a reminder.',
  'Log every touch on the partner record so the whole team can see where each relationship stands.',
];
