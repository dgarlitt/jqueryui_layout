(function($, undefined) {
	
	$.widget('arlitt.oaContentSection', {
		
		options: {
			cookies: true,
			collapsible: true,
			buttons : 	[
				/*  There is an option for the user to define an array
					of their own button objects with any of the
					following options:
						{
							title: 'user defined button', // the title of the button when you mouse over it
							icon: 'ui-icon-help', // the jQuery UI icon class to use for the button
							event : 'click' , // the event to bind the button action to
							action : function(e) { // this function will execute on the event defined above
								alert('no button action defined');
							},
							hideOnCollapse: true, // will hide the button when content collapses
							showOnExpand: true // will show the button when content expands
						}
				*/
			],
			
			_beforecollapse: function(event, ui) {},
			_aftercollapse: function(event, ui) {},
			_beforeexpand: function(event, ui) {},
			_afterexpand: function(event, ui) {}
		},
		_create: function() {
			// The _create method is where you set up the widget
			var $self = this;
			var $el = this.element;
			
			// save the title for later reference
			this._titletext = $el.attr('title');
			
			// allow user to show or hide buttons
			// based on the data-oa-buttons
			// attribute on each tag. They can
			// specify the button name with or without
			// an exclamation point to indicate whether
			// to show it or not.
			if ( $el.is('[data-oa-buttons]') ) {
				var tagOpts = $el.attr('data-oa-buttons').split(',');
				
				for ( i in tagOpts ) {
					var opt = $.trim(tagOpts[i]);
					var show = ( opt.indexOf('!') < 0 );
					opt = opt.replace( '!', '' );
					this.options.buttons[opt].show = show;
				}
				
			}
			
			if ( !$el.hasClass('oa-content-section') ) {
				$el.addClass('oa-content-section');
			}
			
			$el.css({
				"padding": "10px",
				"margin": "0 0 10px 0"
			});
			
			this._header = $('<div class="oa-content-section-header"></div>')
							.css({
								"padding": ".3em",
								"padding-bottom": 0,
								"position": "relative"
							});
			this._title = $('<div class="oa-content-section-title ui-state-active">' + this._titletext + '</div>')
							.css({
								"font-size": "1.1em",
								"font-weight": "bold",
								"text-align": "left",
								"margin": "0 5px 0 25px",
								"border": 0,
								"background-image": "none",
								"background-color": "transparent"
							});
			this._container = $('<div class="oa-content-section-inner-container"></div>')
							.css({
								"border-top": "1px solid #cccccc",
								"padding-top": ".5em",
								"margin-top": ".3em"
							});
			
			$el
				.addClass('ui-widget-content')
				.addClass('ui-corner-all')
				.wrapInner(this._container)
				.prepend(this._header.append( this._title ))
				.removeAttr('title');
			
			this._addRemoveCollapseButton();
			
			this._addRemoveUserDefinedButtons();
			
			if ( this.options.cookies ) {
				if ( this._getCookie() == 'collapsed' && this.options.collapsible ) {
					this._collapse();
				}
			}
		},
		_collapsebutton: false,
		_titletext: '',
		
		// cookie related
		_cookiename: null,
		_getCookieName: function() {
			if ( this._cookiename == null ) {
				// this makes the cookie name pretty
				var makePretty = function(text) {
					return text.replace(/[^A-Za-z0-9 -]/gi,"").replace(/[ ]/gi,"-").toLowerCase();
				}

				var cookiename 	= 'oacontentsection' + '.'
								+ makePretty( $('title').text() ) + '.'
								+ makePretty( this._titletext );
				this._cookiename = cookiename;
			}
			return this._cookiename;
		},
		_getCookie: function() {
			if ( !$.cookie ) {
				alert( 'the jQuery cookie plugin is not available' );
				return '';
			}
			return $.cookie( this._getCookieName() );
		},
		_setCookie: function(state) {
			if ( !$.cookie ) {
				alert( 'the jQuery cookie plugin is not available' );
				return '';
			}
			$.cookie( this._getCookieName(), state, { expires: 3650 } );
		},
		
		_expandedClass: 'ui-icon-triangle-1-s',
		_collapsedClass: 'ui-icon-triangle-1-e',
		_collapse: function(slide) {
			var $button = this._collapsebutton;
			var span = $button.find('span');
			var self = this;
			
			$button.trigger('blur');
			
			if ( slide ) {
				self._trigger('_beforecollapse');
				$button.parent().next().slideUp('fast', function() {
					self._trigger('_aftercollapse');
				});
			} else {
				$button.parent().next().hide();
			}
			
			for ( var i = 0; i < self.options.buttons.length; i++ ) {
				var button = self.options.buttons[i];
				if ( button.element && button.hideOnCollapse ) {
					if ( button.element.hide ) {
						 button.element.hide();
					}
				}
			}
			
			span
				.addClass(this._collapsedClass)
				.removeClass(this._expandedClass);
			
			$button.attr('title', 'expand');
			
			if ( self.options.cookies ) {
				self._setCookie('collapsed');
			}
		},
		_expand: function(slide) {
			var $button = this._collapsebutton;
			var span = $button.find('span');
			var self = this;
			var buttons = self.options.buttons;
			
			$button.trigger('blur');
			
			if ( slide ) {
				self._trigger('_beforeexpand');
				$button.parent().next().slideDown('fast', function() {
					self._trigger('_afterexpand');
				});
			} else {
				$button.parent().next().show();
			}
			
			for ( var i = 0; i < buttons.length; i++ ) {
				var button = buttons[i];
				if ( button.element && button.showOnExpand ) {
					if ( button.element.show ) {
						 button.element.show();
					}
				}
			}
			
			span
				.removeClass(this._collapsedClass)
				.addClass(this._expandedClass);
			
			$button.attr('title', 'collapse');
			
			if ( self.options.cookies ) {
				self._setCookie('expanded');
			}
		},
		_addRemoveCollapseButton: function() {
			if ( this.options.collapsible ) {
				// create the collapse button if it doesn't exist
				if ( !this._collapsebutton ) {
					var self = this;
					
					this._collapsebutton = 
						$('<button title="collapse" alt="collapse"></button>')
							.button({ text: false, icons: { primary: "ui-icon-triangle-1-s" } })
							.bind('click.oa-content-section', function(e) {
								var $this = $(this);
								var span = $this.find('span.ui-button-icon-primary');
								
								if ( span.hasClass(self._expandedClass) ) {
									self._collapse( true );
								} else {
									self._expand( true );
								}
							});
					
					this._header.append( this._collapsebutton.css( {
											position: 'absolute',
											top: 0,
											left: 0,
											width: '20px',
											height: '20px'
										} ) );
				}
				
			} else {
				if ( this._collapsebutton ) {
					if ( this._collapsebutton.remove ) {
						this._collapsebutton.remove();
					}
					this._collapsebutton = false;
				}
			}
		},
		_addRemoveUserDefinedButtons: function() {
			for ( var i = 0; i < this.options.buttons.length; i++ ) {
				var buttonDefaults = {
					title: 'user defined button',
					icon: 'ui-icon-help',
					event : 'click' ,
					action : function(e) {
						alert('no button action defined');
					},
					hideOnCollapse: true,
					showOnExpand: true
				};
				
				if ( $.isPlainObject( this.options.buttons[i] ) && !$.isEmptyObject( this.options.buttons[i] ) ) {
					this.options.buttons[i] = $.extend( buttonDefaults, this.options.buttons[i] );
				} else {
					this.options.buttons[i] = buttonDefaults;
				}
				
				if ( $.isPlainObject( this.options.buttons[i] ) ) {
					
					// create the user defined button element if it doesn't exist
					if ( !this.options.buttons[i].element ) {
						this.options.buttons[i].element =
							$('<button title="' + this.options.buttons[i].title + '" alt="' + this.options.buttons[i].title + '"></button>')
								.button({ text: false, icons: { primary: this.options.buttons[i].icon } });
						
						var marginright = 25 * i;
						
						this.options.buttons[i].element.css('margin-right', marginright + 'px');
						
						// put the button element in the dom
						this._header.append( this.options.buttons[i].element.css({
																				position: 'absolute',
																				top: 0,
																				right: 0,
																				width: '20px',
																				height: '20px'
																			})
						);
					}
					
					// customize the user defined button element if it was created above
					if ( this.options.buttons[i].element ) {
						// unbind and bind the event to the user defined button element
						this.options.buttons[i].element.unbind( '.oa-content-section' );
						this.options.buttons[i].element.bind( this.options.buttons[i].event + '.oa-content-section', this.options.buttons[i].action);
					}
					
				}
			}
		},
		_buttonsViaSetOption: function( buttons ) {
			if ( !$.isArray( buttons ) ) {
				alert( 'Please pass an array of objects to modify the buttons');
			} else {
				
				for ( var i = 0; i < this.options.buttons.length; i++ ) {
					var button = this.options.buttons[i];
					if ( button.element && button.element.remove ) {
						button.element.remove();
					}
				}
				
				this.options.buttons = buttons;
				
				this._addRemoveUserDefinedButtons();
			}
		},
		_setOption: function(key, value) {
			// Use the _setOption method to respond to changes to options
			switch(key) {
				case "buttons":
					this._buttonsViaSetOption( value );
					break;
			}
			$.Widget.prototype._setOption.apply(this, arguments)
		},
		destroy: function() {
			// Use the destroy method to reverse everything your plugin has applied
			this._header.remove();
			this._container.children().unwrap();
			$.Widget.prototype.destroy.call(this);
		}
		
	});
})(jQuery);
