import { Router } from 'express';
import authController from './controllers/authController.js';

const routes = route => {
    route.get('/', (req, res) => {
        res.send(`API server in running (${new Date().toLocaleString()})`);
    });

    route.route('/auth/register').post(authController.register);
    route.route('/auth/login').post(authController.login);
    route.route('/auth/verify').post(authController.verify);
};

export default routes;