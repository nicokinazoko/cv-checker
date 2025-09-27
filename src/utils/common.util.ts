import bcrypt from 'bcrypt';
const saltRounds = 10;

async function createSalt() {
    // generate salt using bycrypt and with salt rounds based on declaration
    const salt = await bcrypt.genSalt(saltRounds);

    // return salt
    return salt;
}

async function generateHashedPassword(password: string, salt: string) {
    // generate hash password using password and salt with salt rounds based on declaration
    let hashedPassword = await bcrypt.hash(password + salt, saltRounds);

    // return hashed password
    return hashedPassword;
}

export {
    createSalt,
    generateHashedPassword
}
