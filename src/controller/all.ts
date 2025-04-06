import account  from './account'
import jukebox  from './jukebox';
import page     from './page';
import token    from './token';

// import all routes
export default function() {
    account();
    token();
    page();
    jukebox();
}