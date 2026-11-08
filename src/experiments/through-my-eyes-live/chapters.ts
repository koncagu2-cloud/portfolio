import readerTypography from './reader-typography.css?raw';
const root = document.querySelector<HTMLElement>('[data-tme]');
if (root) {
 const abort = new AbortController(), {signal} = abort;
 root.querySelectorAll<HTMLElement>('[data-artifact-viewer]').forEach(viewer => {
  const buttons = [...viewer.querySelectorAll<HTMLButtonElement>('[data-artifact]')];let stateAnimation:Animation|undefined;signal.addEventListener('abort',()=>stateAnimation?.cancel(),{once:true});const motionWatch=new MutationObserver(()=>{if(root.dataset.motion==='reduced'||root.querySelector('[data-pause]')?.getAttribute('aria-pressed')==='true')stateAnimation?.cancel();});motionWatch.observe(root,{attributes:true,attributeFilter:['data-motion']});motionWatch.observe(root.querySelector('[data-pause]')!,{attributes:true,attributeFilter:['aria-pressed']});root.addEventListener('tme:navigate',()=>stateAnimation?.cancel(),{signal});signal.addEventListener('abort',()=>motionWatch.disconnect(),{once:true});
  buttons.forEach(button => button.addEventListener('click', () => {
   for (const other of buttons) {
    const selected = other === button;
    other.setAttribute('aria-pressed', String(selected));
    document.getElementById(other.dataset.artifact!)!.hidden = !selected;
   }
   stateAnimation?.cancel();const shown=document.getElementById(button.dataset.artifact!);if(shown&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&root.dataset.motion!=='reduced'&&root.querySelector('[data-pause]')?.getAttribute('aria-pressed')!=='true')stateAnimation=shown.animate([{transform:'translateY(12px)'},{transform:'translateY(0)'}],{duration:220,easing:'cubic-bezier(.2,.7,.2,1)'});
   viewer.querySelector<HTMLElement>('[data-artifact-status]')!.textContent = `Showing ${button.textContent?.trim()}. Capture of the project concept.`;
  }, {signal}));
 });
 const motionAllowed = () => !matchMedia('(prefers-reduced-motion: reduce)').matches && root.dataset.motion !== 'reduced' && root.querySelector('[data-pause]')?.getAttribute('aria-pressed') !== 'true';
 let entrance: Animation | undefined, previewAnimation: Animation | undefined, outgoingAnimation:Animation|undefined, departing:HTMLElement|undefined;
 const clearPreview=()=>{previewAnimation?.cancel();outgoingAnimation?.cancel();departing?.remove();departing=undefined;};
 signal.addEventListener('abort',clearPreview,{once:true});const syncMotion=()=>{if(!motionAllowed()){clearPreview();entrance?.cancel();}};const previewMotion=new MutationObserver(syncMotion);previewMotion.observe(root,{attributes:true,attributeFilter:['data-motion']});previewMotion.observe(root.querySelector('[data-pause]')!,{attributes:true,attributeFilter:['aria-pressed']});signal.addEventListener('abort',()=>previewMotion.disconnect(),{once:true});
 const reveal = (el: HTMLElement | null) => {
  entrance?.cancel();
  if (el && motionAllowed()) entrance = el.animate([{transform:'translateY(16px)'},{transform:'translateY(0)'}], {duration: 220, easing: 'cubic-bezier(.2,.7,.2,1)'});
 };
 const selectPreview = (id: string) => {
  const figures = [...root.querySelectorAll<HTMLElement>('[data-selection-visual]')];
  // Selection itself is not a project. Never clear the stage for an unknown target.
  if (!figures.some(f => f.dataset.selectionVisual === id)) return;
  root.dispatchEvent(new CustomEvent('tme:perspective',{detail:id}));
  if (figures.some(f => f.dataset.selectionVisual === id && !f.hidden)) return;
  clearPreview();
  const current=figures.find(f=>!f.hidden),stage=root.querySelector<HTMLElement>('.tme-selection-stage');
  if(current&&stage&&motionAllowed()){
   departing=current.cloneNode(true) as HTMLElement;departing.classList.add('tme-preview-departing');departing.setAttribute('aria-hidden','true');departing.inert=true;departing.removeAttribute('id');departing.dataset.departingVisual=current.dataset.selectionVisual;departing.removeAttribute('data-selection-visual');departing.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));stage.append(departing);
   root.dataset.previewState='switching';outgoingAnimation=departing.animate([{transform:'translateY(0)',opacity:1},{transform:'translateY(-22px)',opacity:0}],{duration:220,easing:'cubic-bezier(.2,.7,.2,1)'});
   const old=departing;void outgoingAnimation.finished.catch(()=>{}).then(()=>{old.remove();if(departing===old){departing=undefined;root.dataset.previewState='idle';}});
  }
  for (const figure of figures) {
   figure.hidden = figure.dataset.selectionVisual !== id;
   if (!figure.hidden && motionAllowed()) previewAnimation = figure.animate([{transform:'translateY(22px)'},{transform:'translateY(0)'}],{duration:220,easing:'cubic-bezier(.2,.7,.2,1)'});
  }
  root.querySelectorAll<HTMLElement>('[data-project-preview]').forEach(row => row.dataset.previewActive = String(row.dataset.projectPreview === id));
  root.querySelectorAll<HTMLButtonElement>('[data-project-select]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.projectSelect === id)));
  const chosen = root.querySelector<HTMLElement>(`[data-selection-visual="${id}"]`);
  const status = root.querySelector<HTMLElement>('[data-project-status]');
  if (status && chosen) status.textContent = `Viewing ${chosen.querySelector('h3')?.textContent?.replace('↗','').trim()}.`; 
 };
 root.querySelectorAll<HTMLButtonElement>('[data-project-select]').forEach(button => {
  button.hidden = false; button.addEventListener('click', () => selectPreview(button.dataset.projectSelect!), {signal});
 });
 root.querySelectorAll<HTMLElement>('.tme-index-fallback').forEach(link => link.hidden = true);
 root.querySelectorAll<HTMLElement>('[data-project-preview]').forEach(row => {
  row.addEventListener('pointermove', e => {if (e.pointerType === 'mouse') selectPreview(row.dataset.projectPreview!);}, {signal});
  row.addEventListener('focusin', () => selectPreview(row.dataset.projectPreview!), {signal});
 });
 const focusAnchor = (hash: string) => {
  if(root.dataset.cinematic==='true'){root.dispatchEvent(new CustomEvent('tme:scene-request',{detail:hash.slice(1)}));return;}
  const target = document.getElementById(hash.slice(1)); if (!target) return;clearPreview();
  root.dispatchEvent(new CustomEvent('tme:navigate'));
  target.scrollIntoView({behavior: 'instant', block: 'start'}); target.focus({preventScroll: true});
  history.replaceState(null, '', hash);
  reveal(target.querySelector<HTMLElement>(':scope>header,:scope>.tme-world-intro'));
  selectPreview(hash.slice(1));
 };
 root.querySelectorAll<HTMLAnchorElement>('[data-selection],[data-chapter-link]').forEach(link => link.addEventListener('click', e => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault(); focusAnchor(link.hash);
 }, {signal}));
 const dialog = root.querySelector<HTMLDialogElement>('[data-project-reader]')!;
 const frameContainer = dialog.querySelector<HTMLElement>('[data-reader-frame]')!;
 const loading = dialog.querySelector<HTMLElement>('[data-reader-loading]')!;
 const standalone = dialog.querySelector<HTMLAnchorElement>('[data-reader-standalone]')!;
 let trigger: HTMLAnchorElement | null = null, previousOverflow = '', request: AbortController | undefined;
 const title = dialog.querySelector<HTMLElement>('#tme-reader-title')!;
 const load = async (url: URL, label: string, type: string) => {
  request?.abort(); request = new AbortController(); const current = request;
  const timeout = window.setTimeout(() => {
   if (current.signal.aborted) return;
   frameContainer.replaceChildren(); frameContainer.setAttribute('aria-busy', 'false'); dialog.dataset.state = 'error';
   loading.textContent = 'The project did not respond in time. Close the reader or use the standalone link to retry.'; current.abort();
  }, 12000);
  current.signal.addEventListener('abort', () => clearTimeout(timeout), {once: true});
  title.textContent = label; standalone.href = url.href;
  frameContainer.replaceChildren(); frameContainer.setAttribute('aria-busy', 'true');
  loading.textContent = 'Checking the project…'; dialog.dataset.state = 'loading';
  try {
   const response = await fetch(url.href, {signal: current.signal});
   if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) throw new Error('Unavailable project');
   const html = await response.text();
   if (current.signal.aborted) return;
   const parsed = new DOMParser().parseFromString(html, 'text/html');
   if (!parsed.querySelector('main') || /404\s*[/—]|page not found/i.test(parsed.title)) throw new Error('Missing project content');
   const frame = document.createElement('iframe'); frame.title = label;
   const onReady = () => {
    if (current.signal.aborted || !dialog.open) return;
    try {
     const doc = frame.contentDocument;
     if (!doc?.querySelector('main') || /page not found/i.test(doc.title)) throw new Error('Failed project document');
     if (type === 'case') {
      // Keep the real same-origin document URL: original walkthroughs use history/hash APIs.
      // Present its semantic article alone, retaining its scripts, styles and theme control.
      const main = doc.querySelector('main')!;
      // Reader-only typography: preserve the approved standalone case-study sources.
      const readingStyle=doc.createElement('style');readingStyle.dataset.tmeReading='true';
      readingStyle.textContent=readerTypography;
      doc.head.append(readingStyle);
      const theme = doc.querySelector('[data-theme-toggle]');
      const wrapper = doc.createElement('div'); wrapper.id = 'top';
      main.querySelectorAll('a.case-back').forEach(link => link.remove());
      if (theme) main.prepend(theme);
      wrapper.append(main); doc.body.replaceChildren(wrapper);
      doc.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(link => {
       const next = new URL(link.href);
       if (next.origin !== url.origin) {link.target = '_blank'; link.rel = 'noopener noreferrer'; if (!link.getAttribute('aria-label')) link.setAttribute('aria-label', `${link.textContent?.trim()} (opens in a new tab)`);}
      });
      doc.addEventListener('click', e => {
       const link = (e.target as Element).closest<HTMLAnchorElement>('a[href]');
       if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || link.target === '_blank' || link.hasAttribute('download')) return;
       const next = new URL(link.href);
       if (next.origin === url.origin && next.pathname !== url.pathname && /^\/work\//.test(next.pathname)) {
        e.preventDefault(); void load(next, link.textContent?.trim() || 'Case study', 'case');
       } else if (next.origin === url.origin && /^\/prototypes\/(apple-ring|align)\//.test(next.pathname)) {
        e.preventDefault();
        if (next.pathname === '/prototypes/apple-ring/') next.pathname += 'index.html';
        if (next.pathname === '/prototypes/align/') {next.pathname += 'demo/index.html'; next.searchParams.set('preview', '1');}
        void load(next, 'Interactive prototype', 'prototype');
       }
      }, {signal: current.signal});
     }
     doc.addEventListener('keydown', e => {if (e.key === 'Escape') {e.preventDefault(); dialog.close();}}, {signal: current.signal});
     clearTimeout(timeout); frame.style.visibility = 'visible';
     frameContainer.setAttribute('aria-busy', 'false'); dialog.dataset.state = 'ready';
     loading.textContent = type === 'case' ? 'Case study ready.' : 'Prototype document ready. Conceptual behavior is labeled inside.';
     if (url.hash) doc.getElementById(url.hash.slice(1))?.scrollIntoView({behavior: 'instant'});
    } catch {fail();}
   };
   const fail = () => {
    if (current.signal.aborted) return;
    clearTimeout(timeout); frameContainer.replaceChildren(); frameContainer.setAttribute('aria-busy', 'false'); dialog.dataset.state = 'error';
    loading.textContent = 'This project could not be opened. Close the reader to return, or try the standalone link.';
   };
   frame.addEventListener('load', onReady, {once: true}); frame.addEventListener('error', fail, {once: true});
   frame.style.visibility = 'hidden';
   frame.src = url.href;
   frameContainer.replaceChildren(frame);
  } catch (error) {
   if (current.signal.aborted) return;
   clearTimeout(timeout); frameContainer.setAttribute('aria-busy', 'false'); dialog.dataset.state = 'error';
   loading.textContent = 'This project is unavailable. Close the reader to return, or try the standalone link.';
  }
 };
 if (typeof dialog.showModal === 'function') root.querySelectorAll<HTMLAnchorElement>('[data-reader]').forEach(link => link.addEventListener('click', e => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const url = new URL(link.href); if (url.origin !== location.origin) return;
  e.preventDefault(); trigger = link; previousOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = 'hidden'; dialog.showModal();
  root.dispatchEvent(new CustomEvent('tme:reader', {detail: true})); reveal(dialog);
  void load(url, link.dataset.title || 'Project', link.dataset.reader || 'case');
 }, {signal}));
 dialog.querySelector('[data-reader-close]')!.addEventListener('click', () => dialog.close(), {signal});
 dialog.addEventListener('close', () => {
  request?.abort(); frameContainer.replaceChildren(); document.documentElement.style.overflow = previousOverflow;
  root.dispatchEvent(new CustomEvent('tme:reader', {detail: Boolean(root.querySelector('dialog[open]'))})); (trigger?.closest<HTMLElement>('#hero-projects')?.hidden?root.querySelector<HTMLElement>('[data-scanner-toggle]'):trigger)?.focus({preventScroll: true});
 }, {signal});
 dialog.addEventListener('click', e => {
  if (e.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) dialog.close();
 }, {signal});
 const cleanup = () => {request?.abort(); entrance?.cancel(); previewAnimation?.cancel(); if (dialog.open) dialog.close(); abort.abort();};
 window.addEventListener('pagehide', e => {if (!e.persisted) cleanup();}, {signal}); import.meta.hot?.dispose(cleanup);
}
