import bcrypt from 'bcrypt';
import { config } from '../../Utils/config';

export function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, config.passwordSalt);
}