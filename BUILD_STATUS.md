# BUILD_STATUS

## Current Phase

**Phase 10 - Flow Polish and Demo Hardening (active)**

Phase 9 - UI and Flow Polish: complete as of 2026-05-30 (UTC-7)

Phase 8 - Lost Scenario and Demo Hardening: complete as of 2026-05-28 (UTC-7)
Phase 7 - Location Additions and Demo Gap Closure: complete as of 2026-05-28 (UTC-7)
Phase 6 - AI Integration: complete as of 2026-05-19 (UTC-7)
Phase 5 - Multiple Caregiver Support: complete as of 2026-05-18 (UTC-7)
Phase 4 - Supabase Backend Integration: complete as of 2026-05-18 (UTC-7)
Phase 3 - Demo Readiness: complete as of 2026-05-14 (UTC-7)

## Completed Tasks

- Created `PROJECT_PLAN.md`
- Created `BUILD_STATUS.md`
- Created `DECISIONS.md`
- Created `FUTURE_IDEAS.md`
- Created `AGENT_INSTRUCTIONS.md`
- Replaced `README.md` with setup and operating guidance
- Added Next.js App Router static scaffold with TypeScript and Tailwind configuration
- Built static landing page at `/`
- Built static Today Window page at `/app`
- Built static Caregiver Dashboard page at `/caregiver`
- Built static Scenario Demo Simulator page at `/demo`
- Created reusable components:
  - `TodayCard`
  - `ResponseCard`
  - `CheckInCard`
  - `ScenarioSelector`
  - `CaregiverSummary`
  - `EventLogList`
- Added shared static demo data source in `data/demoData.ts`
- Implemented Phase 1 brand + UI design system (static only):
  - warm grounded palette (rust/amber feeling) with calm, non-emergency emphasis
  - branded header with `MA` compass-dot placeholder logo + wordmark
  - icon library + consistent icon-with-label hierarchy
  - responsive layout improvements (single-column mobile, 2-column tablet where appropriate)
  - refined Today screen:
    - main actions separated from support actions
    - "Call caregiver" separated from "Show helper card"
  - added "Show Helper Card" modal pattern (no backend, static content)
- Phase 1 UI refinements (calm + less repetition + better grid clarity):
  - removed repeated per-question checkmark symbols from `CheckInCard`
  - added a left accent border to check-in question buttons instead
  - added vertical `md:divide-x` separators between grid sides in:
    - `Today` main/support action grids
    - `CaregiverDashboard` grid
- Started Phase 2 interactive MVP implementation:
  - Added shared route-synced demo state (`localStorage`) for `/app`, `/caregiver`, and `/demo`
  - Added shared demo user name for greeting/helper copy consistency
  - Implemented `/app` reorientation trigger + structured grounding card flow
  - Implemented `/app` check-in submission state + follow-up status copy
  - Implemented fallback copy behavior tied to low/medium/high uncertainty scenarios
  - Implemented `/demo` scenario activation and active scenario visibility
  - Implemented `/caregiver` simulated status updates from shared mock state
  - Implemented in-memory event logging with required Phase 2 event names
  - Updated event log UI to show event type/source/scenario details
  - Added `data/demoState.ts` for lightweight event schema + state model
  - Added onboarding/profile personalization editor in `/demo` (preferred name, pronouns, caregiver name/label)
  - Wired personalized copy across `/app`, `/caregiver`, and helper card
  - Made event log collapsible to reduce UI clutter
  - Simplified reorientation UI: guidance visible by default + clearer "Help me now" refresh action
  - Added non-interactive lint setup (`.eslintrc.json`, `eslint`, `eslint-config-next` aligned to Next 15)
  - Phase 3 kickoff polish in `/app`:
    - Added explicit prototype data note for demo expectation-setting
    - Clarified "Help me now" helper text (refreshes guidance + logs support moment)
    - Added persistent urgent-support sticky panel with caregiver and emergency call actions
- Phase 3 caregiver log enhancement:
    - `checkin_submitted` events in the event log now display the specific question the user selected (from `metadata.question`), visible on both `/app` and `/caregiver`
- Phase 3 caregiver dashboard redesign:
    - Top grid: renamed event log panel to "{preferredName}'s Activity", filtered to `source === "app"` events, visible by default
    - Added full-width "Event Log" section below the grid showing all events, collapsed by default
    - `reorientation_started` events highlighted with rust left border and colored label to signal distress moments to caregiver
    - `EventLogList` now accepts `title` and `emptyText` props for reuse flexibility
- Phase 3 caregiver activity panel filter refinement:
    - "{preferredName}'s Activity" now filters by event type allowlist (`reorientation_started`, `checkin_submitted`, `fallback_shown`, `demo_scenario_selected`) rather than by source
    - `reorientation_card_viewed` and `caregiver_view_opened` appear only in the full Event Log section
- Phase 3 helper card event logging:
    - Tapping "Show helper card" in `/app` now logs a `helper_card_shown` event
    - `helper_card_shown` events render with a light yellow background and amber label in the event log
    - `helper_card_shown` added to the caregiver Activity panel allowlist
- Phase 3 caregiver dashboard list fixes:
    - Alex's Activity panel shows 6 most recent events by default; "Show more" expands to a scrollable 500px container
    - Event Log panel now shows only system/navigation events (inverse of activity allowlist); displays in plain style with no highlights
    - `EventLogList` accepts `initialLimit` and `plain` props
- Phase 3 Activity panel show more/less fix:
    - Default limit changed from 6 to 5
    - "Show more" now toggles to "Show less" to collapse back to 5; scroll container only active when expanded
- Phase 3 event state refactor: split single `events` array into `activityEvents` (cap 50) and `systemEvents` (cap 20)
    - `activityEvents`: `reorientation_started`, `checkin_submitted`, `fallback_shown`, `helper_card_shown`
    - `systemEvents`: `reorientation_card_viewed`, `caregiver_view_opened`, `demo_scenario_selected`
    - `normalizeDemoState` migrates legacy localStorage state by splitting old `events` array on event type
    - `/caregiver` reads arrays directly — no runtime filter logic needed
    - Changed files: `data/demoState.ts`, `app/app/page.tsx`, `app/demo/page.tsx`, `app/caregiver/page.tsx`
- Phase 3 Activity panel scroll fix:
    - Expanded view with ≤10 items sizes naturally (no scroll, no max-height)
    - Expanded view with >10 items uses `max-h-[800px] overflow-y-auto`
    - Collapsed view always sizes naturally to first 5 items
- Phase 3 check-in selection reset: `setSelectedQuestion("")` called on submit so options return to default state
- Phase 3 check-in UI fixes:
    - Removed duplicate "Do a quick check-in" heading from inside `CheckInCard` (section title above is sufficient)
    - Check-in section icon changed to `text-green-500`
    - Selected check-in option now shows `bg-green-50` background for clear selection feedback
    - Removed unused `title` prop and `MemoryIcon` import from `CheckInCard`
- Phase 3 emergency services feature:
    - "Urgent: call emergency services" button restyled red; intercepts click, logs `emergency_called`, shows "Calling 911…" demo modal
    - Same button added to HelperModal via `onCallEmergency` prop
    - `emergency_called` added to activityEventTypes in `demoState.ts`
    - Activity panel: `emergency_called` events shown with bright red background and bold yellow "Called Emergency Services" label
    - Caregiver Snapshot: "Emergency calls" counter (red-600, white text) shown above "Missed calls", only when count > 0
- Phase 3 Call Maria — helper card fix:
    - "Call [caregiver]" inside HelperModal now uses `onCallCaregiver` callback instead of `tel:` link
    - Logs `caregiver_called` and shows the same calling modal as the main buttons
- Phase 3 Call Maria feature:
    - "Call caregiver" buttons in `/app` (support card + sticky footer) now intercept clicks: log `caregiver_called` to activityEvents and show a demo modal ("Calling [name]… Cancel")
    - `caregiver_called` added to activity event type set in `demoState.ts`
    - Activity panel in `/caregiver`: `caregiver_called` events shown with blue background and blue label
    - Caregiver Snapshot: shows a red "Missed calls" row when `caregiver_called` count > 0
- Phase 3 Activity panel allowlist fix:
    - Removed `demo_scenario_selected` from Alex's Activity panel — it fires from `/demo` (facilitator action, source: "demo"), not from Alex's interactions
- Phase 3 Activity panel show more/less final fix:
    - Expanded state shows ALL events; scroll container (max-h 500px) applied only when more than 10 events exist
    - Removed `expandedLimit` prop (no longer needed)
- Safari/iOS compatibility fix:
    - Replaced `crypto.randomUUID()` in `createEvent` (`data/demoState.ts`) with a `generateId()` fallback using `Math.random()`
    - `crypto.randomUUID()` throws on Safari/iPhone; the fallback works across all browsers
- Trusted location iteration kickoff:
    - Added trusted-place IDs, seeded coordinates, and deterministic scenario definitions in `data/demoState.ts`
    - Reworked `data/demoData.ts` to build context from trusted-place matching rather than hardcoded location strings
    - Added `lib/places.ts` matching helpers for trusted-place radius checks and "Other" fallback classification
    - Aligned `supabase/migrations/20260518_initial_schema.sql` with the trusted-slot and caregiver fields already assumed by the app
    - Updated `lib/seedData.ts` so seeded places, scheduled events, and activity events map to stable trusted-place IDs

## Active / Next Task

- Phase 9 - UI and Flow Polish (active as of 2026-05-28, UTC-7):
  - [x] Rename to Claira: SiteHeader wordmark updated, subtitle removed; BrandLogo MA→C and aria-label updated; layout.tsx metadata title and description updated
  - [x] Rewrite app/app/page.tsx return block to Phase 9 mockup: sticky CLAIRA header, greeting section, 4-row orientation card, 2-button grid (Check-In/Get Help), check-in expansion, recent guidance link, support rows (Call caregiver/Helper Card), AI note card; all modals preserved unchanged. Added utensils/bell/chevronRight/sun icon cases to MemoryIcon.tsx.
  - [x] Remove duplicate sticky header from /app page; fix AI note card to show activeScenario.guidance; move Call for Help button outside the note card as full-width standalone button.
  - [x] Color and card styling pass on /app page: Check-In button #5E7A5C, Get Help button #7A6545, caregiver row teal-700, orientation card border removed + shadow-sm, row icon slots bg-brand-surface/green-50/amber-50, all card rows py-3.
  - [x] Greeting area: Call caregiver and Show Helper Card moved to icon buttons (teal phone + idCard) in greeting row. Support rows, AI note card, and standalone Call for Help button removed. Recent guidance link moved into Get Help modal. Check-In updated to #6B9467, Get Help to #8B7B5A. Added idCard icon to MemoryIcon.tsx.
  - [x] New color palette + Lora/Nunito fonts: tailwind.config.ts updated (brand.bg/text/muted/border, added sage/sageDark/warm/warmDark, fontFamily); layout.tsx font preconnect links; globals.css font-family and background; /app page greeting serif/muted, orientation card sage/warm row styling, Check-In and Get Help buttons restyled with icon containers.
  - [x] Orientation card header flush to top edge (border-b, no rounded-xl/mb-3); date row py-3 no pt-4; check-in question selection and saved box updated to sage palette.
  - [x] Caregiver dashboard Phase 9 rewrite: new care color tokens (careGreen/careRust/careTeal/etc.) added to tailwind.config.ts; full primary return rewritten with sticky header (BrandLogo, active badge), status grid, stats row, inline activity feed with dot indicators, Today's Snapshot, Event Log, Insights link; helper functions added; "Memory Assistant" → "Claira" and "Simulation route only" removed from all branches.
  - [x] Activity feed: added formatQuestionKey() helper to display question keys as readable text instead of raw underscore_separated strings.
  - [x] COMING UP NEXT row truncated to short label; tappable chevron opens bottom sheet with full preparation checklist and "Get help with this" button (calls askQuestion("what_should_i_do_next")).
  - [x] SiteHeader: replaced BrandLogo + "Claira" text with img pointing to /claira-logo.webp; BrandLogo import removed.
  - [x] /app page return rewritten to user-home.html mockup: max-w-[375px] container, updated greeting/icon layout, redesigned orientation card (larger text, new row styling), check-in expansion preserved, action buttons restyled to 70px icon squares.
  - [x] checkin API: added packet mode (structured 3-question JSON with emoji response labels) and branch mode (streaming contextual reply based on uncertain/confused selection); CheckInQuestion and CheckInResponse types exported from demoState.ts.
  - [x] /app check-in flow replaced: old inline expansion removed; new modal-based flow with pre-generated packet (fetched on scenario change), 3-step modal (question → response branch → branch stream), history sheet; two-region no-scroll layout; date removed from greeting.
  - [x] /app bottom region: viewport fixed to 100svh; saved box removed; action area restructured with left status column (saved indicator + history button) and smaller h-32 action buttons.
  - [x] HelperModal fully rewritten to mockup design: top bar with logo + × button, scrollable 5-section content (identity, key info cards, how-to-help steps, caregiver card + call button, emergency section), fixed footer with close CTA. BrandLogo import removed.
  - [x] Layout flex chain: body gets h-svh flex-col; children wrapper becomes flex min-h-0 flex-1 overflow-hidden; /app main uses h-full. Row 3 button gets text-left; text div gets items-start. HelperModal emergency button wrapper div removed.
  - [x] HelperModal rewritten as compact no-scroll single-screen card: header, identity block, location + situational context row, caregiver/emergency action buttons, close footer. briefContext prop added (passed as activeScenario.guidance from /app).
  - [x] HelperModal redesigned: identity block simplified to name + "I need a little help" (no avatar); key info gains "Can you tell {name}" label; caregiver section uses card row with initial-circle button; emergency section uses shield icon + solid red button; "Close" text link removed from footer.
  - [x] HelperModal polish: caregiver card lightened (border/bg to C8E2C4 tints); solid 2px divider between caregiver and emergency; emergency redesigned as matching card row with shield circle button; "I'm OK" button narrowed to w-1/2 centered.
  - [x] DemoProfile gains fullName field (default "Alex Morrison"); HelperModal uses fullName in identity heading; emergency card tweaked (py-2, updated label/value styles); footer mt-4; I'm OK button redesigned with stacked I'M OK / close this card spans. /demo fullName field added. layout.tsx overflow-hidden removed from children wrapper.
  - [x] demoState fullName deserialization added. HelperModal: label classNames normalised to text-[11px]; emergency label/value classNames updated; sections reordered (caregiver → gradient hr → footer → thick divider → emergency at bottom); emergency card py-1.5, mb-1.
  - [x] /app main h-full → flex-1. HelperModal: identity p text-sm → text-[17px]; SITUATION label → "What's happening"; caregiver value font-bold → font-semibold; emergency shield button replaced with "Call 911" pill; emergency card py-1.
  - [x] HelperModal: caregiver value text matches location value style (font-serif text-sm font-semibold) with text-[#7C9B78] color; M button enlarged to h-12 w-12 with border-[#DFFFC4] border and "call" + initial stacked label.
  - [x] Safari iOS fix: height:100% on html and body in globals.css; h-svh removed from body in layout.tsx; /app main already uses flex-1 (no change needed).
  - [x] Review and tighten spacing and typography consistency across all screens
  - [x] Ensure all scenarios look correct on iPhone SE screen size
  - [x] Review caregiver dashboard layout on mobile
  - [x] Check all modal and overlay z-index layering
  - [x] Review color and contrast for accessibility
  - [x] Do a full end-to-end demo walkthrough and note any rough edges

- Phase 10 - Flow Polish and Demo Hardening (active as of 2026-05-30, UTC-7):
  - [x] SiteHeader rebuilt as demo-control header: User/Caregiver view tabs + 5 scenario shortcut buttons writing to shared localStorage + dispatching claira-state-update CustomEvent. Tabs show first letter of preferredName / caregiverName, active state tied to pathname. Lost scenario button triggers geolocation and upgrades to browser_geolocation if accuracy ≤ MAX_DEMO_BROWSER_ACCURACY_METERS.
  - [x] MemoryIcon: added 5 new names (sunrise, stethoscope, rx, moon, alertTriangle) with SVG cases.
  - [x] /app page: removed Show Helper Card button from greeting row (kept phone button); bottom action area restructured — w-16 left column removed, History + Saved row added above three equal-width flex-1 buttons (Show Card, Check-In, Get Help); Show Card button now first action in row.
  - [x] /app and /caregiver pages: claira-state-update custom event listener added on mount so both pages react to header scenario changes without full reload.
  - [x] SiteHeader visual polish: logo h-8→h-10, container pl-3 pr-1, right-col pt-0 pb-1 gap-0.5, tab buttons w-10 h-9 text-sm rounded-t-none rounded-b-lg items-start gap-1, scenario buttons w-[26px] h-[22px] rounded-md gap-0.5 with h-3 w-3 icons.
  - [x] /app visual polish: white border-[15px] frame on main; top region pt-3 gap-2; orientation card mt-2 removed; circular call button replaced with pill (Call {name} + circle icon); action buttons aspect-square p-2 gap-1 with h-10 w-10 tiles, h-5 w-5 icons, text-sm whitespace-nowrap labels.
  - [x] Targeted visual fixes: /app white frame changed to shadow-[inset_0_0_0_8px_white] (no layout impact); Call pill py-1.5→py-0.5, pl-4→pl-2, gap-3→gap-1, label text-sm→text-xs; SiteHeader tabs w-10→w-12, h-9→h-7; User tab active bg/border softened (#F4F9F3/#E4F6DD); Caregiver tab active bg/border softened (#E3F6FB/#D4E8ED).
  - [x] Layout/spacing fixes: body bg #F6F3EE→#FFFFFF (white outside frame); top region overflow-hidden→overflow-y-auto (prevents card clipping); bottom pb-6→pb-3; orientation card rows py-4→py-3; Call pill border→#C8E2C4; HelperModal top-[6%]→top-[2%] with max-h-[90dvh] overflow-y-auto; HelperModal padding tightened throughout (header py-3.5→py-2, identity py-4→py-2, key-info py-3→py-2 + inner rows py-3→py-2, caregiver py-3→py-2 + inner row py-3.5→py-2, footer pb-4 pt-3→pb-3 pt-2 + I'm OK py-3→py-2, divider mt-2→mt-1, emergency py-3→py-1.5).
  - [x] White frame refactor: body bg reverted to #F6F3EE; inset shadow removed from main; pointer-events-none fixed inset-0 z-0 border-[8px] border-white overlay div added as first child of React fragment so frame sits at viewport edges below content stack; Call pill outer border→#A5BBA0, circle icon border→#E1FFC4.
  - [x] White frame approach reverted to shadow-[inset_0_0_0_8px_white] on main element (frames content area below the header, not the full viewport); fixed overlay div and React fragment wrapper removed.
  - [x] White frame moved to full-width wrapper div (flex flex-1 flex-col shadow-[inset_0_0_0_8px_white]) so the 8px frame spans edge-to-edge at any screen width; shadow removed from the inner max-w-[375px] main element.
  - [x] White frame switched to foreground overlay: wrapper div is now relative flex flex-1 flex-col; last child inside wrapper is pointer-events-none absolute inset-0 z-[50] border-[8px] border-white, guaranteed above all child backgrounds.
  - [x] /app polish: top region pt-3→pt-6; Coming Up Next row icon now dynamically resolved from scenarioNextEventIcon lookup (sunrise/stethoscope/rx/moon/alertTriangle per scenario, fallback utensils); all three action buttons gain shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)]; Call Maria pill also gains shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)].
  - [x] SiteHeader header bg-brand-bg/90 → bg-[#F4E9D5].
  - [x] White border overlay z-[50]→z-[49]; HelperModal card bg-white→bg-[#FEF1D8] + ring-[6px] ring-[#F5C842]; HelperModal buttons (×, call caregiver, I'm OK, Call 911) gain shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)]; lost alert card bg-brand-surface→bg-[#FEF1D8] + ring-[6px] ring-[#F5C842]; all modal/popup buttons in page.tsx gain shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)].
  - [x] HelperModal card bg-[#FEF1D8]→bg-[#DDE9E8], ring-[#F5C842]→ring-white.
  - [x] HelperModal card bg-[#DDE9E8]→bg-white, ring-white→ring-[#92BDBB]; header div gains bg-[#DDE9E8] rounded-t-[24px] for teal top-only background.
  - [x] HelperModal: shadow added to location, context, caregiver, and emergency row divs; identity "Hi, my name is" and "I need a little help" text-[#8B7D6B]→text-[#5A4A3A] + font-bold.
  - [x] HelperModal: outer dialog div gains flex items-center justify-center p-5 for vertical centering; card container changed from absolute inset-x-3 top-[2%] to relative w-full so it is a centered flex child; I'm OK shadow already present from prior pass.
  - [x] Check-in modal step 1 restyle: card bg/ring now conditional (bg-[#E4F6DD] ring-[6px] ring-[#F6FFF5] on step 1, bg-white no ring on steps 2–3); h2 replaced with p "Tap a question to answer" text-sm font-semibold text-[#719E6B]; question buttons bg-white border-[#F3EEE6] flex items-center justify-between with chevronRight icon.
  - [x] Check-in modal steps 1+2 polish: green card now covers steps 1+2 (conditioned on !checkInBranchOpen); step 1 question buttons lose hover/focus-ring, chevron h-8 w-8 text-[#5A8C5A]; step 2 header p font-serif text-base text-[#5A4A3A]; step 2 branch buttons bg-white border-[#F3EEE6] flex gap-2 with splitTrailingEmoji splitting label into text/emoji/chevron.
  - [x] Modal polish pass: dismissCheckInModal helper; checkIn backdrop/X/stopProp; step 3 Show Details bg-[#FEF3E2] border-[#FAE4B0] with chevron, I'm okay bg-[#F6FFF5] border-[#E4F6DD] text-[#51694E]; Back/Close/View-past-check-ins → pill style; X button + backdrop-dismiss + relative + stopProp on all modals; bottom-sheet modals (checkInHistory, streamPanel, recentGuidance, nextEventDetail) → centered max-w-sm rounded-3xl; One moment… → pulsing dots in checkIn step 3 and streamPanel.
  - [x] Six targeted modal fixes: step 1 Back↔View-past-check-ins swapped; step 3 Show Details w-4/5 mx-auto justify-center, I'm okay w-4/5 mx-auto; all affirmative I'm okay/I'm OK buttons → bg-[#F6FFF5] border-[#E4F6DD] text-[#51694E]; checkedItems Set state + reset useEffect + interactive prep item checkboxes in nextEventDetail; Get help button → #FEF3E2/#FAE4B0 w-4/5 mx-auto with chevron; loading dot threshold changed from empty to trim().length < 30.
  - [x] Stream panel + affirmative button polish: all affirmative buttons → bg-[#E4F6DD] border-[#F6FFF5] w-4/5 mx-auto block; stream panel action area fully restructured (Got it I'm good → ask-another-question IIFE → gradient divider → Show Card teal button → simple divider → Back pill + Call Maria pill row); loading threshold already at < 30 from prior pass.
  - [x] Stream panel order/style fixes: Show Card button + both dividers removed; order → ask-another-question IIFE first, then gradient divider, then Got it I'm good (px-6 flex justify-center whitespace-nowrap), then Back+CallMaria row; top question label text-xs→text-sm text-brand-muted→text-[#5A4A3A]; Ask another question label same update.
  - [x] Stream/helpMeNow visual pass: both card divs bg-[#EEE7DD] ring-[6px] ring-[#BEAE9A]; helpMeNow h2→p text-xs uppercase; helpMeNow+stream question buttons bg-white border-[#FAE4B0]; stream response wrapped in rounded-2xl bg-white p-4; gradient divider added between response card and ask-another-question; ask-another-question label text-sm→text-xs; History row right-aligned pill style; Saved removed from row, added as absolute bottom-1 overlay on Check-In button.
  - [x] helpMeNow bottom row: Back confirmed pill style; row changed to flex items-center justify-between; Emergency button added on right (bg-[#A64D4D] border-[#EDDBDB] with "Emergency" label + "911" inner pill; calls setCallingEmergency(true) + setHelpMeNowOpen(false)).
  - [x] Emergency button color fix: bg-[#A64D4D]→bg-[#FAF0F0], border-[#EDDBDB]→border-[#E8B4B4], label text-[#B27070]→text-[#A64D4D]; 911 pill unchanged.
  - [x] HelperModal: emergency section + divider above it removed; card ends at I'M OK footer.
  - [x] Lost alert modal fully redesigned: alertTriangle icon + Location Alert badge, "This place looks unfamiliar" heading, detected location card (resolvedAddress or label + detail), gradient divider, I'm OK / Get Help / Show Card action buttons (w-4/5 mx-auto), section divider, Emergency pill + Call Maria pill row at bottom.
  - [x] Lost alert compacted: card bg-white, warm top strip bg-[#FEF1D8] rounded-t-3xl wraps A–C; icon h-10 w-10, alertTriangle h-6 w-6; heading text-base; subtitle text-xs; detail line removed; location card p-2.5; action buttons min-h-9 py-1.5; Get Help bg-[#FEF1D8]; Call Maria py-1→py-2; space-y-2 throughout lower section.
  - [x] Nine targeted fixes: Nominatim parsing improved (house+road, suburb/neighbourhood, city/town/county, state); lost alert standalone icon tile removed, alertTriangle moved into badge (h-3.5 gap-1.5); card mx-4; action buttons reverted to min-h-12 py-3 px-6, gained relative + absolute right-4 icon per button; Call Maria circle h-5 w-5 + phone h-3 w-3 + py-1.5; HelperModal no truncate found; YOU ARE AT row splits address at first comma when placeId falsy; History row moved to centered div below buttons.
  - [x] Six targeted fixes: Nominatim rewritten using optional chaining (streetLine via join, array filter/join, no slice); YOU ARE AT uses resolvedAddress??label, leading-tight/leading-snug; History restored to mb-2 justify-end row above buttons; pb-3→pb-6; helpMeNow Emergency button removed; Recent guidance underline link removed, pill button added on right of bottom row (Back left, Recent guidance right).
  - [x] Check-in race condition fix: AbortController added to generateCheckInPacket effect (aborts on cleanup); checkInModalOpen added to dependency array; early return guard if modal is closed; catch/finally skip state updates on aborted requests.
  - [x] Stream panel: when all questions have been asked (remainingQuestions empty), renders a "Show previous guidance" button (clock icon, same question-button style) instead of null; label "ASK ANOTHER QUESTION" only shows when there are actual question buttons.
  - [ ] User page: polish Get Help modal (question buttons, stream panel) to new color system and layout
  - [ ] User page: polish stream panel response view (I'm okay / Call Maria / Show this screen buttons) to new design
  - [ ] User page: style the lost location scenario state on the user page (unfamiliar location alert, lost flow)
  - [ ] Caregiver dashboard: full UI polish pass to new color system and layout matching mockup
  - [ ] Insights page: update chart colors, tab styles, and typography to new palette
  - [ ] Demo page: revamp layout for easier scenario navigation and profile editing
  - [ ] End-to-end demo walkthrough on physical iPhone across all 5 scenarios
  - [ ] Final accessibility and contrast review

- Phase 8 - Lost Scenario and Demo Hardening (complete as of 2026-05-28, UTC-7):
  - [x] Real-time location tracking for lost_unknown_location scenario
  - [x] Reverse geocoding of device coordinates into human-readable address
  - [x] Proactive lost alert shown to user when lost scenario is active
  - [x] Classroom demo mode toggle on /demo page for lost scenario (UCLA Anderson context override)
  - [x] Follow-up question buttons in stream panel after AI response
  - [x] Caregiver lost alert surfaced on caregiver dashboard when lost scenario is active
  - [x] Call Alex button in lost alert panel on caregiver dashboard

- Phase 7 - Location Additions and Demo Gap Closure (complete as of 2026-05-28, UTC-7):
  - [x] Add "I'm okay", "Call [caregiver]", and "Show this screen" buttons to the streaming response panel in app/app/page.tsx. Log okay_confirmed event. Surface confirmed-okay status on caregiver dashboard.
  - [x] Fix HelperModal hardcoded location and time strings. Pass activeLocationSummary and contextPacket into HelperModal as props and use them for the location and time lines.
  - [x] Add who_is_expected from contextPacket to the Today card in app/app/page.tsx
  - [x] Store AI response text in reorientation_card_viewed event metadata and display it in the caregiver activity panel

- Trusted location handling (complete as of 2026-05-28, UTC-7):
  - [x] Supabase schema updated to support trusted locations and `profiles.active_caregiver_id`
  - [x] `.env.local` updated with Supabase URL, Supabase anon key, and `ANTHROPIC_API_KEY`
  - [x] `data/demoState.ts` updated with shared trusted-location state
  - [x] `data/demoData.ts` updated to build context dynamically from trusted places and "Other"
  - [x] Shared trusted-place matching helper added in `lib/places.ts`
  - [x] Four demo scenarios refreshed so each one maps cleanly to Home, Pharmacy, Home + Doctor Appointment, or Other
  - [x] Seeded trusted-place IDs, coordinates, and doctor appointment mappings added for demo consistency
  - [x] Checked-in SQL migration updated to reflect trusted-location and caregiver fields already used by the app
  - [x] `/app` now uses trusted-place-aware scenario context for passive grounding, Help Me Now packets, and unknown-location fallback copy
  - [x] Caregiver and demo summaries now surface trusted-place context, scenario mapping, and unrecognized-location support cues
  - [x] Switch Anthropic model calls from Claude Sonnet to Claude Haiku
  - [x] Verify end-to-end runtime after dependency/env refresh
- Phase 6 - AI Integration (complete as of 2026-05-19, UTC-7):
  - [x] Installed `@anthropic-ai/sdk`
  - [x] `data/demoData.ts` — `ContextPacket` model and server prompt context generation for scenario-based guidance
  - [x] `app/api/reorient/route.ts` — server-side POST route; accepts `{ question, context, userName }`; per-question system prompt rules (location only / time+activity only / next step only); streams via `ReadableStream`; model `claude-sonnet-4-5`; silent fallback; API key server-side only
  - [x] `app/api/checkin/route.ts` (new) — dual-mode POST: "questions" (non-streaming JSON array of 3 AI check-in questions, generated on demand); "response" (streaming supportive reply ending with "In a full version, I would…"); markdown fence stripping before JSON.parse; silent fallbacks
  - [x] `app/app/page.tsx` — Help Me Now flow: passive today card (date, location, next event from context packet); large button with home icon; tapping opens question-selection modal; selected question streams response into slide-up panel; "Recent guidance" link shows last 5 responses; `reorientation_started` and `reorientation_card_viewed` events logged
  - [x] `app/app/page.tsx` — check-in redesign: on-demand fetch (no auto-load on mount); green-700 full-width trigger button with checkCircle icon (mutes while open); questions slide in via max-height 300ms transition; tap-once-to-select (lime-100/lime-500 highlight, others opacity-60); tap-again-to-confirm; streams supportive response; "Do another check-in" after completion; `checkInDoneThisSession` prevents stale localStorage from blocking questions
  - [x] `app/app/page.tsx` — emergency tab: permanent 48×80px dark-red toggle tab (left-0, bottom-8) + 320px bright-red slide-out action (overflow-hidden, 200ms transition); auto-collapse 4s; click-outside backdrop; tap action triggers callEmergency()
  - [x] `app/app/page.tsx` — UI polish: "Today Window"→"Today" (text-4xl centered); time-aware greeting with emoji; removed subtitle and active-scenario line; removed "Main actions" and "Help me understand" headings; check-in column first; Call caregiver and Show helper card replaced with full-width teal buttons (phone/compass icons) with muted hint text; My Insights navy (bg-blue-900); check-in saved box lime-50/lime-200
  - [x] `app/caregiver/page.tsx` — activity panel excludes `reorientation_started`; includes `reorientation_card_viewed` from systemEvents, sorted by timestamp
  - [x] `components/EventLogList.tsx` — `reorientation_card_viewed` events now display question from metadata (formatted from underscore key)
  - Remaining: add `ANTHROPIC_API_KEY` setup instructions to `README.md`; merge to main

## Blocked Tasks

- None currently.

## Known Issues

- `BUILD_STATUS.md` previously drifted from repo reality; this section now reflects the current codebase as of 2026-05-21 (UTC-7)
- The app has partial Supabase integration (`lib/supabaseClient.ts`, migration, profile/event helpers), but runtime state is still primarily local/demo-driven rather than fully database-backed
- Anthropic AI routes are implemented in `app/api/reorient/route.ts` and `app/api/checkin/route.ts`; setup/docs should refer to Anthropic rather than OpenAI
- Vercel project may still be unlinked or unverified for deployment; this repo status file should not assume deployment readiness without a fresh check
- Phone number links and demo text are placeholders (replace later when real contact/routing is defined)
- `next lint` command is functional and clean, but the tool itself is deprecated by Next.js and should later migrate to ESLint CLI.
- Full runtime verification still needs a completed `npm run build` pass; an earlier build attempt was interrupted manually before completion

## Demo Access Note

- Demo password gate is enabled for whole site.
- Current password: `memory2026`
- Use `/demo` -> **Reset demo state** to clear local data and require password again after refresh.

## End-of-Night QA Log (2026-05-08, UTC-7)

- Final checks run:
  - `npm run lint` -> pass (no ESLint warnings/errors)
  - `npx tsc --noEmit` -> pass
- Runtime crash from missing `profile` in legacy localStorage state was fixed via state normalization/migration.
- No blocking errors remain for MVP demo flow.

### Potential User Challenges Observed

- Reorientation refresh action ("Help me now") may not clearly indicate that guidance cards are already visible by default.
- Emergency/caregiver instructions appear in multiple places; users in distress may benefit from one persistent, high-visibility emergency action.
- Caregiver call target is still a placeholder phone number (`tel:+15551234567`), which could confuse a live demo if clicked.
- Local-only state in `localStorage` can create cross-device/session inconsistency (acceptable for MVP, but worth calling out in demo script).

### Recommended Next Mitigations (Phase 3 polish)

- Add short helper text under "Help me now" clarifying it refreshes guidance and logs a support moment.
- Add a persistent emergency/caregiver quick action in `/app` header or sticky footer for clearer escalation path.
- Replace placeholder caregiver phone with demo-safe label/action before presentation.
- Add a one-line demo note: "Data is local to this browser session for prototype purposes."

## Manual Test Checklist (Demo Readiness)

- [x] /app: Reorientation flow can be triggered and shows a structured grounding card (where/what/next step).
- [x] /app: Quick check-in state can be submitted and confirmation/status is shown.
- [x] /caregiver: Simulated caregiver status and recent check-ins are visible and coherent with current scenario.
- [x] /demo: Scenario can be selected and active scenario is clearly indicated.
- [x] Fallback copy appears when context is incomplete and uses calm, transparent wording.
- [x] Event log emits expected names:
  - `reorientation_started`
  - `reorientation_card_viewed`
  - `checkin_submitted`
  - `caregiver_view_opened`
  - `fallback_shown`
  - `demo_scenario_selected`
- [x] Markdown docs are readable with no encoding artifacts.
- [x] TypeScript check passes (`npx tsc --noEmit`).
- [x] Lint check passes (`npm run lint`) without interactive prompt.

## Changed Files

- `README.md`
- `PROJECT_PLAN.md`
- `BUILD_STATUS.md`
- `DECISIONS.md`
- `FUTURE_IDEAS.md`
- `AGENT_INSTRUCTIONS.md`
- `package.json`
- `tsconfig.json`
- `next-env.d.ts`
- `next.config.ts`
- `postcss.config.mjs`
- `tailwind.config.ts`
- `.gitignore`
- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx`
- `app/app/page.tsx`
- `app/caregiver/page.tsx`
- `app/demo/page.tsx`
- `app/api/checkin/route.ts`
- `app/api/reorient/route.ts`
- `components/MemoryIcon.tsx`
- `components/BrandLogo.tsx`
- `components/SiteHeader.tsx`
- `components/ActionCard.tsx`
- `components/SupportActionCard.tsx`
- `components/HelperModal.tsx`
- `components/TodayCard.tsx`
- `components/ResponseCard.tsx`
- `components/CheckInCard.tsx`
- `components/ScenarioSelector.tsx`
- `components/CaregiverSummary.tsx`
- `components/EventLogList.tsx`
- `lib/places.ts`
- `data/demoData.ts`
- `data/demoState.ts`
- `.env.local`

## Manual Setup Steps (For Later)

### Supabase
- Create a Supabase project
- Copy project URL and anon key from **Project Settings -> API**
- Add to local `.env.local` as:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Later: define and apply schema/migrations once data model is approved

### Vercel
- Connect GitHub repo to Vercel
- Add environment variables in Vercel project settings:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Enable preview + production environments
- Deploy from GitHub and verify build health

## Notes for the Next AI Agent

- Start from `PROJECT_PLAN.md` and preserve strict MVP boundaries.
- Phase 6 AI work is complete in-app and the trusted-location iteration has started.
- Supabase now supports the trusted-location schema needed for `places` and `profiles.active_caregiver_id`.
- The database already contains a `places` table plus `scheduled_events.place_id` and `activity_events.place_id`; continue extending that model rather than inventing a parallel location system.
- Current priority is finishing explicit `place_id` event logging verification, then completing the Haiku model update and a full runtime/build verification pass.
- Do not add push notifications yet.
- After making changes, update this file (status, files, timestamp, and next task).

## Last Updated

2026-05-31 (UTC-7) — Phase 10 in progress. SiteHeader and /app user page visual polish pass complete. tsc and lint pass clean.
