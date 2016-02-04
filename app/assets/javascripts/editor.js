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

    // Draw horizontal lines
    for (var w = squareLen; w < canvasWidth; w += squareLen) {
        canvasContext.moveTo(w, 0);
        canvasContext.lineTo(w, canvasHeight);
    }

    // Draw vertical lines
    for (var h = squareLen; h < canvasHeight; h += squareLen) {
        canvasContext.moveTo(0, h);
        canvasContext.lineTo(canvasWidth, h);
    }

    canvasContext.strokeStyle = '#C0C0C0';
    canvasContext.stroke();
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

        // Variables for tracking coordinates of closest grid intersection for dropping member icon
        var dropX;
        var dropy;

        // Enable jQuery draggable functionality on each member icon DOM element
        members.forEach(function(member) {
            $(member).draggable({
                // Constrained area allowed for dragging 
                containment: document.body,
                // No auto-scroll when dragging
                scroll: false,
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
                    var canvasX = event.clientX - canvas.offsetLeft;
                    var canvasY = event.clientY - canvas.offsetTop;

                    // If the cursor is within the boundaries of the canvas
                    if ((canvasX >= 0 && canvasX <= canvasWidth) && (canvasY >= 0 && canvasY <= canvasHeight)) {
                        // Clears canvas to delete previously drawn indicator for closest grid intersection
                        drawGrid();

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

                        for (var i = 0; i < fourCorners.length; i++) {
                            var currX = fourCorners[i][0];
                            var currY = fourCorners[i][1];
                            var currDist = Math.sqrt(Math.pow(canvasX - currX, 2) + Math.pow(canvasY - currY, 2));
                            if (currDist < smallestDist) {
                                smallestDist = currDist;
                                closestX = currX;
                                closestY = currY;
                            }
                        }

                        // Draw a small grey circle at the determined closest grid intersection
                        canvasContext.beginPath();
                        canvasContext.arc(closestX, closestY, 10, 0, 2*Math.PI);
                        canvasContext.strokeStyle = '#C0C0C0';
                        canvasContext.stroke();
                        canvasContext.fillStyle = '#C0C0C0';
                        canvasContext.fill();

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