'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { VehicleInfo, Transaction } from '@/types';
import Navbar from '@/components/navbar';


export default function Home() {
  // State for vehicle and driver information
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    vehicleNumber: '',
    driverName: '',
    material: '',
    company: '',
    notes: ''
  });

  // State for weights
  const [firstWeight, setFirstWeight] = useState<number | null>(null);
  const [secondWeight, setSecondWeight] = useState<number | null>(null);
  const [netWeight, setNetWeight] = useState<number | null>(null);
  const [currentWeight, setCurrentWeight] = useState<string>('Connecting...');

  // State for recording status
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingType, setRecordingType] = useState<'first' | 'second' | null>(null);

  // State for transaction history
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVehicleInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch weight data from the API
  useEffect(() => {
    const fetchWeight = async (): Promise<void> => {
      try {
        const response = await fetch('/api/weight');
        const data: { weight: string } = await response.json();
        setCurrentWeight(data.weight ? `${data.weight} kg` : 'Waiting for scale...');
      } catch (error) {
        setCurrentWeight('Error connecting to scale');
        console.error('Error fetching weight:', error);
      }
      // setCurrentWeight(`${Math.random()} kg`);
    };

    // Poll the weight endpoint every second
    const interval = setInterval(fetchWeight, 1000);
    return () => clearInterval(interval);
  }, []);

  // Record weight (first or second)
  const recordWeight = (type: 'first' | 'second'): void => {
    const weightValue = parseFloat(currentWeight.replace(' kg', ''));

    if (isNaN(weightValue)) {
      alert('Cannot record weight. Scale not connected or reading invalid.');
      return;
    }

    if (type === 'first') {
      setFirstWeight(weightValue);
      setRecordingType('first');
    } else {
      setSecondWeight(weightValue);
      setRecordingType('second');

      // Calculate net weight if first weight exists
      if (firstWeight !== null) {
        const net = Math.abs(weightValue - firstWeight);
        setNetWeight(net);
      }
    }

    setIsRecording(true);

    // Auto-disable recording after 2 seconds to provide feedback
    setTimeout(() => {
      setIsRecording(false);
      setRecordingType(null);
    }, 2000);
  };

  // Save the transaction
  const saveTransaction = async (): Promise<void> => {
    if (!vehicleInfo.vehicleNumber || firstWeight === null || secondWeight === null || netWeight === null) {
      alert('Please fill in vehicle number and record both weights');
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      ...vehicleInfo,
      firstWeight,
      secondWeight,
      netWeight
    };

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // If authentication is required, you may also need Authorization header
          // 'Authorization': 'Bearer your-token-here'
        },
        body: JSON.stringify({
          first_weight: firstWeight, 
          second_weight: secondWeight,
          net_weight: netWeight, 
          vehicle_no: vehicleInfo.vehicleNumber,
          driver_name: vehicleInfo.driverName,
          company_name: vehicleInfo.company, 
          material: vehicleInfo.material,
          note: vehicleInfo.notes
        })
      });

      console.log('after save:', response.ok);

      if (response.ok === true) {
        if (response.headers.get('content-type')?.includes('application/json')) {
          const data = await response.json();
          console.log('Insert successful:', data);
        } else {
          console.log('Insert successful (no response body)');
        }
        alert('Transaction saved successfully');
        setTransactions(prev => [newTransaction, ...prev]);

        // Reset the form
        resetForm();
      } else {
        console.error('Error saving transaction:', response.statusText);
        alert('Failed to save transaction');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving transaction');
    }
  };


  // Reset the form
  const resetForm = (): void => {
    setVehicleInfo({
      vehicleNumber: '',
      driverName: '',
      material: '',
      company: '',
      notes: ''
    });
    setFirstWeight(null);
    setSecondWeight(null);
    setNetWeight(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar /> {/* ✅ Navbar added here */}

      <main className="container mx-auto max-w-screen-xl py-8 px-4">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
          {/* Left Column - Vehicle Information */}
          <div className="bg-white rounded-lg shadow p-6 min-w-0">
            <h2 className="text-lg font-semibold mb-4">Vehicle Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Vehicle Number</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={vehicleInfo.vehicleNumber}
                  onChange={handleInputChange}
                  className="mt-0 block w-full text-sm font-light px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Driver Name</label>
                <input
                  type="text"
                  name="driverName"
                  value={vehicleInfo.driverName}
                  onChange={handleInputChange}
                  className="mt-0 block w-full text-sm font-light px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Material</label>
                <input
                  type="text"
                  name="material"
                  value={vehicleInfo.material}
                  onChange={handleInputChange}
                  className="mt-0 block w-full text-sm font-light px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Company</label>
                <input
                  type="text"
                  name="company"
                  value={vehicleInfo.company}
                  onChange={handleInputChange}
                  className="mt-0 block w-full text-sm font-light px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  value={vehicleInfo.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-0 block w-full text-sm font-light px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Middle Column - Weight Recording */}
          <div className="bg-white rounded-lg shadow p-6 min-w-0">
            <h2 className="text-lg font-semibold mb-4">Weight Recording</h2>

            <div className="mb-6">
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Current Weight</p>
                <p className="text-2xl font-bold text-blue-600">{currentWeight}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">First Weight</p>
                <p className="text-2xl font-bold">
                  {firstWeight !== null ? `${firstWeight} kg` : '--'}
                </p>
                <button
                  onClick={() => recordWeight('first')}
                  className={`mt-2 w-full px-2 py-1 rounded-md text-white font-normal ${isRecording && recordingType === 'first'
                    ? 'bg-green-500'
                    : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                  {isRecording && recordingType === 'first' ? 'Recorded!' : 'Record First'}
                </button>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Second Weight</p>
                <p className="text-2xl font-bold">
                  {secondWeight !== null ? `${secondWeight} kg` : '--'}
                </p>
                <button
                  onClick={() => recordWeight('second')}
                  className={`mt-2 w-full px-2 py-1 rounded-md text-white font-normal ${isRecording && recordingType === 'second'
                    ? 'bg-green-500'
                    : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  disabled={firstWeight === null}
                >
                  {isRecording && recordingType === 'second' ? 'Recorded!' : 'Record Second'}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-center mb-6">
              <p className="text-sm text-blue-500">Net Weight</p>
              <p className="text-2xl font-bold text-blue-700">
                {netWeight !== null ? `${netWeight} kg` : '--'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={saveTransaction}
                className="w-full px-2 py-1 bg-green-500 text-white font-normal rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                disabled={!vehicleInfo.vehicleNumber || firstWeight === null || secondWeight === null}
              >
                Save Transaction
              </button>

              <button
                onClick={resetForm}
                className="w-full px-2 py-1 bg-gray-500 text-white font-normal rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Reset Form
              </button>
            </div>
          </div>

          {/* Right Column - Transaction History */}
          <div className="bg-white rounded-lg shadow p-6 min-w-0">
            <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>

            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No transactions recorded yet</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{transaction.vehicleNumber}</h3>
                        <p className="text-sm text-gray-500">{transaction.timestamp}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{transaction.netWeight} kg</p>
                        <p className="text-xs text-gray-500">
                          {transaction.firstWeight} kg → {transaction.secondWeight} kg
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 text-sm">
                      {transaction.driverName && (
                        <p><span className="text-gray-500">Driver:</span> {transaction.driverName}</p>
                      )}
                      {transaction.material && (
                        <p><span className="text-gray-500">Material:</span> {transaction.material}</p>
                      )}
                      {transaction.company && (
                        <p><span className="text-gray-500">Company:</span> {transaction.company}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Vehicle Weight Management System</p>
      </footer>
    </div>
  );
}
