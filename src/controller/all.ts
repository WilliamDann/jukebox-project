import account from './account'
import page from './page';
import spotify from './spotify';
import token from './token';

// import all routes
export default function() {
    account();
    token();
    spotify();
    page();
}