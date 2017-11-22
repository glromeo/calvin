/**
 * Created by Gianluca on 10/07/2017.
 */

import { alpha } from "./alpha";

export const name = "beta";

export function beta() {
    return name + ' calling ' + alpha();
}