const bcrypt = require('bcrypt');

async function hashPassword(password) {
    const saltRounds = 10; // You can adjust the number of salt rounds for security vs. performance
    return await bcrypt.hash(password, saltRounds);
}

async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

module.exports = {
    hashPassword,
    comparePassword
};