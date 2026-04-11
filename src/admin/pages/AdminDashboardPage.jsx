import React from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { usePortfolioData } from '../../context/PortfolioDataContext'

function StatCard({ label, value }) {
  return (
    <div className="dashboard-stat-card">
      <p className="dashboard-stat-label">{label}</p>
      <p className="dashboard-stat-value">{value}</p>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { services, projects, socialLinks, messages, blogs, education } = usePortfolioData()
  const recentServices = [...services].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4)
  const recentProjects = [...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4)
  const recentBlogs = [...blogs].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4)
  const recentMessages = [...messages].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 5)

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Overview of your portfolio content and quick actions."
      actions={
        <>
          <Link className="admin-action-btn admin-action-btn-primary" to="/admin/services">Add Service</Link>
          <Link className="admin-action-btn admin-action-btn-secondary" to="/admin/education">Add Education</Link>
          <Link className="admin-action-btn admin-action-btn-secondary" to="/admin/projects">Add Project</Link>
          <Link className="admin-action-btn admin-action-btn-secondary" to="/admin/blog">Add Blog Post</Link>
        </>
      }
    >
      <div className="dashboard-stats-grid">
        <StatCard label="Total Services" value={services.length} />
        <StatCard label="Education Records" value={education.length} />
        <StatCard label="Total Projects" value={projects.length} />
        <StatCard label="Blog Posts" value={blogs.length} />
        <StatCard label="Social Links" value={socialLinks.length} />
        <StatCard label="Contact Messages" value={messages.length} />
      </div>

      <div className="dashboard-sections-grid">
        <section className="dashboard-section-card">
          <h3 className="dashboard-section-title">Recent Services</h3>
          <div>
            {recentServices.length === 0 ? <p className="dashboard-empty-state">No services yet</p> : null}
            {recentServices.map((item) => (
              <div key={item.id} className="dashboard-list-item">
                <p className="dashboard-list-item-title">{item.title}</p>
                <p className="dashboard-list-item-subtitle">{item.category || 'General'} · Order {item.displayOrder}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-section-card">
          <h3 className="dashboard-section-title">Recent Projects</h3>
          <div>
            {recentProjects.length === 0 ? <p className="dashboard-empty-state">No projects yet</p> : null}
            {recentProjects.map((item) => (
              <div key={item.id} className="dashboard-list-item">
                <p className="dashboard-list-item-title">{item.title}</p>
                <p className="dashboard-list-item-subtitle">{item.category || 'General'} · {item.projectStatus}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-section-card">
          <h3 className="dashboard-section-title">Recent Blog Posts</h3>
          <div>
            {recentBlogs.length === 0 ? <p className="dashboard-empty-state">No blog posts yet</p> : null}
            {recentBlogs.map((item) => (
              <div key={item.id} className="dashboard-list-item">
                <p className="dashboard-list-item-title">{item.title}</p>
                <p className="dashboard-list-item-subtitle">{item.category || 'General'} · {item.isPublished ? 'Published' : 'Draft'}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-section-card">
          <h3 className="dashboard-section-title">Recent Messages</h3>
          <div>
            {recentMessages.length === 0 ? <p className="dashboard-empty-state dashboard-empty-state-centered">No messages yet</p> : null}
            {recentMessages.map((item) => (
              <div key={item.id} className="dashboard-list-item">
                <p className="dashboard-list-item-title">{item.fullName}</p>
                <p className="dashboard-list-item-subtitle">{item.subject || 'No subject'}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="dashboard-quick-actions-grid">
        <Link className="dashboard-quick-action-link" to="/admin/services">Add Service</Link>
        <Link className="dashboard-quick-action-link" to="/admin/education">Manage Education</Link>
        <Link className="dashboard-quick-action-link" to="/admin/projects">Add Project</Link>
        <Link className="dashboard-quick-action-link" to="/admin/blog">Manage Blog</Link>
        <Link className="dashboard-quick-action-link" to="/admin/messages">View Messages</Link>
        <Link className="dashboard-quick-action-link" to="/admin/reviews">Moderate Reviews</Link>
        <Link className="dashboard-quick-action-link" to="/admin/settings">Update Portfolio</Link>
      </div>
    </AdminLayout>
  )
}

