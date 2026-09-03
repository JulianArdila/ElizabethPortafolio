(function () {
	'use strict';

	var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
	var isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;

	initReveal();
	initHeaderAndNav();

	if (!reduceMotion && !isTouch) {
		initParallax();
	}

	if (!reduceMotion) {
		initScrollProgress();
	}

	if (!isTouch) {
		initLoupe();
	}

	/* Fade/blur [data-reveal] elements in as they enter the viewport and back
	   out again as they leave it, in either scroll direction. */
	function initReveal() {
		var elements = document.querySelectorAll('[data-reveal]');

		if (reduceMotion || !('IntersectionObserver' in window)) {
			elements.forEach(function (el) {
				el.classList.add('is-visible');
			});
			return;
		}

		var observer = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					entry.target.classList.toggle('is-visible', entry.isIntersecting);
				});
			},
			{ threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
		);

		elements.forEach(function (el) {
			observer.observe(el);
		});
	}

	/* Hamburger toggle, close-on-link-click, solid header + active nav link on scroll. */
	function initHeaderAndNav() {
		var header = document.getElementById('site-header');
		var toggle = document.getElementById('nav-toggle');
		var nav = document.getElementById('site-nav');

		toggle.addEventListener('click', function () {
			var isOpen = nav.classList.toggle('is-open');
			toggle.setAttribute('aria-expanded', String(isOpen));
		});

		nav.querySelectorAll('a').forEach(function (link) {
			link.addEventListener('click', function () {
				nav.classList.remove('is-open');
				toggle.setAttribute('aria-expanded', 'false');
			});
		});

		if (!('IntersectionObserver' in window)) {
			return;
		}

		var navLinks = nav.querySelectorAll('a');
		var sections = document.querySelectorAll('main > section, main > article');
		var hero = document.getElementById('hero');

		var sectionObserver = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (!entry.isIntersecting) {
						return;
					}
					var id = entry.target.getAttribute('id');
					navLinks.forEach(function (link) {
						link.classList.toggle('active', link.getAttribute('href') === '#' + id);
					});
				});
			},
			{ rootMargin: '-45% 0px -45% 0px' }
		);

		sections.forEach(function (section) {
			sectionObserver.observe(section);
		});

		var heroObserver = new IntersectionObserver(
			function (entries) {
				header.classList.toggle('scrolled', !entries[0].isIntersecting);
			},
			{ threshold: 0 }
		);

		heroObserver.observe(hero);
	}

	/* Scroll-linked parallax via rAF, strict read-then-write to avoid layout thrash. */
	function initParallax() {
		var elements = Array.prototype.map.call(
			document.querySelectorAll('[data-parallax]'),
			function (el) {
				return {
					el: el,
					speed: parseFloat(el.getAttribute('data-parallax-speed')) || 0.2
				};
			}
		);

		var ticking = false;

		function update() {
			elements.forEach(function (item) {
				var rect = item.el.getBoundingClientRect();
				var offset = rect.top * item.speed;
				item.el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
			});
			ticking = false;
		}

		window.addEventListener(
			'scroll',
			function () {
				if (!ticking) {
					window.requestAnimationFrame(update);
					ticking = true;
				}
			},
			{ passive: true }
		);

		update();
	}

	/* Top progress bar reflecting scroll position through the document. */
	function initScrollProgress() {
		var bar = document.getElementById('scroll-progress');
		var ticking = false;

		function update() {
			var scrollable = document.documentElement.scrollHeight - window.innerHeight;
			var progress = scrollable > 0 ? window.scrollY / scrollable : 0;
			bar.style.transform = 'scaleX(' + progress.toFixed(4) + ')';
			ticking = false;
		}

		window.addEventListener(
			'scroll',
			function () {
				if (!ticking) {
					window.requestAnimationFrame(update);
					ticking = true;
				}
			},
			{ passive: true }
		);

		update();
	}

	/* Circular sharp-focus "loupe" that follows the pointer over [data-loupe]
	   containers (see css/style.css section 5) — rAF-batched like the rest.
	   Listens for both Pointer Events and legacy mouse events, since this is
	   the one interaction that's useless if it silently fails to bind.

	   The mask-image is written directly (a full string, every frame) rather
	   than through --loupe-x/--loupe-y custom properties feeding a static
	   mask-image rule — some browsers don't reliably repaint a mask-image
	   when only an *untyped* custom property inside it changes, which made
	   the circle appear frozen instead of tracking the pointer in real use.
	   Only --loupe-r (the idle/active radius) stays a custom property, since
	   it's registered via @property specifically so it can transition. */
	function initLoupe() {
		var containers = document.querySelectorAll('[data-loupe]');

		containers.forEach(function (container) {
			var sharp = container.querySelector('.loupe-sharp');
			var pending = null;
			var ticking = false;

			function apply() {
				if (pending) {
					var mask = 'radial-gradient(circle var(--loupe-r) at ' +
						pending.x + 'px ' + pending.y + 'px, black 70%, transparent 100%)';
					sharp.style.maskImage = mask;
					sharp.style.webkitMaskImage = mask;
				}
				ticking = false;
			}

			function onMove(event) {
				var rect = container.getBoundingClientRect();
				pending = { x: event.clientX - rect.left, y: event.clientY - rect.top };
				if (!ticking) {
					window.requestAnimationFrame(apply);
					ticking = true;
				}
			}

			function onEnter() {
				container.classList.remove('is-idle');
			}

			function onLeave() {
				container.classList.add('is-idle');
			}

			container.addEventListener('pointermove', onMove);
			container.addEventListener('pointerenter', onEnter);
			container.addEventListener('pointerleave', onLeave);

			container.addEventListener('mousemove', onMove);
			container.addEventListener('mouseenter', onEnter);
			container.addEventListener('mouseleave', onLeave);
		});
	}
})();
