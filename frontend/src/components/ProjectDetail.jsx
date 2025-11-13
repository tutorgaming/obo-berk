import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, getExpensesByProject, createExpense, updateExpense, deleteExpense, exportProjectPDF } from '../services/api';

// Utility function to get current date in Thailand timezone (UTC+7)
const getThailandDate = (dateString = null) => {
  const date = dateString ? new Date(dateString) : new Date();
  // Convert to Thailand timezone (UTC+7)
  const thailandTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
  // Return in YYYY-MM-DD format for date input
  return thailandTime.toISOString().split('T')[0];
};

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
  const [onlyWithReceipts, setOnlyWithReceipts] = useState(false);
  const [formData, setFormData] = useState({
    shop_name: '',
    detail: '',
    type: 'eating',
    amount: '',
    date: getThailandDate(),
    notes: '',
    receipt: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shopNameSuggestions, setShopNameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [ocrProcessing, setOcrProcessing] = useState(false);

  // N8N API Configuration
  const N8N_OCR_API_URL = 'https://your-n8n-instance.com/webhook/ocr-receipt'; // Replace with your n8n webhook URL
  const ENABLE_OCR_FEATURE = false; // Set to false to disable OCR button

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

  // Get unique shop names for autocomplete
  useEffect(() => {
    const uniqueShops = [...new Set(expenses.map(exp => exp.shop_name).filter(Boolean))];
    setShopNameSuggestions(uniqueShops);
  }, [expenses]);

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
      data.append('shop_name', formData.shop_name);
      data.append('detail', formData.detail);
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
        shop_name: '',
        detail: '',
        type: 'eating',
        amount: '',
        date: getThailandDate(),
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

  const handleShopNameChange = (value) => {
    setFormData({ ...formData, shop_name: value });
    setShowSuggestions(value.length > 0);
    setSelectedSuggestionIndex(-1);
  };

  const handleSelectSuggestion = (shopName) => {
    setFormData({ ...formData, shop_name: shopName });
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const getFilteredSuggestions = () => {
    if (!formData.shop_name) return shopNameSuggestions;
    const searchTerm = formData.shop_name.toLowerCase();
    return shopNameSuggestions.filter(shop =>
      shop.toLowerCase().includes(searchTerm)
    );
  };

  const handleShopNameKeyDown = (e) => {
    const filteredSuggestions = getFilteredSuggestions();

    if (!showSuggestions || filteredSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(filteredSuggestions[selectedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleOCRUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    try {
      setOcrProcessing(true);

      // Create FormData to send image
      const formData = new FormData();
      formData.append('image', file);

      // TODO: Replace with actual n8n API call
      // const response = await fetch(N8N_OCR_API_URL, {
      //   method: 'POST',
      //   body: formData,
      // });
      // const data = await response.json();

      // Simulate API response for now
      console.log('Uploading to n8n OCR API:', N8N_OCR_API_URL);
      console.log('File:', file.name);

      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Example response structure from n8n:
      // {
      //   "shop_name": "7-Eleven",
      //   "amount": "150.50",
      //   "date": "2025-11-13",
      //   "detail": "Snacks and drinks",
      //   "type": "eating"
      // }

      // Simulated response - Replace this with actual API call
      const mockOCRResult = {
        shop_name: "7-Eleven (OCR)",
        amount: "125.50",
        date: getThailandDate(),
        detail: "Processed from receipt image",
        type: "eating"
      };

      // Auto-fill form with OCR results
      setFormData(prev => ({
        ...prev,
        shop_name: mockOCRResult.shop_name || prev.shop_name,
        amount: mockOCRResult.amount || prev.amount,
        date: mockOCRResult.date || prev.date,
        detail: mockOCRResult.detail || prev.detail,
        type: mockOCRResult.type || prev.type,
      }));

      alert('✅ OCR processing complete! Form auto-filled with detected information.');

    } catch (error) {
      console.error('OCR processing error:', error);
      alert('❌ Failed to process image. Please try again or fill the form manually.');
    } finally {
      setOcrProcessing(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense._id);
    setCurrentExpense(expense); // Store current expense to show existing receipt
    setFormData({
      shop_name: expense.shop_name || '',
      detail: expense.detail || '',
      type: expense.type,
      amount: expense.amount,
      date: getThailandDate(expense.date),
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
      data.append('shop_name', formData.shop_name);
      data.append('detail', formData.detail);
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
        shop_name: '',
        detail: '',
        type: 'eating',
        amount: '',
        date: getThailandDate(),
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
      shop_name: '',
      detail: '',
      type: 'eating',
      amount: '',
      date: getThailandDate(),
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
      const response = await exportProjectPDF(projectId, selectedType, onlyWithReceipts);

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
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="onlyWithReceipts"
                checked={onlyWithReceipts}
                onChange={(e) => setOnlyWithReceipts(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label htmlFor="onlyWithReceipts" className="text-sm text-gray-700 cursor-pointer">
                Only receipts with images
              </label>
            </div>
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

            {/* OCR Upload Button */}
            {!editingExpense && (
              <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-purple-800">
                      🤖 Smart OCR - Auto-fill from Receipt
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      API: {N8N_OCR_API_URL}
                    </p>
                    {!ENABLE_OCR_FEATURE && (
                      <p className="text-xs text-red-500 mt-0.5 font-semibold">
                        ⚠️ Feature currently disabled - ตต เหน่ยก่อน 5555
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      !ENABLE_OCR_FEATURE || ocrProcessing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg cursor-pointer'
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleOCRUpload}
                        disabled={!ENABLE_OCR_FEATURE || ocrProcessing}
                      />
                      {ocrProcessing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          📸 Upload Receipt for OCR
                        </>
                      )}
                    </label>
                  </div>
                </div>
                {/* <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Take a clear photo of your receipt for best results
                </p> */}
              </div>
            )}

            <div className="flex gap-6">
              {/* Form Fields - Left Side */}
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-gray-700 mb-1">Shop Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 7-Eleven, McDonald's"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={formData.shop_name}
                      onChange={(e) => handleShopNameChange(e.target.value)}
                      onKeyDown={handleShopNameKeyDown}
                      onFocus={() => setShowSuggestions(formData.shop_name.length > 0)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      autoComplete="off"
                    />
                    {showSuggestions && getFilteredSuggestions().length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {getFilteredSuggestions().map((shop, index) => (
                          <div
                            key={index}
                            className={`px-4 py-2 cursor-pointer text-sm ${
                              index === selectedSuggestionIndex
                                ? 'bg-blue-500 text-white'
                                : 'hover:bg-blue-100'
                            }`}
                            onClick={() => handleSelectSuggestion(shop)}
                          >
                            {shop}
                          </div>
                        ))}
                      </div>
                    )}
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
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-1">Detail</label>
                    <input
                      type="text"
                      placeholder="e.g., Lunch for team meeting, Taxi to client office"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={formData.detail}
                      onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                    />
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
                  <th className="px-4 py-2 text-left">Shop / Detail</th>
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
                      {new Date(expense.date).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' })}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        {expense.shop_name && (
                          <p className="font-semibold text-gray-900">🏪 {expense.shop_name}</p>
                        )}
                        {expense.detail && (
                          <p className="text-sm text-gray-600 mt-1">{expense.detail}</p>
                        )}
                        {expense.notes && (
                          <p className="text-xs text-gray-400 mt-1 italic">Note: {expense.notes}</p>
                        )}
                      </div>
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
