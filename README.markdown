jQuery.autotype
===============
Simple, accurate, typing simulation plugin for [jQuery][3].  
[http://github.com/mmonteleone/jquery.autotype][0]  

The heck you say?
-----------------

[jQuery.autotype][0] allows for simple and realistic modification of text inputs and text areas just as if they were really being typed in, including all events that would be triggered with proper key and character codes.

**But can't jQuery already manually trigger events and change input values?**

**Yes, but...**

With out-of-the-box [jQuery][3], it's trivial to bind to `keydown`, `keypress`, and `keyup` events on inputs and textareas.  

    $('input,textarea').keypress(function(){ console.log('key pressed!'); });

It's just as trivial to manually trigger those events yourself, thereby executing all attached handlers.

    $('input,textarea').keypress();

Equally simple are the abilities to both read and modify the value of an input.

    console.log('current value is: ' + $('input').val());
    $('input').val('new value');

*But as it turns out*, if you want to simulate the *exact* sequence of events that would happen **if someone were to actually type "Hello" into the input**, it's more complex than simply `$('input').val('Hello');`.  The real sequence of events that would occur had this been typed by a real user, given that 'e' refers to the DOM events passed to the handlers:

  1. ***shift* key pressed down (`e.type: keydown, e.keyCode: 16, e.charCode: 0, e.shiftKey: true`)**
  2. *h* key pressed down (`e.type: keydown, e.keyCode: 72, e.charCode: 0, e.shiftKey: true`)
  3. *h* key being pressed (`e.type: keypress, e.keyCode: 0, e.charCode: 72, e.shiftKey: true`)
  4. *h* key released (`e.type: keyup, e.keyCode: 72, e.charCode: 0, e.shiftKey: true`)
  5. ***shift* key released (`e.type: keyup, e.keyCode: 16, e.charCode: 0, e.shiftKey: false`)**
  6. *e* key pressed down (`e.type: keydown, e.keyCode: 69, e.charCode: 0, e.shiftKey: false`)
  7. *e* key being pressed (`e.type: keypress, e.keyCode: 0, e.charCode: 101, e.shiftKey: false`)
  8. *e* key released (`e.type: keyup, e.keyCode: 69, e.charCode: 0, e.shiftKey: false`)
  9. *l* key pressed down (`e.type: keydown, e.keyCode: 76, e.charCode: 0, e.shiftKey: false`)
  10. *l* key being pressed (`e.type: keypress, e.keyCode: 0, e.charCode: 108, e.shiftKey: false`)
  11. *l* key released (`e.type: keyup, e.keyCode: 76, e.charCode: 0, e.shiftKey: false`)
  12. *l* key pressed down (`e.type: keydown, e.keyCode: 76, e.charCode: 0, e.shiftKey: false`)
  13. *l* key being pressed (`e.type: keypress, e.keyCode: 0, e.charCode: 108, e.shiftKey: false`)
  14. *l* key released (`e.type: keyup, e.keyCode: 76, e.charCode: 0, e.shiftKey: false`)
  15. *o* key pressed down (`e.type: keydown, e.keyCode: 79, e.charCode: 0, e.shiftKey: false`)
  16. *o* key being pressed (`e.type: keypress, e.keyCode: 0, e.charCode: 111, e.shiftKey: false`)
  17. *o* key released (`e.type: keyup, e.keyCode: 79, e.charCode: 0, e.shiftKey: false`)

**And so, jQuery.autotype allows for all of those events to happen properly:**  

    $('input').autotype('Hello');
    
*It also allows for much more, keep reading just a bit more.*
 
Well, that's nice I guess, but why?
-----------------------------------

**Testing.**  If nothing else, testing.  Autotype was originally written to facilitate unit testing of plugins that extend form fields in various ways by hooking their key events, etc.  Autotype makes it easier to simulate the true sequence of events against a form field with simple text rather than manually triggering events, changing the field value in proper increments, and so forth.  For example, autotype even correctly respects when `keydown` and `keypress` events' propagations are cancelled by client code, thereby not modifying the input's value for the cancelled keystroke.

FEATURES.  We got features.
---------------------------

Accurately simulates complete sequence of events that occurs during the manual entry of text to a form field, including:

* Correctly triggers `keydown`, `keypress`, and `keyup` events
* Correctly iteratively modifies the input's value, appending each new character after the `keypress` event, but before the `keyup` event.
* Correctly passes proper `keyCode` and `charCode` values (yes, they are sometimes different) within the simulated events.
* Correctly passes modifier key information (`altKey`, `ctrlKey`, `shiftKey`, `metaKey`) within the simulated events whenever a modifier key is active.
* Correctly raises modifier keys' events interlaced with character keys... i.e. for a capital 'H', it would raise `keydown` of *shift*, `keydown` of *h*, `keypress` of *h*, `keyup` of *h*, and finally `keyup` of *shift*.
  * within the events raised surrounding the simulation of the press of the 'h' key, the events' `shiftKey` attributes are properly set to `true`. 

Accurately respects cancellations of key event propagations by client code.  So, the following...
  
    // return false from keydown to cancel propagation
    $('input').keydown(function(){ return false; })
        .autotype('Hello');
                  
    // realistically results in no actual content added to the input,
    // while still correctly raising all keydown/press/up events.

Allows for explicit passing of control keys into the input text via a `{{keyname}}` syntax.  So...
  
    $('input').autotype('he{{shift}}ll{{/shift}}o there');
        
    // results in a value of "heLLo there".  Note the control key in this 
    // case, 'shift', is also a modifier, so it has a `{{shift}}` to 
    // `keydown` it, and a `{{/shift}}` to `keyup` it.

Also supports modifiers `alt`, `ctrl`, and `meta`.  When these are active, any character key events realistically don't modify the input's value, but do raise standard key events specifying the active state of the modifiers.
  
    $('input').autotype('he{{ctrl}}ll{{/ctrl}}o');
    
    // results in an input value of 'heo' since `ctrl` 
    // was held down while 'll' was typed.

Other special control keys can be passed too that aren't modifiers and can't be held/released like a shift

    // enter: results in a new line being added to the text area    
    $('textarea').autotype('line1 {{enter}} line2');
    
         
    // back: results in a back-spaced value of 'Hello' instead of 'Helloo'
    $('textarea').autotype('Helloo{{back}}');
         
Other control keys are fair game too, `f1`..`f12`, `up`, `down`, `left`, `right`, etc.  But as of now, these don't have a manipulative affect on the input's value.  They do still raise correct realistic events with proper keyCodes.  For a complete list, see the keyCode defaults listing in the bottom of the jQuery.autotype source.

For fun, allows for an optional millisecond-based delay between key entries
  
    $('input').autotype('Hello', {delay: 25});
    
    // results in a 25 millisecond delay between each character's entry into the input.

Raises an `autotyped` event on the input once an entire sequence completes.
  
    $('input').bind('autotyped', function(){
        alert("finished simulating the typing of 'Hello'!");
    }).autotype('Hello', {delay: 25});
        
    // the alert would occur after the 125 milliseconds it 
    // would have taken for the text to be typed.

Requirements, installation, and notes
-------------------------------------

jQuery.autotype requires:

  * [jQuery][3] 1.3.2 or greater

jQuery 1.4 is included with jQuery.autotype.

You can download the [zipped release][8] containing a minified build with examples and documentation or the development master with unit tests by cloning `git://github.com/mmonteleone/jquery.autotype.git`.

jQuery.autotype requires [jquery][3] 1.3.2 or greater, and and can be installed thusly 

    <script type="text/javascript" src="jquery-1.4.min.js"></script>
    <script type="text/javascript" src="jquery.autotype.min.js"></script>

jQuery.autotype includes a full unit test suite, and has been verified to work against Firefox 3.5, Safari 4, Internet Explorer 6,7,8, Chrome, and Opera 9 and 10.  Please feel free to test its suite against other browsers.

Complete API
------------

### Basic Usage

Within the `document.ready` event, call

    $('input,textarea').autotype('string of characters to type', options);
   
where options is an optional object literal of options.  

More complex strings of characters can be provided as well, including control characters.  *See the above feature list for more examples.*

    $('input,textarea').autotype('Hello There. {{enter}} My namm{{back}}e is {{shift}jonas{{/shift}}.');
    
would result in an input value of "Hello There. \n My name is JONAS" along with proper raising of key events for all character and control/modifier keys.

### Options

* **delay**: An optional delay, in milliseconds, between entry of characters (*default*: `0`)
        
        $('input').autotype('Hello', {delay: 30});
  
* **keyBoard**: name of international keyboard keyCode set to use (*default*: `'enUs'`)
* **keyCodes**: object literal of sets of keycodes.  By default, includes an `enUs` set.

### Events

* **autotyped**:  raised on the matched inputs after the entire string of characters is fully entered into the matched inputs (including all raised events and modifications of the input's value).

        $('input').bind('autotyped', function(){ alert('finished typing simulation!'); })
                  .autotype('Hello');

Still To do
-----------

The features currently listed are considered complete and fully tested, but there are more features planned that could help to make this even more realistic:

  * Respect for position of cursor when used with `left`, `right` control keys
  * Respect for properly cutting, copying, and pasting content within the input when their associated key combinations are specified via the input text.
  * Support for more key code sets.  Right now, it comes with support for a us-english keyboard code set.  


How to Contribute
-----------------

Development Requirements (for building and test running):

  * Ruby + Rake, PackR, rubyzip gems: for building and minifying
  * Java: if you want to test using the included [JsTestDriver][6] setup

Clone the source at `git://github.com/mmonteleone/jquery.autotype.git` and have at it.

The following build tasks are available:

    rake build     # builds package and minifies
    rake test      # runs jQuery.autotype specs against QUnit testrunner in default browser
    rake server    # downloads, starts JsTestDriver server, binds common browsers
    rake testdrive # runs jQuery.autotype specs against running JsTestDriver server
    rake release   # builds a releasable zip package

&lt;shameless&gt;Incidentally jQuery.autotype's unit tests use QUnit along with two of my other projects, [Pavlov][4], a behavioral QUnit extension and [DeLorean][9], a "flux capacitor" for accurately faking time-bound JavaScript (timeouts, intervals, and dates) &lt;/shameless&gt;

Changelog
---------

* 0.5.0 - Initial Release

License
-------

The MIT License

Copyright (c) 2009 Michael Monteleone, http://michaelmonteleone.net

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[0]: http://github.com/mmonteleone/jquery.autotype "jQuery.autotype"
[1]: http://michaelmonteleone.net "Michael Monteleone"
[3]: http://jquery.com "jQuery"
[4]: http://github.com/mmonteleone/pavlov "Pavlov"
[6]: http://code.google.com/p/js-test-driver/ "JsTestDriver"
[7]: http://github.com/mmonteleone/jquery.autotype/raw/master/jquery.autotype.js "raw autotype script"
[8]: http://cloud.github.com/downloads/mmonteleone/jquery.autotype/jquery.autotype.zip "jQuery.autotype Release"
[9]: http://github.com/mmonteleone/delorean "DeLorean"
