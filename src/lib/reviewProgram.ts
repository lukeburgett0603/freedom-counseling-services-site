// Copy for the ethical review program (admin/review-program.astro): the
// waiting-room sign and the three templates a practice uses. Kept in one
// file so the wording can be reviewed as a whole. Every piece follows the
// same rule: never ask a current or former client for a review (ACA Code
// of Ethics C.3.b), never incentivize or selectively ask (Google's review
// policy), never respond in a way that confirms someone is a client.

export const SIGN_COPY = {
  heading: 'Your story could help someone take their first step',
  body: "If counseling here has been meaningful to you, you're welcome to share a review. It's completely optional, no one here will ask you, and it has no effect on your care.",
  qrCaption: 'Scan to read about privacy and leave a review',
  footer: "To protect your confidentiality, we don't respond to reviews.",
};

export function dischargeSurveyTemplate(practiceName: string): string {
  return `${practiceName}: Closing Survey (optional)

Thank you for trusting us with your care. This survey is optional, and you're welcome to leave your name off. Your answers help us improve.

1. Overall, how helpful was counseling for you?
   1 (not helpful)   2   3   4   5 (very helpful)

2. How comfortable did you feel with your counselor?
   1 (not comfortable)   2   3   4   5 (very comfortable)

3. What was most helpful?

4. What could we have done better?

5. How did you first hear about us?
   [ ] Google search   [ ] Google Maps   [ ] A doctor or healthcare provider
   [ ] A church or pastor   [ ] An attorney or other professional
   [ ] A friend or family member   [ ] My insurance company
   [ ] Psychology Today or another directory   [ ] Other: ________

6. Is there anything you'd like us to follow up with you about?
   If so, please include your name and the best way to reach you.

Name (optional): ______________________

---
Note for the practice (remove before using): this survey deliberately does not ask for an online review. ACA Code of Ethics C.3.b says counselors do not solicit testimonials from current or former clients, and a discharge survey goes to exactly those people. Question 5 is the valuable one for marketing: log each answer on the client's record in the Lead CRM ("Heard about us") so the dashboard shows which channels bring clients.`;
}

export function reviewPolicyTemplate(practiceName: string): string {
  return `Online Reviews

You may come across ${practiceName} on review sites such as Google. We do not ask current or former clients for reviews or testimonials.

If you choose to post a review, please know that reviews are public and may reveal that you have been a client here. To protect your confidentiality, we do not respond to reviews, positive or negative, and we will not confirm or deny that anyone is a client.

If you have a concern about your care, we encourage you to talk with your counselor directly so we can address it with you.`;
}

export const STAFF_GUIDELINES = {
  do: [
    'Keep the sign in the waiting room only, never in session rooms.',
    'If a client brings up reviews on their own, say "That\'s entirely up to you" and leave it there.',
    'Pass along any concern raised in a review to the clinical director, privately.',
    'Check your own state licensing board\'s advertising rules. Some are stricter than the ACA code.',
  ],
  dont: [
    'Ask any current or former client for a review, in person, by email, by text, or in a survey.',
    'Hand a client the sign or QR code, or bring it up in session.',
    'Offer anything in exchange for a review, such as a discount or a gift.',
    'Invite only clients you expect to be happy, or discourage anyone from posting. Google prohibits selectively asking for positive reviews.',
    'Reply to reviews, or confirm or deny that someone is a client.',
    'Write reviews for the practice, or ask friends or family to post as if they were clients.',
  ],
};
