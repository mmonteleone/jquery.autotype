/**
 * jQuery.autotype.selection - Added right, left, and selection support to jQuery.autotype
 *
 * version 0.5.1
 * 
 * http://michaelmonteleone.net/projects/autotype
 * http://github.com/mmonteleone/jquery.autotype
 *
 * Copyright (c) 2013 Michael Monteleone
 * Licensed under terms of the MIT License (README.markdown)
 */
(function($){

    if($.fn.autotype === undefined) { throw("jQuery.autotype plugin is required by jQuery.autotype.selection plugin"); }

    var NON_CHARACTER = 2,
        selectionUpdateFieldValue = function(field, code) {
            var selection = getSelection(field),
                val = field.val(),
                prefix,
                suffix;
            
            if (selection < val.length) {
                prefix = val.substring(0, selection);
                suffix = val.substring(selection);
            } else {
                prefix = val;
                suffix = '';
            }
            
            if (code.type === NON_CHARACTER) {
                switch (code.controlKeyName) {
                case 'enter':
                    prefix += "\n";
                    break;
                case 'back':
                    prefix = prefix.substring(0, prefix.length - 1);
                    break;
                case 'left':
                    if (selection > 0) {
                        setSelection(field, selection - 1);
                    }
                    return;
                case 'right':
                    if (val.length > selection) {
                        setSelection(field, selection + 1);
                    }
                    return;
                }
            } else {
                prefix += code.char;
            }

            field.val(prefix + suffix);
            setSelection(field, prefix.length);
        },
        getSelection = function(els) {
            // http://stackoverflow.com/questions/1891444/how-can-i-get-cursor-position-in-a-textarea

            var el = els.get(0),
                pos = 0;

            if ('selectionStart' in el) {
                pos = el.selectionStart;
            } else if ('selection' in document) {
                el.focus();
                var sel = document.selection.createRange(),
                    selLength = sel.text.length;
                sel.moveStart('character', -el.value.length);
                pos = sel.text.length - selLength;
            }
            
            return pos;
        },
        setSelection = function(els, start, end) {
            // http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
            
            if (!end) { end = start; }
            return els.each(set);
            
            function set() {
                if (this.setSelectionRange) {
                    this.focus();
                    this.setSelectionRange(start, end);
                } else if (this.createTextRange) {
                    var range = this.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', end);
                    range.moveStart('character', start);
                    range.select();
                }
            }
        };

    $.fn.autotype.defaults.updateFieldValue = selectionUpdateFieldValue;

})(jQuery);
