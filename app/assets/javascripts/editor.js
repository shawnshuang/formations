(function(window, document, $) {
    var dClientWidth;
    var dClientHeight;
    var canvas;
    var canvasWidth;
    var canvasHeight;
    var canvasContext;

    // Variable for the length of each grid square
    var squareLen;

    /* Draw grid lines on canvas */
    function drawGrid() {
        canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

        // Calculate the length of each grid square
        squareLen = Math.round(canvasWidth / 30);

        // Setup drawing paths for vertical lines
        for (var x = squareLen; x < canvasWidth; x += squareLen) {
            canvasContext.moveTo(x, 0);
            canvasContext.lineTo(x, canvasHeight);
        }

        // Setup drawing paths for horizontal lines
        for (var y = squareLen; y < canvasHeight; y += squareLen) {
            canvasContext.moveTo(0, y);
            canvasContext.lineTo(canvasWidth, y);
        }

        canvasContext.strokeStyle = '#C0C0C0';
        canvasContext.stroke();

        console.log('canvas grid drawn');
    }

    /* Add HTML to create snap grid for draggable elements */
    function createSnapGrid() {
        var eWrapper = document.getElementById('editor-wrapper');

        // Vertical snap div's
        var vSnapDivs = [];
        // Horizontal snap div's
        var hSnapDivs = [];

        // Add vertical snap div's
        /* To Do: Make responsive */
        for (var i = 1; i < Math.floor(canvasWidth / squareLen); i += 1) {
            vSnapDivs[i] = document.createElement('div');
            vSnapDivs[i].className += 'snap-div v-snap-div-' + (i+1);
                // Previously: $(vSnapDivs[i]).addClass('snap-div v-snap-div-' + (i+1));
            vSnapDivs[i].style.position = 'absolute';
            vSnapDivs[i].style.width = '0px';
            /* To Do: Make responsive */
            vSnapDivs[i].style.height = (Math.floor(canvasHeight / squareLen) - 1) * squareLen + 'px';
            vSnapDivs[i].style.left = canvas.offsetLeft + (squareLen / 2) + (i * squareLen) - 1 + 'px';
            vSnapDivs[i].style.top = canvas.offsetTop + (squareLen / 2) + 'px';
                // Previously:
                // $(vSnapDivs[i]).css({
                //     height: (Math.floor(canvasHeight / squareLen) - 1) * squareLen,
                //     left: canvas.offsetLeft + (squareLen / 2) + (i * squareLen) - 1 + 'px',
                //     position: 'absolute',
                //     top: canvas.offsetTop + (squareLen / 2),
                //     width: '0px'
                // });
            eWrapper.appendChild(vSnapDivs[i]);
        }

        // Add horizontal snap div's
        /* To Do: Make responsive */
        for (var j = 1; j < Math.floor(canvasHeight / squareLen) - 1; j += 1) {
            hSnapDivs[j] = document.createElement('div');
            hSnapDivs[j].className += 'snap-div h-snap-div-' + (j+1);
                // Previously: $(hSnapDivs[j]).addClass('snap-div h-snap-div-' + (j+1));
            hSnapDivs[j].style.position = 'absolute';
            /* To Do: Make responsive */
            hSnapDivs[j].style.width = Math.floor(canvasWidth / squareLen) * squareLen + 'px';
            hSnapDivs[j].style.height = '0px';
            hSnapDivs[j].style.left = canvas.offsetLeft + (squareLen / 2) + 'px';
            hSnapDivs[j].style.top = canvas.offsetTop + (squareLen / 2) + (j * squareLen) - 1 + 'px';
                // Previously:
                // $(hSnapDivs[j]).css({
                //     height: '0px',
                //     left: canvas.offsetLeft + (squareLen / 2),
                //     position: 'absolute',
                //     top: canvas.offsetTop + (squareLen / 2) + (j * squareLen) - 1 + 'px',
                //     width: Math.floor(canvasWidth / squareLen) * squareLen
                // });
            eWrapper.appendChild(hSnapDivs[j]);
        }

        console.log('canvas snap grid added');
    }

    /* Resize canvas based on new window size */
    function resizeCanvas() {
        canvas.width = dClientWidth * 0.7;
        canvas.height = dClientHeight - 66;
        canvas.style.width = dClientWidth * 0.7 + 'px';
        canvas.style.height = dClientHeight - 66 + 'px';

        canvasWidth = canvas.width;
        canvasHeight = canvas.height;

        drawGrid();

        createSnapGrid();

        console.log('canvas resized');
    }

    /* Computations to perform when page DOM is ready */
    function ready() {
        if (window.location.pathname == '/editor') {
            console.log('editor page ready');

            dClientWidth = document.documentElement.clientWidth;
                // Previously: $(window).width();
            dClientHeight = document.documentElement.clientHeight;
                // Previously: $(window).height();
            canvas = document.getElementById('canvas');
            canvasContext = canvas.getContext('2d');

            // Set up and draw canvas when editor page first loads
            resizeCanvas();

            // X- and y-coordinates of cursor respective to the canvas
            var canvasX;
            var canvasY;

            // Variables for tracking coordinates of closest grid intersection for dropping member icons
            var dropX;
            var dropY;

            // Create array of member icons
            var members = [].slice.call(document.getElementsByClassName('member-icon'));

            // Track initial left and top offsets for member icons
            var startingOffsets = {};
            members.forEach(function(member) {
                startingOffsets[member.id] = { left: member.offsetLeft, 
                                               top:  member.offsetTop };
            });

            // Enable jQuery draggable functionality for each member icon
            members.forEach(function(member) {
                $(member).draggable({
                    // Constrained area allowed for dragging
                    containment: [canvas.getBoundingClientRect().left, canvas.getBoundingClientRect().top,
                                  dClientWidth,                        dClientHeight - 33],
                        // Preivously: $(window).width(), $(window).height()
                    // No auto-scroll when dragging
                    scroll: false,
                    // Snap to snap div's
                    snap: '.snap-div',
                    // Ccallback function for when dragging starts
                    start: function(event) {
                        // Add being-dragged styling
                        member.className += ' ' + 'being-dragged';
                    },
                    // Callback function for whenever element is dragged
                    drag: function(event) {
                        /* Variables for finding the grid intersection closest to cursor during dragging */

                        // The four possible grid intersections closest to the cursor at any point
                        var fourCorners = [];
                        // X-coordinate of currently examined 'corner'
                        var currX;
                        // Y-coordinate of currently examined 'corner'
                        var currY;
                        // Computed distance between cursor and currently examined 'corner'
                        var currDist;
                        // X-coorindate of grid intersection closest to cursor
                        var closestX;
                        // Y-coorindate of grid intersection closest to cursor
                        var closestY;
                        // Computed distance between cursor and closest grid intersection
                        var smallestDist = Number.MAX_VALUE;

                        canvasX = event.clientX - canvas.getBoundingClientRect().left;
                        canvasY = event.clientY - canvas.getBoundingClientRect().top;

                        // If the cursor is within the boundaries of the canvas
                        if (canvasX >= 0 && canvasX <= canvasWidth && canvasY >= 0 && canvasY <= canvasHeight) {
                            // Find grid intersection closest to cursor during dragging

                            var modX = Math.floor(canvasX / squareLen);
                            var modY = Math.floor(canvasY / squareLen);

                            fourCorners.push([modX * squareLen,       modY * squareLen]);
                            fourCorners.push([(modX + 1) * squareLen, modY * squareLen]);
                            fourCorners.push([modX * squareLen,       (modY + 1) * squareLen]);
                            fourCorners.push([(modX + 1) * squareLen, (modY + 1) * squareLen]);

                            // Calculate distance between cursor and each grid intersection
                            for (var i = 0; i < fourCorners.length; i += 1) {
                                currX = fourCorners[i][0];
                                currY = fourCorners[i][1];
                                currDist = Math.sqrt(Math.pow(canvasX - currX, 2) + Math.pow(canvasY - currY, 2));
                                // Track closest grid intersection
                                if (currDist < smallestDist) {
                                    smallestDist = currDist;
                                    closestX = currX;
                                    closestY = currY;
                                }
                            }

                            // Save coordinates of closest grid intersection
                            dropX = closestX;
                            dropY = closestY;
                        }
                    },
                    // Callback function for when dragging stops
                    stop: function(event) {
                        // Remove being-dragged styling
                        member.className = 'member-icon';

                        canvasX = event.clientX - canvas.getBoundingClientRect().left;
                        canvasY = event.clientY - canvas.getBoundingClientRect().top;

                        // If the cursor is within the boundaries of the canvas
                        if (canvasX >= 0 && canvasX <= canvasWidth && canvasY >= 0 && canvasY <= canvasHeight) {
                            // Drop member icon to closest grid intersection
                            event.target.style.left = dropX + canvas.offsetLeft - startingOffsets[event.target.id].left - 15 + 'px';
                            event.target.style.top = dropY + canvas.offsetTop - startingOffsets[event.target.id].top - 15 + 'px';
                                // Previously:
                                // $(event.target).css('left', dropX + canvas.offsetLeft - startingOffsets[event.target.id].left - 15);
                                // $(event.target).css('top', dropY + canvas.offsetTop - startingOffsets[event.target.id].top - 15);
                        }
                    },
                    // Reverts member icon to original position if not dropped on canvas.
                    // Based off of: http://stackoverflow.com/questions/5735270/revert-a-
                    // jquery-draggable-object-back-to-its-original-container-on-out-event-of
                    revert: function(event) {
                        // Event is droppable element when draggable is dropped on droppable.
                        // Else, event is false. jQuery reverts the draggable if the revert
                        // callback function returns true.

                        $(this).data('uiDraggable').originalPosition = {
                            left: 0,
                            top: 0
                        };
                        return !event;
                    }
                });
            });

            // Enable jQuery droppable functionality for canvas
            $(canvas).droppable();
        }
    }

    $(document).ready(ready);
    // $(window).resize(resizeCanvas);
})(window, document, window.jQuery);