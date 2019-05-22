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
					var _v,
                        _this = this;

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
				isValid: function (softValidate) {
					var valid = true,
						ageMin = +this.vars.age.min,
						ageMax = +this.vars.age.max;

					filter.name.lastIndex = filter.email.lastIndex = 0;

					removeError(this.vars);

					if ( !filter.name.test(app.step1.name.trim()) ) {
						if ( softValidate ) return false;

						dom.addClass(this.vars.name, 'error');
						valid = false;
					}

					if ( app.step1.mobile.length !== 10 ) {
						if ( softValidate ) return false;

						dom.addClass(this.vars.mobile, 'error');
						valid = false;
					}

					if ( !filter.email.test(app.step1.email) ) {
						if ( softValidate ) return false;

						dom.addClass(this.vars.email, 'error');
						valid = false;
					}

					if ( app.step1.age < ageMin || app.step1.age > ageMax ) {
						if ( softValidate ) return false;

						dom.addClass(this.vars.age, 'error');
						valid = false;
					}

					if ( app.step1.gender === '' ) {
						if ( softValidate ) return false;

						dom.addClass(this.vars.gender, 'error');
						valid = false;
					}

					return valid;
				},
				onShow: function () {

				}
			},
			{
				num: 2,
				container: document.getElementById('step2'),
                vars: {
                    'symptoms': document.getElementById('symptoms'),
                    'custom-symptoms': document.getElementById('custom-symptoms'),
                    'not-well-since': document.getElementById('not-well-since')
                },
                init: function () {
                    var _this = this,
                        symptoms = ['Abdominal Pain', 'Back Pain', 'Chest Pain', 'Ear Pain', 'Head Pain', 'Tooth Pain', 'Chronic Pain', 'Feeling Feverish', 'Nausea', 'Light-headed', 'Chills', 'Dizzy', 'Short of breath', 'Blurred Vision', 'Excessive Sweating', 'Palpitation'],
                       	customCTA = document.getElementById('step2-custom-cta'),
                       	customSymptomIP = document.getElementById('custom-symptom-name'),
                       	chkContainer = this.vars.symptoms.firstElementChild,
                       	fragment = new DocumentFragment(),
                       	getSymptomsChk = function (id, name, text, checked, onchange) {
				        	var chk_container = chkContainer.cloneNode(true),
				        		input = chk_container.querySelector('input');

				        	chk_container.htmlFor = id;

							input.id = id;
							input.name = name;
							input.value = text;
							input.checked = checked === true;
							input.onchange = onchange;

							chk_container.querySelector('.multiple-input__lbl').innerHTML = text;

							return chk_container;
				        },
                       	createCustomSymptomDOM = function (symptom) {
                       		var customSymptomWrapper = document.createElement('div'),
                       			customSymptomLabel = document.createElement('span'),
                       			customSymptomCTA = document.createElement('button');

                   			customSymptomWrapper.className = 'custom-symptom-wrapper multiple-input__col';

                   			customSymptomLabel.className = 'custom-symptom-label';
                   			customSymptomLabel.innerHTML = symptom;

                   			customSymptomCTA.className = 'custom-symptom-cta';
                   			customSymptomCTA.type = 'button';
                   			customSymptomCTA.innerHTML = '&times;';
                   			customSymptomCTA.onclick = function (e) {
                   				var index;

                   				if (confirm('Are you sure you want to remove this symptom?')) {
                   					// get index of symptom
                   					index = app.step2['custom-symptoms'].indexOf(symptom);

                   					// remove index from app.step2 array
									app.step2['custom-symptoms'].splice(index, 1);

									// unbind onclick listener
									customSymptomCTA.onclick = undefined;

									// remove customSymptomWrapper from DOM
									customSymptomWrapper.parentNode.removeChild(customSymptomWrapper);

                                    modelPersistData();
                   				}
                   			};

                   			customSymptomWrapper.appendChild(customSymptomLabel);
                   			customSymptomWrapper.appendChild(customSymptomCTA);

                   			// append newly created custom symptom to DOM
                   			_this.vars['custom-symptoms'].appendChild(customSymptomWrapper);
                       	},
                       	createCustomSymptom = function (symptom) {
                       		var input,
                       			foundSymptom = symptoms.filter(function (s) {
                       				return s.toLowerCase() === symptom.toLowerCase();
                       			}),
                       			foundStep2Symptom = app.step2.symptoms.filter(function (s) {
                       				return s.toLowerCase() === symptom.toLowerCase();
                       			}),
                       			foundCustomSymptom = app.step2['custom-symptoms'].filter(function (s) {
                       				return s.toLowerCase() === symptom.toLowerCase();
                       			});

                       		// check if custom symptom exists in predefined sypmtoms array
                       		if ( foundSymptom.length > 0 ) {

                       			// check if user has not previously selected the symptom from predefined list
                       			if (  foundStep2Symptom.length === 0 ) {
                       				app.step2.symptoms.push(symptom);

                       				if ( input = _this.vars.symptoms.querySelector('input[value="' + symptom + '"]') ) {
                       					input.checked = true;
                       				}

                                    modelPersistData();
                       			}
                       		} else if ( foundCustomSymptom.length === 0 ) {
                       			// if this custom symptom was not already added to step2 custom-symptoms array

                       			// create custom symptom DOM
                       			createCustomSymptomDOM(symptom);

                       			// add newly created custom symptom to app.step2 array
                       			app.step2['custom-symptoms'].push(symptom);

                                modelPersistData();
                       		}
                       	};

                   	if ( chkContainer ) {
						this.vars.symptoms.removeChild( this.vars.symptoms.firstElementChild );
					}

                    if ( !app.step2 ) {
                        app.step2 = {
                            'symptoms': [],
                            'custom-symptoms': [],
                            'not-well-since': ''
                        };
                    }

                    // 1. iterate over symptoms and append to DocumentFragment to minize DOM interactions
                    symptoms.forEach(function (symptom, index) {
                    	var checked = app.step2.symptoms.indexOf(symptom) > -1;

                    	fragment.appendChild(getSymptomsChk('symptoms_' + index, 'symptoms[]', symptom, checked, function (e) {
                    		var index;

                    		if ( this.checked ) {
                    			app.step2.symptoms.push(this.value);
                    		} else {
                    			index = app.step2.symptoms.indexOf(this.value);

                    			app.step2.symptoms.splice(index, 1);
                    		}
                    	}));
                    });

                    //  append symptoms fragment to DOM
                    this.vars.symptoms.appendChild(fragment);

                    // 2. custom symptom start
                    // iterate over step2 custom symptoms array and append to DOM
                    app.step2['custom-symptoms'].forEach(createCustomSymptomDOM);

                    // initialize custom symptom input and CTA
                    customSymptomIP.value = '';
                    customCTA.disabled = true;

                    customSymptomIP.onkeyup = function (e) {
                    	customCTA.disabled = this.value.trim().length === 0;
                    };
                    customSymptomIP.onchange = function (e) {
                    	this.value = this.value.trim();
                    };
                    customCTA.onclick = function (e) {
                    	createCustomSymptom(customSymptomIP.value.trim());
                    	customSymptomIP.value = '';
                    	customCTA.disabled = true;
                    };
                    // 2. custom symptom end

                    /* 3. not well start */
                    this.vars['not-well-since'].value = app.step2['not-well-since'];
                    addListener(this.vars['not-well-since'], this.num, 'not-well-since');
                    /* 3. not well end */

                    document.getElementById('prev_step2').onclick = function (e) {
                    	showTab(0);
                    };

                    // form submit
                    document.getElementById('step2-form').onsubmit = function (e) {
                    	e.preventDefault();

                    	if ( typeof _this.isValid === 'function' && _this.isValid() ) {
                    		persistData();

                    		showTab(2);
                    	}
                    };

                    fragment = undefined;
                },
                isValid: function (softValidate) {
                	var valid = true,
                		notWellSince = +app.step2['not-well-since'];

                	if ( app.step2.symptoms.length === 0 ) {
                		if( softValidate ) return false;

                		dom.addClass(document.getElementById('symptoms-container'), 'error');

                		valid = false;
                	} else {
                		dom.removeClass(document.getElementById('symptoms-container'), 'error');
                	}

                	if ( isNaN(notWellSince) ) {
                		if ( softValidate ) return false;

                		dom.addClass(this.vars['not-well-since'], 'error');

                		valid = false;
                	} else if ( notWellSince < +this.vars['not-well-since'].min || notWellSince > +this.vars['not-well-since'].max ) {
                		if ( softValidate ) return false;

                		dom.addClass(this.vars['not-well-since'], 'error');

                		valid = false;
                	} else {
                        dom.removeClass(this.vars['not-well-since'], 'error');
                    }

                	return valid;
                },
                onShow: function () {

                }
			},
			{
				num: 3,
				container: document.getElementById('step3'),
                vars: {
                    'schedule-date': document.getElementById('schedule-date'),
                    'schedule-time': document.getElementById('schedule-time'),
                    'payment-mode': document.getElementById('payment-mode')
                },
                init: function () {
                    var _v,
                        _this = this,
                        dtp;

                    if ( !app.step3 ) {
                        app.step3 = {
                            'schedule-date': '',
                            'schedule-time': '',
                            'payment-mode': ''
                        };
                    }

                    for (_v in this.vars) {
                        this.vars[_v].value = app.step3[_v];

                        addListener(this.vars[_v], this.num, _v);
                    }

                    dtp = flatpickr(this.vars['schedule-date'], {
                        dateFormat: 'd-m-Y',
                        minDate: new Date()
                    });

                    document.getElementById('prev_step3').onclick = function (e) {
                        showTab(1);
                    };

                    document.getElementById('step3-form').onsubmit = function (e) {
                        e.preventDefault();

                        if ( _this.isValid() ) {
                            persistData();

                            showTab(3);
                        }
                    };
                },
                isValid: function (softValidate) {
                    var valid = true,
                        regDate = /^\d{2}\-\d{2}\-\d{4}$/;

                    removeError(this.vars);

                    if ( !regDate.test(app.step3['schedule-date']) ) {
                        if ( softValidate ) return false;

                        dom.addClass(this.vars['schedule-date'], 'error');

                        valid = false;
                    }

                    if ( app.step3['schedule-time'] === '' ) {
                        if ( softValidate ) return false;

                        dom.addClass(this.vars['schedule-time'], 'error');

                        valid = false;
                    }

                    if ( app.step3['payment-mode'] === '' ) {
                        if ( softValidate ) return false;

                        dom.addClass(this.vars['payment-mode'], 'error');

                        valid = false;
                    }

                    return valid;
                },
                onShow: function () {

                }
			},
			{
				num: 4,
				container: document.getElementById('step4'),
				vars: {
					step1: {
						'name': document.getElementById('step1-name'),
						'mobile': document.getElementById('step1-mobile'),
						'email': document.getElementById('step1-email'),
						'address': document.getElementById('step1-address'),
						'age': document.getElementById('step1-age'),
						'gender': document.getElementById('step1-gender'),
						'allergies': document.getElementById('step1-allergies'),
					},
					step2: {
						'symptoms': document.getElementById('step2-symptoms'),
						'not-well-since': document.getElementById('step2-not-well-since')
					},
					step3: {
						'schedule-date': document.getElementById('step3-schedule-date'),
						'schedule-time': document.getElementById('step3-schedule-time'),
						'payment-mode': document.getElementById('step3-payment-mode')
					}
				},
				init: function () {
					this.onShow();

					document.getElementById('edit_step1').onclick = function (e) {
						showTab(0);
					};

					document.getElementById('edit_step2').onclick = function (e) {
						showTab(1);
					};

					document.getElementById('edit_step3').onclick = function (e) {
						showTab(2);
					};

					document.getElementById('step4_book').onclick = function (e) {
						if (confirm('Are you sure you want to book with the following details?')) {
							alert('Booked successfully!');
						}
					};
				},
				onShow: function () {
					var _app, i, _this = this, fragment;
					try {
						_app = JSON.parse(localStorage.stepper);

						steps.forEach(function (step, stepIndex) {
							if ( typeof step.isValid === 'function' ) {
								if ( step.isValid(true) ) {
									if ( step.num === 1 || step.num === 3  ) {
										for (i in _app['step' + step.num]) {
											_this.vars['step' + step.num][i].innerHTML = _app['step' + step.num][i] || '-NA-';
										}
									} else if (step.num === 2) {
										fragment = new DocumentFragment();

										(_app.step2.symptoms.concat(_app.step2['custom-symptoms']))
											.forEach(function (symptom) {
												var li = document.createElement('li');

												li.innerHTML = symptom;
												li.className = 'detail-list-item';

												fragment.appendChild(li);
											});

										_this.vars.step2['symptoms'].innerHTML = '';
										_this.vars.step2['symptoms'].appendChild(fragment);

										_this.vars.step2['not-well-since'].innerHTML = _app.step2['not-well-since'];

										fragment = undefined;
									}
								} else {
									showTab(stepIndex);
								}
							}
						});

					} catch (e) {
						console.error('error in app', e);
					}
				},
				isValid: function (softValidate) {
					return (
						typeof steps[0].isValid === 'function' && steps[0].isValid(true) && 
						typeof steps[1].isValid === 'function' && steps[1].isValid(true) &&
						typeof steps[2].isValid === 'function' && steps[2].isValid(true)
					);
				}
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

                modelPersistData();
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

                modelPersistData();
            }
        },
        modelPersistData = function () {
            // persistData();
        },
		persistData = function (session) {
            var storage = session ? sessionStorage : localStorage;

			if ( typeof app === 'object' ) {
				storage.stepper = JSON.stringify(app);
			} else {
				storage.stepper = JSON.stringify(app = {});
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

					typeof steps[i].onShow === 'function' && steps[i].onShow();
				} else {
					dom.removeClass(a, 'active');
					dom.removeClass(steps[i].container, 'active');

					if ( typeof(steps[i].isValid) === 'function' && steps[i].isValid(true) ) {
						dom.addClass(a, 'completed');
					}
				}
			});

			window.scrollTo(0, 0);
		},
        getSessionData = function () {
            if ( typeof sessionStorage.app ) {
                try {
                    return JSON.parse(sessionStorage.app);
                } catch (e) {
                    sessionStorage.app = JSON.stringify({});

                    return {};
                }
            } else {
                sessionStorage.app = JSON.stringify({});

                return {};
            }
        },
        activeTab = 0,
		app;

    initApp();

	siteNav.forEach(function (a, i) {
		a.addEventListener('click', function (e) {
			e.preventDefault();

			/*if ( !dom.hasClass(a, 'active') ) {
				showTab(i);
			}*/
		});

        if ( typeof steps[i].isValid === 'function' && steps[i].isValid(true) ) {
            dom.addClass(a, 'completed');

            activeTab = i;
        }
	});

    showTab(Math.min(activeTab + 1, steps.length - 1));
}.call(window));