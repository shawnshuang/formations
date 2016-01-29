function resizeCanvases() {
    var width = $(window).width();
    var height = $(window).height();

    var fCanvas = document.getElementById('formationsCanvas');
    fCanvas.width = width * 0.7;
    fCanvas.height = height - 66;
    fCanvas.style.width = width * 0.7 + 'px';
    fCanvas.style.height = height - 66 + 'px';

    var pCanvas = document.getElementById('peopleCanvas');
    pCanvas.width = width * 0.2;
    pCanvas.height = height - 46;
    pCanvas.style.width = width * 0.2 + 'px';
    pCanvas.style.height = height - 46 + 'px';

    console.log('canvases resized');
};

var ready = function() {
    if (window.location['pathname'] == '/editor') { 
        console.log('editor page ready');

        resizeCanvases();

        var fCanvas = document.getElementById('formationsCanvas');
        var fHeight = fCanvas.height;
        var fWidth = fCanvas.width;
        var fCtx = fCanvas.getContext('2d');

        fCtx.clearRect(0, 0, fWidth, fHeight);
        fCtx.strokeStyle = '#343C46';

        fCtx.beginPath();
        fCtx.moveTo(10.5, 10.5);
        fCtx.lineTo(10.5, fHeight-10.5);
        fCtx.stroke();
    }
};

$(window).load(function() {
    console.log('window loaded');

    $(document).ready(ready);
    $(window).resize(resizeCanvases);
});