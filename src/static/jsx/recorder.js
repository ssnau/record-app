var audio_context;
var recorder;
var inited = false;

function __log(e, data) {
    console.log(e, data || '');
}

function init() {
    if (inited) return;
    inited = true;
    function startUserMedia(stream) {
        var input = audio_context.createMediaStreamSource(stream);
        __log('Media stream created.');
        console.log(audio_context);
        //input.connect(audio_context.destination);
        input.connect(audio_context.createMediaStreamDestination());
        __log('Input connected to audio context destination.');

        recorder = new Recorder(input, {
            workerPath: "bower_components/Recorderjs/recorderWorker.js"
        });
        __log('Recorder initialised.');
    }

    try {
        // webkit shim
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
        window.URL = window.URL || window.webkitURL;

        audio_context = new AudioContext;
        __log('Audio context set up.');
        __log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
    } catch (e) {
        alert('No web audio support in this browser!');
    }

    navigator.getUserMedia({audio: true}, startUserMedia, function (e) {
        __log('No live audio input: ' + e);
    });
}

init();

module.exports = {
    getRecorder: function() {
        if (recorder) {
            return recorder;
        }
    }
};