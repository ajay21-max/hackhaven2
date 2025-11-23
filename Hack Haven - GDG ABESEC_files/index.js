// CleverMellow Accordion

function accordionToggle() {
	if (document.querySelectorAll("[cm-accordion]").length === 0) {
		return;
	}

	// check if GSAP is loaded
	if (typeof gsap === "undefined") {
		console.warn(
			"GSAP is not loaded. Please include GSAP before loading any CM attributes"
		);
		return;
	}

	let activeClass =
		this.parentElement.getAttribute("cm-accordion-activeclass") || "active";
	let scrollToActive =
		this.getAttribute("cm-accordion-scrolltoactive") || false;
	let toggleSpeed =
		this.parentElement.getAttribute("cm-accordion-speed") || 0.5;
	let toggleEase =
		this.parentElement.getAttribute("cm-accordion-ease") || "power2.out";
	let toggleDelay = this.parentElement.getAttribute("cm-accordion-delay") || 0;
	let scrollOffset =
		this.parentElement.getAttribute("cm-accordion-scrolloffset") || -100;
	let activeHeight =
		this.parentElement.getAttribute("cm-accordion-activeheight") || "auto";
	let fadeOnOpen =
		this.parentElement.getAttribute("cm-accordion-fadeonopen") || false;
	let inactiveOpacity = 1;
	if (fadeOnOpen) {
		inactiveOpacity = 0;
	}
	let closeSiblings =
		this.parentElement.getAttribute("cm-accordion-closesiblings") || true;

	if (closeSiblings) {
		Array.from(this.parentElement.parentElement.children).forEach((sibling) => {
			if (sibling !== this) {
				sibling.classList.remove(activeClass);
			}
		});
	}
	this.parentElement.classList.toggle(activeClass);

	const accordions = document.querySelectorAll("[cm-accordion]");
	accordions.forEach((acc) => {
		if (!acc.classList.contains(activeClass)) {
			let lastDiv = null;
			for (let i = 0; i < acc.childNodes.length; i++) {
				if (acc.childNodes[i].nodeName === "DIV") {
					lastDiv = acc.childNodes[i];
				}
			}
			if (lastDiv && lastDiv === acc.lastElementChild) {
				gsap.to(lastDiv, {
					duration: toggleSpeed,
					height: 0,
					ease: toggleEase,
					delay: toggleDelay
				});
			}
		}
	});

	gsap.to(`[cm-accordion].${activeClass} > div:last-child`, {
		duration: toggleSpeed,
		height: activeHeight,
		opacity: inactiveOpacity,
		ease: toggleEase,
		delay: toggleDelay
	});

	setTimeout(() => {
		if (scrollToActive) {
			// scroll to top of accordion if it's not in view
			if (!this.classList.contains(activeClass)) return;
			const accordionTop =
				this.getBoundingClientRect().top + window.pageYOffset;
			const accordionBottom = accordionTop + this.offsetHeight;
			const windowTop = window.pageYOffset;
			const windowBottom = windowTop + window.innerHeight;
			if (accordionTop < windowTop || accordionBottom > windowBottom) {
				// use scroll.scrollTo
				window.scrollTo({
					top: accordionTop + scrollOffset,
					behavior: "smooth"
				});
			}
		}
		if (typeof ScrollTrigger !== "undefined") {
			setTimeout(() => {
				ScrollTrigger.refresh();
			}, toggleSpeed * 250);
		}
	}, toggleSpeed * 250);
}

function initAccordions() {
	gsap.set(`[cm-accordion] > div:last-child`, {
		height: 0
	});
	gsap.set(`[cm-accordion-startopen]:first-child > div:last-child`, {
		height: "auto"
	});
	const accordions = document.querySelectorAll(
		"[cm-accordion] > div:first-child"
	);
	accordions.forEach((accordion) => {
		accordion.addEventListener("click", accordionToggle);
	});

	if (document.querySelector("[cm-accordion-startopen]")) {
		document
			.querySelector("[cm-accordion-startopen]:first-child > div:first-child")
			.click();
	}
}

window.addEventListener("load", () => {
	initAccordions();
});

// p5 grid ------------------------------------------------------------

//defaults
const dotSpacing = 22;
const dotSize = 2;
const hoverSize = 4;
const falloff = 250;

class Grid {
	constructor(element) {
		this.element = element;
		this.canvas = null;
		this.dotColor = null;
		this.backgroundColor = null;
		this.dotSpacing =
			Number(element.getAttribute("p5-grid-dot-spacing")) || dotSpacing;
		this.dotSize = parseFloat(
			element.getAttribute("p5-grid-dot-size") || dotSize
		);
		this.hoverSize = parseFloat(
			element.getAttribute("p5-grid-hover-size") || hoverSize
		);
		this.falloff = parseFloat(
			element.getAttribute("p5-grid-falloff") || falloff
		);
		this.isPaused = true;
	}

	setup() {
		const sketch = (p) => {
			p.setup = () => {
				const rect = this.element.getBoundingClientRect();
				const canvas = p.createCanvas(rect.width, rect.height);
				canvas.parent(this.element);
				this.canvas = canvas.canvas;
				this.dotColor = p.color(
					this.element.getAttribute("p5-grid-color") || "blue"
				);
				this.backgroundColor = p.color(0, 0, 0, 0); // Transparent background
				p.noStroke();
				p.frameRate(30);
			};

			p.draw = () => {
				const rect = this.canvas.getBoundingClientRect();
				p.resizeCanvas(rect.width, rect.height);
				p.background(this.backgroundColor);

				if (!this.isPaused) {
					this.drawDots(p);
				}
			};

			p.windowResized = () => {
				const rect = this.canvas.parentNode.getBoundingClientRect();
				p.resizeCanvas(rect.width, rect.height, true);
			};
		};

		new p5(sketch);
	}

	drawDots(p) {
		for (let y = this.dotSpacing / 2; y < p.height; y += this.dotSpacing) {
			for (let x = this.dotSpacing / 2; x < p.width; x += this.dotSpacing) {
				const distance = p.dist(x, y, p.mouseX, p.mouseY);
				const scale = p.map(
					distance,
					0,
					this.falloff,
					this.hoverSize,
					this.dotSize,
					true
				);
				p.fill(this.dotColor); // Apply the dot color
				p.square(x - scale / 2, y - scale / 2, scale);
			}
		}
	}
}

function setupGrids() {
	const gridElements = document.querySelectorAll("[p5-grid]");
	const observerOptions = {
		root: null,
		rootMargin: "0px",
		threshold: 0.01 // Updated threshold to 1%
	};

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			const grid = entry.target.p5_instance;
			if (grid) {
				grid.isPaused = !entry.isIntersecting;
			}
		});
	}, observerOptions);

	gridElements.forEach((element) => {
		const grid = new Grid(element);
		element.p5_instance = grid;
		grid.setup();
		observer.observe(element);
	});

	window.addEventListener("scroll", () => {
		gridElements.forEach((element) => {
			observer.unobserve(element);
		});
		gridElements.forEach((element) => {
			observer.observe(element);
		});
	});
}

if (window.innerWidth > 768) {
	setupGrids();
}

// buttons ------------------------------------------

$("#newsletter-fakesubmit").click(function () {
	$("#newsletter-submit").click();
});

// loconative ---------------------------------------

var $pageWrapper = $(".page-wrapper").get(0);
let scroll;
function initSmoothScroll(container) {
	// check if webflow editor exists
	if ($(".w-editor").length === 0) {
		// https://github.com/quentinhocde/loconative-scroll
		scroll = new LoconativeScroll({
			el: container,
			scrollToEasing: (t) =>
				t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,
			smooth: true
		});
	}
}

var Webflow = Webflow || [];
Webflow.push(initSmoothScroll($pageWrapper));

// Locomotive ----------------------

// const locoScroll = new LocomotiveScroll({
// 	el: document.querySelector(".main-wrapper"),
// 	smooth: true,
// 	multiplier: 0.6,
// 	tablet: {
// 		smooth: false,
// 		breakpoint: 991
// 	}
// });

// // Wait 0.5 seconds then calculate the new page height
// setTimeout(() => {
// 	locoScroll.update();
// 	imgScroll();
// }, 500);

// // Destroy locomotive scroll in Webflow Editor
// setInterval(function () {
// 	if ($(".w-editor-publish-node").length > 0) {
// 		locoScroll.destroy();
// 	}
// 	locoScroll.update();
// }, 2000);
