/** @jsx React.DOM */

var BS = ReactBootstrap;
var Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    FluxChildMixin = Fluxxor.FluxChildMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;


var Player = React.createClass({
    render: function(){
        return (
            <li>
                <audio controls src={this.props.url}></audio>
            </li>
        );
    }
});

var Struct = React.createClass({
    render: function(){
        var Grid = BS.Grid;
        var Col = BS.Col;
        var Row = BS.Row;
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
    mixins: [FluxChildMixin],
    render: function() {
        var ListGroupItem = BS.ListGroupItem;
        var ListGroup = BS.ListGroupItem;
        var audios = this.props.audios;
        var items = audios.map(function(audio){
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

var CountTime = React.createClass({
    getInitialState: function () {
        return {
            time: ''
        }
    },
    stop: function () {
        window.clearInterval(this.handler);
        this.setState({time:''});
    },
    start: function () {
        var me = this,
            start = new Date();
        me.setState({time: "00:00:00"});
        this.handler = window.setInterval(function () {
            var now = new Date() - 0,
                diff = now - start;

            var ms = Math.floor(diff % 1000 / 10),
                s  = Math.floor(diff / 1000 % 3600 % 60),
                min = Math.floor( diff / 1000 % 3600 / 60);

            me.setState({
                time: min + ":" + s + ":" + ms
            });
        }, 10);
    },
    componentWillUnmount: function () {
        window.clearInterval(this.handler);
    },
    render: function () {
        return (
            <div>{this.state.time}</div>
        )
    }
});

var RecordPanel = React.createClass({
    mixins: [FluxChildMixin],
    recording: false,
    getInitialState: function () {
        return {
            action: "Record"
        };
    },
    act: function () {
        if (this.recording) {
            this.getFlux().actions.stop();
            this.recording = false;
            this.refs.countComponent.stop();
        } else {
            this.getFlux().actions.record();
            this.recording = true;
            this.refs.countComponent.start();
        }

        this.setState({
            'action': this.recording ? 'Stop' : 'Record'
        });
    },
    stop: function() {
        this.getFlux().actions.stop();
    },
    render: function() {
        var Row = BS.Row,
            Button = BS.Button;
        return (
            <Row>
                <Button bsStyle="primary" onClick={this.act}>{this.state.action}</Button>
                <CountTime ref="countComponent"/>
            </Row>
        );
    }
});

var App = React.createClass({
    mixins: [FluxMixin, Fluxxor.StoreWatchMixin("recordStore")],

    getStateFromFlux: function () {
        return {
            audios: this.getFlux().store('recordStore').records
        }
    },

    render: function() {
        return (
            <Struct content={<RecordPanel />} sidebar={<PlayerList audios={this.state.audios}/>} />
        );
    }
});


var RecordStore = require("./stores/RecordStore");
var actions = require("./actions");
var stores = {
    recordStore: new RecordStore()
};
var flux = new Fluxxor.Flux(stores, actions);
window.flux = flux; //for debug

React.renderComponent(<App flux={flux}/>, document.getElementById('example'));
