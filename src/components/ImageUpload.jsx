import { useState } from 'react'

export default function ImageUpload({ images = [], onChange }) {
  const [previews, setPreviews] = useState(images)

  const handleFile = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const newPreviews = [...previews, e.target.result]
      setPreviews(newPreviews)
      onChange(newPreviews)
    }
    reader.readAsDataURL(file)
  }

  const handleInput = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(handleFile)
  }

  const removeImage = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index)
    setPreviews(newPreviews)
    onChange(newPreviews)
  }

  return (
    <div>
      <label style={{ 
        display: 'inline-block', 
        padding: '0.625rem 1.25rem', 
        background: 'var(--bg)', 
        border: '1px solid var(--border)', 
        borderRadius: 'var(--radius-sm)', 
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        transition: 'all 0.2s'
      }}>
        Choose Images
        <input 
          type="file" 
          accept="image/*" 
          multiple 
          onChange={handleInput} 
          style={{ display: 'none' }}
        />
      </label>
      {previews.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
          gap: '1rem', 
          marginTop: '1rem' 
        }}>
          {previews.map((src, i) => (
            <div key={i} style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <img src={src} alt={`Preview ${i + 1}`} style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
              <button 
                onClick={() => removeImage(i)} 
                className="danger"
                style={{ 
                  position: 'absolute', 
                  top: '0.25rem', 
                  right: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  minWidth: 'auto',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

