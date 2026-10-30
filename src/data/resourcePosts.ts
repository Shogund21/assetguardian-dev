export interface ResourcePost {
  slug: string;
  title: string;
  description: string;
  paragraphs: string[];
}

export const resourcePosts: ResourcePost[] = [
  {
    slug: "chiller-failure-three-weeks-before",
    title: "The Chiller Doesn't Fail on Saturday. It Starts Failing Three Weeks Before.",
    description:
      "Most chiller failures aren't sudden. Here's what the slow decline actually looks like, and how predictive monitoring catches it before it becomes an emergency call.",
    paragraphs: [
      "Every facilities manager has a version of this story. The walk-in cooler at store 4 is fine on Tuesday. By Thursday the compressor is cycling a little more than usual, but nobody's watching the cycling time, so nobody notices. Saturday morning, the busiest day of the week, the thing just stops. Now you're calling an emergency HVAC line, paying weekend rates, and explaining to a district manager why there's a pallet of thawed product in the back.",
      "Here's the part that's easy to miss when you're standing in that back room: the chiller didn't fail on Saturday. It failed three weeks earlier, when it started losing refrigerant charge through a slow leak in a fitting nobody could see without a gauge on it. The unit kept running the whole time. It just ran worse every day, pulling more amps to do the same job, holding temperature a little less tightly, until it crossed a line it couldn't come back from. Saturday was just the day the math ran out.",
      "This is the pattern behind most of the \"sudden\" HVAC failures we hear about from retail and property management teams. It's rarely a part that snaps. It's a slow drift that was visible the whole time, just not to anyone who was looking. A refrigerant charge dropping a few percent a week. A filter that should have been swapped at 60 days and is still in there at 140, so static pressure climbs and the blower works harder than it was built for. A rooftop unit's discharge temperature creeping up half a degree at a time until it's running outside the range it was ever designed to handle on a 95-degree afternoon. None of these show up as an alarm. They show up as a trend, and trends only matter if someone's tracking them.",
      "That's the gap between a maintenance schedule and actual monitoring. A quarterly PM visit catches whatever's wrong on the day the technician happens to be standing there. It does nothing for the twelve weeks in between. If the refrigerant leak started the week after the tech left, you're not finding out until the next scheduled visit, or until the unit quits and tells you itself.",
      "AssetGuardian's whole reason for existing is to close that gap. The equipment monitoring tracks the actual operating signals, the ones a slow failure shows up in long before it becomes a breakdown, and flags when something's drifting out of its normal range. That's what a predictive alert is in practice: not a vague \"something might be wrong,\" but a specific flag tied to a specific piece of equipment, early enough that it's a scheduled repair instead of an emergency one.",
      "The second half of the problem is what happens after you get that alert. Catching the drift doesn't help much if it turns into a sticky note and gets lost. When AssetGuardian flags a unit, it ties straight into work order management, so a technician actually gets dispatched against it with the equipment history already attached, not a cold call where they're guessing what they'll find on-site. And every inspection, every repair, every reading gets logged automatically instead of living on a clipboard in a truck or a spreadsheet that's three versions out of date by the time anyone needs it. When a unit does eventually need a bigger repair, you've got a real maintenance record to point to, not a guess at when it was last serviced.",
      "None of this makes equipment immortal. A compressor at the end of its life is still going to need replacing eventually, and no amount of monitoring changes that. What it changes is whether you find out on a Tuesday with two weeks of lead time to schedule the work, or on a Saturday with a line of customers and a thawing cooler. One of those is a line item. The other is a scramble.",
      "If you're running maintenance across a handful of sites with the tools most SMB teams have today, a spreadsheet and a tech's memory of which unit sounded funny last month, this is the kind of thing worth a second look. Happy to walk through what it would look like for your sites specifically. No pressure either way.",
    ],
  },
];

export const getResourcePost = (slug: string) =>
  resourcePosts.find((p) => p.slug === slug);
