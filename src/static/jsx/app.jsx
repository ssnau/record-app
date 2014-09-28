/** @jsx React.DOM */
var React = require('react');
var Button = require('react-bootstrap/Button');

window.React = React;

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
});

var Grid = require('react-bootstrap/Grid');
var Row = require('react-bootstrap/Row');
var Col = require('react-bootstrap/Col');
var Struct = React.createClass({
    render: function(){
        return (
            <Grid>
                <Row className="show-grid">
                 <Col xs={12} md={8}>{this.props.content}</Col>
                 <Col xs={6} md={4}>{this.props.sidebar}</Col>
                </Row>
            </Grid>
        );
    }
});

var PlayerList = React.createClass({
    getInitialState: function(){
        return {
            audios: []
        };
    },
    render: function() {
        var ListGroup = require('react-bootstrap/ListGroup'),
            ListGroupItem = require('react-bootstrap/ListGroupItem');

        var items = this.state.audios.map(function(audio){
            return (
                <ListGroupItem>
                    <Player url={audio.url} />
                </ListGroupItem>
            );
        });
        return (
            <ListGroup>
                {items}
            </ListGroup>
        );
    }
});

var RecordPanel = React.createClass({
    record: function(){
        recorder.record();
    },
    stop: function() {
        recorder.stop();
        var audios = this.sideContent.state.audios;
        var sideContent = this.sideContent;
        recorder && recorder.exportWAV(function(blob) {
            var url = URL.createObjectURL(blob);
            console.log(url);
            sideContent.setState({
                audios: audios.concat({url: url})
            });
        });

    },
    render: function() {
        return (
            <Row>
                <Button bsStyle="primary" onClick={this.record}>Record</Button>
                <Button bsStyle="primary" onClick={this.stop}>Stop</Button>
            </Row>
        );
    }
})

var App = React.createClass({
    sideContent:  (
        <PlayerList />
    ),

    render: function() {
        return (
            <Struct content={this.content} sidebar={this.sideContent} />
        );
    }
});

React.renderComponent(<App />, document.getElementById('example'));
