/*
 * Selecter Plugin [Formtone Library]
 * @author Ben Plum
 * @version 1.9.7
 *
 * Copyright © 2013 Ben Plum <mr@benplum.com>
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

if (jQuery) (function($) {

    // Mobile Detect
    var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
        isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test( (navigator.userAgent||navigator.vendor||window.opera) );

    // Default Options
    var options = {
        callback: null,
        cover: false,
        customClass: "",
        defaultLabel: false,
        externalLinks: false,
        links: false,
        trimOptions: false
    };

    // Identify each instance
    var guid = 0;

    // Public Methods
    var pub = {

        // Set Defaults
        defaults: function(opts) {
            options = $.extend(options, opts || {});
            return $(this);
        },

        // Disable field
        disable: function() {
            var $items = $(this);
            for (var i = 0, count = $items.length; i < count; i++) {
                var $target = $items.eq(i);
                var $selecter = $target.next(".selecter");

                if ($selecter.hasClass("open")) {
                    $selecter.find(".selecter-selected").trigger("click");
                }

                $target.prop("disabled", true);
                $selecter.addClass("disabled");
            }
            return $items;
        },

        callback: function(cb){
            $(this)[0].callback = cb
        },

        // Enable field
        enable: function() {
            var $items = $(this);
            for (var i = 0, count = $items.length; i < count; i++) {
                var $target = $items.eq(i);
                var $selecter = $target.next(".selecter");

                $target.prop("disabled", null);
                $selecter.removeClass("disabled");
            }
            return $items;
        },

        // Destroy selecter
        destroy: function() {
            var $items = $(this);
            for (var i = 0, count = $items.length; i < count; i++) {
                var $target = $items.eq(i);
                var $selecter = $target.next(".selecter");

                if ($selecter.hasClass("open")) {
                    $selecter.find(".selecter-selected").trigger("click");
                }

                // Scroller support
                if ($.fn.scroller != undefined) {
                    $selecter.find(".selecter-options").scroller("destroy");
                }

                $target.off(".selecter")
                    .removeClass("selecter-element")
                    .show();
                $selecter.off(".selecter")
                    .remove();
            }
            return $items;
        }

    };

    // Private Methods

    // Initialize
    function _init(opts) {
        opts = opts || {};

        // Define settings
        var settings = $.extend({}, options, opts);

        // Apply to each element
        var $items = $(this);
        for (var i = 0, count = $items.length; i < count; i++) {
            _build($items.eq(i), settings);
        }
        return $items;
    }

    // Build each
    function _build($selectEl, opts) {
        if (!$selectEl.data("selecter")) {
            if (opts.externalLinks) {
                opts.links = true;
            }

            // Build options array
            var $allOptionEls = $selectEl.find("option, optgroup"),
                $optionEls = $allOptionEls.filter("option"),
                $originalOption = $optionEls.filter(":selected"),
                originalIndex = (opts.defaultLabel) ? -1 : $optionEls.index($originalOption),
                totalItems = $allOptionEls.length - 1,
                wrapperTag = (opts.links) ? "nav" : "div",
                itemTag = (opts.links) ? "a" : "span";

            opts.multiple = $selectEl.prop("multiple");
            opts.disabled = $selectEl.is(":disabled");

            // Build HTML
            var html = '<' + wrapperTag + ' class="selecter ' + opts.customClass;
            // Special case classes
            if (isMobile) {
                html += ' mobile';
            } else if (opts.cover) {
                html += ' cover';
            }
            if (opts.multiple) {
                html += ' multiple';
            } else {
                html += ' closed';
            }
            if (opts.disabled) {
                html += ' disabled';
            }
            html += '">';
            if (!opts.multiple) {
                html += '<div class="selecter-selected">';
                html += _checkLength(opts.trimOptions, ((opts.defaultLabel != false) ? opts.defaultLabel : $originalOption.text()));
                html += '</div>';
            }
            html += '<div class="selecter-options">';
            var j = 0;
            var $op = null;
            for (var i = 0, count = $allOptionEls.length; i < count; i++) {
                $op = $($allOptionEls[i]);
                // Option group
                if ($op[0].tagName == "OPTGROUP") {
                    html += '<span class="selecter-group">' + $op.attr("label") + '</span>';
                } else {
                    html += '<' + itemTag + ' class="selecter-item';
                    // Default selected value - now handles multi's thanks to @kuilkoff
                    if ($op.is(':selected') && !opts.defaultLabel) {
                        html += ' selected';
                    }
                    // CSS styling classes - might ditch for pseudo selectors
                    if (i == 0) {
                        html += ' first';
                    }
                    if (i == totalItems) {
                        html += ' last';
                    }
                    html += '" ';
                    if (opts.links) {
                        html += 'href="' + $op.val() + '"';
                    } else {
                        html += 'data-value="' + $op.val() + '"';
                    }
                    html += '>' + _checkLength(opts.trimOptions, $op.text()) + '</' + itemTag + '>';
                    j++;
                }
            }
            html += '</div>';
            html += '</' + wrapperTag + '>';

            // Modify DOM
            $selectEl.addClass("selecter-element")
                .after(html);

            // Store plugin data
            var $selecter = $selectEl.next(".selecter");
            var data = $.extend({
                $selectEl: $selectEl,
                $optionEls: $optionEls,
                $selecter: $selecter,
                $selected: $selecter.find(".selecter-selected"),
                $itemsWrapper: $selecter.find(".selecter-options"),
                $items: $selecter.find(".selecter-item"),
                index: originalIndex,
                guid: guid
            }, opts);

            // Scroller support
            if ($.fn.scroller != undefined) {
                data.$itemsWrapper.scroller();
            }

            // Bind click events
            $selecter.on("click.selecter", ".selecter-selected", data, _handleClick)
                .on("click.selecter", ".selecter-item", data, _select)
                .on("selecter-close", data, _close)
                .data("selecter", data);

            // Bind Blur/focus events
            if ((!opts.links && !isMobile) || isMobile) {
                $selectEl.on("change", data, _change)
                    .on("blur.selecter", data, _blur);
                if (!isMobile) {
                    $selectEl.on("focus.selecter", data, _focus);
                }
            } else {
                // Disable browser focus/blur for jump links
                $selectEl.hide();
            }

            guid++;
        }
    }

    // Handle Click
    function _handleClick(e) {
        e.preventDefault();
        e.stopPropagation();

        var data = e.data;

        if (!data.$selectEl.is(":disabled")) {
            $(".selecter").not(data.$selecter).trigger("selecter-close", [data]);

            // Handle mobile
            if (isMobile) {
                var el = data.$selectEl[0];
                if (document.createEvent) { // All
                    var evt = document.createEvent("MouseEvents");
                    evt.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                    el.dispatchEvent(evt);
                } else if (element.fireEvent) { // IE
                    el.fireEvent("onmousedown");
                }
            } else {
                // Delegate intent
                if (data.$selecter.hasClass("closed")) {
                    _open(e);
                } else if (data.$selecter.hasClass("open")) {
                    _close(e);
                }
            }
        }
    }

    // Open Options
    function _open(e) {
        e.preventDefault();
        e.stopPropagation();

        var data = e.data;

        // Make sure it's not alerady open
        if (!data.$selecter.hasClass("open")) {
            var selectOffset = data.$selecter.offset();
            var bodyHeight = $("body").outerHeight();
            var optionsHeight = data.$itemsWrapper.outerHeight(true);

            // Calculate bottom of document if not mobile
            if (selectOffset.top + optionsHeight > bodyHeight && isMobile) {
                data.$selecter.addClass("bottom");
            } else {
                data.$selecter.removeClass("bottom");
            }

            data.$itemsWrapper.show();

            // Bind Events
            data.$selecter.removeClass("closed").addClass("open");
            $("body").on("click.selecter-" + data.guid, ":not(.selecter-options)", data, _closeListener);
            //.on("keydown.selecter-" + data.guid, data, _keypress);

            if ($.fn.scroller != undefined) {
                data.$itemsWrapper.scroller("reset");
            }
        }
    }

    // Close Options
    function _close(e) {
        e.preventDefault();
        e.stopPropagation();

        var data = e.data;

        // Make sure it's actually open
        if (data.$selecter.hasClass("open")) {
            data.$itemsWrapper.hide();
            data.$selecter.removeClass("open").addClass("closed");
            $("body").off(".selecter-" + data.guid);
        }
    }

    // Close listener
    function _closeListener(e) {
        e.preventDefault();
        e.stopPropagation();

        if ($(e.currentTarget).parents(".selecter").length == 0) {
            _close(e);
        }
    }

    // Select option
    function _select(e) {
        e.preventDefault();
        e.stopPropagation();

        var $target = $(this);
        var data = e.data;

        if (!data.$selectEl.is(":disabled")) {
            if (data.links) {
                // Open link
                _launch($target.attr("href"), data.externalLinks);
            } else {
                if (data.$itemsWrapper.is(":visible")) {
                    // Update
                    var index = data.$items.index($target);
                    _update(index, data, false);
                }
            }

            if (!data.multiple) {
                // Clean up
                _close(e);
            }
        }
    }

    // Handle outside changes
    function _change(e, internal) {
        if (!internal) {
            var $target = $(this),
                data = e.data;

            // Mobile link support
            if (data.links) {
                _launch($target.attr("href"), data.externalLinks);
            } else {
                // Otherwise update
                var index = data.$optionEls.index(data.$optionEls.filter("[value=" + $target.val() + "]"));
                _update(index, data, false);
            }
        }
    }

    // Handle focus
    function _focus(e) {
        e.preventDefault();
        e.stopPropagation();

        var data = e.data;

        if (!data.$selectEl.is(":disabled") && !data.multiple) {
            data.$selecter.addClass("focus");
            $(".selecter").not(data.$selecter).trigger("selecter-close", [data]);
            $("body").on("keydown.selecter-" + data.guid, data, _keypress);
        }
    }

    // Handle blur
    function _blur(e) {
        e.preventDefault();
        e.stopPropagation();

        var data = e.data;
        data.$selecter.removeClass("focus");
        $(".selecter").not(data.$selecter).trigger("selecter-close", [data]);
        $("body").off(".selecter-" + data.guid);
    }

    // Handle keydown on focus
    function _keypress(e) {
        // Ignore modifiers & tabs
        if (e.keyCode != 9 && (!e.metaKey && !e.altKey && !e.ctrlKey && !e.shiftKey)) {
            e.preventDefault();
            e.stopPropagation();

            var data = e.data;
            var total = data.$items.length - 1;
            var index = -1;

            // Firefox left/right support thanks to Kylemade
            if ($.inArray(e.keyCode, (isFirefox) ? [38, 40, 37, 39] : [38, 40]) > -1) {
                // Increment / decrement using the arrow keys
                index = data.index + ((e.keyCode == 38 || (isFirefox && e.keyCode == 37)) ? -1 : 1);
                if (index < 0) {
                    index = 0;
                }
                if (index > total) {
                    index = total;
                }
            } else {
                var input = String.fromCharCode(e.keyCode).toUpperCase();

                // Search for input from original index
                for (i = data.index + 1; i <= total; i++) {
                    var letter = data.$optionEls.eq(i).text().charAt(0).toUpperCase();
                    if (letter == input) {
                        index = i;
                        break;
                    }
                }

                // If not, start from the beginning
                if (index < 0) {
                    for (i = 0; i <= total; i++) {
                        var letter = data.$optionEls.eq(i).text().charAt(0).toUpperCase();
                        if (letter == input) {
                            index = i;
                            break;
                        }
                    }
                }
            }

            // Update
            if (index >= 0) {
                _update(index, data, true);
            }
            return false;
        }
    }

    // Update element value + DOM
    function _update(index, data, keypress) {
        var $item = data.$items.eq(index);

        // Make sure we have a new index to prevent false 'change' triggers
        if (!$item.hasClass("selected")) {
            var newLabel = $item.html();
            var newValue = $item.data("value");

            // Modify DOM
            if (data.multiple) {
                data.$optionEls.eq(index).prop("selected", true);
            } else {
                data.$selected.html(newLabel);
                data.$items.filter(".selected").removeClass("selected");
                if (!keypress || (keypress && !isFirefox)) {
                    data.$selectEl[0].selectedIndex = index;
                }
            }
            data.$selectEl.trigger("change", [ true ]);
            $item.addClass("selected");

            // Fire callback
            var callback = data.$selectEl[0].callback
            if(!callback){
                callback = data.callback
            }
            if(callback){
                callback.call(data.$selecter, data.$selectEl.val());
            }
            data.index = index;
        } else if (data.multiple) {
            data.$optionEls.eq(index).prop("selected", null);
            $item.removeClass("selected");
        }
    }

    // Check label's length
    function _checkLength(length, text) {
        if (length === false) {
            return text;
        } else {
            if (text.length > length) {
                return text.substring(0, length) + "...";
            } else {
                return text;
            }
        }
    }

    // Launch link
    function _launch(link, external) {
        if (external) {
            // Open link in a new tab/window
            window.open(link);
        } else {
            // Open link in same tab/window
            window.location.href = link;
        }
    }

    // Define Plugin
    $.fn.selecter = function(method) {
        if (pub[method]) {
            return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return _init.apply(this, arguments);
        }
        return this;
    };
})(jQuery);/**
 * Created with PyCharm.
 * User: tony
 * Date: 4/9/13
 * Time: 11:32 AM
 * To change this template use File | Settings | File Templates.
 */
