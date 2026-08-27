import { create } from 'zustand';

/**
 * Stato del popup in-page (la "scheda" che si apre sopra alla home
 * invece di navigare a una pagina separata). Tenuto in uno store a
 * parte, sullo stesso pattern di useDialogueStore, così Overlay.jsx
 * (dentro al Canvas 3D) e HomeModal.jsx (fuori dal Canvas) possono
 * parlarsi senza passarsi prop attraverso tutto l'albero dei componenti.
 */
export const useModalStore = create((set) => ({
  page: null, // null | 'work' | 'what-i-do' | 'about'
  workId: null,

  openPage: (page) => set({ page, workId: null }),
  openWork: (id) => set({ workId: id }),
  closeWork: () => set({ workId: null }),
  close: () => set({ page: null, workId: null }),
}));

// Le scelte del dialogo usano ancora url del tipo "#/work" (utili anche
// fuori da questo progetto, vedi DialogueEngine.js): questa mappa
// riconosce quali di questi url interni devono aprire il popup invece
// di navigare via browser.
export const HASH_TO_MODAL_PAGE = {
  '#/work': 'work',
  '#/what-i-do': 'what-i-do',
  '#/about': 'about',
};
