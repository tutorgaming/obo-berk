import { useState, useEffect } from 'react';
import { getUsers, createUser } from '../services/api';

function UserSelection({ selectedUser, setSelectedUser }) {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await createUser(formData);
      setUsers([response.data, ...users]);
      setSelectedUser(response.data);
      setFormData({ name: '', email: '', position: '' });
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Select User</h2>

      {/* Tips */}
      <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
        <p className="text-xs text-gray-600">
          💡 <strong>First Time User:</strong> กรุณา Add User ตัวเอง และ User ที่เป็นชื่อหัวหน้าด้วย จะได้มีช่องเซนต์หัวหน้า
        </p>
        <p className="text-xs text-gray-600 mt-1">
          ℹ️ ถ้าไม่มีชื่อหัวหน้า ตรงที่เซนต์อนุมัติจะมีบรรทัดชื่อเราอันเดียว
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* User Selection */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Choose existing user:</label>
        <select
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={selectedUser?._id || ''}
          onChange={(e) => {
            const user = users.find(u => u._id === e.target.value);
            setSelectedUser(user);
          }}
          disabled={loading}
        >
          <option value="">-- Select User --</option>
          {users.map(user => (
            <option key={user._id} value={user._id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      {selectedUser && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-gray-600">Selected User:</p>
          <p className="font-semibold text-lg">{selectedUser.name}</p>
          <p className="text-sm text-gray-600">{selectedUser.email}</p>
          {selectedUser.position && (
            <p className="text-sm text-gray-600">Position: {selectedUser.position}</p>
          )}
        </div>
      )}

      {/* Create New User */}
      <div className="mt-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
        >
          {showForm ? 'Cancel' : 'Create New User'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Position</label>
            <input
              type="text"
              placeholder="e.g., Manager, Engineer, Accountant"
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      )}
    </div>
  );
}

export default UserSelection;
