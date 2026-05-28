import { createContext, useContext } from 'react';

/* ============ CONTEXT ============ */
export const Ctx=createContext();
export const useApp=()=>useContext(Ctx);
