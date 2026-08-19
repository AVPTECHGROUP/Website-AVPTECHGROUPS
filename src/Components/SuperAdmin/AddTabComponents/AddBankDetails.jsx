import React from 'react';
import { Landmark } from 'lucide-react';

function BankDetailsTab({ formData, handleInputChange, errors = {} }) {
    const inputClass = (field) =>
        `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
            errors[field] ? 'border-red-400' : 'border-gray-300'
        }`;

    return (
        <div>
            <div className="flex items-center gap-2 mb-1">
                <Landmark className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-semibold text-gray-800">Bank Details</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">
                Used for salary disbursal. Optional, but recommended if the user is payroll-eligible.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                    <input
                        type="text"
                        name="accountHolderName"
                        value={formData.accountHolderName}
                        onChange={handleInputChange}
                        placeholder="As per bank records"
                        className={inputClass('accountHolderName')}
                    />
                    {errors.accountHolderName && <p className="text-xs text-red-500 mt-1">{errors.accountHolderName}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        placeholder="e.g. State Bank of India"
                        className={inputClass('bankName')}
                    />
                    {errors.bankName && <p className="text-xs text-red-500 mt-1">{errors.bankName}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        placeholder="Bank account number"
                        className={inputClass('accountNumber')}
                    />
                    {errors.accountNumber && <p className="text-xs text-red-500 mt-1">{errors.accountNumber}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                    <input
                        type="text"
                        name="ifscCode"
                        value={formData.ifscCode}
                        onChange={handleInputChange}
                        placeholder="e.g. SBIN0001234"
                        className={`${inputClass('ifscCode')} uppercase`}
                        maxLength={11}
                    />
                    {errors.ifscCode && <p className="text-xs text-red-500 mt-1">{errors.ifscCode}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                    <input
                        type="text"
                        name="branchName"
                        value={formData.branchName}
                        onChange={handleInputChange}
                        placeholder="Branch name"
                        className={inputClass('branchName')}
                    />
                    {errors.branchName && <p className="text-xs text-red-500 mt-1">{errors.branchName}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch Address</label>
                    <input
                        type="text"
                        name="branchAddress"
                        value={formData.branchAddress}
                        onChange={handleInputChange}
                        placeholder="Branch address"
                        className={inputClass('branchAddress')}
                    />
                    {errors.branchAddress && <p className="text-xs text-red-500 mt-1">{errors.branchAddress}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        IBAN <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                        type="text"
                        name="iban"
                        value={formData.iban}
                        onChange={handleInputChange}
                        placeholder="International bank account number"
                        className={`${inputClass('iban')} uppercase`}
                    />
                    {errors.iban && <p className="text-xs text-red-500 mt-1">{errors.iban}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        SWIFT Code <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                        type="text"
                        name="swiftCode"
                        value={formData.swiftCode}
                        onChange={handleInputChange}
                        placeholder="e.g. SBININBB104"
                        className={`${inputClass('swiftCode')} uppercase`}
                    />
                    {errors.swiftCode && <p className="text-xs text-red-500 mt-1">{errors.swiftCode}</p>}
                </div>
            </div>
        </div>
    );
}

export default BankDetailsTab;