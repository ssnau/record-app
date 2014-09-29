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
    mixins: [FluxChildMixin, StoreWatchMixin('recordStore')],
    getStateFromFlux: function () {
      return {
          audios: this.getFlux().store('recordStore').records
      };
    },
    render: function() {
        var ListGroupItem = BS.ListGroupItem;
        var ListGroup = BS.ListGroupItem;
        var audios = this.state.audios;
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

var RecordPanel = React.createClass({
    mixins: [FluxChildMixin],
    record: function () {
        this.getFlux().actions.record();
    },
    stop: function() {
        this.getFlux().actions.stop();
    },
    render: function() {
        var Row = BS.Row,
            Button = BS.Button;
        return (
            <Row>
                <Button bsStyle="primary" onClick={this.record}>Record</Button>
                <Button bsStyle="primary" onClick={this.stop}>Stop</Button>
            </Row>
        );
    }
});

var App = React.createClass({
    mixins: [FluxMixin/*, Fluxxor.StoreWatchMixin("recordStore")*/],

    render: function() {
        return (
            <Struct content={<RecordPanel />} sidebar={<PlayerList />} />
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
