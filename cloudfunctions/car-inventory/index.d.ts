
interface Vehicle {
    vin: string;
    series: string;
    model: string;
    configuration: string;
    color: string;
    productionDate: string;
  }
  
  interface CloudFunctionEvent {
    action: 'batchImport' | 'queryInventory';
    data: {
      vehicles?: Vehicle[];
      sql?: string;
      params?: any[];
    };
  }
  
  export declare function main(
    event: CloudFunctionEvent,
    context: any
  ): Promise<any>;
    