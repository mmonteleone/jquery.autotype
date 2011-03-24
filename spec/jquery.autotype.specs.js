QUnit.specify("jQuery.autotype", function() {
    var specification = function() {
        // stub global with interval setting and clearing provided by 
        // DeLorean time-mocking library instead of browser window.
        var fakeGlobal = {
            setInterval: DeLorean.setInterval,
            clearInterval: DeLorean.clearInterval
        };

        // shortcut for building up and breaking down stub forms
        var FormBuilder = {
            clear: function(){
                $('div#testbed form').empty();
            },
            addTextInput: function(name, value){
                var input = $('<input class="test" type="text" id="' + name + '" name="' + name + '" value="' + value + '" />');
                $('div#testbed form').append(input);
                return input;
            },
            addTextArea: function(name, value){
                var input = $('<textarea class="test" name="' + name + '" id="' + name + '">' + value + '</textarea>');
                $('div#testbed form').append(input);
                return input;
            }
        };

        describe('jQuery.fn.autotype', function(){
            var log = [];
            before(function(){
                FormBuilder.addTextArea('text1','');
                $('textarea').keydown(function(e){ logEvent(e, this); })
                    .keypress(function(e){ logEvent(e, this); })
                    .keyup(function(e){ logEvent(e, this); });
            });
            after(function(){
                FormBuilder.clear();
                log = [];
            });
            var logEvent = function(e, field) {
                log.push({
                    type: e.type,
                    value: $(field).val(),
                    event: e
                });
            };

            it('should throw an exception if not passed a value', function(){
                assert(function(){
                    $('textarea').autotype();                
                }).throwsException('Value is required by jQuery.autotype plugin');          
                assert(function(){
                    $('textarea').autotype(null);
                }).throwsException('Value is required by jQuery.autotype plugin');          
            });  
            it('should return original selection', function(){
                var selection = $('textarea');
                var result = selection.autotype('ab');
                assert(result.length).equals(selection.length);
                assert(result.get(0)).isSameAs(selection.get(0));            
            });
            describe('defaults', function(){
                it("should have a default delay of 0", function(){
                    assert($.fn.autotype.defaults.delay).equals(0);                
                });
                it('should default to enUs keyBoard', function(){
                    assert($.fn.autotype.defaults.keyBoard).equals('enUs');                                
                });
                it('should contain an enUs keycode set', function(){
                    assert($.fn.autotype.defaults.keyCodes.enUs).isDefined();                
                });
            });
            describe('with plain text entry', function(){
                it('should trigger keydown,press,and up for each character', function(){
                    $('textarea').autotype('ab');
                    assert(log.length).equals(6);
                    assert(log[0].type).equals('keydown');
                    assert(log[1].type).equals('keypress');
                    assert(log[2].type).equals('keyup');
                    assert(log[3].type).equals('keydown');
                    assert(log[4].type).equals('keypress');
                    assert(log[5].type).equals('keyup');
                });
                it('should change value of input between keypress and keyup event', function(){
                    $('textarea').autotype('ab');
                    assert(log.length).equals(6);

                    assert(log[0].value).equals('');
                    assert(log[0].type).equals('keydown');

                    assert(log[1].value).equals('');
                    assert(log[1].type).equals('keypress');

                    assert(log[2].value).equals('a');
                    assert(log[2].type).equals('keyup');

                    assert(log[3].value).equals('a');
                    assert(log[3].type).equals('keydown');

                    assert(log[4].value).equals('a');
                    assert(log[4].type).equals('keypress');

                    assert(log[5].value).equals('ab');
                    assert(log[5].type).equals('keyup');                
                });
                it('should include which on down, up, and press event', function(){
                    $('textarea').autotype('a');
                    assert(log[0].event.which).equals(65);
                    assert(log[1].event.which).equals(97);
                    assert(log[2].event.which).equals(65);
                });
                it('should include keycode only on down and up event', function(){
                    $('textarea').autotype('a');
                    assert(log[0].event.keyCode).equals(65);
                    assert(log[1].event.keyCode).equals(0);
                    assert(log[2].event.keyCode).equals(65);
                });
                it('should include charcode only on press event', function(){
                    $('textarea').autotype('a');
                    assert(log[0].event.charCode).equals(0);
                    assert(log[1].event.charCode).equals(97);
                    assert(log[2].event.charCode).equals(0);
                });
                describe('when keydown is canceled', function(){
                    it('should still raise down,press,and up', function(){
                        // set up keydown to cancel propagation
                        $('textarea').keydown(function(){
                            return false;
                        })
                        $('textarea').autotype('a');
                        assert(log.length).equals(3);
                        assert(log[0].type).equals('keydown');
                        assert(log[1].type).equals('keypress');
                        assert(log[2].type).equals('keyup');
                    });
                    it('should not change value', function(){
                        // set up keydown to cancel propagation
                        $('textarea').keydown(function(){
                            return false;
                        })
                        $('textarea').autotype('a');
                        assert($('textarea').val()).equals('');
                    });
                });
                describe('when keypress is cancelled', function(){
                    it('should still raise down,press,and up', function(){
                        // set up keypress to cancel propagation
                        $('textarea').keypress(function(){
                            return false;
                        })
                        $('textarea').autotype('a');
                        assert(log.length).equals(3);
                        assert(log[0].type).equals('keydown');
                        assert(log[1].type).equals('keypress');
                        assert(log[2].type).equals('keyup');                    
                    });
                    it('should not change value', function(){
                        // set up keypress to cancel propagation
                        $('textarea').keypress(function(){
                            return false;
                        })
                        $('textarea').autotype('a');
                        assert($('textarea').val()).equals('');                    
                    });
                });
                describe('when keyup is cancelled', function(){
                    it('should still raise down, press, and up', function(){
                        // set up keyup to cancel propagation
                        $('textarea').keyup(function(){
                            return false;
                        })
                        $('textarea').autotype('a');
                        assert(log.length).equals(3);
                        assert(log[0].type).equals('keydown');
                        assert(log[1].type).equals('keypress');
                        assert(log[2].type).equals('keyup');                                        
                    });
                    it('should change value', function(){
                        // set up keyup to cancel propagation
                        $('textarea').keyup(function(){
                            return false;
                        })
                        $('textarea').autotype('a');
                        assert($('textarea').val()).equals('a');                    
                    });
                });
            });
            describe('with explicit control keys', function(){
                given(['pgup',33],['pgdn',34],['home',36],['end',35],['left',37],['right',39],['down',40],['up',38]).
                    it('should pass correct keycodes for non-modifier control keys', function(keyName, expectedKeyCode) {
                        $('textarea').autotype('{{' + keyName + '}}');
                        assert(log.length).equals(3);
                        assert(log[0].event.keyCode).equals(expectedKeyCode);
                        assert(log[2].event.keyCode).equals(expectedKeyCode);
                    });
                given(['pgup',33],['pgdn',34],['home',36],['end',35],['left',37],['right',39],['down',40],['up',38]).
                    it('should pass correct which codes for non-modifier control keys', function(keyName, expectedWhichCode) {
                        $('textarea').autotype('{{' + keyName + '}}');
                        assert(log.length).equals(3);
                        assert(log[0].event.which).equals(expectedWhichCode);
                        assert(log[2].event.which).equals(expectedWhichCode);
                    });
                describe('when contorl key is an enter', function(){
                    it('should add a newline to value', function(){
                        $('textarea').autotype('line1{{enter}}line2');
                        assert($('textarea').val()).equals("line1\nline2");
                    });              
                });
                describe('when control key is a back', function(){
                    it('should remove last character from value', function(){
                        $('textarea').autotype('hello  {{back}}there.{{back}}');
                        assert($('textarea').val()).equals("hello there");
                    });              
                });
                describe('when control keys are modifiers', function(){
                    given(['ctrl',17],['alt',18],['meta',224],['shift',16]).
                        it('should pass correct keycodes for modifier control keys upon their opening and include modifiers on event', function(keyName, expectedKeyCode) {
                            $('textarea').autotype('{{' + keyName + '}}');
                            assert(log.length).equals(1);
                            assert(log[0].event.keyCode).equals(expectedKeyCode);
                            // make sure ctrlKey, altKey, metaKey, and shiftKey are set to true on event
                            assert(log[0].event[keyName + 'Key']).isTrue();
                        });
                    given(['ctrl',17],['alt',18],['meta',224]).
                        it('should block change of value on subsequent character keys after non-shift modifier control keys, while still raising events and including modifiers in event', function(keyName, expectedKeyCode){
                            $('textarea').autotype('ab{{' + keyName + '}}cd');
                            assert(log.length).equals(13);
                            assert(log[6].event.keyCode).equals(expectedKeyCode);
                            assert($('textarea').val()).equals('ab');

                            // make sure ctrlKey, altKey, metaKey, and shiftKey are set to true
                            // on event and following keys' events
                            assert(log[6].event[keyName + 'Key']).isTrue();
                            assert(log[7].event[keyName + 'Key']).isTrue();

                            // ensure normal events raised on following keys, even though the value won't change
                            assert(log[7].type).equals('keydown');
                            assert(log[8].type).equals('keypress');
                            assert(log[9].type).equals('keyup');                        
                            assert(log[10].event[keyName + 'Key']).isTrue();
                            assert(log[10].type).equals('keydown');
                            assert(log[11].type).equals('keypress');
                            assert(log[12].type).equals('keyup');
                        });
                    given(['shift',16]).
                        it('should not block change of value on subsequent character keys after shift modifier key', function(keyName, expectedKeyCode){
                            $('textarea').autotype('ab{{' + keyName + '}}cd');
                            assert(log.length).equals(13);
                            assert(log[6].event.keyCode).equals(expectedKeyCode);
                            assert($('textarea').val()).equals('abCD');
                        });
                    given(['shift',16]).
                        it('should change case of following characters until un-shifted', function(keyName, expectedKeyCode){
                            $('textarea').autotype('ab{{' + keyName + '}}cd{{/' + keyName + '}}ef');
                            assert(log.length).equals(20);

                            // keydown of shift before 'cd'
                            assert(log[6].event.keyCode).equals(expectedKeyCode);
                            assert(log[6].type).equals('keydown');

                            // keyup of shift after 'cd'
                            assert(log[13].event.keyCode).equals(expectedKeyCode);
                            assert(log[13].type).equals('keyup');

                            assert($('textarea').val()).equals('abCDef');
                        });
                    given(['ctrl',17],['alt',18],['meta',224],['shift',16]).
                        it('should undo modifiers on key event upon release of modifier control keys', function(keyName, expectedKeyCode){
                            $('textarea').autotype('ab{{'+keyName+'}}cd{{/'+keyName+'}}ef');
                            assert(log.length).equals(20);

                            // keyup right before the keydown of modifier, should say the modifier is false                   
                            assert(log[5].event[keyName+'Key']).isFalse();

                            // now make sure all subsequent events include the modifier
                            assert(log[6].event[keyName+'Key']).isTrue();  // keydown of modifier
                            assert(log[7].event[keyName+'Key']).isTrue();  // c
                            assert(log[8].event[keyName+'Key']).isTrue();  // c
                            assert(log[9].event[keyName+'Key']).isTrue();  // c
                            assert(log[10].event[keyName+'Key']).isTrue(); // d
                            assert(log[11].event[keyName+'Key']).isTrue(); // d
                            assert(log[12].event[keyName+'Key']).isTrue(); // d

                            // keyup of modifier
                            assert(log[13].event[keyName+'Key']).isFalse();
                            assert(log[14].event[keyName+'Key']).isFalse();
                        });
                    given(['ctrl',17],['alt',18],['meta',224],['shift',16]).
                        it('should raise only keydown and keyup events on modifier keys', function(keyName, expectedKeyCode){
                            $('textarea').autotype('{{'+keyName+'}}{{/'+keyName+'}}');
                            assert(log.length).equals(2);
                            assert(log[0].type).equals('keydown');
                            assert(log[0].event.keyCode).equals(expectedKeyCode);
                            assert(log[1].type).equals('keyup');
                            assert(log[1].event.keyCode).equals(expectedKeyCode);
                        });                    
                    given(['ctrl',17],['alt',18],['meta',224],['shift',16]).
                        it('should only raise keydown on modifier key opening', function(keyName, expectedKeyCode){
                            $('textarea').autotype('a{{'+keyName+'}}');
                            assert(log.length).equals(4);
                            assert(log[3].type).equals('keydown');
                            assert(log[3].event.keyCode).equals(expectedKeyCode);
                        });
                    given(['ctrl',17],['alt',18],['meta',224],['shift',16]).
                        it('should only raise keyup on modifier key closing', function(keyName, expectedKeyCode){
                            $('textarea').autotype('a{{/'+keyName+'}}');
                            assert(log.length).equals(4);
                            assert(log[3].type).equals('keyup');
                            assert(log[3].event.keyCode).equals(expectedKeyCode);
                        });
                });
            });
            describe('with implicit control keys', function(){
                it('should register shift key downs and ups around implicit changings of case of input text', function(){
                    $('textarea').autotype('HeLLo');
                    assert(log.length).equals(19);
                    assert($('textarea').val()).equals('HeLLo');
                    assert(log[0].type).equals('keydown'); // shift down
                    assert(log[1].type).equals('keydown');// h down
                    assert(log[2].type).equals('keypress');  // h press
                    assert(log[3].type).equals('keyup');  // h up
                    assert(log[4].type).equals('keyup');  // shift up
                    assert(log[5].type).equals('keydown');  // e down
                    assert(log[8].type).equals('keydown');  // shift down
                    assert(log[9].type).equals('keydown');  // l down
                    assert(log[10].type).equals('keypress');  // l press
                    assert(log[11].type).equals('keyup');  // l up
                    assert(log[12].type).equals('keydown');  // l down
                    assert(log[13].type).equals('keypress');  // l press
                    assert(log[14].type).equals('keyup');  // l up
                    assert(log[15].type).equals('keyup');  // shift down                
                });
            });
            describe('event model', function(){
                it("should raise 'autotyped' event at end of non-delayed entry", function(){
                    var autotypedRaised = false;
                    $('textarea').bind('autotyped', function(){
                        autotypedRaised = true;
                    })
                    $('textarea').autotype('abcd');
                    assert(autotypedRaised).isTrue();
                });
                it("should raise 'autotyped' event at end of delayed entry", function(){
                    var autotypedRaised = false;
                    $('textarea').bind('autotyped', function(){
                        autotypedRaised = true;
                    })
                    $('textarea').autotype('abcd', {delay: 20, global: fakeGlobal});

                    // at 75 ms, shouldn't have quite finished the last character
                    DeLorean.advance(75);
                    assert(autotypedRaised).isFalse();

                    // at 81, should have finished
                    DeLorean.advance(6);
                    assert(autotypedRaised).isTrue();                
                });
            });
            describe('delays', function(){
                it('should type content immediately, synchronously when delay is 0', function(){
                    $('textarea').autotype('abcd', {delay: 0, global: fakeGlobal});
                    assert($('textarea').val()).equals('abcd');
                });
                it('should iteratively type each character when delay is 20', function(){
                    var autotypedRaised = false;
                    $('textarea').bind('autotyped', function(){
                        autotypedRaised = true;
                    })
                    $('textarea').autotype('abcd', {delay: 10, global: fakeGlobal});
                    assert($('textarea').val()).equals('');
                    DeLorean.advance(1);

                    DeLorean.advance(10);
                    assert($('textarea').val()).equals('a');

                    DeLorean.advance(10);
                    assert($('textarea').val()).equals('ab');

                    DeLorean.advance(10);
                    assert($('textarea').val()).equals('abc');

                    assert(autotypedRaised).isFalse();

                    DeLorean.advance(10);
                    assert($('textarea').val()).equals('abcd');
                    assert(autotypedRaised).isTrue();
                });
            });
        });
    };    
    
    /**
     * naive replication of $.each since 
     * jquery is not defined at this point
     */
    var each = function(items, fn) {
        for(var i=0;i<items.length;i++) {
            var item = items[i];
            fn(item);
        };
    };
    
    /**
     * run entire test suite against multiple loaded versions
     * of jquery.
     * 
     * Assumes they have each been loaded and set to notConflict(true)
     * aliased as jq14, jq13, etc.
     */
    each(["1.3.2","1.4.1","1.4.2","1.5.1"], function(version) {
        describe("in jQ " + version, function(){
            $ = jQuery = window['jq_' + version.replace(/\./g,'_')];
            specification();                    
        });        
    });    
});
