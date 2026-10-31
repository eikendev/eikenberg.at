import { MODES, apply, current, onSystemChange, read, store } from "./mode.js";

// Applies the mode and syncs the toggle's icon and label with it.
function render(mode) {
	apply(mode);
	document.querySelectorAll("[data-icon-for]").forEach((el) => {
		el.hidden = el.dataset.iconFor !== mode;
	});
	document.querySelectorAll("[data-theme-label]").forEach((el) => {
		el.textContent = mode === "system" ? "auto" : mode;
	});
}

render(read());
onSystemChange(() => render(current()));

document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
	btn.addEventListener("click", () => {
		const next = MODES[(MODES.indexOf(current()) + 1) % MODES.length];
		store(next);
		render(next);
	});
});

// --bias: horizontal cursor position, 0 (work) .. 1 (play).
// --act: 0 while nobody is hovering, 1 inside.
// Skipped under reduced motion; the CSS defaults leave the page neutral.
const page = document.querySelector("[data-split]");
if (page && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
	let raf = null;
	let bias = 0.5;
	let act = 0;
	let tBias = 0.5;
	let tAct = 0;

	const tick = () => {
		bias += (tBias - bias) * 0.14;
		act += (tAct - act) * 0.09;
		page.style.setProperty("--bias", bias.toFixed(4));
		page.style.setProperty("--act", act.toFixed(4));
		raf =
			Math.abs(tBias - bias) > 0.0015 || Math.abs(tAct - act) > 0.0015
				? requestAnimationFrame(tick)
				: null;
	};
	const go = () => {
		if (!raf) raf = requestAnimationFrame(tick);
	};

	page.addEventListener("pointermove", (e) => {
		if (e.pointerType === "touch") return;
		const r = page.getBoundingClientRect();
		tBias = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
		tAct = 1;
		go();
	});
	page.addEventListener("pointerleave", () => {
		tAct = 0;
		go();
	});
}
