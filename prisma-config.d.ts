declare module 'prisma/config' {
  type AnyObj = { [key: string]: any };
  export function defineConfig(config: AnyObj): AnyObj;
  export default defineConfig;
}
