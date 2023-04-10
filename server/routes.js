import authController from './controllers/authController.js';

const routes = route => {
    route.get('/', (req, res) => {
        res.send(`API server in running (${new Date().toLocaleString()})`);
    });

    route.route('/auth/register').post(authController.register);
};

export default routes;