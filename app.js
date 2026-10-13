import {calculateCapacity} from './model.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const storage = {get(key) {try {return localStorage.getItem(key);} catch {return null;}}, set(key, value) {try {localStorage.setItem(key, value);} catch {}}};
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let motionEnabled = storage.get('qbr-motion') !== null ? storage.get('qbr-motion') === 'on' : !reduceMotion.matches;
function setMotion(enabled) {
  motionEnabled = enabled;
  document.documentElement.classList.toggle('motion-off', !enabled);
  $('#motion-state').textContent = enabled ? 'on' : 'off';
  $('#motion-toggle').setAttribute('aria-pressed', String(enabled));
  storage.set('qbr-motion', enabled ? 'on' : 'off');
}
setMotion(motionEnabled);
$('#motion-toggle').addEventListener('click', () => setMotion(!motionEnabled));

function animatePanel(panel) {
  if (!motionEnabled || reduceMotion.matches) return;
  panel.classList.remove('panel-enter');
  void panel.offsetWidth;
  panel.classList.add('panel-enter');
}
function setupTabs(selector, callback) {
  const tabs = $$(selector);
  const select = tab => {
    tabs.forEach(item => {
      const selected = item === tab;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    callback(tab);
  };
  tabs.forEach(tab => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      const index = tabs.indexOf(tab);
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {event.preventDefault();event.stopPropagation();select(tabs[next]);tabs[next].focus();}
    });
  });
  return select;
}

const priorities = {
  backlog: {title: 'The alert backlog', description: 'The recent escalation suggests alerts are arriving faster than the team can clear them.', question: 'Where is work getting stuck, and which cases need attention first?'},
  team: {title: 'A growing team', description: 'New analysts are joining, so onboarding and consistent reviews matter more.', question: 'What are new analysts learning, and where do they still need help?'},
  ai: {title: 'AI adoption', description: 'Based on the usage metrics and our past conversations, there has been hesitancy around AI adoption.', question: 'Let’s better understand your concerns. What has made the team hesitant, and what would help you feel confident moving forward?'},
  owner: {title: 'Organization updates', description: 'We’ve seen some shifts within your organization. Has a new leadership structure been determined?', question: 'Who is responsible for leading initiatives for this team, and how should we align with the new structure?'}
};
setupTabs('[data-priority]', tab => {
  const item = priorities[tab.dataset.priority];
  $('#priority-panel h3').textContent = item.title;
  $('#priority-description').textContent = item.description;
  $('#priority-question').textContent = item.question;
  $('#priority-panel').setAttribute('aria-labelledby', tab.id);
  animatePanel($('#priority-panel'));
});

const recovery = {
  stabilize: {label: 'A clear recovery owner', title: 'A shared view of the problem', description: 'A named Support lead owns the escalation, with updates on your schedule. We document the root cause and recovery plan by October 30, then agree a resolution date with Support.', actions: ['A named Support lead', 'Updates on your schedule', 'Written root cause and recovery plan']},
  clear: {label: 'Next six to eight weeks', title: 'Work the queue by age and risk', description: 'Review aging and risk together. Group related alerts into comprehensive cases and use approved Automations to route work by alert type. I’ll work with your Ops team in a configuration session to fine-tune the settings so the workflow is more effective for your team.', actions: ['Rank the queue by age and risk', 'Merge related alerts into one case', 'Route alerts by type with Automations', 'Fine-tune settings together in a configuration session']},
  prevent: {label: 'An ongoing operating rhythm', title: 'Earlier signals, fewer delays', description: 'Keep the backlog visible in a weekly review with the Ops lead. Flag alerts at day 20 in the proposed workflow and use narrative templates where they improve SAR preparation.', actions: ['Weekly review with the Ops lead', 'Flag alerts at day 20', 'Narrative templates on suitable work']}
};
setupTabs('[data-phase]', tab => {
  const item = recovery[tab.dataset.phase];
  $('#recovery-phase-label').textContent = item.label;
  $('#recovery-title').textContent = item.title;
  $('#recovery-description').textContent = item.description;
  $('#recovery-actions').replaceChildren(...item.actions.map(action => {const li = document.createElement('li');li.textContent = action;return li;}));
  $('#recovery-panel').setAttribute('aria-labelledby', tab.id);
  animatePanel($('#recovery-panel'));
});

const adoption = {
  digital: {status: 'Our operating foundation', title: 'Digital casework', description: 'Case management gives the team a shared place to work and review its history. Core usage remains steady.', tools: 'Case management, Automations and e-filing. Confirm the deployed configuration.', oversight: 'Analysts review and decide each case.'},
  assisted: {status: 'Introduced; adoption lagging', title: 'AI-assisted analysts', description: 'AI helps analysts read, summarize and draft while analysts still perform the review. A useful workflow and repeat use matter more than a feature launch.', tools: 'AI Assistant, file summaries and case narratives. Availability and access to confirm.', oversight: 'Analysts verify the output and remain responsible for the review.'},
  agent: {status: 'Proposed pilot on one alert type', title: 'An agent prepares the first pass', description: 'Research and Review Agents gather context and prepare routine casework using Meridian’s procedures. The pilot starts with comparison, then human approval.', tools: 'Research and Review Agents in Observe, then Recommend, after readiness and QA gates.', oversight: 'In Observe, agent work is evaluated alongside analysts. In Recommend, analysts accept, edit or override.'},
  automated: {status: 'A separate, later decision', title: 'Automation where evidence supports it', description: 'Some suitable alert types may eventually be completed automatically after documented performance and approval. Other workflows may continue to need human decisions.', tools: 'Review Agent in Automate mode, only if approved for a defined workflow.', oversight: 'Agreed QA sampling, ongoing monitoring and controls to pause or revise the workflow.'}
};
setupTabs('[data-stage]', tab => {
  const item = adoption[tab.dataset.stage];
  $('#adoption-status').textContent = item.status;
  $('#adoption-title').textContent = item.title;
  $('#adoption-description').textContent = item.description;
  $('#adoption-tools').textContent = item.tools;
  $('#adoption-oversight').textContent = item.oversight;
  $('#adoption-panel').setAttribute('aria-labelledby', tab.id);
  animatePanel($('#adoption-panel'));
});

const pilot = {
  baseline: {date: 'November · two weeks', title: 'A fair starting point', description: 'Measure current review time including QA, quality results and alert aging before testing the workflow.', gateLabel: 'Gate to progress', gate: 'Security sign-off and written procedures.'},
  observe: {date: 'Late November–December', title: 'Evidence before recommendations', description: 'The agent runs in the background alongside analyst work. QA adjudicates output and discrepancies against agreed procedures, including known escalation cases.', gateLabel: 'Gate to progress', gate: 'QA-adjudicated accuracy meets Meridian’s standard. All known escalation test cases are flagged.'},
  recommend: {date: 'January', title: 'A first pass, with human decisions', description: 'Agents draft the first pass. Analysts accept, edit or override, and we measure the effort of verifying and correcting the output.', gateLabel: 'Gate to wider use', gate: 'Faster reviews with QA results at least as good. Total effort includes verification, QA and rework.'},
  decide: {date: 'Early February', title: 'Expand, adjust or stop', description: 'Review measured value, quality and repeat use. Decide whether to extend the workflow to more eligible work, revise it, or stop.', gateLabel: 'Outcome', gate: 'Evidence informs renewal and any additional scope. Automate mode remains a separate decision.'}
};
setupTabs('[data-pilot]', tab => {
  const item = pilot[tab.dataset.pilot];
  $('#pilot-date').textContent = item.date;
  $('#pilot-title').textContent = item.title;
  $('#pilot-description').textContent = item.description;
  $('#pilot-gate-label').textContent = item.gateLabel;
  $('#pilot-gate').textContent = item.gate;
  $('#pilot-panel').setAttribute('aria-labelledby', tab.id);
  animatePanel($('#pilot-panel'));
});

const plans = {
  oct: {title: 'October: clear ownership', recovery: 'Name the Support lead. Document the root cause and recovery plan by October 30.', ai: 'Identify the pilot owner and prepare the security review with InfoSec and vendor risk.', renewal: 'Name an executive sponsor and operating owner by October 23.'},
  nov: {title: 'November: readiness and a baseline', recovery: 'Hold a configuration session with the Ops team in early November to fine-tune settings, grouping and routing. Work down the aged queue and review progress weekly.', ai: 'Hold the security session by November 6. Agree scope by November 13, then baseline and begin Observe after approval.', renewal: 'Begin renewal planning with procurement. Map the decision process and lead times.'},
  dec: {title: 'December: recovery and quality evidence', recovery: 'Proposed target: fewer than 200 alerts open over 30 days by December 15. Continue weekly prevention reviews.', ai: 'QA evaluates Observe results and escalation test cases. Decide whether the quality gate supports Recommend.', renewal: 'Continue vendor and procurement review. Share recovery and pilot evidence at the executive checkpoint.'},
  jan: {title: 'January: recommendations in real work', recovery: 'Keep the aged queue visible and review incoming volume, assignments and capacity.', ai: 'If the quality gate passes, use Recommend. Measure total effort, QA, corrections and repeat use.', renewal: 'Review the scorecard with sponsors and Sales. Confirm the evidence needed for renewal.'},
  feb: {title: 'February: the scope decision', recovery: 'Validate sustained recovery and the operating cadence that prevents delays.', ai: 'Decide whether to expand, adjust or stop the pilot based on evidence.', renewal: 'Prepare the renewal proposal. Confirm licensing and costs before any incremental commercial scope.'},
  mar: {title: 'March: renewal and the next quarter', recovery: 'Continue the agreed operating rhythm with named owners.', ai: 'Extend proven use only where suitability, permissions and quality requirements are satisfied.', renewal: 'Complete the renewal decision against the agreed success criteria and confirm the next-quarter plan.'}
};
setupTabs('[data-month]', tab => {
  const item = plans[tab.dataset.month];
  $('#month-title').textContent = item.title;
  $('#plan-recovery').textContent = item.recovery;
  $('#plan-ai').textContent = item.ai;
  $('#plan-renewal').textContent = item.renewal;
  $('#month-panel').setAttribute('aria-labelledby', tab.id);
  animatePanel($('#month-panel'));
});

const points = {april: 'April · 82', july: 'July · 74', october: 'October · 61'};
$$('[data-point]').forEach(point => {
  const show = () => {$('#health-detail').textContent = points[point.dataset.point];};
  point.addEventListener('mouseenter', show);
  point.addEventListener('focus', show);
  point.addEventListener('click', show);
  point.addEventListener('keydown', event => {if (event.key === 'Enter' || event.key === ' ') {event.preventDefault();show();}});
});
const numberFormat = new Intl.NumberFormat('en-US');
function updateCapacity() {
  const reviews = Number($('#monthly-reviews').value);
  const baseline = Number($('#baseline-minutes').value);
  const proposed = Number($('#pilot-minutes').value);
  const result = calculateCapacity(reviews, baseline, proposed);
  $('#monthly-reviews-value').value = numberFormat.format(reviews);
  $('#baseline-minutes-value').value = `${baseline} min`;
  $('#pilot-minutes-value').value = `${proposed} min`;
  $('#capacity-hours').textContent = result.hours !== 0 && result.roundedHours === 0 ? '< 10' : numberFormat.format(result.roundedHours);
  $('#capacity-direction').textContent = result.hours < 0 ? 'Additional effort in this scenario' : result.hours === 0 ? 'No change in total effort' : 'Potential capacity released';
  $('#capacity-message').textContent = result.hours < 0 ? 'of additional analyst time per month' : 'of analyst time per month';
  $('#capacity-formula').textContent = `${numberFormat.format(reviews)} reviews × ${Math.abs(result.minutesSaved)} minutes ${result.hours < 0 ? 'added' : 'saved'} ÷ 60`;
  $('#capacity-footnote').textContent = result.hours < 0 ? 'This workflow adds effort. Adjust or stop it if the added work is not justified by the quality benefit.' : result.hours === 0 ? 'The assumed total review times are equal. There is no released capacity in this scenario.' : 'Capacity to absorb growth while analysts focus on complex investigations. This is not automatically a cash saving.';
}
['monthly-reviews', 'baseline-minutes', 'pilot-minutes'].forEach(id => $(`#${id}`).addEventListener('input', updateCapacity));
$('#reset-capacity').addEventListener('click', () => {$('#monthly-reviews').value = '2000';$('#baseline-minutes').value = '22';$('#pilot-minutes').value = '12';updateCapacity();});
updateCapacity();

let savedChecklist = {};
try {savedChecklist = JSON.parse(storage.get('qbr-discussion-v1') || '{}');} catch {}
$$('[data-commitment]').forEach(input => {input.checked = savedChecklist[input.dataset.commitment] === true;});
function updateChecklist() {
  const inputs = $$('[data-commitment]');
  const count = inputs.filter(input => input.checked).length;
  $('#checklist-status').textContent = `${count} of ${inputs.length} discussed`;
  storage.set('qbr-discussion-v1', JSON.stringify(Object.fromEntries(inputs.map(input => [input.dataset.commitment, input.checked]))));
}
$$('[data-commitment]').forEach(input => input.addEventListener('change', updateChecklist));
$('#reset-checklist').addEventListener('click', () => {$$('[data-commitment]').forEach(input => {input.checked = false;});updateChecklist();$('#copy-status').textContent = '';});
updateChecklist();
const actionPlan = `Meridian Trust Bank — proposed QBR action plan\nOctober 2026\n\nCUSTOMER ASKS\nBy October 23: name an executive sponsor and day-to-day owner.\nEarly November: hold a configuration session with the Ops team to fine-tune settings and workflows.\nBy November 6: hold the AI security working session.\nBy November 13: agree pilot scope after readiness review.\nIn November: begin renewal planning with procurement.\n\nHUMMINGBIRD COMMITMENTS\nA named Support lead and updates on Meridian’s schedule, starting this week.\nRoot cause and recovery plan by October 30; resolution date agreed with Support.\nWeekly backlog reviews; proposed target below 200 alerts open over 30 days by December 15.\nA Hummingbird executive sponsor paired with the VP of Compliance.\n\nPILOT\nOne suitable alert type and four analysts, subject to access and security approval.\nBaseline in November. Observe in late November–December. Recommend in January only after QA gate. Decide in early February.\nQuality is adjudicated by QA; known escalation cases are tested. Analyst agreement is a supporting measure.\n\nCADENCE\nWeekly operating reviews and monthly executive checkpoints.\n\nRENEWAL\nMarch 2027. $220K annual contract value.\nWhat outcomes would give Meridian confidence to renew?\n\nDates and targets are proposals to agree together.`;
$('#copy-plan').addEventListener('click', async () => {
  try {await navigator.clipboard.writeText(actionPlan);$('#copy-status').textContent = 'Action plan copied. Dates and targets remain proposals to agree together.';}
  catch {$('#copy-status').textContent = 'Copy is unavailable in this browser. You can print the review instead.';}
});

const sourceDialog = $('#sources-dialog');
$('#sources-open').addEventListener('click', () => sourceDialog.showModal());
$('#sources-close').addEventListener('click', () => sourceDialog.close());
sourceDialog.addEventListener('click', event => {if (event.target === sourceDialog) {const bounds = sourceDialog.getBoundingClientRect();if(event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) sourceDialog.close();}});
$('#print-review').addEventListener('click', () => window.print());

function setMenu(open) {
  document.body.classList.toggle('sidebar-open', open);
  $('#menu-toggle').setAttribute('aria-expanded', String(open));
  $('#menu-shade').hidden = !open;
}
$('#menu-toggle').addEventListener('click', () => setMenu(!document.body.classList.contains('sidebar-open')));
$('#menu-shade').addEventListener('click', () => setMenu(false));

const chapters = $$('.chapter');
const navLinks = $$('#chapter-nav a');
let activeChapter = chapters[0];
function setActive(chapter) {
  if (!chapter) return;
  activeChapter = chapter;
  navLinks.forEach(link => {const active = link.hash === `#${chapter.id}`;link.classList.toggle('active', active);if (active) link.setAttribute('aria-current', 'location');else link.removeAttribute('aria-current');});
  $('#chapter-status').textContent = chapter.dataset.navLabel;
}
function goToChapter(chapter, updateHash = true) {
  if (!chapter) return;
  const topBar = document.body.classList.contains('presentation-mode') ? 0 : innerWidth <= 900 ? 62 : 0;
  window.scrollTo({top: Math.max(0, window.scrollY + chapter.getBoundingClientRect().top - topBar), behavior: motionEnabled && !reduceMotion.matches ? 'smooth' : 'auto'});
  if (updateHash) history.replaceState(null, '', `#${chapter.id}`);
  setActive(chapter);
  setMenu(false);
}
$$('a[href^="#"]').forEach(link => link.addEventListener('click', event => {const target = document.getElementById(link.hash.slice(1));if (!target) return;event.preventDefault();goToChapter(target);}));
let scrollQueued = false;
function updateScroll() {
  scrollQueued = false;
  const threshold = Math.min(innerHeight * .3, 230);
  let current = chapters[0];
  chapters.forEach(chapter => {if (chapter.getBoundingClientRect().top <= threshold) current = chapter;});
  setActive(current);
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  const percent = scrollable > 0 ? Math.min(100, Math.max(0, scrollY / scrollable * 100)) : 0;
  $('#read-progress').style.width = `${percent}%`;
  $('#read-percent').textContent = `${Math.round(percent)}%`;
}
addEventListener('scroll', () => {if(!scrollQueued) {scrollQueued = true;requestAnimationFrame(updateScroll);}}, {passive:true});
addEventListener('resize', updateScroll, {passive:true});
updateScroll();

const exitButton = document.createElement('button');
exitButton.className = 'presentation-exit';
exitButton.textContent = 'Exit presentation';
exitButton.setAttribute('aria-label', 'Exit presentation mode');
document.body.append(exitButton);
let toastTimer;
function setPresentation(enabled) {
  document.body.classList.toggle('presentation-mode', enabled);
  $('#presentation-toggle').setAttribute('aria-pressed', String(enabled));
  setMenu(false);
  clearTimeout(toastTimer);
  $('#presentation-toast').hidden = !enabled;
  if (enabled) {toastTimer = setTimeout(() => {$('#presentation-toast').hidden = true;}, 4200);exitButton.focus({preventScroll:true});}
  else $('#presentation-toggle').focus({preventScroll:true});
  setTimeout(() => goToChapter(activeChapter, false), motionEnabled && !reduceMotion.matches ? 370 : 0);
}
$('#presentation-toggle').addEventListener('click', () => setPresentation(!document.body.classList.contains('presentation-mode')));
exitButton.addEventListener('click', () => setPresentation(false));
addEventListener('keydown', event => {
  if (event.key === 'Escape') {if (document.body.classList.contains('sidebar-open')) {setMenu(false);$('#menu-toggle').focus();}else if(document.body.classList.contains('presentation-mode') && !sourceDialog.open) setPresentation(false);return;}
  if (sourceDialog.open || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.target instanceof Element && event.target.closest('input,textarea,select,button,[role="tab"],[role="button"],[contenteditable="true"]') && !event.target.classList.contains('presentation-exit')) return;
  const index = chapters.indexOf(activeChapter);
  if (event.key === 'ArrowRight') {event.preventDefault();goToChapter(chapters[Math.min(index + 1, chapters.length - 1)]);}
  if (event.key === 'ArrowLeft') {event.preventDefault();goToChapter(chapters[Math.max(index - 1, 0)]);}
});

const counted = new WeakSet();
function animateCount(element) {
  if (counted.has(element)) return;
  counted.add(element);
  const target = Number(element.dataset.count);
  if (!motionEnabled || reduceMotion.matches) {element.textContent = numberFormat.format(target);return;}
  const start = performance.now();
  function tick(now) {const t = Math.min(1, (now - start) / 1100);const eased = 1 - Math.pow(1-t, 3);element.textContent = numberFormat.format(Math.round(target*eased));if(t<1 && motionEnabled) requestAnimationFrame(tick);else element.textContent = numberFormat.format(target);}
  requestAnimationFrame(tick);
}
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {if(entry.isIntersecting) {entry.target.classList.add('is-visible');entry.target.querySelectorAll('[data-count]').forEach(animateCount);observer.unobserve(entry.target);}});
  }, {threshold:.08, rootMargin:'0px 0px -25px 0px'});
  $$('.reveal').forEach(element => observer.observe(element));
  document.documentElement.classList.add('motion-ready');
} else $$('.reveal').forEach(element => element.classList.add('is-visible'));

if (location.hash) {
  const target = document.getElementById(location.hash.slice(1));
  if (target?.classList.contains('chapter')) requestAnimationFrame(() => goToChapter(target, false));
}
