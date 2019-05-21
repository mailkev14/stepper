(function () {
	'use strict';

	var siteNav = Array.prototype.slice.call(document.querySelectorAll('.site-step-nav')),
		steps = [
			{
				num: 1,
				container: document.getElementById('step1'),
				vars: {
					name: document.getElementById('name'),
					mobile: document.getElementById('mobile'),
					email: document.getElementById('email'),
					address: document.getElementById('address'),
					age: document.getElementById('age'),
					gender: document.getElementById('gender'),
					allergies: document.getElementById('allergies')
				},
				init: function () {
					var _v, _this = this;

					if ( !app.step1 ) {
						app.step1 = {
							name: '',
							mobile: '',
							email: '',
							address: '',
							age: '',
							gender: '',
							allergies: ''
						};
					}

					for (_v in this.vars) {
						this.vars[_v].value = app.step1[_v];

						addListener(this.vars[_v], this.num, _v);
					}

					this.vars.mobile.addEventListener('keydown', function (e) {
						var allowedKeys = [8, 9, 46, 37, 38, 39, 40];

						if ( this.value.length >= 10 && allowedKeys.indexOf(e.keyCode) === -1 ) {
							e.preventDefault();
						}
					});

					document.getElementById('step1-form').onsubmit = function (e) {
						e.preventDefault();

						if ( _this.isValid() ) {
                            persistData();

							showTab(1);
						}
					};

                    document.getElementById('reset_step1').onclick = function (e) {
                        resetForm(e, _this);
                    };
				},
				isValid: function () {
					var valid = true,
						ageMin = +this.vars.age.min,
						ageMax = +this.vars.age.max;

					filter.name.lastIndex = filter.email.lastIndex = 0;

					removeError(this.vars);

					if ( !filter.name.test(app.step1.name.trim()) ) {
						dom.addClass(this.vars.name, 'error');

						valid = false;
					}

					if ( app.step1.mobile.length !== 10 ) {
						dom.addClass(this.vars.mobile, 'error');

						valid = false;
					}

					if ( !filter.email.test(app.step1.email) ) {
						dom.addClass(this.vars.email, 'error');

						valid = false;
					}

					if ( app.step1.age < ageMin || app.step1.age > ageMax ) {
						dom.addClass(this.vars.age, 'error');

						valid = false;
					}

					if ( app.step1.gender === '' ) {
						dom.addClass(this.vars.gender, 'error');

						valid = false;
					}

					return valid;
				}
			},
			{
				num: 2,
				container: document.getElementById('step2')
			},
			{
				num: 3,
				container: document.getElementById('step3')
			},
			{
				num: 4,
				container: document.getElementById('step4')
			}
		],
		addListener = function (el, stepNum, state, fn) {
			el.onchange = el.oninput = function (e) {
				if ( e.type === 'change' ) {
					// convert value to integer if input type is number
					e.target.value = e.target.type === 'number' ? +e.target.value : e.target.value.trim();
				}

				app['step'+stepNum][state] = e.target.value;

				if ( typeof fn === 'function' ) fn();
			};

			if ( el.type === 'number' ) {
				el.onkeydown = function (e) {
					switch (e.keyCode) {
						case 107: // +
						case 187: // +
						case 109: // -
						case 189: // -
						case 110: // .
						case 190: // .
						case 69: //e
							e.preventDefault();
						break;
					}
				};
			}
		},
		initApp = function () {
			try {
				app = JSON.parse(localStorage.stepper);
			} catch (e) {
				console.info('initializing application state');
				persistData();
			}

			steps.forEach(function (step) {
				typeof step.init === 'function' && step.init();
			});
		},
        resetForm = function (e, step) {
            var i;

            e.preventDefault();

            if ( confirm('Are you sure you want to clear the above fields?') ) {
                for (i in _this.vars) {
                    step.vars[i].value = app['step' + step.num][i] = '';
                }
            }
        },
		persistData = function () {
			if ( typeof app === 'object' ) {
				localStorage.stepper = JSON.stringify(app);
			} else {
				localStorage.stepper = JSON.stringify(app = {});
			}
		},
		removeError = function (vars) {
			var i;

			for (i in vars) {
				dom.removeClass(vars[i], 'error');
			}
		},
		filter = {
			email: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
			name: /[a-z\s]+/ig
		},
		dom = {
			addClass: function (el, className) {
				var classes = el.className.split(' ');

				if ( classes.indexOf(className) === -1 ) {
					el.className += ' ' + className;
				}
			},
			removeClass: function (el, className) {
				var classes = el.className.split(' '),
					classIndex = classes.indexOf(className);

				if ( classIndex > -1 ) {
					classes.splice(classIndex, 1);

					el.className = classes.join(' ');
				}
			},
			hasClass: function (el, className) {
				var classes = el.className.split(' ');

				return classes.indexOf(className) > -1;
			}
		},
		showTab = function (index) {
			siteNav.forEach(function (a, i) {
				if ( i === index ) {
					dom.addClass(a, 'active');
					dom.addClass(steps[i].container, 'active');
				} else {
					dom.removeClass(a, 'active');
					dom.removeClass(steps[i].container, 'active');

					if ( typeof(steps[i].isValid) === 'function' && steps[i].isValid() ) {
						dom.addClass(a, 'completed');
					}
				}
			});
		},
		app;

	initApp();

	siteNav.forEach(function (a, i) {
		a.addEventListener('click', function (e) {
			e.preventDefault();

			if ( !dom.hasClass('active') ) {
				showTab(i);
			}
		});
	});
}.call(window));