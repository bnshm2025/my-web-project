const chalk = require('chalk');
const {
    checkAccountNameAvailability,
    checkEmailAvailability,
} = require('../../services/checkAvailability/checkAvailabilityService');

async function checkAvailabilityController(req, res) {
    const { account_name: accountName, email } = req.query;

    if (process.env.LOG_TO_CONSOLE === 'true') {
        console.log(
            chalk.yellow(`GET /check-availability: Received data { accountName: ${accountName}, email: ${email} }`),
        );
    }

    try {
        const isAccountNameTaken = accountName ? await checkAccountNameAvailability(accountName) : false;
        const isEmailTaken = email ? await checkEmailAvailability(email) : false;

        if (process.env.LOG_TO_CONSOLE === 'true') {
            console.log(chalk.yellow(`GET /check-availability: Check results`));
            console.log(
                `  ${chalk.bold('Account Name Check:')} ${isAccountNameTaken ? chalk.red('Occupied') : chalk.green('Available')}`,
            );
            console.log(
                `  ${chalk.bold('Email Check:')} ${isEmailTaken ? chalk.red('Occupied') : chalk.green('Available')}`,
            );
        }

        res.json({ accountNameTaken: isAccountNameTaken, emailTaken: isEmailTaken });
    } catch (err) {
        if (process.env.LOG_TO_CONSOLE === 'true') {
            console.error(chalk.red('GET /check-availability: Error executing query:', err));
        }
        res.status(500).send('An error occurred while checking availability.');
    }
}

module.exports = { checkAvailabilityController };
