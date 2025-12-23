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
      <label className="image-upload-label">
        Choose Images
        <input 
          type="file" 
          accept="image/*" 
          multiple 
          onChange={handleInput} 
          className="image-upload-input"
        />
      </label>
      {previews.length > 0 && (
        <div className="image-previews">
          {previews.map((src, i) => (
            <div key={i} className="image-preview-wrapper">
              <img src={src} alt={`Preview ${i + 1}`} className="image-preview" />
              <button 
                onClick={() => removeImage(i)} 
                className="danger image-remove-btn"
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

