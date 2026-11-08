import {STORAGE_KEY} from './model.js';

// sessionStorage, unrelated keys and isolated previews must not refresh this workspace.
export const relevantWorkspaceEvent=(event,storage,preview)=>!preview&&event.storageArea===storage&&(event.key===STORAGE_KEY||event.key===null);
export const writeFeedback=(warning,success)=>warning?'Kept for this visit only. Browser storage could not confirm this change.':success;
