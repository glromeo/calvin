import {Ready} from "calvin/elements/@Ready";
import {CustomElement} from "./@CustomElement";
import {Properties} from "./@Properties";
import {PaperElement} from "./paper-element";

@CustomElement
@Properties({
    page: {}
})
export class ReportPage extends PaperElement {

    constructor() {
        super();
    }

    @Ready
    copyAttributeValues($scope) {
        for (const attr of this.attributes) if (attr.name[0] !== '@') {
            $scope.page[attr.name] = attr.value;
        }
    }
}
