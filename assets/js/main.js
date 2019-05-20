(function () {
	'use strict';

	var siteNav = Array.prototype.slice.call(document.querySelectorAll('.site-step-nav'));

	siteNav.forEach(function (a, i) {
		a.addEventListener('click', function (e) {
			e.preventDefault();
		});
	});
}.call(window));