/*global logger*/
/*
    SlideOutPlane
    ========================

    @file      : SlideOut.js
    @version   : 1.0.0
    @author    : JvdGraaf
    @date      : Wed, 21 Sep 2016 10:50:26 GMT
    @copyright : Appronto
    @license   : Apache2

    Documentation
    ========================
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
    'use strict';

    //http://jsfiddle.net/yHPTv/577/

    // Declare widget's prototype.
    return declare("SlideOut.widget.SlideOutPlane", [ _WidgetBase, _TemplatedMixin, Core ], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // DOM elements

        // Parameters configured in the Modeler.

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
            logger.debug(this.id + ".constructor");
            this._handles = [];
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {
            logger.debug(this.id + ".postCreate");
            this._updateRendering();
            this._setupEvents();
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function (obj, callback) {
            logger.debug(this.id + ".update");

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
            logger.debug(this.id + "._stopBubblingEventOnMobile");
            if (typeof document.ontouchstart !== "undefined") {
                dojoEvent.stop(e);
            }
        },

        // Rerender the interface.
        _updateRendering: function (callback) {
            logger.debug(this.id + "._updateRendering");

            this.slidetext.innerHTML = this.buttonString;
			this._setButtonTop();

            // The callback, coming from update, needs to be executed, to let the page know it finished rendering
            mendix.lang.nullExec(callback);
        },

		_loadPage: function(){
            logger.debug(this.id + "._loadPage");
			if(!this.contentSet) {
				this._setPage();
				this.contentSet = true;
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

require(["SlideOut/widget/SlideOutPlane"], function () {
    'use strict';
});
