import api from './api';

const signinService = {
    signin: async (identifier, password) => {
        try {
            const response = await api.post('/signin', {
                identifier,
                signin_password: password,
            });

            return response.data;
        } catch (error) {
            console.error('Error in signin:', error.message);
            throw error;
        }
    },
};

export default signinService;
