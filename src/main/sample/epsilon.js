/**
 * Created by Gianluca on 10/07/2017.
 */

import zeta from "./zeta";
import eta from "./eta";

export const name = "epsilon";

export function epsilon() {
    return name + ' calling ' + zeta() + ' and ' + eta();
}