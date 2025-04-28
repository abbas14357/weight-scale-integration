import { NextResponse } from 'next/server';
import { SerialPort } from 'serialport';

// This will store our serial port connection
let port: SerialPort | null = null;
// Variable to store the latest weight
let latestWeight: string = '';

// Initialize the serial port connection when the API route is first called
function initializeSerialPort(): void {
  if (!port) {
    try {
      // Replace with your actual COM port
      const COM_PORT = 'COM1';
      
      port = new SerialPort({
        path: COM_PORT,
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      });
      
      // Listen for data from the scale
      port.on('data', (data: Buffer) => {

        const hexData = data.toString('hex').toUpperCase(); // raw hex string
        console.log(`Raw data received: HEX [${hexData}]`);
      
        try {
          // Each byte = 2 hex chars. Remove 4 bytes (8 chars) from start, 6 bytes (12 chars) from end
          if (hexData.length > 20) {
            const slicedHex = hexData.slice(4,18); // remove 4 bytes start, 6 bytes end
            console.log('slice log:', slicedHex);
            
            const asciiWeight = Buffer.from(slicedHex, 'hex').toString('ascii');
      
            const weight = parseInt(asciiWeight, 10)/10;
            if (!isNaN(weight)) {
              latestWeight = `${weight}`;
              console.log('✅ Parsed weight:', latestWeight);
            } else {
              console.log('⚠️ Could not parse weight from:', asciiWeight);
            }
          } else {
            console.log('⚠️ Data too short to parse');
          }
        } catch (_error) {
          console.log('❌ Error while parsing:', _error);
          latestWeight = 'Error: Could not connect to scale';
        }
      });
      
      console.log(`📦 Listening to scale on ${COM_PORT}`);
    } catch (error) {
      console.error('Failed to initialize serial port:', error);
      latestWeight = 'Error: Could not connect to scale';
    }
  }
}

export async function GET() {
  // Initialize the serial port connection if it hasn't been already
  if (process.env.NODE_ENV !== 'development' || !port) {
    initializeSerialPort();
  }
  
  return NextResponse.json({ weight: latestWeight });
}