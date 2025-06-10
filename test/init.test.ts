import { assert } from "console"
import loader from "../loader"
import Env from "../env"

// run before test suite is started because of the --delay flag
//  https://mochajs.org/#root-level-hooks
(async function() {
    // load app Env
    await loader();

    describe('app setup', () => {
        it ('should have loaded db', () => {
            assert(Env.getInstance().db != null, 'db connection != null')
        });
        it ('should have loaded spotify', () => {
            assert(Env.getInstance().spotify != null, 'spotify client != null')
        });
    });

    run();
})();