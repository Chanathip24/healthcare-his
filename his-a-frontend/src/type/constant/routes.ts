export type IRoutes = {
  home: Omit<IRoute, 'getUrl'>
  patientAction: IRoute
  encounters: Omit<IRoute, 'getUrl'>
  encounterDetail: IRoute
  medications: Omit<IRoute, 'getUrl'>
}
export type IRoute = {
  path: string
  getUrl: (param: string, slug?: string) => string
}
