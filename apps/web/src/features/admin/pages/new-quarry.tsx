import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mountain, ArrowLeft, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { adminApi } from '@ar-multiventures/api';

export function AdminNewQuarryPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    state: 'Ogun',
    region: 'South West',
    operationalCapacityTonsPerDay: 5000,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await adminApi.saveQuarry(formData);
      navigate('/admin/quarries');
    } catch (err) {
      console.error('Failed to create quarry:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Add Certified Quarry Hub"
        description="Register a new aggregate extraction source into the AR Multiventures supply network."
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin' },
          { label: 'Quarries', href: '/admin/quarries' },
          { label: 'New Quarry' },
        ]}
      />

      <form onSubmit={handleSubmit}>
        <Card padding="lg" className="bg-white border-neutral-200 shadow-2xs space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Quarry Facility Name *"
              placeholder="e.g. Sagamu Granite Hub"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="System Code *"
              placeholder="e.g. QRY-SGM-01"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Town / Location *"
              placeholder="e.g. Sagamu"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
            <Input
              label="State *"
              placeholder="e.g. Ogun State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              required
            />
            <Input
              label="Region *"
              placeholder="e.g. South West"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Daily Loading Capacity (Tonnes/Day) *"
              type="number"
              value={formData.operationalCapacityTonsPerDay}
              onChange={(e) => setFormData({ ...formData, operationalCapacityTonsPerDay: Number(e.target.value) })}
              required
            />
          </div>

          <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
            <Link to="/admin/quarries">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button variant="primary" type="submit" isLoading={isSaving} leftIcon={<Save className="h-4 w-4" />}>
              Save Quarry Hub
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
