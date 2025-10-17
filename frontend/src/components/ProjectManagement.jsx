import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, updateProject, deleteProject, getUsers } from '../services/api';

function ProjectManagement() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    status: 'active',
    supervisorId: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getProjects();
      setProjects(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project._id);
    setFormData({
      name: project.name,
      description: project.description || '',
      budget: project.budget || '',
      status: project.status,
      supervisorId: project.supervisorId?._id || ''
    });
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      budget: '',
      status: 'active',
      supervisorId: ''
    });
    setError(null);
  };

  const handleUpdate = async (projectId) => {
    try {
      setLoading(true);
      const updateData = {
        name: formData.name,
        description: formData.description,
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        status: formData.status,
        supervisorId: formData.supervisorId || null
      };

      await updateProject(projectId, updateData);
      setSuccess('Project updated successfully!');
      setEditingProject(null);
      fetchProjects();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId, projectName) => {
    if (!window.confirm(`Are you sure you want to delete project "${projectName}"?\n\nThis will also delete all associated expenses and receipts!`)) {
      return;
    }

    try {
      setLoading(true);
      await deleteProject(projectId);
      setSuccess('Project deleted successfully!');
      fetchProjects();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Project Management</h1>
        <button
          onClick={() => navigate('/')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
        >
          ← Back to Projects
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {loading && projects.length === 0 ? (
        <p className="text-center py-8 text-gray-500">Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className="text-center py-8 text-gray-500">No projects found.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Project Name</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Owner</th>
                <th className="px-4 py-3 text-left">Supervisor</th>
                <th className="px-4 py-3 text-left">Budget</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id} className="border-t hover:bg-gray-50">
                  {editingProject === project._id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {project.userId?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          value={formData.supervisorId}
                          onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
                        >
                          <option value="">-- No Supervisor --</option>
                          {users.map(user => (
                            <option key={user._id} value={user._id}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          className="w-full p-2 border border-gray-300 rounded"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="w-full p-2 border border-gray-300 rounded"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="on-hold">On Hold</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleUpdate(project._id)}
                          disabled={loading}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-2 disabled:bg-gray-400"
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={loading}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded disabled:bg-gray-400"
                        >
                          ✗ Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-semibold">{project.name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {project.description || <span className="text-gray-400 italic">No description</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white mr-2">
                            {project.userId?.name?.charAt(0) || '?'}
                          </div>
                          <span>{project.userId?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {project.supervisorId ? (
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white mr-2">
                              {project.supervisorId.name?.charAt(0) || '?'}
                            </div>
                            <span>{project.supervisorId.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No supervisor</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {project.budget > 0 ? `฿${project.budget.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-sm ${
                          project.status === 'active' ? 'bg-green-100 text-green-800' :
                          project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => navigate(`/project/${project._id}`)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2"
                        >
                          👁 View
                        </button>
                        <button
                          onClick={() => handleEdit(project)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(project._id, project.name)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProjectManagement;
