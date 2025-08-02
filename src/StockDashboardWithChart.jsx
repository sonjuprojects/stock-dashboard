import React, { useState } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';

const StockDashboardWithChart = () => {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = 'https://stock.indianapi.in/stock';
  const API_KEY = process.env.REACT_APP_API_KEY; // replace with your API key

  const fetchStockData = async () => {
    if (!symbol) return;

    setLoading(true);
    setError('');
    setStockData(null);

    try {
      const response = await axios.get(`${API_URL}?name=${symbol}`, {
        headers: { 'X-Api-Key': `${API_KEY}` },
      });

      if (response.data) {
        setStockData(response.data);
      } else {
        setError('No data found.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFinancial = (key) => {
    const fin = stockData?.financials?.[0]?.stockFinancialMap;
    const inc = fin?.INC?.find(d => d.key === key)?.value;
    const bal = fin?.BAL?.find(d => d.key === key)?.value;
    return inc || bal || '-';
  };

  const getChangeClass = (value) => {
    const str = String(value ?? '');
    if (!str || str === 'NaN') return 'text-gray-600 dark:text-gray-300';
    return str.startsWith('-') ? 'text-red-500' : 'text-green-500';
  };

  const exportPeersToCSV = () => {
    if (!stockData?.companyProfile?.peerCompanyList?.length) return;

    const rows = stockData.companyProfile.peerCompanyList;
    const csvContent = [
      ['Company', 'Price', 'Change', 'Percent Change', 'Rating'],
      ...rows.map(peer => [
        peer.companyName,
        peer.price,
        peer.netChange,
        peer.percentChange,
        peer.overallRating
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `peer-comparison-${symbol}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 text-gray-800 dark:text-gray-100">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">📊 Stock Dashboard</h1>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">by Sanjay</p>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Enter stock symbol (e.g., INFY)"
            className="flex-grow px-4 py-2 border rounded-md text-lg shadow-sm bg-white dark:bg-gray-700 dark:text-white"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow"
            onClick={fetchStockData}
          >
            Fetch
          </button>
        </div>

        {loading && <p className="text-center text-gray-500 dark:text-gray-300">Fetching stock data...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {stockData && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
                <h3 className="text-gray-500 dark:text-gray-300 text-sm">Company</h3>
                <p className="text-lg font-semibold">{stockData.companyName}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
                <h3 className="text-gray-500 dark:text-gray-300 text-sm">Industry</h3>
                <p className="text-lg">{stockData.industry}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
                <h3 className="text-gray-500 dark:text-gray-300 text-sm">52W High / Low</h3>
                <p className="text-lg">₹{stockData.yearHigh} / ₹{stockData.yearLow}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
                <h3 className="text-gray-500 dark:text-gray-300 text-sm">NSE Price</h3>
                <p className="text-xl font-bold text-blue-600">₹{stockData.currentPrice?.NSE}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
                <h3 className="text-gray-500 dark:text-gray-300 text-sm">BSE Price</h3>
                <p className="text-xl font-bold text-blue-600">₹{stockData.currentPrice?.BSE}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
                <h3 className="text-gray-500 dark:text-gray-300 text-sm">Change</h3>
                <p className={`text-xl font-semibold ${getChangeClass(stockData.percentChange)}`}>
                  {stockData.percentChange}%
                </p>
              </div>
            </div>

            {stockData.stockTechnicalData?.length > 0 && (
              <div className="bg-white dark:bg-gray-700 p-4 rounded-2xl shadow mb-10">
                <h2 className="text-lg font-semibold mb-3">📈 Price Trend</h2>
                <Chart
                  type="line"
                  height={300}
                  series={[{
                    name: 'NSE Price',
                    data: stockData.stockTechnicalData.map(d => parseFloat(d.nsePrice))
                  }]}
                  options={{
                    chart: { toolbar: { show: false } },
                    xaxis: {
                      categories: stockData.stockTechnicalData.map(d => `${d.days}D`)
                    },
                    stroke: { curve: 'smooth', width: 3 },
                    colors: ['#3B82F6'],
                  }}
                />
              </div>
            )}

            <div className="mb-12">
              <h2 className="text-lg font-semibold mb-3">💰 Financials</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-sm">
                {['TotalRevenue', 'NetIncome', 'DilutedEPSExcludingExtraOrdItems', 'TotalAssets', 'TotalEquity'].map(key => (
                  <div key={key} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
                    <h4 className="text-gray-500 dark:text-gray-300 text-xs">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <p className="font-medium">₹{getFinancial(key)}</p>
                  </div>
                ))}
              </div>
            </div>

            {stockData.companyProfile?.peerCompanyList?.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">👥 Peer Comparison</h2>
                  <button
                    onClick={exportPeersToCSV}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >⬇️ Export CSV</button>
                </div>
                <div className="overflow-x-auto rounded-xl shadow-sm">
                  <table className="min-w-full text-sm border border-gray-200 dark:border-gray-600">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-100">
                      <tr>
                        <th className="p-3 text-left">Company</th>
                        <th className="p-3 text-center">Price</th>
                        <th className="p-3 text-center">Change</th>
                        <th className="p-3 text-center">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                      {stockData.companyProfile.peerCompanyList.map((peer, idx) => (
                        <tr key={idx} className="border-t border-gray-200 dark:border-gray-600">
                          <td className="px-4 py-2 flex items-center gap-2">
                            <img src={peer.imageUrl} alt={peer.companyName} className="h-6 w-6 rounded-full" />
                            {peer.companyName}
                          </td>
                          <td className="text-center">₹{peer.price}</td>
                          <td className={`text-center ${getChangeClass(peer.percentChange)}`}> {peer.netChange} ({peer.percentChange}%)</td>
                          <td className="text-center">{peer.overallRating}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StockDashboardWithChart;
