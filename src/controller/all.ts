import accessToken  from "./accessToken";
import account      from "./account";
import page         from "./page";
import profile      from "./profile";

export default function()
{
    account();
    profile();
    accessToken();
    page();
}