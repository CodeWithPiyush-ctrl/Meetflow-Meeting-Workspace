import type { Meeting, Participant, TranscriptSegment } from '@/types/meeting'

const people = {
  maya: { id: 'p-maya', name: 'Maya Chen', email: 'maya@northwind.io' },
  daniel: { id: 'p-daniel', name: 'Daniel Okafor', email: 'daniel@northwind.io' },
  priya: { id: 'p-priya', name: 'Priya Raman', email: 'priya@northwind.io' },
  lucas: { id: 'p-lucas', name: 'Lucas Ferreira', email: 'lucas@northwind.io' },
  sofia: { id: 'p-sofia', name: 'Sofia Lindqvist', email: 'sofia@northwind.io' },
  ethan: { id: 'p-ethan', name: 'Ethan Brooks', email: 'ethan@acmelogistics.com' },
  hana: { id: 'p-hana', name: 'Hana Sato', email: 'hana@northwind.io' },
  omar: { id: 'p-omar', name: 'Omar Haddad', email: 'omar@acmelogistics.com' },
} satisfies Record<string, Participant>

type Line = [timestamp: string, speaker: string, text: string]

function toSeconds(timestamp: string): number {
  return timestamp.split(':').map(Number).reduce((acc, part) => acc * 60 + part, 0)
}

function buildTranscript(prefix: string, lines: Line[], duration: number): TranscriptSegment[] {
  return lines.map(([timestamp, speaker, text], index) => ({
    id: `${prefix}-seg-${index}`,
    start: toSeconds(timestamp),
    end: index < lines.length - 1 ? toSeconds(lines[index + 1][0]) : duration,
    speaker,
    text,
  }))
}

export const mockMeetings: Meeting[] = [
  {
    id: 'mtg-q4-roadmap',
    title: 'Q4 Product Roadmap Review',
    date: '2026-10-07T15:00:00.000Z',
    duration: 2820,
    participants: [people.maya, people.daniel, people.priya, people.lucas],
    starred: true,
    source: 'owned',
    transcript: buildTranscript(
      'q4',
      [
        ['0:00', 'Maya Chen', "Okay, let's get started. The goal today is to lock the Q4 roadmap so engineering can start sprint planning on Monday."],
        ['0:14', 'Maya Chen', 'I shared the draft doc last night. Three big themes: search improvements, the onboarding revamp, and the enterprise permissions work.'],
        ['0:31', 'Daniel Okafor', 'Before we dive in, I want to flag that enterprise permissions is bigger than the estimate in the doc. We think it is closer to six weeks, not four.'],
        ['0:48', 'Priya Raman', "That matches what I'm hearing from the sales side. Two of our pipeline deals are blocked on role-based access, so it is a revenue priority."],
        ['1:12', 'Maya Chen', 'Got it. If permissions takes six weeks, what do we cut? I would rather trim scope than slip the date.'],
        ['1:29', 'Lucas Ferreira', 'We could ship onboarding in two phases. Phase one is the new checklist and empty states. Phase two, the interactive tour, moves to January.'],
        ['1:51', 'Daniel Okafor', 'That works for engineering. Phase one is mostly frontend, so it can run in parallel with the permissions backend.'],
        ['2:20', 'Priya Raman', 'One concern on search. Customers keep asking for filters by date and participant. Is that in scope?'],
        ['2:38', 'Maya Chen', "Yes, filters are in. Semantic search is the stretch goal. If we don't get to it, that's fine."],
        ['3:05', 'Lucas Ferreira', 'I can have designs for the filter UI by end of next week. I would like a quick review with Daniel before handoff.'],
        ['3:24', 'Daniel Okafor', "Sounds good. Let's put thirty minutes on the calendar Thursday."],
        ['4:02', 'Maya Chen', 'Next, metrics. For onboarding, success is activation within the first week. We are at thirty-eight percent today.'],
        ['4:25', 'Priya Raman', 'Can we target fifty? That would put us in line with the benchmarks from the analyst report.'],
        ['4:41', 'Maya Chen', "Fifty is ambitious but I like it. Let's commit to forty-five and call fifty the stretch."],
        ['5:30', 'Daniel Okafor', 'On permissions, I need a decision on whether we support custom roles in v1 or only the three default roles.'],
        ['5:52', 'Priya Raman', 'The blocked deals only need the defaults: admin, member, and viewer. Custom roles can wait.'],
        ['6:10', 'Maya Chen', "Agreed. Defaults only for v1. Daniel, can you write up the technical design and share it by Wednesday?"],
        ['6:24', 'Daniel Okafor', 'Will do.'],
        ['7:15', 'Maya Chen', "Last item, communication. Priya, could you prepare a short update for the sales team so they know what's coming and when?"],
        ['7:33', 'Priya Raman', "Sure, I'll draft something and run it by you before sending it out."],
        ['8:02', 'Maya Chen', 'Great. To recap: permissions with default roles, onboarding phase one, and search filters. Thanks everyone.'],
      ],
      2820,
    ),
    summary: {
      overview:
        'The team finalized the Q4 roadmap around three themes: enterprise permissions, a phased onboarding revamp, and search filters. Permissions was re-estimated at six weeks and prioritized because two sales deals depend on it. To protect the date, onboarding was split into two phases, with the interactive tour moved to January. The team set a 45% first-week activation target, with 50% as a stretch.',
      keyTopics: ['Enterprise permissions', 'Onboarding revamp', 'Search filters', 'Activation metrics', 'Sales enablement'],
      outline: [
        {
          id: 'q4-o1',
          start: 0,
          title: 'Roadmap themes and scope',
          points: [
            'Draft roadmap covers search, onboarding, and enterprise permissions',
            'Permissions re-estimated from four to six weeks',
          ],
        },
        {
          id: 'q4-o2',
          start: 72,
          title: 'Scope trade-offs',
          points: [
            'Onboarding split into two phases; interactive tour moved to January',
            'Phase one can run in parallel with permissions backend',
          ],
        },
        {
          id: 'q4-o3',
          start: 140,
          title: 'Search improvements',
          points: ['Date and participant filters confirmed in scope', 'Semantic search is a stretch goal'],
        },
        {
          id: 'q4-o4',
          start: 242,
          title: 'Success metrics',
          points: ['First-week activation currently at 38%', 'Committed target of 45%, stretch of 50%'],
        },
        {
          id: 'q4-o5',
          start: 330,
          title: 'Permissions decisions and next steps',
          points: ['v1 ships with default roles only', 'Sales update to be drafted and reviewed'],
        },
      ],
    },
    actionItems: [
      { id: 'q4-a1', text: 'Write the permissions technical design and share it by Wednesday', assignee: 'Daniel Okafor', completed: false },
      { id: 'q4-a2', text: 'Deliver search filter UI designs by end of next week', assignee: 'Lucas Ferreira', completed: false },
      { id: 'q4-a3', text: 'Schedule a 30-minute design review for Thursday', assignee: 'Daniel Okafor', completed: true },
      { id: 'q4-a4', text: 'Draft the Q4 roadmap update for the sales team', assignee: 'Priya Raman', completed: false },
    ],
  },
  {
    id: 'mtg-acme-onboarding',
    title: 'Acme Logistics — Customer Onboarding Call',
    date: '2026-10-06T17:30:00.000Z',
    duration: 1980,
    participants: [people.sofia, people.ethan, people.omar],
    starred: false,
    source: 'owned',
    transcript: buildTranscript(
      'acme',
      [
        ['0:00', 'Sofia Lindqvist', 'Thanks for joining, Ethan and Omar. Today we will walk through setup and make sure your team is ready for the pilot.'],
        ['0:18', 'Ethan Brooks', "Great. Our main goal is getting dispatch meetings recorded automatically. Those happen every morning at seven."],
        ['0:36', 'Sofia Lindqvist', 'Perfect. Once your calendar is connected, the assistant joins any meeting with a video link. You can also set rules by meeting title.'],
        ['1:02', 'Omar Haddad', 'We use Microsoft Teams for most calls. Is that supported?'],
        ['1:10', 'Sofia Lindqvist', 'Yes, Teams, Zoom, and Google Meet are all supported. For Teams, an admin needs to approve the app once.'],
        ['1:31', 'Omar Haddad', "I'm the admin, so I can handle that today."],
        ['2:05', 'Ethan Brooks', 'What about data retention? Our legal team wants recordings deleted after ninety days.'],
        ['2:22', 'Sofia Lindqvist', "Retention is configurable per workspace. I'll set yours to ninety days and send a confirmation in writing."],
        ['3:10', 'Ethan Brooks', 'Last question: can we export action items into our ticketing system?'],
        ['3:24', 'Sofia Lindqvist', "There's an integration on our roadmap. In the meantime, you can export to CSV. I'll share the docs."],
        ['3:58', 'Omar Haddad', 'That works for the pilot. Let us check in again in two weeks.'],
      ],
      1980,
    ),
    summary: {
      overview:
        'Sofia ran the onboarding call for the Acme Logistics pilot. Acme wants to record daily dispatch meetings automatically, mostly on Microsoft Teams. Omar will approve the Teams app as admin, and Sofia will set workspace retention to 90 days to meet legal requirements. Ticketing export is not available yet, so CSV export will be used for now.',
      keyTopics: ['Auto-recording', 'Microsoft Teams', 'Data retention', 'Ticketing export'],
      outline: [
        { id: 'acme-o1', start: 0, title: 'Pilot goals', points: ['Automatically record daily 7am dispatch meetings'] },
        { id: 'acme-o2', start: 62, title: 'Platform setup', points: ['Teams supported; needs one-time admin approval', 'Omar to approve today'] },
        { id: 'acme-o3', start: 125, title: 'Compliance', points: ['90-day retention required by legal'] },
        { id: 'acme-o4', start: 190, title: 'Integrations', points: ['Ticketing integration on roadmap', 'CSV export for the pilot'] },
      ],
    },
    actionItems: [
      { id: 'acme-a1', text: 'Approve the MeetFlow app in the Teams admin center', assignee: 'Omar Haddad', completed: true },
      { id: 'acme-a2', text: 'Set workspace retention to 90 days and confirm in writing', assignee: 'Sofia Lindqvist', completed: false },
      { id: 'acme-a3', text: 'Share the CSV export documentation', assignee: 'Sofia Lindqvist', completed: false },
      { id: 'acme-a4', text: 'Schedule a two-week pilot check-in', assignee: 'Ethan Brooks', completed: false },
    ],
  },
  {
    id: 'mtg-eng-standup',
    title: 'Platform Team Weekly Sync',
    date: '2026-10-05T14:00:00.000Z',
    duration: 1500,
    participants: [people.daniel, people.hana, people.lucas],
    starred: false,
    source: 'owned',
    transcript: buildTranscript(
      'sync',
      [
        ['0:00', 'Daniel Okafor', "Quick sync this week. Let's go around. Hana, want to start?"],
        ['0:08', 'Hana Sato', 'Sure. The transcription queue migration is done. Median processing time dropped from four minutes to ninety seconds.'],
        ['0:25', 'Daniel Okafor', 'Huge improvement. Any issues after cutover?'],
        ['0:31', 'Hana Sato', 'One retry storm on Tuesday from a misconfigured timeout. It is fixed, and I added an alert.'],
        ['1:02', 'Lucas Ferreira', 'On my side, the design system tokens are merged. Next is migrating the settings pages.'],
        ['1:20', 'Daniel Okafor', "Nice. I'm still on the permissions design doc. Draft goes out Wednesday."],
        ['1:45', 'Hana Sato', 'Can we schedule a postmortem for the retry storm? I want to write it up properly.'],
        ['1:55', 'Daniel Okafor', "Yes, let's do Friday morning."],
      ],
      1500,
    ),
    summary: {
      overview:
        'The platform team reviewed weekly progress. Hana completed the transcription queue migration, cutting median processing time from four minutes to 90 seconds; a retry storm caused by a misconfigured timeout was fixed and is now alerted on. Lucas merged the design tokens, and Daniel is finishing the permissions design doc.',
      keyTopics: ['Queue migration', 'Incident follow-up', 'Design system', 'Permissions'],
      outline: [
        { id: 'sync-o1', start: 0, title: 'Infrastructure update', points: ['Processing time 4 min → 90 sec', 'Retry storm fixed and alert added'] },
        { id: 'sync-o2', start: 62, title: 'Frontend and design', points: ['Design tokens merged', 'Settings pages next'] },
        { id: 'sync-o3', start: 105, title: 'Follow-ups', points: ['Postmortem scheduled for Friday'] },
      ],
    },
    actionItems: [
      { id: 'sync-a1', text: 'Write the retry storm postmortem', assignee: 'Hana Sato', completed: false },
      { id: 'sync-a2', text: 'Migrate settings pages to the new tokens', assignee: 'Lucas Ferreira', completed: false },
    ],
  },
  {
    id: 'mtg-design-crit',
    title: 'Design Critique: Meeting Workspace',
    date: '2026-10-02T16:00:00.000Z',
    duration: 2400,
    participants: [people.lucas, people.maya, people.sofia, people.hana, people.priya],
    starred: true,
    source: 'shared',
    sharedBy: 'Lucas Ferreira',
    transcript: buildTranscript(
      'crit',
      [
        ['0:00', 'Lucas Ferreira', "I'll walk through the new meeting workspace. The transcript is on the left and the summary is on the right."],
        ['0:20', 'Maya Chen', 'I like the split. Does the transcript follow along during playback?'],
        ['0:27', 'Lucas Ferreira', 'Yes. The active line highlights and scrolls into view. Clicking a line jumps the player to that moment.'],
        ['0:48', 'Sofia Lindqvist', 'Customers will love that. Can action items be edited inline?'],
        ['0:56', 'Lucas Ferreira', "Yes. You can check them off, reassign them, or delete them."],
        ['1:30', 'Priya Raman', 'The summary is dense on mobile. Can sections collapse?'],
        ['1:42', 'Lucas Ferreira', "Good call. I'll stack the columns on mobile and look into collapsible sections."],
      ],
      2400,
    ),
    summary: {
      overview:
        'Lucas presented the new meeting workspace design with a synced transcript and AI summary side by side. Feedback was positive on playback sync and inline action item editing. Mobile density was raised as a concern, so Lucas will stack the columns and explore collapsible summary sections.',
      keyTopics: ['Workspace layout', 'Playback sync', 'Mobile density'],
      outline: [
        { id: 'crit-o1', start: 0, title: 'Walkthrough', points: ['Split transcript and summary layout', 'Click-to-seek transcript'] },
        { id: 'crit-o2', start: 90, title: 'Feedback', points: ['Summary dense on mobile', 'Explore collapsible sections'] },
      ],
    },
    actionItems: [
      { id: 'crit-a1', text: 'Stack workspace columns on mobile', assignee: 'Lucas Ferreira', completed: false },
    ],
  },
  {
    id: 'mtg-hiring',
    title: 'Senior Engineer Hiring Debrief',
    date: '2026-09-29T19:00:00.000Z',
    duration: 1800,
    participants: [people.daniel, people.hana, people.maya],
    starred: false,
    source: 'owned',
    transcript: buildTranscript(
      'hire',
      [
        ['0:00', 'Maya Chen', "Let's debrief on today's candidate. Daniel, you ran the system design round."],
        ['0:10', 'Daniel Okafor', 'Strong on distributed systems. Asked great clarifying questions about the queueing trade-offs.'],
        ['0:32', 'Hana Sato', 'The pairing session was good too. Clean code and tested as they went.'],
        ['0:50', 'Maya Chen', "Sounds like a hire. I'll move them forward to references."],
      ],
      1800,
    ),
    summary: {
      overview:
        'The panel debriefed on the senior engineer candidate. Both the system design and pairing rounds were strong, and the team agreed to move the candidate to reference checks.',
      keyTopics: ['System design', 'Pairing interview', 'Next steps'],
      outline: [{ id: 'hire-o1', start: 0, title: 'Interview feedback', points: ['Strong system design', 'Clean, tested code in pairing'] }],
    },
    actionItems: [{ id: 'hire-a1', text: 'Start reference checks', assignee: 'Maya Chen', completed: false }],
  },
  {
    id: 'mtg-marketing',
    title: 'Launch Planning: Search Filters',
    date: '2026-09-24T15:30:00.000Z',
    duration: 2100,
    participants: [people.priya, people.sofia, people.maya],
    starred: false,
    source: 'shared',
    sharedBy: 'Priya Raman',
    transcript: buildTranscript(
      'launch',
      [
        ['0:00', 'Priya Raman', 'For the search filters launch, I suggest a blog post, an in-app announcement, and a short demo video.'],
        ['0:18', 'Sofia Lindqvist', 'Can we also email the customers who asked for this feature? There are about forty.'],
        ['0:30', 'Maya Chen', "Yes, personal outreach to those customers is a great idea. Let's target launch for the second week of November."],
      ],
      2100,
    ),
    summary: {
      overview:
        'The team planned the search filters launch. It will include a blog post, an in-app announcement, a demo video, and personal outreach to roughly 40 customers who requested the feature. The target launch is the second week of November.',
      keyTopics: ['Launch channels', 'Customer outreach', 'Timeline'],
      outline: [{ id: 'launch-o1', start: 0, title: 'Launch plan', points: ['Blog, in-app, and video', 'Email ~40 requesting customers'] }],
    },
    actionItems: [
      { id: 'launch-a1', text: 'Compile list of customers who requested filters', assignee: 'Sofia Lindqvist', completed: true },
      { id: 'launch-a2', text: 'Draft launch blog post', assignee: 'Priya Raman', completed: false },
    ],
  },
  {
    id: 'mtg-1on1',
    title: 'Maya / Lucas 1:1',
    date: '2026-09-18T20:00:00.000Z',
    duration: 1200,
    participants: [people.maya, people.lucas],
    starred: false,
    source: 'owned',
    transcript: [],
    summary: null,
    actionItems: [],
  },
]
