var constant = require("./constant");

module.exports = {
    record: function () {
        this.dispatch(constant.START_RECORD)
    },
    stop: function () {
        this.dispatch(constant.STOP_RECORD);
    }
}