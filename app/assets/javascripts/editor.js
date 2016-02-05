// Variable for the length of each grid square
var squareLen;

/* Draw grid lines on canvas */
function drawGrid() {
    var canvas = document.getElementById('canvas');
    var canvasHeight = canvas.height;
    var canvasWidth = canvas.width;
    var canvasContext = canvas.getContext('2d');

    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calculate the length of each grid square
    squareLen = Math.round(canvasWidth / 30);

    // Draw vertical lines (Note: the origin (0,0) exists at the upper-left corner)
    for (var x = squareLen; x < canvasWidth; x += squareLen) {
        canvasContext.moveTo(x, 0);
        canvasContext.lineTo(x, canvasHeight);
    }

    // Draw horizontal lines
    for (var y = squareLen; y < canvasHeight; y += squareLen) {
        canvasContext.moveTo(0, y);
        canvasContext.lineTo(canvasWidth, y);
    }

    canvasContext.strokeStyle = '#C0C0C0';
    canvasContext.stroke();
}

/* Add HTML to create snap grid for draggable elements */
function createSnapGrid() {
    var canvas = document.getElementById('canvas');
    var canvasHeight = canvas.height;
    var canvasWidth = canvas.width;

    var vSnapDivs = [];
    var hSnapDivs = [];

    // Add vertical lines for snap grid
    for (var i = 1; i < Math.floor(canvasWidth / squareLen); i++) {
        vSnapDivs[i] = document.createElement('div');
        $(vSnapDivs[i]).addClass('snap-div v-snap-div-' + (i+1));
        $(vSnapDivs[i]).css({
            height: (Math.floor(canvasHeight / squareLen) - 1) * squareLen,
            left: canvas.offsetLeft + (squareLen / 2) + (i * squareLen) - 1 + 'px',
            position: 'absolute',
            top: canvas.offsetTop + (squareLen / 2),
            width: '0px'
        });
        document.getElementById('editor-wrapper').appendChild(vSnapDivs[i]);
    }

    // Add horizontal lines for snap grid
    for (var i = 1; i < Math.floor(canvasHeight / squareLen) - 1; i++) {
        hSnapDivs[i] = document.createElement('div');
        $(hSnapDivs[i]).addClass('snap-div h-snap-div-' + (i+1));
        $(hSnapDivs[i]).css({
            height: '0px',
            left: canvas.offsetLeft + (squareLen / 2),
            position: 'absolute',
            top: canvas.offsetTop + (squareLen / 2) + (i * squareLen) - 1 + 'px',
            width: Math.floor(canvasWidth / squareLen) * squareLen
        });
        document.getElementById('editor-wrapper').appendChild(hSnapDivs[i]);
    }

    console.log('snap grid created');
}

/* Resize canvas based on new window size */
function resizeCanvas() {
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();

    var canvas = document.getElementById('canvas');
    canvas.width = windowWidth * 0.7;
    canvas.height = windowHeight - 66;
    canvas.style.width = windowWidth * 0.7 + 'px';
    canvas.style.height = windowHeight - 66 + 'px';

    drawGrid();

    createSnapGrid();

    console.log('canvas resized');
}

/* Actions to perform when page DOM is ready */
function ready() {
    if (window.location.pathname == '/editor') { 
        console.log('editor page ready');

        // Configure canvas size and draw canvas when editor page first loads
        resizeCanvas();

        // Create array of member icons
        var members = [].slice.call(document.getElementsByClassName('member-icon'));

        // Track initial left and top offsets for member icons
        var startingOffsets = {};
        members.forEach(function(member) {
            startingOffsets[member.id] = { left: member.offsetLeft, top: member.offsetTop };
        });

        // Variables for tracking coordinates of closest grid intersection for dropping member icons
        var dropX;
        var dropY;

        // Enable jQuery draggable functionality for each member icon DOM element
        members.forEach(function(member) {
            $(member).draggable({
                // Constrained area allowed for dragging
                // [140, 56, 1366, 624]
                containment: [canvas.getBoundingClientRect().left, canvas.getBoundingClientRect().top,
                              $(window).width(),                   $(window).height() - 33],
                // No auto-scroll when dragging
                scroll: false,
                // Snap to snap div's
                snap: '.snap-div',
                // Start callback function for when dragging starts
                start: function(event) {
                    // Add being-dragged styling
                    $(member).addClass('being-dragged');
                },
                // Drag callback function for during dragging
                drag: function(event) {
                    var canvas = document.getElementById('canvas');
                    var canvasHeight = canvas.height;
                    var canvasWidth = canvas.width;
                    var canvasContext = canvas.getContext('2d');

                    // X- and y-coordinates of cursor respective to the canvas
                    var canvasX = event.clientX - canvas.getBoundingClientRect().left;
                    var canvasY = event.clientY - canvas.getBoundingClientRect().top;

                    // If the cursor is within the boundaries of the canvas
                    if ((canvasX >= 0 && canvasX <= canvasWidth) && (canvasY >= 0 && canvasY <= canvasHeight)) {
                        // Clears canvas to delete previously drawn indicator for closest grid intersection
                        // drawGrid();

                        // Find grid intersection closest to cursor during dragging

                        var closestX;
                        var closestY;
                        var fourCorners = [];
                        var smallestDist = Number.MAX_VALUE;

                        var modX = Math.floor(canvasX / squareLen);
                        var modY = Math.floor(canvasY / squareLen);

                        fourCorners.push([modX * squareLen,       modY * squareLen]);
                        fourCorners.push([(modX + 1) * squareLen, modY * squareLen]);
                        fourCorners.push([modX * squareLen,       (modY + 1) * squareLen]);
                        fourCorners.push([(modX + 1) * squareLen, (modY + 1) * squareLen]);

                        var currX;
                        var currY;
                        var currDist;
                        for (var i = 0; i < fourCorners.length; i++) {
                            currX = fourCorners[i][0];
                            currY = fourCorners[i][1];
                            currDist = Math.sqrt(Math.pow(canvasX - currX, 2) + Math.pow(canvasY - currY, 2));
                            if (currDist < smallestDist) {
                                smallestDist = currDist;
                                closestX = currX;
                                closestY = currY;
                            }
                        }

                        // Draw a small grey circle at the determined closest grid intersection
                        // canvasContext.beginPath();
                        // canvasContext.arc(closestX, closestY, 10, 0, 2*Math.PI);
                        // canvasContext.strokeStyle = '#C0C0C0';
                        // canvasContext.stroke();
                        // canvasContext.fillStyle = '#C0C0C0';
                        // canvasContext.fill();

                        // Track coordinates of closest grid intersection
                        dropX = closestX;
                        dropY = closestY;
                    }
                },
                // Stop callback function for when dragging stops
                stop: function(event) {
                    // Remove being-dragged styling
                    $(member).removeClass('being-dragged');

                    var canvas = document.getElementById('canvas');

                    // Drop member icon to closest grid intersection
                    $(event.target).css('left', dropX + canvas.offsetLeft - startingOffsets[event.target.id].left - 15);
                    $(event.target).css('top', dropY + canvas.offsetTop - startingOffsets[event.target.id].top - 15);
                }
            });
        });
    }
}

$(window).load(function() {
    console.log('window loaded');

    $(document).ready(ready);
    // $(window).resize(resizeCanvas);
});