import Env from "../env";

export default function() {
    Env.getInstance().app.get('/', (req, res) => {
        res.render('page/home')
    }); 
}