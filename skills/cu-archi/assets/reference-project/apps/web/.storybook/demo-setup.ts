/// <reference types="vite/client" />

import { userEvent } from "storybook/test";

type DemoUser = ReturnType<typeof userEvent.setup>;

/** Sous Vitest, la démo est un test : ni délai ni curseur. */
const isTest = import.meta.env.MODE === "test";

/** Délai entre deux gestes : réaliste dans Storybook, nul sous Vitest pour des tests rapides. */
const demoDelay = isTest ? 0 : 700;

const CURSOR_ID = "demo-cursor";
const CURSOR_MOVE_MS = 550;
const CURSOR_SVG = `<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
  <path d="M3 2 L3 18 L7.5 13.8 L10.6 20.5 L13.4 19.2 L10.4 12.6 L16.5 12.6 Z"
    fill="#fff" stroke="#111" stroke-width="1.5" stroke-linejoin="round" />
</svg>`;

/** Utilisateur d'une démo : même parcours à regarder dans Storybook et à rejouer en test UI. */
export function demoUser(): DemoUser {
  const user = userEvent.setup({ delay: demoDelay });

  if (isTest) return user;

  return {
    ...user,
    click: async (element, ...rest) => {
      await pointAt(element);
      return user.click(element, ...rest);
    },
    dblClick: async (element, ...rest) => {
      await pointAt(element);
      return user.dblClick(element, ...rest);
    },
    selectOptions: async (element, ...rest) => {
      await pointAt(element);
      return user.selectOptions(element, ...rest);
    },
    type: async (element, ...rest) => {
      await pointAt(element);
      return user.type(element, ...rest);
    },
  };
}

// Faux curseur de démo : glisse jusqu'à l'élément visé puis marque le clic. Purement visuel.
async function pointAt(element: Element) {
  element.scrollIntoView({ block: "nearest", inline: "nearest" });

  const cursor = showCursor(element.ownerDocument);
  const { left, top, width, height } = element.getBoundingClientRect();

  cursor.style.transform = `translate(${left + width / 2}px, ${top + height / 2}px)`;
  await wait(CURSOR_MOVE_MS);
  pulse(cursor);
}

// Le curseur vit dans la couche supérieure (popover) pour rester au-dessus des dialogues modaux ;
// il y est remis à chaque geste, après tout dialogue ouvert entre-temps.
function showCursor(document: Document): HTMLElement {
  const cursor = document.getElementById(CURSOR_ID) ?? createCursor(document);

  if (cursor.matches(":popover-open")) cursor.hidePopover();
  cursor.showPopover();

  return cursor;
}

function createCursor(document: Document): HTMLElement {
  const cursor = document.createElement("div");

  cursor.id = CURSOR_ID;
  cursor.popover = "manual";
  cursor.innerHTML = CURSOR_SVG;
  Object.assign(cursor.style, {
    position: "fixed",
    inset: "0 auto auto 0",
    margin: "0",
    padding: "0",
    border: "0",
    background: "transparent",
    overflow: "visible",
    pointerEvents: "none",
    transform: `translate(${document.documentElement.clientWidth / 2}px, 40px)`,
    transition: `transform ${CURSOR_MOVE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
  });
  document.body.append(cursor);

  return cursor;
}

// Onde de clic sous la pointe du curseur.
function pulse(cursor: HTMLElement) {
  const ring = cursor.ownerDocument.createElement("span");

  Object.assign(ring.style, {
    position: "absolute",
    left: "-14px",
    top: "-14px",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "rgba(14, 116, 144, 0.35)",
  });
  cursor.prepend(ring);
  ring
    .animate(
      [
        { transform: "scale(0.3)", opacity: 1 },
        { transform: "scale(1.4)", opacity: 0 },
      ],
      { duration: 450, easing: "ease-out" },
    )
    .finished.then(() => ring.remove());
}

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
