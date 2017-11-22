import {Linked} from "calvin/elements/@Linked";
import {CustomElement} from "./@CustomElement";
import {Properties} from "./@Properties";
import {PaperElement} from "./paper-element";
import {Ready} from "calvin/elements/@Ready";

const debug = true;

@CustomElement
@Properties({
    report: {
        chapters: []
    }
})
export class PaperReport extends PaperElement {

    @Linked
    executeScripts(context) {
        for (let script of this.querySelectorAll(':scope > script[type="report/data"]')) {
            debug && console.log("script:", script);
            new Function("window", "$", "//# sourceURL=/report/script\n" + script.innerText).call(context, window, $);
        }
    }

    @Ready
    ready() {
        debug && console.log("all children are now ready");
    }
}
