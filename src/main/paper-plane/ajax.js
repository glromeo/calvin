import Papa from "papaparse";

$.ajaxSetup({
    accepts: {
        "csv": "text/csv"
    },
    converters: {
        'text csv': function (csv) {
            let parsed = Papa.parse(csv);
            return parsed.data;
        }
    }
});
