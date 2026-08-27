import { create } from 'zustand';

export const DIALOGUE_NODES = {
  greeting: {
    id: 'greeting',
    speaker: 'EMI',
    title: "Hi, I'm Duculet Emilia Cristina.",
    line: "I'm Emi — your 3D Artist & Multidisciplinary Designer.",
    meta: { crtMood: 'idle' },
    choices: [
      { label: 'Nice to meet you', next: 'inquiry' },
      { label: 'What can I do for you?', next: 'services' },
    ],
  },

  services: {
    id: 'services',
    speaker: 'EMI',
    title: 'Services',
    line: 'There are several services I can offer, ranging from 3D modeling to the creation of highly immersive interactive experiences. Which type of service do you need?',
    meta: { crtMood: 'listening' },
    choices: [
      { label: '3D Modeling', next: 'svc3d' },
      { label: 'Graphic Design', next: 'svcDesign' },
      { label: 'Web Design', next: 'svcWeb' },
      { label: 'Interactive Experiences', next: 'svcInteractive' },
      { label: 'Freelance Project', next: 'contact' },
    ],
  },

  // Un passaggio in più prima di Contact per ognuno dei 4 servizi
  // "esplorativi": una micro-risposta di Emi che dà un po' di contesto,
  // poi la scelta tra vedere il lavoro relativo o passare al contatto.
  svc3d: {
    id: 'svc3d',
    speaker: 'EMI',
    title: '3D Modeling',
    line: 'Characters, environments, hard-surface assets and production-ready models. Want to see some examples?',
    meta: { crtMood: 'listening' },
    choices: [
      { label: 'View 3D Work', next: 'svc3d', url: '#/work' },
      { label: "Let's talk", next: 'contact' },
    ],
  },
  svcDesign: {
    id: 'svcDesign',
    speaker: 'EMI',
    title: 'Graphic Design',
    line: 'Branding, visual identity and communication design, built to give a project a clear and consistent voice. Want a closer look?',
    meta: { crtMood: 'listening' },
    choices: [
      { label: 'View My Work', next: 'svcDesign', url: '#/work' },
      { label: "Let's talk", next: 'contact' },
    ],
  },
  svcWeb: {
    id: 'svcWeb',
    speaker: 'EMI',
    title: 'Web Design',
    line: 'Interactive websites where design, motion and real-time 3D come together. This portfolio itself is a good example — want to see more?',
    meta: { crtMood: 'listening' },
    choices: [
      { label: 'View My Work', next: 'svcWeb', url: '#/work' },
      { label: "Let's talk", next: 'contact' },
    ],
  },
  svcInteractive: {
    id: 'svcInteractive',
    speaker: 'EMI',
    title: 'Interactive Experiences',
    line: 'Real-time 3D, physics-driven interactions and playful interfaces — like the one you are using right now. Curious about my process?',
    meta: { crtMood: 'listening' },
    choices: [
      { label: 'What I Do', next: 'svcInteractive', url: '#/what-i-do' },
      { label: "Let's talk", next: 'contact' },
    ],
  },

  inquiry: {
    id: 'inquiry',
    speaker: 'EMI',
    title: 'How can I help',
    line: 'You have questions. I have… well, mostly answers. Let’s go!',
    meta: { crtMood: 'listening' },
    choices: [
      { label: 'Start a project', next: 'contact' },
      { label: 'View My Works', next: 'inquiry', url: '#/work' },
      { label: 'What I Do', next: 'inquiry', url: '#/what-i-do' },
      { label: 'About Me', next: 'inquiry', url: '#/about' },
      { label: 'Download CV', next: 'inquiry', url: '/cv-emilia.pdf' },
    ],
  },

  contact: {
    id: 'contact',
    speaker: 'EMI',
    title: "Let's talk",
    line: "Perfect. Drop me a message and I'll get back to you within 24 hours.",
    meta: {
      crtMood: 'redirect',
      showSocials: true,
    },
    choices: [
      { label: 'Email me: duculetemilia@gmail.com', url: 'mailto:duculetemilia@gmail.com' },
      { label: 'Start over', next: 'greeting' },
    ],
  },
};

const START_NODE = 'greeting';

export const useDialogueStore = create((set, get) => ({
  // -- state ------------------------------------------------------
  currentId: START_NODE,
  history: [],
  isTyping: false,
  showCursor: false,
  hasStarted: false,
  lastChoiceTime: 0,

  // -- derived ------------------------------------------------------
  currentNode: () => DIALOGUE_NODES[get().currentId],

  // -- actions ------------------------------------------------------
  start: () => set({ hasStarted: true }),

  setTyping: (value) => set({ isTyping: value, showCursor: value ? false : get().showCursor }),

  finishTyping: () => set({ isTyping: false, showCursor: true }),

  choose: (choiceInput) => {
    const { currentId, history, currentNode } = get();
    let nextId, url;

    if (typeof choiceInput === 'string') {
      nextId = choiceInput;
      const node = currentNode();
      const found = node?.choices.find((c) => c.next === nextId);
      url = found?.url;
    } else {
      nextId = choiceInput.next;
      url = choiceInput.url;
    }

    if (!DIALOGUE_NODES[nextId]) return;

    if (url) {
      window.open(url, '_blank');
    }

    set({
      history: [...history, currentId],
      currentId: nextId,
      isTyping: true,
      showCursor: false,
      lastChoiceTime: Date.now(),
    });
  },

  goBack: () => {
    const { history } = get();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    set({
      currentId: prev,
      history: history.slice(0, -1),
      isTyping: true,
      showCursor: false,
    });
  },

  reset: () => set({
    currentId: START_NODE,
    history: [],
    isTyping: true,
    showCursor: false,
    hasStarted: true,
  }),
}));
