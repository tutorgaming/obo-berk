import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, getExpensesByProject, createExpense, updateExpense, deleteExpense, exportProjectPDF } from '../services/api';

function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'eating',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    receipt: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProject();
    fetchExpenses();
  }, [projectId]);

  useEffect(() => {
    if (selectedType) {
      setFilteredExpenses(expenses.filter(exp => exp.type === selectedType));
    } else {
      setFilteredExpenses(expenses);
    }
  }, [selectedType, expenses]);

  // Cleanup preview URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl !== 'pdf') {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchProject = async () => {
    try {
      const response = await getProject(projectId);
      setProject(response.data);
    } catch (err) {
      setError('Failed to load project');
      console.error(err);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await getExpensesByProject(projectId);
      setExpenses(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load expenses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const data = new FormData();
      data.append('name', formData.name);
      data.append('projectId', projectId);
      data.append('type', formData.type);
      data.append('amount', formData.amount);
      data.append('date', formData.date);
      data.append('notes', formData.notes);

      if (formData.receipt) {
        data.append('receipt', formData.receipt);
      }

      const response = await createExpense(data);
      setExpenses([response.data, ...expenses]);
      setFormData({
        name: '',
        type: 'eating',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        receipt: null
      });
      setPreviewUrl(null); // Clear preview
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create expense');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, receipt: file });

      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        // For PDF files, show a placeholder
        setPreviewUrl('pdf');
      }
    } else {
      setFormData({ ...formData, receipt: null });
      setPreviewUrl(null);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense._id);
    setCurrentExpense(expense); // Store current expense to show existing receipt
    setFormData({
      name: expense.name,
      type: expense.type,
      amount: expense.amount,
      date: new Date(expense.date).toISOString().split('T')[0],
      notes: expense.notes || '',
      receipt: null
    });
    setPreviewUrl(null); // Clear preview for new uploads
    setShowForm(true);
    setError(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const data = new FormData();
      data.append('name', formData.name);
      data.append('type', formData.type);
      data.append('amount', formData.amount);
      data.append('date', formData.date);
      data.append('notes', formData.notes);

      if (formData.receipt) {
        data.append('receipt', formData.receipt);
      }

      const response = await updateExpense(editingExpense, data);
      setExpenses(expenses.map(exp => exp._id === editingExpense ? response.data : exp));
      setFormData({
        name: '',
        type: 'eating',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        receipt: null
      });
      setPreviewUrl(null);
      setEditingExpense(null);
      setCurrentExpense(null); // Clear current expense
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update expense');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    setCurrentExpense(null); // Clear current expense
    setFormData({
      name: '',
      type: 'eating',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      receipt: null
    });
    setPreviewUrl(null);
    setShowForm(false);
    setError(null);
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await deleteExpense(expenseId);
      setExpenses(expenses.filter(exp => exp._id !== expenseId));
    } catch (err) {
      setError('Failed to delete expense');
      console.error(err);
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      const response = await exportProjectPDF(projectId, selectedType);

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expenses-${project.name}-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      setError(null);
    } catch (err) {
      setError('Failed to export PDF');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
      >
        ← Back to Projects
      </button>

      {/* Project Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        {project.description && (
          <p className="text-gray-600 mb-4">{project.description}</p>
        )}
        <div className="flex gap-4 text-sm">
          <span className="text-gray-600">
            Owner: <strong>{project.userId?.name}</strong>
          </span>
          {project.budget > 0 && (
            <span className="text-gray-600">
              Budget: <strong>฿{project.budget.toLocaleString()}</strong>
            </span>
          )}
          <span className={`px-2 py-1 rounded ${
            project.status === 'active' ? 'bg-green-100 text-green-800' :
            project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {project.status}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Expenses Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Expenses</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              disabled={loading || filteredExpenses.length === 0}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
            >
              📄 Export PDF
            </button>
            <button
              onClick={() => {
                if (editingExpense) {
                  handleCancelEdit();
                } else {
                  setShowForm(!showForm);
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              {showForm ? 'Cancel' : '+ Add Expense'}
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Filter by Type:</label>
          <select
            className="p-2 border border-gray-300 rounded-lg"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="eating">Eating</option>
            <option value="traveling">Traveling</option>
            <option value="accommodation">Accommodation</option>
            <option value="equipment">Equipment</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Total */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-lg font-semibold">
            Total {selectedType ? `(${selectedType})` : ''}: ฿{totalExpenses.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Add/Edit Expense Form */}
        {showForm && (
          <form onSubmit={editingExpense ? handleUpdate : handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">
              {editingExpense ? '✏️ Edit Expense' : '➕ Add New Expense'}
            </h3>
            <div className="flex gap-6">
              {/* Form Fields - Left Side */}
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Expense Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Type *</label>
                    <select
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="eating">Eating</option>
                      <option value="traveling">Traveling</option>
                      <option value="accommodation">Accommodation</option>
                      <option value="equipment">Equipment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Amount (฿) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-gray-700 mb-1">Notes</label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows="2"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-gray-700 mb-1">Receipt (Image/PDF)</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    onChange={handleFileChange}
                  />
                  {formData.receipt && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {formData.receipt.name}
                    </p>
                  )}
                  {editingExpense && (
                    <p className="text-sm text-gray-500 mt-1">
                      💡 Leave empty to keep current receipt, or select new file to replace it
                    </p>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg disabled:bg-gray-400"
                  >
                    {loading ? (editingExpense ? 'Updating...' : 'Adding...') : (editingExpense ? '✓ Update Expense' : '+ Add Expense')}
                  </button>
                  {editingExpense && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={loading}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg disabled:bg-gray-400"
                    >
                      ✗ Cancel Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Image Preview - Right Side */}
              {(previewUrl || (editingExpense && currentExpense?.receiptFile)) && (
                <div className="w-80 flex-shrink-0">
                  <label className="block text-gray-700 mb-2 font-semibold">
                    {previewUrl ? 'New Receipt Preview' : 'Current Receipt'}
                  </label>
                  <div className="border-2 border-gray-300 rounded-lg p-2 bg-white">
                    {previewUrl ? (
                      // Show new receipt preview
                      previewUrl === 'pdf' ? (
                        <div className="flex items-center justify-center h-96 bg-gray-100 rounded">
                          <div className="text-center">
                            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-600">PDF File</p>
                            <p className="text-xs text-gray-500">{formData.receipt?.name}</p>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={previewUrl}
                          alt="New receipt preview"
                          className="w-full h-auto max-h-96 object-contain rounded"
                        />
                      )
                    ) : (
                      // Show current receipt when editing
                      editingExpense && currentExpense?.receiptFile && (
                        <>
                          {currentExpense.receiptFile.mimetype?.startsWith('image/') ? (
                            <img
                              src={`/uploads/${currentExpense.receiptFile.filename}`}
                              alt="Current receipt"
                              className="w-full h-auto max-h-96 object-contain rounded"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-96 bg-gray-100 rounded">
                              <div className="text-center">
                                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <p className="mt-2 text-sm text-gray-600">PDF File</p>
                                <p className="text-xs text-gray-500">{currentExpense.receiptFile.originalName}</p>
                                <a
                                  href={`/uploads/${currentExpense.receiptFile.filename}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                                >
                                  View PDF
                                </a>
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            Upload a new file to replace this receipt
                          </p>
                        </>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>
        )}

        {/* Expenses Table */}
        {loading && filteredExpenses.length === 0 ? (
          <p className="text-center py-8 text-gray-500">Loading expenses...</p>
        ) : filteredExpenses.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No expenses yet. Add one to get started!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-right">Amount (฿)</th>
                  <th className="px-4 py-2 text-center">Receipt</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(expense => (
                  <tr key={expense._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {new Date(expense.date).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-4 py-3">
                      {expense.name}
                      {expense.notes && (
                        <p className="text-sm text-gray-500">{expense.notes}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {expense.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {expense.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {expense.receiptFile ? (
                        <a
                          href={`/uploads/${expense.receiptFile.filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDetail;
