import type { DraftInput } from './promptBuilder';

export function fallbackDraft(input: DraftInput): string {
  const { property, category, ownerName } = input;
  const ua = property.userAdoption;
  const cr = property.conversionRate;
  const notes = property.notes ? ` Notes on file: ${property.notes}` : '';

  switch (category) {
    case 'churn':
      return [
        `Subject: ${property.name} — quick call this week?`,
        '',
        `Hi team,`,
        '',
        `Pulling the health view for ${property.name} (${property.city}) this morning and the numbers are flagging: ${ua}% adoption and ${cr}% conversion. That pattern usually means the team is not logging in and the leads we are getting are not closing. I want to fix both before renewal comes up.${notes}`,
        '',
        `Could I get 30 minutes with you and the regional manager this week? I will come with the conversation logs and a short list of fixes. Quick call, real answers.`,
        '',
        `Thanks,`,
        ownerName,
      ].join('\n');
    case 'stuck':
      return [
        `Subject: SE review needed — ${property.name} (high UA, low CR)`,
        '',
        `Filing this for the solutions engineering queue.`,
        '',
        `Account: ${property.name}, ${property.city} (${property.units} units)`,
        `Adoption: ${ua}%   Conversion: ${cr}%`,
        `Pattern: team is using the platform daily, leads are not converting. Likely a configuration or source mapping issue, not training.${notes}`,
        '',
        `Asks:`,
        `1. Audit AI configuration and integration health`,
        `2. Pull 25 recent non-converting conversations and tag failure types`,
        `3. Confirm lead source routing for new marketing channels`,
        '',
        `I will book a 30-minute technical review with the ops lead once SE has initial findings.`,
        '',
        `— ${ownerName}`,
      ].join('\n');
    case 'sleeping':
      return [
        `Subject: ${property.name} — your numbers are quietly great`,
        '',
        `Hi team,`,
        '',
        `${property.name} is converting at ${cr}% with only ${ua}% of the leasing team using the platform. That is a real outlier in a good way: the product is doing the work even though most of the team has not logged in. If we get the rest of the team trained, the conversion number probably keeps climbing.${notes}`,
        '',
        `Would you be open to a 45-minute training session for the wider leasing team in the next two weeks? I will send a one-pager to leadership the same week showing the conversion result your top users are already producing.`,
        '',
        `Thanks,`,
        ownerName,
      ].join('\n');
    case 'reference':
      return [
        `Subject: ${property.name} — quick ask and a thank you`,
        '',
        `Hi team,`,
        '',
        `${property.name} is one of the strongest accounts in the portfolio right now: ${ua}% adoption with ${cr}% conversion. Both numbers are well above the threshold and the team is clearly running the platform the way it was meant to be run.${notes}`,
        '',
        `Two asks. First, would you be open to a short case study? Numbers only, no quotes unless you want them. Second, if you know one operator who would benefit from what your team is doing, I would love a warm intro.`,
        '',
        `Either way, thank you for the partnership.`,
        '',
        `— ${ownerName}`,
      ].join('\n');
  }
}
