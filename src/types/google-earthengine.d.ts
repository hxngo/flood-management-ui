// Google Earth Engine 타입 정의
declare module '@google/earthengine' {
  namespace data {
    function authenticateViaPrivateKey(privateKey: object, onSuccess: () => void, onError: (err: Error) => void): void;
  }
  function initialize(opt_baseurl: string | null, opt_tileurl: string | null, onSuccess: () => void, onError: (err: Error) => void): void;
  
  namespace Geometry {
    function Point(coordinates: [number, number]): any;
  }
  
  namespace ImageCollection {
    interface Collection {
      filterDate(startDate: string, endDate: string): Collection;
      filterBounds(point: any): Collection;
      sort(property: string): Collection;
      first(): any;
    }
  }
  
  interface ImageType {
    getMapId(params: any, callback: (mapId: any, error: Error | null) => void): void;
  }
  
  function ImageCollection(name: string): ImageCollection.Collection;
  
  const ee: {
    data: typeof data;
    initialize: typeof initialize;
    Geometry: typeof Geometry;
    ImageCollection: typeof ImageCollection;
  };
  
  export default ee;
}
