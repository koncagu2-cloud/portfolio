// Portfolio presentation support; the exported concept's behavior and sample data stay intact.
// Reveal results only when their heading would be outside the usable viewport.
function revealResult(heading, { dialog = false } = {}) {
  if (!heading) return;
  const bounds = heading.getBoundingClientRect();
  const sticky = document.querySelector('.local');
  const top = dialog ? 12 : Math.max(12, sticky?.getBoundingClientRect().bottom ?? 0) + 12;
  if (bounds.top >= top && bounds.bottom <= innerHeight - 12) return;
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  heading.scrollIntoView({ block: 'center', behavior: 'instant' });
}

document.querySelectorAll('.feature-select [data-view]').forEach(button => {
  button.addEventListener('click', () => {
    revealResult(document.querySelector(`#phone-${button.dataset.view} h3`));
  });
});

document.querySelectorAll('[data-day-stage]').forEach(button => {
  button.addEventListener('click', () => {
    revealResult(document.querySelector('#day-phone-title'), { dialog: true });
  });
});

// The outage controls sit above the result on narrow screens. Expose their
// effect without moving focus away from a checkbox someone may toggle again.
for (const id of ['handoff-missing', 'handoff-disconnected']) {
  const control = document.getElementById(id);
  control?.setAttribute('aria-controls', 'handoff-value handoff-sync');
  control?.setAttribute('aria-describedby', 'handoff-value');
}

// Show the result beside the scenario controls as well as inside the device.
const handoffValue = document.getElementById('handoff-value');
const options = document.querySelector('.handoff-options');
if (handoffValue && options) {
  const result = document.createElement('p');
  result.className = 'handoff-sample-result';
  options.after(result);
  const sync = () => { result.textContent = 'Sample result · ' + handoffValue.textContent; };
  new MutationObserver(sync).observe(handoffValue, { childList: true, characterData: true, subtree: true });
  sync();
}
