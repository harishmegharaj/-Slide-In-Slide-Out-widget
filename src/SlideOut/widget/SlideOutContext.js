/*global logger*/
/*
    SlideOutContext
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
    //'use strict';

    //http://jsfiddle.net/yHPTv/577/

    // Declare widget's prototype.
    return declare("SlideOut.widget.SlideOutContext", [ _WidgetBase, _TemplatedMixin, Core ], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // DOM elements

        // Parameters configured in the Modeler.

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
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
            logger.debug(this.id + "._stopBubblingEventOnMobile");
            if (typeof document.ontouchstart !== "undefined") {
                dojoEvent.stop(e);
            }
        },

        // Rerender the interface.
        _updateRendering: function (callback) {
            logger.debug(this.id + "._updateRendering");
           	this._loadData(callback);
            // The callback, coming from update, needs to be executed, to let the page know it finished rendering
            // mendix.lang.nullExec(callback);
        },

		_loadData: function (callback) {
            logger.debug(this.id + "._loadData");
            this.replaceattributes = [];
            var referenceAttributeList = [],
                numberlist = [],
                i = null,
                value = null;

            if (!this._contextObj) {
                logger.debug(this.id + "._loadData empty context");
                mendix.lang.nullExec(callback);
                return;
            }

            for (i = 0; i < this.attributeList.length; i++) {
                if (this._contextObj.get(this.attributeList[i].attrs) !== null) {
                    value = this._fetchAttr(this._contextObj, this.attributeList[i].attrs, this.attributeList[i].renderHTML, i);
                    this.replaceattributes.push({
                        id: i,
                        variable: this.attributeList[i].variablename,
                        value: value
                    });
                } else {
                    referenceAttributeList.push(this.attributeList[i]);
                    numberlist.push(i);
                }
            }

            if (referenceAttributeList.length > 0) {
                //if we have reference attributes, we need to fetch them
                this._fetchReferences(referenceAttributeList, numberlist, callback);
            } else {
                this._buildString(callback);
            }
        },

        // The fetch referencse is an async action, we use dojo.hitch to create a function that has values of the scope of the for each loop we are in at that moment.
        _fetchReferences: function (list, numberlist, callback) {
            logger.debug(this.id + "._fetchReferences");

            var l = list.length;

            var callbackfunction = function (data, obj) {
                logger.debug(this.id + "._fetchReferences get callback");
                var value = this._fetchAttr(obj, data.split[2], data.renderAsHTML, data.oldnumber);
                this.replaceattributes.push({
                    id: data.i,
                    variable: data.listObj.variablename,
                    value: value
                });

                l--;
                if (l <= 0) {
                    this._buildString(callback);
                } else {
                    this._buildString();
                }
            };

            for (var i = 0; i < list.length; i++) {
                var listObj = list[i],
                    split = list[i].attrs.split("/"),
                    guid = this._contextObj.getReference(split[0]),
                    renderAsHTML = list[i].renderHTML,
                    oldnumber = numberlist[i],
                    dataparam = {
                        i: i,
                        listObj: listObj,
                        split: split,
                        renderAsHTML: renderAsHTML,
                        oldnumber: oldnumber
                    };

                if (guid !== "") {
                    mx.data.get({
                        guid: guid,
                        callback: dojoLang.hitch(this, callbackfunction, dataparam)
                    });
                } else {
                    //empty reference
                    this.replaceattributes.push({
                        id: i,
                        variable: listObj.variablename,
                        value: ""
                    });
                    this._buildString(callback);
                }
            }
        },

        _fetchAttr: function (obj, attr, renderAsHTML, i, emptyReplacement, decimalPrecision) {
            logger.debug(this.id + "._fetchAttr");
            var returnvalue = "";

             // Referenced object might be empty, can"t fetch an attr on empty
            if (!obj) {
                return "";
            }

            if (obj.isEnum(attr)) {
                returnvalue = this._checkString(obj.getEnumCaption(attr, obj.get(attr)), renderAsHTML);
            } else if (obj.getAttributeType(attr) === "String" || obj.isNumeric(attr) || obj.getAttributeType(attr) === "AutoNumber") {
				returnvalue = this._checkString(mx.parser.formatAttribute(obj, attr), renderAsHTML);
            }
            if (returnvalue === "") {
                return "";
            } else {
                return returnvalue;
            }
        },


        // _buildString also does _renderString because of callback from fetchReferences is async.
        _buildString: function (callback) {
            logger.debug(this.id + "._buildString");
            var str = this.buttonString,
                settings = null,
                attr = null;

            for (attr in this.replaceattributes) {
                settings = this.replaceattributes[attr];
                str = str.split("${" + settings.variable + "}").join(settings.value);
            }

			console.log(this.id + "._buildString: " + str);
            this.slidetext.innerHTML = str;

			this._setButtonTop();

            if (callback && typeof callback === "function") {
                logger.debug(this.id + "._renderString callback");
                callback();
            }
        },

        _checkString: function (string, renderAsHTML) {
            logger.debug(this.id + "._checkString");
            if (string.indexOf("<script") > -1 || !renderAsHTML) {
                string = dom.escapeString(string);
            }
            return string;
        },

		_loadPage: function(){
			if(this.contentSet) {
				if(this.refreshMF && this._contextObj){
					this._executeMicroflow(this.refreshMF, dojoLang.hitch(this, function () {
						console.log(this.id + " refresh done.");
					}), this._contextObj);
				}
			} else {
				if(this._contextObj && this.pushCurrentObject) {
					this._setPage(this._contextObj);
		   		} else {
					this._setPage();
				}
				this.contentSet = true;
			}
		},

        _unsubscribe: function () {
			console.log(this.id + "._unsubscribe");
          	if (this._handles) {
				dojoArray.forEach(this._handles, function (handle) {
				  mx.data.unsubscribe(handle);
				});
				this._handles = [];
          	}
        },

        // Reset subscriptions.
        _resetSubscriptions: function () {
            logger.debug(this.id + "._resetSubscriptions");
            // Release handles on previous object, if any.
            this._unsubscribe();

            // When a mendix object exists create subscribtions.
            if (this._contextObj) {
                var objectHandle = mx.data.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: dojoLang.hitch(this, function (guid) {
                        this._updateRendering();
                    })
                });

                var attrHandle = mx.data.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this.backgroundColor,
                    callback: dojoLang.hitch(this, function (guid, attr, attrValue) {
                        this._updateRendering();
                    })
                });

                var validationHandle = mx.data.subscribe({
                    guid: this._contextObj.getGuid(),
                    val: true,
                    callback: dojoLang.hitch(this, this._handleValidation)
                });

                this._handles = [ objectHandle, attrHandle, validationHandle ];
            }
        },

        // Handle validations.
        _handleValidation: function (validations) {},

        // Clear validations.
        _clearValidations: function () {},

        // Add a validation.
        _addValidation: function (message) {}
    });
});

require(["SlideOut/widget/SlideOutContext"], function () {
    'use strict';
});
