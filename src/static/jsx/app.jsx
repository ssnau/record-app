/** @jsx React.DOM */
var React = require('react');
var Button = require('react-bootstrap/Button');

function __log(e, data) {
    console.log(e, data || '');
}

var audio_context;
var recorder;

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

navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
    __log('No live audio input: ' + e);
});

var Player = React.createClass({
    render: function(){
        return (
            <li>
                <audio controls src={this.props.url}></audio>
            </li>
        );
    }
})

var App = React.createClass({
    getInitialState: function() {
        return {
            audios: []
        };
    },
    record: function(){
        recorder.record();
    },
    stop: function() {
        recorder.stop();
        var audios = this.state.audios;
        var me = this;
        recorder && recorder.exportWAV(function(blob) {
            var url = URL.createObjectURL(blob);
            console.log(url);
            me.setState({
                audios: audios.concat({url: url})
            });
        });

    },
    render: function() {
        var audios = this.state.audios;
        return (
            <div>
                <Button bsStyle="primary" onClick={this.record}>Record</Button>
                <Button bsStyle="primary" onClick={this.stop}>Stop</Button>
                <ul>
                {audios.map(function(audio){
                    return <Player url={audio.url} />
                })}
                </ul>
            </div>);
    }
});

React.renderComponent(<App />, document.getElementById('example'));
