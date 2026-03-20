'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface Settings {
  restaurantName?: string;
  whatsappNumber?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankName?: string;
  openingHours?: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    restaurantName: 'MealClan',
    whatsappNumber: '',
    bankAccountNumber: '',
    bankAccountName: '',
    bankName: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/settings`);
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading settings...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your restaurant configuration</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Restaurant Information</CardTitle>
          <CardDescription>Basic information about your restaurant</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Restaurant Name</label>
            <Input
              value={settings.restaurantName}
              onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
              placeholder="MealClan"
            />
          </div>

          <div>
            <label className="text-sm font-medium">WhatsApp Number</label>
            <Input
              value={settings.whatsappNumber}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              placeholder="08038753508"
              type="tel"
            />
            <p className="text-xs text-gray-500 mt-1">
              Customers will send payment receipts to this number
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Bank Name</label>
              <Input
                value={settings.bankName || ''}
                onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                placeholder="e.g., First Bank, GTBank, Access Bank"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Bank Account Number</label>
              <Input
                value={settings.bankAccountNumber || ''}
                onChange={(e) => setSettings({ ...settings, bankAccountNumber: e.target.value })}
                placeholder="e.g., 0123456789"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Account Holder Name</label>
              <Input
                value={settings.bankAccountName || ''}
                onChange={(e) => setSettings({ ...settings, bankAccountName: e.target.value })}
                placeholder="e.g., John Doe"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Opening Hours</label>
            <Input
              value={settings.openingHours || ''}
              onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })}
              placeholder="e.g., 9 AM - 9 PM"
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="mt-4">
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Help</CardTitle>
          <CardDescription>Frequently asked questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">How do I manage menu items?</h3>
            <p className="text-sm text-gray-600 mt-1">
              Go to the "Menu Items" section to add, edit, or remove items from your menu.
            </p>
          </div>
          <div>
            <h3 className="font-medium">How do I track orders?</h3>
            <p className="text-sm text-gray-600 mt-1">
              All incoming orders appear in the "Orders" section where you can update their status.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
