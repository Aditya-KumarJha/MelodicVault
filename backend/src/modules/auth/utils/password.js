import bcrypt from 'bcryptjs';

const hashPassword = async (password) => bcrypt.hash(password, 12);

const verifyPassword = async (password, passwordHash) => bcrypt.compare(password, passwordHash);

export { hashPassword, verifyPassword };
