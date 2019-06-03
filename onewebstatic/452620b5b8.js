window.oldjQuery = window.jQuery;
window.jQuery = window.oneJQuery;
/*---------------------------------------------------------------------------------------------

@author       Constantin Saguin - @brutaldesign
@link            http://csag.co
@github        http://github.com/One-com/shinybox
@version     1.2.1
@license      MIT License

----------------------------------------------------------------------------------------------*/
(function (window, document, $) {
    $.shinybox = function (elem, options) {
        var defaults = {
                useCSS: true,
                initialIndexOnArray: 0,
                hideBarsDelay: 3000,
                videoMaxWidth: 1140,
                vimeoColor: 'CCCCCC',
                beforeOpen: null,
                afterClose: null,
                sort: null,
                closePlacement: 'bottom',
                captionPlacement: 'top',
                navigationPlacement: 'bottom'
            }, plugin = this, elements = [], $elem, selector = elem.selector, $selector = $(selector), isTouch = typeof document.createTouch !== 'undefined' || 'ontouchstart' in window || 'onmsgesturechange' in window || navigator.msMaxTouchPoints, supportSVG = !!window.SVGSVGElement, winWidth = window.innerWidth ? window.innerWidth : $(window).width(), winHeight = window.innerHeight ? window.innerHeight : $(window).height(), html = '', id = 'shinybox-overlay';
        plugin.settings = {};
        plugin.init = function () {
            plugin.settings = $.extend({}, defaults, options);
            var htmlTop = '', htmlBottom = '';
            if (plugin.settings.sort) {
                $selector.sort(plugin.settings.sort);
            }
            if (plugin.settings.closePlacement === 'top') {
                htmlTop += '<a class="shinybox-close"></a>';
            } else if (plugin.settings.closePlacement === 'bottom') {
                htmlBottom += '<a class="shinybox-close"></a>';
            }
            if (plugin.settings.captionPlacement === 'top') {
                htmlTop += '<div class="shinybox-caption"></div>';
            } else if (plugin.settings.captionPlacement === 'bottom') {
                htmlBottom += '<div class="shinybox-caption"></div>';
            }
            if (plugin.settings.navigationPlacement === 'top') {
                htmlTop += '<a class="shinybox-prev"></a>' + '<a class="shinybox-next"></a>';
            } else if (plugin.settings.navigationPlacement === 'bottom') {
                htmlBottom += '<a class="shinybox-prev"></a>' + '<a class="shinybox-next"></a>';
            }
            id = plugin.settings.id || id;
            html = '<div id="' + id + '" class="shinybox-overlay">' + '<div class="shinybox-slider"></div>' + '<div class="shinybox-top">' + htmlTop + '</div>' + '<div class="shinybox-bottom">' + htmlBottom + '</div>' + '</div>';
            if ($.isArray(elem)) {
                elements = elem;
                ui.target = $(window);
                ui.init(plugin.settings.initialIndexOnArray);
            } else {
                $selector.click(function (e) {
                    elements = [];
                    var index, relType, relVal;
                    if (!relVal) {
                        relType = 'rel';
                        relVal = $(this).attr(relType);
                    }
                    if (relVal && relVal !== '' && relVal !== 'nofollow') {
                        $elem = $selector.filter('[' + relType + '="' + relVal + '"]');
                    } else {
                        $elem = $(selector);
                    }
                    $elem.each(function () {
                        var title = null, href = null;
                        if ($(this).attr('title')) {
                            title = $(this).attr('title');
                        }
                        if ($(this).attr('href')) {
                            href = $(this).attr('href');
                        }
                        elements.push({
                            href: href,
                            title: title
                        });
                    });
                    index = $elem.index($(this));
                    e.preventDefault();
                    e.stopPropagation();
                    ui.target = $(e.target);
                    ui.init(index);
                });
            }
        };
        plugin.refresh = function () {
            if (!$.isArray(elem)) {
                ui.destroy();
                $elem = $(selector);
                ui.actions();
            }
        };
        var ui = {
            init: function (index) {
                if (plugin.settings.beforeOpen)
                    plugin.settings.beforeOpen();
                this.target.trigger('shinybox-start');
                $.shinybox.isOpen = true;
                this.build();
                this.openSlide(index);
                this.openMedia(index);
                this.preloadMedia(index + 1);
                this.preloadMedia(index - 1);
            },
            build: function () {
                var $this = this;
                $('body').append(html);
                if ($this.doCssTrans()) {
                    $('.shinybox-slider').css({
                        '-webkit-transition': 'left 0.4s ease',
                        '-moz-transition': 'left 0.4s ease',
                        '-o-transition': 'left 0.4s ease',
                        '-khtml-transition': 'left 0.4s ease',
                        'transition': 'left 0.4s ease'
                    });
                    $('.shinybox-overlay').css({
                        '-webkit-transition': 'opacity 1s ease',
                        '-moz-transition': 'opacity 1s ease',
                        '-o-transition': 'opacity 1s ease',
                        '-khtml-transition': 'opacity 1s ease',
                        'transition': 'opacity 1s ease'
                    });
                    $('.shinybox-bottom, .shinybox-top').css({
                        '-webkit-transition': '0.5s',
                        '-moz-transition': '0.5s',
                        '-o-transition': '0.5s',
                        '-khtml-transition': '0.5s',
                        'transition': '0.5s'
                    });
                }
                if (supportSVG) {
                    var bg = $('.shinybox-close').css('background-image');
                    bg = bg.replace('png', 'svg');
                    $('.shinybox-prev,.shinybox-next,.shinybox-close').css({ 'background-image': bg });
                }
                $.each(elements, function () {
                    $('.shinybox-slider').append('<div class="slide"></div>');
                });
                $this.setDim();
                $this.actions();
                $this.keyboard();
                $this.gesture();
                $this.animBars();
                $this.resize();
            },
            setDim: function () {
                var width, height, sliderCss = {};
                if ('onorientationchange' in window) {
                    var calculateWidthAndHeight = function () {
                        width = window.innerWidth ? window.innerWidth : $(window).width();
                        height = window.innerHeight ? window.innerHeight : $(window).height();
                    };
                    calculateWidthAndHeight();
                    window.addEventListener('orientationchange', function () {
                        calculateWidthAndHeight();
                    }, false);
                } else {
                    width = window.innerWidth ? window.innerWidth : $(window).width();
                    height = window.innerHeight ? window.innerHeight : $(window).height();
                }
                sliderCss = {
                    width: width,
                    height: height
                };
                $('.shinybox-overlay').css(sliderCss);
                if (plugin.settings.hideBarsDelay === 0) {
                    $('.shinybox-slider').css({
                        top: '50px',
                        height: height - 100 + 'px'
                    });
                } else {
                    $('.shinybox-slider').css({
                        top: 0,
                        height: '100%'
                    });
                }
            },
            resize: function () {
                var $this = this;
                $(window).resize(function () {
                    $this.setDim();
                }).resize();
            },
            supportTransition: function () {
                var prefixes = 'transition WebkitTransition MozTransition OTransition msTransition KhtmlTransition'.split(' ');
                for (var i = 0; i < prefixes.length; i += 1) {
                    if (document.createElement('div').style[prefixes[i]] !== undefined) {
                        return prefixes[i];
                    }
                }
                return false;
            },
            doCssTrans: function () {
                if (plugin.settings.useCSS && this.supportTransition()) {
                    return true;
                }
            },
            gesture: function () {
                if (isTouch) {
                    var $this = this, distance = null, swipMinDistance = 10, startCoords = {}, endCoords = {};
                    var bars = $('.shinybox-top, .shinybox-bottom');
                    bars.addClass('visible-bars');
                    $this.setTimeout();
                    $('body').bind('touchstart', function (e) {
                        $(this).addClass('touching');
                        endCoords = e.originalEvent.targetTouches[0];
                        startCoords.pageX = e.originalEvent.targetTouches[0].pageX;
                        $('.touching').bind('touchmove', function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            endCoords = e.originalEvent.targetTouches[0];
                        });
                        return false;
                    }).bind('touchend', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        distance = endCoords.pageX - startCoords.pageX;
                        if (distance >= swipMinDistance) {
                            $this.getPrev();
                        } else if (distance <= -swipMinDistance) {
                            $this.getNext();
                        } else {
                            if (!bars.hasClass('visible-bars')) {
                                $this.showBars();
                                $this.setTimeout();
                            } else {
                                $this.clearTimeout();
                                $this.hideBars();
                            }
                        }
                        $('.touching').off('touchmove').removeClass('touching');
                    });
                }
            },
            setTimeout: function () {
                if (plugin.settings.hideBarsDelay > 0) {
                    var $this = this;
                    $this.clearTimeout();
                    $this.timeout = window.setTimeout(function () {
                        $this.hideBars();
                    }, plugin.settings.hideBarsDelay);
                }
            },
            clearTimeout: function () {
                window.clearTimeout(this.timeout);
                this.timeout = null;
            },
            showBars: function () {
                var bars = $('.shinybox-top, .shinybox-bottom');
                if (this.doCssTrans()) {
                    bars.addClass('visible-bars');
                } else {
                    $('.shinybox-top').animate({ top: 0 }, 500);
                    $('.shinybox-bottom').animate({ bottom: 0 }, 500);
                    setTimeout(function () {
                        bars.addClass('visible-bars');
                    }, 1000);
                }
            },
            hideBars: function () {
                var bars = $('.shinybox-top, .shinybox-bottom');
                if (this.doCssTrans()) {
                    bars.removeClass('visible-bars');
                } else {
                    $('.shinybox-top').animate({ top: '-50px' }, 500);
                    $('.shinybox-bottom').animate({ bottom: '-50px' }, 500);
                    setTimeout(function () {
                        bars.removeClass('visible-bars');
                    }, 1000);
                }
            },
            animBars: function () {
                var $this = this;
                var bars = $('.shinybox-top, .shinybox-bottom');
                bars.addClass('visible-bars');
                $this.setTimeout();
                $('.shinybox-slider').click(function (e) {
                    if (!bars.hasClass('visible-bars')) {
                        $this.showBars();
                        $this.setTimeout();
                    }
                });
                $('.shinybox-bottom').hover(function () {
                    $this.showBars();
                    bars.addClass('force-visible-bars');
                    $this.clearTimeout();
                }, function () {
                    bars.removeClass('force-visible-bars');
                    $this.setTimeout();
                });
            },
            keyboard: function () {
                var $this = this;
                $(window).bind('keydown', function (e) {
                    if (e.keyCode === 37 || e.keyCode === 8) {
                        e.preventDefault();
                        e.stopPropagation();
                        $this.getPrev();
                    } else if (e.keyCode === 39) {
                        e.preventDefault();
                        e.stopPropagation();
                        $this.getNext();
                    } else if (e.keyCode === 27) {
                        e.preventDefault();
                        e.stopPropagation();
                        $this.closeSlide();
                    }
                });
            },
            actions: function () {
                var $this = this;
                if (elements.length < 2) {
                    $('.shinybox-prev, .shinybox-next').hide();
                } else {
                    $('.shinybox-prev').bind('click touchend', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        $this.getPrev();
                        $this.setTimeout();
                    });
                    $('.shinybox-next').bind('click touchend', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        $this.getNext();
                        $this.setTimeout();
                    });
                }
                $('.shinybox-close').bind('click touchend', function (e) {
                    $this.closeSlide();
                });
                $('.shinybox-slider .slide').bind('click', function (e) {
                    if (e.target === this) {
                        $this.closeSlide();
                    }
                });
            },
            setSlide: function (index, isFirst) {
                isFirst = isFirst || false;
                var slider = $('.shinybox-slider');
                if (this.doCssTrans()) {
                    slider.css({ left: -index * 100 + '%' });
                } else {
                    slider.animate({ left: -index * 100 + '%' });
                }
                $('.shinybox-slider .slide').removeClass('current');
                $('.shinybox-slider .slide').eq(index).addClass('current');
                this.setTitle(index);
                if (isFirst) {
                    slider.fadeIn();
                }
                $('.shinybox-prev, .shinybox-next').removeClass('disabled');
                if (index === 0) {
                    $('.shinybox-prev').addClass('disabled');
                } else if (index === elements.length - 1) {
                    $('.shinybox-next').addClass('disabled');
                }
            },
            openSlide: function (index) {
                $('html').addClass('shinybox');
                $(window).trigger('resize');
                this.setSlide(index, true);
            },
            preloadMedia: function (index) {
                var $this = this, src = null;
                if (elements[index] !== undefined) {
                    src = elements[index].href;
                }
                if (!$this.isVideo(src)) {
                    setTimeout(function () {
                        $this.openMedia(index);
                    }, 300);
                } else {
                    $this.openMedia(index);
                }
            },
            openMedia: function (index) {
                var $this = this, src = null;
                if (elements[index] !== undefined) {
                    src = elements[index].href;
                }
                if (index < 0 || index >= elements.length) {
                    return false;
                }
                var $element = $('.shinybox-slider .slide').eq(index);
                if ($this.isVideo(src)) {
                    $element.html($this.getVideo(src));
                } else if ($this.isPDF(src)) {
                    $element.html($this.getPDF(src));
                } else {
                    $element.html('<div class="loading"></div>');
                    $this.loadMedia(src, function () {
                        $element.html(this);
                    });
                }
            },
            setTitle: function (index, isFirst) {
                var title = null;
                $('.shinybox-caption').empty();
                if (elements[index] !== undefined) {
                    title = elements[index].title;
                }
                if (title) {
                    $('.shinybox-caption').text(title);
                }
            },
            isPDF: function (src) {
                if (src) {
                    if (src.match(/\.pdf(?:\?|$)/)) {
                        return true;
                    }
                }
            },
            getPDF: function (url) {
                var iframe = '<iframe src="' + url + '">';
                return '<div class="shinybox-pdf-container"><div class="shinybox-pdf">' + iframe + '</div></div>';
            },
            isVideo: function (src) {
                if (src) {
                    if (src.match(/youtube\.com\/watch\?v=([a-zA-Z0-9\-_]+)/) || src.match(/vimeo\.com\/([0-9]*)/)) {
                        return true;
                    }
                }
            },
            getVideo: function (url) {
                var iframe = '';
                var output = '';
                var youtubeUrl = url.match(/watch\?v=([a-zA-Z0-9\-_]+)/);
                var vimeoUrl = url.match(/vimeo\.com\/([0-9]*)/);
                if (youtubeUrl) {
                    iframe = '<iframe width="560" height="315" src="//www.youtube.com/embed/' + youtubeUrl[1] + '" frameborder="0" allowfullscreen></iframe>';
                } else if (vimeoUrl) {
                    iframe = '<iframe width="560" height="315"  src="http://player.vimeo.com/video/' + vimeoUrl[1] + '?byline=0&amp;portrait=0&amp;color=' + plugin.settings.vimeoColor + '" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';
                }
                return '<div class="shinybox-video-container" style="max-width:' + plugin.settings.videomaxWidth + 'px"><div class="shinybox-video">' + iframe + '</div></div>';
            },
            loadMedia: function (src, callback) {
                if (!this.isVideo(src)) {
                    var img = $('<img>').on('load', function () {
                        callback.call(img);
                    });
                    img.attr('src', src);
                }
            },
            getNext: function () {
                var $this = this, index = $('.shinybox-slider .slide').index($('.shinybox-slider .slide.current'));
                if (index + 1 < elements.length) {
                    index += 1;
                    $this.setSlide(index);
                    $this.preloadMedia(index + 1);
                } else {
                    $('.shinybox-slider').addClass('rightSpring');
                    setTimeout(function () {
                        $('.shinybox-slider').removeClass('rightSpring');
                    }, 500);
                }
            },
            getPrev: function () {
                var index = $('.shinybox-slider .slide').index($('.shinybox-slider .slide.current'));
                if (index > 0) {
                    index -= 1;
                    this.setSlide(index);
                    this.preloadMedia(index - 1);
                } else {
                    $('.shinybox-slider').addClass('leftSpring');
                    setTimeout(function () {
                        $('.shinybox-slider').removeClass('leftSpring');
                    }, 500);
                }
            },
            closeSlide: function () {
                var that = this;
                setTimeout(function () {
                    $('html').removeClass('shinybox');
                    $(window).trigger('resize');
                    that.destroy();
                }, 0);
            },
            destroy: function () {
                $(window).unbind('keydown');
                $('body').unbind('touchstart');
                $('body').unbind('touchmove');
                $('body').unbind('touchend');
                $('.shinybox-slider').unbind();
                $('.shinybox-overlay').remove();
                if (!$.isArray(elem))
                    elem.removeData('_shinybox');
                if (this.target)
                    this.target.trigger('shinybox-destroy');
                $.shinybox.isOpen = false;
                if (plugin.settings.afterClose)
                    plugin.settings.afterClose();
            }
        };
        plugin.init();
    };
    $.fn.shinybox = function (options) {
        if (!$.data(this, '_shinybox')) {
            var shinybox = new $.shinybox(this, options);
            this.data('_shinybox', shinybox);
        }
        return this.data('_shinybox');
    };
}(window, document, jQuery));
(function ($) {
    $('.shinybox').each(function (index) {
        $(this).attr('data-dom-index', index);
    });
    $('.shinybox').shinybox({
        hideBarsDelay: 0,
        closePlacement: 'top',
        sort: function (a, b) {
            if ($(a).length) {
                var ap = $(a).offset(), bp = $(b).offset();
                if (ap.top - bp.top !== 0) {
                    return ap.top - bp.top;
                } else if (ap.left - bp.left !== 0) {
                    return ap.left - bp.left;
                } else {
                    return $(a).attr('data-dom-index') - $(b).attr('data-dom-index');
                }
            } else {
                return 1;
            }
        }
    });
}(oneJQuery));
window.jQuery = window.oldjQuery;
window.OnewebContactForm = function ($) {
    var ContactFormValidation;
    var htmlEncode = function (str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };
    ContactFormValidation = function (cfg) {
        try {
            this.init(cfg);
        } catch (e) {
            throw new Error('ContactForm Validation initialization failed');
        }
    };
    ContactFormValidation.prototype = {
        constructor: window.OnewebContactForm,
        init: function (cfg) {
            this.formDOMId = cfg.formDOMId;
            this.postURL = cfg.postURL;
            this.recipientEmail = decodeURIComponent(cfg.recipientEmail);
            this.successMessage = decodeURIComponent(cfg.successMessage);
            this.errorMessage = decodeURIComponent(cfg.errorMessage);
            this.formElementsErrorMessages = JSON.parse(cfg.formElementsErrorMessages);
            this.allFieldErrorMessage = JSON.parse(cfg.allFieldErrorMessage);
            this.emailRegex = new RegExp(cfg.emailRegex, 'i');
            this.urlRegex = new RegExp(cfg.urlRegex);
            this.numberRegex = /^[0-9+\(\)#\.\s]+$/;
            this.numberQuery = 'input[ctype="number"],input[type="number"]';
            this.previewMode = cfg.previewMode;
            this.attachSubmitEvent();
            this.attachNumberInputValidation();
            this.formFieldErrors = [];
            this.contactFormDOM = {};
            this.formData = {
                recipient: this.recipientEmail,
                email: this.recipientEmail,
                subject: decodeURIComponent(cfg.subject)
            };
            this.defaultFormData = $.extend({}, this.formData);
            this.originalCharset = this.getDocumentCharset();
            this.attachSubmitEvent();
        },
        attachSubmitEvent: function () {
            $('.oneWebCntForm input[type="submit"]').click($.proxy(this.validateForm, this));
        },
        attachNumberInputValidation: function () {
            var regex = this.numberRegex;
            $('.contact-form-field-container > ' + this.numberQuery).on('input', function () {
                var $this = $(this), value = $this.val();
                if (!regex.test(value)) {
                    var pattern = '[^' + regex.source.replace(/^\^\[(.*?)\]\+\$$/, '$1') + ']';
                    var newValue = value.replace(new RegExp(pattern, 'g'), '');
                    $this.val(newValue);
                }
            });
        },
        validateForm: function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.removeSuccessMessageOnFormFields($('#contactFormResponseContainer'));
            this.contactFormDOM = $('.oneWebCntForm');
            this.removeErrorMessageWarningOnFormFields(this.contactFormDOM);
            this.setDocumentCharset('ISO-8859-1');
            if (this.getFormValidationErrors(this.contactFormDOM) === 0) {
                this.updateFormData(this.contactFormDOM);
                if (this.isHiddenFieldEmpty() && !this.previewMode) {
                    this.postContactForm();
                    this.formData = $.extend(true, {}, this.defaultFormData);
                }
            } else {
                var errEl = $('.contact-form-field-container .error-message')[0];
                if (errEl) {
                    errEl.scrollIntoView();
                }
                this.setDocumentCharset(this.originalCharset);
                return false;
            }
        },
        removeErrorMessageWarningOnFormFields: function (formDOM) {
            $(formDOM).find('.error-message').remove();
        },
        removeSuccessMessageOnFormFields: function (successMsgDOM) {
            $(successMsgDOM).html('').removeClass('formSuccess');
        },
        getFormValidationErrors: function (formDOM) {
            var formFields = formDOM.find('.contact-form-field-container'), emailRegex = this.emailRegex, urlRegex = this.urlRegex, messageRegex = /^\S*/g, numberRegex = this.numberRegex, errors = 0;
            $.each(formFields, $.proxy(function (index, element) {
                var errorMessage = this.formElementsErrorMessages[index], inputFieldVal, errorFound = false, text;
                var $numberField = $(element).find(this.numberQuery), isNumberField = $numberField.length === 1;
                errorMessage = errorMessage && decodeURIComponent(errorMessage);
                if ($(element).find('input[type="text"]')[0] && !isNumberField && errorMessage) {
                    text = $.trim($(element).find('input[type="text"]').val());
                    if (!text.length && text.match(messageRegex)) {
                        errorFound = true;
                    }
                } else if ($(element).find('input[type="email"]')[0]) {
                    inputFieldVal = $(element).find('input[type="email"]').val();
                    if (errorMessage || inputFieldVal) {
                        errorMessage = errorMessage || decodeURIComponent(this.allFieldErrorMessage[index]);
                        if (!emailRegex.test(inputFieldVal)) {
                            errorFound = true;
                        }
                    }
                } else if ($(element).find('input[type="url"]')[0]) {
                    inputFieldVal = $(element).find('input[type="url"]').val();
                    if (errorMessage || inputFieldVal) {
                        errorMessage = errorMessage || decodeURIComponent(this.allFieldErrorMessage[index]);
                        if (!urlRegex.test(inputFieldVal) && !urlRegex.test('http://' + inputFieldVal)) {
                            errorFound = true;
                        }
                    }
                } else if (isNumberField) {
                    inputFieldVal = $numberField.val();
                    if (errorMessage || inputFieldVal) {
                        errorMessage = errorMessage || decodeURIComponent(this.allFieldErrorMessage[index]);
                        if (!inputFieldVal.match(numberRegex)) {
                            errorFound = true;
                        }
                    }
                } else if ($(element).find('input[type="tel"]')[0]) {
                    inputFieldVal = $(element).find('input[type="tel"]').val();
                    if (errorMessage || inputFieldVal) {
                        errorMessage = errorMessage || decodeURIComponent(this.allFieldErrorMessage[index]);
                        if (!inputFieldVal.match(numberRegex)) {
                            errorFound = true;
                        }
                    }
                } else if ($(element).find('input[type="checkbox"]').length > 0 && errorMessage) {
                    if (!$(element).find('input[type="checkbox"]:checked')[0]) {
                        errorFound = true;
                    }
                } else if ($(element).find('input[type="radio"]').length > 0 && errorMessage) {
                    if (!$(element).find('input[type="radio"]:checked')[0]) {
                        errorFound = true;
                    }
                } else if ($(element).find('textarea')[0] && errorMessage) {
                    text = $.trim($(element).find('textarea').val());
                    if (!text.length && text.match(messageRegex)) {
                        errorFound = true;
                    }
                } else if ($(element).find('select')[0] && errorMessage) {
                    var selectedValue = $(element).find('select').val();
                    if (!selectedValue && selectedValue !== '--') {
                        errorFound = true;
                    }
                }
                var errContainer = $(element).next();
                if (errorFound) {
                    errContainer.html(htmlEncode(errorMessage));
                    errors = errors + 1;
                } else {
                    errContainer.html('&nbsp;');
                }
            }, this));
            return errors;
        },
        updateFormData: function (formDOM) {
            var formFields = $(formDOM).find('.contact-form-field-container');
            $.each(formFields, $.proxy(function (index, element) {
                var labelName = $(element).find('label').text().replace(' *', '');
                if ($(element).find('input[type="text"]')[0] || $(element).find('input[type="url"]')[0] || $(element).find(this.numberQuery)[0] || $(element).find('input[type="tel"]')[0]) {
                    this.formData[labelName] = $(element).find('input').val();
                } else if ($(element).find('input[type="email"]')[0]) {
                    labelName = labelName === 'email' ? 'Email' : labelName;
                    if (!this.formData.replyto) {
                        this.formData.replyto = this.formData[labelName] = $(element).find('input').val();
                    } else {
                        this.formData[labelName] = $(element).find('input').val();
                    }
                } else if ($(element).find('input[type="checkbox"]:checked')[0]) {
                    this.formData[labelName] = $(element).find('input[type="checkbox"]:checked').map(function (index, ele) {
                        return $(ele).val();
                    }).get();
                } else if ($(element).find('input[type="radio"]:checked')[0]) {
                    this.formData[labelName] = $(element).find('input[type="radio"]:checked').val();
                } else if ($(element).find('select')[0]) {
                    this.formData[labelName] = $(element).find('select').val();
                } else if ($(element).find('textarea')[0]) {
                    this.formData[labelName] = $(element).find('textarea').val();
                }
            }, this));
        },
        getEncodedFormData: function () {
            var encodedFormData = '';
            for (var key in this.formData) {
                encodedFormData += unescape(encodeURIComponent(escape(key))).replace(/\+/g, '%2B') + '=' + unescape(encodeURIComponent(escape(this.formData[key]))).replace(/\+/g, '%2B') + '&';
            }
            encodedFormData = encodedFormData.substring(0, encodedFormData.length - 1);
            return encodedFormData;
        },
        isHiddenFieldEmpty: function () {
            return $(this.contactFormDOM).find('.oneweb-hidden-field>input').text() === '';
        },
        postContactForm: function () {
            $.ajax({
                type: 'POST',
                url: this.postURL,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                },
                data: this.getEncodedFormData(),
                success: $.proxy(this.ajaxSuccess, this),
                error: $.proxy(this.ajaxError, this)
            });
        },
        ajaxSuccess: function (responseText) {
            var responseStatus = $('#contactFormResponseContainer');
            if (/<title>\s*Error/i.test(responseText)) {
                $(responseStatus).html(htmlEncode(this.errorMessage)).addClass('formError').removeClass('formSuccess');
            } else {
                $(responseStatus).html(htmlEncode(this.successMessage)).addClass('formSuccess').removeClass('formError');
            }
            this.resetDocument();
        },
        ajaxError: function () {
            var responseStatus = $('#contactFormResponseContainer');
            $(responseStatus).html(this.errorMessage).addClass('formError');
        },
        resetDocument: function () {
            $(this.contactFormDOM).trigger('reset');
            this.setDocumentCharset(this.originalCharset);
        },
        getDocumentCharset: function () {
            return document.characterSet || document.charset;
        },
        setDocumentCharset: function (charset) {
            if (document.charset) {
                document.charset = charset;
            } else {
                document.characterSet = charset;
            }
        }
    };
    return ContactFormValidation;
}(oneJQuery);