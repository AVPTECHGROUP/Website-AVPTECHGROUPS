import React, { useState } from 'react';
import Modal from '../../Components/FeeModal/Modal';
import Input from '../../Components/FeeModal/Input';
import Select from '../../Components/FeeModal/Select';
import Button from '../../Components/FeeModal/Button';
import { Plus, X } from 'lucide-react';
import { formatCurrency } from '../../Components/FeeModal/helper';

const CreateStructureModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'Quarterly',
    classes: [],
    components: [
      { name: 'Tuition Fee', amount: '' },
    ],
  });
  
  const [availableClasses] = useState([
    '1-A', '2-A', '3-A', '4-A', '5-A',
    '6-A', '7-A', '7-B', '8-A', '8-B',
    '9-A', '9-B', '10-A', '10-B',
    '11-A', '11-B', '12-A', '12-B'
  ]);
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleClassToggle = (className) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.includes(className)
        ? prev.classes.filter(c => c !== className)
        : [...prev.classes, className]
    }));
  };
  
  const addComponent = () => {
    setFormData(prev => ({
      ...prev,
      components: [...prev.components, { name: '', amount: '' }]
    }));
  };
  
  const removeComponent = (index) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index)
    }));
  };
  
  const updateComponent = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.map((comp, i) => 
        i === index ? { ...comp, [field]: value } : comp
      )
    }));
  };
  
  const calculateTotal = () => {
    return formData.components.reduce((sum, comp) => 
      sum + (parseFloat(comp.amount) || 0), 0
    );
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, total: calculateTotal() });
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Fee Structure" size="lg">
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="space-y-5">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input
                  label="Structure Name"
                  value={formData.name}
                  onChange={(val) => handleChange('name', val)}
                  placeholder="e.g., Standard Fee - Primary (1-5)"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Frequency <span className="text-danger ml-0.5">*</span>
                </label>
                <Select
                  value={formData.frequency}
                  onChange={(val) => handleChange('frequency', val)}
                  options={[
                    { value: 'Monthly', label: 'Monthly' },
                    { value: 'Quarterly', label: 'Quarterly' },
                    { value: 'Half-Yearly', label: 'Half-Yearly' },
                    { value: 'Yearly', label: 'Yearly' },
                  ]}
                />
              </div>
            </div>
            
            {/* Class Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Select Classes <span className="text-danger ml-0.5">*</span>
              </label>
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-48 overflow-y-auto custom-scrollbar">
                {availableClasses.map((className) => (
                  <label
                    key={className}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md border-2 cursor-pointer transition-all ${
                      formData.classes.includes(className)
                        ? 'bg-navy text-white border-navy'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-navy/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.classes.includes(className)}
                      onChange={() => handleClassToggle(className)}
                      className="sr-only"
                    />
                    <span className="text-xs font-semibold">{className}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Fee Components */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-semibold text-gray-700">
                  Fee Components <span className="text-danger ml-0.5">*</span>
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={<Plus size={14} />}
                  onClick={addComponent}
                >
                  Add Component
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.components.map((component, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-1">
                      <Select
                        value={component.name}
                        onChange={(val) => updateComponent(index, 'name', val)}
                        options={[
                          { value: '', label: 'Select component...' },
                          { value: 'Tuition Fee', label: 'Tuition Fee' },
                          { value: 'Transport Fee', label: 'Transport Fee' },
                          { value: 'Lab Fee', label: 'Lab Fee' },
                          { value: 'Library Fee', label: 'Library Fee' },
                          { value: 'Activity Fee', label: 'Activity Fee' },
                          { value: 'Sports Fee', label: 'Sports Fee' },
                          { value: 'Exam Fee', label: 'Exam Fee' },
                          { value: 'Misc', label: 'Misc' },
                          { value: 'Other', label: 'Other' },
                        ]}
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        value={component.amount}
                        onChange={(val) => updateComponent(index, 'amount', val)}
                        placeholder="Amount"
                        required
                      />
                    </div>
                    {formData.components.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeComponent(index)}
                        className="px-2 text-danger hover:bg-danger-light rounded transition-colors"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Total */}
            <div className="p-4 bg-gray-900 rounded-lg">
              <div className="flex justify-between items-center text-white">
                <span className="text-sm opacity-70">Total Fee Amount</span>
                <span className="text-xl font-extrabold">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="success" type="submit">
            Create Structure
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default CreateStructureModal;