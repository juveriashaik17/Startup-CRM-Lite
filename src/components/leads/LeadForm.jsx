import React, { useState, useEffect } from 'react';
import { LEAD_STATUS_OPTIONS, LEAD_SOURCE_OPTIONS } from '../../constants/leads';

/**
 * @typedef {Object} LeadData
 * @property {number|string} [id] - Unique identifier (present in edit mode).
 * @property {string} name - Contact person's full name.
 * @property {string} company - Company name.
 * @property {string} email - Email address.
 * @property {string} phone - Phone number.
 * @property {number} value - Financial deal value in USD.
 * @property {string} status - Current pipeline stage.
 * @property {string} source - Marketing acquisition source.
 * @property {string} [dateAdded] - Date record was created.
 */

/**
 * @typedef {Object} LeadFormProps
 * @property {LeadData} [initialData] - Existing lead data if in Edit Mode.
 * @property {(data: Omit<LeadData, 'id' | 'dateAdded'> & { id?: number|string, dateAdded?: string }) => void} onSubmit - Callback when form passes validation and is submitted.
 * @property {() => void} onCancel - Callback when cancel button is clicked.
 */

/**
 * LeadForm Component
 * 
 * Renders an accessible, validated form wrapper to Create or Update CRM Lead records.
 * Manages local field states, validates inputs (required checks, email regex, numerical boundaries),
 * and provides clear error feedbacks and focus rings.
 * 
 * @param {LeadFormProps} props - The component properties.
 * @returns {React.JSX.Element} The validated lead form element.
 */
export default function LeadForm({ initialData, onSubmit, onCancel }) {
  // Setup local states for all input fields, pre-populating with initialData if present.
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('New');
  const [source, setSource] = useState('Website');
  
  // Validation errors state mapping field names to message strings
  const [errors, setErrors] = useState({});

  // Synchronize state with initialData whenever it changes (e.g., switching leads during edit)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCompany(initialData.company || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setValue(initialData.value !== undefined ? initialData.value : '');
      setStatus(initialData.status || 'New');
      setSource(initialData.source || 'Website');
    } else {
      // Clear form when switching to create mode
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setValue('');
      setStatus('New');
      setSource('Website');
    }
    setErrors({});
  }, [initialData]);


  /**
   * Validates form fields and updates the errors state.
   * 
   * @returns {boolean} True if all inputs are valid, false otherwise.
   */
  const validateForm = () => {
    const tempErrors = {};

    // 1. Name validation (Required)
    if (!name.trim()) {
      tempErrors.name = 'Contact name is required.';
    }

    // 2. Company validation (Required)
    if (!company.trim()) {
      tempErrors.company = 'Company name is required.';
    }

    // 3. Email validation (Required & Correct format)
    if (!email.trim()) {
      tempErrors.email = 'Email address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        tempErrors.email = 'Please enter a valid email address.';
      }
    }

    // 4. Deal Value validation (Optional, but must be positive number if provided)
    if (value !== '' && (isNaN(Number(value)) || Number(value) < 0)) {
      tempErrors.value = 'Deal value must be a positive number.';
    }

    setErrors(tempErrors);
    // Form is valid if the errors object has no keys
    return Object.keys(tempErrors).length === 0;
  };

  /**
   * Handles form submission, executing validation and invoking the onSubmit callback.
   * 
   * @param {React.FormEvent} e - The HTML form event.
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Compile the validated values into a clean data object.
      // Convert deal value to numerical type to ensure math calculators don't break.
      const submittedData = {
        name: name.trim(),
        company: company.trim(),
        email: email.trim(),
        phone: phone.trim(),
        value: value === '' ? 0 : Number(value),
        status,
        source
      };

      onSubmit(submittedData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-800 dark:text-zinc-200">
      
      {/* Grid Layout: Name and Company fields (2 columns on tablet/desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Name Input Container */}
        <div>
          <label htmlFor="lead-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
            Contact Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="lead-name"
            type="text"
            placeholder="Sarah Jenkins"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-3.5 h-11 md:h-auto md:py-2 border rounded-xl text-xs bg-slate-50/50 dark:bg-zinc-950/50 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
              errors.name ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200 dark:border-zinc-800'
            }`}
          />
          {errors.name && <p className="text-[10px] text-rose-500 mt-1">{errors.name}</p>}
        </div>

        {/* Company Input Container */}
        <div>
          <label htmlFor="lead-company" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
            Company Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="lead-company"
            type="text"
            placeholder="Acme Corp"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={`w-full px-3.5 h-11 md:h-auto md:py-2 border rounded-xl text-xs bg-slate-50/50 dark:bg-zinc-950/50 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
              errors.company ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200 dark:border-zinc-800'
            }`}
          />
          {errors.company && <p className="text-[10px] text-rose-500 mt-1">{errors.company}</p>}
        </div>

      </div>

      {/* Grid Layout: Email and Phone fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Email Input Container */}
        <div>
          <label htmlFor="lead-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            id="lead-email"
            type="email"
            placeholder="sjenkins@acme.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3.5 h-11 md:h-auto md:py-2 border rounded-xl text-xs bg-slate-50/50 dark:bg-zinc-950/50 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
              errors.email ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200 dark:border-zinc-800'
            }`}
          />
          {errors.email && <p className="text-[10px] text-rose-500 mt-1">{errors.email}</p>}
        </div>

        {/* Phone Input Container */}
        <div>
          <label htmlFor="lead-phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
            Phone Number
          </label>
          <input
            id="lead-phone"
            type="tel"
            placeholder="+1 (555) 019-2834"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3.5 h-11 md:h-auto md:py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50/50 dark:bg-zinc-950/50 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

      </div>

      {/* Grid Layout: Deal Value and Status fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Deal Value Input Container */}
        <div>
          <label htmlFor="lead-value" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
            Deal Value ($)
          </label>
          <input
            id="lead-value"
            type="number"
            placeholder="25000"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={`w-full px-3.5 h-11 md:h-auto md:py-2 border rounded-xl text-xs bg-slate-50/50 dark:bg-zinc-950/50 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
              errors.value ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200 dark:border-zinc-800'
            }`}
          />
          {errors.value && <p className="text-[10px] text-rose-500 mt-1">{errors.value}</p>}
        </div>

        {/* Status Dropdown Select */}
        <div>
          <label htmlFor="lead-status" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
            Pipeline Stage
          </label>
          <select
            id="lead-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3.5 h-11 md:h-auto md:py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50/50 dark:bg-zinc-950/50 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            {LEAD_STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Source Dropdown Select */}
        <div>
          <label htmlFor="lead-source" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
            Acquisition Source
          </label>
          <select
            id="lead-source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-3.5 h-11 md:h-auto md:py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50/50 dark:bg-zinc-950/50 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            {LEAD_SOURCE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Buttons Action Bar */}
      <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800/80 mt-6 w-full">
        {/* Cancel Trigger */}
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 sm:flex-initial h-11 sm:h-auto sm:px-4 sm:py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl transition-all cursor-pointer"
        >
          Cancel
        </button>
        {/* Submit Button */}
        <button
          type="submit"
          className="flex-1 sm:flex-initial h-11 sm:h-auto sm:px-5 sm:py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-md shadow-blue-500/10 dark:shadow-none transition-all cursor-pointer"
        >
          {initialData ? 'Save Changes' : 'Create Lead'}
        </button>
      </div>

    </form>
  );
}
