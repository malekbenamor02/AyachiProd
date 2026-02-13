import React, { useState, useEffect } from 'react'
import { sectionsService, sectionCategoriesService } from '../../services/sectionsService'
import ConfirmDialog from '../common/ConfirmDialog'
import ThemeSelect from '../common/ThemeSelect'
import '../../styles/index.css'

const MONTHS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 12 }, (_, i) => CURRENT_YEAR - 5 + i)

const MONTH_OPTIONS = [
  { value: '', label: '—' },
  ...MONTHS.slice(1).map((m, i) => ({ value: String(i + 1), label: m })),
]
const YEAR_SELECT_OPTIONS = [
  { value: '', label: '—' },
  ...YEAR_OPTIONS.map((y) => ({ value: String(y), label: String(y) })),
]

const SectionsEditor = ({ onBack, onStatsRefresh }) => {
  const [sections, setSections] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  const [form, setForm] = useState({
    title: '',
    category_id: '',
    section_month: '',
    section_year: '',
    alt_text: '',
  })
  const [addForm, setAddForm] = useState({
    title: '',
    category_id: '',
    section_month: '',
    section_year: '',
    alt_text: '',
  })
  const [addFile, setAddFile] = useState(null)
  const addFileInputRef = React.useRef(null)
  const [expandedWorkSectionId, setExpandedWorkSectionId] = useState(null)
  const [workImagesMap, setWorkImagesMap] = useState({})
  const [uploadingWorkSectionId, setUploadingWorkSectionId] = useState(null)
  const [uploadWorkProgress, setUploadWorkProgress] = useState(null) // 0–100 when uploading work images
  const [removingWorkImageId, setRemovingWorkImageId] = useState(null)
  const workImageInputRefs = React.useRef({})

  const loadCategories = async () => {
    try {
      const data = await sectionCategoriesService.getCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch (_) {
      setCategories([])
    }
  }

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await sectionsService.getSections()
      setSections(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message || 'Failed to load sections')
      setSections([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const handleAddCategory = async () => {
    const name = newCategoryName.trim()
    if (!name) return
    setError('')
    try {
      const created = await sectionCategoriesService.createCategory(name)
      await loadCategories()
      setAddForm((f) => ({ ...f, category_id: created?.id || '' }))
      setNewCategoryName('')
      setShowNewCategory(false)
      setToast('Category added')
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to add category')
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const file = addFile || (addFileInputRef.current?.files?.[0])
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    setUploading(true)
    setError('')
    try {
      await sectionsService.uploadSection(file, {
        title: addForm.title || 'Untitled',
        category_id: addForm.category_id || '',
        section_month: addForm.section_month || '',
        section_year: addForm.section_year || '',
        alt_text: addForm.alt_text,
      })
      setAddForm({ title: '', category_id: '', section_month: '', section_year: '', alt_text: '' })
      setAddFile(null)
      if (addFileInputRef.current) addFileInputRef.current.value = ''
      setToast('Section added')
      await load()
      onStatsRefresh?.()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleUpdate = async (id) => {
    setError('')
    try {
      await sectionsService.updateSection(id, {
        title: form.title,
        category_id: form.category_id || null,
        section_month: form.section_month || null,
        section_year: form.section_year || null,
        alt_text: form.alt_text,
      })
      setEditingId(null)
      setToast('Section updated')
      await load()
      onStatsRefresh?.()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Update failed')
    }
  }

  const [confirmRemove, setConfirmRemove] = useState(null) // { type: 'section'|'workImage', id, sectionId? }

  const handleRemove = (id) => {
    setConfirmRemove({ type: 'section', id })
  }

  const handleConfirmRemove = async () => {
    if (!confirmRemove) return
    const { type, id, sectionId } = confirmRemove
    setConfirmRemove(null)
    setRemovingId(type === 'section' ? id : null)
    setRemovingWorkImageId(type === 'workImage' ? id : null)
    setError('')
    try {
      if (type === 'section') {
        await sectionsService.deleteSection(id)
        setSections((prev) => prev.filter((s) => s.id !== id))
        setWorkImagesMap((prev) => {
          const next = { ...prev }
          delete next[id]
          return next
        })
        setToast('Section removed')
        onStatsRefresh?.()
      } else {
        await sectionsService.deleteWorkImage(sectionId, id)
        setWorkImagesMap((prev) => ({
          ...prev,
          [sectionId]: (prev[sectionId] || []).filter((img) => img.id !== id),
        }))
        setToast('Image removed')
        onStatsRefresh?.()
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Delete failed')
    } finally {
      setRemovingId(null)
      setRemovingWorkImageId(null)
    }
  }

  const move = async (index, direction) => {
    const newOrder = [...sections]
    const swap = direction === 'up' ? index - 1 : index + 1
    if (swap < 0 || swap >= newOrder.length) return
    ;[newOrder[index], newOrder[swap]] = [newOrder[swap], newOrder[index]]
    const orderedIds = newOrder.map((s) => s.id)
    setError('')
    try {
      await sectionsService.reorderSections(orderedIds)
      setToast('Order updated')
      setSections(newOrder)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Reorder failed')
    }
  }

  const startEdit = (section) => {
    setEditingId(section.id)
    setForm({
      title: section.title,
      category_id: section.category_id || '',
      section_month: section.section_month ?? '',
      section_year: section.section_year ?? '',
      alt_text: section.alt_text || '',
    })
  }

  const loadWorkImages = async (sectionId) => {
    try {
      const data = await sectionsService.getWorkImages(sectionId)
      setWorkImagesMap((prev) => ({ ...prev, [sectionId]: Array.isArray(data) ? data : [] }))
    } catch (_) {
      setWorkImagesMap((prev) => ({ ...prev, [sectionId]: [] }))
    }
  }

  const toggleWorkImages = (sectionId) => {
    if (expandedWorkSectionId === sectionId) {
      setExpandedWorkSectionId(null)
    } else {
      setExpandedWorkSectionId(sectionId)
      if (!workImagesMap[sectionId]) loadWorkImages(sectionId)
    }
  }

  const handleAddWorkImages = async (sectionId, fileList) => {
    const files = fileList ? (Array.isArray(fileList) ? fileList : [fileList]) : []
    if (files.length === 0) return
    setUploadingWorkSectionId(sectionId)
    setUploadWorkProgress(0)
    setError('')
    try {
      if (files.length === 1) {
        await sectionsService.uploadWorkImage(sectionId, files[0])
        setUploadWorkProgress(100)
        setToast('File added')
      } else {
        const result = await sectionsService.uploadWorkImagesWithProgress(
          sectionId,
          files,
          '',
          (percent) => setUploadWorkProgress((p) => (percent != null ? percent : p))
        )
        setUploadWorkProgress(100)
        if (result.failedCount > 0) {
          setToast(result.successCount > 0 ? `${result.successCount} added` : '')
          setError(
            result.successCount > 0
              ? `${result.failedCount} of ${files.length} failed: ${result.lastError || 'Unknown error'}`
              : (result.lastError || 'Upload failed')
          )
        } else {
          setToast(`${files.length} files added`)
        }
      }
      await loadWorkImages(sectionId)
      const ref = workImageInputRefs.current[sectionId]
      if (ref) ref.value = ''
      onStatsRefresh?.()
    } catch (err) {
      const message =
        (err && err.response && err.response.data && typeof err.response.data.error === 'string' && err.response.data.error) ||
        (err && typeof err.message === 'string' && err.message) ||
        'Upload failed'
      setError(message)
    } finally {
      setUploadingWorkSectionId(null)
      setUploadWorkProgress(null)
    }
  }

  const handleRemoveWorkImage = (sectionId, imageId) => {
    setConfirmRemove({ type: 'workImage', id: imageId, sectionId })
  }

  const moveWorkImage = async (sectionId, index, direction) => {
    const list = workImagesMap[sectionId] || []
    const swap = direction === 'up' ? index - 1 : index + 1
    if (swap < 0 || swap >= list.length) return
    const newOrder = [...list]
    ;[newOrder[index], newOrder[swap]] = [newOrder[swap], newOrder[index]]
    const orderedIds = newOrder.map((img) => img.id)
    setError('')
    try {
      await sectionsService.reorderWorkImages(sectionId, orderedIds)
      setWorkImagesMap((prev) => ({ ...prev, [sectionId]: newOrder }))
      setToast('Order updated')
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Reorder failed')
    }
  }

  const isSectionRemove = confirmRemove?.type === 'section'
  const isWorkImageRemove = confirmRemove?.type === 'workImage'

  return (
    <div className="sections-editor">
      <ConfirmDialog
        open={!!confirmRemove}
        title={isSectionRemove ? 'Remove section?' : 'Remove image?'}
        message={isSectionRemove
          ? 'Remove this section from the homepage?'
          : 'Remove this image from the work gallery?'}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmRemove}
        onCancel={() => setConfirmRemove(null)}
      />
      <header className="sections-editor-header">
        <h2 className="sections-editor-title">Homepage sections</h2>
        <p className="sections-editor-desc">Manage the project grid below the marquee. Choose a category (or add a new one), set month & year, and use the arrows to set order (first, second, third…).</p>
        <button type="button" onClick={onBack} className="sections-editor-back">
          ← Back to dashboard
        </button>
      </header>

      {error && <div className="sections-editor-error">{error}</div>}
      {toast && <div className="sections-editor-toast">{toast}</div>}

      <form onSubmit={handleAdd} className="sections-editor-add-card">
        <h3 className="sections-editor-add-title">Add new section</h3>
        <div className="sections-editor-add-fields">
          <label className="sections-editor-field sections-editor-field-file">
            <span className="sections-editor-label">Image</span>
            <span className="sections-editor-file-wrap">
              <input
                ref={addFileInputRef}
                type="file"
                accept="image/*"
                required
                disabled={uploading}
                onChange={(e) => setAddFile(e.target.files?.[0])}
                className="sections-editor-file-input"
              />
              <span className="sections-editor-file-label">
                {addFile ? addFile.name : 'Choose image'}
              </span>
            </span>
          </label>
          <label className="sections-editor-field">
            <span className="sections-editor-label">Title</span>
            <input
              type="text"
              placeholder="e.g. Wedding Collection"
              value={addForm.title}
              onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))}
              className="sections-editor-input"
            />
          </label>
          <label className="sections-editor-field">
            <span className="sections-editor-label">Category</span>
            {!showNewCategory ? (
              <div className="sections-editor-category-row">
                <ThemeSelect
                  name="category_id"
                  value={addForm.category_id}
                  onChange={(v) => setAddForm((f) => ({ ...f, category_id: v }))}
                  options={[{ value: '', label: 'Select category' }, ...categories.map((c) => ({ value: String(c.id), label: c.name }))]}
                  placeholder="Select category"
                  className="sections-editor-input sections-editor-select"
                />
                <button type="button" onClick={() => setShowNewCategory(true)} className="sections-editor-btn sections-editor-btn-ghost" style={{ flexShrink: 0 }}>+ New</button>
              </div>
            ) : (
              <div className="sections-editor-category-row">
                <input
                  type="text"
                  placeholder="New category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="sections-editor-input"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                />
                <button type="button" onClick={handleAddCategory} className="sections-editor-btn sections-editor-btn-primary" style={{ flexShrink: 0 }}>Add</button>
                <button type="button" onClick={() => { setShowNewCategory(false); setNewCategoryName('') }} className="sections-editor-btn sections-editor-btn-ghost" style={{ flexShrink: 0 }}>Cancel</button>
              </div>
            )}
          </label>
          <label className="sections-editor-field">
            <span className="sections-editor-label">Month</span>
            <ThemeSelect
              name="section_month"
              value={addForm.section_month}
              onChange={(v) => setAddForm((f) => ({ ...f, section_month: v }))}
              options={MONTH_OPTIONS}
              placeholder="—"
              className="sections-editor-input sections-editor-select"
            />
          </label>
          <label className="sections-editor-field sections-editor-field-year">
            <span className="sections-editor-label">Year</span>
            <ThemeSelect
              name="section_year"
              value={addForm.section_year}
              onChange={(v) => setAddForm((f) => ({ ...f, section_year: v }))}
              options={YEAR_SELECT_OPTIONS}
              placeholder="—"
              className="sections-editor-input sections-editor-select"
            />
          </label>
          <div className="sections-editor-field sections-editor-field-submit">
            <button type="submit" disabled={uploading} className="sections-editor-btn sections-editor-btn-primary">
              {uploading ? 'Adding…' : 'Add section'}
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="sections-editor-loading">
          <span className="sections-editor-loading-spinner" />
          <p>Loading sections…</p>
        </div>
      ) : (
        <div className="sections-editor-list">
          {sections.map((section, index) => (
            <article key={section.id} className="sections-editor-card">
              <div className="sections-editor-card-order">
                <span className="sections-editor-card-position" title="Order">{index + 1}</span>
                <button type="button" onClick={() => move(index, 'up')} disabled={index === 0} title="Move up" aria-label="Move up">↑</button>
                <button type="button" onClick={() => move(index, 'down')} disabled={index === sections.length - 1} title="Move down" aria-label="Move down">↓</button>
              </div>
              <div className="sections-editor-card-body">
                <div className="sections-editor-card-image-wrap">
                  <img src={section.file_url} alt={section.alt_text || section.title} className="sections-editor-card-image" />
                </div>
                {editingId === section.id ? (
                  <div className="sections-editor-card-form">
                    <input
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Title"
                      className="sections-editor-input"
                    />
                    <span className="sections-editor-label">Category</span>
                    <ThemeSelect
                      name="category_id"
                      value={form.category_id}
                      onChange={(v) => setForm((f) => ({ ...f, category_id: v }))}
                      options={[{ value: '', label: '—' }, ...categories.map((c) => ({ value: String(c.id), label: c.name }))]}
                      placeholder="—"
                      className="sections-editor-input sections-editor-select"
                    />
                    <span className="sections-editor-label">Month / Year</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <ThemeSelect
                        name="section_month"
                        value={form.section_month}
                        onChange={(v) => setForm((f) => ({ ...f, section_month: v }))}
                        options={[{ value: '', label: 'Month' }, ...MONTHS.slice(1).map((m, i) => ({ value: String(i + 1), label: m }))]}
                        placeholder="Month"
                        className="sections-editor-input sections-editor-select"
                        style={{ flex: 1 }}
                      />
                      <ThemeSelect
                        name="section_year"
                        value={form.section_year}
                        onChange={(v) => setForm((f) => ({ ...f, section_year: v }))}
                        options={[{ value: '', label: 'Year' }, ...YEAR_OPTIONS.map((y) => ({ value: String(y), label: String(y) }))]}
                        placeholder="Year"
                        className="sections-editor-input sections-editor-select"
                        style={{ width: 90 }}
                      />
                    </div>
                    <div className="sections-editor-card-actions">
                      <button type="button" onClick={() => handleUpdate(section.id)} className="sections-editor-btn sections-editor-btn-primary">Save</button>
                      <button type="button" onClick={() => setEditingId(null)} className="sections-editor-btn sections-editor-btn-ghost">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h4 className="sections-editor-card-title">{section.title}</h4>
                    <p className="sections-editor-card-meta">{[section.category, section.date_display || section.year].filter(Boolean).join(' · ') || '—'}</p>
                    <div className="sections-editor-card-actions">
                      <button type="button" onClick={() => startEdit(section)} className="sections-editor-btn sections-editor-btn-ghost">Edit</button>
                      <button
                        type="button"
                        className="sections-editor-btn sections-editor-btn-ghost sections-editor-btn-danger"
                        disabled={removingId === section.id}
                        onClick={() => handleRemove(section.id)}
                      >
                        {removingId === section.id ? 'Removing…' : 'Remove'}
                      </button>
                    </div>
                    <div className="sections-editor-work-images-row">
                      <button
                        type="button"
                        onClick={() => toggleWorkImages(section.id)}
                        className="sections-editor-btn sections-editor-btn-ghost sections-editor-work-images-btn"
                      >
                        Work images ({workImagesMap[section.id]?.length ?? '…'})
                      </button>
                    </div>
                    {expandedWorkSectionId === section.id && (
                      <div className="sections-editor-work-images-panel">
                        <div className="sections-editor-work-images-upload">
                          <input
                            ref={(el) => { workImageInputRefs.current[section.id] = el }}
                            type="file"
                            accept="image/*,video/*,*/*"
                            multiple
                            disabled={uploadingWorkSectionId === section.id}
                            onChange={(e) => {
                              const files = e.target.files
                              if (files?.length) handleAddWorkImages(section.id, Array.from(files))
                            }}
                            style={{ display: 'none' }}
                          />
                          <button
                            type="button"
                            disabled={uploadingWorkSectionId === section.id}
                            onClick={() => workImageInputRefs.current[section.id]?.click()}
                            className="sections-editor-btn sections-editor-btn-ghost"
                          >
                            {uploadingWorkSectionId === section.id
                              ? (uploadWorkProgress != null ? `Uploading… ${uploadWorkProgress}%` : 'Uploading…')
                              : '+ Add image or video (multiple allowed)'}
                          </button>
                          {uploadingWorkSectionId === section.id && uploadWorkProgress != null && (
                            <div className="sections-editor-work-images-progress-wrap">
                              <div
                                className="sections-editor-work-images-progress-bar"
                                style={{ width: `${uploadWorkProgress}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="sections-editor-work-images-list">
                          {(workImagesMap[section.id] || []).map((img, wiIndex) => (
                            <div key={img.id} className="sections-editor-work-images-item">
                              <div className="sections-editor-work-images-item-order">
                                <button type="button" onClick={() => moveWorkImage(section.id, wiIndex, 'up')} disabled={wiIndex === 0} title="Move up">↑</button>
                                <button type="button" onClick={() => moveWorkImage(section.id, wiIndex, 'down')} disabled={wiIndex === (workImagesMap[section.id].length - 1)} title="Move down">↓</button>
                              </div>
                              {img.file_type === 'video' ? (
                                <video src={img.file_url} className="sections-editor-work-images-thumb" muted preload="metadata" />
                              ) : img.file_type === 'file' ? (
                                <div className="sections-editor-work-images-thumb sections-editor-work-images-thumb-file">File</div>
                              ) : (
                                <img src={img.file_url} alt={img.alt_text || ''} className="sections-editor-work-images-thumb" />
                              )}
                              <button
                                type="button"
                                className="sections-editor-btn sections-editor-btn-ghost sections-editor-btn-danger"
                                disabled={removingWorkImageId === img.id}
                                onClick={() => handleRemoveWorkImage(section.id, img.id)}
                              >
                                {removingWorkImageId === img.id ? '…' : 'Remove'}
                              </button>
                            </div>
                          ))}
                          {(workImagesMap[section.id]?.length ?? 0) === 0 && (
                            <p className="sections-editor-work-images-empty">No images yet. Add images to show below the poster on the work page.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </article>
          ))}
          {sections.length === 0 && !loading && (
            <div className="sections-editor-empty">
              <div className="sections-editor-empty-icon">◻</div>
              <p className="sections-editor-empty-title">No sections yet</p>
              <p className="sections-editor-empty-desc">Add your first section above to show it on the homepage project grid.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SectionsEditor
