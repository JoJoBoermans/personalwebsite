declare module 'react' {
  export type SetStateAction<T> = T | ((previous: T) => T);
  export type Dispatch<T> = (value: T) => void;
  export type CSSProperties = Record<string, string | number | undefined>;
  export interface MutableRefObject<T> { current: T; }
  export type ReactNode = unknown;
  export interface SyntheticEvent<T = Element> { currentTarget: T; target: EventTarget & T; preventDefault(): void; }
  export interface ChangeEvent<T = Element> extends SyntheticEvent<T> {}
  export interface KeyboardEvent<T = Element> extends SyntheticEvent<T> { key: string; shiftKey: boolean; ctrlKey: boolean; metaKey: boolean; }
  export interface PointerEvent<T = Element> extends SyntheticEvent<T> { pointerId: number; clientX: number; clientY: number; }
  export function useState<T>(initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>];
  export function useEffect(effect: () => void | (() => void), dependencies?: readonly unknown[]): void;
  export function useMemo<T>(factory: () => T, dependencies: readonly unknown[]): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, dependencies: readonly unknown[]): T;
  export function useRef<T>(initial: T): MutableRefObject<T>;
}

declare module 'react/jsx-runtime' {
  export const Fragment: unknown;
  export function jsx(type: unknown, props: unknown, key?: unknown): unknown;
  export function jsxs(type: unknown, props: unknown, key?: unknown): unknown;
}

declare module '*.css' {
  const value: string;
  export default value;
}

declare namespace JSX {
  interface IntrinsicAttributes { key?: string | number; }
  interface IntrinsicElements { [elementName: string]: any; }
}
