import React, { useEffect, useState } from 'react';
import { getLoginHistory, getActivityLog, getTransactionLog } from '../services/database';

interface AuditLogViewerProps {
  onClose?: () => void;
}

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'logins' | 'activities' | 'transactions'>('logins');
  const [logins, setLogins] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState('');

  useEffect(() => {
    loadAuditData();
    // Listen for DB changes
    const handleDbChange = () => {
      loadAuditData();
    };
    window.addEventListener('deepthi-db-changed', handleDbChange);
    return () => window.removeEventListener('deepthi-db-changed', handleDbChange);
  }, []);

  const loadAuditData = async () => {
    setLoading(true);
    try {
      const loginData = getLoginHistory();
      const activityData = getActivityLog(undefined, 1000);
      const txnData = getTransactionLog(undefined, 1000);
      setLogins(loginData);
      setActivities(activityData);
      setTransactions(txnData);
    } catch (e) {
      console.warn('Error loading audit data', e);
    }
    setLoading(false);
  };

  const filteredLogins = filterUser ? logins.filter(l => l.email?.includes(filterUser) || l.userId?.includes(filterUser)) : logins;
  const filteredActivities = filterUser ? activities.filter(a => a.userId?.includes(filterUser) || a.description?.includes(filterUser)) : activities;
  const filteredTransactions = filterUser ? transactions.filter(t => t.userId?.includes(filterUser)) : transactions;

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 border-b gap-2">
        <h2 className="text-xl sm:text-2xl font-bold">Audit & Activity Log</h2>
        {onClose && <button onClick={onClose} className="px-3 sm:px-4 py-2 rounded border hover:bg-gray-50 text-xs sm:text-sm">Close</button>}
      </div>

      {/* Filter */}
      <div className="px-3 sm:px-6 py-2 sm:py-4 bg-[#FAF9F6] border-b">
        <input
          type="text"
          placeholder="Filter by user ID or email..."
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="w-full p-2 sm:p-3 rounded border border-gray-100 outline-none focus:border-[#2D5A27] text-xs sm:text-base"
        />
        <p className="text-xs text-gray-500 mt-2">Showing: {activeTab === 'logins' ? filteredLogins.length : activeTab === 'activities' ? filteredActivities.length : filteredTransactions.length} records</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-0 border-b bg-white">
        <button
          onClick={() => setActiveTab('logins')}
          className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-widest border-b-2 transition ${activeTab === 'logins' ? 'border-[#2D5A27] text-[#2D5A27]' : 'border-transparent text-gray-400'}`}
        >
          🔐 Logins ({filteredLogins.length})
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-widest border-b-2 transition ${activeTab === 'activities' ? 'border-[#2D5A27] text-[#2D5A27]' : 'border-transparent text-gray-400'}`}
        >
          📋 Activities ({filteredActivities.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-widest border-b-2 transition ${activeTab === 'transactions' ? 'border-[#2D5A27] text-[#2D5A27]' : 'border-transparent text-gray-400'}`}
        >
          💳 Transactions ({filteredTransactions.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading audit data...</div>
        ) : activeTab === 'logins' ? (
          <div className="space-y-3">
            {filteredLogins.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No login records found</div>
            ) : (
              filteredLogins.map((login, idx) => (
                <div key={idx} className="p-4 bg-[#FAF9F6] rounded border border-gray-100 hover:border-[#2D5A27] transition">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${login.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {login.status?.toUpperCase()}
                        </span>
                        <span className="font-bold text-sm">{login.email}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">User ID: {login.userId}</p>
                      <p className="text-xs text-gray-500">{login.notes}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono text-gray-400">
                        {new Date(login.loginTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'activities' ? (
          <div className="space-y-3">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No activity records found</div>
            ) : (
              filteredActivities.map((activity, idx) => (
                <div key={idx} className="p-4 bg-[#FAF9F6] rounded border border-gray-100 hover:border-[#2D5A27] transition">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-1 rounded bg-[#A4C639]/20 text-[#2D5A27]">
                          {activity.activityType}
                        </span>
                        <span className="font-bold text-sm">{activity.description}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">User ID: {activity.userId}</p>
                      {activity.details && Object.keys(activity.details).length > 0 && (
                        <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto max-h-20 text-gray-600">
                          {JSON.stringify(activity.details, null, 2)}
                        </pre>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono text-gray-400">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No transaction records found</div>
            ) : (
              filteredTransactions.map((txn, idx) => (
                <div key={idx} className="p-4 bg-[#FAF9F6] rounded border border-gray-100 hover:border-[#2D5A27] transition flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${txn.status === 'completed' ? 'bg-green-100 text-green-700' : txn.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {txn.status?.toUpperCase()}
                      </span>
                      <span className="font-bold text-lg">₹{txn.amount?.toLocaleString()}</span>
                      {/* Payment status dropdown */}
                      <select
                        className="ml-2 px-2 py-1 rounded border text-xs bg-white"
                        value={txn.status || 'pending'}
                        onChange={e => {
                          // Update payment status
                          const newStatus = e.target.value;
                          // Call backend API to update status
                          window.dispatchEvent(new CustomEvent('update-payment-status', { detail: { txnId: txn.id, status: newStatus } }));
                        }}
                      >
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                      </select>
                      {/* Recheck payment button */}
                      <button
                        className="ml-2 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 hover:bg-blue-200"
                        onClick={() => window.dispatchEvent(new CustomEvent('recheck-payment', { detail: { txnId: txn.id } }))}
                      >
                        Recheck Payment
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Order ID: {txn.orderId}</p>
                    <p className="text-xs text-gray-500">Payment: {txn.paymentMethod} | User: {txn.userId}</p>
                    {txn.notes && <p className="text-xs text-gray-600 mt-1">{txn.notes}</p>}
                  </div>
                  <div className="text-right min-w-[120px]">
                    <p className="text-xs font-mono text-gray-400">
                      {new Date(txn.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Refresh button */}
      <div className="p-4 border-t bg-[#FAF9F6] flex gap-2">
        <button onClick={loadAuditData} className="px-4 py-2 rounded bg-[#2D5A27] text-white text-sm font-bold">
          🔄 Refresh
        </button>
        <p className="text-xs text-gray-500 flex items-center">Auto-refreshes when DB changes</p>
      </div>
    </div>
  );
};

export default AuditLogViewer;
