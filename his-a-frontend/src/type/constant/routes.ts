export type IRoutes = {
  home: Omit<IRoute, 'getUrl'>
  encounters: Omit<IRoute, 'getUrl'>
  medications: Omit<IRoute, 'getUrl'>
}
export type IRoute = {
  path: string
  getUrl: (param: string, slug?: string) => string
}
