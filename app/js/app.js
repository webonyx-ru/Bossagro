'use strict';

(function () {

    function YOURAPPNAME(doc) {
        var _self = this;

        _self.doc = doc;
        _self.window = window;
        _self.html = _self.doc.querySelector('html');
        _self.body = _self.doc.body;
        _self.location = location;
        _self.hash = location.hash;
        _self.Object = Object;
        _self.scrollWidth = 0;

        _self.bootstrap();
    }

    YOURAPPNAME.prototype.bootstrap = function () {
        var _self = this;

        // Initialize window scollBar width
        _self.scrollWidth = _self.scrollBarWidth();
    };

    // Window load types (loading, dom, full)
    YOURAPPNAME.prototype.appLoad = function (type, callback) {
        var _self = this;

        switch (type) {
            case 'loading':
                if (_self.doc.readyState === 'loading') callback();

                break;
            case 'dom':
                _self.doc.onreadystatechange = function () {
                    if (_self.doc.readyState === 'complete') callback();
                };

                break;
            case 'full':
                _self.window.onload = function (e) {
                    callback(e);
                };

                break;
            default:
                callback();
        }
    };

    // Detect scroll default scrollBar width (return a number)
    YOURAPPNAME.prototype.scrollBarWidth = function () {
        var _self = this,
            outer = _self.doc.createElement("div");
        outer.style.visibility = "hidden";
        outer.style.width = "100px";
        outer.style.msOverflowStyle = "scrollbar";

        _self.body.appendChild(outer);

        var widthNoScroll = outer.offsetWidth;

        outer.style.overflow = "scroll";

        var inner = _self.doc.createElement("div");

        inner.style.width = "100%";
        outer.appendChild(inner);

        var widthWithScroll = inner.offsetWidth;

        outer.parentNode.removeChild(outer);

        return widthNoScroll - widthWithScroll;
    };

    YOURAPPNAME.prototype.initSwitcher = function () {
        var _self = this;

        var switchers = _self.doc.querySelectorAll('[data-switcher]');

        if (switchers && switchers.length > 0) {
            for (var i = 0; i < switchers.length; i++) {
                var switcher = switchers[i],
                    switcherOptions = _self.options(switcher.dataset.switcher),
                    switcherElems = switcher.children,
                    switcherTargets = _self.doc.querySelector('[data-switcher-target="' + switcherOptions.target + '"]').children;

                for (var y = 0; y < switcherElems.length; y++) {
                    var switcherElem = switcherElems[y],
                        parentNode = switcher.children,
                        switcherTarget = switcherTargets[y],
                        switcherNotActiveList = [];

                    if (switcherElem.classList.contains('active')) {
                        for (var z = 0; z < parentNode.length; z++) {
                            parentNode[z].classList.remove('active');
                            switcherTargets[z].classList.remove('active');
                        }
                        switcherElem.classList.add('active');
                        switcherTarget.classList.add('active');
                    } else switcherNotActiveList.push(y);

                    switcherElem.children[0].addEventListener('click', function (elem, target, parent, targets) {
                        return function (e) {
                            e.preventDefault();
                            if (!elem.classList.contains('active')) {
                                for (var z = 0; z < parentNode.length; z++) {
                                    parent[z].classList.remove('active');
                                    targets[z].classList.remove('active');
                                }
                                elem.classList.add('active');
                                target.classList.add('active');
                            }
                        };
                    }(switcherElem, switcherTarget, parentNode, switcherTargets));
                }

                if (switcherNotActiveList.length === switcherElems.length) {
                    switcherElems[0].classList.add('active');
                    switcherTargets[0].classList.add('active');
                }
            }
        }
    };

    YOURAPPNAME.prototype.str2json = function (str, notevil) {
        try {
            if (notevil) {
                return JSON.parse(str.replace(/([\$\w]+)\s*:/g, function (_, $1) {
                    return '"' + $1 + '":';
                }).replace(/'([^']+)'/g, function (_, $1) {
                    return '"' + $1 + '"';
                }));
            } else {
                return new Function("", "var json = " + str + "; return JSON.parse(JSON.stringify(json));")();
            }
        } catch (e) {
            return false;
        }
    };

    YOURAPPNAME.prototype.options = function (string) {
        var _self = this;

        if (typeof string != 'string') return string;

        if (string.indexOf(':') != -1 && string.trim().substr(-1) != '}') {
            string = '{' + string + '}';
        }

        var start = string ? string.indexOf("{") : -1,
            options = {};

        if (start != -1) {
            try {
                options = _self.str2json(string.substr(start));
            } catch (e) {}
        }

        return options;
    };

    YOURAPPNAME.prototype.popups = function (options) {
        var _self = this;

        var defaults = {
            reachElementClass: '.js-popup',
            closePopupClass: '.js-close-popup',
            currentElementClass: '.js-open-popup',
            changePopupClass: '.js-change-popup'
        };

        options = $.extend({}, options, defaults);

        var plugin = {
            reachPopups: $(options.reachElementClass),
            bodyEl: $('body'),
            topPanelEl: $('.top-panel-wrapper'),
            htmlEl: $('html'),
            closePopupEl: $(options.closePopupClass),
            openPopupEl: $(options.currentElementClass),
            changePopupEl: $(options.changePopupClass),
            bodyPos: 0
        };

        plugin.openPopup = function (popupName) {
            plugin.reachPopups.filter('[data-popup="' + popupName + '"]').addClass('opened');
            plugin.bodyEl.css('overflow-y', 'scroll');
            plugin.topPanelEl.css('padding-right', scrollSettings.width);
            plugin.htmlEl.addClass('popup-opened');
        };

        plugin.closePopup = function (popupName) {
            plugin.reachPopups.filter('[data-popup="' + popupName + '"]').removeClass('opened');
            setTimeout(function () {
                plugin.bodyEl.removeAttr('style');
                plugin.htmlEl.removeClass('popup-opened');
                plugin.topPanelEl.removeAttr('style');
            }, 500);
        };

        plugin.changePopup = function (closingPopup, openingPopup) {
            plugin.reachPopups.filter('[data-popup="' + closingPopup + '"]').removeClass('opened');
            plugin.reachPopups.filter('[data-popup="' + openingPopup + '"]').addClass('opened');
        };

        plugin.init = function () {
            plugin.bindings();
        };

        plugin.bindings = function () {
            plugin.openPopupEl.on('click', function (e) {
                e.preventDefault();
                var pop = $(this).attr('data-open-popup');
                plugin.openPopup(pop);
            });

            plugin.closePopupEl.on('click', function (e) {
                var pop;
                if (this.hasAttribute('data-close-popup')) {
                    pop = $(this).attr('data-close-popup');
                } else {
                    pop = $(this).closest(options.reachElementClass).attr('data-popup');
                }

                plugin.closePopup(pop);
            });

            plugin.changePopupEl.on('click', function (e) {
                var closingPop = $(this).attr('data-closing-popup');
                var openingPop = $(this).attr('data-opening-popup');

                plugin.changePopup(closingPop, openingPop);
            });

            plugin.reachPopups.on('click', function (e) {
                var target = $(e.target);
                var className = options.reachElementClass.replace('.', '');
                if (target.hasClass(className)) {
                    plugin.closePopup($(e.target).attr('data-popup'));
                }
            });
        };

        if (options) plugin.init();

        return plugin;
    };

    YOURAPPNAME.prototype.sliders = function () {
        $('.jq-partners-slider').owlCarousel({
            loop: true,
            navText: '',
            rewind: true,
            autoplay: true,
            smartSpeed: 800,
            dots: false,
            responsive : {
                0: {
                    items: 2,
                    nav: false,
                    dots: true,
                    mouseDrag: true,
                    touchDrag: true,
                    autoplayTimeout: 1500
                },
                500: {
                    dots: true,
                    nav: false,
                    items: 3
                },
                767: {
                    nav: true,
                    dots: false,
                    items: 5
                },
                991 : {
                    nav: true,
                    items: 7
                },
                1200 : {
                    items: 7,
                    nav: true,
                    mouseDrag: false,
                    touchDrag: false,
                    autoplayTimeout: 3000
                }
            }
        });

        $('.jq-articles-slider').owlCarousel({
            items: 2,
            loop: true,
            autoWidth: false,
            nav: true,
            navText: '',
            rewind: true,
            smartSpeed: 400,
            // autoplay: true,
            autoplayTimeout: 3000,
            slideBy: 2,
            margin: 20,
            responsive : {
                0: {
                    items: 1,
                    nav: false,
                    touchDrag: true,
                    mouseDrag: true,
                    slideBy: 1
                },
                767: {
                    items: 2,
                    nav: true,
                    touchDrag: false,
                    mouseDrag: false,
                    slideBy: 2
                }
            }
        });

        $('.jq-similar-articles-slider').owlCarousel({
            items: 3,
            loop: true,
            nav: false,
            margin: 20,
            responsive : {
                0 : {
                    items: 1
                },
                560 : {
                    items: 2
                },
                820 : {
                  items: 3
                },
                991 : {
                    items: 2
                },
                1200 : {
                    items: 3
                }
            }
        });

        $('.jq-redaction-slider').owlCarousel({
            items: 1,
            loop: true,
            nav: false,
            dots: true,
            autoplay: true
        })
    };

    YOURAPPNAME.prototype.headerImages = function () {
        var sliderImages = $('.jq-header-right');

        if ($( window ).width() > 991) {
            sliderImages.each(function () {
                var image = $(this).find('img.active'),
                    images = $(this).find('img'),
                    timeOut = parseInt($(this).attr('data-timeout')) * 350;
                setTimeout(function () {
                    setInterval(function () {
                        images.removeClass('active');
                        if (image.is(":last-child")) {
                            image = images.eq(0).addClass('active')
                        } else {
                            image = image.next().addClass('active')
                        }
                    }, 2000);
                }, timeOut);
            })
        }
    };

    YOURAPPNAME.prototype.socialButtons = function () {
        if (window.pluso)if (typeof window.pluso.start == "function") return;
        if (window.ifpluso==undefined) { window.ifpluso = 1;
            var d = document, s = d.createElement('script'), g = 'getElementsByTagName';
            s.type = 'text/javascript'; s.charset='UTF-8'; s.async = true;
            s.src = ('https:' == window.location.protocol ? 'https' : 'http')  + '://share.pluso.ru/pluso-like.js';
            var h=d[g]('body')[0];
            h.appendChild(s);
        }
    };

    var app = new YOURAPPNAME(document);

    app.appLoad('loading', function () {
        // App is loading... Paste your app code here. 4example u can run preloader event here and stop it in action appLoad dom or full
    });

    app.appLoad('dom', function () {
        // DOM is loaded! Paste your app code here (Pure JS code).
        // Do not use jQuery here cause external libs do not loads here...

        // app.initSwitcher(); // data-switcher="{target: 'anything'}" , data-switcher-target="anything"
    });

    app.appLoad('full', function (e) {
        // App was fully load! Paste external app source code here... 4example if your use jQuery and something else
        // Please do not use jQuery ready state function to avoid mass calling document event trigger!

        app.popups();
        app.sliders();
        app.headerImages();
        app.socialButtons();
    });
})();