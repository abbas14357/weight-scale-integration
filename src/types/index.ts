export interface VehicleInfo {
    vehicleNumber: string;
    driverName: string;
    material: string;
    company: string;
    notes: string;
  }
  
  export interface Transaction extends VehicleInfo {
    id: number;
    timestamp: string;
    firstWeight: number;
    secondWeight: number;
    netWeight: number;
  }