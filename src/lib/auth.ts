import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from './prisma'; // Importa instância do Prisma
import { UserStatus } from '@prisma/client'; // Importa o enum

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined!');
}


export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Define uma interface para o payload do token
interface JwtPayload {
  userId: string;
  // Adicione outros campos se necessário (ex: roles)
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: '7d' }); // Adiciona ! para afirmar que JWT_SECRET existe
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    // Especifica o tipo de retorno esperado do verify
    return jwt.verify(token, JWT_SECRET!) as JwtPayload;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

// Busca o usuário no DB a partir do payload do token
export const getUserFromToken = async (token: string): Promise<{ id: string; email: string; } | null> => {
  if (!token) return null;

  const decoded = verifyToken(token);
  // Verifica se decoded e decoded.userId existem
  if (!decoded?.userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, status: true }
    });

    // Retorna usuário apenas se ele existir e estiver registrado
    if (user?.status === UserStatus.REGISTERED) { // Usa o enum importado
        return { id: user.id, email: user.email };
    }
    return null;

  } catch (error) {
    console.error("Error fetching user from token:", error);
    return null;
  }
};