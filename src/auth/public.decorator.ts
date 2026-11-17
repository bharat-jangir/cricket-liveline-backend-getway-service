import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/** Marks a route/controller as reachable without a token (login, health, public app API). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
