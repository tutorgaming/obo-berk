import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjectsByUser, createProject } from '../services/api';

function ProjectList({ userId, userName }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchProjects();
    }
  }, [userId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getProjectsByUser(userId);
      setProjects(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const projectData = {
        ...formData,
        userId,
        budget: parseFloat(formData.budget) || 0
      };
      const response = await createProject(projectData);
      setProjects([response.data, ...projects]);
      setFormData({ name: '', description: '', budget: '' });
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Projects for {userName}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
        >
          {showForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Project Name *</label>
            <input
              type="text"
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-lg"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Budget (฿)</label>
            <input
              type="number"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      )}

      {loading && projects.length === 0 ? (
        <p className="text-center py-8 text-gray-500">Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className="text-center py-8 text-gray-500">No projects yet. Create one to get started!</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <div
              key={project._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/project/${project._id}`)}
            >
              <h3 className="text-xl font-semibold mb-2 text-blue-600">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-gray-600 mb-2 text-sm line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="flex justify-between items-center mt-3 text-sm">
                <span className={`px-2 py-1 rounded ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
                {project.budget > 0 && (
                  <span className="text-gray-600">
                    Budget: ฿{project.budget.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectList;
