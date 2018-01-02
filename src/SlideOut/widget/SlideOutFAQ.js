/*global logger*/
/*
    SlideOutPlane
    ========================

    @file      : SlideOutFAQ.js
    @version   : 1.0.0
    @author    : JvdGraaf
    @date      : Wed, 21 Sep 2016 10:50:26 GMT
    @copyright : Appronto
    @license   : Apache2

    Documentation
    ========================l
    Describe your widget here.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
    'dojo/_base/declare',
	'mxui/widget/_WidgetBase',
	'dijit/_TemplatedMixin',
    'mxui/dom',
	'dojo/dom',
	'dojo/query',
	'dojo/dom-prop',
	'dojo/dom-geometry',
	'dojo/dom-class',
	'dojo/dom-style',
	'dojo/dom-construct',
	'dojo/_base/array',
	'dojo/_base/lang',
	'dojo/html',
	'dojo/_base/event',
	'dojo/text!SlideOut/template/SlideOut.html',
	'SlideOut/widget/SlideOut'
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, domQuery, domProp, domGeom, domClass, domStyle, domConstruct, dojoArray, dojoLang, html, event, widgetTemplate, Core) {
    //'use strict';

    //http://jsfiddle.net/yHPTv/577/

    // Declare widget's prototype.
    return declare("SlideOut.widget.SlideOutFAQ", [ _WidgetBase, _TemplatedMixin, Core ], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // DOM elements

        // Parameters configured in the Modeler.

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,
		_pageObj: null,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
            console.log(this.id + ".constructor");
            this._handles = [];
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {
            console.log(this.id + ".postCreate");
            this._updateRendering();
            this._setupEvents();
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function (obj, callback) {
            console.log(this.id + ".update");

            this._contextObj = obj;
            this._resetSubscriptions();
            this._updateRendering(callback); // We're passing the callback to updateRendering to be called after DOM-manipulation
        },

        // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
        enable: function () {
          logger.debug(this.id + ".enable");
        },

        // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
        disable: function () {
          logger.debug(this.id + ".disable");
        },

        // mxui.widget._WidgetBase.resize is called when the page's layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
        resize: function (box) {
          logger.debug(this.id + ".resize");
        },

        // We want to stop events on a mobile device
        _stopBubblingEventOnMobile: function (e) {

            console.log(this.id + "._stopBubblingEventOnMobile");
            if (typeof document.ontouchstart !== "undefined") {
                dojoEvent.stop(e);
            }
        },

        // Rerender the interface.
        _updateRendering: function (callback) {
            console.log(this.id + "._updateRendering");

            this.slidetext.innerHTML = this.buttonString;
			this.slidecontrol.style.top = ((this.slidecontrol.offsetWidth / 2) + this.topPosition) + "px";

            // The callback, coming from update, needs to be executed, to let the page know it finished rendering
            mendix.lang.nullExec(callback);
        },

		_setCurrentPage: function(){
			var formname = '';

			try {
				if (typeof(mx.router.getContentForm) === "on" && typeof(mx.router.getContentForm().path) !== "undefined") {
					// mx6.1+
					formname = mx.router.getContentForm().path;
				} else if (this.mxform !== "undefined"){
					formname = this.mxform.path;
				} else if (typeof(mx.ui.getCurrentForm) === "function" && typeof(mx.ui.getCurrentForm().path) !== "undefined") {
					// mx5.10+
					formname = mx.ui.getCurrentForm().path;
				} else if (typeof(mxui) !== "undefined" && typeof(mxui.currentForm) !== "undefined") {
					// This is the new Mendix 5 version (it's above mobile because mx5 now always have that var)
					formname = mxui.currentForm.path;
				} else if (typeof(mobile) !== "undefined") {
					// Mx 4 mobile version
					formname = mobile.currentForm.path;
				} else if (typeof(mx) !== "undefined" && typeof(mx.screen) !== "undefined") {
					// Every other modeler, mostly mx4 desktop
					formname = mx.screen.buffer.getCurrentItem()._c.url;
				} else if (this.userdata) {
					formname = this.userdata.formName;
				}
				this._pageObj.set(this.pageAttr,formname);
				console.log(this.id + '._setCurrentPage page found: ' + formname);
			} catch (e) {
				console.log(this.id + '._setCurrentPage failed to load current page.' + e);
			}
		},

		_loadPage: function(){
			if (!this._pageObj) {
				var self = this;
				mx.data.create({
					entity: this.pageEntity,
						callback:   function(object){
							self._pageObj = object;
							self._setCurrentPage();
							if(!self.contentSet){
								self._setPage(self._pageObj);
								self.contentSet = true;
							}
						}
				});
			} else {
				this._setCurrentPage();

				if(!this.contentSet){
					this._setPage(this._pageObj);
					this.contentSet = true;
				} else if(this.refreshMF && this._pageObj){
					this._executeMicroflow(this.refreshMF, dojoLang.hitch(this, function () {
						console.log(this.id + " refresh done.");
					}), this._pageObj);
				}
			}
		},

        _unsubscribe: function () {
          if (this._handles) {
              dojoArray.forEach(this._handles, function (handle) {
                  mx.data.unsubscribe(handle);
              });
              this._handles = [];
          }
        },

        // Reset subscriptions.
        _resetSubscriptions: function () {},

        // Handle validations.
        _handleValidation: function (validations) {},

        // Clear validations.
        _clearValidations: function () {},

        // Add a validation.
        _addValidation: function (message) {}
    });
});

require(["SlideOut/widget/SlideOutFAQ"], function () {
    'use strict';
});
