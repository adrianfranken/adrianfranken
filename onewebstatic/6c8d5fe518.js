window.jQuery = window.oldjQuery;
(function () {
    function run() {
        var g = function (id) {
                return document.getElementById(id);
            }, ttl = g('mmt'), btn = g('mmb'), menu = g('mm'), body = document.getElementsByTagName('body')[0], on = false, height;
        if (!btn || !menu || !body) {
            return;
        }
        function onclick() {
            on = !on;
            if (on) {
                btn.className = 'on';
                menu.className = 'on';
                height = Math.max(window.innerHeight || document.documentElement.clientHeight, body.offsetHeight, menu.offsetHeight);
                menu.style.height = height + 'px';
            } else {
                btn.className = 'off';
                menu.className = 'off';
            }
        }
        ttl.onclick = onclick;
        btn.onclick = onclick;
        menu.onclick = function (e) {
            var target, parent;
            target = e ? e.target : window.event.srcElement;
            target = target.nodeType === 3 ? target.parentNode : target;
            if (target.tagName === 'DIV' && target.id !== 'mm') {
                parent = target.parentNode;
                parent.className = parent.className ? '' : 'expanded';
                return;
            }
            btn.className = 'off';
            menu.className = 'off';
            on = false;
        };
    }
    var readyTimer = setInterval(function () {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            run();
            clearInterval(readyTimer);
        }
    }, 10);
}());
(function () {
    function isMobile() {
        var width = window.innerWidth || document.documentElement.clientWidth;
        return width <= 650;
    }
    function getComponent(node, block) {
        var child = node.removeChild(node.children[0]);
        child.parentInDesktopView = node;
        child.className += ' mobile-moved';
        if (block) {
            block.appendChild(child);
            return block;
        }
        return child;
    }
    function updateiFrameSrc(iframeElem, srcVal, tarVal) {
        var adjustAutoPlay = iframeElem[0] && iframeElem[0].getAttribute('data-mobile-hide');
        if (adjustAutoPlay === 'true') {
            var srcStr = iframeElem[0].getAttribute('src'), updatedSrc = srcStr.replace(srcVal, tarVal);
            if (srcStr !== updatedSrc) {
                iframeElem[0].setAttribute('src', updatedSrc);
            }
        }
    }
    function run() {
        var blockEltsMap = {};
        function getBlock(node, blocksMap) {
            var blockId = node.getAttribute('data-mobile-block-id');
            if (blockEltsMap[blockId]) {
                return blockEltsMap[blockId].cloneNode(true);
            }
            var block = blockId && blocksMap[blockId];
            if (block) {
                block = block.children[0].children[0];
                block = block.cloneNode(true);
                while (block.firstChild) {
                    block.removeChild(block.firstChild);
                }
                blockEltsMap[blockId] = block;
                return block.cloneNode(true);
            }
        }
        function move() {
            var templateElt = document.getElementsByClassName('template')[0];
            if (!templateElt) {
                return;
            }
            var isMobileView = templateElt.classList.contains('mobileView'), isMobileWidth = isMobile(), j = 0;
            if (isMobileView && isMobileWidth || !isMobileView && !isMobileWidth) {
                return;
            }
            var iframeElem = document.querySelectorAll('[data-mobile-hide]');
            if (isMobileWidth) {
                updateiFrameSrc(iframeElem, /autoplay=1/g, 'autoplay=0');
                templateElt.classList.add('mobileView');
                var components = Array.prototype.slice.call(document.querySelectorAll('[data-mobile-order]')), blocks = Array.prototype.slice.call(document.querySelectorAll('[data-mobile-block]')), blocksMap = {}, block, mobileDownCompsContainer = document.getElementById('mobileDownCompsContainer');
                if (components.length && !mobileDownCompsContainer) {
                    mobileDownCompsContainer = document.createElement('div');
                    mobileDownCompsContainer.id = 'mobileDownCompsContainer';
                    mobileDownCompsContainer.className = 'mobileV';
                    document.body.appendChild(mobileDownCompsContainer);
                }
                blocks.forEach(function (block) {
                    blocksMap[block.getAttribute('data-id')] = block;
                });
                components.sort(function (a, b) {
                    return +a.getAttribute('data-mobile-order') - +b.getAttribute('data-mobile-order');
                });
                for (j = 0; j < components.length; j++) {
                    block = getBlock(components[j], blocksMap);
                    mobileDownCompsContainer.appendChild(getComponent(components[j], block));
                }
            } else {
                updateiFrameSrc(iframeElem, /autoplay=0/g, 'autoplay=1');
                templateElt.classList.remove('mobileView');
                var movedComponents = Array.prototype.slice.call(document.querySelectorAll('.mobile-moved'));
                for (j = 0; j < movedComponents.length; j++) {
                    var child = movedComponents[j], parent = child.parentInDesktopView;
                    child.classList.remove('mobile-moved');
                    if (child.parentNode.tagName === 'DIV') {
                        document.body.removeChild(child.parentNode);
                    }
                    parent.appendChild(child);
                    delete child.parentInDesktopView;
                }
            }
        }
        move();
        var timer;
        function timedMove() {
            clearTimeout(timer);
            timer = setTimeout(move, 200);
        }
        if (window.addEventListener) {
            window.addEventListener('resize', timedMove);
        } else if (window.attachEvent) {
            window.attachEvent('onresize', timedMove);
        }
    }
    var readyTimer = setInterval(function () {
        if (document.readyState === 'complete') {
            clearInterval(readyTimer);
            run();
        }
    }, 10);
    window.runMobileSort = run;
}());