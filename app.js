'use strict';
const STORAGE_KEY = 'craigco-content-studio-v1';
const ROUTES = ['seminars', 'education', 'giving'];
const LABELS = { seminars: 'Seminars', education: 'Technology education', giving: 'Apple Seed AI' };
const DEFAULTS = {
  schemaVersion: 1, active: 'seminars', updatedAt: null,
  tools: { audience: 'Community group', duration: '60', level: 'starting', contribution: 'device' },
  sections: {
    seminars: {
      title: 'A room full of possibility.',
      intro: 'Friendly, practical sessions for condo communities, clubs, and curious groups. See what AI can do, ask the questions on your mind, and leave with something to try.', notes: '',
      modules: [
        { id: 'basics', title: 'AI, in plain English', description: 'A clear introduction to what AI does, where it helps, and why human judgment matters.', enabled: true },
        { id: 'demo', title: 'See it. Try it.', description: 'Live examples: plan a trip, improve a message, or learn something new with a better question.', enabled: true },
        { id: 'safety', title: 'A little digital street smarts', description: 'Recognize misleading content, check an answer, and make thoughtful privacy choices.', enabled: true },
        { id: 'questions', title: 'Bring your own questions', description: 'An open conversation shaped by the people in the room.', enabled: true },
        { id: 'host', title: 'Information for hosts', description: 'Suggested venue needs, group size, session format, and a checklist for planning a community event.', enabled: false }
      ]
    },
    education: {
      title: 'Your next small breakthrough.',
      intro: 'Patient, hands-on technology learning. Start with a task that matters to you, build a useful skill, and get comfortable doing it yourself.', notes: '',
      modules: [
        { id: 'prompting', title: 'Ask a better question', description: 'Give AI useful context, ask for the format you want, and improve an answer with a follow-up.', enabled: true },
        { id: 'everyday', title: 'Make everyday things easier', description: 'Practice with writing, travel planning, learning, and the small tasks that fill a day.', enabled: true },
        { id: 'devices', title: 'Get comfortable with your technology', description: 'Learn the basics on a Windows PC, Mac, or iPhone, one practical task at a time.', enabled: true },
        { id: 'organization', title: 'Tame the digital clutter', description: 'Explore sensible habits for email, files, photos, and finding things again.', enabled: false },
        { id: 'practice', title: 'A take-home practice kit', description: 'Simple exercises, useful example prompts, and a plan for the next small win.', enabled: true }
      ]
    },
    giving: {
      title: 'Plant a seed. Open a door.',
      intro: 'Apple Seed AI is Craig’s giving initiative: help someone get access to technology and the confidence to use it. Gifts are unconditional. The person comes first.', notes: '',
      modules: [
        { id: 'access', title: 'A device can be a beginning', description: 'A useful laptop or other technology can open new ways to learn, connect, and work.', enabled: true },
        { id: 'guidance', title: 'Pair access with patient guidance', description: 'Help someone get started, learn a few essentials, and build their own digital independence.', enabled: true },
        { id: 'unconditional', title: 'A gift without strings', description: 'No required testimonial, repayment, or participation. Give the person room to choose their own next step.', enabled: true },
        { id: 'recognition', title: 'Celebrate the good, if invited', description: 'An optional thank-you or Wall of Fame recognition, only when the recipient wants to share.', enabled: false },
        { id: 'impact', title: 'Small moments, real possibility', description: 'Optional stories of what a gift made possible, shared with permission and respect for privacy.', enabled: false }
      ]
    }
  }
};
const clone = value => JSON.parse(JSON.stringify(value));
const $ = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));
let state = clone(DEFAULTS), storageAvailable = true, studioRoute = 'seminars', toastTimer;

function validatePlan(value) {
  if (!value || value.schemaVersion !== 1 || !value.sections || !ROUTES.includes(value.active)) throw new Error('This file is not a CrAIgCo content plan.');
  const clean = clone(DEFAULTS);
  clean.active = value.active;
  for (const route of ROUTES) {
    const section = value.sections[route];
    if (!section || typeof section.title !== 'string' || !section.title.trim() || section.title.length > 120 || typeof section.intro !== 'string' || section.intro.length > 1200 || typeof section.notes !== 'string' || section.notes.length > 12000 || !Array.isArray(section.modules) || section.modules.length > 20) throw new Error('A section is missing or contains invalid content.');
    const ids = new Set();
    clean.sections[route] = { title: section.title, intro: section.intro, notes: section.notes, modules: section.modules.map(module => {
      if (!module || typeof module.id !== 'string' || !/^[a-z0-9-]{1,80}$/.test(module.id) || ids.has(module.id) || typeof module.title !== 'string' || !module.title.trim() || module.title.length > 100 || typeof module.description !== 'string' || module.description.length > 600 || typeof module.enabled !== 'boolean') throw new Error('A content block is invalid.');
      ids.add(module.id);
      return { id: module.id, title: module.title, description: module.description, enabled: module.enabled };
    }) };
  }
  const tools = value.tools || {};
  if (['Community group','Condo residents','Small business owners'].includes(tools.audience)) clean.tools.audience = tools.audience;
  if (['60','90'].includes(tools.duration)) clean.tools.duration = tools.duration;
  if (['starting','building','exploring'].includes(tools.level)) clean.tools.level = tools.level;
  if (['device','time','gift'].includes(tools.contribution)) clean.tools.contribution = tools.contribution;
  if (typeof value.updatedAt === 'string' && Number.isFinite(Date.parse(value.updatedAt))) clean.updatedAt = value.updatedAt;
  return clean;
}
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) state = validatePlan(JSON.parse(stored));
} catch (error) {
  if (error instanceof SyntaxError || /invalid|missing|CrAIgCo/.test(error.message)) {
    try { localStorage.removeItem(STORAGE_KEY); } catch { storageAvailable = false; }
  } else storageAvailable = false;
}

function save() {
  state.updatedAt = new Date().toISOString();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageAvailable = true; } catch { storageAvailable = false; }
  updateSaveStatus();
}
function updateSaveStatus() {
  const status = $('#save-status');
  status.textContent = storageAvailable ? (state.updatedAt ? 'Saved in this browser · ' + new Date(state.updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Ready to edit · Changes save in this browser') : 'Browser storage is unavailable. Export a plan to keep your changes.';
  status.classList.toggle('browser-warning', !storageAvailable);
}
function toast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3500);
}
function segmented(key, choices) {
  return `<div class="segmented" role="group" aria-label="${esc(key === 'duration' ? 'Session length' : key === 'level' ? 'Learning starting point' : 'Contribution type')}">${choices.map(([value,label]) => `<button type="button" data-choice="${key}" data-value="${value}" aria-pressed="${state.tools[key] === value}">${label}</button>`).join('')}</div>`;
}
function seminarPlan() {
  const long = state.tools.duration === '90';
  const example = { 'Community group': 'Plan a local outing and draft an invitation.', 'Condo residents': 'Plan a community gathering and simplify a resident notice.', 'Small business owners': 'Draft a customer reply and improve a repeat task.' }[state.tools.audience];
  return { title: `${state.tools.duration}-minute session · ${state.tools.audience}`, lines: [ `${long ? '15' : '10'} min — AI basics, in plain English.`, `${long ? '30' : '20'} min — Live demonstration. ${example}`, `${long ? '25' : '15'} min — Guided practice and checking the result.`, `${long ? '20' : '15'} min — Questions and a next step to try at home.` ] };
}
function learningPlan() {
  return {
    starting: { title: 'Start small. Make it useful.', lines: ['Open an AI chat and ask one everyday question.', 'Add context: what you need, who it is for, and how you want the answer.', 'Try the result, then ask one follow-up to improve it.'], prompt: 'I am new to AI. Help me plan one simple meal using ingredients I already have. Ask me what is in my kitchen, then explain each step in plain English.' },
    building: { title: 'Build a repeatable skill.', lines: ['Choose a task you do often, such as drafting a message.', 'Create a reusable prompt with your tone and format.', 'Compare the answer with your goal, verify details, and refine.'], prompt: 'Help me create a reusable prompt for drafting friendly, concise messages. Ask me about the audience, purpose, and tone. Then give me a template I can adapt.' },
    exploring: { title: 'Turn an idea into a small project.', lines: ['Choose a clear outcome: a travel plan, a class guide, or a simple webpage.', 'Break the project into steps and finish one small version.', 'Check the output, collect feedback, and improve the next version.'], prompt: 'Help me turn an idea into a small, useful project. Ask me what I want to make and who will use it. Then suggest the smallest working first version and a way to check it.' }
  }[state.tools.level];
}
function givingPlan() {
  return {
    device: { title: 'Equip someone to begin.', lines: ['Start with the person: ask what they want to do.', 'Choose a useful device and help with the first setup.', 'Offer a patient introduction and leave the next steps up to them.'] },
    time: { title: 'Share a little know-how.', lines: ['Invite the person to choose one task they want to learn.', 'Work through it together, at their pace.', 'Let them try it independently and offer optional follow-up.'] },
    gift: { title: 'Give without strings.', lines: ['Choose an amount or useful gift that feels right to you.', 'Offer it without obligations or required publicity.', 'Let the recipient decide what it makes possible.'] }
  }[state.tools.contribution];
}
function resultMarkup(plan) { return `<div class="tool-result"><h5>${esc(plan.title)}</h5><ol>${plan.lines.map(line => `<li>${esc(line)}</li>`).join('')}</ol></div>`; }
function renderTool(route) {
  if (route === 'seminars') return `<p class="eyebrow">Try a session plan</p><h4>A useful hour starts here.</h4><label class="tool-label" for="audience">Who is in the room?</label><select id="audience">${['Community group','Condo residents','Small business owners'].map(a => `<option${state.tools.audience === a ? ' selected' : ''}>${a}</option>`).join('')}</select><span class="tool-label">How much time?</span>${segmented('duration', [['60','60 minutes'],['90','90 minutes']])}${resultMarkup(seminarPlan())}<button class="button secondary" data-save-idea="seminars">Keep this outline in my notes <span aria-hidden="true">+</span></button><p class="tool-note">Planning options for this draft; event dates and booking are not open.</p>`;
  if (route === 'education') return `<p class="eyebrow">Find a starting point</p><h4>Where would you like to begin?</h4>${segmented('level', [['starting','Just starting'],['building','Building skills'],['exploring','Exploring more']])}${resultMarkup(learningPlan())}<button class="button secondary" id="copy-prompt">Copy a practice prompt <span aria-hidden="true">↗</span></button><button class="small-link" data-save-idea="education">Keep this learning path in my notes +</button><p class="tool-note">An example learning path you can try today.</p>`;
  return `<p class="eyebrow">One seed at a time</p><h4>What could you offer?</h4>${segmented('contribution', [['device','A device'],['time','Learning time'],['gift','A gift']])}${resultMarkup(givingPlan())}<button class="button secondary" data-save-idea="giving">Keep this approach in my notes <span aria-hidden="true">+</span></button><p class="tool-note">Explore the giving idea here. This draft does not collect money or applications.</p>`;
}
function renderPanel(focusTarget) {
  const route = state.active, section = state.sections[route], selected = section.modules.filter(m => m.enabled);
  document.querySelectorAll('[data-tab]').forEach(button => { const active = button.dataset.tab === route; button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1; });
  $('#path-panel').setAttribute('aria-labelledby', `tab-${route}`);
  $('#path-panel').innerHTML = `<div class="path-description"><p class="eyebrow">${LABELS[route]}</p><h3>${esc(section.title)}</h3><p class="intro">${esc(section.intro)}</p><div class="content-blocks">${selected.length ? selected.map(m => `<article class="content-block"><h4>${esc(m.title)}</h4><p>${esc(m.description)}</p></article>`).join('') : '<p class="empty-state">This section is a clean slate. Choose content blocks in Content Studio to bring it to life.</p>'}</div></div><div class="path-tool">${renderTool(route)}</div>`;
  if (focusTarget) $(focusTarget)?.focus({ preventScroll: true });
}
function chooseRoute(route, scroll = false) {
  if (!ROUTES.includes(route)) return;
  state.active = route; save(); renderPanel();
  if (scroll) { $('#explore').scrollIntoView({ behavior: 'smooth', block: 'start' }); $('#path-panel').focus({ preventScroll: true }); }
}
function renderStudio() {
  const section = state.sections[studioRoute];
  $('#studio-section').value = studioRoute;
  $('#studio-fields').innerHTML = `<label class="field-label" for="edit-title">Section headline</label><input id="edit-title" maxlength="120" value="${esc(section.title)}"><label class="field-label" for="edit-intro">Introduction</label><textarea id="edit-intro" maxlength="1200" rows="3">${esc(section.intro)}</textarea><div class="studio-subhead"><h3>Content blocks</h3><span>${section.modules.filter(m => m.enabled).length} of ${section.modules.length} included</span></div><p class="storage-note">Check to include. Use the arrows to set the reading order.</p><div class="module-list">${section.modules.map((m,i) => `<div class="module-option"><input type="checkbox" id="module-${m.id}" data-module="${m.id}"${m.enabled ? ' checked' : ''}><label for="module-${m.id}">${esc(m.title)}<span>${esc(m.description)}</span></label><div class="order-buttons"><button type="button" data-move="${m.id}" data-direction="-1" aria-label="Move ${esc(m.title)} up"${i === 0 ? ' disabled' : ''}>↑</button><button type="button" data-move="${m.id}" data-direction="1" aria-label="Move ${esc(m.title)} down"${i === section.modules.length - 1 ? ' disabled' : ''}>↓</button></div></div>`).join('')}</div><details class="add-block"><summary>Add your own content block</summary><label class="field-label" for="new-block-title">Block title</label><input id="new-block-title" maxlength="100" placeholder="e.g., A hands-on demonstration"><label class="field-label" for="new-block-description">What belongs here?</label><textarea id="new-block-description" maxlength="600" rows="2" placeholder="Describe the content you want to include."></textarea><button class="button secondary" id="add-block" type="button"${section.modules.length >= 20 ? ' disabled' : ''}>Add to this section +</button></details><label class="field-label" for="edit-notes">My planning notes <span style="font-weight:400">(kept out of the page copy)</span></label><textarea id="edit-notes" maxlength="12000" rows="4" placeholder="Ideas, decisions, questions, and next steps…">${esc(section.notes)}</textarea>`;
  updateSaveStatus();
}
function openStudio(route = state.active) {
  studioRoute = route; renderStudio();
  if (!$('#studio-dialog').open) $('#studio-dialog').showModal();
}
function closeStudio() { $('#studio-dialog').close(); }
function briefText() {
  return ['CrAIgCo — Content brief', 'Private planning draft', '', ...ROUTES.flatMap(route => { const section = state.sections[route]; return [LABELS[route].toUpperCase(), section.title, section.intro, '', 'INCLUDED CONTENT', ...section.modules.filter(m => m.enabled).map(m => `• ${m.title}: ${m.description}`), '', 'PLANNING NOTES', section.notes || '(No notes yet.)', '', '—', '']; }), 'Prepared: ' + new Date().toLocaleString()].join('\n');
}
async function copyText(value, success) {
  try { await navigator.clipboard.writeText(value); toast(success); }
  catch { $('#brief-text').value = value; $('#brief-dialog').showModal(); $('#brief-text').focus(); $('#brief-text').select(); }
}
function exportPlan() {
  const plan = { ...clone(state), exportedAt: new Date().toISOString() };
  const url = URL.createObjectURL(new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'CrAIgCo_Content_Plan_' + new Date().toISOString().slice(0,10) + '.json'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); toast('Content plan exported. Keep it to import on another device.');
}
function keepIdea(route) {
  const plan = route === 'seminars' ? seminarPlan() : route === 'education' ? learningPlan() : givingPlan();
  const note = plan.title + '\n' + plan.lines.map(line => '• ' + line).join('\n');
  const section = state.sections[route];
  if (section.notes.includes(note)) { toast('That plan is already in your notes.'); return; }
  if ((section.notes + note).length > 11950) { toast('Your notes are full. Export the plan before adding more.'); return; }
  section.notes = section.notes ? section.notes + '\n\n' + note : note; save(); toast('Added to ' + LABELS[route] + ' notes in Content Studio.');
}
document.addEventListener('click', event => {
  const routeButton = event.target.closest('[data-route]');
  if (routeButton) chooseRoute(routeButton.dataset.route, true);
  const tab = event.target.closest('[data-tab]');
  if (tab) chooseRoute(tab.dataset.tab);
  if (event.target.closest('[data-open-studio]')) openStudio();
  if (event.target.closest('[data-close-studio]')) closeStudio();
  const choice = event.target.closest('[data-choice]');
  if (choice) { state.tools[choice.dataset.choice] = choice.dataset.value; save(); renderPanel(`[data-choice="${choice.dataset.choice}"][data-value="${choice.dataset.value}"]`); }
  const idea = event.target.closest('[data-save-idea]');
  if (idea) keepIdea(idea.dataset.saveIdea);
  const move = event.target.closest('[data-move]');
  if (move) { const modules = state.sections[studioRoute].modules, index = modules.findIndex(m => m.id === move.dataset.move), next = index + Number(move.dataset.direction); if (next < 0 || next >= modules.length) return; [modules[index],modules[next]] = [modules[next],modules[index]]; save(); renderStudio(); renderPanel(); $(`[data-move="${move.dataset.move}"][data-direction="${move.dataset.direction}"]`)?.focus({preventScroll:true}); }
  if (event.target.closest('#copy-prompt')) copyText(learningPlan().prompt, 'Practice prompt copied. Try it in your preferred AI chat.');
});
$('#path-panel').addEventListener('change', event => {
  if (event.target.id === 'audience') { state.tools.audience = event.target.value; save(); renderPanel('#audience'); }
});
document.querySelector('.path-tabs').addEventListener('keydown', event => {
  if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
  event.preventDefault(); let index = ROUTES.indexOf(state.active);
  if (event.key === 'ArrowRight') index = (index + 1) % 3;
  if (event.key === 'ArrowLeft') index = (index + 2) % 3;
  if (event.key === 'Home') index = 0;
  if (event.key === 'End') index = 2;
  chooseRoute(ROUTES[index]); $(`[data-tab="${state.active}"]`).focus();
});
$('#edit-current').addEventListener('click', () => openStudio());
$('#studio-section').addEventListener('change', event => { studioRoute = event.target.value; state.active = studioRoute; save(); renderStudio(); renderPanel(); });
$('#studio-fields').addEventListener('input', event => {
  const section = state.sections[studioRoute];
  if (event.target.id === 'edit-title' && event.target.value.trim()) section.title = event.target.value;
  else if (event.target.id === 'edit-intro') section.intro = event.target.value;
  else if (event.target.id === 'edit-notes') section.notes = event.target.value;
  else return;
  save(); renderPanel();
});
$('#studio-fields').addEventListener('change', event => {
  if (event.target.id === 'edit-title' && !event.target.value.trim()) { event.target.value = state.sections[studioRoute].title; toast('The section headline needs a little text. Your previous headline is kept.'); return; }
  if (!event.target.matches('[data-module]')) return;
  const section = state.sections[studioRoute];
  section.modules.find(m => m.id === event.target.dataset.module).enabled = event.target.checked;
  save(); renderPanel(); $('.studio-subhead span').textContent = `${section.modules.filter(m => m.enabled).length} of ${section.modules.length} included`;
});
$('#studio-fields').addEventListener('click', event => {
  if (!event.target.closest('#add-block')) return;
  const title = $('#new-block-title').value.trim(), description = $('#new-block-description').value.trim(), modules = state.sections[studioRoute].modules;
  if (!title) { $('#new-block-title').focus(); toast('Give the new content block a title.'); return; }
  if (modules.length >= 20) { toast('This section has reached 20 content blocks.'); return; }
  modules.push({ id: 'custom-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,6), title, description, enabled: true });
  save(); renderStudio(); renderPanel(); toast('Your content block is included.');
});
$('#preview-changes').addEventListener('click', () => { chooseRoute(studioRoute); closeStudio(); $('#explore').scrollIntoView({behavior:'smooth'}); $('#path-panel').focus({preventScroll:true}); });
$('#copy-brief').addEventListener('click', () => copyText(briefText(), 'Content brief copied.'));
$('#export-plan').addEventListener('click', exportPlan);
$('#export-footer').addEventListener('click', exportPlan);
$('#import-plan').addEventListener('click', () => $('#import-file').click());
$('#import-file').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > 250000) throw new Error('Choose a CrAIgCo JSON plan under 250 KB.');
    const imported = validatePlan(JSON.parse(await file.text()));
    pendingImport = imported;
    $('#reset-title').textContent = 'Import this content plan?';
    $('#reset-dialog p').textContent = 'This replaces the content choices and notes saved in this browser. Export your current plan first if you want to keep it.';
    $('#confirm-reset').textContent = 'Import plan'; $('#reset-dialog').showModal();
  } catch (error) { toast(error instanceof SyntaxError ? 'This file is not valid JSON. Choose an exported CrAIgCo plan.' : error.message); }
  event.target.value = '';
});
let pendingImport = null;
$('#reset-plan').addEventListener('click', () => { pendingImport = null; $('#reset-title').textContent = 'Reset your content?'; $('#reset-dialog p').textContent = 'This replaces your saved copy, notes, and content choices in this browser with the original version. Export first if you want to keep them.'; $('#confirm-reset').textContent = 'Reset content'; $('#reset-dialog').showModal(); });
$('#cancel-reset').addEventListener('click', () => { pendingImport = null; $('#reset-dialog').close(); });
$('#confirm-reset').addEventListener('click', () => { const importing = !!pendingImport; state = importing ? pendingImport : clone(DEFAULTS); pendingImport = null; studioRoute = state.active; save(); renderStudio(); renderPanel(); $('#reset-dialog').close(); toast(importing ? 'Content plan imported.' : 'Original content restored.'); });
$('#close-brief').addEventListener('click', () => $('#brief-dialog').close());
document.querySelectorAll('dialog').forEach(dialog => { dialog.addEventListener('click', event => { if (event.target !== dialog) return; const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); }); });
const menu = $('.menu-toggle'), nav = $('#main-nav');
menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); });
nav.addEventListener('click', event => { if (event.target.closest('a')) { nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Open navigation'); } });
renderPanel();

// The downloadable GIF and this accessible player use the same 14.4-second intro.
const teamVideo = $('#team-video');
if (teamVideo) {
  const playButton = $('#team-play');
  const chapterNames = { team: 'Introducing the team', leslie: 'Leslie · Director of Chaos', aingel: 'AIngel (ChatGPT) · Queen of Chaos', claude: 'Claude · Sir Stiffness', gemini: 'Gemini · Creative Spark' };
  let activePerson = '';
  const syncTeam = () => {
    const time = teamVideo.currentTime;
    const person = time < 2.4 || time >= 12 ? 'team' : time < 4.8 ? 'leslie' : time < 7.2 ? 'aingel' : time < 9.6 ? 'claude' : 'gemini';
    if (person !== activePerson) {
      activePerson = person;
      document.querySelectorAll('[data-team-person]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.teamPerson === person)));
      $('#team-now').textContent = chapterNames[person];
    }
    playButton.textContent = teamVideo.paused ? 'Play introduction' : 'Pause introduction';
  };
  document.querySelectorAll('[data-team-time]').forEach(button => button.addEventListener('click', () => {
    const target = Number(button.dataset.teamTime) + 0.5;
    // Cancel pending autoplay before applying a user-selected chapter.
    teamVideo.pause();
    const seekAndPlay = () => { teamVideo.currentTime = target; syncTeam(); teamVideo.play().catch(() => syncTeam()); };
    if (teamVideo.readyState < 1) teamVideo.addEventListener('loadedmetadata', seekAndPlay, { once: true });
    else seekAndPlay();
  }));
  document.querySelectorAll('[data-team-time]').forEach(button => { button.disabled = false; });
  playButton.disabled = false;
  playButton.addEventListener('click', () => teamVideo.paused ? teamVideo.play().catch(() => syncTeam()) : teamVideo.pause());
  ['timeupdate','play','pause','seeked','loadedmetadata'].forEach(event => teamVideo.addEventListener(event, syncTeam));
  teamVideo.addEventListener('error', () => { $('#team-now').textContent = 'Use Download GIF to view the animated introduction.'; });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) teamVideo.pause(); });
  if (!reducedMotion.matches) teamVideo.play().catch(() => syncTeam());
  syncTeam();
}
