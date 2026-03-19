'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Clock } from 'lucide-react';
import Image from 'next/image';
import { initializeSocket } from '@/lib/socket';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  finished?: boolean;
}

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [finishingId, setFinishingId] = useState<string | null>(null);
  const CATEGORIES = ['Rice', 'Soup', 'Pepper Soup', 'Drinks', 'Swallows', 'Sides', 'Desserts', 'Beverages'];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Rice',
    image: '',
    available: true,
    finished: false,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.price) {
      setUploadError('Name and price are required');
      return;
    }

    setSubmitting(true);

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
    };

    try {
      const socket = initializeSocket();
      console.log('[MenuManagement] Socket connected:', socket.connected);
      
      if (editingId) {
        console.log('[MenuManagement] Updating item:', editingId);
        const response = await fetch(`/api/menu/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update item');
        }

        const updatedItem = await response.json();
        
        // Emit socket event for real-time update to all clients
        if (socket.connected) {
          socket.emit('menuItemUpdated', { 
            itemId: editingId, 
            item: updatedItem,
            timestamp: new Date().toISOString()
          });
          console.log('[MenuManagement] Emitted menuItemUpdated:', updatedItem);
        }
      } else {
        console.log('[MenuManagement] Creating new item');
        const response = await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create item');
        }

        const newItem = await response.json();
        console.log('[MenuManagement] Item created:', newItem);
        
        // Emit socket event for real-time add to all clients
        if (socket.connected) {
          socket.emit('menuItemAdded', { 
            item: newItem,
            timestamp: new Date().toISOString()
          });
          console.log('[MenuManagement] Emitted menuItemAdded:', newItem);
        }
      }

      // Reset form
      setFormData({ name: '', description: '', price: '', category: 'Main Course', image: '', available: true, finished: false });
      setFileName('');
      setEditingId(null);
      setShowForm(false);
      setUploadError(null);
      
      // Fetch updated items
      await fetchItems();
    } catch (error) {
      console.error('[MenuManagement] Failed to save menu item:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to save item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;

    setDeletingId(id);
    console.log('[v0] Starting delete process for item:', id);
    try {
      const socket = initializeSocket();
      console.log('[v0] Socket status:', socket.connected);
      console.log('[v0] Deleting item with ID:', id);
      
      const response = await fetch(`/api/menu/${id}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('[v0] Delete API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('[v0] Delete API error:', errorData);
        throw new Error(errorData.error || 'Failed to delete item');
      }

      const deletedItem = await response.json();
      console.log('[v0] Item deleted successfully:', id, 'Item name:', deletedItem.name);
      
      // Emit socket event for real-time delete to all clients
      if (socket.connected) {
        socket.emit('menuItemDeleted', { 
          itemId: id,
          timestamp: new Date().toISOString()
        });
        console.log('[v0] Emitted menuItemDeleted event:', id);
      }

      // Update local state immediately
      setItems((prev) => {
        const filtered = prev.filter((item) => item._id !== id);
        console.log('[v0] Items count before:', prev.length, 'after:', filtered.length);
        return filtered;
      });
      setUploadError(null);
    } catch (error) {
      console.error('[v0] Failed to delete menu item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
      console.log('[v0] Error message:', errorMessage);
      setUploadError(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      available: item.available,
      finished: item.finished || false,
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleToggleFinished = async (id: string, currentStatus: boolean) => {
    setFinishingId(id);
    try {
      const socket = initializeSocket();
      const newStatus = !currentStatus;
      console.log('[MenuManagement] Toggling finished status for item:', id, 'New status:', newStatus);
      
      const response = await fetch(`/api/menu/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finished: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update item status');
      }

      const updatedItem = await response.json();
      console.log('[MenuManagement] Item status updated successfully:', id, updatedItem);
      
      if (socket.connected) {
        socket.emit('menuItemUpdated', { 
          itemId: id, 
          item: updatedItem,
          timestamp: new Date().toISOString()
        });
        console.log('[MenuManagement] Emitted menuItemUpdated:', id);
      }

      setItems((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, finished: newStatus } : item
        )
      );
      setUploadError(null);
    } catch (error) {
      console.error('[MenuManagement] Failed to toggle finished status:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      setFinishingId(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);
    setUploadError(null);

    const formDataObj = new FormData();
    formDataObj.append('file', file);

    try {
      console.log('[MenuManagement] Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataObj,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      console.log('[MenuManagement] Upload successful:', data.url);
      setFormData({ ...formData, image: data.url });
    } catch (error) {
      console.error('[MenuManagement] Upload failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMsg);
      setFileName('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Menu Items</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your restaurant menu</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setFileName(''); }} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Item' : 'Add New Menu Item'}</CardTitle>
            {uploadError && (
              <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm">
                {uploadError}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Item Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Jollof Rice"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Price (₦)</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    placeholder="2500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-white"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Image or Video</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="w-full disabled:opacity-50"
                    />
                    {uploading && (
                      <span className="text-sm text-blue-600 whitespace-nowrap animate-pulse">Uploading...</span>
                    )}
                    {fileName && !uploading && (
                      <span className="text-sm text-green-600 whitespace-nowrap">✓ {fileName}</span>
                    )}
                  </div>
                  {formData.image && (
                    <div className="mt-2">
                      {formData.image.includes('/image/') ? (
                        <div className="relative h-24 w-24">
                          <Image
                            src={formData.image}
                            alt="Preview"
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                      ) : (
                        <div className="relative h-24 w-24 bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-xs text-gray-600">Video uploaded</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your item..."
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting || uploading}>
                  {submitting ? (
                    <>
                      <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      {editingId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>{editingId ? 'Update' : 'Create'} Item</>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  disabled={submitting || uploading}
                  onClick={() => { 
                    setShowForm(false); 
                    setEditingId(null); 
                    setFileName('');
                    setUploadError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <p className="col-span-full text-center text-gray-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">No menu items yet</p>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className={`group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border ${
                item.finished ? 'opacity-60 border-gray-300' : 'border-gray-200'
              }`}
            >
              {/* Image Container */}
              <div className="relative h-40 w-full bg-gray-100 overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <span className="text-gray-400 text-xs">No image</span>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2 flex gap-2">
                  {item.finished && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Finished
                    </span>
                  )}
                  {!item.available && (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Unavailable
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-2">
                    {item.name}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded whitespace-nowrap">
                    {item.category}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3">
                  {item.description}
                </p>

                <div className="mb-3 pb-3 border-b border-gray-100">
                  <span className="text-lg sm:text-xl font-bold text-gray-900">
                    ₦{item.price?.toLocaleString()}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleToggleFinished(item._id, item.finished || false)}
                    disabled={finishingId === item._id}
                    className={`w-full text-xs sm:text-sm ${
                      item.finished
                        ? 'bg-gray-500 hover:bg-gray-600'
                        : 'bg-orange-500 hover:bg-orange-600'
                    } text-white disabled:opacity-50`}
                  >
                    {finishingId === item._id ? (
                      <>
                        <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        {item.finished ? 'Restoring...' : 'Marking...'}
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {item.finished ? 'Available Again' : 'Mark Finished'}
                      </>
                    )}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="flex-1 text-xs sm:text-sm"
                    >
                      <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item._id)}
                      disabled={deletingId === item._id}
                      className="flex-1 text-xs sm:text-sm"
                    >
                      {deletingId === item._id ? (
                        <>
                          <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
