var Fluxxor = require("Fluxxor");
var recorder = require("../recorder");
var constant = require("../constant")

var RecordStore = Fluxxor.createStore({
    records: [],
    initialize: function () {
        this.bindActions(
            constant.START_RECORD, 'onStartRecord',
            constant.STOP_RECORD, 'onStopRecord'
        );
    },
    getRecorder: function () {
        return recorder.getRecorder();
    },
    onStartRecord: function () {
        this.getRecorder().record();
        this.emit('change');
    },
    onStopRecord: function () {
        var recorder = this.getRecorder();
        recorder.stop();

        var me = this;
        recorder.exportWAV(function (blob) {
            var url = URL.createObjectURL(blob);
            me.records.push({
                url: url
            });
            me.emit('change');
        });
    }
});

module.exports = RecordStore;