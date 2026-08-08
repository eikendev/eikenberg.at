const MODES = ["system", "dark", "light"];
const KEY = "eikenberg-mode";
const mq = window.matchMedia("(prefers-color-scheme: dark)");

function read() {
	try {
		return localStorage.getItem(KEY) || "system";
	} catch (e) {
		return "system";
	}
}

function apply(mode) {
	const dark = mode === "system" ? mq.matches : mode === "dark";
	document.documentElement.classList.toggle("light", !dark);
	document.documentElement.dataset.mode = mode;
	document.querySelectorAll("[data-icon-for]").forEach((el) => {
		el.hidden = el.dataset.iconFor !== mode;
	});
	document.querySelectorAll("[data-theme-label]").forEach((el) => {
		el.textContent = mode === "system" ? "auto" : mode;
	});
}

apply(read());
mq.addEventListener("change", () =>
	apply(document.documentElement.dataset.mode || "system"),
);

document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
	btn.addEventListener("click", () => {
		const cur = document.documentElement.dataset.mode || "system";
		const next = MODES[(MODES.indexOf(cur) + 1) % MODES.length];
		try {
			localStorage.setItem(KEY, next);
		} catch (e) {}
		apply(next);
	});
});

// --bias: horizontal cursor position, 0 (work) .. 1 (play).
// --act: 0 while nobody is hovering, 1 inside.
const page = document.querySelector("[data-split]");
if (page) {
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
