document.addEventListener('DOMContentLoaded', function () {
    var nodes = document.querySelectorAll('div[data-id]'), node, i;
    for (i = 0; i < nodes.length; i++) {
        node = nodes[i];
        (function (node) {
            node.addEventListener('click', function (event) {
                event.stopPropagation();
            });
        }(node));
    }
    nodes = document.querySelectorAll('div[data-link=\'we-link\']');
    for (i = 0; i < nodes.length; i++) {
        node = nodes[i];
        var classNames = node.getAttribute('class');
        var href = node.firstChild.getAttribute('href');
        if (classNames && classNames.indexOf('shinybox') > -1) {
            node.setAttribute('href', href);
            continue;
        }
        var target = node.getAttribute('target');
        (function (node, href, target) {
            node.addEventListener('click', function (event) {
                event.stopPropagation();
                window.open(href, target || '_self');
            });
        }(node, href, target));
    }
    nodes = document.querySelectorAll('a[data-stop-propagation=\'true\']');
    for (i = 0; i < nodes.length; i++) {
        node = nodes[i];
        (function (node) {
            node.addEventListener('click', function (event) {
                event.stopPropagation();
            });
        }(node));
    }
});
(function () {
    var mobileMaxWidth = 650, minPageWidth = Math.max(parseInt(document.querySelector('meta[name="viewport"]').getAttribute('minpagewidth'), 10), mobileMaxWidth + 1);
    function determineZoomAbility() {
        var head = document.querySelector('head'), isApple = !!navigator.userAgent.toLowerCase().match(/(?:iphone|ipad)/), isMobileMode;
        if (isApple) {
            var isPortrait = window.innerHeight > window.innerWidth;
            isMobileMode = window.matchMedia((isPortrait ? '(max-device-width: ' : '(max-device-height: ') + mobileMaxWidth + 'px)').matches;
        } else {
            isMobileMode = window.matchMedia ? window.matchMedia('(max-device-width: ' + mobileMaxWidth + 'px)').matches : window.screen.width <= mobileMaxWidth;
        }
        var metaTag = document.createElement('meta');
        metaTag.setAttribute('name', 'viewport');
        if (isMobileMode) {
            metaTag.setAttribute('content', 'width=device-width, initial-scale=1.0, minimum-scale=1.0');
        } else {
            metaTag.setAttribute('content', 'width=' + minPageWidth);
        }
        head.removeChild(document.querySelector('meta[name="viewport"]'));
        head.appendChild(metaTag);
    }
    determineZoomAbility();
    window.addEventListener('orientationchange', determineZoomAbility, false);
}());