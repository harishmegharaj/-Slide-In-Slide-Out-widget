define([

    // Mixins
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",

    // Client API and DOJO functions
    "mxui/dom",
    "dojo/dom",
    "dojo/query",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-attr",
    "dojo/dom-style",
    "dojo/_base/window",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/html",
    "dojo/ready",
    'SlideOut/lib/jquery-1.11.2'
], function(
// Mixins
declare,
_WidgetBase,
_TemplatedMixin,
// Client API and DOJO functions
dom,
dojoDom,
domQuery,
domProp,
domGeom,
domClass,
domAttr,
domStyle,
win,
domConstruct,
dojoArray,
dojoLang,
html,
ready,
_jQuery) {

    "use strict";
    var $ = _jQuery.noConflict(true);

    // Declare widget.
    return declare([
        _WidgetBase, _TemplatedMixin
    ], {

        contentDisplay: false,
        contentSet: false,
        _contextObj: null,
        _params: null,
        _pageContext: null,
        _ioBind: null,

        startup: function() {
            if (typeof window.slideoutstorage === 'undefined') {
                window.slideoutstorage = [];
            }

            this._params = {
                id: this.id,
                prio: this.seqPriority,
                sorting: this.seqPriority,
                control: this.slidecontrol,
                toppos: this.topPosition
            }
            window.slideoutstorage.push(this._params);

            $(this.slidecontainer).css({
              'width': this.contentWidth + 'px',
              'right': '-' + this.contentWidth + 'px'
            });

        },

        // Attach events to HTML dom elements
        _setupEvents: function() {
            logger.debug("Core." + this.id + "._setupEvents hide all content");
            logger.debug(this.id + "._setupEvents");
            this.connect(this.slidebutton, "click", this._toggleContent);
        },

        _toggleContent: function() {
            var self = this;
            if (this.contentDisplay) {
                // hide content
                logger.debug(this.id + '._toggleContent hide content: ' + this.contentWidth + " showtime: " + this.showTime);
                $(this.slidecontrol).animate({right: '-=' + this.contentWidth + 'px'}, this.showTime, "swing");
                $(this.slidecontainer).animate({right: '-' + this.contentWidth + 'px'}, this.showTime, "swing", function() {
                    self._toggleOtherButtons(true);
                    self._setStyleText(this.slidecontent, "display:none;");
                });


                this.contentDisplay = false;

                $(window).off("click");

            } else {
                // show content
                self._setStyleText(self.slidecontent, "display:block;");
                self._loadPage();
                logger.debug(this.id + '._toggleContent show content ' + this.contentWidth + " showtime: " + this.showTime);
                $(this.slidecontrol).animate({right: '+=' + this.contentWidth + 'px'}, this.showTime, "swing");
                $(this.slidecontainer).animate({right: '0px'}, this.showTime, "swing");

                this._toggleOtherButtons(false);

                this.contentDisplay = true;

                $(window).click(dojoLang.hitch(this, function(e) {
                    var list = $(e.target).parents();
                    if ($.inArray(this.slidecontainer, list) === -1 && $.inArray(this.slidecontrol, list) === -1) {
                        console.log("Not a parent of the widget of the list: " + list.length + ", toggle content");
                        this._toggleContent();
                    }
                }));
            }
        },

        _toggleOtherButtons: function(visible) {
            if (typeof(window.slideoutstorage) !== 'undefined' && window.slideoutstorage.length > 1) {
                for (var j = 0; j < window.slideoutstorage.length; j++) {
                    var item = window.slideoutstorage[j];
                    if (item.id !== this.id) {
                        if (visible) {
                            this._setStyleText(item.control, "z-index:10000; right: 0px; top: " + item.toppos + "px;");
                        } else {
                            this._setStyleText(item.control, "z-index:9000; right: 0px; top: " + item.toppos + "px;");
                        }
                    }
                }
            }
        },

        _setStyleText: function(posElem, content) {
            if (posElem) {
                if (typeof(posElem.style.cssText) != 'undefined') {
                    posElem.style.cssText = content;
                    logger.debug(this.id + '.setStyle update: ' + content);
                } else {
                    posElem.setAttribute('style', content);
                    logger.debug(this.id + '.setStyle set: ' + content);
                }
            }
        },

        _setPage: function(pageObj) {
            if (pageObj) {
                logger.debug(this.id + '._setPage get page with context.');
                this._pageContext = new mendix.lib.MxContext();
                this._pageContext.setTrackObject(pageObj);
                this._ioBind = mx.ui.openForm(this.pageContent, {
                    context: this._pageContext,
                    location: "content",
                    domNode: this.slidecontent,
                    callback: dojoLang.hitch(this, function(form) {
                        logger.debug(this.id + '._loadPage page load. ' + form.id);
                    })
                });
            } else {
                logger.debug(this.id + '._setPage get page.');
                var ioBind = mx.ui.openForm(this.pageContent, {
                    location: "content",
                    domNode: this.slidecontent,
                    callback: dojoLang.hitch(this, function(form) {
                        logger.debug(this.id + '._loadPage page load. ' + form.id);
                    })
                });
            }
            this.contentSet = true;
        },

        _setButtonTop: function() {
            if (typeof(window.slideoutstorage) !== 'undefined' && window.slideoutstorage.length > 1) {
                var array = this._sortArrayObj(window.slideoutstorage);
                var totalTop = this.topPosition;
                for (var j = 0; j < array.length; j++) {
                    var item = array[j];
                    if (item.control.offsetWidth > 0) {
                        var top = ((item.control.offsetWidth / 2) + totalTop);
                        item.control.style.top = top + "px";
                        item.toppos = top;
                        totalTop = totalTop + item.control.offsetWidth + 5;
                    }
                    console.log("Core." + this.id + "._setButtonTop for id " + item.id + " totaltop: " + totalTop + " button width: " + item.control.offsetWidth);
                }
            } else {
                var top = ((this.slidecontrol.offsetWidth / 2) + this.topPosition) + "px";
                this.slidecontrol.style.top = top;
            }
        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function() {
            $(window).off("click");
            if (typeof window.slideoutstorage !== 'undefined') {
                var index = window.slideoutstorage.indexOf(this._params);
                if (index > -1) {
                    window.slideoutstorage.splice(index, 1);
                }
                console.log(this.id + ".uninitialize params found at: " + index + " for length: " + window.slideoutstorage.length);
            }
            if (this.contentDisplay) {
                console.log(this.id + ".uninitialize hide all content");
                this._setStyleText(this.slidecontent, "display:none;");
                this._setStyleText(this.slidecontrol, "display:none;");
                this._setStyleText(this.slidecontainer, "display:none;");
            }
            this.slidecontrol.innerHTML = "";
            this._setButtonTop();
        },

        //        uninitialize: function () {
        //            logger.debug(this.id + ".uninitialize");
        //            if (this._handle !== null) {
        //                mx.data.unsubscribe(this._handle);
        //            }
        //
        //            if (this._tooltipNode) {
        //                domConstruct.destroy(this._tooltipNode);
        //            }
        //        },

        _sortArrayObj: function(values) {
            logger.debug(this.id + "._sortArrayObj");
            return values.sort(dojoLang.hitch(this, function(a, b) {
                var aa = +(a.sorting),
                    bb = +(b.sorting);
                if (aa > bb) {
                    return 1;
                }
                if (aa < bb) {
                    return -1;
                }
                // a must be equal to b
                return 0;
            }));
        },

        _executeMicroflow: function(mf, callback, obj) {
            logger.debug(this.id + "._executeMicroflow");
            var _params = {
                applyto: "selection",
                actionname: mf,
                guids: []
            };

            if (obj === null) {
                obj = this._data.object;
            }

            if (obj && obj.getGuid()) {
                _params.guids = [obj.getGuid()];
            }

            mx.data.action({
                params: _params,
                store: {
                    caller: this.mxform
                },
                callback: dojoLang.hitch(this, function(obj) {
                    if (typeof callback === "function") {
                        callback(obj);
                    }
                }),
                error: dojoLang.hitch(this, function(error) {
                    console.log(this.id + "._executeMicroflow error: " + error.description);
                })
            }, this);
        }

    });
});
