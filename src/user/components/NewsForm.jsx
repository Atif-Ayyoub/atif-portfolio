import React, { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function NewsForm(){
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const UPLOAD_SERVER_URL = import.meta.env.VITE_UPLOAD_SERVER_URL || 'http://localhost:5000'

  const handleSubmit = async (e) => {
    e.preventDefault()

    let imageUrl = ''

    if (imageFile){
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const dataUrl = reader.result
          const response = await fetch(`${UPLOAD_SERVER_URL}/api/upload-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: dataUrl, name: title.replace(/\s+/g,'-').toLowerCase() })
          })
          const data = await response.json()
          if (data && data.url) imageUrl = data.url
        } catch (err){
          console.error('Upload failed:', err)
        }

        const { error } = await supabase.from('news').insert([{ title, description: content, image: imageUrl }])
        if (error) console.error(error)
        else {
          setTitle('')
          setContent('')
          setImageFile(null)
          alert('News submitted successfully!')
        }
      }
      reader.readAsDataURL(imageFile)
    } else {
      const { error } = await supabase.from('news').insert([{ title, description: content, image: '' }])
      if (error) console.error(error)
      else { setTitle(''); setContent(''); alert('News submitted successfully!') }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" required className="w-full p-2 border" />
      <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Content" required className="w-full p-2 border" />
      <input type="file" accept="image/*" onChange={e=>setImageFile(e.target.files[0])} />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white">Submit News</button>
    </form>
  )
}

