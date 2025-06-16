# GLOW (Team name: Microsofties)

## Iteration 2 - Review & Retrospect

 * When: Sunday, June 15, 2025
 * Where: 18 Gaslight Cres., Toronto (residence of the team members)

## Process - Reflection

#### Decisions that turned out well

List process-related (i.e. team organization) decisions that, in retrospect, turned out to be successful.

- In-person Scrum meetings: Regular in-person meetings (especially at 18 Gaslight) helped resolve blockers faster and build team cohesion. This led to more productive and open sessions.
- Rotating Peer Code Reviews: Rotating reviewers ensured that everyone engaged with different parts of the codebase and prevented knowledge silos. It also improved overall code quality by exposing each piece to more eyes.

#### Decisions that did not turn out as well as we hoped

List process-related (i.e. team organization) decisions that, in retrospect, were not as successful as you thought they would be.

- Lack of Mid-Iteration Checkpoints: We didn’t schedule any formal mid-iteration reviews, which led to some slippage in deadlines and misaligned expectations until the final days.
- Backend-Frontend Integration Left Too Late: Integration was delayed until late in the iteration, leading to rushed bug-fixing and missed edge cases.
- Lack of proper documentation in commits: Some updates to the code base GitHub issues or commit messages. This has made some parts of the code base harder to trace and understand.

#### Planned changes

List any process-related changes you are planning to make (if there are any)

- Add Midpoint Review Sessions: We'll introduce short mid-iteration review meetings to catch misalignments early and adjust our priorities or distribution of work accordingly.
- Shift Integration to Earlier in the Cycle: We’ll begin integration and end-to-end testing by the end of week 1 of the sprint, rather than waiting until the final stretch.
- Enforce Commit Message Standards: To make our Git history more useful, we'll agree on a simple commit message format and ensure every push includes a reference to a Jira issue.

## Product - Review

#### Goals and/or tasks that were met/completed:

[ SHAAF ATTACH PROOF OF COMPLETION]

- Temperature data from Toronto beaches using API: We successfully fetched and displayed live temperature data using an external API, enabling real-time updates for users.
- Login/signup page: A basic UI was implemented with separate forms for new user registration and existing user login.
- Visual feedback on API fetch progress: We added a status indicator to improve user experience while waiting for data to load.
- Interactive map with light and dark theme: We integrated a responsive map to display beach data, that also supports theme toggling, enhancing both usability and accessibility.

#### Goals and/or tasks that were planned but not met/completed:

- Fetching historical temperature data: This feature was not completed as we were unable to find a reliable public API that provided historical beach-specific temperature records.
- User uploaded data points: We planned to allow users to submit their own observations, but backend issues with authentication and database handling prevented us from enabling this functionality.

## Meeting Highlights

Going into the next iteration, our main insights are:

 * 2 - 4 items
 * Short (no more than one short paragraph per item)
 * High-level concepts that should guide your work for the next iteration.
 * These concepts should help you decide on where to focus your efforts.
 * Can be related to product and/or process.

- Early Integration Is Key: Even if backend and frontend are both on track, leaving integration until the end causes more bugs and stress than expected (and also creates problems with starting new features). Prioritize getting the full pipeline running earlier.
- Small, Frequent Syncs: Our shorter daily in-person standups were found to be very effective compared to longer, less frequent ones in other courses. We’ll keep using this format to stay aligned and productive.
- Prioritize Clarity Over Speed in Commits and Issues: We realized the time we “saved” by rushing past documentation often came back to bite us during debugging. Better documentation should lead to much smoother workflow.