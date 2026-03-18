'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2 } from 'lucide-react';
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
}

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    image: '',
    available: true,
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
        const newItem = await response.json();
        
        // Emit socket event for real-time add to all clients
        if (socket.connected) {
          socket.emit('menuItemAdded', { 
            item: newItem,
            timestamp: new Date().toISOString()
          });
          console.log('[MenuManagement] Emitted menuItemAdded:', newItem);
        }
      }

      setFormData({ name: '', description: '', price: '', category: 'Main Course', image: '', available: true });
      setFileName('');
      setEditingId(null);
      setShowForm(false);
      setUploadError(null);
      fetchItems();
    } catch (error) {
      console.error('[MenuManagement] Failed to save menu item:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to save item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      const socket = initializeSocket();
      console.log('[MenuManagement] Deleting item:', id);
      
      await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      
      // Emit socket event for real-time delete to all clients
      if (socket.connected) {
        socket.emit('menuItemDeleted', { 
          itemId: id,
          timestamp: new Date().toISOString()
        });
        console.log('[MenuManagement] Emitted menuItemDeleted:', id);
      }
      
      fetchItems();
    } catch (error) {
      console.error('[MenuManagement] Failed to delete menu item:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to delete item');
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
    });
    setEditingId(item._id);
    setShowForm(true);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Menu Items</h1>
          <p className="text-gray-600">Manage your restaurant menu</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setFileName(''); }}>
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
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option>Main Course</option>
                    <option>Sides</option>
                    <option>Beverages</option>
                    <option>Desserts</option>
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
                <Button type="submit">
                  {editingId ? 'Update' : 'Create'} Item
                </Button>
                <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setFileName(''); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">No menu items yet</p>
        ) : (
          items.map((item) => (
            <Card key={item._id}>
              {item.image && (
                <div className="relative h-48 w-full">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardContent className="pt-4">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="font-bold text-lg">₦{item.price}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
