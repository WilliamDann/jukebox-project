import accessToken  from "./accessToken";
import account      from "./account";
import page         from "./page";
import profile      from "./profile";
import spotify      from "./spotify";

export default function()
{
    account();
    profile();
    accessToken();
    page();
    spotify();
}