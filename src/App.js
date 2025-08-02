{stockData.companyProfile?.peerCompanyList?.length > 0 && (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-lg font-semibold">👥 Peer Comparison</h2>
      <button
        onClick={exportPeersToCSV}
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
      >
        ⬇️ Export CSV
      </button>
    </div>
