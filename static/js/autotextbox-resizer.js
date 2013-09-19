/*
 * jQuery autoResize (textarea auto-resizer)
 * @copyright James Padolsey http://james.padolsey.com
 * @version 1.04
 */
(function($){
    $.fn.autoResize = function(options) {
        var settings = $.extend({
            onResize : function(){},
            animate : true,
            animateDuration : 100,
            animateCallback : function(){},
            extraSpace : 12
        }, options);
        this.filter('textarea').each(function(){
            if ($(this).data("initialized")) return;
            $(this).data("initialized", true);
            var textarea = $(this).css({resize:'none','overflow-y':'hidden'}),
                origHeight = textarea.height() - settings.extraSpace,
                clone = (function(){
                    var props = ['height','width','lineHeight','textDecoration','letterSpacing'],
                        propOb = {};
                    $.each(props, function(i, prop){
                        propOb[prop] = textarea.css(prop);
                    });
                    return textarea.clone().removeAttr('id').removeAttr('name').css({
                        position: 'absolute',
                        top: 0,
                        left: -9999
                    }).css(propOb).attr('tabIndex','-1').insertBefore(textarea);
                })(),
                lastScrollTop = null,
                updateSize = function() {
                    clone.height(0).val(textarea.val()).scrollTop(10000);
                    var scrollTop = Math.max(clone.scrollTop(), origHeight) + settings.extraSpace,
                        toChange = textarea.add(clone);
                    if (lastScrollTop === scrollTop) { return; }
                    lastScrollTop = scrollTop;
                    settings.onResize.call(this);
                    settings.animate && textarea.css('display') === 'block' ?
                        toChange.stop().animate({height:scrollTop}, settings.animateDuration, settings.animateCallback)
                        : toChange.height(scrollTop);
                };
            textarea
                .unbind('.dynSiz')
                .bind('keyup.dynSiz', updateSize)
                .bind('keydown.dynSiz', updateSize)
                .bind('change.dynSiz', updateSize);
            updateSize();
        });
        return this;
    };
})(jQuery);